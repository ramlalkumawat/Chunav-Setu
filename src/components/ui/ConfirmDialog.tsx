"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Info } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const Icon = variant === "primary" ? Info : AlertTriangle;
  const iconColor =
    variant === "danger"
      ? "text-[#B94A48] bg-[#FDF2F2]"
      : variant === "warning"
      ? "text-[#B7791F] bg-[#FEF7EC]"
      : "text-[#1F3A5F] bg-[#EAEFF5]";

  const buttonVariant =
    variant === "danger" ? "danger" : variant === "warning" ? "primary" : "primary";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg flex-shrink-0 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mt-1">
          {message}
        </p>
      </div>
    </Modal>
  );
}
