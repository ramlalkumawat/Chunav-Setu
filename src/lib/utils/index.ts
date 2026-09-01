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

/**
 * Odoo ERP status badge helper - subtle light backgrounds with crisp readable text
 */
export function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "active":
    case "completed":
    case "favorable":
    case "contacted":
    case "verified":
    case "resolved":
    case "delivered":
      return {
        bg: "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]",
        label: status.replace("_", " "),
      };
    case "pending":
    case "in_progress":
    case "undecided":
    case "trialing":
    case "follow_up":
    case "medium":
      return {
        bg: "bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]",
        label: status.replace("_", " "),
      };
    case "urgent":
    case "high":
    case "unfavorable":
    case "past_due":
    case "suspended":
    case "cancelled":
    case "overdue":
      return {
        bg: "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]",
        label: status.replace("_", " "),
      };
    case "assigned":
    case "info":
    case "canvassed":
      return {
        bg: "bg-[#E7F1FF] text-[#0D6EFD] border-[#B6D4FE]",
        label: status.replace("_", " "),
      };
    case "uncontacted":
    case "not_available":
    case "inactive":
    case "draft":
    case "none":
    default:
      return {
        bg: "bg-[#F8F9FA] text-[#495057] border-[#DEE2E6]",
        label: status.replace("_", " "),
      };
  }
}
