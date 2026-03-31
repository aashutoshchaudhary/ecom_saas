import { api, PaginatedResponse } from "./client";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface Order {
  id: string;
  tenantId: string;
  customerId: string;
  customer: string;
  email: string;
  avatar: string | null;
  date: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  items: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  trackingNumber: string | null;
  notes: string | null;
  products: OrderProduct[];
  timeline: OrderEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  productId: string;
  variantId: string | null;
  name: string;
  image: string | null;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string | null;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export const ordersApi = {
  list(params?: { page?: number; limit?: number; search?: string; status?: string; dateFrom?: string; dateTo?: string }) {
    return api.get<PaginatedResponse<Order>>("/orders", params);
  },

  get(id: string) {
    return api.get<Order>(`/orders/${id}`);
  },

  getStats() {
    return api.get<OrderStats>("/orders/stats");
  },

  create(data: {
    customerId: string;
    products: { productId: string; variantId?: string; quantity: number }[];
    shippingAddress: string;
    paymentMethod: string;
  }) {
    return api.post<Order>("/orders", data);
  },

  updateStatus(id: string, status: OrderStatus, note?: string) {
    return api.put<Order>(`/orders/${id}/status`, { status, note });
  },

  addNote(id: string, note: string) {
    return api.post<Order>(`/orders/${id}/notes`, { note });
  },

  cancel(id: string, reason?: string) {
    return api.post<Order>(`/orders/${id}/cancel`, { reason });
  },

  refund(id: string, amount?: number, reason?: string) {
    return api.post<Order>(`/orders/${id}/refund`, { amount, reason });
  },
};
