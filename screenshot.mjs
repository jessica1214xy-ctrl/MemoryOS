import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://127.0.0.1:3100";
const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });

const pages = [
  { route: "/", name: "01-timeline-desktop", title: "统一时间线" },
  { route: "/knowledge", name: "02-knowledge-desktop", title: "个人知识库" },
  { route: "/reminders", name: "03-reminders-desktop", title: "主动提醒" },
  { route: "/ask", name: "04-ask-desktop", title: "问答" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ args: ["--no-sandbox"] });

// 桌面视图
const ctxD = await browser.newContext({ viewport: { width: 1280, height: 900 } });
for (const p of pages) {
  const page = await ctxD.newPage();
  await page.goto(BASE + p.route, { waitUntil: "domcontentloaded" });
  await sleep(3500); // 等待 SWR 拉取并渲染（首屏数据）
  await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
  console.log(`captured ${p.name}.png`);
  await page.close();
}
await ctxD.close();

// 移动视图（展示底部 TabBar 响应式）
const ctxM = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});
const mp = await ctxM.newPage();
await mp.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await sleep(3500);
await mp.screenshot({ path: `${OUT}/05-timeline-mobile.png`, fullPage: true });
console.log("captured 05-timeline-mobile.png");
await mp.close();
await ctxM.close();

await browser.close();
console.log("DONE");
