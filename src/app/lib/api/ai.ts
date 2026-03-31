import { api } from "./client";

export interface AiVersion {
  id: string;
  websiteId: string;
  name: string;
  thumbnail: string | null;
  status: "current" | "published" | "draft";
  structure: any;
  createdAt: string;
}

export interface AiGenerateRequest {
  businessName: string;
  industry: string;
  description: string;
  goals: string;
  templateId?: string;
}

export interface AiSeoAudit {
  overallScore: number;
  pages: AiSeoPageResult[];
  suggestions: string[];
}

export interface AiSeoPageResult {
  path: string;
  title: string;
  score: number;
  issues: { type: string; message: string; severity: "error" | "warning" | "info" }[];
}

export const aiApi = {
  generateWebsite(data: AiGenerateRequest) {
    return api.post<{ websiteId: string; pages: any[] }>("/ai/generate", data);
  },

  generateContent(data: { prompt: string; type: string; context?: string }) {
    return api.post<{ content: string }>("/ai/content", data);
  },

  generateImage(data: { prompt: string; style?: string; size?: string }) {
    return api.post<{ url: string }>("/ai/image", data);
  },

  seoAudit(websiteId: string) {
    return api.post<AiSeoAudit>(`/ai/seo-audit/${websiteId}`);
  },

  suggestMeta(data: { pageTitle: string; pageContent: string }) {
    return api.post<{ title: string; description: string; keywords: string[] }>("/ai/suggest-meta", data);
  },

  // Versions
  listVersions(websiteId: string) {
    return api.get<AiVersion[]>(`/ai-versions/${websiteId}`);
  },

  restoreVersion(versionId: string) {
    return api.post<void>(`/ai-versions/${versionId}/restore`);
  },
};
