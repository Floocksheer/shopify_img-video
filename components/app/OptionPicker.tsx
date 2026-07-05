"use client";

import { cn } from "@/lib/utils";

export interface Option {
  id: string;
  label: string;
  hint?: string;
}

interface OptionPickerProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  columns?: 2 | 3 | 4;
}

export function OptionPicker({ label, options, value, onChange, columns = 4 }: OptionPickerProps) {
  return (
    <fieldset>
      <legend className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
        {label}
      </legend>
      <div
        className={cn(
          "mt-3 grid gap-2.5",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              aria-pressed={active}
              className={cn(
                "rounded-xl border px-3 py-3 text-left transition-[border-color,background-color,transform] duration-200 active:scale-[0.98]",
                active
                  ? "border-iris/60 bg-iris/[0.1] shadow-[0_0_0_3px_rgba(124,108,255,0.12)]"
                  : "border-line bg-elevated/50 hover:border-white/[0.18] hover:bg-elevated",
              )}
            >
              <span className={cn("block text-sm font-medium", active ? "text-iris-bright" : "text-ink")}>
                {opt.label}
              </span>
              {opt.hint && <span className="mt-0.5 block text-[11px] text-dim">{opt.hint}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
