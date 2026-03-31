import { PrismaClient } from '@prisma/client';
import {
  generateId, NotFoundError,
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
    name: string;
    colors: Record<string, string>;
    typography?: Record<string, unknown>;
    header?: Record<string, unknown>;
    footer?: Record<string, unknown>;
    spacing?: Record<string, unknown>;
    borders?: Record<string, unknown>;
    shadows?: Record<string, unknown>;
  }) {
    return prisma.theme.create({
      data: {
        id: generateId(),
        tenantId,
        name: data.name,
        colors: data.colors as any,
        typography: (data.typography || {}) as any,
        header: (data.header || {}) as any,
        footer: (data.footer || {}) as any,
        spacing: (data.spacing || {}) as any,
        borders: (data.borders || {}) as any,
        shadows: (data.shadows || {}) as any,
        isSystem: false,
      },
    });
  }

  async update(tenantId: string, themeId: string, data: {
    name?: string;
    colors?: Record<string, string>;
    typography?: Record<string, unknown>;
    header?: Record<string, unknown>;
    footer?: Record<string, unknown>;
    spacing?: Record<string, unknown>;
    borders?: Record<string, unknown>;
    shadows?: Record<string, unknown>;
  }) {
    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme || (theme.tenantId !== tenantId && !theme.isSystem)) {
      throw new NotFoundError('Theme', themeId);
    }

    const redis = RedisClient.getInstance();
    await redis.del(RedisKeys.CACHE_THEME(themeId));

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.colors) updateData.colors = data.colors;
    if (data.typography) updateData.typography = data.typography;
    if (data.header) updateData.header = data.header;
    if (data.footer) updateData.footer = data.footer;
    if (data.spacing) updateData.spacing = data.spacing;
    if (data.borders) updateData.borders = data.borders;
    if (data.shadows) updateData.shadows = data.shadows;

    return prisma.theme.update({ where: { id: themeId }, data: updateData });
  }

  async apply(_tenantId: string, themeId: string, _websiteId: string) {
    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) throw new NotFoundError('Theme', themeId);
    return { themeId, theme };
  }
}

export const themeService = new ThemeService();
