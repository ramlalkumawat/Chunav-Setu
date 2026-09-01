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
  cancelText = "Discard",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const Icon = variant === "primary" ? Info : AlertTriangle;
  const iconColor =
    variant === "danger"
      ? "text-[#C62828] bg-[#FFEBEE] border-[#FFCDD2]"
      : variant === "warning"
      ? "text-[#E65100] bg-[#FFF3E0] border-[#FFE0B2]"
      : "text-[#714B67] bg-[#F1ECEF] border-[#D9CAD5]";

  const buttonVariant =
    variant === "danger" ? "danger" : "primary";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
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
      <div className="flex items-start gap-3.5">
        <div className={`p-2.5 rounded-[4px] border flex-shrink-0 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-[15px] text-[#495057] leading-relaxed mt-0.5">
          {message}
        </p>
      </div>
    </Modal>
  );
}
