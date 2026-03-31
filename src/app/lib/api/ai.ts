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

export interface AiJob {
  id: string;
  tenantId: string;
  type: string;
  status: string;
  input: any;
  output: any;
  creditsUsed: number;
  createdAt: string;
  completedAt: string | null;
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
  // AI Generation
  generateWebsite(data: AiGenerateRequest) {
    return api.post<AiJob>("/ai/generate/website", {
      websiteId: data.templateId || `ws-${Date.now()}`,
      industry: data.industry,
      businessName: data.businessName,
      description: data.description,
      preferences: { goals: data.goals },
    });
  },

  generatePage(data: { websiteId: string; pageType: string; industry: string; context?: any }) {
    return api.post<AiJob>("/ai/generate/page", data);
  },

  generateSection(data: { websiteId: string; pageId: string; sectionType: string; industry: string }) {
    return api.post<AiJob>("/ai/generate/section", data);
  },

  generateContent(data: { prompt: string; type: string; context?: string }) {
    return api.post<AiJob>("/ai/generate/content", {
      type: data.type || 'general',
      industry: 'general',
      topic: data.prompt,
      tone: 'professional',
      length: 'medium',
    });
  },

  generateImage(data: { prompt: string; style?: string; size?: string }) {
    return api.post<AiJob>("/ai/generate/image", data);
  },

  regenerate(jobId: string) {
    return api.post<AiJob>(`/ai/regenerate/${jobId}`);
  },

  // Jobs
  listJobs(params?: { status?: string; type?: string }) {
    return api.get<{ data: AiJob[]; meta: any }>("/ai/jobs", params);
  },

  getJob(jobId: string) {
    return api.get<AiJob>(`/ai/jobs/${jobId}`);
  },

  // Poll job until complete
  async waitForJob(jobId: string, maxWaitMs = 60000): Promise<AiJob> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const job = await this.getJob(jobId);
      if (job.status === 'COMPLETED' || job.status === 'FAILED') return job;
      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error('Job timed out');
  },

  // SEO
  seoAudit(websiteId: string) {
    return api.post<AiSeoAudit>(`/ai/generate/content`, {
      type: 'seo_audit',
      industry: 'general',
      topic: `SEO audit for website ${websiteId}`,
    });
  },

  suggestMeta(data: { pageTitle: string; pageContent: string }) {
    return api.post<{ title: string; description: string; keywords: string[] }>("/ai/generate/content", {
      type: 'seo_meta',
      industry: 'general',
      topic: `Generate SEO meta for: ${data.pageTitle}. Content: ${data.pageContent}`,
    });
  },

  // Versions
  listVersions(websiteId: string) {
    return api.get<AiVersion[]>(`/ai-versions/${websiteId}`);
  },

  restoreVersion(versionId: string) {
    return api.post<void>(`/ai-versions/${versionId}/restore`);
  },
};
