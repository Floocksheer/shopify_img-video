// design-sync buildCmd: compiles the app's Tailwind theme into a static
// stylesheet the converter can ship (cfg.cssEntry -> .design-sync/.cache/tw.css).
// Prepends the Google Fonts import + the --font-* variables that next/font
// injects at runtime in the real app.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cache = join(root, ".design-sync", ".cache");
mkdirSync(cache, { recursive: true });
const raw = join(cache, "tw-raw.css");

// Relative paths only on the command line — with shell:true on Windows a
// space in an absolute path (C:\Users\FURKAN YORULMAZ\...) splits the arg.
// --content includes authored previews so their utility classes compile too.
execFileSync(
  "npx",
  [
    "tailwindcss",
    "-c", ".design-sync/tailwind.dsync.ts",
    "-i", "app/globals.css",
    "-o", ".design-sync/.cache/tw-raw.css",
    "--minify",
  ],
  { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
);

const fonts = `@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Hanken+Grotesk:wght@300..800&family=JetBrains+Mono:wght@400..600&display=swap");
:root{--font-fraunces:'Fraunces',Georgia,serif;--font-hanken:'Hanken Grotesk',system-ui,sans-serif;--font-jetbrains:'JetBrains Mono',monospace;}
`;
writeFileSync(join(cache, "tw.css"), fonts + readFileSync(raw, "utf8"));
console.log("wrote .design-sync/.cache/tw.css");
