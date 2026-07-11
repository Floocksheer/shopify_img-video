import { Sidebar } from "lumora";

// The real Sidebar is position:fixed and md:-gated; the wrapper pins it
// inside the card and forces the desktop variant visible at any width.
export function AppNavigation() {
  return (
    <div className="relative h-[560px] w-[260px] overflow-hidden rounded-xl border border-line [&_aside]:!absolute [&_aside]:!flex [&_header]:!hidden">
      <Sidebar
        email="merve@atolyeceramics.com"
        isDemo={true}
        logoutAction={async () => {}}
      />
    </div>
  );
}
