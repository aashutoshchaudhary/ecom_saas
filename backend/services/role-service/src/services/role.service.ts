import { PrismaClient } from '@prisma/client';
import {
  generateId, AppError, NotFoundError, ConflictError,
  parsePagination, paginationHelper,
  RedisClient, RedisKeys,
} from '@siteforge/shared';

const prisma = new PrismaClient();

export class RoleService {
  async list(tenantId: string, query: { page?: string; limit?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const where = { tenantId };

    const [roles, total] = await Promise.all([
      prisma.role.findMany({ where, skip, take: limit, orderBy: { name: 'asc' }, include: { permissions: { include: { permission: true } } } }),
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
      },
    });

    // Link permissions if provided
    if (data.permissions?.length) {
      for (const permId of data.permissions) {
        await prisma.rolePermission.create({
          data: { id: generateId(), roleId: role.id, permissionId: permId },
        }).catch(() => {}); // skip if permission doesn't exist
      }
    }

    return this.getRole(tenantId, role.id);
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
      data: { name: data.name, description: data.description },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async delete(tenantId: string, roleId: string) {
    const role = await this.getRole(tenantId, roleId);
    if (role.isSystem) {
      throw new AppError(400, 'SYSTEM_ROLE', 'Cannot delete system roles');
    }
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    await prisma.role.delete({ where: { id: roleId } });
    return { message: 'Role deleted' };
  }

  async getPermissions(tenantId: string, roleId: string) {
    await this.getRole(tenantId, roleId);
    const rps = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    return rps.map(rp => ({ id: rp.permission.id, resource: rp.permission.resource, action: rp.permission.action }));
  }

  async assignPermissions(tenantId: string, roleId: string, permissionIds: string[]) {
    await this.getRole(tenantId, roleId);
    for (const permId of permissionIds) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: permId } },
        create: { id: generateId(), roleId, permissionId: permId },
        update: {},
      });
    }
    return this.getPermissions(tenantId, roleId);
  }

  async removePermission(tenantId: string, roleId: string, permissionId: string) {
    await this.getRole(tenantId, roleId);
    await prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    }).catch(() => {});
    return this.getPermissions(tenantId, roleId);
  }

  async listAllPermissions() {
    return prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] });
  }

  async getUserPermissions(_userId: string, _tenantId: string) {
    return [];
  }

  async getRolePermissions(roleId: string) {
    const rps = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    return rps.map(rp => `${rp.permission.resource}:${rp.permission.action}`);
  }

  private async getRole(tenantId: string, roleId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role || role.tenantId !== tenantId) {
      throw new NotFoundError('Role', roleId);
    }
    return role;
  }
}

export const roleService = new RoleService();
