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
    { name: "Booths", href: "/client/booths", icon: Building },
    { name: "Volunteers", href: "/client/volunteers", icon: UserCheck },
    { name: "Tasks", href: "/client/tasks", icon: CheckSquare },
    { name: "Field Work", href: "/client/field-work", icon: Compass },
    { name: "Follow-ups", href: "/client/follow-ups", icon: Clock },
    { name: "Reports", href: "/client/reports", icon: BarChart3 },
    { name: "Settings", href: "/client/settings", icon: Settings },
  ];

  const navItems = role === "super_admin" ? superAdminNav : clientAdminNav;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-56 bg-white border-r border-[#DEE2E6] flex flex-col transition-transform duration-150 lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-12 px-4 border-b border-[#DEE2E6] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[3px] bg-[#714B67] flex items-center justify-center text-white font-bold text-xs">
              CS
            </div>
            <div>
              <p className="font-bold text-xs text-[#212529] tracking-tight leading-none">
                CHUNAV SETU
              </p>
              <p className="text-[10px] text-[#6C757D] font-medium mt-0.5">
                {role === "super_admin" ? "Enterprise Admin" : "Campaign ERP"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-[#6C757D] hover:text-[#212529] rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Campaign Info Pill (Compact) */}
        {client && role !== "super_admin" && (
          <div className="px-3 pt-3 pb-1">
            <div className="px-2.5 py-1.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px]">
              <p className="text-[10px] uppercase font-semibold text-[#6C757D] tracking-wider">
                Candidate
              </p>
              <p className="text-xs font-semibold text-[#212529] truncate">
                {client.candidate_name}
              </p>
              <p className="text-[10px] text-[#714B67] font-medium truncate">
                {client.election_type} • {client.location}
              </p>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-2 py-2.5 space-y-0.5 overflow-y-auto">
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
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[3px] text-xs font-medium transition-colors duration-100",
                  isActive
                    ? "bg-[#F1ECEF] text-[#714B67] font-semibold border-l-[3px] border-[#714B67]"
                    : "text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA]"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#714B67]" : "text-[#6C757D]")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Compact Footer */}
        <div className="px-3 py-2 border-t border-[#DEE2E6] text-[11px] text-[#6C757D] flex items-center justify-between bg-[#F8F9FA]">
          <span>Chunav Setu v1.0</span>
          <span className="text-[#2E7D32] font-medium flex items-center gap-1 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] inline-block" />
            Connected
          </span>
        </div>
      </aside>
    </>
  );
}
