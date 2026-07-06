---
name: know-your-unknowns
description: Surface the unknowns in a coding task before, during, and after implementation — scan the codebase for blindspots, interview the user to resolve ambiguity, keep a decision log while building, and generate a pre-merge comprehension quiz — emitting a self-contained HTML artifact at each phase. Use when starting a non-trivial change in an unfamiliar or high-risk area, when a plan feels underspecified, or when the user says "know your unknowns", "find my blindspots", or "de-risk this before I build".
metadata:
  version: 1.0.0
  author: know-your-unknowns
  inspired-by: "Thariq Shihipar — Know your unknowns (HTML Effectiveness series)"
  tags: [planning, code-review, risk, discovery, artifacts]
---

# Know Your Unknowns

「地圖不是領土，兩者間的落差就是你的未知數。」這個 skill 幫使用者在用 AI coding
agent 實作任何工作之前／期間／之後，主動把「未知數」照出來，以降低返工與事故成本。

核心心法：把 **未知未知** 照成 **已知未知**，把 **已知未知** 逼成 **已知已知**。
每往這個方向移動一格，返工成本就掉一個量級。而時機決定價格——**在寫下第一行程式碼
之前，是找到未知數最便宜的地方**，所以本 skill 的重心放在實施前。

每個階段都要輸出一份 **自包含的 HTML 工件**（inline CSS/JS、無外部依賴、深淺主題、
可鍵盤操作），而不是一段 markdown 文字牆——因為互動、可並排、可點擊的工件，使用者
才會真的讀進去。工件模板見 `templates/`，四象限與判斷準則見 `references/`。

## When to Use

在以下情況觸發本 skill：
- 要在**陌生或高風險**的程式碼區域（auth、billing、權限、資料遷移）開始一項非
  trivial 的改動。
- 一份實作計畫**看起來太模糊**、有很多「之後再說」的決策。
- 使用者明確說出：「know your unknowns」「幫我找盲點」「動手前先降風險」
  「de-risk this」「這個我沒把握」。
- 要進行長時間、可能過夜的委派任務（需要決策日誌）。
- 一個大 diff 要送 review 或 merge（需要說服文件或理解測驗）。

**不要用在**：一行字的修改、你已完全熟悉且低風險的區域、純格式調整。

**與其他流程的分工**:若任務已在別的執行迴圈流程中維護決策紀錄(例如 loop-engineering 的 LOOP_LOG.md),階段 B 的決策日誌讓位給該紀錄,避免重複;此時本 skill 專注於動手前的階段 A(盲點掃描/訪談)與送審後的階段 C(說服文件/合併前測驗)。

## How It Works — 三階段流程

先判斷使用者的任務落在哪個階段（可能全走，也可能只需其中一段），再執行對應步驟。
若使用者沒指定，預設**從階段 A 開始**。每個步驟結束都產出一份 HTML 工件，並問使用者
是否繼續下一步。

### 階段 A — 實施前（Pre-implementation）：最便宜的挖掘

**A1. 盲點掃描（Blindspot Pass）— 對付「未知未知」**
1. 讀取使用者指定的目標模組/資料夾，以及其近期 git log 與任何被 revert 的 commit。
   （可用 `git log`、`git log --diff-filter` 找 revert；讀 migration、設定檔、測試 fixture。）
2. 產出 5–8 張「盲點卡」，每張標明類型（Landmine 地雷／Convention 慣例／
   Missing concept 失落的概念／History 歷史教訓）、「為什麼會咬你」、規避作法。
3. 把所有約束壓縮成一段「改良版實作 prompt」。
4. 用 `templates/blindspot-cards.html` 輸出 HTML 工件。**此步先不寫任何實作程式碼。**

**A2. 訪談澄清（The Interview）— 對付「已知未知」**
1. 針對使用者的功能目標，**一次只問一個問題**，並**按架構爆炸半徑（blast radius）
   排序**——答案越會改變架構的問題越先問（提問啟發式見
   `references/interview-heuristics.md`）。
2. 使用者回答後再決定下一題，直到重大不確定性清空（通常 5–8 題）。
3. 收斂成一張**決策表**（欄位：決策／使用者的選擇／理由／影響範圍）與一段可直接拿去
   實作的 prompt。
4. 用 `templates/interview-decisions.html` 輸出 HTML 工件。

**A3.（按需）拓寬選項與教學** — 視任務性質選用：
- 若使用者對某領域**缺乏詞彙**：先當家教，用「詞彙階梯」把模糊需求教成精準術語
  （對付已知未知）。
- 若是**開放式設計決策**：一次生 3–4 個明顯不同的方向並排，讓使用者挑（要選項，不
  替他決定）。
- 若目標模糊但**解法藏在 codebase**：讀程式碼發散 10 個紮根方案，沿「今天能上→長押
  注」排序（對付未知已知）。
- 若要**照著參考實作做**：先產「理解驗證表」證明你沒誤解，再動手（對付未知已知）。
判斷準則見 `references/phase-playbook.md`。這些也各有工件模板可複用。

**A4. 可調整的計畫（The Tweakable Plan）**
- 整合 A1–A3 的產出，給出實作計畫，但**按「最可能被使用者改動的決策」排序**，把純
  機械性步驟摺疊到最底部，關鍵 schema/型別決策附可切換替代方案。

### 階段 B — 實施中（During）：邊做邊留痕

**B1. 決策日誌（Implementation Notes）— 把當場冒出的未知固定成文字**
1. 在實作過程中，**每一次偏離計畫或遇到計畫沒交代的岔路**，就記一筆：怎麼選的、
   為什麼（尤其若選了保守做法）、先擱置了什麼疑點。
2. 做完把日誌濃縮成「下一輪要折進計畫的 3 個要點」。
3. 用 `templates/decision-log.html` 持續更新同一份 HTML 工件。

### 階段 C — 實施後（Post）：送審前驗收理解

**C1. 說服文件（Buy-In Doc）— 對付審核者的已知未知**
1. 先用一段**視覺化演示**開場（先展示、後文字）。
2. 站在審核者立場列出每個可能的反對意見，逐條用證據預先回應。
3. 明確標出「誰需要簽核哪一部分」。
4. 用 `templates/buy-in-doc.html` 輸出。

**C2. 合併前測驗（Quiz Me Before I Merge）— 對付審核者/自己的已知已知假象**
1. 先給一張改動的**心智模型圖**與 2–3 個「不明顯但重要」的行為。
2. 出 5–6 題**決策題**（不是背誦題）——都是「事故或 review 時必須判斷對」的題目。
3. 答錯的題目**連回對應說明段落**；全對（例如 6/6）才算通過。
4. 用 `templates/merge-quiz.html` 輸出。

## Steps（執行摘要）

1. 判斷任務落在 A/B/C 哪些階段；未指定則從 A 開始。
2. 依上述步驟執行，**每步結束輸出一份自包含 HTML 工件**並回報路徑。
3. 每步之間**暫停**，把工件交給使用者確認，再問是否進入下一步——不要一口氣跑完。
4. A 階段的掃描與訪談**絕不預先寫實作程式碼**；實作只發生在使用者確認計畫之後。
5. 全程用四象限語言標註「這一步在對付哪種未知」，鞏固使用者的心智模型。

## Output（產出約定）

- 每份工件是**單一 `.html`**，inline 全部 CSS/JS，無外部依賴，支援深/淺主題與鍵盤操作。
- 檔名慣例：`unknowns-<phase>-<step>-<slug>.html`
  （例：`unknowns-A1-blindspot-pass.html`）。
- 放在使用者專案的 `docs/unknowns/`（若無則詢問存放位置）。
- 輸出後回報：工件路徑、它照亮了哪些未知數、建議的下一步。

## Subagent 使用策略

- **盲點掃描（A1）** 若目標 codebase 很大（多個模組、大量 git 歷史），**派一個
  read-only 的探索型 subagent**（例如 general-purpose / Explore）去掃描並回傳結構化的
  盲點清單，避免主線 context 被大量檔案內容淹沒。主 agent 只接收結論再組工件。
- **訪談（A2）必須由主 agent 親自進行**（一次一題、與使用者來回），**不要**丟給
  subagent——互動連續性會斷。
- **決策日誌（B1）由正在實作的 agent 自己維護**（它才知道自己偏離了什麼），不另開
  subagent。
- **合併前測驗（C2）** 若 diff 很大，可派 subagent 先摘要 diff 的關鍵行為，主 agent
  再據此出題；出題與連回段落的邏輯由主 agent 掌控。
- 通則：**掃描/摘要類重讀工作**適合外包給 subagent 以省 context；**與使用者互動、需要
  連貫判斷**的工作留在主 agent。
