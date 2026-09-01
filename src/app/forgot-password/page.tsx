"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
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
    success("Recovery Link Sent", `If an account exists for ${email}, a reset link has been dispatched.`);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1F3A5F] flex items-center justify-center text-white font-black text-base shadow-sm">
            CS
          </div>
          <span className="font-extrabold text-xl sm:text-2xl text-[#172033] tracking-tight">
            CHUNAV SETU
          </span>
        </Link>
        <h2 className="text-xl font-bold text-[#172033]">
          Reset your password
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Enter your registered email address to receive password instructions.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card padding="lg">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="name@chunavsetu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#1F3A5F] hover:underline font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EAF3EE] text-[#2F6B4F] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#172033]">Check your email</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                We have sent password recovery instructions to <strong>{email}</strong>.
              </p>
              <Link href="/login" className="inline-block mt-4">
                <Button variant="outline" size="sm">
                  Return to login
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
