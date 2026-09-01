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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E2DC] px-2 py-1.5 flex items-center justify-around shadow-modal sm:hidden safe-area-bottom">
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
              className="flex flex-col items-center -mt-5"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95",
                  isActive
                    ? "bg-[#1F3A5F] text-white"
                    : "bg-[#1F3A5F] text-white"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold text-[#1F3A5F] mt-1">
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
              "flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors min-w-[54px]",
              isActive
                ? "text-[#1F3A5F] font-bold"
                : "text-[#64748B] hover:text-[#172033]"
            )}
          >
            <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
            <span className="text-[10px] mt-0.5">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
