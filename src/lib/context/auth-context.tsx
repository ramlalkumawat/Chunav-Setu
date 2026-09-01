"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { UserProfile, UserRole, Client, Volunteer } from "../types";
import { dbService } from "../store/data-service";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole | null;
  client: Client | null;
  volunteer: Volunteer | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole, targetClientId?: string, volunteerId?: string) => void;
  quickLoginDemo: (roleType: "super_admin" | "client_1" | "client_2" | "volunteer_1") => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "chunav_auth_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();
  const pathname = usePathname();

  // Load session from server API with fallback to local state
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            setRole(data.role);
            setClient(data.client);
            setVolunteer(data.volunteer);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Session check fallback to local storage:", err);
      }

      // Fallback local seed for offline/dev
      try {
        const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedSession) {
          const parsedUser: UserProfile = JSON.parse(savedSession);
          setUser(parsedUser);
          setRole(parsedUser.role);

          if (parsedUser.client_id) {
            const clientData = dbService.getClientById(parsedUser.client_id);
            setClient(clientData || null);

            if (parsedUser.role === "volunteer") {
              const vols = dbService.getVolunteers(parsedUser.client_id);
              const vol = vols.find((v) => v.user_id === parsedUser.id || v.email === parsedUser.email);
              setVolunteer(vol || (vols.length > 0 ? vols[0] : null));
            }
          }
        } else {
          const defaultUser = dbService.getProfiles().find((p) => p.role === "client_admin") || dbService.getProfiles()[0];
          if (defaultUser) {
            setUser(defaultUser);
            setRole(defaultUser.role);
            if (defaultUser.client_id) {
              const c = dbService.getClientById(defaultUser.client_id);
              setClient(c || null);
            }
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
          }
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = useCallback(async (email: string, forceRole?: UserRole, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Server-side auth request
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "Chunav@2026", forceRole }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setRole(data.user.role);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));

          if (data.user.client_id) {
            const clientData = dbService.getClientById(data.user.client_id);
            setClient(clientData || null);

            if (data.user.role === "volunteer") {
              const vols = dbService.getVolunteers(data.user.client_id);
              const vol = vols.find((v: any) => v.user_id === data.user?.id || v.email === data.user?.email);
              setVolunteer(vol || (vols.length > 0 ? vols[0] : null));
            }
          } else {
            setClient(null);
            setVolunteer(null);
          }

          if (data.user.role === "super_admin") {
            router.push("/admin");
          } else if (data.user.role === "volunteer") {
            router.push("/volunteer");
          } else {
            router.push("/client");
          }

          return true;
        }
      }

      // Fallback
      const profiles = dbService.getProfiles();
      let matchedProfile = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || profiles.find((p) => p.role === forceRole) || profiles[0];
      setUser(matchedProfile);
      setRole(matchedProfile.role);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedProfile));
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout API call error:", e);
    }
    setUser(null);
    setRole(null);
    setClient(null);
    setVolunteer(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push("/login");
  }, [router]);

  const quickLoginDemo = useCallback(async (roleType: "super_admin" | "client_1" | "client_2" | "volunteer_1") => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleType }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setRole(data.user.role);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));

          if (data.user.client_id) {
            const clientData = dbService.getClientById(data.user.client_id);
            setClient(clientData || null);

            if (data.user.role === "volunteer") {
              const vols = dbService.getVolunteers(data.user.client_id);
              const vol = vols.find((v: any) => v.user_id === data.user?.id || v.email === data.user?.email);
              setVolunteer(vol || (vols.length > 0 ? vols[0] : null));
            } else {
              setVolunteer(null);
            }
          } else {
            setClient(null);
            setVolunteer(null);
          }

          if (data.user.role === "super_admin") {
            router.push("/admin");
          } else if (data.user.role === "volunteer") {
            router.push("/volunteer");
          } else {
            router.push("/client");
          }
          return;
        }
      }
    } catch (err) {
      console.error("Quick demo login error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const switchRole = useCallback(
    (newRole: UserRole, targetClientId?: string) => {
      if (newRole === "super_admin") {
        quickLoginDemo("super_admin");
      } else if (newRole === "volunteer") {
        quickLoginDemo("volunteer_1");
      } else if (targetClientId === "client-2") {
        quickLoginDemo("client_2");
      } else {
        quickLoginDemo("client_1");
      }
    },
    [quickLoginDemo]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        client,
        volunteer,
        isLoading,
        login,
        logout,
        switchRole,
        quickLoginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
