# 階段 5–6:逐段 QA + 可逆部署

複刻完不是交付,是驗收。驗收過了才部署,部署了要 smoke test。

---

## 階段 5:headless 逐段 QA

### 起本機 server

```bash
cd <專案>/site
npm run build
python3 -m http.server 4173 -d dist   # 或 npm run preview
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4173/   # 期望 200
```

### ⚠️ 踩坑:不要用「錨點跳轉 + 靜態截圖」

進場動畫(IntersectionObserver + fade-up)會讓「還沒捲到的 section」停在 opacity:0。如果你用 `--screenshot` 直接開 `#section` 錨點,會截到**空白頁**,誤判成壞掉。

**正解:用 puppeteer 真實捲動 + 等待動畫觸發再截圖。**

```bash
# 一次性裝在 scratchpad,不污染專案
cd <scratchpad> && npm init -y && npm i puppeteer-core
```

```javascript
// qa.mjs
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle0' });
for (const id of ['top','about','projects','work','writing','subscribe']) {
  await page.evaluate((id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' }), id);
  await new Promise(r => setTimeout(r, 1200));   // 等進場動畫跑完
  await page.screenshot({ path: `${process.env.Q}/pp-${id}.png` });
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: `${process.env.Q}/pp-footer.png` });
await browser.close();
```

行動版同理:`setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })` 再拍關鍵段。

### 逐張比對

把 `pp-*.png` 逐張 `Read` 進來,對照同段參考圖,跑 `references/qa-checklist.md`。不到位的段落退回 `frontend-replication.md` 迭代。

---

## 階段 6:Cloudflare Pages 部署 + smoke test

### 部署前:查既有網域綁定(可逆原則)

```bash
npx wrangler pages project list
```

看使用者的自訂網域(如 `xxx.com`)目前綁在哪個專案。**新站一律部署成獨立的 `*.pages.dev`,不碰既有網域。** 要不要切網域是使用者的決定,部署完再問。

### 建專案 + 部署

```bash
cd <專案>/site
npm run build
npx wrangler pages project create <project-name> --production-branch=main
npx wrangler pages deploy dist --project-name=<project-name> --branch=main --commit-dirty=true
```

(注意:`pages deploy` 不會自動建專案,要先 `project create`。)

### 線上 smoke test

```bash
URL="https://<project-name>.pages.dev"
curl -s -o /dev/null -w "%{http_code}\n" "$URL"                    # 200
for f in assets/portrait.jpg src/styles.css src/data.js; do
  printf "%s " "$f"; curl -s -o /dev/null -w "%{http_code}\n" "$URL/$f"
done                                                               # 全 200
# 實拍線上首屏,Read 確認和本機一致
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --disable-gpu --window-size=1440,900 --screenshot="<scratchpad>/live.png" "$URL"
```

### 交付回報(主動,不等問)

- **網址**:`https://<project-name>.pages.dev`
- **Branch**:main / **Commit**:`<hash>`
- **是否併回**:獨立新專案,未動任何既有 Pages 專案
- **Worktree**:未使用 / 已清理
- **網域決策**:交還使用者 —— 保留 pages.dev / 切既有網域 / 用子網域,由他決定。

## 日後維護提示(留給使用者)

加專案或文章 → 只改 `site/src/data.js` 的陣列 → `npm run build` → 再 `wrangler pages deploy dist` 即可。
