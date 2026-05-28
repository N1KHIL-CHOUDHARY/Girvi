import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { uploadFile } from '../services/api'
import { IconPhotoPlus, IconLoader2, IconX } from '@tabler/icons-react'
import { cn } from '../lib/utils'

export default function FileUpload({ value, onChange, label, className }) {
    const { t } = useTranslation()
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setError('')
        try {
            setIsUploading(true)
            const res = await uploadFile(file)
            onChange(res.data.url)
        } catch (err) {
            setError(err.response?.data?.message || t('errors.uploadFailed'))
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = (e) => {
        e.preventDefault()
        e.stopPropagation()
        onChange('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const triggerClick = () => {
        if (!isUploading && fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    return (
        <div className={cn("w-full", className)}>
            <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={isUploading}
                ref={fileInputRef}
                className="hidden"
            />

            {!value ? (
                <div
                    onClick={triggerClick}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full min-h-[140px] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
                        isUploading 
                            ? "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#1A1A1A] cursor-not-allowed" 
                            : "border-zinc-200/60 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:border-zinc-300 dark:hover:border-white/[0.15]"
                    )}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <IconLoader2 className="w-6 h-6 text-zinc-400 dark:text-zinc-500 animate-spin" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                {t('common.uploading')}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 pointer-events-none">
                            <div className="w-12 h-12 rounded-[1rem] bg-white dark:bg-[#121212] border border-zinc-200/60 dark:border-white/[0.05] flex items-center justify-center shadow-sm">
                                <IconPhotoPlus className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                            </div>
                            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                {label || t('common.uploadPhoto')}
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative flex items-center justify-center w-full min-h-[140px] rounded-2xl border border-zinc-200/60 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] p-2 overflow-hidden group">
                    <img 
                        src={value} 
                        alt={t('common.preview')} 
                        className="w-full h-full max-h-[200px] object-contain rounded-xl"
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-zinc-200/60 dark:border-white/[0.08] text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                        <IconX className="w-4 h-4" />
                    </button>
                </div>
            )}

            {error && (
                <p className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400 text-center">
                    {error}
                </p>
            )}
        </div>
    )
}