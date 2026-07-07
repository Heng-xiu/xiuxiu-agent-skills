# 階段 4:高保真複刻

把「定稿參考圖 + CONTENT.md + 真實素材」整包交給 Codex 的 Frontend App Builder,以 1:1 復刻為目標。

## 前置:確認 build-web-apps plugin 已安裝

```bash
codex plugin list 2>&1 | grep build-web-apps
```

沒有就裝(含 frontend-app-builder、react/shadcn best-practices 等 skill):

```bash
codex plugin add build-web-apps@openai-curated
```

## 執行:codex exec 複刻(背景)

在專案目錄跑,`run_in_background: true`:

```bash
cd <專案>/personal-website
codex exec --skip-git-repo-check --full-auto "使用 build-web-apps plugin 的 Frontend App Builder skill,進行個人網站的網頁復刻。

【設計稿】refs/ 內 N 張參考圖(section-01 ~ section-0N,由上而下組成單頁)。以高保真復刻為目標,盡可能還原布局、配色、字體、間距、素材位置和交互細節,沒做到 1:1 完美復刻就繼續迭代。

【內容真值】CONTENT.md 是文案與連結的唯一依據 —— 參考圖中若有 AI 亂字或與文檔不符處,一律以 CONTENT.md 為準。

【真實素材(必須用,不得用生成圖替代)】
- assets/portrait.jpg:Hero 直幅照片
- assets/shot-*.png:Projects 卡片截圖(適當裁切上緣)

【工程約束】
- 靜態站,可部署 Cloudflare Pages(輸出 dist/)
- Projects 與 Writing 資料驅動:各用一個資料陣列(title/desc/url/img/date),日後新增只改陣列
- Projects grid 用 auto-fill 可擴展,底部有『更多專案 →』連結
- Writing 禁裸 URL:標題即超連結,每項尾端『閱讀全文 →』強調色連結
- 動畫:從 `references/motion-effects-library.md` 挑 3–6 個效果(基本盤 reveal 必上,最多 1 個大效果),照庫裡「交給 Codex 的 prompt 寫法」逐項點名寫進本 prompt;全部尊重 prefers-reduced-motion,hover 類僅 pointer:fine
- 色盤 [hex];英文襯線 [字型],中文 [字型](自托管或 fontsource 避免 FOUT)
- RWD:桌機忠實還原;行動版單欄降級,hero 照片改上圖下文
- 完成後 git init + commit,跑 production build 確認成功,回報:目錄結構、build 輸出路徑、本機預覽指令

專案建在本目錄的 site/ 子目錄。"
```

## 複刻完成後檢查產物

```bash
# 目錄結構
find site/dist -type f | sed 's|.*/dist/||' | sort
# 所有連結(對照 CONTENT.md 核實)
grep -o 'href="[^"]*"' site/dist/index.html | sort -u
# git 狀態
cd site && git log --oneline | head -3
```

確認:dist 產物完整、資產(portrait / shot / css / js)都在、連結全部正確、有 commit。

## 迭代

QA(下一階段)發現不到位的地方,把具體問題寫成回饋,再開一次 `codex exec` 針對性修 —— 或直接用 Claude 改 `site/src/` 的 css / data。小調整 Claude 自己改更快,大改動交回 Codex。

## 產出

- `site/`(獨立 git repo,含 src/ + dist/ + assets/)

完成後進入 `headless-qa-and-deploy.md`。
