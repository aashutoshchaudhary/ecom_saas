import { PrismaClient, Prisma, ProductStatus } from '@prisma/client';
import { EventProducer } from '@siteforge/shared';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export class ProductService {
  async create(tenantId: string, data: {
    name: string;
    description?: string;
    sku?: string;
    category?: string;
    tags?: string[];
    images?: string[];
    metadata?: Record<string, unknown>;
    variants?: Array<{
      name: string;
      sku: string;
      attributes?: Record<string, unknown>;
      images?: string[];
      weight?: number;
      dimensions?: Record<string, unknown>;
      isDefault?: boolean;
    }>;
  }) {
    const slug = slugify(data.name);
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { tenantId_slug: { tenantId, slug: uniqueSlug } } })) {
      uniqueSlug = `${slug}-${counter++}`;
    }

    const product = await prisma.product.create({
      data: {
        tenantId,
        name: data.name,
        slug: uniqueSlug,
        description: data.description,
        sku: data.sku,
        category: data.category,
        tags: data.tags || [],
        images: data.images || [],
        metadata: (data.metadata || {}) as any,
        variants: data.variants ? {
          create: data.variants.map((v, i) => ({
            name: v.name,
            sku: v.sku,
            attributes: v.attributes || {},
            images: v.images || [],
            weight: v.weight,
            dimensions: v.dimensions || {},
            isDefault: v.isDefault ?? i === 0,
          })),
        } : undefined,
      },
      include: { variants: true },
    });

    try { await EventProducer.publish('PRODUCT_EVENTS', 'PRODUCT_CREATED', { tenantId, productId: product.id }, tenantId); } catch {}
    return product;
  }

  async list(tenantId: string, query: {
    page?: string;
    limit?: string;
    status?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { tenantId };
    if (query.status) where.status = query.status as ProductStatus;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    const sortField = query.sortBy || 'createdAt';
    (orderBy as any)[sortField] = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy, include: { variants: true } }),
      prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total },
    };
  }

  async get(tenantId: string, id: string) {
    const product = await prisma.product.findFirst({ where: { id, tenantId }, include: { variants: true } });
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return product;
  }

  async update(tenantId: string, id: string, data: Partial<{
    name: string;
    description: string;
    sku: string;
    category: string;
    tags: string[];
    images: string[];
    status: ProductStatus;
    metadata: Record<string, unknown>;
  }>) {
    await this.get(tenantId, id);
    const updateData: any = { ...data };
    if (data.name) updateData.slug = slugify(data.name);

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: { variants: true },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.get(tenantId, id);
    await prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
    try { await EventProducer.publish('PRODUCT_EVENTS', 'PRODUCT_DELETED', { tenantId, productId: id }, tenantId); } catch {}
  }

  async addVariant(tenantId: string, productId: string, data: {
    name: string;
    sku: string;
    attributes?: Record<string, unknown>;
    images?: string[];
    weight?: number;
    dimensions?: Record<string, unknown>;
    isDefault?: boolean;
  }) {
    await this.get(tenantId, productId);
    if (data.isDefault) {
      await prisma.productVariant.updateMany({ where: { productId }, data: { isDefault: false } });
    }
    return prisma.productVariant.create({
      data: {
        productId,
        name: data.name,
        sku: data.sku,
        attributes: data.attributes || {},
        images: data.images || [],
        weight: data.weight,
        dimensions: data.dimensions || {},
        isDefault: data.isDefault ?? false,
      },
    });
  }

  async updateVariant(tenantId: string, productId: string, variantId: string, data: Partial<{
    name: string;
    sku: string;
    attributes: Record<string, unknown>;
    images: string[];
    weight: number;
    dimensions: Record<string, unknown>;
    isDefault: boolean;
    status: ProductStatus;
  }>) {
    await this.get(tenantId, productId);
    if (data.isDefault) {
      await prisma.productVariant.updateMany({ where: { productId }, data: { isDefault: false } });
    }
    return prisma.productVariant.update({ where: { id: variantId }, data });
  }

  async deleteVariant(tenantId: string, productId: string, variantId: string) {
    await this.get(tenantId, productId);
    await prisma.productVariant.delete({ where: { id: variantId } });
  }

  async bulkUpload(tenantId: string, file: { buffer: Buffer; mimetype: string }) {
    if (!file) throw Object.assign(new Error('No file provided'), { statusCode: 400 });
    const content = file.buffer.toString('utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw Object.assign(new Error('CSV must have header + at least 1 row'), { statusCode: 400 });

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    const skuIdx = headers.indexOf('sku');
    const categoryIdx = headers.indexOf('category');
    const descIdx = headers.indexOf('description');
    const priceIdx = headers.indexOf('price');

    if (nameIdx === -1) throw Object.assign(new Error('CSV must have "name" column'), { statusCode: 400 });

    const created: any[] = [];
    const errors: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      try {
        const product = await this.create(tenantId, {
          name: cols[nameIdx],
          sku: skuIdx >= 0 ? cols[skuIdx] : undefined,
          category: categoryIdx >= 0 ? cols[categoryIdx] : undefined,
          description: descIdx >= 0 ? cols[descIdx] : undefined,
          metadata: priceIdx >= 0 ? { basePrice: parseFloat(cols[priceIdx]) } : {},
        });
        created.push(product);
      } catch (err: any) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    return { imported: created.length, failed: errors.length, errors };
  }
}

export const productService = new ProductService();
