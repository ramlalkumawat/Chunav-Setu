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
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole, targetClientId?: string, volunteerId?: string) => void;
  quickLoginDemo: (roleType: "super_admin" | "client_1" | "client_2" | "volunteer_1") => void;
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

  // Load session from storage on mount
  useEffect(() => {
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
        // Default seed to Super Admin session for immediate evaluation convenience
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
  }, []);

  const login = useCallback(async (email: string, forceRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const profiles = dbService.getProfiles();
      let matchedProfile = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

      if (!matchedProfile && forceRole) {
        matchedProfile = profiles.find((p) => p.role === forceRole);
      }

      if (!matchedProfile) {
        // Fallback default
        matchedProfile = {
          id: `user-${Date.now()}`,
          email,
          full_name: email.split("@")[0].replace(".", " "),
          role: forceRole || "client_admin",
          client_id: "client-1",
          status: "active",
          created_at: new Date().toISOString(),
        };
      }

      setUser(matchedProfile);
      setRole(matchedProfile.role);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedProfile));

      if (matchedProfile.client_id) {
        const clientData = dbService.getClientById(matchedProfile.client_id);
        setClient(clientData || null);

        if (matchedProfile.role === "volunteer") {
          const vols = dbService.getVolunteers(matchedProfile.client_id);
          const vol = vols.find((v) => v.user_id === matchedProfile?.id || v.email === matchedProfile?.email);
          setVolunteer(vol || (vols.length > 0 ? vols[0] : null));
        }
      } else {
        setClient(null);
        setVolunteer(null);
      }

      // Role-based redirection
      if (matchedProfile.role === "super_admin") {
        router.push("/admin");
      } else if (matchedProfile.role === "volunteer") {
        router.push("/volunteer");
      } else {
        router.push("/client");
      }

      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    setClient(null);
    setVolunteer(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push("/login");
  }, [router]);

  const switchRole = useCallback(
    (newRole: UserRole, targetClientId?: string, volunteerId?: string) => {
      const profiles = dbService.getProfiles();
      let targetUser: UserProfile | undefined;

      if (newRole === "super_admin") {
        targetUser = profiles.find((p) => p.role === "super_admin");
      } else if (newRole === "client_admin") {
        targetUser = profiles.find((p) => p.role === "client_admin" && (!targetClientId || p.client_id === targetClientId));
      } else if (newRole === "volunteer") {
        targetUser = profiles.find((p) => p.role === "volunteer" && (!targetClientId || p.client_id === targetClientId));
      }

      if (targetUser) {
        setUser(targetUser);
        setRole(targetUser.role);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));

        if (targetUser.client_id) {
          const clientData = dbService.getClientById(targetUser.client_id);
          setClient(clientData || null);

          if (targetUser.role === "volunteer") {
            const vols = dbService.getVolunteers(targetUser.client_id);
            const vol = volunteerId ? vols.find((v) => v.id === volunteerId) : vols[0];
            setVolunteer(vol || null);
          } else {
            setVolunteer(null);
          }
        } else {
          setClient(null);
          setVolunteer(null);
        }

        if (newRole === "super_admin") router.push("/admin");
        else if (newRole === "volunteer") router.push("/volunteer");
        else router.push("/client");
      }
    },
    [router]
  );

  const quickLoginDemo = useCallback(
    (roleType: "super_admin" | "client_1" | "client_2" | "volunteer_1") => {
      if (roleType === "super_admin") {
        switchRole("super_admin");
      } else if (roleType === "client_1") {
        switchRole("client_admin", "client-1");
      } else if (roleType === "client_2") {
        switchRole("client_admin", "client-2");
      } else if (roleType === "volunteer_1") {
        switchRole("volunteer", "client-1", "vol-1");
      }
    },
    [switchRole]
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
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
