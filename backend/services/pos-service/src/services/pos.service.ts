import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { CloverService } from './clover.service';
import { SquareService } from './square.service';

const prisma = new PrismaClient();

export class AppError extends Error {
  constructor(message: string, public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
  }
}

export class PosService {
  async connect(data: {
    tenantId: string;
    provider: 'CLOVER' | 'SQUARE';
    merchantId: string;
    accessToken: string;
    refreshToken?: string;
    locationId?: string;
    settings?: Record<string, unknown>;
  }) {
    const existing = await prisma.posConnection.findUnique({
      where: { tenantId_provider: { tenantId: data.tenantId, provider: data.provider } },
    });
    if (existing) {
      throw new AppError('POS connection already exists for this provider', StatusCodes.CONFLICT);
    }

    // Verify connection works
    const isValid = await this.verifyCredentials(data.provider, data.accessToken, data.merchantId, data.locationId);
    if (!isValid) {
      throw new AppError('Invalid POS credentials', StatusCodes.BAD_REQUEST);
    }

    return prisma.posConnection.create({
      data: {
        tenantId: data.tenantId,
        provider: data.provider,
        merchantId: data.merchantId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        locationId: data.locationId,
        settings: (data.settings || {}) as any,
        status: 'ACTIVE',
      },
    });
  }

  async disconnect(connectionId: string, tenantId: string) {
    const connection = await this.getConnection(connectionId, tenantId);
    await prisma.posConnection.delete({ where: { id: connection.id } });
    return { success: true };
  }

  async syncOrders(connectionId: string, tenantId: string) {
    const connection = await this.getConnection(connectionId, tenantId);
    const syncLog = await prisma.posSyncLog.create({
      data: { connectionId, type: 'orders', direction: 'inbound' },
    });

    try {
      const client = this.createClient(connection);
      const orders = await client.getOrders();

      await prisma.posSyncLog.update({
        where: { id: syncLog.id },
        data: { recordsProcessed: orders.length, completedAt: new Date() },
      });

      await prisma.posConnection.update({
        where: { id: connectionId },
        data: { lastSyncAt: new Date() },
      });

      return { syncLogId: syncLog.id, recordsProcessed: orders.length, orders };
    } catch (error) {
      await prisma.posSyncLog.update({
        where: { id: syncLog.id },
        data: {
          errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
          completedAt: new Date(),
        },
      });
      throw new AppError('Failed to sync orders', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async syncProducts(connectionId: string, tenantId: string) {
    const connection = await this.getConnection(connectionId, tenantId);
    const syncLog = await prisma.posSyncLog.create({
      data: { connectionId, type: 'products', direction: 'inbound' },
    });

    try {
      const client = this.createClient(connection);
      const products = await client.getProducts();

      await prisma.posSyncLog.update({
        where: { id: syncLog.id },
        data: { recordsProcessed: products.length, completedAt: new Date() },
      });

      return { syncLogId: syncLog.id, recordsProcessed: products.length, products };
    } catch (error) {
      await prisma.posSyncLog.update({
        where: { id: syncLog.id },
        data: {
          errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
          completedAt: new Date(),
        },
      });
      throw new AppError('Failed to sync products', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async syncInventory(connectionId: string, tenantId: string) {
    const connection = await this.getConnection(connectionId, tenantId);
    const syncLog = await prisma.posSyncLog.create({
      data: { connectionId, type: 'inventory', direction: 'inbound' },
    });

    try {
      const client = this.createClient(connection);
      const inventory = await client.getInventory();

      await prisma.posSyncLog.update({
        where: { id: syncLog.id },
        data: { recordsProcessed: inventory.length, completedAt: new Date() },
      });

      return { syncLogId: syncLog.id, recordsProcessed: inventory.length, inventory };
    } catch (error) {
      await prisma.posSyncLog.update({
        where: { id: syncLog.id },
        data: {
          errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
          completedAt: new Date(),
        },
      });
      throw new AppError('Failed to sync inventory', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async handleWebhook(provider: string, payload: Record<string, unknown>) {
    console.log(`Received ${provider} webhook:`, JSON.stringify(payload).substring(0, 200));
    // Process webhooks based on provider and event type
    return { received: true };
  }

  async listConnections(tenantId: string) {
    return prisma.posConnection.findMany({
      where: { tenantId },
      select: {
        id: true, tenantId: true, provider: true, merchantId: true,
        locationId: true, settings: true, status: true, lastSyncAt: true,
        createdAt: true, updatedAt: true,
      },
    });
  }

  async getSyncLogs(connectionId: string, limit = 20, offset = 0) {
    return prisma.posSyncLog.findMany({
      where: { connectionId },
      orderBy: { startedAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  private async getConnection(connectionId: string, tenantId: string) {
    const connection = await prisma.posConnection.findUnique({ where: { id: connectionId } });
    if (!connection || connection.tenantId !== tenantId) {
      throw new AppError('POS connection not found', StatusCodes.NOT_FOUND);
    }
    return connection;
  }

  private createClient(connection: { provider: string; accessToken: string; merchantId: string; locationId: string | null }) {
    if (connection.provider === 'CLOVER') {
      return new CloverService(connection.accessToken, connection.merchantId);
    }
    return new SquareService(connection.accessToken, connection.locationId || '');
  }

  private async verifyCredentials(provider: string, accessToken: string, merchantId: string, locationId?: string): Promise<boolean> {
    try {
      if (provider === 'CLOVER') {
        const clover = new CloverService(accessToken, merchantId);
        return await clover.verifyConnection();
      }
      const square = new SquareService(accessToken, locationId || '');
      return await square.verifyConnection();
    } catch {
      return false;
    }
  }
}

export const posService = new PosService();
