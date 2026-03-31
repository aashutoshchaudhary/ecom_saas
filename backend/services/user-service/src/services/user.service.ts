import { PrismaClient } from '@prisma/client';
import {
  generateId, NotFoundError, ConflictError, parsePagination, paginationHelper,
  EventProducer, KafkaTopics, EventTypes,
} from '@siteforge/shared';

const prisma = new PrismaClient();

export class UserService {
  async createUser(data: { userId: string; email: string; firstName: string; lastName: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('User already exists');

    return prisma.user.create({
      data: {
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenantMemberships: true },
    });
    if (!user) throw new NotFoundError('User', userId);
    return user;
  }

  async updateProfile(userId: string, data: Partial<{
    firstName: string; lastName: string; phone: string; bio: string;
    timezone: string; language: string; avatar: string;
  }>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { ...data, updatedAt: new Date() },
    });

    await EventProducer.publish(KafkaTopics.USER_EVENTS, EventTypes.USER_UPDATED, user, userId);
    return user;
  }

  async deleteAccount(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'DELETED', email: `deleted_${userId}@deleted.local` },
    });

    await EventProducer.publish(KafkaTopics.USER_EVENTS, EventTypes.USER_DELETED, { userId }, userId);
  }

  async listUsers(tenantId: string, query: { page?: string; limit?: string; search?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { tenantMemberships: { some: { tenantId } } };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, include: { tenantMemberships: true }, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return paginationHelper(users, total, page, limit);
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User', userId);
    return user;
  }

  async completeOnboarding(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });
  }

  async getUserTenants(userId: string) {
    return prisma.tenantMembership.findMany({
      where: { userId },
    });
  }

  async addTenantMembership(userId: string, tenantId: string, roleId: string, isOwner = false) {
    return prisma.tenantMembership.create({
      data: { id: generateId(), userId, tenantId, roleId, isOwner },
    });
  }
}

export const userService = new UserService();
