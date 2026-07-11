import { LogoMark } from "lumora";

export function Mark() {
  return <LogoMark className="h-12 w-12" />;
}

export function Sizes() {
  return (
    <div className="flex items-end gap-6">
      <LogoMark className="h-6 w-6" />
      <LogoMark className="h-9 w-9" />
      <LogoMark className="h-14 w-14" />
    </div>
  );
}
