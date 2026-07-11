import { Button } from "lumora";

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Generate photos</Button>
      <Button variant="secondary">Preview theme</Button>
      <Button variant="ghost">Skip for now</Button>
      <Button variant="danger">Delete render</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Start free trial</Button>
    </div>
  );
}

export function States() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button disabled>Rendering…</Button>
      <Button variant="secondary" disabled>
        Unavailable
      </Button>
      <Button href="/pricing">View pricing</Button>
    </div>
  );
}
