"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { UserProfile, UserRole, Client, Volunteer } from "../types";
import { useRouter } from "next/navigation";

interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole | null;
  client: Client | null;
  volunteer: Volunteer | null;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  // Load session from server API
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setRole(data.role);
          setClient(data.client);
          setVolunteer(data.volunteer);
          return;
        }
      }
      // If unauthenticated, clear state
      setUser(null);
      setRole(null);
      setClient(null);
      setVolunteer(null);
    } catch (err) {
      console.error("Session verification error:", err);
      setUser(null);
      setRole(null);
      setClient(null);
      setVolunteer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, email: identifier, password }),
        });

        const data = await res.json();

        if (res.ok && data.success && data.user) {
          setUser(data.user);
          setRole(data.user.role);

          // Fetch full session context (client, volunteer)
          await refreshSession();

          // Route to appropriate role dashboard
          if (data.user.role === "super_admin") {
            router.push("/admin");
          } else if (data.user.role === "volunteer") {
            router.push("/volunteer");
          } else {
            router.push("/client");
          }

          return { success: true };
        }

        return { success: false, error: data.error || "Authentication failed." };
      } catch (err: any) {
        console.error("Login request error:", err);
        return { success: false, error: err.message || "Network error. Please try again." };
      } finally {
        setIsLoading(false);
      }
    },
    [router, refreshSession]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      setUser(null);
      setRole(null);
      setClient(null);
      setVolunteer(null);
      setIsLoading(false);
      router.push("/login");
    }
  }, [router]);

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
        refreshSession,
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
