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
    const where: any = { isActive: true };
    if (query.industry) where.industryId = query.industry;
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
    name: string; description?: string; industryId?: string;
    category?: string; thumbnail?: string;
    structure: Record<string, unknown>; pages?: any[];
  }) {
    return prisma.template.create({
      data: {
        id: generateId(),
        name: data.name,
        description: data.description,
        industryId: data.industryId,
        category: data.category,
        thumbnail: data.thumbnail,
        structure: data.structure as any,
        pages: data.pages || [],
        isActive: true,
      },
    });
  }

  async apply(tenantId: string, templateId: string, websiteId: string) {
    const template = await this.get(templateId);

    const website = await prisma.website.update({
      where: { id: websiteId },
      data: {
        templateId,
        structure: template.structure,
        updatedAt: new Date(),
      },
    });

    // Create pages from template
    const templatePages = (template.pages || []) as any[];
    for (const page of templatePages) {
      await prisma.page.create({
        data: {
          id: generateId(),
          websiteId,
          name: page.name,
          slug: page.slug,
          sections: page.sections || [],
          isHomepage: page.isHomepage || false,
          sortOrder: page.sortOrder || 0,
        },
      });
    }

    return website;
  }

  async clone(templateId: string, newName: string) {
    const template = await this.get(templateId);

    return prisma.template.create({
      data: {
        id: generateId(),
        name: newName,
        description: template.description,
        industryId: template.industryId,
        category: template.category,
        thumbnail: template.thumbnail,
        structure: template.structure,
        pages: template.pages,
        isActive: true,
      },
    });
  }

  async getByIndustry(industryId: string) {
    return prisma.template.findMany({
      where: { industryId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

export const templateService = new TemplateService();
