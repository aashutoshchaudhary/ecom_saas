import { api, PaginatedResponse } from "./client";

export type PaymentProvider = "STRIPE" | "PAYPAL" | "CLOVER" | "NMI";
export type PaymentStatus = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "REFUNDED";

export interface Payment {
  id: string;
  tenantId: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerPaymentId: string | null;
  status: PaymentStatus;
  method: string | null;
  cardLast4: string | null;
  metadata: Record<string, any>;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  dueDate: string;
  paidAt: string | null;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export const paymentsApi = {
  list(params?: { page?: number; limit?: number; status?: string; provider?: string }) {
    return api.get<PaginatedResponse<Payment>>("/payments", params);
  },

  get(id: string) {
    return api.get<Payment>(`/payments/${id}`);
  },

  create(data: {
    orderId: string;
    amount: number;
    currency?: string;
    provider: PaymentProvider;
    idempotencyKey: string;
  }) {
    return api.post<Payment & { clientSecret?: string }>("/payments", data);
  },

  // Payment methods
  listMethods() {
    return api.get<PaymentMethod[]>("/payments/methods");
  },

  addMethod(token: string) {
    return api.post<PaymentMethod>("/payments/methods", { token });
  },

  removeMethod(id: string) {
    return api.delete<void>(`/payments/methods/${id}`);
  },

  setDefaultMethod(id: string) {
    return api.put<void>(`/payments/methods/${id}/default`);
  },

  // Invoices
  listInvoices(params?: { page?: number; limit?: number; status?: string }) {
    return api.get<PaginatedResponse<Invoice>>("/payments/invoices", params);
  },

  getInvoice(id: string) {
    return api.get<Invoice>(`/payments/invoices/${id}`);
  },

  downloadInvoice(id: string) {
    return api.get<{ url: string }>(`/payments/invoices/${id}/download`);
  },
};
