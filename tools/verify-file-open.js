const { chromium } = require("playwright-core");
const { spawn } = require("child_process");
const path = require("path");

const EXE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const ROOT = "F:/LLM/novel";

async function testUrl(browser, url, label) {
  const errors = [];
  const consoleErrs = [];
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") consoleErrs.push(m.text()); });

  await page.goto(url, { waitUntil: "load" });
  // wait for shelf
  await page.waitForSelector(".book-card", { timeout: 8000 });
  const bookCount = await page.$$eval(".book-card", (els) => els.length);
  // open book
  await page.click(".book-card");
  await page.waitForSelector(".chapter-item", { timeout: 5000 });
  const chapCount = await page.$$eval(".chapter-item", (els) => els.length);
  // open chapter 1
  await page.click(".chapter-item");
  await page.waitForSelector("#reader-content", { timeout: 5000 });
  await page.waitForFunction(() => {
    const el = document.getElementById("reader-content");
    return el && el.innerText && el.innerText.length > 50 && !el.querySelector(".error-tip");
  }, { timeout: 6000 });
  const readerLen = await page.$eval("#reader-content", (el) => el.innerText.length);
  const curioVisible = await page.$eval("#curioBox", (el) => getComputedStyle(el).display !== "none").catch(() => false);
  // switch to EN
  await page.click("#langEn");
  await page.waitForTimeout(400);
  const enTitle = await page.$eval(".reader-top .rt-title", (el) => el.textContent).catch(() => "");
  // back to shelf via codex
  await page.click("#navCodex");
  await page.waitForSelector(".codex-card", { timeout: 5000 });
  const codexCount = await page.$$eval(".codex-card", (els) => els.length);

  console.log(`\n[${label}] url=${url}`);
  console.log(`  book-card: ${bookCount}, chapters: ${chapCount}, reader text len: ${readerLen}, curio box visible: ${curioVisible}`);
  console.log(`  EN reader title: "${enTitle}", codex cards: ${codexCount}`);
  console.log(`  pageerrors: ${errors.length}`, errors);
  console.log(`  console errors: ${consoleErrs.length}`, consoleErrs.filter(e=>!/favicon|cookieEnabled/.test(e)));

  const ok = bookCount > 0 && chapCount > 0 && readerLen > 50 && codexCount > 0 && errors.length === 0;
  await page.close();
  return ok;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: EXE,
    headless: true,
    args: ["--allow-file-access-from-files", "--no-sandbox"],
  });
  let allOk = true;
  try {
    allOk = (await testUrl(browser, "file:///" + ROOT + "/index.html", "FILE://")) && allOk;
  } catch (e) {
    console.log("FILE:// test FAILED:", e.message);
    allOk = false;
  }
  // http server
  const srv = spawn("C:/Users/Administrator/.workbuddy/binaries/python/versions/3.13.12/python.exe",
    ["-m", "http.server", "8799", "--directory", ROOT], { detached: true, stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 1500));
  try {
    allOk = (await testUrl(browser, "http://127.0.0.1:8799/index.html", "HTTP://")) && allOk;
  } catch (e) {
    console.log("HTTP:// test FAILED:", e.message);
    allOk = false;
  }
  try { process.kill(-srv.pid); } catch {}
  await browser.close();
  console.log("\n=== RESULT:", allOk ? "ALL PASS ✅" : "FAIL ❌", "===");
  process.exit(allOk ? 0 : 1);
})();
