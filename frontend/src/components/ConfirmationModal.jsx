import React from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent } from "./ui/Dialog"
import { IconAlertTriangle } from '@tabler/icons-react'

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}) {
  const { t } = useTranslation()
  const resolvedConfirm = confirmText ?? t('buttons.confirm')
  const resolvedCancel = cancelText ?? t('buttons.cancel')
  
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-[#121212] border-zinc-200/60 dark:border-white/[0.08] rounded-[2rem] shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/10 shrink-0 border border-rose-100 dark:border-rose-500/20">
              <IconAlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white" id="modal-title">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {message}
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-white/[0.05]">
            <button
              type="button"
              className="min-h-[44px] w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-zinc-100 dark:bg-white/5 px-6 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-white/10"
              onClick={onClose}
            >
              {resolvedCancel}
            </button>
            <button
              type="button"
              className="min-h-[44px] w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-rose-600 px-6 text-sm font-medium text-white transition-colors hover:bg-rose-700 shadow-sm"
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              {resolvedConfirm}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}