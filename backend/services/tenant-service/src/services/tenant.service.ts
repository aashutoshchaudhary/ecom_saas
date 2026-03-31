import { PrismaClient } from '@prisma/client';
import {
  generateId, slugify, AppError, NotFoundError, ConflictError,
  parsePagination, paginationHelper,
  EventProducer, KafkaTopics, EventTypes,
} from '@siteforge/shared';

const prisma = new PrismaClient();

export class TenantService {
  async create(data: {
    name: string; ownerId: string; industry?: string;
    plan?: string; settings?: Record<string, unknown>;
  }) {
    let slug = slugify(data.name);
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${generateId().substring(0, 6)}`;
    }

    const tenant = await prisma.tenant.create({
      data: {
        id: generateId(),
        name: data.name,
        slug,
        ownerId: data.ownerId,
        industry: data.industry,
        plan: data.plan || 'FREE',
        settings: data.settings || {},
      },
    });

    await EventProducer.publish(
      KafkaTopics.TENANT_EVENTS,
      EventTypes.TENANT_CREATED,
      { tenantId: tenant.id, name: tenant.name, ownerId: data.ownerId, industry: data.industry },
      tenant.id
    );

    return tenant;
  }

  async get(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundError('Tenant', tenantId);
    return tenant;
  }

  async update(tenantId: string, data: { name?: string; logo?: string; settings?: Record<string, unknown> }) {
    await this.get(tenantId);
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.name) {
      updateData.slug = slugify(data.name);
    }
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    await EventProducer.publish(
      KafkaTopics.TENANT_EVENTS, EventTypes.TENANT_UPDATED,
      { tenantId, ...data }, tenantId
    );

    return tenant;
  }

  async delete(tenantId: string) {
    await this.get(tenantId);
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'DELETED', updatedAt: new Date() },
    });
    return { message: 'Tenant deleted' };
  }

  async list(query: { page?: string; limit?: string; search?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { status: { not: 'DELETED' } };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.tenant.count({ where }),
    ]);

    return paginationHelper(tenants, total, page, limit);
  }

  async addIndustry(tenantId: string, industry: string) {
    const tenant = await this.get(tenantId);
    const industries = (tenant.industries as string[]) || [];
    if (industries.includes(industry)) {
      throw new ConflictError('Industry already added');
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { industries: [...industries, industry], updatedAt: new Date() },
    });

    await EventProducer.publish(
      KafkaTopics.TENANT_EVENTS, EventTypes.TENANT_INDUSTRY_ADDED,
      { tenantId, industry }, tenantId
    );

    return updated;
  }

  async removeIndustry(tenantId: string, industryId: string) {
    const tenant = await this.get(tenantId);
    const industries = ((tenant.industries as string[]) || []).filter((i) => i !== industryId);

    return prisma.tenant.update({
      where: { id: tenantId },
      data: { industries, updatedAt: new Date() },
    });
  }

  async updateSettings(tenantId: string, settings: Record<string, unknown>) {
    await this.get(tenantId);
    return prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: settings as any, updatedAt: new Date() },
    });
  }

  async updateSubscription(tenantId: string, data: { plan: string; billingCycle?: string }) {
    await this.get(tenantId);
    return prisma.tenant.update({
      where: { id: tenantId },
      data: { plan: data.plan, updatedAt: new Date() },
    });
  }
}

export const tenantService = new TenantService();
