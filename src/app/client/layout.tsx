"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DemoSwitcher } from "@/components/layout/DemoSwitcher";
import { useAuth } from "@/lib/context/auth-context";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { ShieldAlert } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, isLoading, quickLoginDemo } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <LoadingSpinner text="Loading campaign ERP workspace..." />
      </div>
    );
  }

  // Guard: allow client_admin and super_admin (in preview mode)
  if (!user || (role !== "client_admin" && role !== "super_admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F7F7F7] text-center">
        <div className="w-14 h-14 rounded-[4px] bg-[#FFF3E0] border border-[#FFE0B2] text-[#E65100] flex items-center justify-center mb-3.5">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-[#212529]">Campaign Access Restricted</h2>
        <p className="text-sm text-[#6C757D] max-w-md mt-1 mb-5">
          This portal requires candidate admin authorization. Switch to Candidate 1 (Rajesh Sharma) to proceed.
        </p>
        <Button size="md" variant="primary" onClick={() => quickLoginDemo("client_1")}>
          Log in as Candidate 1
        </Button>
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
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
