import type { AppProviderProps, UserInfo } from "../types/types";
import { AppContext } from "../context/AppContext";
import { useState, useEffect, useCallback } from "react";
import api from "../axios";

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true); // ✅ Added loading state

  // ✅ Fetch user info from /api/user
  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/user", { withCredentials: true });
      const userData: UserInfo = {
        ...res.data.user,
        roles: res.data.roles,
        permissions: res.data.permissions,
      };
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false); // ✅ Always stop loading
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refresh = () => {
    fetchUser();
  };

  const can = (permission: string) => user?.permissions.includes(permission) ?? false;
  const canAny = (perms: string[]) => perms.some((p) => user?.permissions.includes(p));
  const hasRole = (role: string) => user?.roles.includes(role) ?? false;
  const hasAnyRole = (roles: string[]) => roles.some((r) => user?.roles.includes(r));

  const value = {
    user,
    setUser,
    refresh,
    fetchUser,
    can,
    canAny,
    hasRole,
    hasAnyRole,
    loading, // ✅ Expose loading state to consumers
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};