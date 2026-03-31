import { PrismaClient } from '@prisma/client';
import {
  generateId, AppError, NotFoundError, ConflictError,
  parsePagination, paginationHelper,
  RedisClient, RedisKeys,
  EventProducer, KafkaTopics,
} from '@siteforge/shared';

const prisma = new PrismaClient();

export class RoleService {
  async list(tenantId: string, query: { page?: string; limit?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const where = { tenantId };

    const [roles, total] = await Promise.all([
      prisma.role.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.role.count({ where }),
    ]);

    return paginationHelper(roles, total, page, limit);
  }

  async create(tenantId: string, data: { name: string; description?: string; permissions?: string[] }) {
    const existing = await prisma.role.findFirst({
      where: { tenantId, name: data.name },
    });
    if (existing) throw new ConflictError('Role with this name already exists');

    const role = await prisma.role.create({
      data: {
        id: generateId(),
        tenantId,
        name: data.name,
        description: data.description,
        permissions: data.permissions || [],
      },
    });

    return role;
  }

  async update(tenantId: string, roleId: string, data: { name?: string; description?: string }) {
    const role = await this.getRole(tenantId, roleId);

    if (data.name && data.name !== role.name) {
      const existing = await prisma.role.findFirst({
        where: { tenantId, name: data.name, id: { not: roleId } },
      });
      if (existing) throw new ConflictError('Role with this name already exists');
    }

    return prisma.role.update({
      where: { id: roleId },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async delete(tenantId: string, roleId: string) {
    const role = await this.getRole(tenantId, roleId);

    if (role.isSystem) {
      throw new AppError(400, 'SYSTEM_ROLE', 'Cannot delete system roles');
    }

    await prisma.role.delete({ where: { id: roleId } });
    await this.invalidatePermissionCache(tenantId);
    return { message: 'Role deleted' };
  }

  async getPermissions(tenantId: string, roleId: string) {
    const role = await this.getRole(tenantId, roleId);
    return role.permissions;
  }

  async assignPermissions(tenantId: string, roleId: string, permissions: string[]) {
    const role = await this.getRole(tenantId, roleId);
    const merged = [...new Set([...(role.permissions as string[]), ...permissions])];

    const updated = await prisma.role.update({
      where: { id: roleId },
      data: { permissions: merged, updatedAt: new Date() },
    });

    await this.invalidatePermissionCache(tenantId);
    return updated;
  }

  async removePermission(tenantId: string, roleId: string, permissionId: string) {
    const role = await this.getRole(tenantId, roleId);
    const filtered = (role.permissions as string[]).filter((p) => p !== permissionId);

    const updated = await prisma.role.update({
      where: { id: roleId },
      data: { permissions: filtered, updatedAt: new Date() },
    });

    await this.invalidatePermissionCache(tenantId);
    return updated;
  }

  async listAllPermissions() {
    // Return all available permissions from the Permission enum
    const { Permission } = await import('@siteforge/shared');
    return Object.values(Permission);
  }

  async getUserPermissions(userId: string, tenantId: string) {
    const redis = RedisClient.getInstance();
    const cacheKey = RedisKeys.CACHE_PERMISSIONS(userId, tenantId);

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const membership = await prisma.tenantMembership.findFirst({
      where: { userId, tenantId },
    });

    if (!membership) throw new NotFoundError('Membership');

    const role = await prisma.role.findUnique({ where: { id: membership.roleId } });
    if (!role) throw new NotFoundError('Role', membership.roleId);

    const permissions = role.permissions as string[];
    await redis.setex(cacheKey, 3600, JSON.stringify(permissions));
    return permissions;
  }

  private async getRole(tenantId: string, roleId: string) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role || role.tenantId !== tenantId) {
      throw new NotFoundError('Role', roleId);
    }
    return role;
  }

  private async invalidatePermissionCache(tenantId: string) {
    const redis = RedisClient.getInstance();
    const memberships = await prisma.tenantMembership.findMany({
      where: { tenantId },
      select: { userId: true },
    });
    for (const m of memberships) {
      await redis.del(RedisKeys.CACHE_PERMISSIONS(m.userId, tenantId));
    }
  }
}

export const roleService = new RoleService();
