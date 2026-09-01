"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/lib/context/auth-context";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { ShieldAlert } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, client, isLoading, quickLoginDemo } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F2]">
        <LoadingSpinner text="Loading campaign workspace..." />
      </div>
    );
  }

  // Guard: allow client_admin and super_admin (in preview mode)
  if (!user || (role !== "client_admin" && role !== "super_admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F7F6F2] text-center">
        <div className="w-16 h-16 rounded-full bg-[#FEF7EC] text-[#B7791F] flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#172033]">Candidate Portal Access</h2>
        <p className="text-xs text-[#64748B] max-w-sm mt-1 mb-6">
          This portal requires candidate admin authorization. Switch to Candidate 1 (Rajesh Sharma) to proceed.
        </p>
        <Button onClick={() => quickLoginDemo("client_1")}>
          Log in as Candidate 1
        </Button>
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
