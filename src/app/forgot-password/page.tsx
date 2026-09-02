"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { success } = useToast();
  const { language, t } = useLanguage();
  const isHindi = language === "hi";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    success(
      isHindi ? "पासवर्ड रीसेट लिंक भेजा गया" : "Recovery Link Dispatched",
      isHindi
        ? `यदि ${email} पंजीकृत है, तो पासवर्ड रीसेट निर्देश भेज दिए गए हैं।`
        : `If an account exists for ${email}, a reset link has been sent.`
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-between w-full max-w-full overflow-x-hidden">
      <div className="flex-1 flex flex-col justify-center py-8 sm:py-16 px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
              CS
            </div>
            <span className="font-bold text-2xl text-[#212529] tracking-tight">
              {t("appTitle")}
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#212529]">
            {isHindi ? "पासवर्ड रीसेट करें" : "Reset your password"}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#6C757D]">
            {isHindi
              ? "पासवर्ड निर्देश प्राप्त करने के लिए अपना पंजीकृत ईमेल दर्ज करें।"
              : "Enter your registered email address to receive password instructions."}
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md w-full">
          <div className="bg-white border border-[#DEE2E6] rounded-[6px] p-5 sm:p-7 shadow-sm w-full">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={isHindi ? "पंजीकृत ईमेल" : "Registered Email"}
                  type="email"
                  placeholder="name@chunavsetu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-[#6C757D]" />}
                  required
                />

                <Button type="submit" variant="primary" size="md" className="w-full h-11 text-[15px] font-bold">
                  {isHindi ? "रीसेट लिंक भेजें" : "Send Reset Link"}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#714B67] hover:underline font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{isHindi ? "लॉगिन पर वापस जाएं" : "Back to login"}</span>
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#212529]">
                  {isHindi ? "अपना ईमेल चेक करें" : "Check your email"}
                </h4>
                <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed">
                  {isHindi
                    ? `पासवर्ड रीसेट निर्देश ${email} पर भेज दिए गए हैं।`
                    : `Password recovery instructions have been sent to ${email}.`}
                </p>
                <Link href="/login" className="inline-block mt-4">
                  <Button variant="secondary" size="md">
                    {isHindi ? "लॉगिन पर लौटें" : "Return to sign in"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
