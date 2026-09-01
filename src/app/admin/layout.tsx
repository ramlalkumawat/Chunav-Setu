"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/lib/context/auth-context";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, isLoading, quickLoginDemo } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F2]">
        <LoadingSpinner text="Authenticating Super Admin session..." />
      </div>
    );
  }

  // Super admin guard
  if (role !== "super_admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F7F6F2] text-center">
        <div className="w-16 h-16 rounded-full bg-[#FDF2F2] text-[#B94A48] flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#172033]">Access Restricted</h2>
        <p className="text-xs text-[#64748B] max-w-sm mt-1 mb-6">
          The Super Admin console requires elevated administrative permissions. You are currently logged in as a {role?.replace("_", " ")}.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => quickLoginDemo("super_admin")}>
            Switch to Super Admin
          </Button>
          <Button variant="outline" onClick={() => quickLoginDemo("client_1")}>
            Back to Client Portal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
