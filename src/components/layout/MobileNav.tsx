"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Home, Users, CheckSquare, Clock, PlusCircle, Vote } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { name: t("navDashboard"), href: "/volunteer", icon: Home },
    { name: t("navPollingDay"), href: "/volunteer/polling-day", icon: Vote },
    { name: t("navSurvey"), href: "/volunteer/survey", icon: PlusCircle, isPrimary: true },
    { name: t("navVoters"), href: "/volunteer/voters", icon: Users },
    { name: t("navTasks"), href: "/volunteer/tasks", icon: CheckSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#DEE2E6] px-3 py-1.5 flex items-center justify-around sm:hidden safe-area-bottom shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/volunteer" && pathname.startsWith(item.href));

        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center -mt-4"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform",
                  "bg-[#714B67] text-white border-2 border-white"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-bold text-[#714B67] mt-0.5">
                {item.name}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2 rounded-[3px] transition-colors min-w-[56px]",
              isActive
                ? "text-[#714B67] font-bold"
                : "text-[#6C757D] hover:text-[#212529]"
            )}
          >
            <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
            <span className="text-[11px] mt-0.5 font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
