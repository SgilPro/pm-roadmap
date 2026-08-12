---
name: prd-review
description: Review a PRD or product spec against an eight-dimension rubric (problem framing, evidence quality, scope discipline, requirements clarity, success metrics, non-functional coverage, risks, decision record), scoring each 0-3 with severity and line references, ending with the single most important thing to fix. Use when asked to review, critique, or check a PRD, product spec, requirements doc, or case study's product documentation. For attacking the PRD's underlying assumptions instead, use prd-redteam.
---

# PRD Review

八個維度、每維 0–3、附行號、附嚴重度。結尾只講**一件**最該先修的事。

**這支 skill 檢查文件品質，不檢查產品決策對不對。** 想攻擊 PRD 賴以成立的假設，用 `prd-redteam`——那支刻意獨立跑，不看這支的結果。

## 評分刻度

| 分 | 意義 |
|---|---|
| 0 | 完全缺席 |
| 1 | 有提到但不可用 |
| 2 | 可用，但有明確缺口 |
| 3 | 達標 |

## 嚴重度

| 級 | 判準 |
|---|---|
| `blocker` | 這個缺陷讓 PRD **不能交給工程／設計開始做**，或會讓整份文件的結論站不住 |
| `major` | 會造成返工或誤解，但不阻擋開始 |
| `minor` | 品質問題，可後補 |

---

## 維度

### 1. `problem-framing` 問題框定

- **0** — 沒有問題陳述，直接進功能
- **1** — 有「問題」但實際是解法的倒裝（「缺少一個管理後台」）
- **2** — 問題可辨識，但沒有對象或沒有現況數據
- **3** — 有具體對象、有現況、**可否證**（說得出「如果看到什麼就代表我判斷錯了」）

**必檢**：問題陳述能不能被否證？不能否證的問題陳述沒有工程價值，因為做完也不知道有沒有解決。

### 2. `evidence-quality` 證據品質 ⚠️ 最常出事的一維

- **0** — 沒有任何斷言標來源
- **1** — 有些斷言有來源，但**關鍵量化數字沒有來源** → **一律 `blocker`**
- **2** — 關鍵數字有來源，但沒有區分「訪談得知 / 數據顯示 / 我推論」
- **3** — 每個關鍵斷言標明來源**與強度**；推論明確標成推論，不偽裝成發現

**硬規則**：任何形如「X 佔 N%」「快 N 倍」「每週 N 小時」「N 成的使用者」的數字，
**找不到來源就是 `blocker`**，不是 major。理由：整份 PRD 的問題規模建立在那個數字上，
它錯了後面全錯。這比任何格式問題嚴重。

同樣要抓：
- persona 是**訪談得來的**還是**推論出來的**？推論的 persona 標成事實 → `blocker`
- 競品資訊是**實際用過**還是**看官網寫的**？

### 3. `scope-discipline` 範圍紀律

- **0** — 沒有範圍界定，也沒有 non-goals
- **1** — 有功能清單但無優先序
- **2** — 有優先序但沒有依據，或沒有 non-goals
- **3** — 有 non-goals、有 v1 切線、優先序有依據（RICE / 影響 × 成本 / 明說的判準皆可）

**必檢**：**有沒有寫「這一版不做什麼」？** 沒有 non-goals 的 PRD 一定會 scope creep，
因為沒有任何東西可以拿來拒絕新需求。

### 4. `requirements-clarity` 需求清晰度

- **0** — 只有功能描述，沒有 user story 也沒有 AC
- **1** — 有 user story 但沒有 AC，或 AC 不可測（「體驗要流暢」）
- **2** — AC 可測但有明顯漏掉的分支（錯誤狀態、空狀態、權限）
- **3** — user story 過 INVEST；AC 寫成可測形式（Given/When/Then 或等效）；邊界與錯誤路徑有覆蓋

### 5. `success-metrics` 成功指標

**五個要素，缺一扣一分**（從 3 分往下扣）：
1. 可量測（不是「提升滿意度」這種主觀敘述）
2. 有 **baseline**（現在是多少）
3. 有 **timebound target**（什麼時候要到多少）
4. 有 **量測方法**（哪個事件、埋在哪、誰看）
5. 有 **guardrail**（哪個數字不能因此變壞）

- **0** — 沒有指標，或只有「使用者變多」
- **1** — 只滿足 1 項
- **2** — 滿足 2–4 項
- **3** — 五項齊全

**最常缺的是 baseline 與 guardrail。** 沒有 baseline 的目標數字是憑空喊的；
沒有 guardrail 的優化會犧牲別的東西還看不出來。

### 6. `non-functional-coverage` 非功能覆蓋

用 **ISO/IEC 25010** 的品質屬性當 checklist，**每個屬性至少一行**——
不是要寫成規格書，是要強迫掃一遍避免整類漏掉：

`functional suitability`（功能適切）· `performance efficiency`（效能）· `compatibility`（相容性）·
`usability`（易用性）· `reliability`（可靠性）· `security`（安全）· `maintainability`（可維護）· `portability`（可移植）

- **0** — 完全沒提非功能需求
- **1** — 只提了 1–2 個屬性
- **2** — 提了一半以上，但漏掉對這個產品明顯關鍵的那個（例：多租戶 SaaS 漏掉 security）
- **3** — 八個屬性都掃過，不適用的明說「不適用，因為…」

> ⚠️ 上面是 ISO/IEC 25010:2011 的八個特性。**25010:2023 已改版**（usability 改為
> interaction capability，並新增 flexibility、safety）。這正是 `data/sources.json`
> 的框架版本監看該抓的東西——改版時記得同步更新這一段與 `rubricVersion`。

### 7. `risks-dependencies` 風險與依賴

五類各檢一遍：技術可行性 · 時程 · 資源 · **外部依賴** · 市場需求

- **0** — 沒有風險段
- **1** — 有風險段但都是通用風險（「時程可能延遲」）
- **2** — 風險具體，但沒有應對或觸發條件
- **3** — 風險具體、有應對、有「什麼情況下要重新決策」

### 8. `decision-record` 決策記錄

- **0** — 只寫了做什麼，沒寫為什麼
- **1** — 有理由但沒有替代方案
- **2** — 有列替代方案，但沒說為什麼不選
- **3** — 明確寫出「考慮過 X，不選是因為 Y」

**這一維最常被跳過，但面試最愛問。** 「為什麼不做另一個方案」是 PM 面試的高頻題，
而 PRD 裡沒記錄的話，三個月後你自己也答不出來。

---

## 輸出格式

```
## PRD Review — <檔名>
rubricVersion 1.0 · <YYYY-MM-DD>

| 維度 | 分數 | 嚴重度 | 依據（行號） |
|---|---|---|---|
| problem-framing        | 2/3 | major   | L34：問題陳述無法否證 |
| evidence-quality       | 1/3 | blocker | L58：「追繳佔 40% 工時」無來源 |
| …                      |     |         | |

**總分 N/24**

### Blocker（先修這些，其餘免談）
- L58 …

### Major
- …

### Minor
- …

## 最該先修的一件事
（一句話。列三件等於沒列。）
```

引用**一定要帶行號或原文片段**。沒有定位的批評無法行動。

跑完照 `../_shared/evidence-format.md` 輸出 JSON 到 `docs/evidence/prd-review-<YYYYMMDD>.json`。
`overallRule` 用 `"sum"`（滿分 24），但 **`topFix` 必須來自最嚴重的 blocker**，不是最低分那一維。

competency 對應：
`problem-framing`、`evidence-quality` → `voice-of-the-customer`；
`scope-discipline`、`requirements-clarity` → `feature-specification`；
`success-metrics` → `fluency-with-data`、`business-outcome-ownership`；
`non-functional-coverage` → `quality-assurance`；
`risks-dependencies` → `product-delivery`；
`decision-record` → `business-outcome-ownership`。

## 界線

- **不要為了給高分而寬鬆。** 這份 rubric 存在的唯一理由是抓出自己看不見的洞。
  給滿分等於這次跑白費了。
- **不要改 PRD。** 只評分與指路，修不修、怎麼修是使用者的判斷。
- **不要編造行號。** 找不到就寫「全文未見」。
- 分數是機械的；「所以我的能力是幾分」是判斷，寫進 `data/assessment.js`，不是這支 skill 的事。

## Golden test（改動這支 rubric 後必跑）

拿 `portfolio/linkju.html` 跑一次。這份 case study 全文 **544 行、零個來源標註**
（`grep -cE "來源|資料來源|統計處|內政部|訪談"` → 0），而它有幾個承重的量化斷言：

**必須被 `evidence-quality` 抓到並標 `blocker`：**
- **L418「智生活 80% 市佔」** —— 整個 Track B win-back 策略建立在這個數字上，無來源
- **L425「26,000 個社區」** —— Track A 的 TAM，無來源

**必須「不」被標成 blocker（反向測試，防過度觸發）：**
- **L528「驗證 6.6x LTV 乘數假設」** —— 這裡**明確寫了是待驗證的假設**。
  誠實標註的推論比偽裝成事實的推論安全，這種應該加分不是扣分。
- **L411「6,500+ 智生活不滿用戶估計」** —— 帶了「估計」二字，屬於已標註的推論，最多 `minor`。

抓不到前兩個 → rubric 太鬆。把後兩個也標 blocker → rubric 太緊，會訓練出「所有數字都要有論文」的
無用潔癖。**兩邊都要對，這支 rubric 才能用。**
