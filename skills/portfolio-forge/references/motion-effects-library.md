# 動態效果庫(motion effects library)

實戰驗證過的網頁動態配方(來源:portfolio-forge 宣傳頁 heng-xiu.github.io/portfolio-forge,2026-07 上線)。複刻階段(階段 4)交給 Codex 時,從這裡挑 3–6 個塞進 prompt;逐段 QA(階段 5)時對照驗收。

## 三條鐵律(先讀,凌駕於任何單一效果)

1. **動態必須服務主題,不是裝飾。**先問「這個站的隱喻是什麼」,再挑對應的效果。鍛造主題 → 火花粒子 + 敲入;攝影主題 → 快門/顯影;寫作主題 → 打字機/墨跡。套不上主題的效果,寧可不加。
2. **全部尊重 `prefers-reduced-motion: reduce`**:CSS 動畫用 media query 關閉,JS 效果用 `matchMedia('(prefers-reduced-motion: reduce)').matches` 短路。hover 類效果(tilt、磁性按鈕)再加 `pointer: fine` 判斷,觸控裝置不啟用。
3. **數量克制**:一頁 3–6 個,其中最多 1 個「大效果」(粒子/滑桿),其餘做輔助。10 個全上就是遊樂場。

## 效果清單(附可直接抄的實作要點)

### 1. 對比滑桿(before/after compare)★ 說服力之王
適用:任何「A vs B」敘事——參考圖 vs 成品、改版前 vs 改版後、草圖 vs 實照。
```html
<div class="cmp" style="--x:50%">
  <img src="before.png">
  <img class="after" src="after.png">
  <div class="divider"></div><div class="knob">&lt;&gt;</div>
</div>
```
```css
.cmp{position:relative; aspect-ratio:16/10; overflow:hidden; cursor:ew-resize; touch-action:none}
.cmp img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; pointer-events:none}
.cmp .after{clip-path:inset(0 0 0 var(--x,50%))}
.cmp .divider{position:absolute; top:0; bottom:0; left:var(--x); width:2px; background:#fff}
.cmp .knob{position:absolute; top:50%; left:var(--x); transform:translate(-50%,-50%)}
```
JS:pointerdown 時 `setPointerCapture`,pointermove 算 `clientX` 相對比例寫回 `--x`。
**加分**:進視野時用 rAF 讓 `--x` 以 sin 波擺動一次(約 1.6s、±11%),提示可拖曳;使用者一碰就停。

### 2. 逐字標題進場(letter stagger)
JS 遞迴把 h1 文字節點拆成 `<span class="ch">`,每字 `--d: i*50ms`;動畫先過衝再落定才有「敲入」感:
```css
.ch{display:inline-block; opacity:0; transform:translateY(.5em) rotate(5deg) scale(.92);
  animation:chIn .7s cubic-bezier(.2,.75,.25,1) forwards; animation-delay:var(--d)}
@keyframes chIn{60%{opacity:1; transform:translateY(-.04em) rotate(-1deg) scale(1.02)} to{opacity:1; transform:none}}
```
注意:拆字要遞迴處理子元素(標題內常有 `<span class="accent">`),只動 text node。

### 3. 主題粒子層(canvas)
低密度(20–30 顆)、小半徑(1–3px)、慢速漂移 + sin 擺動;顏色取站上的強調色系;透明度隨位置衰減(如上升粒子 `alpha * y/H`,到頂自然消失)。放 `position:absolute; inset:0; pointer-events:none`,內容層 `z-index` 墊高。rAF 迴圈,resize 時重算畫布。

### 4. 捲動生長 rail + 節點敲入
流程/時間軸類 section 專用。垂直線 `height` 由 scroll handler 算 `(視窗底 - section頂)/section高` 寫回;節點數字初始 `scale(.55); opacity:.25`,IntersectionObserver `threshold:.5` 加 class 還原,transition 用回彈曲線 `cubic-bezier(.3,1.6,.5,1)`。

### 5. 無縫跑馬燈(marquee)
關鍵字帶用 `<span>` 串接,JS `track.innerHTML += track.innerHTML` 複製一份,CSS `animation: mq 30s linear infinite` + `@keyframes mq{to{transform:translateX(-50%)}}`。內容重複一次 + 位移 50% = 無縫。放在 hero 與第一個 section 之間當節奏分隔。

### 6. 打字機(typewriter)
指令、對話類文案專用(安裝指令、觸發句)。IntersectionObserver 進視野才開始,`setInterval` 每 90ms 補一字;游標用 `::after{content:"▍"; animation:blink .9s steps(1) infinite}`,打完 2–3 秒移除。**reduced-motion fallback:HTML 裡保留完整文字,JS 清空再打**——關掉 JS 或減動態時文字仍在。

### 7. 3D tilt
展示框(截圖、卡片)hover 時 `perspective(950px) rotateY(x*5deg) rotateX(-y*5deg)`,x/y 是游標相對中心的 -0.5~0.5。角度 ≤6deg,mouseleave 歸零。僅 `pointer:fine`。

### 8. 磁性按鈕
mousemove 時按鈕 `translate((dx)*.14, (dy)*.3)`,離開歸零。位移小(個位數 px)才高級,大了像 bug。

### 9. 捲動進度條
`position:fixed; top:0; height:2px` 的強調色線,scroll handler 寫 `width = scrollTop/(scrollHeight-clientHeight)*100%`。長單頁才需要。

### 10. 紙紋顆粒層(grain)
```css
.grain{position:fixed; inset:0; pointer-events:none; z-index:90; opacity:.05; mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>")}
```
編輯雜誌風/印刷感的站專用;深色站把 multiply 換 screen 並調低 opacity。

### 11. 進場 reveal(基本盤)
`opacity:0 + translateY(24px)`,IntersectionObserver `threshold:.12` 加 `.in` 還原,`rootMargin:'0px 0px -8% 0px'` 讓觸發早於貼底。所有 section 標配,上面任何效果都疊在這之上。

## 交給 Codex 複刻時的 prompt 寫法

不要只說「加一些動畫」。照這個格式點名:

> 動態層(全部尊重 prefers-reduced-motion,hover 類僅 pointer:fine):
> 1. 全站 section 進場 reveal(IO + fade-up)
> 2. hero 標題逐字 stagger 進場,曲線帶過衝
> 3. [挑一個大效果,說明主題理由]
> 4. …

## QA 驗收注意(呼應 headless-qa workflow)

- 進場動畫會讓錨點靜態截圖變空白 → 一律 puppeteer 真實捲動後再截。
- 對比滑桿/打字機這類互動效果,截圖只能驗「初始狀態」,互動行為要在瀏覽器手動點一輪。
- 開 DevTools 的 rendering → emulate `prefers-reduced-motion` 跑一遍,確認 fallback 完整。
