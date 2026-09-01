import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatNumber(num?: number | null): string {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
}

export function getInitials(name: string): string {
  if (!name) return "CS";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "active":
    case "completed":
    case "favorable":
    case "contacted":
      return {
        bg: "bg-[#EAF3EE] text-[#2F6B4F] border-[#C3DEC9]",
        label: status.replace("_", " "),
      };
    case "pending":
    case "in_progress":
    case "undecided":
    case "trialing":
      return {
        bg: "bg-[#FEF7EC] text-[#B7791F] border-[#FBE3B8]",
        label: status.replace("_", " "),
      };
    case "urgent":
    case "high":
    case "unfavorable":
    case "past_due":
    case "suspended":
    case "cancelled":
      return {
        bg: "bg-[#FDF2F2] text-[#B94A48] border-[#F7C6C6]",
        label: status.replace("_", " "),
      };
    case "uncontacted":
    case "not_available":
    case "inactive":
    case "draft":
    default:
      return {
        bg: "bg-[#F1F3F5] text-[#64748B] border-[#E2E8F0]",
        label: status.replace("_", " "),
      };
  }
}
