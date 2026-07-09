---
name: waitlist-launch
description: 替任何網站/專案從零建立並上線一個 waitlist(候補名單站):Cloudflare Worker + KV 收 email、Resend 同步、三層防濫用、og 分享卡、referral 迴圈、Web Analytics,含文案公式、曝光渠道 playbook 與上線 gate 驗收。當使用者說「建 waitlist」「候補名單」「coming soon 頁收 email」「上線前先收名單」「幫 XX 專案做個等候頁」時觸發;即使只說「我想先收一波 email 看有沒有人要」也要觸發。
---

# waitlist-launch — 候補名單站上線流程

萃取自 fare-waitlist 實戰(2026-07,early-fare.hengshiou.com,參考實作:
`/Users/xiuxiu/Documents/個人事宜/1_Projects/fare-waitlist`)。
核心理念:**KV 是名單唯一真值、防濫用不花 KV write、所有公開設定走 runtime var、
沒有 analytics 之前不導流、文案靠反推銷建立信任。**

## 三份角色文件(按需載入,不要一次全讀)

| 檔案 | 角色 | 何時讀 |
|---|---|---|
| `references/architecture.md` | 資訊架構師 | 動工時必讀:前置訪談清單、六階段流程、API/KV 契約(可照抄)、var vs secret 分界、工具權限表、驗證手冊、已知的坑 |
| `references/copywriting.md` | 行銷專員 | 寫頁面文案、分享文案、OG 圖、規劃導流渠道時讀:H1 痛點句式、lede 結構、consent 公式、反推銷準則、渠道 playbook + ref 歸因碼 |
| `references/operations.md` | 產品經理 | 上線前驗收與上線後營運時讀:gate 檢查清單(必須/應該兩級)、成功指標與虛榮指標、保溫節奏、決策邊界、迭代 backlog 模板 |

## 執行流程(orchestrator 視角)

1. **前置訪談**:照 `architecture.md` §1 的 9 個問題問使用者,拿不到答案不動工。
   特別注意:社群 handle 必須驗證(grep 使用者既有網站原始碼或請本人確認),不可用模型記憶猜。
2. **偵察現況**:若是既有 repo,先 `git log` 核對;確認 wrangler 登入帳號與 zone 權限。
3. **分階段實作**(詳細步驟、Done 定義見 `architecture.md` §2):
   - 階段一 基礎建站(Worker + assets + KV + custom domain)
   - 階段二 Resend 名單同步(best-effort + ops/sync 冪等補灌)
   - 階段三 防濫用三層(蜜罐 → 原生限流 → Turnstile,全部不花 KV write)
   - 階段四 個人品牌 footer(低調,視覺權重低於 CTA)
   - 階段五 曝光層(og:image → referral → analytics,**依序**,都改 index.html)
   - 階段六 部署驗證(smoke 清單 + cache-buster)
4. **文案**:每個文案位(H1/lede/bullets/consent/證明卡/分享語)套 `copywriting.md` 的公式,
   誠實勸退句必須是真的。
5. **上線 gate**:對照 `operations.md` §1 逐項打勾,「必須」級任一沒過不上線。
   沒有 analytics 之前不開始導流。
6. **上線後**:渠道帶 ref 碼歸因(`copywriting.md` §4)、名單破百再保溫、
   人數社會證明過門檻才顯示(`operations.md` §3)。

## 派工紀律(多 subagent 時)

- 多任務改同一檔案(典型:曝光層三子任務都改 index.html)→ **依序派工,不可並行**。
- 每個 subagent 任務交辦必含:只准改哪些檔、Done 定義、要求附實測證據(截圖/curl 輸出)、
  **不准 commit/deploy**。
- Orchestrator 逐任務驗收 diff + 親眼看關鍵產物(圖片一定要 Read 檢視),逐任務 commit,
  全部完成後統一一次 deploy + 線上 smoke。
- 交付回報四件事:branch、commit hash、是否已部署、worktree 是否清理。

## 需要使用者手動做的事(無法自動化,提早講)

- CF dashboard 建 **Turnstile site**(拿 site key + secret)
- CF dashboard 建 **Web Analytics site**(拿 beacon token;wrangler OAuth 無 RUM 權限,API 建不了)
- **Resend**:建 audience、產專用 API key(不沿用他站)、寄件網域 DNS 驗證
- Custom domain 第一次掛可能要在 dashboard 確認 DNS/憑證

程式先照 runtime var 模式寫好(`/api/health` 動態供給前端),上述憑證到位後填 var/secret
重新部署即生效,不用改碼——這讓「等憑證」不阻塞開發。

## 最容易踩的坑(完整清單見 architecture.md §5.3)

- headless Chrome 截 og 圖:`--force-device-scale-factor=1`(retina 會出 2x)+
  `--virtual-time-budget=4000`(等 webfont),截完親眼檢視(fallback 字型、標題孤兒行)。
- deploy 後邊緣快取回舊 HTML → 用 `?cb=<timestamp>` 驗證。
- 線上 Turnstile 強制後 curl 測不了 /api/join → 契約測試(正常/重複/蜜罐三案例)只能在本機
  wrangler dev 做(無 secret 自動跳過)。
- 蜜罐/限流回軟性成功但**不回 refCode**(不給 bot 資訊);已在名單回 already + 同一 refCode(冪等)。
- 明文 API key 出現在對話/檔案 → 立即改走 secret。
