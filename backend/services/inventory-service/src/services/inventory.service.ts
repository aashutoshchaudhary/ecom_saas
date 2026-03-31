import { PrismaClient, Prisma, MovementType } from '@prisma/client';
import { EventProducer } from '@siteforge/shared';

const prisma = new PrismaClient();

export class InventoryService {
  async create(tenantId: string, data: {
    productId: string;
    variantId?: string;
    sku: string;
    quantity?: number;
    lowStockThreshold?: number;
    trackInventory?: boolean;
    allowBackorder?: boolean;
    location?: string;
  }) {
    const item = await prisma.inventoryItem.create({
      data: {
        tenantId,
        productId: data.productId,
        variantId: data.variantId,
        sku: data.sku,
        quantity: data.quantity || 0,
        lowStockThreshold: data.lowStockThreshold || 10,
        trackInventory: data.trackInventory ?? true,
        allowBackorder: data.allowBackorder ?? false,
        location: data.location,
        movements: data.quantity ? {
          create: { type: 'PURCHASE', quantity: data.quantity, reason: 'Initial stock' },
        } : undefined,
      },
      include: { movements: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });

    return item;
  }

  async list(tenantId: string, query: {
    page?: string;
    limit?: string;
    search?: string;
    lowStock?: string;
    location?: string;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryItemWhereInput = { tenantId };
    if (query.search) {
      where.OR = [
        { sku: { contains: query.search, mode: 'insensitive' } },
        { productId: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.lowStock === 'true') {
      where.quantity = { lte: prisma.inventoryItem.fields.lowStockThreshold as any };
      // Prisma doesn't support field-to-field comparison directly, use raw
      delete where.quantity;
    }
    if (query.location) where.location = query.location;

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: { movements: { orderBy: { createdAt: 'desc' }, take: 5 } },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    const data = items.map(item => ({
      ...item,
      available: item.quantity - item.reserved,
      isLowStock: item.quantity <= item.lowStockThreshold,
    }));

    // Compute low stock items if filter requested
    let lowStockData = data;
    if (query.lowStock === 'true') {
      lowStockData = data.filter(item => item.isLowStock);
    }

    return {
      data: query.lowStock === 'true' ? lowStockData : data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total },
    };
  }

  async get(tenantId: string, id: string) {
    const item = await prisma.inventoryItem.findFirst({
      where: { id, tenantId },
      include: { movements: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
    if (!item) throw Object.assign(new Error('Inventory item not found'), { statusCode: 404 });
    return { ...item, available: item.quantity - item.reserved, isLowStock: item.quantity <= item.lowStockThreshold };
  }

  async update(tenantId: string, id: string, data: {
    quantity?: number;
    lowStockThreshold?: number;
    trackInventory?: boolean;
    allowBackorder?: boolean;
    location?: string;
    adjustmentType?: string;
    adjustmentReason?: string;
    adjustmentQuantity?: number;
    createdBy?: string;
  }) {
    const item = await this.get(tenantId, id);

    // Stock adjustment
    if (data.adjustmentQuantity !== undefined && data.adjustmentType) {
      const movementType = data.adjustmentType.toUpperCase() as MovementType;
      const isDeduction = ['SALE', 'RESERVED'].includes(movementType);
      const quantityChange = isDeduction ? -Math.abs(data.adjustmentQuantity) : Math.abs(data.adjustmentQuantity);
      const newQuantity = item.quantity + quantityChange;

      if (newQuantity < 0 && !item.allowBackorder) {
        throw Object.assign(new Error('Insufficient stock'), { statusCode: 400 });
      }

      const updateData: any = { quantity: newQuantity };
      if (movementType === 'RESERVED') updateData.reserved = item.reserved + Math.abs(data.adjustmentQuantity);
      if (movementType === 'RELEASED') updateData.reserved = Math.max(0, item.reserved - Math.abs(data.adjustmentQuantity));

      const updated = await prisma.inventoryItem.update({
        where: { id },
        data: updateData,
      });

      await prisma.inventoryMovement.create({
        data: {
          inventoryId: id,
          type: movementType,
          quantity: data.adjustmentQuantity,
          reason: data.adjustmentReason || `Stock ${movementType.toLowerCase()}`,
          referenceId: data.createdBy,
          createdBy: data.createdBy,
        },
      });

      if (updated.quantity <= updated.lowStockThreshold) {
        try {
          await EventProducer.publish('INVENTORY_EVENTS', 'LOW_STOCK_ALERT', {
            tenantId,
            inventoryId: id,
            sku: item.sku,
            quantity: updated.quantity,
            threshold: updated.lowStockThreshold,
          }, tenantId);
        } catch {}
      }

      return this.get(tenantId, id);
    }

    // Simple field updates
    const updateFields: any = {};
    if (data.lowStockThreshold !== undefined) updateFields.lowStockThreshold = data.lowStockThreshold;
    if (data.trackInventory !== undefined) updateFields.trackInventory = data.trackInventory;
    if (data.allowBackorder !== undefined) updateFields.allowBackorder = data.allowBackorder;
    if (data.location !== undefined) updateFields.location = data.location;

    await prisma.inventoryItem.update({ where: { id }, data: updateFields });
    return this.get(tenantId, id);
  }

  async delete(tenantId: string, id: string) {
    await this.get(tenantId, id);
    await prisma.inventoryItem.delete({ where: { id } });
  }

  async reserveStock(tenantId: string, sku: string, quantity: number): Promise<boolean> {
    const item = await prisma.inventoryItem.findUnique({ where: { tenantId_sku: { tenantId, sku } } });
    if (!item) return false;
    const available = item.quantity - item.reserved;
    if (available < quantity && !item.allowBackorder) return false;

    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: { reserved: item.reserved + quantity },
    });
    await prisma.inventoryMovement.create({
      data: { inventoryId: item.id, type: 'RESERVED', quantity, reason: 'Order reservation' },
    });
    return true;
  }

  async releaseStock(tenantId: string, sku: string, quantity: number) {
    const item = await prisma.inventoryItem.findUnique({ where: { tenantId_sku: { tenantId, sku } } });
    if (!item) return;
    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: { reserved: Math.max(0, item.reserved - quantity) },
    });
    await prisma.inventoryMovement.create({
      data: { inventoryId: item.id, type: 'RELEASED', quantity, reason: 'Reservation released' },
    });
  }

  async deductStock(tenantId: string, sku: string, quantity: number) {
    const item = await prisma.inventoryItem.findUnique({ where: { tenantId_sku: { tenantId, sku } } });
    if (!item) throw Object.assign(new Error(`Inventory not found for SKU: ${sku}`), { statusCode: 404 });
    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        quantity: item.quantity - quantity,
        reserved: Math.max(0, item.reserved - quantity),
      },
    });
    await prisma.inventoryMovement.create({
      data: { inventoryId: item.id, type: 'SALE', quantity, reason: 'Order fulfilled' },
    });
  }
}

export const inventoryService = new InventoryService();
