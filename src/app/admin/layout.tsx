"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/context/auth-context";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, isLoading } = useAuth();
  const { language, t } = useLanguage();
  const isHindi = language === "hi";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] w-full">
        <LoadingSpinner text={isHindi ? "सुपर एडमिन कंसोल लोड हो रहा है..." : "Authenticating Super Admin session..."} />
      </div>
    );
  }

  // Super admin guard
  if (role !== "super_admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F7F7F7] text-center w-full max-w-full">
        <div className="w-14 h-14 rounded-[4px] bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] flex items-center justify-center mb-3.5">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-[#212529]">
          {isHindi ? "उच्चस्तरीय अनुमतियाँ आवश्यक हैं" : "Super Admin Privileges Required"}
        </h2>
        <p className="text-sm text-[#6C757D] max-w-md mt-1 mb-5">
          {isHindi
            ? "सुपर एडमिन कंसोल का उपयोग करने के लिए सिस्टम एडमिनिस्ट्रेटर लॉगिन आवश्यक है।"
            : "The Super Admin console requires system administrator authorization."}
        </p>
        <Link href="/login">
          <Button size="md" variant="primary">
            {t("signIn")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col w-full max-w-full overflow-x-hidden">
      <div className="flex-1 flex min-h-0 w-full max-w-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full max-w-[1600px] mx-auto min-w-0">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
