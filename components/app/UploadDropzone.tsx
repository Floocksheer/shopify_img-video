"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onImage: (dataUrl: string) => void;
  image: string | null;
}

export function UploadDropzone({ onImage, image }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      setError(null);
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (JPG, PNG, or WebP).");
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        setError("Image must be under 12 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onImage(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onImage],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload product photo"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-card border-2 border-dashed p-6 text-center transition-[border-color,background-color] duration-200",
          dragging
            ? "border-iris bg-iris/[0.06]"
            : "border-white/[0.12] bg-elevated/50 hover:border-iris/50 hover:bg-elevated",
        )}
      >
        {image ? (
          <>
            <Image
              src={image}
              alt="Uploaded product"
              fill
              className="object-contain p-3"
              unoptimized
            />
            <span className="absolute bottom-3 rounded-full bg-night/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur-sm">
              Click to replace
            </span>
          </>
        ) : (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-iris/12 text-iris-bright ring-1 ring-iris/25">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 16V4m0 0L7 9m5-5l5 5" />
                <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
              </svg>
            </span>
            <p className="mt-4 text-sm font-medium text-ink">
              Drop your product photo here
            </p>
            <p className="mt-1 text-xs text-dim">
              or click to browse · JPG, PNG, WebP up to 12 MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
