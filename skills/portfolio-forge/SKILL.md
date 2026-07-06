---
name: portfolio-forge
description: 把個人資訊鍛造成美感極佳的個人網站/作品集。內容文檔當唯一真值 → taste-skill 生 section 參考圖 → 對抗式逐張評審迭代 → Codex Frontend App Builder 高保真複刻 → headless 逐段 QA → Cloudflare Pages 可逆部署。當使用者說「做個人網站」「做作品集」「personal website」「portfolio site」「把我的資訊做成網站」「幫我做個 landing」時觸發。
---

# Portfolio Forge

把「一個人的資訊」鍛造成**美感極佳、可上線**的個人網站。核心是一條被驗證過的流水線:**內容文檔(唯一真值)→ 參考圖 → 對抗式評審 → 高保真複刻 → 逐段 QA → 可逆部署**。

靈感來自「用 Codex 兩小時做個人網站」的四步法(整理內容 → taste 生參考圖 → 生素材 → 複刻),但這份 skill 額外固化了三個**真正決定質感、原文沒教**的環節:內容文檔防幻覺、對抗式逐張評審、上線前 headless 驗收。

## 何時觸發

- 「做個人網站」「做作品集」「把我的資訊做成網站」
- 「personal website」「portfolio」「幫我做個 landing page」
- 「我想有個對外的個人頁」「AI 時代個人網站就是履歷」
- 甚至只說「幫我做個站」「弄個網頁放我的東西」

## 前置依賴(第一次用先檢查)

這條流水線需要三個外部工具,缺了先裝(裝法見 `workflows/reference-image-gen.md` 與 `workflows/frontend-replication.md` 開頭):

1. **taste-skill 的 `imagegen-frontend-web`** — 生高審美 section 參考圖。裝到 `~/.claude/skills/` 與 `~/.codex/skills/`。
2. **Codex 的 `build-web-apps` plugin**(含 Frontend App Builder skill)— 高保真複刻。`codex plugin add build-web-apps@openai-curated`。
3. **Chrome + puppeteer-core** — headless QA 逐段截圖。

## 核心原則

1. **內容文檔是唯一真值**:動手前先把人物 profile / 定位 / 風格 / 色盤 / section 結構寫成一份 `CONTENT.md`。之後參考圖裡任何 AI 生的亂字、跟文檔不符處,**一律以文檔為準**。這是防幻覺的地基。
2. **對抗式逐張評審**:參考圖生出來不是拿去複刻,是拿去**挑戰**。每張圖問「字級爆了嗎?有呼吸感嗎?構圖落入 AI 套路嗎?有幻覺文字嗎?跨圖一致嗎?」不過關就單張重生。這一步決定成品是「像模像樣」還是「真的好看」。
3. **真實素材優先**:本人照片、專案截圖一律用真的。AI 只用來生「風格參考圖」和「風格化素材」,不用來假造人臉或截圖。使用者給了照片就直接上,不另外生。
4. **逐段 QA 才算完成**:複刻完不是交付,是驗收。用 puppeteer 真實捲動、逐 section 截圖,和參考圖並排比對,不到位就退回複刻階段迭代。
5. **可逆部署、不碰既有資產**:部署一律先上獨立 `*.pages.dev`。碰使用者現有網域前先查綁定關係,把「要不要切網域」當成使用者的決定,不自作主張。

## 工作流程(六階段)

### 階段 0:釐清定位(訪談收斂)
照 `workflows/content-intake.md`。用 `AskUserQuestion` 收斂關鍵決策:網站給誰看、定位、視覺風格、語言規模、素材來源、精選作品、主 CTA、部署目標。風格選項參照 `references/design-style-library.md`(taste 生圖時風格是最重要輸入)。

### 階段 1:內容文檔(唯一真值)
把訪談結果 + 抓取的外部資料(既有網站、Substack、社群)整理成 `CONTENT.md`,格式照 `references/content-doc-template.md`。這份文檔是後續所有階段的依據。

### 階段 2:生成 section 參考圖
照 `workflows/reference-image-gen.md`。把單頁拆成 6–8 個 section,用 `imagegen-frontend-web` **一 section 一張圖**生成(透過 `codex exec` 背景跑),存到 `refs/`。

### 階段 3:對抗式評審 + 迭代(靈魂)
照 `workflows/adversarial-design-review.md`。自己先用 Read 逐張看圖挑戰,再交給使用者評審。不過關的單張重生。**這一步會來回幾輪,是正常的,不要跳過。**

### 階段 4:高保真複刻
照 `workflows/frontend-replication.md`。把「定稿參考圖 + CONTENT.md + 真實素材」整包交給 Codex Frontend App Builder,以 1:1 復刻為目標,資料驅動 + 動畫 + RWD。

### 階段 5:逐段 QA
照 `workflows/headless-qa-and-deploy.md` 前半。puppeteer 真實捲動逐 section 截圖,對照參考圖用 `references/qa-checklist.md` 驗收。不到位退回階段 4。

### 階段 6:部署 + smoke test
照 `workflows/headless-qa-and-deploy.md` 後半。Cloudflare Pages 上獨立 `*.pages.dev` → 線上 headless smoke test(HTTP 狀態 + 資產載入 + 實拍首屏)→ 網域決策交還使用者。

## 子代理 / 工具設計

這條流水線的重活外包給 **Codex**(生圖、複刻),Claude 端負責訪談、寫文檔、對抗式評審、QA 驗收、部署編排。

- **生圖 / 複刻**:`codex exec --skip-git-repo-check --full-auto "<prompt>"`,用 `run_in_background: true` 背景跑,完成再驗收。
- **抓外部資料**:`WebFetch`(既有網站、Substack profile 與文章)。
- **截圖 QA**:headless Chrome 或 puppeteer-core(逐段截圖見 workflow 的踩坑筆記)。
- **部署**:`wrangler pages`。

平行策略:7–8 張參考圖在**一次** `codex exec` 內序列生成即可(imagegen skill 本身會逐張輸出);重生時只重跑要改的那幾張。

## 對外語氣

- 全程繁體中文,技術詞與識別碼保留原文。
- 每個階段先講「我要做什麼」,做完主動回報,不等問。
- 對抗式評審要直球:哪張圖哪裡不行,講清楚,給具體修改方向。
- 交付/部署後主動回報四件事:branch、commit hash、是否併回、worktree 是否清理。
- 觸及使用者既有網域/對外資產前,把決定權交還使用者。
