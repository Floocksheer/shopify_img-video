// design-sync only: extends the app's Tailwind config with a safelist so the
// precompiled stylesheet shipped to claude.ai/design also contains the theme
// vocabulary and common layout utilities the design agent composes with —
// JIT alone would only emit classes the app itself happens to use.
import type { Config } from "tailwindcss";
import base from "../tailwind.config";

const config: Config = {
  ...base,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./.design-sync/previews/**/*.tsx",
    "./.design-sync/shims/**/*.tsx",
  ],
  safelist: [
    // theme color vocabulary, plain + hover
    {
      pattern:
        /^(bg|text|border|ring)-(night|surface|elevated|floating|ink|muted|dim|success|warning|danger|iris|iris-bright|iris-deep|iris-faint)$/,
      variants: ["hover"],
    },
    "border-line",
    "ring-line",
    // brand shadows / radius / type
    { pattern: /^shadow-(card|lift|glow|button)$/ },
    { pattern: /^animate-(shimmer|fade-up|fade-in|pulse-soft|marquee|orbit)$/ },
    "rounded-card",
    "tracking-display",
    "leading-body",
    // common layout glue for agent-authored compositions
    { pattern: /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|gap|gap-x|gap-y|space-y|space-x)-(0|1|2|3|4|5|6|8|10|12|16|20|24)$/ },
    { pattern: /^grid-cols-(1|2|3|4|5|6|12)$/, variants: ["sm", "md", "lg"] },
    { pattern: /^(w|h)-(4|5|6|8|10|12|16|20|24|32|40|48|56|64|72|80|96|full|auto)$/ },
    { pattern: /^max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full)$/ },
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/, variants: ["sm", "md"] },
    { pattern: /^rounded-(md|lg|xl|2xl|3xl|full)$/ },
    { pattern: /^font-(display|sans|mono|light|normal|medium|semibold|bold)$/ },
    { pattern: /^(flex|grid|hidden|block|inline-block|inline-flex|relative|absolute|fixed|sticky)$/, variants: ["md"] },
    { pattern: /^(flex-col|flex-row|flex-wrap|flex-1|shrink-0|grow)$/, variants: ["sm", "md"] },
    { pattern: /^items-(start|center|end|baseline|stretch)$/ },
    { pattern: /^justify-(start|center|end|between|around)$/ },
    { pattern: /^(text-center|text-left|text-right|mx-auto|uppercase|italic|antialiased|overflow-hidden|inset-0|truncate|select-none)$/ },
    { pattern: /^tracking-(tight|normal|wide|wider|widest)$/ },
    { pattern: /^opacity-(0|25|40|50|60|75|100)$/ },
    { pattern: /^z-(0|10|20|30|40|50)$/ },
  ],
};

export default config;
