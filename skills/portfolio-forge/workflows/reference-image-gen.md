# 階段 2:生成 section 參考圖

用 taste-skill 的 `imagegen-frontend-web` 生高審美參考圖,**一個 section 一張圖**。

## 前置:確認 imagegen-frontend-web 已安裝

```bash
ls ~/.codex/skills/imagegen-frontend-web/SKILL.md
```

沒有就從 taste-skill 倉庫裝(裝到 codex 與 claude 兩邊):

```bash
git clone --depth 1 https://github.com/Leonxlnx/taste-skill.git /tmp/taste-skill
cp -r /tmp/taste-skill/skills/imagegen-frontend-web ~/.claude/skills/
cp -r /tmp/taste-skill/skills/imagegen-frontend-web ~/.codex/skills/
```

這個 skill 的鐵律:**每個 section 生一張獨立橫向圖**(8 section = 8 張),不把整頁壓成一張;hero 構圖避免預設「左字右圖」;全部圖共用同一套色盤。

## 執行:一次 codex exec 序列生成

在專案目錄跑(背景執行,用 `run_in_background: true`):

```bash
cd <專案>/personal-website
codex exec --skip-git-repo-check --full-auto "你是網頁視覺設計師。嚴格遵循 ~/.codex/skills/imagegen-frontend-web/SKILL.md 的全部規則(每個 section 一張獨立橫幅圖、構圖多樣性、hero 避免左字右圖預設、全部圖共用同一色盤)。

任務:閱讀本目錄 CONTENT.md,為其中 N 個 section 各生成一張橫向(16:9 或更寬)高保真網頁設計參考圖,共 N 張。

硬性設計約束(全 N 張一致):
- 風格:[從 CONTENT.md 帶入,如 編輯雜誌風、大幅留白、章節編號]
- 底色 [hex] / 文字 [hex] / 唯一強調色 [hex]
- 英文標題 [襯線字氣質],中文內文 [黑體]
- [若有真實照片]:hero 圖用『雜誌大圖直幅照片』方式表現 [人物意象],不需長得像本人,之後換真實照片
- Projects 用卡片(截圖佔位畫成灰階 + 標題 + 一句描述)
- 文案直接用 CONTENT.md 的真實文字

N 張對應:S1 Hero / S2 About / ... / SN Footer。
每生成一張立刻複製到 refs/,命名 section-01-hero.png ... section-0N-footer.png。
全部完成後列出 refs/ 確認 N 張都在。" 
```

## 生完自己先看

`codex exec` 完成後,把 `refs/*.png` 逐張 `Read` 進來,自己先過一遍(這是進對抗式評審前的自檢)。確認:

- 張數對(N section = N 張)。
- 全部同一套色盤。
- 每張構圖不同(沒有全部左字右圖 / 全部置中)。
- 文案來自 CONTENT.md。

## 重生單張的方式

評審後只重生要改的那幾張。給 codex 明確指令「只重新生成第 X 張,取代 refs/section-0X.png,舊圖備份為 refs/old-section-0X.png」,並附上「這張要修什麼」的具體回饋 + 「其餘 N-1 張維持風格一致」。

## 產出

- `refs/section-01-*.png` ... `refs/section-0N-*.png`

完成後進入 `adversarial-design-review.md`。
