# 未知數四象限（Quadrants of the Unknown）

> 本檔與網站規格 `SITE_SPEC.md` 第 1 節（S1 未知數四象限）與第 3 節 S4（11 個示範的象限標籤）**保持完全一致**。四象限的名稱、色彩語意、對策提示不得偏離此檔。agent 在產出任何工件時，若要標註「這一步在對付哪種未知」，一律使用本檔的用語。

## 兩條軸線

- **橫軸：你是否意識到它？**（左＝沒意識到／右＝有意識到）
- **縱軸：你是否掌握它？**（上＝掌握／下＝不掌握）

## 四格定義

| 象限 | 位置 | 一句話 | 展開說明 | 對策 | 色彩語意 |
|---|---|---|---|---|---|
| **已知已知**<br>Known Knowns | 右上 | 你知道，而且你知道你知道。 | 需求裡寫清楚的部分、你熟悉的 API、已定案的規格。這是安全區，通常不需要工件去挖。 | 直接寫進 prompt 當作約束條件即可。 | 灰藍（沉穩，代表安全區） |
| **已知未知**<br>Known Unknowns | 右下 | 你知道你不知道——那些你打算「之後再問」的問題。 | 例如「這個 schema 要不要支援多租戶？」你意識到了，但還沒答案。風險中等，容易被拖到實作中才踩到。 | 用「訪談」「可調整計畫」把它們排序、逼自己現在就決定。 | 琥珀／黃（代表「知道要問」） |
| **未知已知**<br>Unknown Knowns | 左上 | 答案其實存在，只是不在你腦中——藏在別人腦裡、舊 PR、或程式碼庫裡。 | 三個月前那次被 revert 的嘗試、團隊某人踩過的坑、某個檔案裡的隱藏慣例。 | 讓 Claude 掃描 codebase / git 歷史，把它「教」回給你。 | 紫（藏在別處的既有知識） |
| **未知未知**<br>Unknown Unknowns | 左下 | 你根本不知道有這回事——最危險、也最貴。 | 那些會在 code review 或 production 才炸出來的地雷。這是返工與事故的主要來源。 | 用「盲點掃描」主動照亮；一旦被照到，它就降級成已知未知。 | 紅／珊瑚（最危險、最貴） |

方法論的核心是一台「降級機」：把未知未知照成已知未知，把已知未知逼成已知已知。每往右上角移動一格，返工成本就掉一個量級。而且時機決定價格——**在寫下任何一行程式碼之前，是找到未知數最便宜的地方**。

## 三階段語意色（與 SITE_SPEC 一致）

| 階段 | 色彩語意 | 意涵 |
|---|---|---|
| 實施前 Pre | 綠 | 最便宜、最主動 |
| 實施中 During | 藍 | 邊做邊留痕 |
| 實施後 Post | 靛／深紫 | 送審前驗收理解 |

## 視覺 token（供 templates/ 沿用，需與網站保持同一套色彩家族）

四象限色與三階段色需分別定義深／淺兩組值，對比度達 WCAG AA（正文 ≥ 4.5:1，大字 ≥ 3:1）。本 skill 的 `templates/artifact-base.html` 內建以下 CSS 變數，六份模板皆沿用：

```css
/* 基礎（與 SITE_SPEC 2.2 一致） */
--bg-light: #fafafa;        --bg-dark: #0d1117;
--surface-light: #ffffff;   --surface-dark: #161b22;
--border-light: #e2e2e6;    --border-dark: #30363d;
--text-light: #1a1a1a;      --text-dark: #e6edf3;
--text-muted-light: #5c5c66; --text-muted-dark: #8b949e;
--accent-light: #0d9488;    --accent-dark: #2dd4bf;

/* 四象限色（灰藍／琥珀／紫／紅珊瑚），深淺各一組 */
--q-known-known-light: #375074;   --q-known-known-dark: #93a8c7;
--q-known-unknown-light: #8a5a00; --q-known-unknown-dark: #f2c14e;
--q-unknown-known-light: #7c3aed; --q-unknown-known-dark: #cf9dfa;
--q-unknown-unknown-light: #c62828; --q-unknown-unknown-dark: #ff8a80;

/* 三階段色（綠／藍／靛紫），深淺各一組 */
--p-pre-light: #137333;    --p-pre-dark: #5ee69c;
--p-during-light: #1656c9; --p-during-dark: #79b8ff;
--p-post-light: #5b21b6;   --p-post-dark: #b79cf7;
```

> 註：以上數值已對齊網站 `site/assets/styles.css` 實際鎖定的精確色碼（`--q-*` 對照網站 `--q-*`，`--p-*` 對照網站 `--s-*`），逐位元組一致。日後若網站 `styles.css` 調整這些色碼，須同步更新本檔與 `templates/` 六份模板、`assets/quadrant-legend.svg`，以維持「工件與網站視覺一致」的驗收目標。

## 對照表：哪種工件對付哪一象限

| # | 工件／步驟（SITE_SPEC 示範對應） | 階段 | 主要對付象限 | 本 skill 使用的模板 |
|---|---|---|---|---|
| A1 | 盲點掃描 Blindspot Pass（對應示範 01） | 實施前 | 未知未知 | `templates/blindspot-cards.html` |
| A2 | 訪談 The Interview（對應示範 06） | 實施前 | 已知未知 | `templates/interview-decisions.html` |
| A3-教學 | 教我我不懂的地方 Teach Me My Unknowns（對應示範 02） | 實施前 | 已知未知（缺詞彙） | 沿用 `interview-decisions.html` 結構（Q&A／決策表換成「詞彙階梯」表） |
| A3-多方向 | 四個設計方向 Four Design Directions（對應示範 03） | 實施前 | 已知未知（開放式決策） | 沿用 `blindspot-cards.html` 的卡片網格（欄位換成方向/適用情境/取捨/steal-skip） |
| A3-原型 | 接線前先做假原型 Mock Before You Wire（對應示範 04） | 實施前 | 已知未知（互動決策） | 以 `artifact-base.html` 骨架客製一份可點擊原型（非固定表格結構，見 phase-playbook） |
| A3-發想 | 腦力激盪介入方案 Brainstorm the Intervention（對應示範 05） | 實施前 | 未知已知（解法藏在 codebase） | 沿用 `blindspot-cards.html` 卡片網格（依「今天能上→長押注」排序，附共鳴核取方塊） |
| A3-驗證 | 指著一個參考物 Point at a Reference（對應示範 07） | 實施前 | 未知已知（誤解風險） | 沿用 `interview-decisions.html` 的決策表結構（欄位換成「參考段落／對應實作／gotcha／邊界案例」） |
| A4 | 可調整的計畫 The Tweakable Plan（對應示範 08） | 實施前 | 已知未知 | 沿用 `interview-decisions.html` 的決策表＋可複製 prompt（依「最可能被改動」排序呈現） |
| B1 | 決策日誌 Implementation Notes（對應示範 09） | 實施中 | 未知未知（做的當下才冒出來，記錄後降級為已知） | `templates/decision-log.html` |
| C1 | 說服文件 The Buy-In Doc（對應示範 10） | 實施後 | 已知未知（審核者心裡的疑問） | `templates/buy-in-doc.html` |
| C2 | 合併前測驗 Quiz Me Before I Merge（對應示範 11） | 實施後 | 未知已知（審核者以為自己懂了） | `templates/merge-quiz.html` |

此表與 `SITE_SPEC.md` 第 3 節 S4（4.3 十一張卡）逐一對應：11 個示範 = 本 skill 的 A1、A2、A3 的 5 種按需選項、A4、B1、C1、C2 共 11 個步驟。
