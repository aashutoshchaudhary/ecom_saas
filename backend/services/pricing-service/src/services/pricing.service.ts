import { PrismaClient, Prisma, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

export class PricingService {
  // --- Price Management ---
  async create(tenantId: string, data: {
    productId: string;
    variantId: string;
    amount: number;
    currency?: string;
    compareAtPrice?: number;
    costPrice?: number;
    taxRate?: number;
    taxInclusive?: boolean;
  }) {
    return prisma.price.create({
      data: {
        tenantId,
        productId: data.productId,
        variantId: data.variantId,
        amount: data.amount,
        currency: data.currency || 'USD',
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        taxRate: data.taxRate || 0,
        taxInclusive: data.taxInclusive ?? false,
      },
    });
  }

  async list(tenantId: string, query: {
    page?: string;
    limit?: string;
    productId?: string;
    currency?: string;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.PriceWhereInput = { tenantId };
    if (query.productId) where.productId = query.productId;
    if (query.currency) where.currency = query.currency;

    const [data, total] = await Promise.all([
      prisma.price.findMany({ where, skip, take: limit, orderBy: { updatedAt: 'desc' } }),
      prisma.price.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total },
    };
  }

  async get(tenantId: string, id: string) {
    const price = await prisma.price.findFirst({ where: { id, tenantId } });
    if (!price) throw Object.assign(new Error('Price not found'), { statusCode: 404 });
    return price;
  }

  async update(tenantId: string, id: string, data: Partial<{
    amount: number;
    compareAtPrice: number;
    costPrice: number;
    taxRate: number;
    taxInclusive: boolean;
  }>) {
    await this.get(tenantId, id);
    return prisma.price.update({ where: { id }, data });
  }

  async delete(tenantId: string, id: string) {
    await this.get(tenantId, id);
    await prisma.price.delete({ where: { id } });
  }

  // --- Discount Management ---
  async createDiscount(tenantId: string, data: {
    code: string;
    type: string;
    value: number;
    minOrderAmount?: number;
    maxUses?: number;
    startsAt: string;
    expiresAt?: string;
  }) {
    return prisma.discount.create({
      data: {
        tenantId,
        code: data.code.toUpperCase(),
        type: data.type as DiscountType,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxUses: data.maxUses,
        startsAt: new Date(data.startsAt),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  async listDiscounts(tenantId: string, query: { page?: string; limit?: string; active?: string }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.DiscountWhereInput = { tenantId };
    if (query.active === 'true') {
      where.isActive = true;
      where.startsAt = { lte: new Date() };
      where.OR = [{ expiresAt: null }, { expiresAt: { gte: new Date() } }];
    }

    const [data, total] = await Promise.all([
      prisma.discount.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.discount.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total },
    };
  }

  async getDiscount(tenantId: string, id: string) {
    const discount = await prisma.discount.findFirst({ where: { id, tenantId } });
    if (!discount) throw Object.assign(new Error('Discount not found'), { statusCode: 404 });
    return discount;
  }

  async validateDiscount(tenantId: string, code: string, orderAmount: number) {
    const discount = await prisma.discount.findUnique({
      where: { tenantId_code: { tenantId, code: code.toUpperCase() } },
    });

    if (!discount) return { valid: false, reason: 'Invalid discount code' };
    if (!discount.isActive) return { valid: false, reason: 'Discount is inactive' };
    if (discount.startsAt > new Date()) return { valid: false, reason: 'Discount not yet active' };
    if (discount.expiresAt && discount.expiresAt < new Date()) return { valid: false, reason: 'Discount expired' };
    if (discount.maxUses && discount.usedCount >= discount.maxUses) return { valid: false, reason: 'Discount usage limit reached' };
    if (discount.minOrderAmount && orderAmount < Number(discount.minOrderAmount)) {
      return { valid: false, reason: `Minimum order amount: ${discount.minOrderAmount}` };
    }

    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = orderAmount * (Number(discount.value) / 100);
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = Math.min(Number(discount.value), orderAmount);
    } else if (discount.type === 'FREE_SHIPPING') {
      discountAmount = 0; // Handled at checkout
    }

    return { valid: true, discount, discountAmount };
  }

  async applyDiscount(tenantId: string, code: string) {
    const discount = await prisma.discount.findUnique({
      where: { tenantId_code: { tenantId, code: code.toUpperCase() } },
    });
    if (discount) {
      await prisma.discount.update({ where: { id: discount.id }, data: { usedCount: { increment: 1 } } });
    }
  }

  async updateDiscount(tenantId: string, id: string, data: Partial<{
    value: number;
    minOrderAmount: number;
    maxUses: number;
    expiresAt: string;
    isActive: boolean;
  }>) {
    await this.getDiscount(tenantId, id);
    const updateData: any = { ...data };
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);
    return prisma.discount.update({ where: { id }, data: updateData });
  }

  async deleteDiscount(tenantId: string, id: string) {
    await this.getDiscount(tenantId, id);
    await prisma.discount.update({ where: { id }, data: { isActive: false } });
  }

  // --- Currency Rates ---
  async getCurrencyRates(baseCurrency: string) {
    return prisma.currencyRate.findMany({ where: { baseCurrency } });
  }

  async updateCurrencyRate(baseCurrency: string, targetCurrency: string, rate: number) {
    return prisma.currencyRate.upsert({
      where: { baseCurrency_targetCurrency: { baseCurrency, targetCurrency } },
      create: { baseCurrency, targetCurrency, rate },
      update: { rate },
    });
  }

  async convertPrice(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return amount;
    const rate = await prisma.currencyRate.findUnique({
      where: { baseCurrency_targetCurrency: { baseCurrency: fromCurrency, targetCurrency: toCurrency } },
    });
    if (!rate) throw Object.assign(new Error(`Exchange rate not found: ${fromCurrency} → ${toCurrency}`), { statusCode: 400 });
    return Math.round(amount * Number(rate.rate) * 100) / 100;
  }

  async calculatePrice(tenantId: string, productId: string, variantId: string, currency: string, quantity: number) {
    const price = await prisma.price.findUnique({
      where: { tenantId_productId_variantId_currency: { tenantId, productId, variantId, currency } },
    });
    if (!price) throw Object.assign(new Error('Price not configured'), { statusCode: 404 });

    const unitPrice = Number(price.amount);
    const subtotal = unitPrice * quantity;
    const taxRate = Number(price.taxRate);
    let tax = 0;
    if (price.taxInclusive) {
      tax = subtotal - (subtotal / (1 + taxRate / 100));
    } else {
      tax = subtotal * (taxRate / 100);
    }

    return {
      unitPrice,
      quantity,
      subtotal,
      tax: Math.round(tax * 100) / 100,
      total: Math.round((price.taxInclusive ? subtotal : subtotal + tax) * 100) / 100,
      currency,
      compareAtPrice: price.compareAtPrice ? Number(price.compareAtPrice) : null,
    };
  }
}

export const pricingService = new PricingService();
