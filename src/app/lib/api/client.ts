/**
 * Base API client with JWT auth, token refresh, and error handling.
 * All API calls go through the API Gateway at port 3000.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Token Management ────────────────────────────────────────────────────────

const TOKEN_KEY = "sf_access_token";
const REFRESH_KEY = "sf_refresh_token";
const TENANT_KEY = "sf_tenant_id";

let refreshPromise: Promise<string | null> | null = null;

export function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  return {
    accessToken: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
  };
}

export function setTokens(tokens: TokenPair) {
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(TENANT_KEY);
}

export function getTenantId(): string | null {
  return localStorage.getItem(TENANT_KEY);
}

export function setTenantId(id: string) {
  localStorage.setItem(TENANT_KEY, id);
}

// ─── Token Refresh ───────────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      window.location.href = "/auth";
      return null;
    }

    const json: ApiResponse<TokenPair & { userId: string }> = await res.json();
    if (json.success && json.data) {
      setTokens({
        accessToken: json.data.accessToken,
        refreshToken: json.data.refreshToken,
        expiresIn: json.data.expiresIn,
      });
      return json.data.accessToken;
    }
    return null;
  } catch {
    clearTokens();
    return null;
  }
}

// ─── Core Fetch ──────────────────────────────────────────────────────────────

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  noAuth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, noAuth, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${API_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, String(value));
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!noAuth) {
    let { accessToken } = getTokens();

    // If no token, redirect to auth
    if (!accessToken) {
      window.location.href = "/auth";
      throw new ApiClientError(401, "UNAUTHORIZED", "No access token");
    }

    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const tenantId = getTenantId();
  if (tenantId) {
    headers["X-Tenant-ID"] = tenantId;
  }

  // Make request
  let res = await fetch(url, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 - try refresh
  if (res.status === 401 && !noAuth) {
    // Deduplicate concurrent refresh calls
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, {
        ...fetchOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      window.location.href = "/auth";
      throw new ApiClientError(401, "UNAUTHORIZED", "Session expired");
    }
  }

  // Parse response
  const json: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    error: { code: "PARSE_ERROR", message: "Failed to parse response" },
  }));

  if (!res.ok || !json.success) {
    throw new ApiClientError(
      res.status,
      json.error?.code || "UNKNOWN_ERROR",
      json.error?.message || `Request failed with status ${res.status}`,
      json.error?.details
    );
  }

  return json.data as T;
}

// ─── Convenience Methods ─────────────────────────────────────────────────────

export const api = {
  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
    return apiRequest<T>(path, { method: "GET", params });
  },

  post<T>(path: string, body?: unknown) {
    return apiRequest<T>(path, { method: "POST", body });
  },

  put<T>(path: string, body?: unknown) {
    return apiRequest<T>(path, { method: "PUT", body });
  },

  patch<T>(path: string, body?: unknown) {
    return apiRequest<T>(path, { method: "PATCH", body });
  },

  delete<T>(path: string) {
    return apiRequest<T>(path, { method: "DELETE" });
  },
};
