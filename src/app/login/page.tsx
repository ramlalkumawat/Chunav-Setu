"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Footer } from "@/components/layout/Footer";
import { Lock, User, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { success, error: toastError } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const isHindi = language === "hi";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toastError(
        isHindi ? "यूज़रनेम आवश्यक है" : "Username required",
        isHindi ? "कृपया अपना यूज़रनेम या ईमेल दर्ज करें।" : "Please enter your registered username or email."
      );
      return;
    }
    if (!password) {
      toastError(
        isHindi ? "पासवर्ड आवश्यक है" : "Password required",
        isHindi ? "कृपया अपना पासवर्ड दर्ज करें।" : "Please enter your password."
      );
      return;
    }

    setIsSubmitting(true);
    const result = await login(identifier.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      success(
        isHindi ? "सफलतापूर्वक लॉगिन" : "Authenticated",
        isHindi ? "चुनाव सेतु में आपका स्वागत है!" : "Welcome to Chunav Setu!"
      );
    } else {
      toastError(
        isHindi ? "लॉगिन विफल" : "Authentication Failed",
        result.error || (isHindi ? "अमान्य क्रेडेंशियल्स।" : "Invalid username/email or password.")
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-between w-full max-w-full overflow-x-hidden">
      <div className="flex-1 flex flex-col justify-center py-8 sm:py-16 px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          {/* Language Switcher */}
          <div className="flex justify-end mb-3">
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
            <div className="w-10 h-10 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
              CS
            </div>
            <span className="font-bold text-2xl text-[#212529] tracking-tight">
              {t("appTitle")}
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#212529]">
            {t("signIn")}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#6C757D]">
            {isHindi 
              ? "अपने चुनाव अभियान कार्यस्थान में प्रवेश करें" 
              : "Access your election campaign management workspace"}
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md space-y-4 w-full">
          {/* Main Auth Form Card */}
          <div className="bg-white border border-[#DEE2E6] rounded-[6px] p-5 sm:p-7 shadow-sm w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={isHindi ? "यूज़रनेम / ईमेल" : "Username or Email"}
                type="text"
                placeholder={isHindi ? "अपना यूज़रनेम या ईमेल दर्ज करें" : "Enter username or email"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-[#6C757D]" />}
                required
                autoComplete="username"
              />

              <div className="space-y-1.5">
                <Input
                  label={isHindi ? "पासवर्ड" : "Password"}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-[#6C757D]" />}
                  required
                  autoComplete="current-password"
                />
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#714B67] hover:underline"
                  >
                    {isHindi ? "पासवर्ड भूल गए?" : "Forgot password?"}
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full h-11 text-[15px] font-bold mt-2"
                isLoading={isSubmitting || isLoading}
              >
                {t("signIn")}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#DEE2E6] text-center">
              <p className="text-xs text-[#6C757D] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2F6B4F]" />
                <span>
                  {isHindi 
                    ? "सुरक्षित मल्टी-टेनेंट ऑथेंटिकेशन" 
                    : "Secure Enterprise Multi-Tenant Access"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
