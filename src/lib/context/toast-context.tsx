"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast({ type: "success", title, message }), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast({ type: "error", title, message }), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast({ type: "warning", title, message }), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast({ type: "info", title, message }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          let bg = "bg-white border-[#E5E2DC] text-[#172033]";
          let Icon = Info;
          let iconColor = "text-[#1F3A5F]";

          if (toast.type === "success") {
            bg = "bg-[#F3FAF6] border-[#C3DEC9] text-[#172033]";
            Icon = CheckCircle2;
            iconColor = "text-[#2F6B4F]";
          } else if (toast.type === "error") {
            bg = "bg-[#FDF2F2] border-[#F7C6C6] text-[#172033]";
            Icon = AlertCircle;
            iconColor = "text-[#B94A48]";
          } else if (toast.type === "warning") {
            bg = "bg-[#FEF7EC] border-[#FBE3B8] text-[#172033]";
            Icon = AlertTriangle;
            iconColor = "text-[#B7791F]";
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-modal transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${bg}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                {toast.message && <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#64748B] hover:text-[#172033] p-1 rounded-md transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
