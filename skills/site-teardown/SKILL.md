---
name: site-teardown
description: 把任何網站(單站或系列站)拆解成「視覺/佈局/功能/技術/串接服務」五層結構化記錄：Playwright全頁截圖(desktop+mobile)、讀原始碼補完技術細節、每站一篇md、跨站累積DESIGN-SYSTEM.md規律、最後產出「赤入れ拆解筆記」風格的HTML artifact供討論。當使用者說「拆解這個網站」「分析這個網站的設計/技術」「把這個網站記錄下來」「這個網站怎麼做的」「幫我研究這個站的美感/串接」「teardown」時觸發；給一個網站URL並想深入學習其設計與技術時也觸發。
---

# site-teardown — 網站拆解記錄流程

把一個網站（或一系列網站）拆成五層記錄下來，累積成「未來跟案主討論時可直接引用」的參考庫：

1. **視覺** — 色彩系統（實際色碼）、字體配對、排版風格、動畫語言
2. **佈局** — Desktop / Mobile 結構差異、區塊順序
3. **功能** — 互動、表單、預約、動態內容
4. **技術** — 框架、效能手法、hosting（從原始碼推斷，不猜）
5. **串接服務** — 外部 API / 後端 / 第三方服務，畫出資料流程

核心原則：**解說文章只當線索，原始碼才是真值**。作者的說明頁通常會省略後端串接細節與具體色碼，一律要用 curl 抓原始碼比對補完。

## 何時用

- 單一網站：使用者丟一個 URL 想深入學習其設計與技術
- 系列網站：像「100天建站企劃」這種同作者連續作品，逐篇記錄並累積跨站規律
- 續記：先前已建過 teardown 資料夾，這次補記新的站（先讀該資料夾的 README.md 接續）

## 產出物結構

在使用者指定位置（預設提議 `<專案目錄>/<slug>-teardown/`）建立：

```
<slug>-teardown/
├── README.md            ← 索引 + 本SOP摘要 + 進度追蹤表(系列站才需要)
├── DESIGN-SYSTEM.md     ← 跨站彙整規律，每記錄一站回頭更新一次
├── days/                ← 系列站用days/，單站可叫 records/
│   └── NNN-slug.md      ← 每站一篇，固定8個section(見下方模板)
├── screenshots/
│   └── NNN-slug-desktop.png / -mobile.png
└── tools/screenshot.js  ← 從本skill複製過去，讓資料夾自包含
```

加上一個 **HTML artifact**（用 Artifact 工具發佈）作為對使用者的視覺化呈現與討論介面。

## 標準流程

### 0. 開場確認（第一次建庫時）

用 AskUserQuestion 確認三件事（續記時跳過，直接讀既有 README.md）：
1. 要不要真實截圖（需要 Playwright；本機 Chromium 通常已快取，裝得很快）
2. 範圍：全部回溯 / 先做 1–2 篇範本確認格式 / 只架系統之後逐次餵
3. 存放位置

### 1. 偵察

- `curl` 抓目標頁原始碼，確認站點結構：是單站還是列表頁？有沒有「製作說明/about/blog」之類的解說頁連結？
- 系列站：列出所有子站連結與解說頁連結的 URL 格式

### 2. 截圖（Playwright）

- 腳本：本 skill 的 `scripts/screenshot.js`，用法 `node scripts/screenshot.js <url> <輸出.png> <寬度>`
- 每站截 desktop(1440) + mobile(390) 全頁
- **關鍵**：腳本會先模擬逐步捲動整頁再截圖——大量網站用 scroll-reveal / IntersectionObserver 進場動畫，不捲動會截到空白區塊。若截完發現大片空白，就是這個原因
- 環境沒裝時：在 scratchpad `npm install playwright && npx playwright install chromium`（先檢查 `~/Library/Caches/ms-playwright/` 是否已有 chromium，有就很快）
- 截完務必用 Read 工具目視檢查截圖是否正常，不要假設成功

### 3. 讀解說頁（若有）

用 WebFetch 讀作者的製作說明，摘錄：業主情境、設計理念、技術/工具、外部服務、**迭代決策過程**、**作者實際下的指示詞/prompt 原文**（這是最有學習價值的部分，盡量完整引用原文）。

### 4. 讀原始碼補完（必做，不可省略）

用 `curl` 抓該站：
- HTML `<head>`：meta、字體載入方式、CSS 載入策略、analytics、OGP
- CSS 的 `:root` 變數區：實際色碼與命名邏輯
- 外部 JS 檔：串接機制（API endpoint、JSONP、webhook、mock 開關）、可複用元件的註解線索

比對解說頁講的內容，補上沒講清楚的部分。特別留意：跨站複用的元件（同一套引擎換配色）、免費輕量後端方案（GAS、Cloudflare Workers、serverless）、隱私/資料最小化設計。

### 5. 寫記錄檔

每站一篇 md，固定 8 個 section：

```markdown
# DAY NNN / 站名 — 副標

- 業種／情境、網站連結、解說頁連結、截圖相對路徑
（系列站補：與前後站的脈絡關係，如「元件延用自DayNN」）

## 一句話定位        ← 引作者原文＋翻譯，或自己提煉
## 視覺設計          ← 色彩表(用途/色值/說明三欄)、字體、排版風格、動畫(含截圖注意事項)
## 版面佈局          ← Desktop與Mobile分列，記差異與「為什麼」
## 功能面
## 使用技術          ← 標明「從原始碼推斷」，列證據不空談
## 串接服務          ← 有外部服務時畫文字版資料流程圖，標明哪些細節解說頁沒揭露、需自行補完
## 作者迭代過程重點   ← 問題→修正的表格或列表 + 關鍵指示詞原文
## 對案主討論的啟發   ← 可直接拿去用的話術/報價分級/技術提案，這是整篇的落地出口
```

### 6. 更新 DESIGN-SYSTEM.md

跨站規律彙整，維持這幾類：色彩系統規律、字體配對規律（表格：站/標題字/內文字/調性）、版面佈局規律、動畫語言規律、技術棧規律、**給案主討論的話術庫**。每類都要寫成「可複用原則」而非流水帳。

### 7. HTML artifact 呈現

先載入 `artifact-design` skill，再產出單檔 HTML 發佈為 Artifact。已驗證有效的設計方向——「赤入れ拆解筆記」風格：

- **調性**：冷灰紙感背景（light `#EAEBE4` / dark `#15171A`）+ 明朝體標題 + 橫線稿紙背景（`linear-gradient` 重複線）
- **朱紅 `#B8391F`**（dark 模式 `#E27A56`）專門標註「作者原文指示」，像編輯紅筆批註；鋼藍 `#3C5A72` 做次要強調（連結/串接標籤）
- **每站一張 day-card**：左欄 sticky 截圖（desktop+mobile 兩張，白框裱起來像照片）、右欄 2×2 panels（色彩色票 / 字體樣本 / 版面示意圖 / 技術 chips），串接流程用橫向 flow-step 圖
- 迭代過程用「問題粗體 + 紅底引文」的 timeline；進度表用紅圈「済」印章標已完成
- 截圖嵌入方式：用 PIL 裁首屏（desktop 裁 1000px 高縮到 900 寬、mobile 裁 750px 高縮到 380 寬）壓成 JPEG quality~68，base64 內嵌（CSP 禁外部資源）。先在模板放 `__IMG_XXX__` 佔位符，再用 python 腳本替換，避免 base64 巨串進 context
- 必做：雙主題（`prefers-color-scheme` + `data-theme` 覆寫）、`prefers-reduced-motion`、IntersectionObserver 進場動畫要有 fallback
- **同一個庫永遠更新同一個 artifact URL**（同 session 同檔路徑重發即可；跨 session 用 `url` 參數），不要每次都發新頁

### 8. 收尾

- 更新 README.md 進度表
- 寫/更新 memory（專案記憶：資料夾位置、SOP要點、已發現的跨站技術規律、artifact URL）
- 主動回報：記錄了哪幾站、artifact 連結、下次續記怎麼接

## 系列站的續記模式

使用者之後丟新的一天/一站過來時：
1. 讀既有 README.md 與 DESIGN-SYSTEM.md 接上下文
2. 跑流程 2–7（跳過開場確認）
3. 特別留意新站是否延用了先前站的元件/配色/引擎——這種「量產化手法」是系列站最值得記錄的規律
