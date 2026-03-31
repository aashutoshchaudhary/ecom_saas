import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

export class AppError extends Error {
  constructor(message: string, public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
  }
}

export class ConfigService {
  async getConfig(service: string, key?: string) {
    if (key) {
      const config = await prisma.serviceConfig.findUnique({
        where: { service_key: { service, key } },
      });
      if (!config) throw new AppError('Config not found', StatusCodes.NOT_FOUND);

      // Mask secret values
      if (config.isSecret) {
        return { ...config, value: '***REDACTED***' };
      }
      return config;
    }

    const configs = await prisma.serviceConfig.findMany({
      where: { service },
      orderBy: { key: 'asc' },
    });

    return configs.map((c) => ({
      ...c,
      value: c.isSecret ? '***REDACTED***' : c.value,
    }));
  }

  async updateConfig(data: { service: string; key: string; value: unknown; isSecret?: boolean }) {
    return prisma.serviceConfig.upsert({
      where: { service_key: { service: data.service, key: data.key } },
      update: { value: data.value as any, isSecret: data.isSecret },
      create: {
        service: data.service,
        key: data.key,
        value: data.value as any,
        isSecret: data.isSecret || false,
      },
    });
  }

  async deleteConfig(configId: string) {
    const config = await prisma.serviceConfig.findUnique({ where: { id: configId } });
    if (!config) throw new AppError('Config not found', StatusCodes.NOT_FOUND);
    await prisma.serviceConfig.delete({ where: { id: configId } });
    return { success: true };
  }

  async getFeatureFlags(tenantId?: string) {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { name: 'asc' },
    });

    if (tenantId) {
      return flags.map((flag) => ({
        ...flag,
        enabledForTenant: flag.tenants.length === 0 || flag.tenants.includes(tenantId),
      }));
    }

    return flags;
  }

  async getFeatureFlag(name: string, tenantId?: string) {
    const flag = await prisma.featureFlag.findUnique({ where: { name } });
    if (!flag) return { enabled: false, config: {} };

    const enabledForTenant = flag.tenants.length === 0 || (tenantId ? flag.tenants.includes(tenantId) : true);

    return {
      ...flag,
      enabled: flag.enabled && enabledForTenant,
    };
  }

  async createFeatureFlag(data: { name: string; enabled: boolean; tenants: string[]; config: Record<string, unknown> }) {
    return prisma.featureFlag.create({ data: { ...data, config: data.config as any } });
  }

  async toggleFeatureFlag(flagId: string, enabled: boolean) {
    const flag = await prisma.featureFlag.findUnique({ where: { id: flagId } });
    if (!flag) throw new AppError('Feature flag not found', StatusCodes.NOT_FOUND);

    return prisma.featureFlag.update({
      where: { id: flagId },
      data: { enabled },
    });
  }

  async updateFeatureFlag(flagId: string, updates: {
    name?: string;
    enabled?: boolean;
    tenants?: string[];
    config?: Record<string, unknown>;
  }) {
    const flag = await prisma.featureFlag.findUnique({ where: { id: flagId } });
    if (!flag) throw new AppError('Feature flag not found', StatusCodes.NOT_FOUND);

    return prisma.featureFlag.update({
      where: { id: flagId },
      data: {
        ...updates,
        config: updates.config as any,
      },
    });
  }
}

export const configService = new ConfigService();
