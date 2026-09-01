"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Footer } from "@/components/layout/Footer";
import { DemoSwitcher } from "@/components/layout/DemoSwitcher";
import { useToast } from "@/lib/context/toast-context";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    success("Recovery Link Dispatched", `If an account exists for ${email}, a reset link has been sent.`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-between">
      <DemoSwitcher />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-base">
              CS
            </div>
            <span className="font-bold text-2xl text-[#212529] tracking-tight">
              Chunav Setu ERP
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#212529]">
            Reset your password
          </h2>
          <p className="mt-1 text-sm text-[#6C757D]">
            Enter your registered email address to receive password instructions.
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] p-6 shadow-none">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="name@chunavsetu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-[#6C757D]" />}
                  required
                />

                <Button type="submit" variant="primary" size="md" className="w-full">
                  Send Reset Link
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-[#714B67] hover:underline font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to login</span>
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#212529]">Check your email</h4>
                <p className="text-sm text-[#6C757D] leading-relaxed">
                  Password recovery instructions have been sent to <strong>{email}</strong>.
                </p>
                <Link href="/login" className="inline-block mt-4">
                  <Button variant="secondary" size="md">
                    Return to sign in
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
