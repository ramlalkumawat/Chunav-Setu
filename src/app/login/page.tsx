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
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-between">
      <DemoSwitcher />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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

          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-base">
              CS
            </div>
            <span className="font-bold text-2xl text-[#212529] tracking-tight">
              {t("appTitle")}
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#212529]">
            {t("signIn")}
          </h2>
          <p className="mt-1 text-sm text-[#6C757D]">
            Enter your credentials or click any demo role below for instant access
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md space-y-4">
          {/* Standard Auth Form Sheet */}
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-6 shadow-none">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full"
                isLoading={isSubmitting || isLoading}
              >
                {t("signIn")}
              </Button>
            </form>
          </div>

          {/* Instant Role Switching Sheet */}
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-5 shadow-none">
            <div className="flex items-center gap-2 pb-3 border-b border-[#DEE2E6] mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
              <p className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
                One-Click Demo Roles
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 text-sm">
              <button
                onClick={() => quickLoginDemo("super_admin")}
                className="flex items-center justify-between p-3 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[3px] bg-[#FFF3E0] text-[#E65100] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#212529]">Super Admin Console</p>
                    <p className="text-xs text-[#6C757D]">System overview, all clients, audit logs</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6C757D]" />
              </button>

              <button
                onClick={() => quickLoginDemo("client_1")}
                className="flex items-center justify-between p-3 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[3px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#212529]">Candidate 1: Rajesh Sharma</p>
                    <p className="text-xs text-[#6C757D]">Central Assembly • 4 Booths • 8 Volunteers</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6C757D]" />
              </button>

              <button
                onClick={() => quickLoginDemo("client_2")}
                className="flex items-center justify-between p-3 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#212529]">Candidate 2: Priya Verma</p>
                    <p className="text-xs text-[#6C757D]">North Ward • Isolated Data Sandbox</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6C757D]" />
              </button>

              <button
                onClick={() => quickLoginDemo("volunteer_1")}
                className="flex items-center justify-between p-3 bg-[#F8F9FA] hover:bg-[#F1ECEF] border border-[#DEE2E6] rounded-[4px] text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[3px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#212529]">Volunteer: Amit Kumar</p>
                    <p className="text-xs text-[#6C757D]">Mobile Field Survey • Booth 101</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6C757D]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
