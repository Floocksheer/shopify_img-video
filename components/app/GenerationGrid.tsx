"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getHistory, type GenerationRecord } from "@/lib/history";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface GenerationGridProps {
  /** Server-provided records (live mode). Demo seeds are merged client-side. */
  initial: GenerationRecord[];
  mergeLocal?: boolean;
}

export function GenerationGrid({ initial, mergeLocal = true }: GenerationGridProps) {
  const [records, setRecords] = useState<GenerationRecord[]>(initial);

  useEffect(() => {
    if (!mergeLocal) return;
    const local = getHistory();
    if (local.length) {
      const seen = new Set(local.map((r) => r.id));
      setRecords([...local, ...initial.filter((r) => !seen.has(r.id))]);
    }
  }, [initial, mergeLocal]);

  if (!records.length) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-card py-16 text-center">
        <p className="font-display text-xl text-muted">Nothing generated yet</p>
        <p className="mt-1 text-sm text-dim">Your photos and videos will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {records.map((r) => (
        <figure
          key={r.id}
          className="group relative overflow-hidden rounded-2xl border border-line shadow-card transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lift"
        >
          <Image
            src={r.url}
            alt={`${r.type} generation — ${r.theme}`}
            width={400}
            height={500}
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
          {r.type === "video" && (
            <span className="absolute right-2.5 top-2.5">
              <Badge tone="iris">▶ video</Badge>
            </span>
          )}
          <figcaption className="absolute inset-x-3 bottom-2.5 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/90">
              {r.theme}
            </span>
            <span className="text-[10px] text-ink/60">{formatDate(r.createdAt)}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
