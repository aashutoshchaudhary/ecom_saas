import { api } from "./client";

export type WebsiteStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Website {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  domain: string | null;
  status: WebsiteStatus;
  structure: any;
  settings: Record<string, any>;
  seoConfig: Record<string, any>;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  pages?: Page[];
}

export interface Page {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  path: string;
  sections: any[];
  seoTitle: string | null;
  seoDescription: string | null;
  isHomepage: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const websitesApi = {
  list(params?: { page?: number; limit?: number }) {
    return api.get<{ data: Website[]; meta: any }>("/websites", params);
  },

  get(id: string) {
    return api.get<Website>(`/websites/${id}`);
  },

  create(data: { name: string; templateId?: string }) {
    return api.post<Website>("/websites", data);
  },

  update(id: string, data: Partial<Pick<Website, "name" | "settings" | "seoConfig">>) {
    return api.put<Website>(`/websites/${id}`, data);
  },

  updateStructure(id: string, structure: any) {
    return api.put<Website>(`/websites/${id}/structure`, structure);
  },

  publish(id: string) {
    return api.post<Website>(`/websites/${id}/publish`);
  },

  unpublish(id: string) {
    return api.post<Website>(`/websites/${id}/unpublish`);
  },

  delete(id: string) {
    return api.delete<void>(`/websites/${id}`);
  },

  // Pages
  listPages(websiteId: string) {
    return api.get<{ data: Page[]; meta: any }>(`/websites/${websiteId}/pages`);
  },

  createPage(websiteId: string, data: { title: string; slug?: string; isHomepage?: boolean; sections?: any[] }) {
    return api.post<Page>(`/websites/${websiteId}/pages`, data);
  },

  updatePage(websiteId: string, pageId: string, data: Partial<Pick<Page, "title" | "slug" | "seoTitle" | "seoDescription" | "isPublished" | "sortOrder">>) {
    return api.put<Page>(`/websites/${websiteId}/pages/${pageId}`, data);
  },

  updatePageSections(websiteId: string, pageId: string, sections: any[]) {
    return api.put<Page>(`/websites/${websiteId}/pages/${pageId}/sections`, { sections });
  },

  duplicatePage(websiteId: string, pageId: string) {
    return api.post<Page>(`/websites/${websiteId}/pages/${pageId}/duplicate`);
  },

  deletePage(websiteId: string, pageId: string) {
    return api.delete<void>(`/websites/${websiteId}/pages/${pageId}`);
  },
};
