"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DemoSwitcher } from "@/components/layout/DemoSwitcher";
import { useAuth } from "@/lib/context/auth-context";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, isLoading, quickLoginDemo } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <LoadingSpinner text="Authenticating Super Admin session..." />
      </div>
    );
  }

  // Super admin guard
  if (role !== "super_admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F7F7F7] text-center">
        <div className="w-12 h-12 rounded-[4px] bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] flex items-center justify-center mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-[#212529]">Elevated Permissions Required</h2>
        <p className="text-xs text-[#6C757D] max-w-sm mt-1 mb-4">
          The Super Admin console requires system administrator role. Switch below:
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="primary" onClick={() => quickLoginDemo("super_admin")}>
            Switch to Super Admin
          </Button>
          <Button size="sm" variant="secondary" onClick={() => quickLoginDemo("client_1")}>
            Back to Candidate 1
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <DemoSwitcher />
      <div className="flex-1 flex min-h-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full max-w-[1600px] mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
