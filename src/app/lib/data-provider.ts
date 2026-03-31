/**
 * Data Provider Layer
 *
 * Smart layer that fetches from the real API backend when available,
 * and falls back to mock data when the backend is not running.
 * This allows the app to work in both connected and standalone modes.
 */

import { getTokens } from "./api/client";
import { ordersApi, type Order, type OrderStats } from "./api/orders";
import { productsApi, type Product } from "./api/products";
import { customersApi, type Customer, type CustomerStats } from "./api/customers";
import { analyticsApi, type AnalyticsSummary } from "./api/analytics";
import { websitesApi, type Website } from "./api/websites";
import { domainsApi, type Domain } from "./api/domains";
import { walletApi, type Wallet } from "./api/wallet";
import { paymentsApi, type Invoice } from "./api/payments";
import { usersApi, type UserProfile } from "./api/users";
import { aiApi } from "./api/ai";
import { notificationsApi } from "./api/notifications";
import { mediaApi } from "./api/media";
import {
  mockOrders,
  mockProducts,
  mockCustomers,
  mockAnalytics,
  mockWebsite,
  mockUser,
  mockWallet,
  mockDomains,
  mockEmails,
  mockSeoData,
  mockProductVariants,
  mockCurrencies,
  mockAiVersions,
  mockBlogPosts,
  mockCourses,
  mockApps,
} from "./mock-data";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Check if backend is reachable (cached for 30s)
let backendAlive: boolean | null = null;
let lastCheck = 0;

async function isBackendAvailable(): Promise<boolean> {
  const now = Date.now();
  if (backendAlive !== null && now - lastCheck < 30000) {
    return backendAlive;
  }

  try {
    const res = await fetch(`${API_BASE.replace("/api/v1", "")}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    backendAlive = res.ok;
  } catch {
    backendAlive = false;
  }
  lastCheck = now;
  return backendAlive;
}

/**
 * Try to fetch from API, fall back to mock data if backend unavailable.
 */
async function withFallback<T>(apiFn: () => Promise<T>, mockData: T): Promise<T> {
  const { accessToken } = getTokens();
  if (!accessToken) return mockData;

  const available = await isBackendAvailable();
  if (!available) return mockData;

  try {
    return await apiFn();
  } catch {
    return mockData;
  }
}

// ─── Data Fetchers ───────────────────────────────────────────────────────────

export const dataProvider = {
  // Orders
  async getOrders(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    return withFallback(
      async () => {
        const res = await ordersApi.list(params);
        return res.data;
      },
      mockOrders as any[]
    );
  },

  async getOrder(id: string) {
    return withFallback(
      () => ordersApi.get(id),
      mockOrders.find((o) => o.id === id) as any
    );
  },

  async getOrderStats() {
    return withFallback(
      () => ordersApi.getStats(),
      {
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter((o) => o.status === "pending").length,
        totalRevenue: mockOrders.reduce((sum, o) => sum + o.total, 0),
        averageOrderValue: mockOrders.reduce((sum, o) => sum + o.total, 0) / mockOrders.length,
      }
    );
  },

  async updateOrderStatus(id: string, status: string) {
    return withFallback(
      () => ordersApi.updateStatus(id, status),
      { id, status } as any
    );
  },

  // Products
  async getProducts(params?: { search?: string; category?: string; page?: number; limit?: number }) {
    return withFallback(
      async () => {
        const res = await productsApi.list(params);
        return res.data;
      },
      mockProducts as any[]
    );
  },

  async getProduct(id: string) {
    return withFallback(
      () => productsApi.get(id),
      mockProducts.find((p) => p.id === id) as any
    );
  },

  async createProduct(data: any) {
    return withFallback(() => productsApi.create(data), data);
  },

  async updateProduct(id: string, data: any) {
    return withFallback(() => productsApi.update(id, data), { id, ...data });
  },

  async deleteProduct(id: string) {
    return withFallback(() => productsApi.delete(id), undefined);
  },

  async getProductVariants() {
    return mockProductVariants;
  },

  // Customers
  async getCustomers(params?: { search?: string; segment?: string }) {
    return withFallback(
      async () => {
        const res = await customersApi.list(params);
        return res.data;
      },
      mockCustomers as any[]
    );
  },

  async getCustomerStats() {
    return withFallback(
      () => customersApi.getStats(),
      {
        totalCustomers: mockCustomers.length,
        newThisMonth: 12,
        avgLifetimeValue: 450,
        retentionRate: 82,
      }
    );
  },

  // Analytics
  async getAnalytics(params?: { period?: string }) {
    return withFallback(
      () => analyticsApi.getSummary(params),
      mockAnalytics as any
    );
  },

  // Website
  async getWebsite() {
    return withFallback(
      async () => {
        const res = await websitesApi.list({ limit: 1 });
        return res.data[0] || null;
      },
      mockWebsite as any
    );
  },

  async getWebsites() {
    return withFallback(
      async () => {
        const res = await websitesApi.list();
        return res.data;
      },
      [mockWebsite] as any[]
    );
  },

  // Wallet
  async getWallet() {
    return withFallback(
      () => walletApi.get(),
      mockWallet as any
    );
  },

  async topUpWallet(amount: number) {
    return withFallback(
      () => walletApi.topup(amount),
      { balance: (mockWallet as any).balance + amount } as any
    );
  },

  async getWalletTransactions() {
    return withFallback(
      () => walletApi.getTransactions(),
      (mockWallet as any).transactions || []
    );
  },

  // Domains
  async getDomains() {
    return withFallback(
      () => domainsApi.list(),
      mockDomains as any[]
    );
  },

  async addDomain(data: any) {
    return withFallback(
      () => domainsApi.create(data),
      { id: `d-${Date.now()}`, ...data } as any
    );
  },

  async verifyDomain(id: string) {
    return withFallback(
      () => domainsApi.verify(id),
      { id, verified: true } as any
    );
  },

  // Payments
  async getPayments(params?: any) {
    return withFallback(
      async () => {
        const res = await paymentsApi.list(params);
        return res;
      },
      [] as any
    );
  },

  async getInvoices() {
    return withFallback(
      () => paymentsApi.getInvoices(),
      [] as any
    );
  },

  // SEO
  async getSeoData() {
    return withFallback(
      async () => {
        const website = await dataProvider.getWebsite();
        if (website?.id) {
          try {
            const audit = await aiApi.seoAudit(website.id);
            return audit;
          } catch {}
        }
        return mockSeoData;
      },
      mockSeoData
    );
  },

  // Currencies
  async getCurrencies() {
    return mockCurrencies;
  },

  // AI
  async getAiVersions() {
    return withFallback(
      async () => {
        const website = await dataProvider.getWebsite();
        if (website?.id) {
          try { return await aiApi.listVersions(website.id); } catch {}
        }
        return mockAiVersions;
      },
      mockAiVersions
    );
  },

  async generateContent(prompt: string, type: string) {
    return withFallback(
      () => aiApi.generateContent({ prompt, type }),
      { content: `Generated content for: ${prompt}` } as any
    );
  },

  async generateImage(prompt: string, style?: string) {
    return withFallback(
      () => aiApi.generateImage({ prompt, style }),
      { url: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop` } as any
    );
  },

  // Blog
  async getBlogPosts() {
    return mockBlogPosts;
  },

  // Courses
  async getCourses() {
    return mockCourses;
  },

  // Marketplace Apps
  async getApps() {
    return mockApps;
  },

  // Emails (for domains page)
  async getEmails() {
    return mockEmails;
  },

  // Notifications
  async getNotifications() {
    return withFallback(
      () => notificationsApi.list(),
      [] as any
    );
  },

  async markNotificationRead(id: string) {
    return withFallback(
      () => notificationsApi.markRead(id),
      undefined as any
    );
  },

  // Media
  async uploadFile(file: File) {
    return withFallback(
      () => mediaApi.upload(file),
      { id: `m-${Date.now()}`, url: URL.createObjectURL(file) } as any
    );
  },

  async getMediaFiles() {
    return withFallback(
      () => mediaApi.list(),
      [] as any
    );
  },

  // User profile
  async getUserProfile() {
    return withFallback(
      () => usersApi.getProfile(),
      mockUser as any
    );
  },

  async updateUserProfile(data: any) {
    return withFallback(
      () => usersApi.update(data),
      { ...mockUser, ...data } as any
    );
  },
};
