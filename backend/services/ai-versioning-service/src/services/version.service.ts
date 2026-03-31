import { PrismaClient } from '@prisma/client';
import {
  generateId, NotFoundError,
  parsePagination, paginationHelper,
} from '@siteforge/shared';

const prisma = new PrismaClient();

export class VersionService {
  async list(tenantId: string, query: {
    page?: string; limit?: string; websiteId?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { tenantId };
    if (query.websiteId) where.websiteId = query.websiteId;

    const [versions, total] = await Promise.all([
      prisma.aiVersion.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.aiVersion.count({ where }),
    ]);

    return paginationHelper(versions, total, page, limit);
  }

  async get(tenantId: string, versionId: string) {
    const version = await prisma.aiVersion.findUnique({ where: { id: versionId } });
    if (!version || version.tenantId !== tenantId) {
      throw new NotFoundError('Version', versionId);
    }
    return version;
  }

  async createVersion(tenantId: string, data: {
    websiteId: string; jobId: string;
    snapshot: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    createdBy: string;
  }) {
    const lastVersion = await prisma.aiVersion.findFirst({
      where: { tenantId, websiteId: data.websiteId },
      orderBy: { versionNumber: 'desc' },
    });

    return prisma.aiVersion.create({
      data: {
        id: generateId(),
        tenantId,
        websiteId: data.websiteId,
        jobId: data.jobId,
        versionNumber: (lastVersion?.versionNumber || 0) + 1,
        snapshot: data.snapshot as any,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : {},
        createdBy: data.createdBy,
      },
    });
  }

  async restore(tenantId: string, versionId: string) {
    const version = await this.get(tenantId, versionId);

    const restored = await this.createVersion(tenantId, {
      websiteId: version.websiteId,
      jobId: version.jobId,
      snapshot: version.snapshot as Record<string, unknown>,
      metadata: { restoredFrom: versionId, restoredAt: new Date().toISOString() },
      createdBy: 'system',
    });

    return restored;
  }

  async compare(tenantId: string, versionIdA: string, versionIdB: string) {
    const [versionA, versionB] = await Promise.all([
      this.get(tenantId, versionIdA),
      this.get(tenantId, versionIdB),
    ]);

    const snapshotA = versionA.snapshot as Record<string, unknown>;
    const snapshotB = versionB.snapshot as Record<string, unknown>;

    const diff = this.computeDiff(snapshotA, snapshotB);

    return {
      versionA: { id: versionA.id, versionNumber: versionA.versionNumber, createdAt: versionA.createdAt },
      versionB: { id: versionB.id, versionNumber: versionB.versionNumber, createdAt: versionB.createdAt },
      diff,
    };
  }

  private computeDiff(
    objA: Record<string, unknown>,
    objB: Record<string, unknown>,
    path = ''
  ): Array<{ path: string; type: 'added' | 'removed' | 'changed'; oldValue?: unknown; newValue?: unknown }> {
    const changes: Array<{ path: string; type: 'added' | 'removed' | 'changed'; oldValue?: unknown; newValue?: unknown }> = [];
    const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const valA = objA[key];
      const valB = objB[key];

      if (!(key in objA)) {
        changes.push({ path: currentPath, type: 'added', newValue: valB });
      } else if (!(key in objB)) {
        changes.push({ path: currentPath, type: 'removed', oldValue: valA });
      } else if (typeof valA === 'object' && typeof valB === 'object' && valA !== null && valB !== null) {
        changes.push(...this.computeDiff(valA as Record<string, unknown>, valB as Record<string, unknown>, currentPath));
      } else if (JSON.stringify(valA) !== JSON.stringify(valB)) {
        changes.push({ path: currentPath, type: 'changed', oldValue: valA, newValue: valB });
      }
    }

    return changes;
  }
}

export const versionService = new VersionService();
