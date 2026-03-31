import { PrismaClient, Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

export class AppError extends Error {
  constructor(message: string, public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuditService {
  async createLog(data: {
    tenantId: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        before: data.before as any,
        after: data.after as any,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata || {},
      },
    });
  }

  async getLogs(tenantId: string, filters: {
    userId?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.AuditLogWhereInput = { tenantId };

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.resourceId) where.resourceId = filters.resourceId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async searchLogs(tenantId: string, query: string, filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }, limit = 50, offset = 0) {
    const where: Prisma.AuditLogWhereInput = {
      tenantId,
      OR: [
        { action: { contains: query, mode: 'insensitive' } },
        { resource: { contains: query, mode: 'insensitive' } },
        { resourceId: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) (where.createdAt as any).gte = new Date(filters.startDate);
      if (filters?.endDate) (where.createdAt as any).lte = new Date(filters.endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async exportLogs(tenantId: string, format: string, filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate: string;
    endDate: string;
  }) {
    const where: Prisma.AuditLogWhereInput = {
      tenantId,
      createdAt: {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      },
    };

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000, // Max export
    });

    if (format === 'CSV') {
      const { Parser } = await import('json2csv');
      const fields = ['id', 'tenantId', 'userId', 'action', 'resource', 'resourceId', 'ipAddress', 'createdAt'];
      const parser = new Parser({ fields });
      return { data: parser.parse(logs), contentType: 'text/csv', extension: 'csv' };
    }

    return { data: JSON.stringify(logs, null, 2), contentType: 'application/json', extension: 'json' };
  }
}

export const auditService = new AuditService();
