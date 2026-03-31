import { PrismaClient, Prisma, OrderStatus } from '@prisma/client';
import { EventProducer } from '@siteforge/shared';

const prisma = new PrismaClient();

function generateOrderNumber(): string {
  const prefix = 'ORD';
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export class OrderService {
  async create(tenantId: string, data: {
    customerId?: string;
    customerEmail: string;
    customerName: string;
    shippingAddress: Record<string, unknown>;
    billingAddress: Record<string, unknown>;
    notes?: string;
    source?: string;
    items: Array<{
      productId: string;
      variantId?: string;
      name: string;
      sku?: string;
      quantity: number;
      unitPrice: number;
    }>;
    taxAmount?: number;
    shippingAmount?: number;
    discountAmount?: number;
    currency?: string;
  }) {
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = data.taxAmount || 0;
    const shippingAmount = data.shippingAmount || 0;
    const discountAmount = data.discountAmount || 0;
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    const order = await prisma.order.create({
      data: {
        tenantId,
        orderNumber: generateOrderNumber(),
        customerId: data.customerId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        currency: data.currency || 'USD',
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        notes: data.notes,
        source: (data.source as any) || 'WEBSITE',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
        timeline: {
          create: { status: 'PENDING', note: 'Order placed' },
        },
      },
      include: { items: true, timeline: { orderBy: { createdAt: 'desc' } } },
    });

    try { await EventProducer.publish('ORDER_EVENTS', 'ORDER_CREATED', { tenantId, orderId: order.id, total: totalAmount }, tenantId); } catch {}
    return order;
  }

  async list(tenantId: string, query: {
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { tenantId };
    if (query.status) where.status = query.status as OrderStatus;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { customerEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    (orderBy as any)[query.sortBy || 'createdAt'] = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take: limit, orderBy, include: { items: true } }),
      prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total },
    };
  }

  async get(tenantId: string, id: string) {
    const order = await prisma.order.findFirst({
      where: { id, tenantId },
      include: { items: true, timeline: { orderBy: { createdAt: 'desc' } } },
    });
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    return order;
  }

  async update(tenantId: string, id: string, data: {
    status?: OrderStatus;
    notes?: string;
    shippingAddress?: Record<string, unknown>;
    timelineNote?: string;
  }) {
    const order = await this.get(tenantId, id);
    const updateData: any = {};
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'SHIPPED') updateData.shippedAt = new Date();
      if (data.status === 'DELIVERED') updateData.deliveredAt = new Date();
      if (data.status === 'CANCELLED') updateData.cancelledAt = new Date();
    }
    if (data.notes) updateData.notes = data.notes;
    if (data.shippingAddress) updateData.shippingAddress = data.shippingAddress;

    const [updated] = await Promise.all([
      prisma.order.update({ where: { id }, data: updateData, include: { items: true, timeline: { orderBy: { createdAt: 'desc' } } } }),
      data.status ? prisma.orderTimeline.create({
        data: { orderId: id, status: data.status, note: data.timelineNote || `Status changed to ${data.status}` },
      }) : Promise.resolve(null),
    ]);

    try { await EventProducer.publish('ORDER_EVENTS', 'ORDER_UPDATED', { tenantId, orderId: id, status: data.status }, tenantId); } catch {}
    return updated;
  }

  async delete(tenantId: string, id: string) {
    await this.get(tenantId, id);
    await prisma.order.update({ where: { id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
    await prisma.orderTimeline.create({ data: { orderId: id, status: 'CANCELLED', note: 'Order cancelled' } });
  }

  async getStats(tenantId: string) {
    const [total, pending, processing, shipped, delivered, cancelled] = await Promise.all([
      prisma.order.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.order.count({ where: { tenantId, status: 'PROCESSING' } }),
      prisma.order.count({ where: { tenantId, status: 'SHIPPED' } }),
      prisma.order.count({ where: { tenantId, status: 'DELIVERED' } }),
      prisma.order.count({ where: { tenantId, status: 'CANCELLED' } }),
    ]);

    const revenueResult = await prisma.order.aggregate({
      where: { tenantId, status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      _sum: { totalAmount: true },
      _avg: { totalAmount: true },
    });

    return {
      total, pending, processing, shipped, delivered, cancelled,
      revenue: Number(revenueResult._sum.totalAmount || 0),
      avgOrderValue: Number(revenueResult._avg.totalAmount || 0),
    };
  }
}

export const orderService = new OrderService();
