import { cn } from "@/lib/utils";

type Tone = "iris" | "success" | "warning" | "neutral";

const tones: Record<Tone, string> = {
  iris: "bg-iris/12 text-iris-bright border-iris/25",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/10 text-warning border-warning/25",
  neutral: "bg-white/[0.05] text-muted border-line",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
