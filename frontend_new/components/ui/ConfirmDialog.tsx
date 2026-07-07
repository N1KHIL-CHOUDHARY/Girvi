"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
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
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-xl)]",
              isDestructive
                ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
                : "bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border-light)] pt-4 mt-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} size="sm">
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            size="sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
