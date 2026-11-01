const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = "F:/LLM/aurasage/assets/data/index.js";
const OUT_DIR = "F:/LLM/novel/codex";
const IMG_DST = "F:/LLM/novel/assets/products";

const code = fs.readFileSync(SRC, 'utf8');
const sandbox = {};
vm.createContext(sandbox);
// 末尾把 PRODUCTS 暴露到 sandbox 全局（同脚本作用域内可访问顶层 const）
vm.runInContext(code + "\nglobalThis.__PRODUCTS = PRODUCTS;", sandbox);
const PRODUCTS = sandbox.__PRODUCTS;
if (!Array.isArray(PRODUCTS)) { console.error("PRODUCTS not found"); process.exit(1); }

// 按章节植入顺序挑选的 aurasage 产品
const ids = ["p49","p02","p01","p26","p03","p06","p15","p27","p48","p50","p04","p16","p33","p54","p12","p09"];
const featured = [];
for (const id of ids) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) { console.warn("missing", id); continue; }
  const srcImg = path.join("F:/LLM/aurasage", p.image);
  const dstImg = path.join(IMG_DST, id + ".jpg");
  try { fs.copyFileSync(srcImg, dstImg); } catch (e) { console.warn("img copy failed", id, e.message); }
  featured.push({
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
}
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "codex.json"), JSON.stringify(featured, null, 2), 'utf8');
console.log("wrote", featured.length, "products to codex.json");
