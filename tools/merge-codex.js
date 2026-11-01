// 把卷二新增的 AuraSage 真实香品并入 codex.json（保留卷一已有的 16 件）
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = "F:/LLM/aurasage/assets/data/index.js";
const CODE_PATH = "F:/LLM/novel/codex/codex.json";
const IMG_DST = "F:/LLM/novel/assets/products";

const code = fs.readFileSync(SRC, 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code + "\nglobalThis.__PRODUCTS = PRODUCTS;", sandbox);
const PRODUCTS = sandbox.__PRODUCTS;
if (!Array.isArray(PRODUCTS)) { console.error("PRODUCTS not found"); process.exit(1); }

const cur = JSON.parse(fs.readFileSync(CODE_PATH, 'utf8'));
const curIds = new Set(cur.map(c => c.id));
// 卷二新增 hero 单品（均为 AuraSage 真实香品）
const newIds = ["p07","p08","p22","p18","p51","p35","p32","p24","p56"];
const added = [];
for (const id of newIds) {
  if (curIds.has(id)) { console.log("skip (exists)", id); continue; }
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) { console.warn("missing", id); continue; }
  const srcImg = path.join("F:/LLM/aurasage", p.image);
  const dstImg = path.join(IMG_DST, id + ".jpg");
  try { fs.copyFileSync(srcImg, dstImg); } catch (e) { console.warn("img copy failed", id, e.message); }
  cur.push({
    id: p.id,
    element: p.element,
    type: p.type,
    priceUSD: p.priceUSD,
    rating: p.rating,
    name: p.name,
    nameZh: p.zh.name,
    meaning: p.meaning,
    meaningZh: p.zh.meaning,
    origin: p.origin,
    originZh: p.zh.origin,
    image: "assets/products/" + id + ".jpg"
  });
  added.push(id);
}
fs.writeFileSync(CODE_PATH, JSON.stringify(cur, null, 2), 'utf8');
console.log("added", added.length, added, "| total now", cur.length);
