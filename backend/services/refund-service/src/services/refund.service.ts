import { PrismaClient, Prisma, RefundStatus, RefundType } from '@prisma/client';
import { EventProducer } from '@siteforge/shared';

const prisma = new PrismaClient();

export class RefundService {
  async create(tenantId: string, data: {
    orderId: string;
    paymentId: string;
    amount: number;
    currency: string;
    type: string;
    reason?: string;
  }) {
    const refund = await prisma.refund.create({
      data: {
        tenantId,
        orderId: data.orderId,
        paymentId: data.paymentId,
        amount: data.amount,
        currency: data.currency,
        type: data.type as RefundType,
        reason: data.reason,
        status: 'PENDING',
      },
    });

    try {
      await EventProducer.publish('REFUND_EVENTS', {
        type: 'REFUND_REQUESTED',
        tenantId,
        refundId: refund.id,
        orderId: data.orderId,
        amount: data.amount,
      });
    } catch {}

    return refund;
  }

  async list(tenantId: string, query: {
    page?: string;
    limit?: string;
    status?: string;
    orderId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.RefundWhereInput = { tenantId };
    if (query.status) where.status = query.status as RefundStatus;
    if (query.orderId) where.orderId = query.orderId;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      prisma.refund.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.refund.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total },
    };
  }

  async get(tenantId: string, id: string) {
    const refund = await prisma.refund.findFirst({ where: { id, tenantId } });
    if (!refund) throw Object.assign(new Error('Refund not found'), { statusCode: 404 });
    return refund;
  }

  async update(tenantId: string, id: string, data: {
    status?: string;
    processedBy?: string;
  }) {
    const refund = await this.get(tenantId, id);
    if (refund.status === 'COMPLETED') {
      throw Object.assign(new Error('Refund already completed'), { statusCode: 400 });
    }

    const updateData: any = {};
    if (data.status) {
      updateData.status = data.status as RefundStatus;
      if (data.status === 'COMPLETED') updateData.processedAt = new Date();
      if (data.processedBy) updateData.processedBy = data.processedBy;
    }

    // Process refund with payment provider if approving
    if (data.status === 'PROCESSING') {
      updateData.status = 'PROCESSING';
      const updated = await prisma.refund.update({ where: { id }, data: updateData });

      // Simulate provider refund
      try {
        const providerRefundId = `ref_${Date.now()}`;
        await prisma.refund.update({
          where: { id },
          data: { providerRefundId, status: 'COMPLETED', processedAt: new Date(), processedBy: data.processedBy },
        });

        try {
          await EventProducer.publish('REFUND_EVENTS', {
            type: 'REFUND_COMPLETED',
            tenantId,
            refundId: id,
            orderId: refund.orderId,
            amount: Number(refund.amount),
          });
        } catch {}

        return prisma.refund.findFirst({ where: { id } });
      } catch (err: any) {
        await prisma.refund.update({ where: { id }, data: { status: 'FAILED' } });
        throw err;
      }
    }

    return prisma.refund.update({ where: { id }, data: updateData });
  }

  async delete(tenantId: string, id: string) {
    const refund = await this.get(tenantId, id);
    if (refund.status !== 'PENDING') {
      throw Object.assign(new Error('Can only cancel pending refunds'), { statusCode: 400 });
    }
    await prisma.refund.delete({ where: { id } });
  }
}

export const refundService = new RefundService();
