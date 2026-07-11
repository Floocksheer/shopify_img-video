# design-sync notes — Lumora

## Repo shape & build

- Next.js 14 app, not a packaged design system: no dist/. The converter runs
  in synth-entry mode over `components/`. **Always pass
  `--entry ./dist/index.js` (deliberately nonexistent)** — it makes PKG_DIR
  resolve to the repo root (walk-up finds the root package.json named
  "lumora"); without it the converter looks for `node_modules/lumora` and
  crashes.
- Full converter command:
  `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./dist/index.js --out ./ds-bundle`
- `buildCmd` (`node .design-sync/build-css.mjs`) must run BEFORE the
  converter whenever styles/previews changed: it compiles Tailwind via
  `.design-sync/tailwind.dsync.ts` (extends the app config with a safelist so
  the design agent's layout utilities exist — JIT alone only emits classes
  the app uses) into `.design-sync/.cache/tw.css` (= cfg.cssEntry), and
  prepends the Google Fonts @import + the `--font-*` vars next/font injects
  at runtime. `[FONT_REMOTE]` from validate is expected and fine.
- Windows quirks: `npm ci` fails EPERM while `next dev` runs (next-swc .node
  locked) — stop the dev server first. Spawned CLIs must use RELATIVE paths
  (space in `C:\Users\FURKAN YORULMAZ` splits args under shell:true).

## Shims & forks

- Next.js runtime modules are shimmed via `.design-sync/tsconfig.dsync.json`
  paths → `.design-sync/shims/` (next/link → <a>, next/image → <img>,
  next/navigation → static stubs; usePathname returns "/dashboard" so
  Sidebar shows an active item).
- `.design-sync/overrides/dts.mjs` fork: allows the all-caps component names
  CTA and FAQ through the enum-name heuristic. Additionally
  `componentSrcMap` enumerates ALL 24 components — in synth-entry mode a
  non-empty componentSrcMap REPLACES discovery (the derive-from-src fallback
  only runs when the map yields nothing), so keep the map complete when
  adding components. Fork needs `.design-sync/node_modules` junction →
  `.ds-sync/node_modules` (recreate per clone: `New-Item -ItemType Junction`).
- `LumoraFrame` (`.design-sync/shims/ds-frame.tsx`, via extraEntries +
  cfg.provider): dark root surface for every preview; injects an
  `!important` CSS rule inside preview cards (window.__dsCells present) that
  forces framer-motion's `opacity: 0` initial styles visible — the capture
  browser runs on a FROZEN clock, so whileInView/animate tweens never
  progress. Also polyfills ReactDOM.useFormState/useFormStatus (vendored
  react-dom 18 lacks them; AuthForm needs them).

## Known render warns

- (none currently — Badge/LogoMark small-paint warns resolved by authored
  previews)

## Re-sync risks

- `Hero` and `Features` hard-code Unsplash image URLs: they load in local
  capture (network on) but are CSP-blocked inside claude.ai/design renders —
  cards show gradient/alt fallbacks there. Expected; documented in
  conventions.md. Don't "fix" the previews.
- The safelist in `tailwind.dsync.ts` is the design agent's utility budget;
  if the theme in `tailwind.config.ts` gains colors/shadows, extend the
  safelist pattern too or the new names won't ship.
- Preview-only behaviors (frozen-clock CSS override, useFormState polyfill,
  reduced-motion) live in ds-frame.tsx and key off `window.__dsCells`; if the
  card harness ever renames that global, reveals will screenshot blank again.
- `.design-sync/.cache/tw.css` is gitignored build output — a fresh clone
  must run buildCmd before the converter or `[CSS_IMPORT_MISSING]` fires.
- Sidebar/Navbar previews force-pin `position:fixed` markup with
  `[&_aside]:!absolute`-style arbitrary variants; if component markup
  changes (aside→div), update `.design-sync/previews/{Sidebar,Navbar}.tsx`.
