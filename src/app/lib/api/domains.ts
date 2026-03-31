import { api } from "./client";

export type DomainType = "SUBDOMAIN" | "CUSTOM";
export type DomainStatus = "PENDING" | "ACTIVE" | "FAILED" | "EXPIRED";

export interface Domain {
  id: string;
  tenantId: string;
  websiteId: string;
  domain: string;
  type: DomainType;
  status: DomainStatus;
  sslStatus: "PENDING" | "ACTIVE" | "FAILED";
  dnsRecords: DnsRecord[];
  verifiedAt: string | null;
  expiresAt: string | null;
  autoRenew: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  status: "pending" | "active";
}

export const domainsApi = {
  list(params?: { websiteId?: string }) {
    return api.get<Domain[]>("/domains", params);
  },

  add(data: { websiteId: string; domain: string; type: DomainType }) {
    return api.post<Domain>("/domains", data);
  },

  verify(domainId: string) {
    return api.post<Domain>(`/domains/${domainId}/verify`);
  },

  checkDns(domainId: string) {
    return api.post<Domain>(`/domains/${domainId}/check-dns`);
  },

  renewSsl(domainId: string) {
    return api.post<Domain>(`/domains/${domainId}/renew-ssl`);
  },

  remove(domainId: string) {
    return api.delete<void>(`/domains/${domainId}`);
  },

  setPrimary(domainId: string) {
    return api.put<Domain>(`/domains/${domainId}/primary`);
  },
};
