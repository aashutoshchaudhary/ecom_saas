import { api } from "./client";

export type SubscriptionTier = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
export type TenantStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  logo: string | null;
  description: string | null;
  address: Record<string, any> | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  settings: Record<string, any>;
  subscription: SubscriptionTier;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  industries: TenantIndustry[];
}

export interface TenantIndustry {
  tenantId: string;
  industryId: string;
  isPrimary: boolean;
  config: Record<string, any>;
  industry?: { id: string; name: string; slug: string; icon: string };
}

export const tenantsApi = {
  list(params?: { page?: number; limit?: number }) {
    return api.get<{ data: Tenant[]; meta: any }>("/tenants", params);
  },

  get(id: string) {
    return api.get<Tenant>(`/tenants/${id}`);
  },

  create(data: { name: string; industry?: string; plan?: SubscriptionTier }) {
    return api.post<Tenant>("/tenants", data);
  },

  update(id: string, data: Partial<Pick<Tenant, "name" | "logo" | "description" | "address" | "phone" | "email" | "website">>) {
    return api.put<Tenant>(`/tenants/${id}`, data);
  },

  updateSettings(id: string, settings: Record<string, any>) {
    return api.put<Tenant>(`/tenants/${id}/settings`, settings);
  },

  updateSubscription(id: string, plan: SubscriptionTier) {
    return api.put<Tenant>(`/tenants/${id}/subscription`, { plan });
  },

  addIndustry(id: string, industryId: string, isPrimary?: boolean) {
    return api.post<TenantIndustry>(`/tenants/${id}/industries`, { industryId, isPrimary });
  },

  removeIndustry(id: string, industryId: string) {
    return api.delete<void>(`/tenants/${id}/industries/${industryId}`);
  },

  delete(id: string) {
    return api.delete<void>(`/tenants/${id}`);
  },
};
