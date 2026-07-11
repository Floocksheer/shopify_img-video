import { Badge } from "lumora";

export function Tones() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="iris">New</Badge>
      <Badge tone="success">Exported</Badge>
      <Badge tone="warning">Rendering</Badge>
      <Badge tone="neutral">Draft</Badge>
    </div>
  );
}

export function InContext() {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-ink">Linen throw pillow — sage</span>
      <Badge tone="success">Live on store</Badge>
    </div>
  );
}
