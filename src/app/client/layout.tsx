"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/context/auth-context";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { ShieldAlert } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, isLoading } = useAuth();
  const { language, t } = useLanguage();
  const isHindi = language === "hi";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] w-full">
        <LoadingSpinner text={isHindi ? "कैंपेन कार्यस्थान लोड हो रहा है..." : "Loading campaign workspace..."} />
      </div>
    );
  }

  // Guard: allow client_admin and super_admin
  if (!user || (role !== "client_admin" && role !== "super_admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F7F7F7] text-center w-full max-w-full">
        <div className="w-14 h-14 rounded-[4px] bg-[#FFF3E0] border border-[#FFE0B2] text-[#E65100] flex items-center justify-center mb-3.5">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-[#212529]">
          {isHindi ? "कैंपेन एक्सेस प्रतिबंधित" : "Campaign Access Restricted"}
        </h2>
        <p className="text-sm text-[#6C757D] max-w-md mt-1 mb-5">
          {isHindi
            ? "इस पोर्टल का उपयोग करने के लिए प्रत्याशी / एडमिन ऑथराइजेशन आवश्यक है।"
            : "This portal requires candidate admin authorization. Please sign in to proceed."}
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
