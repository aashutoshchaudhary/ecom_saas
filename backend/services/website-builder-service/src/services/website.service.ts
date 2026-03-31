import { PrismaClient } from '@prisma/client';
import {
  generateId, AppError, NotFoundError, ConflictError,
  parsePagination, paginationHelper,
  EventProducer, KafkaTopics, EventTypes,
} from '@siteforge/shared';

const prisma = new PrismaClient();

export class WebsiteService {
  async create(tenantId: string, data: {
    name: string; templateId?: string; industryId?: string;
    structure?: Record<string, unknown>;
  }) {
    const website = await prisma.website.create({
      data: {
        id: generateId(),
        tenantId,
        name: data.name,
        templateId: data.templateId,
        industryId: data.industryId,
        structure: data.structure || { header: {}, footer: {}, pages: [] },
        status: 'DRAFT',
      },
    });

    await EventProducer.publish(
      KafkaTopics.WEBSITE_EVENTS, EventTypes.WEBSITE_CREATED,
      { websiteId: website.id, tenantId, name: data.name }, tenantId
    );

    return website;
  }

  async list(tenantId: string, query: { page?: string; limit?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const where = { tenantId };

    const [websites, total] = await Promise.all([
      prisma.website.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.website.count({ where }),
    ]);

    return paginationHelper(websites, total, page, limit);
  }

  async get(tenantId: string, websiteId: string) {
    const website = await prisma.website.findUnique({ where: { id: websiteId } });
    if (!website || website.tenantId !== tenantId) {
      throw new NotFoundError('Website', websiteId);
    }
    return website;
  }

  async update(tenantId: string, websiteId: string, data: {
    name?: string; structure?: Record<string, unknown>;
  }) {
    await this.get(tenantId, websiteId);
    const website = await prisma.website.update({
      where: { id: websiteId },
      data: { ...data, structure: data.structure as any, updatedAt: new Date() },
    });

    await EventProducer.publish(
      KafkaTopics.WEBSITE_EVENTS, EventTypes.WEBSITE_UPDATED,
      { websiteId, tenantId }, tenantId
    );

    return website;
  }

  async delete(tenantId: string, websiteId: string) {
    await this.get(tenantId, websiteId);
    await prisma.website.delete({ where: { id: websiteId } });
    return { message: 'Website deleted' };
  }

  async updateStructure(tenantId: string, websiteId: string, structure: Record<string, unknown>) {
    await this.get(tenantId, websiteId);
    return prisma.website.update({
      where: { id: websiteId },
      data: { structure: structure as any, updatedAt: new Date() },
    });
  }

  async publish(tenantId: string, websiteId: string) {
    await this.get(tenantId, websiteId);
    const website = await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'PUBLISHED', publishedAt: new Date(), updatedAt: new Date() },
    });

    await EventProducer.publish(
      KafkaTopics.WEBSITE_EVENTS, EventTypes.WEBSITE_PUBLISHED,
      { websiteId, tenantId }, tenantId
    );

    return website;
  }

  async unpublish(tenantId: string, websiteId: string) {
    await this.get(tenantId, websiteId);
    return prisma.website.update({
      where: { id: websiteId },
      data: { status: 'DRAFT', updatedAt: new Date() },
    });
  }

  async createPage(tenantId: string, websiteId: string, data: {
    name: string; slug: string; sections?: any[];
    isHomepage?: boolean; metaTitle?: string; metaDescription?: string;
  }) {
    await this.get(tenantId, websiteId);

    if (data.isHomepage) {
      await prisma.page.updateMany({
        where: { websiteId, isHomepage: true },
        data: { isHomepage: false },
      });
    }

    const page = await prisma.page.create({
      data: {
        id: generateId(),
        websiteId,
        name: data.name,
        slug: data.slug,
        sections: data.sections || [],
        isHomepage: data.isHomepage || false,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        sortOrder: await this.getNextSortOrder(websiteId),
      },
    });

    return page;
  }

  async listPages(tenantId: string, websiteId: string) {
    await this.get(tenantId, websiteId);
    return prisma.page.findMany({
      where: { websiteId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updatePage(tenantId: string, websiteId: string, pageId: string, data: {
    name?: string; slug?: string; sections?: any[];
    isHomepage?: boolean; metaTitle?: string; metaDescription?: string;
    sortOrder?: number;
  }) {
    await this.get(tenantId, websiteId);
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.websiteId !== websiteId) {
      throw new NotFoundError('Page', pageId);
    }

    if (data.isHomepage) {
      await prisma.page.updateMany({
        where: { websiteId, isHomepage: true, id: { not: pageId } },
        data: { isHomepage: false },
      });
    }

    const updated = await prisma.page.update({
      where: { id: pageId },
      data: { ...data, sections: data.sections as any, updatedAt: new Date() },
    });

    await EventProducer.publish(
      KafkaTopics.WEBSITE_EVENTS, EventTypes.PAGE_UPDATED,
      { websiteId, pageId, tenantId }, tenantId
    );

    return updated;
  }

  async deletePage(tenantId: string, websiteId: string, pageId: string) {
    await this.get(tenantId, websiteId);
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.websiteId !== websiteId) {
      throw new NotFoundError('Page', pageId);
    }
    await prisma.page.delete({ where: { id: pageId } });
    return { message: 'Page deleted' };
  }

  async updateSections(tenantId: string, websiteId: string, pageId: string, sections: any[]) {
    await this.get(tenantId, websiteId);
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.websiteId !== websiteId) {
      throw new NotFoundError('Page', pageId);
    }

    return prisma.page.update({
      where: { id: pageId },
      data: { sections: sections as any, updatedAt: new Date() },
    });
  }

  async duplicatePage(tenantId: string, websiteId: string, pageId: string) {
    await this.get(tenantId, websiteId);
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.websiteId !== websiteId) {
      throw new NotFoundError('Page', pageId);
    }

    return prisma.page.create({
      data: {
        id: generateId(),
        websiteId,
        name: `${page.name} (Copy)`,
        slug: `${page.slug}-copy-${Date.now()}`,
        sections: page.sections as any,
        isHomepage: false,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        sortOrder: await this.getNextSortOrder(websiteId),
      },
    });
  }

  private async getNextSortOrder(websiteId: string): Promise<number> {
    const lastPage = await prisma.page.findFirst({
      where: { websiteId },
      orderBy: { sortOrder: 'desc' },
    });
    return (lastPage?.sortOrder || 0) + 1;
  }
}

export const websiteService = new WebsiteService();
