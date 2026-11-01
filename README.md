# 玉灯奇物馆 · Jade Lantern Curio — 在线阅读站

> 基于 [Youreln/novel](https://github.com/Youreln/novel) 方案二次开发的**纯静态**小说阅读站。
> 把《玉灯奇物馆》做成可在线阅读的小说，支持**封面 + 中英双语（中文默认）+ 奇物图鉴（带货）**。

## 这是什么

一部都市奇物店题材的长篇网文：华裔女孩林梅接手祖母留在 Maple Hollow 老城的东方奇物馆，
用**真实在售的东方器物**（水晶、香、玉器）为深夜推门而入的客人解一段心结。故事里的器物来自
跨境电商品牌 **AuraSage（东方神秘文化 / 道家五行）**，每章末尾的「本集奇物」与「奇物图鉴」页可直接跳转到店铺。

- 类型：都市奇物店（现实向 · 轻治愈悬疑 · 单元剧 + 长线）
- 语言：中文（默认）/ 英文 双语，顶部一键切换
- 合规：不写魔法/真实宗教/医疗疗效，神秘效果走「文化象征 + 心理暗示 + 仪式感」

## 目录结构

```
novel/
  index.html              # 阅读站（manifest 驱动，已去掉 GitHub API 依赖，可托管到任意静态平台）
  books.json              # 书目清单：封面 / 双语标题 / 章节路径 / 每章植入的产品
  codex/codex.json        # 奇物图鉴数据（从 AuraSage 抽取，见下）
  codex/extract.js        # 从 aurasage 仓库抽取植入产品 → codex.json（构建脚本，非运行时依赖）
  covers/                 # 封面图
  assets/
    marked.min.js         # 本地内置的 Markdown 渲染器（无 CDN 依赖）
    data.js               # 由 tools/build-embed.js 生成：内联清单+章节正文，使 file:// 双击也能读
    products/             # 植入故事的产品图（从 aurasage 复制）
  tools/
    build-embed.js        # 生成 assets/data.js（章节/清单内联，供离线 file:// 打开）
    verify-file-open.js   # 无头浏览器自检：file:// 与 http:// 两种打开方式是否均正常
  novel/玉灯奇物馆/
    zh/第NN章_xxx.md      # 中文章节
    en/chNN-xxx.md        # 英文章节
```

## 本地预览

**方式一 · 直接双击（推荐快速查看）**
直接双击 `index.html` 用浏览器打开即可。站点的清单与全部章节正文已内联进 `assets/data.js`
（由 `tools/build-embed.js` 生成），因此 `file://` 协议下也能正常读取，不受浏览器 CORS 限制。

**方式二 · 本地静态服务器（内容最新鲜）**
`http(s)` 模式下站点优先 `fetch` 实时读取 `books.json` / 章节 `.md`，适合边写边看：

```bash
# 在项目根目录
python -m http.server 8765
# 浏览器访问 http://localhost:8765
```

> 注意：新增 / 修改章节后，若想让「双击打开」也能看到最新内容，请重跑
> `node tools/build-embed.js` 重新生成 `assets/data.js`（线上部署走方式二则无需此步）。

## 如何新增 / 修改章节

1. 在 `novel/玉灯奇物馆/zh/` 与 `en/` 各放一个 `.md` 文件。
2. 在 `books.json` 的对应 book 的 `chapters` 数组里加一项：
   ```json
   { "id":"ch04", "n":4,
     "title": { "zh":"第四章 · …", "en":"Chapter 4 · …" },
     "zh":"novel/玉灯奇物馆/zh/第04章_xxx.md",
     "en":"novel/玉灯奇物馆/en/ch04-xxx.md",
     "products":["p49","p02"] }
   ```
   `products` 填 AuraSage 产品 id（见 `codex/codex.json`），阅读页会自动在章末渲染「本集奇物」卡片并链接到店铺。
3. 提交即可，无需构建（线上部署走 `http(s)` 实时读取）。
   若要让「双击 `index.html`（`file://`）」也包含新章节，额外跑一步：
   ```bash
   node tools/build-embed.js
   ```
   重新生成 `assets/data.js` 即可。

## 奇物图鉴（带货）

`codex/codex.json` 由 `codex/extract.js` 从本地 `aurasage` 仓库的 `assets/data/index.js` 抽取，
包含每个植入产品的名称（中英）、意义、五行属性、图片。若要增删产品，编辑脚本顶部的 `ids` 数组后重跑：

```bash
node codex/extract.js
```

> **店铺链接**：`books.json` 里的 `shopBase` 已设为 AuraSage 实际部署地址
> `https://aurasage-du3.pages.dev/`，产品链接形如 `${shopBase}/#/product/p49`，
> 上线时若地址变更，直接改 `books.json` 中的 `shopBase` 字段即可。

## 部署

纯静态，无后端。推到 Gitee 后由 **Cloudflare Pages** 从仓库构建发布即可
（构建命令空、输出目录即仓库根）。也可直接 GitHub Pages / Vercel / Netlify。

## 许可

阅读站框架基于 Youreln/novel（开源），二次修改与分发请保留原作者开源标注。
小说正文 © 林默 / Lin Mo，AI-assisted 创作（人工主导 + 精修，保留版权）。
