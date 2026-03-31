import { api, getTokens, getTenantId } from "./client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export interface MediaFile {
  id: string;
  tenantId: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  folder: string;
  createdAt: string;
}

export const mediaApi = {
  list(params?: { folder?: string; page?: number; limit?: number }) {
    return api.get<{ data: MediaFile[]; meta: any }>("/media", params);
  },

  async upload(file: File, folder?: string): Promise<MediaFile> {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);

    const { accessToken } = getTokens();
    const tenantId = getTenantId();

    const headers: Record<string, string> = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    if (tenantId) headers["X-Tenant-ID"] = tenantId;

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Upload failed");
    return json.data;
  },

  delete(id: string) {
    return api.delete<void>(`/media/${id}`);
  },
};
