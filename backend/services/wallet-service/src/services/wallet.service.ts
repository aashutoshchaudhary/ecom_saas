import { PrismaClient, Prisma, TransactionType } from '@prisma/client';
import { EventProducer } from '@siteforge/shared';

const prisma = new PrismaClient();

export class WalletService {
  async create(tenantId: string, data: { currency?: string }) {
    const existing = await prisma.wallet.findUnique({ where: { tenantId } });
    if (existing) return existing;

    return prisma.wallet.create({
      data: {
        tenantId,
        balance: 0,
        currency: data.currency || 'USD',
      },
    });
  }

  async list(tenantId: string, query: {
    page?: string;
    limit?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const wallet = await this.getOrCreateWallet(tenantId);
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = { walletId: wallet.id };
    if (query.type) where.type = query.type as TransactionType;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      prisma.walletTransaction.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.walletTransaction.count({ where }),
    ]);

    return {
      data: { wallet, transactions: data },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total },
    };
  }

  async get(tenantId: string, _id?: string) {
    const wallet = await this.getOrCreateWallet(tenantId);
    const recentTransactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return { ...wallet, recentTransactions };
  }

  async update(tenantId: string, _id: string, data: {
    type: string;
    amount: number;
    description?: string;
    referenceId?: string;
    referenceType?: string;
  }) {
    return this.addTransaction(tenantId, {
      type: data.type as TransactionType,
      amount: data.amount,
      description: data.description,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
    });
  }

  async delete(_tenantId: string, _id: string) {
    throw Object.assign(new Error('Wallets cannot be deleted'), { statusCode: 400 });
  }

  async getOrCreateWallet(tenantId: string) {
    let wallet = await prisma.wallet.findUnique({ where: { tenantId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { tenantId, balance: 0, currency: 'USD' } });
    }
    return wallet;
  }

  async addTransaction(tenantId: string, data: {
    type: TransactionType;
    amount: number;
    description?: string;
    referenceId?: string;
    referenceType?: string;
  }) {
    const wallet = await this.getOrCreateWallet(tenantId);
    const isCredit = ['CREDIT_PURCHASE', 'REFUND', 'BONUS'].includes(data.type);
    const change = isCredit ? Math.abs(data.amount) : -Math.abs(data.amount);
    const newBalance = Number(wallet.balance) + change;

    if (newBalance < 0) {
      throw Object.assign(new Error('Insufficient balance'), { statusCode: 400 });
    }

    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: data.type,
          amount: data.amount,
          balanceAfter: newBalance,
          description: data.description,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
        },
      }),
    ]);

    try {
      await EventProducer.publish('WALLET_EVENTS', isCredit ? 'CREDITS_ADDED' : 'CREDITS_DEDUCTED', {
        tenantId,
        amount: data.amount,
        balance: newBalance,
      }, tenantId);
    } catch {}

    return { wallet: updatedWallet, transaction };
  }

  async topUp(tenantId: string, data: { amount: number; paymentId?: string }) {
    return this.addTransaction(tenantId, {
      type: 'CREDIT_PURCHASE',
      amount: data.amount,
      description: `Credit top-up: ${data.amount}`,
      referenceId: data.paymentId,
      referenceType: 'payment',
    });
  }

  async deductCredits(tenantId: string, amount: number, description: string, referenceId?: string) {
    return this.addTransaction(tenantId, {
      type: 'AI_USAGE',
      amount,
      description,
      referenceId,
      referenceType: 'ai_job',
    });
  }

  async getBalance(tenantId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(tenantId);
    return Number(wallet.balance);
  }

  async listPackages() {
    return prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
}

export const walletService = new WalletService();
