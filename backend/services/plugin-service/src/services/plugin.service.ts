import { PrismaClient, Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

export class PluginService {
  async listAvailable(filters: {
    category?: string;
    industry?: string;
    plan?: string;
    search?: string;
  }) {
    const where: Prisma.PluginWhereInput = { isActive: true };

    if (filters.category) where.category = filters.category;
    if (filters.industry) where.industry = filters.industry;
    if (filters.plan) where.plan = filters.plan;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.plugin.findMany({ where, orderBy: { name: 'asc' } });
  }

  async listInstalled(tenantId: string) {
    const installations = await prisma.pluginInstallation.findMany({
      where: { tenantId },
      orderBy: { installedAt: 'desc' },
    });

    const pluginIds = installations.map((i) => i.pluginId);
    const plugins = await prisma.plugin.findMany({
      where: { id: { in: pluginIds } },
    });

    const pluginMap = new Map(plugins.map((p) => [p.id, p]));

    return installations.map((installation) => ({
      ...installation,
      plugin: pluginMap.get(installation.pluginId) || null,
    }));
  }

  async install(tenantId: string, pluginId: string, config?: Record<string, unknown>) {
    const plugin = await prisma.plugin.findUnique({ where: { id: pluginId } });
    if (!plugin) {
      throw new AppError('Plugin not found', StatusCodes.NOT_FOUND);
    }

    const existing = await prisma.pluginInstallation.findUnique({
      where: { tenantId_pluginId: { tenantId, pluginId } },
    });
    if (existing) {
      throw new AppError('Plugin already installed', StatusCodes.CONFLICT);
    }

    return prisma.pluginInstallation.create({
      data: {
        tenantId,
        pluginId,
        config: config || {},
        isEnabled: true,
      },
    });
  }

  async uninstall(installationId: string, tenantId: string) {
    const installation = await this.getInstallation(installationId, tenantId);
    await prisma.pluginInstallation.delete({ where: { id: installation.id } });
    return { success: true };
  }

  async enable(installationId: string, tenantId: string) {
    const installation = await this.getInstallation(installationId, tenantId);
    return prisma.pluginInstallation.update({
      where: { id: installation.id },
      data: { isEnabled: true },
    });
  }

  async disable(installationId: string, tenantId: string) {
    const installation = await this.getInstallation(installationId, tenantId);
    return prisma.pluginInstallation.update({
      where: { id: installation.id },
      data: { isEnabled: false },
    });
  }

  async getConfig(installationId: string, tenantId: string) {
    const installation = await this.getInstallation(installationId, tenantId);
    const plugin = await prisma.plugin.findUnique({ where: { id: installation.pluginId } });
    return {
      installationConfig: installation.config,
      defaultConfig: plugin?.config || {},
    };
  }

  async updateConfig(installationId: string, tenantId: string, config: Record<string, unknown>) {
    const installation = await this.getInstallation(installationId, tenantId);
    return prisma.pluginInstallation.update({
      where: { id: installation.id },
      data: { config },
    });
  }

  private async getInstallation(installationId: string, tenantId: string) {
    const installation = await prisma.pluginInstallation.findUnique({
      where: { id: installationId },
    });
    if (!installation || installation.tenantId !== tenantId) {
      throw new AppError('Installation not found', StatusCodes.NOT_FOUND);
    }
    return installation;
  }
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const pluginService = new PluginService();
