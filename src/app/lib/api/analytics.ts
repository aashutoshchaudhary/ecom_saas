import { api } from "./client";

export interface AnalyticsSummary {
  revenue: MetricData;
  orders: MetricData;
  visitors: MetricData;
  conversion: MetricData;
}

export interface MetricData {
  current: number;
  previous: number;
  change: number;
  data: { date: string; value: number }[];
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  growth: number;
  image: string | null;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  percentage: number;
}

export const analyticsApi = {
  getSummary(params?: { period?: string; dateFrom?: string; dateTo?: string }) {
    return api.get<AnalyticsSummary>("/analytics/summary", params);
  },

  getRevenue(params?: { period?: string; dateFrom?: string; dateTo?: string }) {
    return api.get<MetricData>("/analytics/revenue", params);
  },

  getTrafficSources(params?: { period?: string }) {
    return api.get<TrafficSource[]>("/analytics/traffic", params);
  },

  getTopProducts(params?: { limit?: number; period?: string }) {
    return api.get<TopProduct[]>("/analytics/top-products", params);
  },

  getConversionFunnel(params?: { period?: string }) {
    return api.get<ConversionFunnel[]>("/analytics/funnel", params);
  },

  getRealtime() {
    return api.get<{ activeVisitors: number; pageViews: number; events: any[] }>("/analytics/realtime");
  },
};
