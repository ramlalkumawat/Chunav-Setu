"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, CheckSquare, Clock, PlusCircle } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/volunteer", icon: Home },
    { name: "Voters", href: "/volunteer/voters", icon: Users },
    { name: "Survey", href: "/volunteer/survey", icon: PlusCircle, isPrimary: true },
    { name: "Tasks", href: "/volunteer/tasks", icon: CheckSquare },
    { name: "Follow-ups", href: "/volunteer/follow-ups", icon: Clock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#DEE2E6] px-2 py-1 flex items-center justify-around sm:hidden safe-area-bottom">
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
              className="flex flex-col items-center -mt-3"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-transform",
                  "bg-[#714B67] text-white border border-[#5E3E55]"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-[#714B67] mt-0.5">
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
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-[3px] transition-colors min-w-[50px]",
              isActive
                ? "text-[#714B67] font-semibold"
                : "text-[#6C757D] hover:text-[#212529]"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive ? "stroke-[2.5]" : "stroke-2")} />
            <span className="text-[10px] mt-0.5">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
