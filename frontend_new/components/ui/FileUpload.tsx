"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  /**
   * Optional async uploader (e.g. calls your API / S3 / Cloudinary and
   * returns the hosted URL). If omitted, falls back to a local object URL
   * preview only — replace with a real uploader before going to production.
   */
  onUpload?: (file: File) => Promise<string>;
  accept?: string;
  className?: string;
}

export default function FileUpload({
  value,
  onChange,
  label = "Upload photo",
  onUpload,
  accept = "image/*",
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);

      if (!onUpload) {
        onChange(URL.createObjectURL(file));
        return;
      }

      try {
        setIsUploading(true);
        const url = await onUpload(file);
        onChange(url);
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onUpload]
  );

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors",
          isDragging ? "border-[#1E3A66] bg-blue-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
        )}
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <ImagePlus className="h-5 w-5" />
            <span className="px-2 text-center text-[10px] leading-tight">{label}</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}