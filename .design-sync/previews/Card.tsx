import { Badge, Button, Card } from "lumora";

export function Basic() {
  return (
    <Card className="max-w-sm">
      <h3 className="font-display text-xl text-ink">Background themes</h3>
      <p className="mt-2 text-sm leading-body text-muted">
        Pick from 15 studio-crafted scenes — marble, linen, terracotta, and
        more — tuned for product photography.
      </p>
    </Card>
  );
}

export function WithActions() {
  return (
    <Card hover className="max-w-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-ink">Competitor report</h3>
        <Badge tone="iris">Pro</Badge>
      </div>
      <p className="mt-2 text-sm leading-body text-muted">
        Claude Vision analyzed 24 product pages from 3 competing stores.
      </p>
      <div className="mt-5 flex gap-3">
        <Button size="sm">View report</Button>
        <Button size="sm" variant="ghost">
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
