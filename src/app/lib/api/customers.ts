import { api, PaginatedResponse } from "./client";

export type CustomerSegment = "vip" | "regular" | "new" | "at-risk";

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  location: string | null;
  segment: CustomerSegment;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  tags: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  totalCustomers: number;
  newThisMonth: number;
  avgLifetimeValue: number;
  repeatRate: number;
}

export const customersApi = {
  list(params?: { page?: number; limit?: number; search?: string; segment?: string }) {
    return api.get<PaginatedResponse<Customer>>("/customers", params);
  },

  get(id: string) {
    return api.get<Customer>(`/customers/${id}`);
  },

  getStats() {
    return api.get<CustomerStats>("/customers/stats");
  },

  create(data: Partial<Customer>) {
    return api.post<Customer>("/customers", data);
  },

  update(id: string, data: Partial<Customer>) {
    return api.put<Customer>(`/customers/${id}`, data);
  },

  delete(id: string) {
    return api.delete<void>(`/customers/${id}`);
  },

  getOrders(id: string, params?: { page?: number; limit?: number }) {
    return api.get<PaginatedResponse<any>>(`/customers/${id}/orders`, params);
  },
};
