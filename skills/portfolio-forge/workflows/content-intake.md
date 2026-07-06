# 階段 0–1:定位訪談 + 內容文檔

目標:把「一個人的資訊」收斂成一份定稿的 `CONTENT.md`(唯一真值)。做圖前必須完成這一步。

## 步驟 1:訪談收斂(AskUserQuestion)

用 `AskUserQuestion` 收斂關鍵決策,一次問 3–4 題,能給 preview 就給。核心要問到:

1. **定位目標**(多選):網站給誰看、希望對方做什麼?(開發者 IP / 接案名片 / 求職履歷 / 內容創作者…)
2. **視覺風格**(單選,附 ASCII preview):參照 `references/design-style-library.md` 的四種風格。**這題最重要**,直接決定參考圖長相。
3. **語言與規模**:中文 / 英文 / 雙語;單頁 / 多頁。
4. **素材來源**:照片 AI 生成 / 用本人真照片 / 不放頭像。

第二輪(視情況)再問:精選作品有哪些、主 CTA 是什麼、部署目標、名字在站上怎麼呈現(英文名 / 中文名 / 網路 ID 當 hero 大字)、強調色選哪個。

## 步驟 2:抓外部資料(不腦補)

使用者若有既有網站 / Substack / 社群,用 `WebFetch` 抓真實資料補進文檔:

- 既有個人站 → 抓自我介紹、技能、經歷(**引用原文**)。
- Substack profile → 抓 bio、出版物描述、訂閱數。
- Substack / blog 文章 → 抓標題、副標、摘要、發佈日期(給 Writing 區用)。
  - 注意:`substack.com/@handle/note/p-xxx` 常 302 跳轉到 `handle.substack.com/p/slug`,跟著 redirect URL 再抓一次。

## 步驟 3:寫 CONTENT.md

照 `references/content-doc-template.md` 的格式,把訪談 + 抓取資料整理成文檔。重點:

- 定位標籤(overline)和 tagline 分清楚。
- About 要短(主句 + 標籤 + 短句)。
- Projects / Writing 標註「資料驅動、可擴展」。
- Footer 連結全部填真實 URL。

## 步驟 4:定稿確認

tagline、強調色這類「一句話定案」的欄位,用 `AskUserQuestion` 給選項讓使用者拍板(附 preview)。定案後在文檔標「已定稿(日期)」,並把 hero/about 等受影響段落同步更新。

## 步驟 5:準備真實素材

- 本人照片:複製到 `assets/portrait.jpg`,`sips -g pixelWidth -g pixelHeight` 確認尺寸與方向。
- 專案截圖:headless Chrome 實拍各 live 站首屏:
  ```bash
  CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --window-size=1440,900 --screenshot="assets/shot-<name>.png" "<live-url>"
  ```
  拍完 Read 進來確認渲染完整(沒有半截 / 空白 / loading 卡住)。

## 產出

- `CONTENT.md`(定稿)
- `assets/portrait.jpg` + `assets/shot-*.png`

完成後進入 `reference-image-gen.md`。
