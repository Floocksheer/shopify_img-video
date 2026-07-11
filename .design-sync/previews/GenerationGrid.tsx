import { GenerationGrid } from "lumora";

const shot = (a: string, b: string, label: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='400' height='500' fill='url(#g)'/><ellipse cx='200' cy='400' rx='130' ry='18' fill='rgba(0,0,0,0.35)'/><rect x='140' y='170' width='120' height='230' rx='18' fill='rgba(255,255,255,0.85)'/><text x='200' y='60' font-family='monospace' font-size='20' fill='rgba(255,255,255,0.7)' text-anchor='middle'>${label}</text></svg>`,
  );

const records = [
  { id: "1", type: "photo" as const, url: shot("#8a7a5c", "#3d3629", "linen"), theme: "Linen", createdAt: "2026-07-08T10:00:00Z" },
  { id: "2", type: "video" as const, url: shot("#6b7a8a", "#232a33", "studio"), theme: "Studio", createdAt: "2026-07-07T15:30:00Z" },
  { id: "3", type: "photo" as const, url: shot("#a06a4f", "#402a1e", "terra"), theme: "Terracotta", createdAt: "2026-07-05T09:12:00Z" },
  { id: "4", type: "photo" as const, url: shot("#9aa0ad", "#2e3138", "marble"), theme: "Marble", createdAt: "2026-07-02T18:45:00Z" },
];

export function RecentGenerations() {
  return <GenerationGrid initial={records} mergeLocal={false} />;
}

export function EmptyState() {
  return (
    <div className="w-full max-w-md">
      <GenerationGrid initial={[]} mergeLocal={false} />
    </div>
  );
}
