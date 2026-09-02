"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useLanguage } from "@/lib/i18n";
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
  Vote,
  MessageSquare,
  X,
} from "lucide-react";

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { role, client } = useAuth();
  const { t } = useLanguage();

  const superAdminNav = [
    { key: "navDashboard", name: t("navDashboard"), href: "/admin", icon: LayoutDashboard },
    { key: "navClients", name: t("navClients"), href: "/admin/clients", icon: Building },
    { key: "navCampaigns", name: t("navCampaigns"), href: "/admin/campaigns", icon: Flag },
    { key: "navSubscriptions", name: t("navSubscriptions"), href: "/admin/subscriptions", icon: CreditCard },
    { key: "navAuditLogs", name: t("navAuditLogs"), href: "/admin/audit-logs", icon: History },
    { key: "navSettings", name: t("navSettings"), href: "/admin/settings", icon: Settings },
  ];

  const clientAdminNav = [
    { key: "navDashboard", name: t("navDashboard"), href: "/client", icon: LayoutDashboard },
    { key: "navCommunication", name: t("navCommunication"), href: "/client/communication", icon: MessageSquare },
    { key: "navPollingDay", name: t("navPollingDay"), href: "/client/polling-day", icon: Vote },
    { key: "navVoters", name: t("navVoters"), href: "/client/voters", icon: Users },
    { key: "navBooths", name: t("navBooths"), href: "/client/booths", icon: Building },
    { key: "navVolunteers", name: t("navVolunteers"), href: "/client/volunteers", icon: UserCheck },
    { key: "navTasks", name: t("navTasks"), href: "/client/tasks", icon: CheckSquare },
    { key: "navFieldWork", name: t("navFieldWork"), href: "/client/field-work", icon: Compass },
    { key: "navFollowUps", name: t("navFollowUps"), href: "/client/follow-ups", icon: Clock },
    { key: "navReports", name: t("navReports"), href: "/client/reports", icon: BarChart3 },
    { key: "navSettings", name: t("navSettings"), href: "/client/settings", icon: Settings },
  ];

  const navItems = role === "super_admin" ? superAdminNav : clientAdminNav;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#DEE2E6] flex flex-col transition-transform duration-150 lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-14 px-4 border-b border-[#DEE2E6] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[4px] bg-[#714B67] flex items-center justify-center text-white font-bold text-xs">
              CS
            </div>
            <div>
              <p className="font-bold text-[15px] text-[#212529] tracking-tight leading-tight">
                {t("appName")}
              </p>
              <p className="text-[11px] text-[#6C757D] font-medium leading-none">
                {role === "super_admin" ? t("superAdminPortal") : t("tagline")}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-[#6C757D] hover:text-[#212529] rounded"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Campaign Info Pill */}
        {client && role !== "super_admin" && (
          <div className="px-3.5 pt-3.5 pb-1">
            <div className="px-3 py-2 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
              <p className="text-[11px] uppercase font-semibold text-[#6C757D] tracking-wider">
                {t("candidate")}
              </p>
              <p className="text-[14px] font-bold text-[#212529] truncate">
                {client.candidate_name}
              </p>
              <p className="text-[12px] text-[#714B67] font-semibold truncate mt-0.5">
                {client.election_type} • {client.location}
              </p>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-[15px] font-medium transition-colors duration-100",
                  isActive
                    ? "bg-[#F1ECEF] text-[#714B67] font-semibold border-l-4 border-[#714B67]"
                    : "text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA]"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-[#714B67]" : "text-[#6C757D]")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Compact Footer */}
        <div className="px-4 py-3 border-t border-[#DEE2E6] text-xs text-[#6C757D] flex items-center justify-between bg-[#F8F9FA]">
          <span className="font-semibold">Chunav Setu v2.0</span>
          <span className="text-[#2E7D32] font-semibold flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] inline-block animate-pulse" />
            Live DB
          </span>
        </div>
      </aside>
    </>
  );
}
