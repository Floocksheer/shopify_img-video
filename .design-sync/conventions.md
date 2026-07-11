# Lumora — build conventions

Lumora is a **dark-only** UI: near-black backgrounds with iris-violet accents.
Components disappear on white — always build on the dark surface.

## Root wrapper

Wrap every screen in `LumoraFrame` (exported on the bundle). It applies the
night background, ink text, and the Hanken Grotesk body font:

```jsx
<LumoraFrame>
  {/* your screen */}
</LumoraFrame>
```

Without it, glass/ghost styles render invisible and text falls back to
browser defaults. If you need a bare `div` instead, give it
`bg-night text-ink font-sans antialiased`.

## Styling idiom — Tailwind utilities with Lumora's theme vocabulary

Style with Tailwind classes. The shipped stylesheet is **precompiled**: the
theme vocabulary below plus common layout utilities (flex/grid, `p-*`, `m-*`,
`gap-*`, `w-*`/`h-*`, `max-w-*`, `text-xs…7xl`, `rounded-*`, `items-*`,
`justify-*`, with `sm:`/`md:`/`hover:` variants) are guaranteed present.
Exotic arbitrary values (e.g. `w-[437px]`) may not resolve — prefer the scale.

- **Surfaces**: `bg-night` (page), `bg-surface`, `bg-elevated`, `bg-floating`;
  hairline borders with `border-line`. Glass panels: `glass` (subtle) /
  `glass-strong` (nav bars).
- **Text**: `text-ink` (primary), `text-muted` (secondary), `text-dim`
  (tertiary); accents `text-iris-bright`, status `text-success` /
  `text-warning` / `text-danger`.
- **Accent**: `bg-iris` with `text-night` on primary actions;
  `iris-bright` / `iris-deep` / `iris-faint` shades exist for all color
  utilities.
- **Type**: `font-display` (Fraunces serif — headlines, stat values, prices;
  pair with `tracking-display`), `font-sans` (Hanken Grotesk — body; pair
  long copy with `leading-body`), `font-mono` (JetBrains Mono — eyebrows,
  labels, badges; usually `text-xs uppercase tracking-[0.2em]`). Gradient
  headline em-phrase: `text-gradient-iris font-light italic` on an `<em>`.
- **Depth**: violet-tinted shadows only — `shadow-card` (resting),
  `shadow-lift` (hover), `shadow-glow` (featured), `shadow-button` (primary
  CTA). Never flat `shadow-md`.
- **Shape**: cards use `rounded-card` (1rem); pills/buttons `rounded-full`.
- **Scene dressing**: `glow-hero` / `glow-footer` (radial violet fields),
  `grain` (film-grain overlay on a `relative` container), `hairline`
  (section divider), `skeleton` (shimmer loading block).
- **Motion**: `animate-fade-up`, `animate-fade-in`, `animate-pulse-soft`,
  `animate-shimmer`, `animate-marquee`, `animate-orbit`; scroll reveals via
  the `Reveal` component, not CSS.

## Where the truth lives

Read `styles.css` (imports `_ds_bundle.css` — all tokens and utilities) and
each component's `.prompt.md` / `.d.ts` before styling. Section components
(`Hero`, `Features`, `PricingTiers`, `FAQ`, `CTA`, `Footer`, …) are complete
zero-prop landing blocks — compose pages by stacking them. `Hero` and
`Features` reference remote Unsplash imagery that may not load in sandboxed
renders; that is expected, not a styling bug.

## Idiomatic example

```jsx
<LumoraFrame>
  <div className="mx-auto max-w-lg p-6">
    <SectionHeading
      align="left"
      eyebrow="Photo Studio"
      title="Pick a background theme"
      description="Your product stays pixel-perfect; only the scene changes."
    />
    <Card className="mt-8">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-ink">Marble</h3>
        <Badge tone="iris">New</Badge>
      </div>
      <p className="mt-2 text-sm leading-body text-muted">
        Cool white stone with soft studio light.
      </p>
      <div className="mt-5 flex gap-3">
        <Button size="sm">Generate 12 photos</Button>
        <Button size="sm" variant="ghost">Preview</Button>
      </div>
    </Card>
  </div>
</LumoraFrame>
```
