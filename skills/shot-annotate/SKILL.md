---
name: shot-annotate
description: 把「登入牆後的網頁後台」拍成真實截圖並做圖上標注，產出教科書級 HTML 教學文件（artifact）。當使用者說「截圖＋標注」「幫我拍後台做教學」「用真截圖做文件」「這個 SaaS 後台怎麼用做成圖解」「shot-annotate」時觸發；需要對 Resend/Stripe/Cloudflare 等需登入的 dashboard 做圖解說明時也觸發。公開網頁（無登入牆）不需本 skill，直接 Playwright headless 即可。
---

# shot-annotate：登入後台實拍 ＋ 圖上標注 → 教科書 HTML

## 這個 skill 解決什麼

AI agent 拿不到使用者私人後台的畫面：MCP/API token 只能走 API 通道，**API token ≠ 瀏覽器登入 session**。本 skill 用「使用者自己的瀏覽器 + AppleScript + macOS screencapture」繞過登入牆，拍到真實畫面，再以 HTML overlay 做標注釘，產出可對照操作的圖解文件。

實戰出處：2026-07-16 Fare × Resend 教科書（成功以 Arc 實拍 Resend 後台 6 頁，並勘誤了憑記憶重繪時的 3 個錯誤——真截圖的價值就是抓出這種錯）。

## 路由決策（先判斷，別直接開拍）

| 目標頁面 | 方法 |
|---|---|
| 公開網頁（無登入） | 不用本 skill，Playwright headless 截圖即可 |
| 登入牆後、使用者日常瀏覽器已登入（Arc/Chrome/Safari） | **主路徑：AppleScript 驅動使用者瀏覽器**（見下） |
| 登入牆後、瀏覽器未登入 / 非 macOS | 備援：Playwright 有頭視窗 + 持久 profile，請使用者登入一次 |

### 為什麼不能用 CDP 連使用者的真實瀏覽器
Chromium 136+ 基於安全，**禁止對「預設 user profile」開 remote debugging**（Arc/Chrome 全中）。加 `--user-data-dir` 換新 profile 就沒有登入 session，白換。所以主路徑完全不碰 CDP，改用 AppleScript 導航 + 系統截圖。

## 主路徑 Workflow（macOS + Chromium 系瀏覽器，以 Arc 為例）

### Phase 0：前置確認
1. 確認瀏覽器在跑：`pgrep -x Arc`（Chrome 則 "Google Chrome"）。
2. 跟使用者確認目標後台**已在該瀏覽器登入**。
3. 權限提醒（第一次跑會彈系統對話框，請使用者允許）：
   - 自動化（osascript → Arc）
   - 螢幕錄製（screencapture，沒權限會拍出黑圖/桌布）
   - 輔助使用（System Events 讀視窗座標）

### Phase 1：導航 + 取景框
```bash
# 開新分頁（之後重用同一分頁換 URL 即可）
osascript -e 'tell application "Arc"
  activate
  tell front window to make new tab with properties {URL:"<目標URL>"}
end tell'

# 換頁（重用分頁）
osascript -e 'tell application "Arc" to set URL of active tab of front window to "<URL>"'

# 取視窗座標（一次即可，之後沿用）
osascript -e 'tell application "System Events" to tell process "Arc"
  set p to position of front window
  set s to size of front window
  return (item 1 of p as text) & "," & (item 2 of p as text) & "," & (item 1 of s as text) & "," & (item 2 of s as text)
end tell'
```

### Phase 2：內容區裁切（隱私關鍵，不可省）
**不要拍整個視窗**——瀏覽器 sidebar/分頁列會洩露使用者其他分頁的標題（私人專案、金流後台名稱）。從視窗座標推算「網頁內容區」：
```
內容區 x = 視窗x + sidebar寬(Arc 約 228pt)
內容區 y = 視窗y + 工具列高(約 45pt)
screencapture -x -R"<x>,<y>,<w>,<h>" out.png
```
第一張先拍全窗確認 sidebar 實際寬度，之後全部用內容區。

### Phase 3：逐頁拍攝 + 逐張複驗（鐵律）
- SPA 後台載入慢：預設 `sleep 5`，重型頁（編輯器類）`sleep 10-12`。
- **每張圖拍完必須用 Read 看過**才算數，檢查四種失敗：
  1. 載入 spinner（等太短 → 加時重拍）
  2. 404 / 行銷頁（URL 猜錯 → 換路徑）
  3. 黑圖 / 桌布（螢幕錄製權限沒開）
  4. 登入頁（session 沒帶到）
- 對應「複驗而非敘述」原則：沒 Read 過的截圖不准寫進文件。

### Phase 4：PII 檢查
發佈前逐張問：圖裡有沒有**他人的** email、姓名、金額、token？
- 名單表格類頁面：**載入中的 skeleton 狀態反而是完美素材**（結構清楚、零 PII）——故意在載入完成前截圖是合法技巧。
- 有 PII 又必須用：裁掉該區域，或改用示意重繪。

### Phase 5：壓縮
```bash
sips --resampleWidth 1500 -s format jpeg -s formatOptions 82 in.png --out out.jpg
```
目標：單張 100–250KB，全文件 base64 後 < 5MB。

### Phase 6：組裝標注文件
1. HTML 模板中圖片用佔位符 `__IMG_S1__`（**不要**直接把 base64 寫進 Write 的內容）。
2. 標注釘：絕對定位 + 百分比座標，疊在圖上：
```html
<div class="real" style="position:relative">
  <img src="__IMG_S1__" style="width:100%;display:block">
  <span class="rpin" style="left:45.8%; top:27.9%">1</span>
</div>
<!-- .rpin: position:absolute; transform:translate(-50%,-50%);
     圓形 22px、洋紅底白字、白色外圈 box-shadow 增加對比 -->
```
   座標換算：Read 圖片時會顯示 displayed 尺寸，`left% = x/顯示寬`、`top% = y/顯示高`。
3. 每張圖配 `<ul class="legend">`：釘號 + 一句話說明（指出「這顆按鈕做什麼、按下去會發生什麼」）。
4. **實拍 vs 示意要標籤區分**（綠標「實拍」/ 粉標「示意」）：拍不到的未建功能用重繪，但必須誠實標示。
5. Python 替換佔位符 → 最終檔 → Artifact 發佈（更新時用同一檔案路徑保 URL）。

### Phase 7：勘誤（本 skill 的靈魂）
真截圖到手後，**主動對照先前憑記憶/文件寫的說明**，把對不上的地方寫成顯眼的「實地勘誤」區塊。實戰中真截圖平均能抓出 2–3 個記憶錯誤（UI 改版、功能入口變了、數字不準）——這是使用者要求真截圖的核心價值，別只換圖不勘誤。

## 備援路徑：Playwright 有頭登入

使用者瀏覽器沒登入、或非 macOS 時：
```js
// launchPersistentContext(profileDir, {headless:false, args:['--remote-debugging-port=9222']})
// 開登入頁 → 使用者親自登入（帳密不經過 agent）→ connectOverCDP 接手截圖
```
- profile 放 scratchpad，session 可跨次重用；結束後可整個刪除。
- 用 `run_in_background` + keep-alive；**提醒使用者別關視窗**（關窗 = node exit 13）。
- 絕不代收帳密；絕不建議使用者貼 cookie。

## 踩坑速查

| 症狀 | 原因 | 解法 |
|---|---|---|
| API 回報成功但畫面/讀回值沒變 | 該設定在此版 UI 綁定其他前置條件 | 以實拍畫面為準，走 UI 流程 |
| CDP 連不上使用者瀏覽器 | Chromium 136+ 禁真實 profile 開 debug port | 改 AppleScript + screencapture |
| 截圖是黑的 | 終端機沒有螢幕錄製權限 | 系統設定 → 隱私權 → 螢幕錄製 |
| 截圖是登入頁 | 該瀏覽器沒登入 / session 過期 | 請使用者登入後重拍 |
| 拍到 spinner | SPA 未載入完 | sleep 加倍重拍 |
| Write 大檔失敗/爆 context | base64 直接寫進模板 | 佔位符 + python 替換 |
| 釘子位置飄 | 用了絕對 px 而非 % | 一律百分比 + translate(-50%,-50%) |

## 交付檢查清單
- [ ] 每張實拍圖都 Read 複驗過
- [ ] 無他人 PII
- [ ] 實拍/示意標籤齊全
- [ ] 每釘有圖例、每圖有 figcaption
- [ ] 與舊敘述矛盾處已寫進勘誤區塊
- [ ] artifact 已發佈；更新沿用同一 URL
- [ ] 暫存 profile / 原始 PNG 已清理
