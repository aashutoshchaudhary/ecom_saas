/**
 * Data Provider Layer
 *
 * Smart layer that fetches from the real API backend when available,
 * and falls back to mock data when the backend is not running.
 * This allows the app to work in both connected and standalone modes.
 *
 * Usage in components:
 *   const { data, loading, error } = useData("orders");
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
  async getOrders(params?: { search?: string; status?: string }) {
    return withFallback(
      async () => {
        const res = await ordersApi.list(params);
        return res.data;
      },
      mockOrders as any[]
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

  // Products
  async getProducts(params?: { search?: string; category?: string }) {
    return withFallback(
      async () => {
        const res = await productsApi.list(params);
        return res.data;
      },
      mockProducts as any[]
    );
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

  // Wallet
  async getWallet() {
    return withFallback(
      () => walletApi.get(),
      mockWallet as any
    );
  },

  // Domains
  async getDomains() {
    return withFallback(
      () => domainsApi.list(),
      mockDomains as any[]
    );
  },

  // SEO
  async getSeoData() {
    return mockSeoData;
  },

  // Currencies
  async getCurrencies() {
    return mockCurrencies;
  },

  // AI Versions
  async getAiVersions() {
    return mockAiVersions;
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

  // User profile
  async getUserProfile() {
    return withFallback(
      () => usersApi.getProfile(),
      mockUser as any
    );
  },
};
