import { apiRequest, setTokens, clearTokens } from "./client";

export interface AuthUser {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface MfaVerifyPayload {
  userId: string;
  code: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const data = await apiRequest<AuthUser>("/auth/register", {
      method: "POST",
      body: payload,
      noAuth: true,
    });
    setTokens(data);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthUser & { mfaRequired?: boolean }> {
    const data = await apiRequest<AuthUser & { mfaRequired?: boolean }>("/auth/login", {
      method: "POST",
      body: payload,
      noAuth: true,
    });
    if (!data.mfaRequired) {
      setTokens(data);
    }
    return data;
  },

  async verifyMfa(payload: MfaVerifyPayload): Promise<AuthUser> {
    const data = await apiRequest<AuthUser>("/auth/mfa/verify", {
      method: "POST",
      body: payload,
      noAuth: true,
    });
    setTokens(data);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      clearTokens();
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: { email },
      noAuth: true,
    });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiRequest("/auth/reset-password", {
      method: "POST",
      body: { token, password },
      noAuth: true,
    });
  },

  async setupMfa(): Promise<{ qrCode: string; secret: string; backupCodes: string[] }> {
    return apiRequest("/auth/mfa/setup", { method: "POST" });
  },
};
