// Screenshot helper per the design-rules workflow.
// Usage: node screenshot.mjs http://localhost:3000 [label] [--mobile] [--app]
//   --app sets the demo session cookie so auth-guarded pages render.
import puppeteer from "puppeteer";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const url = process.argv[2] ?? "http://localhost:3000";
const label = process.argv.find((a, i) => i >= 3 && !a.startsWith("--"));
const mobile = process.argv.includes("--mobile");

const dir = join(process.cwd(), "temporary screenshots");
mkdirSync(dir, { recursive: true });

const existing = readdirSync(dir).filter((f) => /^screenshot-\d+/.test(f));
const next =
  existing.reduce((max, f) => Math.max(max, Number(f.match(/^screenshot-(\d+)/)?.[1] ?? 0)), 0) + 1;
const file = join(dir, `screenshot-${next}${label ? `-${label}` : ""}${mobile ? "-mobile" : ""}.png`);

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport(
  // scale 1 keeps tall pages under Chrome's 16384px capture limit
  mobile ? { width: 390, height: 844, deviceScaleFactor: 1 } : { width: 1440, height: 900 },
);
// scroll-reveal animations honor prefers-reduced-motion; disable them so
// full-page captures show all content
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
if (process.argv.includes("--app")) {
  const { hostname } = new URL(url);
  await browser.setCookie({
    name: "lumora_demo_session",
    value: encodeURIComponent(JSON.stringify({ email: "demo@lumora.app" })),
    domain: hostname,
    path: "/",
  });
}
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
// let scroll-reveal animations settle by scrolling through the page first
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const step = () => {
      y += 600;
      window.scrollTo({ top: y, behavior: "instant" });
      if (y < document.body.scrollHeight) setTimeout(step, 120);
      else {
        window.scrollTo({ top: 0, behavior: "instant" });
        setTimeout(resolve, 800);
      }
    };
    step();
  });
});
await page.screenshot({ path: file, fullPage: true });
await browser.close();
console.log(`saved: ${file}`);
