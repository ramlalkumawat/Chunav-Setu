"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building,
  UserCheck,
  CheckSquare,
  Compass,
  Clock,
  BarChart3,
  Settings,
  Shield,
  CreditCard,
  History,
  Flag,
  FileSpreadsheet,
  X,
} from "lucide-react";

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { role, client } = useAuth();

  const superAdminNav = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Clients", href: "/admin/clients", icon: Building },
    { name: "Campaigns", href: "/admin/campaigns", icon: Flag },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Activity Logs", href: "/admin/audit-logs", icon: History },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  const clientAdminNav = [
    { name: "Dashboard", href: "/client", icon: LayoutDashboard },
    { name: "Voters", href: "/client/voters", icon: Users },
    { name: "Booths & Areas", href: "/client/booths", icon: Building },
    { name: "Volunteers", href: "/client/volunteers", icon: UserCheck },
    { name: "Tasks", href: "/client/tasks", icon: CheckSquare },
    { name: "Field Work", href: "/client/field-work", icon: Compass },
    { name: "Follow-ups", href: "/client/follow-ups", icon: Clock },
    { name: "Reports", href: "/client/reports", icon: BarChart3 },
    { name: "Campaign Settings", href: "/client/settings", icon: Settings },
  ];

  const navItems = role === "super_admin" ? superAdminNav : clientAdminNav;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#172033]/40 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#E5E2DC] flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 border-b border-[#E5E2DC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1F3A5F] flex items-center justify-center text-white font-black text-sm">
              CS
            </div>
            <div>
              <p className="font-bold text-sm text-[#172033] leading-none">CHUNAV SETU</p>
              <p className="text-[10px] text-[#64748B] mt-1 font-medium">
                {role === "super_admin" ? "Super Admin Portal" : "Campaign Command"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-[#64748B] hover:text-[#172033]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tenant Summary Pill (If Client Admin) */}
        {client && role !== "super_admin" && (
          <div className="px-4 pt-4 pb-1">
            <div className="p-2.5 bg-[#F7F6F2] border border-[#E5E2DC] rounded-lg">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                Active Candidate
              </p>
              <p className="text-xs font-bold text-[#172033] truncate mt-0.5">
                {client.candidate_name}
              </p>
              <p className="text-[11px] text-[#1F3A5F] font-medium truncate">
                {client.election_type} • {client.location}
              </p>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && item.href !== "/client" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#1F3A5F] text-white shadow-sm font-semibold"
                    : "text-[#64748B] hover:text-[#172033] hover:bg-[#F7F6F2]"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-[#64748B]")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / App Details */}
        <div className="p-4 border-t border-[#E5E2DC] text-[11px] text-[#64748B] flex items-center justify-between">
          <span>Enterprise SaaS</span>
          <span className="text-[#2F6B4F] font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2F6B4F] inline-block animate-pulse" />
            RLS Active
          </span>
        </div>
      </aside>
    </>
  );
}
