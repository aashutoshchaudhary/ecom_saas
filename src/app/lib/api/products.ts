import { api, PaginatedResponse } from "./client";

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  category: string;
  status: "active" | "draft" | "archived";
  images: string[];
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  sales: number;
  revenue: number;
  variants: ProductVariant[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  image: string | null;
}

export const productsApi = {
  list(params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }) {
    return api.get<PaginatedResponse<Product>>("/products", params);
  },

  get(id: string) {
    return api.get<Product>(`/products/${id}`);
  },

  create(data: Partial<Product>) {
    return api.post<Product>("/products", data);
  },

  update(id: string, data: Partial<Product>) {
    return api.put<Product>(`/products/${id}`, data);
  },

  delete(id: string) {
    return api.delete<void>(`/products/${id}`);
  },

  // Variants
  listVariants(productId: string) {
    return api.get<ProductVariant[]>(`/products/${productId}/variants`);
  },

  createVariant(productId: string, data: Partial<ProductVariant>) {
    return api.post<ProductVariant>(`/products/${productId}/variants`, data);
  },

  updateVariant(productId: string, variantId: string, data: Partial<ProductVariant>) {
    return api.put<ProductVariant>(`/products/${productId}/variants/${variantId}`, data);
  },

  deleteVariant(productId: string, variantId: string) {
    return api.delete<void>(`/products/${productId}/variants/${variantId}`);
  },

  // Bulk operations
  bulkUpdateStock(items: { productId: string; stock: number }[]) {
    return api.post<void>("/products/bulk/stock", { items });
  },

  bulkUpdateStatus(productIds: string[], status: Product["status"]) {
    return api.post<void>("/products/bulk/status", { productIds, status });
  },
};
