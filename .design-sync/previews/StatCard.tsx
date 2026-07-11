import { StatCard } from "lumora";

export function UsageStats() {
  return (
    <div className="grid w-full max-w-lg grid-cols-2 gap-4">
      <StatCard
        label="Photos this month"
        value="128"
        sub="of 200 included"
        progress={0.64}
      />
      <StatCard
        label="Videos this month"
        value="3"
        sub="of 5 included"
        progress={0.6}
      />
    </div>
  );
}

export function NearLimit() {
  return (
    <div className="w-64">
      <StatCard
        label="Photos this month"
        value="192"
        sub="8 renders left — upgrade for more"
        progress={0.96}
        tone="warning"
      />
    </div>
  );
}

export function PlainValue() {
  return (
    <div className="w-64">
      <StatCard label="Active plan" value="Pro" sub="Renews Aug 11, 2026" />
    </div>
  );
}
