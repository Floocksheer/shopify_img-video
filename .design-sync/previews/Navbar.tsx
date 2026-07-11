import { Navbar } from "lumora";

// The real Navbar is position:fixed; the wrapper pins it inside the card.
export function DesktopNav() {
  return (
    <div className="relative h-24 w-full overflow-hidden rounded-xl border border-line [&_header]:!absolute">
      <Navbar />
    </div>
  );
}
