import { PrismaClient } from '@prisma/client';
import {
  generateId, NotFoundError,
  parsePagination, paginationHelper,
} from '@siteforge/shared';

const prisma = new PrismaClient();

export class VersionService {
  async list(tenantId: string, query: {
    page?: string; limit?: string; resourceType?: string; resourceId?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { tenantId };
    if (query.resourceType) where.resourceType = query.resourceType;
    if (query.resourceId) where.resourceId = query.resourceId;

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
    resourceType: string; resourceId: string;
    content: Record<string, unknown>; metadata?: Record<string, unknown>;
    createdBy?: string;
  }) {
    const lastVersion = await prisma.aiVersion.findFirst({
      where: { tenantId, resourceType: data.resourceType, resourceId: data.resourceId },
      orderBy: { versionNumber: 'desc' },
    });

    return prisma.aiVersion.create({
      data: {
        id: generateId(),
        tenantId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        versionNumber: (lastVersion?.versionNumber || 0) + 1,
        content: data.content as any,
        metadata: data.metadata || {},
        createdBy: data.createdBy,
      },
    });
  }

  async restore(tenantId: string, versionId: string) {
    const version = await this.get(tenantId, versionId);

    // Create a new version with the restored content
    const restored = await this.createVersion(tenantId, {
      resourceType: version.resourceType,
      resourceId: version.resourceId,
      content: version.content as Record<string, unknown>,
      metadata: { restoredFrom: versionId, restoredAt: new Date().toISOString() },
    });

    // Update the actual resource based on type
    if (version.resourceType === 'PAGE') {
      await prisma.page.update({
        where: { id: version.resourceId },
        data: { sections: version.content as any, updatedAt: new Date() },
      });
    } else if (version.resourceType === 'WEBSITE') {
      await prisma.website.update({
        where: { id: version.resourceId },
        data: { structure: version.content as any, updatedAt: new Date() },
      });
    }

    return restored;
  }

  async compare(tenantId: string, versionIdA: string, versionIdB: string) {
    const [versionA, versionB] = await Promise.all([
      this.get(tenantId, versionIdA),
      this.get(tenantId, versionIdB),
    ]);

    const contentA = versionA.content as Record<string, unknown>;
    const contentB = versionB.content as Record<string, unknown>;

    const diff = this.computeDiff(contentA, contentB);

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
