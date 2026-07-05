import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  progress?: number; // 0..1
  tone?: "iris" | "warning";
}

export function StatCard({ label, value, sub, progress, tone = "iris" }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">{label}</p>
      <p className="mt-3 font-display text-4xl tracking-display text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
      {progress !== undefined && (
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              "h-full rounded-full transition-transform duration-700 ease-out",
              tone === "iris" ? "bg-iris" : "bg-warning",
            )}
            style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
          />
        </div>
      )}
    </Card>
  );
}
