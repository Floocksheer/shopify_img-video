// Temporary end-to-end flow test (demo mode). Run: node flow-test.mjs
import puppeteer from "puppeteer";

const BASE = "http://localhost:3000";
const shot = async (page, name) =>
  page.screenshot({ path: `temporary screenshots/flow-${name}.png`, fullPage: false });

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 300)));

const results = [];
const ok = (name, pass, extra = "") => {
  results.push({ name, pass, extra });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
};

// 1) signup → dashboard (demo)
await page.goto(`${BASE}/signup`, { waitUntil: "networkidle0" });
await page.type("#email", "seller@test.com");
await page.type("#password", "password123");
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30000 }),
  page.click("button[type=submit]"),
]);
ok("signup redirects to dashboard", page.url().includes("/dashboard"), page.url());

// 2) middleware guard: logged-in dashboard shows stats
const statText = await page.evaluate(() => document.body.innerText);
ok("dashboard shows usage stats", statText.includes("PHOTOS THIS MONTH") && statText.includes("TRIAL"));

// 3) photo generation flow with a real file upload
await page.goto(`${BASE}/generate/photo`, { waitUntil: "networkidle0" });
const input = await page.$("input[type=file]");
// tiny 1x1 png
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const { mkdirSync, writeFileSync } = await import("node:fs");
mkdirSync("temporary screenshots", { recursive: true });
writeFileSync("temporary screenshots/test-product.png", png);
await input.uploadFile("temporary screenshots/test-product.png");
await new Promise((r) => setTimeout(r, 500));
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Generate 4 photos"));
  btn.click();
});
// skeletons should appear
await new Promise((r) => setTimeout(r, 800));
const hasSkeleton = await page.$(".skeleton");
ok("photo generation shows skeleton loaders", !!hasSkeleton);
// wait for results
await page.waitForFunction(
  () => document.querySelectorAll("figure img").length >= 4,
  { timeout: 20000 },
);
ok("photo generation returns 4 results", true);
await shot(page, "photo-results");

// 4) shopify export button on a result
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Shopify"));
  btn?.click();
});
await page.waitForFunction(
  () => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("In Shopify")),
  { timeout: 15000 },
);
ok("shopify export completes (demo)", true);

// 5) video generation
await page.goto(`${BASE}/generate/video`, { waitUntil: "networkidle0" });
await (await page.$("input[type=file]")).uploadFile("temporary screenshots/test-product.png");
await new Promise((r) => setTimeout(r, 500));
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Generate 10s clip")).click();
});
await page.waitForSelector("video", { timeout: 30000 });
ok("video generation returns a playable clip", true);
await shot(page, "video-result");

// 6) competitor x-ray
await page.goto(`${BASE}/competitors`, { waitUntil: "networkidle0" });
// wait out React hydration so the controlled input accepts typing
await new Promise((r) => setTimeout(r, 1200));
// native-setter + input event: updates the React controlled input without
// depending on puppeteer focus state
await page.evaluate(() => {
  const inp = document.querySelector("#store-url");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "rival-store.myshopify.com");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
});
// the submit button enables only once React state holds the query
try {
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("button")].some(
        (b) => b.textContent.includes("Run X-Ray") && !b.disabled,
      ),
    { timeout: 10000 },
  );
} catch {
  const state = await page.evaluate(() => ({
    value: document.querySelector("#store-url")?.value,
    buttons: [...document.querySelectorAll("button")].map((b) => `${b.textContent}|${b.disabled}`),
  }));
  console.log("x-ray input state:", JSON.stringify(state));
  throw new Error("Run X-Ray button never enabled");
}
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Run X-Ray")).click();
});
try {
  await page.waitForFunction(
    () => /your openings/i.test(document.body.innerText),
    { timeout: 30000 },
  );
  ok("competitor x-ray returns full analysis", true);
} catch {
  await shot(page, "xray-timeout");
  const text = await page.evaluate(() => document.body.innerText.slice(0, 600));
  console.log("x-ray page text at timeout:", JSON.stringify(text));
  ok("competitor x-ray returns full analysis", false);
}
await shot(page, "competitor-analysis");

// 7) logout → guard kicks in
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle0" });
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Log out"))?.click();
});
await new Promise((r) => setTimeout(r, 2000));
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle0" });
ok("after logout, dashboard redirects to login", page.url().includes("/login"), page.url());

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
