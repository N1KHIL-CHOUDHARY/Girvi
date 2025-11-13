import React from 'react';
import { Dialog, DialogContent } from "./ui/Dialog";
import { IconAlertTriangle, IconX } from '@tabler/icons-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-start">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
            <IconAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 text-black dark:text-white" aria-hidden="true" />
          </div>
          <div className="ml-4 mt-0 text-left">
            <h3 className="text-lg font-semibold leading-6 text-neutral-900 dark:text-neutral-100" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700 dark:hover:bg-neutral-700 sm:mt-0 sm:w-auto"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}