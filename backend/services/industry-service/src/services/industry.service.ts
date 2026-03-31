import { PrismaClient } from '@prisma/client';
import { NotFoundError, RedisClient } from '@siteforge/shared';

const prisma = new PrismaClient();
const CACHE_TTL = 3600; // 1 hour

export class IndustryService {
  async list() {
    const redis = RedisClient.getInstance();
    const cached = await redis.get('sf:cache:industries');
    if (cached) return JSON.parse(cached);

    const industries = await prisma.industry.findMany({
      orderBy: { name: 'asc' },
    });

    await redis.setex('sf:cache:industries', CACHE_TTL, JSON.stringify(industries));
    return industries;
  }

  async getById(id: string) {
    const redis = RedisClient.getInstance();
    const cacheKey = `sf:cache:industry:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const industry = await prisma.industry.findUnique({ where: { id } });
    if (!industry) throw new NotFoundError('Industry', id);

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(industry));
    return industry;
  }

  async getTemplates(industryId: string) {
    const redis = RedisClient.getInstance();
    const cacheKey = `sf:cache:industry:${industryId}:templates`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    await this.getById(industryId);

    const templates = await prisma.industryTemplate.findMany({
      where: { industryId },
      orderBy: { createdAt: 'asc' },
    });

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(templates));
    return templates;
  }

  async getPlugins(industryId: string) {
    const industry = await this.getById(industryId);
    return { industryId, requiredPlugins: industry.requiredPlugins || [] };
  }
}

export const industryService = new IndustryService();
