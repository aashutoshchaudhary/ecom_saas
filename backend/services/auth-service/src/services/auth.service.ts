import { PrismaClient } from '@prisma/client';
import {
  generateId, hashPassword, verifyPassword, generateJWT, generateToken,
  AppError, NotFoundError, UnauthorizedError, ConflictError,
  RedisClient, EventProducer, KafkaTopics, EventTypes, RedisKeys,
} from '@siteforge/shared';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { config } from '../config';

const prisma = new PrismaClient();
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export class AuthService {
  async register(data: {
    email: string; password: string; firstName: string; lastName: string;
  }) {
    const existing = await prisma.authCredential.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const userId = generateId();
    const passwordHash = await hashPassword(data.password);
    const emailVerifyToken = generateToken();

    const auth = await prisma.authCredential.create({
      data: {
        id: generateId(),
        userId,
        email: data.email,
        passwordHash,
        emailVerifyToken,
      },
    });

    // Publish user.signed_up event
    await EventProducer.publish(
      KafkaTopics.USER_EVENTS,
      EventTypes.USER_SIGNED_UP,
      {
        userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      userId // temp tenantId = userId before tenant is created
    );

    const tokens = await this.createSession(auth.id, userId, data.email);

    return { userId, ...tokens };
  }

  async login(data: { email: string; password: string; mfaCode?: string }, meta?: { ip?: string; userAgent?: string }) {
    const auth = await prisma.authCredential.findUnique({ where: { email: data.email } });
    if (!auth) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check lockout
    if (auth.lockedUntil && auth.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((auth.lockedUntil.getTime() - Date.now()) / 60000);
      throw new AppError(423, 'ACCOUNT_LOCKED', `Account is locked. Try again in ${minutesLeft} minutes.`);
    }

    const isValid = await verifyPassword(data.password, auth.passwordHash);
    if (!isValid) {
      const failedAttempts = auth.failedAttempts + 1;
      const updates: Record<string, unknown> = { failedAttempts };

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      }

      await prisma.authCredential.update({
        where: { id: auth.id },
        data: updates as any,
      });

      throw new UnauthorizedError('Invalid email or password');
    }

    // Check MFA
    if (auth.mfaEnabled) {
      if (!data.mfaCode) {
        throw new AppError(403, 'MFA_REQUIRED', 'MFA code is required');
      }

      const isValidMfa = speakeasy.totp.verify({
        secret: auth.mfaSecret!,
        encoding: 'base32',
        token: data.mfaCode,
        window: 1,
      });

      if (!isValidMfa) {
        throw new UnauthorizedError('Invalid MFA code');
      }
    }

    // Reset failed attempts and update last login
    await prisma.authCredential.update({
      where: { id: auth.id },
      data: { failedAttempts: 0, lockedUntil: null, lastLogin: new Date() },
    });

    const tokens = await this.createSession(auth.id, auth.userId, auth.email, meta);

    await EventProducer.publish(
      KafkaTopics.USER_EVENTS,
      EventTypes.USER_LOGGED_IN,
      { userId: auth.userId, ip: meta?.ip },
      auth.userId
    );

    return { userId: auth.userId, ...tokens };
  }

  async logout(token: string) {
    const session = await prisma.session.findUnique({ where: { token } });
    if (session) {
      // Blacklist token in Redis
      const redis = RedisClient.getInstance();
      const ttl = Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
      if (ttl > 0) {
        await redis.setex(RedisKeys.TOKEN_BLACKLIST(token), ttl, '1');
      }

      await prisma.session.delete({ where: { id: session.id } });
    }
  }

  async refreshToken(refreshToken: string) {
    const session = await prisma.session.findUnique({ where: { refreshToken } });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const auth = await prisma.authCredential.findUnique({ where: { id: session.authId } });
    if (!auth) throw new UnauthorizedError('Account not found');

    // Delete old session
    await prisma.session.delete({ where: { id: session.id } });

    // Create new session (token rotation)
    return this.createSession(auth.id, auth.userId, auth.email);
  }

  async forgotPassword(email: string) {
    const auth = await prisma.authCredential.findUnique({ where: { email } });
    if (!auth) return; // Don't reveal if email exists

    const resetToken = generateToken();
    await prisma.authCredential.update({
      where: { id: auth.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    // Publish event for email service
    await EventProducer.publish(
      KafkaTopics.NOTIFICATION_EVENTS,
      'notification.send',
      { type: 'EMAIL', to: email, template: 'password-reset', data: { resetToken } },
      auth.userId
    );
  }

  async resetPassword(token: string, newPassword: string) {
    const auth = await prisma.authCredential.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!auth) throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');

    const passwordHash = await hashPassword(newPassword);
    await prisma.authCredential.update({
      where: { id: auth.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({ where: { authId: auth.id } });
  }

  async verifyEmail(token: string) {
    const auth = await prisma.authCredential.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!auth) throw new AppError(400, 'INVALID_TOKEN', 'Invalid verification token');

    await prisma.authCredential.update({
      where: { id: auth.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });
  }

  async setupMfa(userId: string) {
    const auth = await prisma.authCredential.findUnique({ where: { userId } });
    if (!auth) throw new NotFoundError('Account');

    const secret = speakeasy.generateSecret({
      name: `SiteForge:${auth.email}`,
      issuer: 'SiteForge',
    });

    // Store secret temporarily in Redis
    const redis = RedisClient.getInstance();
    await redis.setex(RedisKeys.MFA_PENDING(userId), 300, secret.base32);

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verifyMfaSetup(userId: string, code: string) {
    const redis = RedisClient.getInstance();
    const secret = await redis.get(RedisKeys.MFA_PENDING(userId));
    if (!secret) throw new AppError(400, 'MFA_EXPIRED', 'MFA setup expired. Please start again.');

    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) throw new AppError(400, 'INVALID_CODE', 'Invalid MFA code');

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => generateToken(4).toUpperCase());

    await prisma.authCredential.update({
      where: { userId },
      data: { mfaEnabled: true, mfaSecret: secret, mfaBackupCodes: backupCodes },
    });

    await redis.del(RedisKeys.MFA_PENDING(userId));

    return { backupCodes };
  }

  private async createSession(
    authId: string,
    userId: string,
    email: string,
    meta?: { ip?: string; userAgent?: string }
  ) {
    const accessToken = generateJWT(
      { sub: userId, email },
      config.jwt.secret,
      ACCESS_TOKEN_EXPIRY
    );

    const refreshTokenValue = generateToken(48);

    await prisma.session.create({
      data: {
        id: generateId(),
        authId,
        token: accessToken,
        refreshToken: refreshTokenValue,
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}

export const authService = new AuthService();
