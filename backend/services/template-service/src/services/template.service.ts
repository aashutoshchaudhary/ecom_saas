import { PrismaClient } from '@prisma/client';
import {
  generateId, NotFoundError,
  parsePagination, paginationHelper,
  RedisClient, RedisKeys,
} from '@siteforge/shared';

const prisma = new PrismaClient();
const CACHE_TTL = 3600;

export class TemplateService {
  async list(query: { page?: string; limit?: string; industry?: string; category?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { isPublic: true };
    if (query.industry) where.industry = query.industry;
    if (query.category) where.category = query.category;

    const [templates, total] = await Promise.all([
      prisma.template.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.template.count({ where }),
    ]);

    return paginationHelper(templates, total, page, limit);
  }

  async get(templateId: string) {
    const redis = RedisClient.getInstance();
    const cacheKey = RedisKeys.CACHE_TEMPLATE(templateId);
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const template = await prisma.template.findUnique({ where: { id: templateId } });
    if (!template) throw new NotFoundError('Template', templateId);

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(template));
    return template;
  }

  async create(data: {
    name: string; description?: string; industry?: string;
    category?: string; thumbnail?: string;
    structure: Record<string, unknown>; pages?: any[];
  }) {
    return prisma.template.create({
      data: {
        name: data.name,
        description: data.description,
        industry: data.industry,
        category: data.category,
        thumbnail: data.thumbnail,
        structure: data.structure as any,
        pages: data.pages || [],
      },
    });
  }

  async apply(_tenantId: string, templateId: string, _websiteId: string) {
    const template = await this.get(templateId);

    // Increment usage count
    await prisma.template.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });

    // Return template data for the website-builder-service to apply
    return {
      templateId,
      structure: template.structure,
      pages: template.pages,
      theme: template.theme,
    };
  }

  async clone(templateId: string, newName: string) {
    const template = await this.get(templateId);

    return prisma.template.create({
      data: {
        name: newName,
        description: template.description,
        industry: template.industry,
        category: template.category,
        thumbnail: template.thumbnail,
        structure: template.structure,
        pages: template.pages,
        theme: template.theme,
        components: template.components,
      },
    });
  }

  async getByIndustry(industry: string) {
    return prisma.template.findMany({
      where: { industry, isPublic: true },
      orderBy: { name: 'asc' },
    });
  }
}

export const templateService = new TemplateService();
