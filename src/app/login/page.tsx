"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, UserCheck, Smartphone, Users, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, quickLoginDemo, isLoading } = useAuth();
  const { success, error: toastError } = useToast();

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
      success("Logged in successfully", `Welcome back!`);
    } else {
      toastError("Authentication failed", "Could not verify credentials. Try one-click demo login.");
    }
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
          Sign in to your campaign account
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Enter credentials or click any demo role below for instant access
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Standard Auth Card */}
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email or Mobile"
              type="email"
              placeholder="candidate@chunavsetu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-[#1F3A5F] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting || isLoading}
            >
              Sign In
            </Button>
          </form>
        </Card>

        {/* One-Click Demo Role Accounts Card */}
        <Card padding="md" className="border-[#1F3A5F]/30 bg-[#FAFAF8]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5E2DC] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#2F6B4F] animate-pulse" />
            <p className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Instant Demo Access
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              onClick={() => quickLoginDemo("super_admin")}
              className="flex items-center justify-between p-2.5 bg-white border border-[#E5E2DC] hover:border-[#1F3A5F] rounded-lg text-left transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#FEF7EC] text-[#B7791F] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#172033]">Super Admin Portal</p>
                  <p className="text-[10px] text-[#64748B]">All clients, system stats, subscriptions</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </button>

            <button
              onClick={() => quickLoginDemo("client_1")}
              className="flex items-center justify-between p-2.5 bg-white border border-[#E5E2DC] hover:border-[#1F3A5F] rounded-lg text-left transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#EAF3EE] text-[#2F6B4F] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#172033]">Candidate 1: Rajesh Sharma</p>
                  <p className="text-[10px] text-[#64748B]">Central Assembly • 4 Booths • 8 Volunteers</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </button>

            <button
              onClick={() => quickLoginDemo("client_2")}
              className="flex items-center justify-between p-2.5 bg-white border border-[#E5E2DC] hover:border-[#1F3A5F] rounded-lg text-left transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#172033]">Candidate 2: Priya Verma</p>
                  <p className="text-[10px] text-[#64748B]">North Ward • Isolated Data Sandbox</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </button>

            <button
              onClick={() => quickLoginDemo("volunteer_1")}
              className="flex items-center justify-between p-2.5 bg-white border border-[#E5E2DC] hover:border-[#1F3A5F] rounded-lg text-left transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#FDF2F2] text-[#B94A48] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#172033]">Volunteer: Amit Kumar</p>
                  <p className="text-[10px] text-[#64748B]">Mobile Field Survey • Booth 101 Canvassing</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
