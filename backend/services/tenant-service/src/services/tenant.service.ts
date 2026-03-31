import { PrismaClient, SubscriptionTier } from '@prisma/client';
import {
  generateId, slugify, AppError, NotFoundError, ConflictError,
  parsePagination, paginationHelper,
  EventProducer, KafkaTopics, EventTypes,
} from '@siteforge/shared';

const prisma = new PrismaClient();

export class TenantService {
  async create(data: {
    name: string; ownerId: string; businessType?: string;
    subscription?: string; settings?: Record<string, unknown>;
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
        businessType: data.businessType,
        subscription: (data.subscription as SubscriptionTier) || 'FREE',
        settings: data.settings ? JSON.parse(JSON.stringify(data.settings)) : {},
      },
    });

    try {
      await EventProducer.publish(
        KafkaTopics.TENANT_EVENTS,
        EventTypes.TENANT_CREATED,
        { tenantId: tenant.id, name: tenant.name, ownerId: data.ownerId },
        tenant.id
      );
    } catch {}

    return tenant;
  }

  async get(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { industries: true },
    });
    if (!tenant) throw new NotFoundError('Tenant', tenantId);
    return tenant;
  }

  async update(tenantId: string, data: { name?: string; logo?: string; description?: string; settings?: Record<string, unknown> }) {
    await this.get(tenantId);
    const updateData: any = {};
    if (data.name) { updateData.name = data.name; updateData.slug = slugify(data.name); }
    if (data.logo) updateData.logo = data.logo;
    if (data.description) updateData.description = data.description;
    if (data.settings) updateData.settings = JSON.parse(JSON.stringify(data.settings));

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    try {
      await EventProducer.publish(
        KafkaTopics.TENANT_EVENTS, EventTypes.TENANT_UPDATED,
        { tenantId, ...data }, tenantId
      );
    } catch {}

    return tenant;
  }

  async delete(tenantId: string) {
    await this.get(tenantId);
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'CANCELLED' },
    });
    return { message: 'Tenant deleted' };
  }

  async list(query: { page?: string; limit?: string; search?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { status: { not: 'CANCELLED' } };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { industries: true } }),
      prisma.tenant.count({ where }),
    ]);

    return paginationHelper(tenants, total, page, limit);
  }

  async addIndustry(tenantId: string, industryId: string) {
    await this.get(tenantId);

    const existing = await prisma.tenantIndustry.findUnique({
      where: { tenantId_industryId: { tenantId, industryId } },
    });
    if (existing) throw new ConflictError('Industry already added');

    await prisma.tenantIndustry.create({
      data: { tenantId, industryId },
    });

    try {
      await EventProducer.publish(
        KafkaTopics.TENANT_EVENTS, EventTypes.TENANT_INDUSTRY_ADDED,
        { tenantId, industryId }, tenantId
      );
    } catch {}

    return this.get(tenantId);
  }

  async removeIndustry(tenantId: string, industryId: string) {
    await prisma.tenantIndustry.delete({
      where: { tenantId_industryId: { tenantId, industryId } },
    });
    return this.get(tenantId);
  }

  async updateSettings(tenantId: string, settings: Record<string, unknown>) {
    await this.get(tenantId);
    return prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: JSON.parse(JSON.stringify(settings)) },
    });
  }

  async updateSubscription(tenantId: string, data: { subscription: string }) {
    await this.get(tenantId);
    return prisma.tenant.update({
      where: { id: tenantId },
      data: { subscription: data.subscription as SubscriptionTier },
    });
  }
}

export const tenantService = new TenantService();
