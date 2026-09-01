"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Footer } from "@/components/layout/Footer";
import { DemoSwitcher } from "@/components/layout/DemoSwitcher";
import { ShieldCheck, UserCheck, Smartphone, Users, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, quickLoginDemo, isLoading } = useAuth();
  const { success, error: toastError } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toastError("Email required", "Please enter your registered email address.");
      return;
    }
    setIsSubmitting(true);
    const ok = await login(email);
    setIsSubmitting(false);
    if (ok) {
      success("Authenticated", `Welcome back!`);
    } else {
      toastError("Authentication failed", "Could not verify credentials. Use one-click role below.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-between w-full max-w-full overflow-x-hidden">
      <DemoSwitcher />

      <div className="flex-1 flex flex-col justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-end mb-2">
            <div className="inline-flex items-center bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px] p-0.5">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-0.5 rounded-[2px] text-xs font-bold transition-colors ${
                  language === "en" ? "bg-[#714B67] text-white" : "text-[#6C757D]"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-0.5 rounded-[2px] text-xs font-bold transition-colors ${
                  language === "hi" ? "bg-[#714B67] text-white" : "text-[#6C757D]"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          <Link href="/" className="inline-flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              CS
            </div>
            <span className="font-bold text-xl sm:text-2xl text-[#212529] tracking-tight">
              {t("appTitle")}
            </span>
          </Link>
          <h2 className="text-lg sm:text-xl font-bold text-[#212529]">
            {t("signIn")}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#6C757D]">
            Enter your credentials or click any demo role below for instant access
          </p>
        </div>

        <div className="mt-5 sm:mt-6 sm:mx-auto sm:w-full sm:max-w-md space-y-4 w-full">
          {/* Standard Auth Form Sheet */}
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-6 shadow-none w-full">
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              <Input
                label="Email / Identifier"
                type="email"
                placeholder="candidate@chunavsetu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-[#6C757D]" />}
                required
              />

              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-[#6C757D]" />}
                  required
                />
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#714B67] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full h-11 text-[15px]"
                isLoading={isSubmitting || isLoading}
              >
                {t("signIn")}
              </Button>
            </form>
          </div>

          {/* Instant Role Switching Sheet */}
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-4 sm:p-5 shadow-none w-full">
            <div className="flex items-center gap-2 pb-2.5 sm:pb-3 border-b border-[#DEE2E6] mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
              <p className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
                One-Click Demo Roles
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:gap-2.5 text-sm">
              <button
                onClick={() => quickLoginDemo("super_admin")}
                className="flex items-center justify-between p-3 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors w-full min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[3px] bg-[#FFF3E0] text-[#E65100] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs sm:text-sm text-[#212529] truncate">Super Admin Console</p>
                    <p className="text-[11px] sm:text-xs text-[#6C757D] truncate">System overview, all clients, audit logs</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6C757D] flex-shrink-0 ml-1.5" />
              </button>

              <button
                onClick={() => quickLoginDemo("client_1")}
                className="flex items-center justify-between p-3 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors w-full min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[3px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs sm:text-sm text-[#212529] truncate">Candidate 1: Rajesh Sharma</p>
                    <p className="text-[11px] sm:text-xs text-[#6C757D] truncate">Central Assembly • 4 Booths • 8 Volunteers</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6C757D] flex-shrink-0 ml-1.5" />
              </button>

              <button
                onClick={() => quickLoginDemo("client_2")}
                className="flex items-center justify-between p-3 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors w-full min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs sm:text-sm text-[#212529] truncate">Candidate 2: Priya Verma</p>
                    <p className="text-[11px] sm:text-xs text-[#6C757D] truncate">North Ward • Isolated Data Sandbox</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6C757D] flex-shrink-0 ml-1.5" />
              </button>

              <button
                onClick={() => quickLoginDemo("volunteer_1")}
                className="flex items-center justify-between p-3 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors w-full min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[3px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs sm:text-sm text-[#212529] truncate">Volunteer: Amit Kumar</p>
                    <p className="text-[11px] sm:text-xs text-[#6C757D] truncate">Mobile Field Survey • Booth 101</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6C757D] flex-shrink-0 ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
