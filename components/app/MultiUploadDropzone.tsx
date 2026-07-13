"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MultiUploadDropzoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  /** Max number of photos the customer can upload. */
  max?: number;
  /** Short line under the tile, e.g. "Add more angles of the same product". */
  hint?: string;
}

export function MultiUploadDropzone({ images, onChange, max = 4, hint }: MultiUploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      setError(null);
      if (!files || files.length === 0) return;

      const room = max - images.length;
      if (room <= 0) {
        setError(`You can upload up to ${max} photos.`);
        return;
      }

      const picked = Array.from(files).slice(0, room);
      let rejected = false;

      Promise.all(
        picked.map(
          (file) =>
            new Promise<string | null>((resolve) => {
              if (!file.type.startsWith("image/")) {
                rejected = true;
                return resolve(null);
              }
              if (file.size > 12 * 1024 * 1024) {
                rejected = true;
                return resolve(null);
              }
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(file);
            }),
        ),
      ).then((results) => {
        const valid = results.filter((r): r is string => r !== null);
        if (rejected) setError("Some files were skipped (use images under 12 MB).");
        if (valid.length) onChange([...images, ...valid]);
      });
    },
    [images, max, onChange],
  );

  const remove = (index: number) => onChange(images.filter((_, i) => i !== index));

  const full = images.length >= max;

  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={src.slice(0, 40) + i}
            className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-elevated/50"
          >
            <Image src={src} alt={`Product photo ${i + 1}`} fill className="object-contain p-1.5" unoptimized />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-night/70 text-ink opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-danger group-hover:opacity-100 focus:opacity-100"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          </div>
        ))}

        {!full && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Add product photo"
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
              handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-2 text-center transition-[border-color,background-color] duration-200",
              dragging
                ? "border-iris bg-iris/[0.06]"
                : "border-white/[0.12] bg-elevated/50 hover:border-iris/50 hover:bg-elevated",
            )}
          >
            <svg className="h-5 w-5 text-iris-bright" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="mt-1 text-[11px] leading-tight text-dim">Add photo</span>
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-dim">
        {images.length === 0
          ? "Upload your product photos · JPG, PNG, WebP up to 12 MB"
          : `${images.length}/${max} photos${hint ? ` · ${hint}` : ""}`}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
