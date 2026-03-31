import { PrismaClient } from '@prisma/client';
import {
  generateId, NotFoundError, ConflictError,
  RedisClient, RedisKeys,
} from '@siteforge/shared';

const prisma = new PrismaClient();
const CACHE_TTL = 3600;

export class ThemeService {
  async list(tenantId: string) {
    return prisma.theme.findMany({
      where: { OR: [{ tenantId }, { isSystem: true }] },
      orderBy: { name: 'asc' },
    });
  }

  async listSystem() {
    const redis = RedisClient.getInstance();
    const cached = await redis.get('sf:cache:system-themes');
    if (cached) return JSON.parse(cached);

    const themes = await prisma.theme.findMany({
      where: { isSystem: true },
      orderBy: { name: 'asc' },
    });

    await redis.setex('sf:cache:system-themes', CACHE_TTL, JSON.stringify(themes));
    return themes;
  }

  async create(tenantId: string, data: {
    name: string; colors: Record<string, string>;
    fonts: Record<string, string>; variables?: Record<string, unknown>;
  }) {
    return prisma.theme.create({
      data: {
        id: generateId(),
        tenantId,
        name: data.name,
        colors: data.colors as any,
        fonts: data.fonts as any,
        variables: data.variables || {},
        isSystem: false,
      },
    });
  }

  async update(tenantId: string, themeId: string, data: {
    name?: string; colors?: Record<string, string>;
    fonts?: Record<string, string>; variables?: Record<string, unknown>;
  }) {
    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme || (theme.tenantId !== tenantId && !theme.isSystem)) {
      throw new NotFoundError('Theme', themeId);
    }

    const redis = RedisClient.getInstance();
    await redis.del(RedisKeys.CACHE_THEME(themeId));

    return prisma.theme.update({
      where: { id: themeId },
      data: {
        name: data.name,
        colors: data.colors as any,
        fonts: data.fonts as any,
        variables: data.variables as any,
        updatedAt: new Date(),
      },
    });
  }

  async apply(tenantId: string, themeId: string, websiteId: string) {
    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) throw new NotFoundError('Theme', themeId);

    return prisma.website.update({
      where: { id: websiteId },
      data: { themeId, updatedAt: new Date() },
    });
  }
}

export const themeService = new ThemeService();
