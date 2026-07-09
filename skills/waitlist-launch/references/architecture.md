# Waitlist 上線 Skill 骨幹(資訊架構)

來源:fare-waitlist 專案實戰(2026-07,https://early-fare.hengshiou.com)。本檔只涵蓋流程、規格、工具、驗證,不含文案準則與上線後營運指標。

---

## 1. 前置訪談清單(動工前必須向使用者確認)

這些問題若不問就動工,後面階段會被迫返工(尤其子網域、寄件網域、社群 handle)。

| # | 問題 | 為什麼必須先問 | 備註 |
|---|------|----------------|------|
| 1 | 專案/產品名(中英文)、一句話定位 | 決定 `wrangler.jsonc` 的 `name`、`<title>`、og:title | — |
| 2 | 痛點一句話(要放 H1) | 決定頁面第一屏文案基調,但**內容本身交文案角色**,這裡只確認「有沒有」,不代寫 | — |
| 3 | 候補站要掛哪個子網域?該 zone 是否已在 Cloudflare 管理? | 決定 `wrangler.jsonc routes[].pattern` + `custom_domain: true` 能不能直接生效 | custom domain 需在 CF dashboard 有該 zone 的權限,可能要使用者手動加 DNS |
| 4 | 是否要接 Resend?寄件網域(如 `hengshiou.com`)是否已在 Resend 完成 DNS 驗證? | 未驗證的網域寄信會進垃圾信或被拒;決定「先只寫 KV」還是「一開始就同步」 | 未驗證 → 先上「只寫 KV」版本,驗證後再補 `RESEND_API_KEY`/`RESEND_AUDIENCE_ID`,不用改碼 |
| 5 | 品牌色(hex)、字型(webfont 來源) | 決定頁面 CSS 變數與 og.html 要複用的樣式 | 若無明確品牌色,問使用者要哪個既有站的視覺當基準 |
| 6 | 個人/品牌社群帳號清單(X、Threads、個人站、Substack…) | footer 社群連結、Threads 轉發文案要用的 handle | **handle 必須驗證,不能瞎猜**——優先去使用者其他網站原始碼 grep 出來確認,或直接請使用者提供帳號網址逐一貼上核對;曾發生 Threads handle 猜錯被使用者糾正 |
| 7 | 是否要接 CF Web Analytics? | 決定曝光層階段要不要留 beacon 注入邏輯的空位 | dashboard 手動步驟(見第4節),無法用現有 wrangler OAuth token 走 API 建立 |
| 8 | 是否要防濫用(Turnstile)?能否在 CF dashboard 建立 Turnstile site 拿 site key/secret? | 決定防濫用階段要不要留「未設定時跳過」的兼容邏輯 | dashboard 手動步驟 |
| 9 | 維運端點(`/api/ops/*`)要不要開、OPS_KEY 誰保管? | 決定要不要留維運後門 | 純內部用,secret 產生後直接給使用者存,不進 repo |

---

## 2. 分階段流程

六個階段,對應 git log 的 10 個 commit(已合併同主題的收尾 commit)。**階段 1 必須最先做**(建立骨架);之後的依賴關係與可並行性見各階段「排程說明」。

### 階段一:基礎建站
- **目標**:獨立 Worker + 靜態頁 + KV,能吃 `/api/join` 寫入、不依賴任何第三方服務。
- **步驟**:
  1. `wrangler.jsonc`:設定 `name`、`main: worker/index.ts`、`assets.binding: ASSETS` + `assets.directory: public` + `run_worker_first: ["/api/**"]`、`kv_namespaces`(先 `wrangler kv namespace create` 拿 id)、`routes`(子網域 + `custom_domain: true`)。
  2. `worker/env.ts`:定義 `Env` type(`ASSETS: Fetcher`、`WAITLIST: KVNamespace`,其餘欄位待後續階段補)。
  3. `worker/index.ts`:實作 `/api/health`(先回極簡 `{ok:true}`)、`/api/join`(email 格式驗證 → 查重 → 寫 KV)、其餘路徑落到 `env.ASSETS.fetch(req)`。
  4. `public/index.html`:landing page 骨架(表單、成功/失敗訊息區、CSS 變數化的品牌色/字型)。
  5. `tsconfig.json`、`package.json`(`dev`: `wrangler dev`、`deploy`: `wrangler deploy`)。
- **工具/憑證**:wrangler CLI、CF 帳號權限(建 KV namespace、建 custom domain route)。
- **產出物**:可 `wrangler dev` 本機跑通的最小候補站;`wrangler deploy` 後子網域可訪問。
- **Done 定義**:本機 `curl -X POST /api/join` 能寫入 KV 且查重生效;線上子網域 200。
- **排程說明**:必須最先做,其餘階段都疊加在此骨架上。

### 階段二:名單同步(Resend)
- **目標**:KV 寫入成功後 best-effort 同步到 Resend Audience,未設定時不影響報名。
- **步驟**:
  1. `worker/env.ts` 補 `RESEND_API_KEY?`(secret)、`RESEND_AUDIENCE_ID?`(var)、`RESEND_FROM?`(var)。
  2. `worker/index.ts` 加 `addToResend()`:未設定金鑰直接回 false,不拋錯;呼叫失敗（含 409/422 已存在）視同不阻斷主流程。
  3. `WaitRecord` 加 `synced: boolean` 欄位;`handleJoin` 寫 KV 前呼叫 `addToResend`,結果存進 `synced`。
  4. 加 `/api/ops/sync`(需 `OPS_KEY`):掃描 KV 內 `synced=false` 的 record,補灌 Resend,冪等可重複跑。
  5. `wrangler secret put RESEND_API_KEY`(專用新 key,不沿用其他站的 key)。
- **工具/憑證**:Resend 帳號 + API key(新建,scope 僅該 audience)、寄件網域已驗證(前置訪談問過)。
- **產出物**:`/api/ops/sync` 可用;`RESEND_AUDIENCE_ID` 填入 `wrangler.jsonc` vars。
- **Done 定義**:未設定 Resend 金鑰時 `/api/join` 仍正常寫 KV;設定後新報名 `synced: true`,舊資料跑一次 `/api/ops/sync` 補灌。
- **排程說明**:與階段三都改 `worker/index.ts` + `worker/env.ts` + `wrangler.jsonc`,**必須依序**、不可與階段三並行(同檔案衝突)。

### 階段三:防濫用
- **目標**:三層防禦(蜜罐 → 原生限流 → Turnstile)全部不花 KV write,查重與寫入放最後。
- **步驟**:
  1. `wrangler.jsonc` 加 `ratelimits`(`namespace_id` 任意唯一數字字串、`simple.limit`/`period`,period 僅支援 10 或 60)。
  2. `worker/env.ts` 補 `RateLimit` interface + `JOIN_RL: RateLimit`、`TURNSTILE_SITE_KEY?`(var)、`TURNSTILE_SECRET_KEY?`(secret)。
  3. `worker/index.ts` `handleJoin` 補上蜜罐欄位檢查(擋下回軟性成功,不寫入)→ `env.JOIN_RL.limit()` 檢查(擋下回軟性成功,不洩漏限流細節)→ `verifyTurnstile()`(SECRET 未設時直接放行,設了才真的打 `https://challenges.cloudflare.com/turnstile/v0/siteverify`)→ 才進查重與寫入。
  4. `/api/health` 加 `turnstileSiteKey` 欄位,回傳 `env.TURNSTILE_SITE_KEY ?? null`。
  5. `public/index.html` 蜜罐欄位(`tabindex="-1" aria-hidden="true"` 的隱藏 input)+ Turnstile widget 容器(`explicit render`,前端 `fetch("/api/health")` 拿到 site key 才渲染)。
  6. 使用者在 CF dashboard 手動建 Turnstile site,拿到 site key + secret 後:`wrangler secret put TURNSTILE_SECRET_KEY`,`TURNSTILE_SITE_KEY` 填進 `wrangler.jsonc` vars 重新部署。
- **工具/憑證**:CF dashboard(手動建 Turnstile site,無法 API 建)、`wrangler secret put`。
- **產出物**:`/api/join` 具備三層防禦;`TURNSTILE_SITE_KEY` 到位前功能仍可用(跳過驗證)。
- **Done 定義**:本機測試三案例(正常/蜜罐/超過限流次數)行為符合預期;`npx tsc --noEmit` 過。
- **排程說明**:與階段二依序(理由同上)。可以是同一位工程師連續做兩階段,不需要分開派工。

### 階段四:個人品牌 footer
- **目標**:低調的作者導流(byline + 社群 icon),視覺權重低於 email CTA。
- **步驟**:
  1. 確認社群 handle(見前置訪談 #6——去使用者其他網站原始碼 grep 驗證,不可用訓練記憶猜)。
  2. `public/index.html` footer 區塊加 byline + 4 個 monochrome icon 連結(X/Threads/個人站/Substack),`18px icon`、`38px hit area`、預設 `zinc-400`、hover 品牌綠、`focus-visible outline`、`target="_blank" rel="noopener noreferrer"`、`aria-label`。
  3. CSS 只加 footer 區塊樣式,不動表單/CTA 區。
- **工具/憑證**:無外部憑證;需使用者提供/確認社群連結。
- **產出物**:footer 區塊 diff。
- **Done 定義**:headless 截圖檢視 footer 視覺權重確實低於主 CTA;連結逐一人工核對(不是猜的)。
- **排程說明**:只動 `public/index.html` 的 footer 區塊,理論上可與階段二/三（只動 worker 端檔案）並行;但因階段五的曝光層任務也會大量改 `index.html`,**建議在階段五開始前先完成並 commit**,避免與階段五疊在同一輪 diff 裡難以 review。

### 階段五:曝光層(og:image / referral / analytics)
- **目標**:社群分享有正確預覽卡、報名成功後可一鍵轉發、免費無 cookie 流量分析。
- **內部三個子任務全部改 `public/index.html`(部分也改 `worker/index.ts`/`worker/env.ts`),必須依序派工,不可並行**——這是本次上線最大的排程教訓(見第5節「派工方法論」)。
- **子任務 5a:og:image**
  - 步驟:另寫一個 `og.html`(scratch 檔,不進 repo),複用頁面 CSS 變數與試算卡結構,尺寸 1200×630;用 headless Chrome 截圖存成 `public/og.png`。關鍵 flag:`--force-device-scale-factor=1`(避免 retina 出 2400px 圖)、`--virtual-time-budget=4000`(等 webfont 載入)。截完**要親眼 Read 檢視**:字型是否 fallback、標題是否孤兒行(遇過 56px 換行剩「了。」單獨一行 → 降字級 + `white-space: nowrap` 解決)。
  - `public/index.html` `<head>` 補 meta 六件套:`og:url`、`og:image`、`og:image:width`/`og:image:height`、`twitter:card=summary_large_image`、`twitter:image`,一律絕對網址。
  - 產出物:`public/og.png`(1200×630)+ meta 標籤。
  - Done 定義:本機截圖檢視無孤兒行、無 fallback 字型;線上 `curl -I https://<domain>/og.png` 200。
- **子任務 5b:referral 迴圈**
  - 步驟:`worker/index.ts` 加 `makeRefCode()`(Web Crypto SHA-256 email,取前 8 hex);`handleJoin` 成功回應加 `refCode` 欄位(蜜罐/限流的軟性成功**不回** refCode,不給 bot 資訊;已在名單者回 `already:true` + 同一 refCode,冪等)。`public/index.html` 成功態顯示 `${origin}/?ref=r_<code>` + 複製按鈕(clipboard API,execCommand fallback)。歸因沿用既有 `source` 欄位(前端把 URL 上的 `?ref=` 送進 `body.ref`)。
  - 產出物:`/api/join` response 新增 `refCode` 欄位;成功態 UI 有連結 + 複製按鈕。
  - Done 定義:headless 瀏覽器實測複製按鈕真的把連結寫進剪貼簿;curl 驗證三種身分(新報名/重複/蜜罐)各自該不該回 refCode。
- **子任務 5c:analytics + Threads 轉發**
  - 步驟:`worker/env.ts` 補 `WEB_ANALYTICS_TOKEN?`(var);`/api/health` 加 `webAnalyticsToken` 欄位。`public/index.html` 前端拿到 token 才動態注入 CF Web Analytics beacon script(未設定時完全不注入,不影響頁面)。成功態加「轉發到 Threads」按鈕,用官方 intent `https://www.threads.com/intent/post?text=<encoded 文案+連結>`。
  - 使用者在 CF dashboard 手動建 Web Analytics site(Analytics & Logs → Web Analytics),因為現有 wrangler OAuth token 沒有 RUM 權限、**無法用 API 建 site**。拿到 beacon token 後填進 `wrangler.jsonc` vars 重新部署即生效,不用改碼(前提是步驟已照 runtime var 模式寫好)。
  - 產出物:beacon 注入邏輯就緒;拿到 token 後啟用。
  - Done 定義:線上 `--dump-dom` 檢查 beacon script 真的被注入;`/api/health` 回傳欄位齊全。
- **排程說明**:5a → 5b → 5c 依序做,每個子任務結束都先 commit 再進下一個(見第5節)。

### 階段六:部署驗證
- **目標**:確認線上行為與本機一致,快取/邊緣層沒有回退版本。
- **步驟**:見第5節「驗證手冊」的線上 smoke 清單。
- **工具/憑證**:`wrangler deploy`、curl、headless Chrome。
- **產出物**:一份 smoke 檢查結果(可以是 orchestrator 的驗收記錄,不必是檔案)。
- **Done 定義**:第5節線上 smoke 全過。
- **排程說明**:永遠最後做,且只在前面所有階段都已 commit 後跑一次 `deploy`(不要每階段都 deploy,除非該階段本身就是驗證用途)。

---

## 3. 架構契約(可直接照抄)

### 3.1 `/api/health`(GET,無需驗證)
```json
{
  "ok": true,
  "resendConfigured": true,
  "turnstileSiteKey": "<TURNSTILE_SITE_KEY>" ,
  "webAnalyticsToken": "<WEB_ANALYTICS_TOKEN>"
}
```
- `resendConfigured`:`Boolean(env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID)`。
- `turnstileSiteKey` / `webAnalyticsToken`:未設定回 `null`;前端據此決定要不要渲染 Turnstile widget / 注入 analytics beacon。**這是 runtime var 模式的核心接口——所有公開設定都從這裡動態餵給前端,不寫死在 HTML。**

### 3.2 `POST /api/join`
- 請求 body:
```json
{ "email": "user@example.com", "website": "", "ref": "r_ab12cd34", "turnstileToken": "..." }
```
  - `website`:蜜罐欄位,前端隱藏 input,人類不會填。
  - `ref`:選填,對應 URL 上的 `?ref=` 參數,存進 KV record 的 `source` 欄位(截 40 字元)。
  - `turnstileToken`:Turnstile widget 回傳的 token;`TURNSTILE_SECRET_KEY` 未設時可留空。
- 回應(依處理路徑不同):

| 情境 | HTTP | body | 是否寫 KV |
|------|------|------|-----------|
| 蜜罐命中 | 200 | `{ok:true, message:"感謝加入!"}` | 否 |
| 超過限流 | 200 | `{ok:true, message:"已收到,謝謝!"}` | 否(軟性成功,不洩漏限流細節) |
| Turnstile 未通過 | 400 | `{error:"驗證未通過,請重新整理頁面再試一次。"}` | 否 |
| email 格式錯 | 400 | `{error:"email 格式不太對,再確認一下?"}` | 否 |
| 已在名單 | 200 | `{ok:true, already:true, message:"...", refCode:"<8hex>"}` | 否(read only) |
| 新報名成功 | 200 | `{ok:true, message:"成功加入候補名單...", refCode:"<8hex>"}` | 是(唯一一次 write) |

- `refCode` = SHA-256(email) 前 8 hex 字元(Web Crypto,server 端算,不存進 KV,每次即時算)。**軟性成功(蜜罐/限流)不回 refCode**——不給 bot 可用資訊。

### 3.3 `/api/ops/count`(GET,需 `?key=<OPS_KEY>`)
- `OPS_KEY` 未設定或 key 不符 → 404 `{error:"not found"}`(刻意偽裝不存在,不是 401/403)。
- 成功:`{total: <number>}`,掃描 KV `prefix: "email:"` 全量計數(分頁 `list_complete`/`cursor`)。

### 3.4 `POST /api/ops/sync`(需 `?key=<OPS_KEY>`)
- 404 條件同上;另外 `RESEND_API_KEY`/`RESEND_AUDIENCE_ID` 未設回 400 `{error:"Resend 尚未設定..."}`。
- 成功:`{synced: n, failed: n, skipped: n}`。冪等——只處理 KV record 中 `synced: false` 的項目,重跑不會重複計。

### 3.5 KV schema(`WAITLIST` namespace)
- key:`email:<lowercase email>`
- value(JSON string):
```json
{
  "email": "user@example.com",
  "createdAt": "2026-07-08T10:00:00.000Z",
  "source": "r_ab12cd34",
  "synced": false
}
```
- KV 是名單**唯一真值**,必成功才算報名成立。Resend 是其上疊加的 best-effort 同步層,`synced` 欄位追蹤同步狀態。

### 3.6 runtime var vs secret 分界表

| 欄位 | 型態 | 存放位置 | 理由 |
|------|------|----------|------|
| `RESEND_FROM` | var | `wrangler.jsonc` vars | 寄件位址,公開資訊 |
| `RESEND_AUDIENCE_ID` | var | `wrangler.jsonc` vars | Audience id 非敏感,列表層級識別碼 |
| `RESEND_API_KEY` | **secret** | `wrangler secret put` | 有寫入權限的金鑰,外洩可被濫發信/污染名單 |
| `TURNSTILE_SITE_KEY` | var | `wrangler.jsonc` vars,經 `/api/health` 回給前端 | 設計上就是要嵌進前端頁面的公開值 |
| `TURNSTILE_SECRET_KEY` | **secret** | `wrangler secret put` | 用來向 CF 驗證 token,外洩可偽造驗證結果 |
| `WEB_ANALYTICS_TOKEN` | var | `wrangler.jsonc` vars,經 `/api/health` 回給前端 | beacon token 本來就是公開嵌入頁面的值 |
| `OPS_KEY` | **secret** | `wrangler secret put` | 維運後門,外洩可讀取/操縱全部名單 |

**鐵律**:任何要出現在前端 HTML/JS 的設定一律 var + `/api/health` 動態注入,不寫死在 `index.html` 裡(否則改值要重新 build/deploy 前端資產,而且部署前值未到位時無法留白)。任何有「執行動作/驗證特權」的金鑰一律 secret,且**每個專案用專屬新 key**,不沿用其他站已存在的 key(避免一站外洩牽連多站)。

---

## 4. 工具與權限對照表

| 步驟 | 工具 | 能否自動化 | 備註 |
|------|------|-----------|------|
| 建 Worker 專案骨架 | `wrangler` CLI | 可自動化 | `wrangler init` / 手寫 `wrangler.jsonc` |
| 建 KV namespace | `wrangler kv namespace create` | 可自動化 | 拿到 id 填回 `wrangler.jsonc` |
| Custom domain 路由 | `wrangler.jsonc routes[].custom_domain` + CF dashboard | **需人工**(部分) | zone 要在該 CF 帳號下;第一次掛可能要使用者在 dashboard 確認 DNS/憑證核發 |
| Rate Limiting binding | `wrangler.jsonc ratelimits` | 可自動化 | 純設定檔,無需 dashboard |
| Secret 寫入 | `wrangler secret put <NAME>` | 可自動化(需使用者提供值) | 值本身(API key)通常要使用者去對應服務 dashboard 產生 |
| Resend Audience/API key | Resend dashboard | **需人工** | 建 audience、產生 API key、驗證寄件網域 DNS |
| Turnstile site 建立 | CF dashboard(Turnstile) | **需人工,無法 API 建** | 拿 site key(公開)+ secret key |
| CF Web Analytics site 建立 | CF dashboard(Analytics & Logs → Web Analytics) | **需人工,無法 API 建**(現有 wrangler OAuth token 無 RUM 權限) | 拿 beacon token,填進 var 即生效不用改碼 |
| og:image 截圖 | headless Chrome(`--headless --screenshot`) | 可自動化 | 關鍵 flag 見階段五 5a |
| 本機端到端測試 | `wrangler dev` + `curl` + headless Chrome | 可自動化 | Turnstile 在無 secret 時本機自動跳過,方便測 |
| 型別檢查 | `npx tsc --noEmit` | 可自動化 | 每次改 worker 程式碼後必跑 |
| 部署 | `wrangler deploy` | 可自動化 | 建議所有階段 commit 完再跑一次,不要每階段都部署 |
| 社群 handle 驗證 | grep 使用者其他網站原始碼 / 直接請使用者確認連結 | **需人工核對,不可用模型記憶猜測** | 唯一一條「資訊正確性」硬性規則 |

---

## 5. 驗證手冊

### 5.1 本機端到端
1. `wrangler dev` 啟動(本機 KV 是隔離的沙盒儲存,不會污染線上名單;`TURNSTILE_SECRET_KEY` 未設時伺服器自動跳過驗證,方便測試)。
2. `curl` 打 `/api/join` 至少三個案例:
   - 正常新報名(合法 email、無蜜罐、通過限流)→ 期待 `ok:true` + `refCode`。
   - 重複報名(同一 email 再打一次)→ 期待 `already:true` + 相同 `refCode`。
   - 蜜罐命中(`website` 欄位填非空字串)→ 期待軟性成功訊息、**不含** `refCode`,且 KV 未新增 key(可用 `/api/ops/count` 前後比對或直接查 KV)。
3. headless 瀏覽器實測 UI:表單提交流程、複製連結按鈕(clipboard API 是否真的寫入)、Turnstile widget 渲染(若已設定 site key)。
4. `npx tsc --noEmit` 必須無錯誤才能進下一步。

### 5.2 線上 smoke 清單
- `/api/health` 回應欄位齊全(`ok`、`resendConfigured`、`turnstileSiteKey`、`webAnalyticsToken` 依當下設定狀態正確反映)。
- `curl -I https://<domain>/og.png` 200,且 headless 截圖親眼檢視圖片內容(字型無 fallback、標題無孤兒行)。
- 頁面 `<head>` meta 六件套齊全,用絕對網址。
- `--dump-dom` 檢查 Web Analytics beacon script 是否真的被注入(前提是 `webAnalyticsToken` 已設定)。
- 各平台 OG debugger(Facebook/Threads/X)刷新一次,確認抓到最新 og:image(平台側快取問題,非本站控制範圍,但屬於上線驗證動作)。

### 5.3 已知的坑
- **cache-buster**:deploy 後 CF 邊緣快取可能還回舊 HTML,驗證線上內容時要在 URL 加 `?cb=<timestamp>` 之類的參數繞過快取,否則會誤判「沒生效」。
- **retina 截圖尺寸**:headless Chrome 預設在 retina 環境下截圖會出 2× 尺寸(1200×630 變 2400×1260),og:image 規格要求精確 1200×630,務必加 `--force-device-scale-factor=1`。
- **webfont 載入時機**:截圖時機太早字型還沒載完會 fallback 到系統字,務必加 `--virtual-time-budget=4000`(或等效等待機制)並事後親眼 Read 檢視圖片,不能只看「截圖成功」就當作過關。
- **`tsc --noEmit` 一定要跑**:worker 程式碼是 TypeScript,型別錯誤在 `wrangler dev` 底下不一定會立即爆炸,必須顯式跑型別檢查。
- **線上 Turnstile 強制後無法 curl 直測 `/api/join`**:`TURNSTILE_SECRET_KEY` 設定後,線上環境會真的驗證 token,curl 沒有合法 token 一定被擋。契約測試(三案例)只能在本機(未設 secret,自動跳過)做,線上只驗證「端點有回應、行為合理」,不驗證完整成功路徑。
- **成功態 UI 無法用 curl 驗**:複製連結按鈕、Threads 轉發按鈕等純前端互動,curl 看不到。做法:複製 `index.html` 到 scratchpad、強制該區塊 `display:block` 並塞入假資料(模擬成功態),再用 headless 截圖檢視版面與互動元素是否正確渲染。

### 5.4 派工方法論(多任務改同一檔案時)
- 同一輪若有多個任務都會改到同一個檔案(典型案例:曝光層三子任務都改 `public/index.html`),**必須依序派工,不可平行**——平行 Edit 同檔案會互相覆蓋/衝突。
- 每個任務出去前講清楚:只准改哪些檔案、Done 定義是什麼、要求附實測證據(截圖/curl 輸出)、**不准自己 commit/deploy**,由發派方驗收後統一處理。
- 驗收時親自看 diff + 關鍵產物(圖片類產物一定要親眼 Read,不能只信任務回報「已完成」)。逐任務 commit,所有任務做完後才跑一次 `deploy`(對應第2節階段六)。
