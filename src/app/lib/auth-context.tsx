import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { authApi, type AuthUser, type RegisterPayload, type LoginPayload } from "./api/auth";
import { usersApi, type UserProfile } from "./api/users";
import { tenantsApi, type Tenant } from "./api/tenants";
import { getTokens, clearTokens, setTenantId, getTenantId } from "./api/client";

interface AuthState {
  user: UserProfile | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<{ mfaRequired?: boolean }>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  verifyMfa: (userId: string, code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Load user on mount if tokens exist
  useEffect(() => {
    const { accessToken } = getTokens();
    if (accessToken) {
      loadUser();
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const user = await usersApi.getProfile();
      let tenant: Tenant | null = null;

      // Load tenant
      const storedTenantId = getTenantId();
      if (storedTenantId) {
        try {
          tenant = await tenantsApi.get(storedTenantId);
        } catch {
          // Tenant might have been deleted, try to get first one
        }
      }

      if (!tenant) {
        try {
          const tenantsRes = await tenantsApi.list({ limit: 1 });
          if (tenantsRes.data.length > 0) {
            tenant = tenantsRes.data[0];
            setTenantId(tenant.id);
          }
        } catch {
          // No tenants yet
        }
      }

      setState({
        user,
        tenant,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch {
      clearTokens();
      setState({
        user: null,
        tenant: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setState((s) => ({ ...s, error: null, isLoading: true }));
    try {
      const result = await authApi.login(payload);
      if (result.mfaRequired) {
        setState((s) => ({ ...s, isLoading: false }));
        return { mfaRequired: true, userId: result.userId };
      }
      await loadUser();
      return {};
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message, isLoading: false }));
      throw err;
    }
  }, [loadUser]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setState((s) => ({ ...s, error: null, isLoading: true }));
    try {
      await authApi.register(payload);
      await loadUser();
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message, isLoading: false }));
      throw err;
    }
  }, [loadUser]);

  const verifyMfa = useCallback(async (userId: string, code: string) => {
    setState((s) => ({ ...s, error: null, isLoading: true }));
    try {
      await authApi.verifyMfa({ userId, code });
      await loadUser();
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message, isLoading: false }));
      throw err;
    }
  }, [loadUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Still clear local state even if API call fails
    }
    clearTokens();
    setState({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const switchTenant = useCallback(async (tenantId: string) => {
    const tenant = await tenantsApi.get(tenantId);
    setTenantId(tenant.id);
    setState((s) => ({ ...s, tenant }));
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        verifyMfa,
        refreshUser,
        switchTenant,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
