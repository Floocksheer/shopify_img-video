// LumoraFrame — the design system's dark root surface. Lumora is a dark-only
// UI (near-black night background, iris violet accents); previews and designs
// must render on this surface or glass/ghost styles disappear on white.
// Exported on window.Lumora via cfg.extraEntries and used as cfg.provider.
//
// Inside preview cards (window.__dsCells is set by the card harness) the
// capture browser runs on a FROZEN clock, so framer-motion reveals
// (initial opacity 0 -> whileInView opacity 1) never progress. The injected
// !important rule overrides framer's inline starting styles so hidden-at-
// mount content is visible in screenshots. Real designs are unaffected —
// the flag doesn't exist there and animations run normally.
import * as React from "react";
import { MotionConfig } from "framer-motion";

// The vendored react-dom 18 UMD build has no useFormState/useFormStatus
// (React 19 form hooks) — AuthForm would crash. Polyfill static fallbacks
// only when the host react-dom lacks them.
const RD: any = typeof window !== "undefined" ? (window as any).ReactDOM : null;
if (RD && !RD.useFormState) {
  RD.useFormState = (action: any, initialState: any) => [initialState, action];
}
if (RD && !RD.useFormStatus) {
  RD.useFormStatus = () => ({ pending: false, data: null, method: null, action: null });
}

export function LumoraFrame({ children }: { children?: React.ReactNode }) {
  const isPreviewCard =
    typeof window !== "undefined" && Array.isArray((window as any).__dsCells);
  return (
    <MotionConfig reducedMotion={isPreviewCard ? "always" : "user"}>
      <div className="bg-night text-ink font-sans antialiased rounded-xl p-6">
        {isPreviewCard && (
          <style>{`[style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
        )}
        {children}
      </div>
    </MotionConfig>
  );
}
