---
name: prd-redteam
description: Attack a PRD's assumption stack instead of reviewing its quality. Extracts every assumption the document depends on, rates the evidence behind each (none/inferred/secondhand/firsthand), states what happens if it is false, proposes the cheapest way to verify it, and names the top 3 kill-shots. Deliberately biased toward "unproven until the PRD proves otherwise". Use when asked to red-team, pressure-test, stress-test, or attack a PRD, spec, or product plan's assumptions. For document quality instead, use prd-review.
---

# PRD Red Team

**不評分文件品質。** 這支的工作是找出這份 PRD 賴以成立的假設，然後試著把它們推倒。

## 兩條硬規則

1. **不要讀 `prd-review` 的輸出，也不要先跑它。** 兩支必須獨立。
   看過品質評分會錨定你，你會開始檢查「格式有沒有寫」而不是「這件事是不是真的」。
2. **預設每個假設都是假的，由 PRD 舉證。**
   這是刻意的偏誤。不是為了公平，是為了對稱——PRD 的作者已經花好幾小時說服自己了，
   你的三十分鐘不可能在同一個方向上找到新東西。

## 要抓的七類假設

對照 Marty Cagan 的四種風險（value / usability / feasibility / viability），再加規模與替代方案：

| 類 | 假設什麼 | 若為假 |
|---|---|---|
| **問題** | 這個問題真的存在，且對這群人夠痛 | 做完沒人在意 |
| **規模** | 有足夠多人有這個問題 | 做對了但市場太小 |
| **價值** | 我們的解法真的能解決它 | 上線後指標不動 |
| **行為** | 使用者願意**改變現有做法**來用它 | 功能可用但沒人切換 |
| **可行** | 我們（這個團隊、這個時程）做得到 | 延期或做出殘缺版 |
| **商業** | 有人願意付錢，或這對業務有幫助 | 使用者愛用但公司做不下去 |
| **替代** | 沒有更便宜的方法達到同樣效果（**包含「不做」**） | 花大錢做了本來能用一頁 Google 表單解決的事 |

**「行為」與「替代」這兩類最常整類缺席。** 大多數 PRD 會論證問題存在、解法可行，
但不會論證使用者為什麼要放棄現在的做法（哪怕現在的做法是 Excel），
也不會論證為什麼不能用更笨的方法先解決。

## 證據強度（每個假設都要標）

| 分 | 級 | 意思 |
|---|---|---|
| 0 | **無** | PRD 裡連提都沒提，是我讀出來的隱含假設 |
| 1 | **推論** | 有講理由，但理由是作者的推理，不是外部資訊 |
| 2 | **二手** | 引了報告、競品、業界數字 |
| 3 | **一手** | 訪談過的人、自己產品的數據、實際跑過的測試 |

**0 與 1 是同一件事的兩種樣子**：都還沒碰到真實世界。不要因為理由寫得長就給 2。

## 找出「最沒被檢驗的假設」的啟發式

作者最投入的那個假設，通常是檢驗最少的那個——因為它是整個提案的起點，
起點不會被自己質疑。

具體怎麼找：
- 哪個數字被重複引用最多次？（重複不等於驗證）
- 哪句話用了「顯然」「當然」「大家都知道」？
- 哪個假設如果不成立，作者就沒有理由寫這份 PRD？**那一個一定要查。**

## Kill-shot 的定義

不是「這個假設很重要」，而是：**它為假時，整份 PRD 失效，不只是某個功能要改。**

一份 PRD 通常只有 1–3 個真正的 kill-shot。如果你列出五個，你把「重要」誤當成「致命」了。

## 驗證方法：由便宜往貴排

提出驗證方法時**先問最便宜的夠不夠**，不要直接跳到最完整的：

| 方法 | 大約成本 |
|---|---|
| 翻自己產品現有的數據 | 1 小時 |
| 找 1 個真實使用者聊 30 分鐘 | 1 小時 |
| 實際去用競品一週 | 2 小時 |
| 5 人可用性測試 | 半天 |
| Landing page / waitlist | 1 天 |
| 手動 concierge 版（人工假裝是系統） | 2–3 天 |
| 假門（fake door）測試 | 依實作而定 |

> **選對驗證方法本身就是要練的能力。** 這也是為什麼「假門測試」在
> `SKILLS_DATA` 裡被標成刻意不學（`wont`）——重點不是每個 tactic 的玩法，
> 而是能在這張表上選對那一格。這支 skill 就是在練那件事。

## 輸出格式

```
## PRD Red Team — <檔名>
rubricVersion 1.0 · <YYYY-MM-DD>

### 假設堆疊
| # | 類 | 假設（引 PRD 何處） | 證據 | 若為假 | 最便宜的驗證 | 成本 |
|---|---|---|---|---|---|---|
| 1 | 問題 | L58「追繳佔 40% 工時」 | 0 無 | 整份 PRD 的問題規模失效 | 找 1 位總幹事聊 30 分 | 1h |
| … |

### Top 3 Kill-shots
1. **<假設>** — 為假時 <整份 PRD 會怎樣>。先做 <驗證>，<成本>。
2. …
3. …

### 整類缺席
（哪幾類假設 PRD 完全沒碰？通常是「行為」與「替代」。）

### 這一份最沒被檢驗的假設
（用上面的啟發式挑一個，說明為什麼是它。）
```

跑完照 `../_shared/evidence-format.md` 輸出 JSON 到 `docs/evidence/prd-redteam-<YYYYMMDD>.json`。

- `dimensions` 用七類假設當 key（`problem` / `scale` / `value` / `behavior` / `feasibility` / `viability` / `alternative`），
  分數填**該類裡最弱的那個假設的證據強度**，`max: 3`
- `overallRule` 用 **`"min"`** —— 一個沒有證據的 kill-shot 就足以讓整份站不住，平均沒有意義
- `severity`：kill-shot 且證據 ≤ 1 → `blocker`；其餘證據 ≤ 1 → `major`
- competency 對應：`voice-of-the-customer`、`business-outcome-ownership`、`strategic-impact`

## 界線

- **不要提出解法。** 這支只負責推倒與指出怎麼查證。修不修是使用者的判斷。
- **不要編造 PRD 沒有的內容來攻擊。** 每個假設都要指得出 PRD 哪裡（明說或隱含）依賴它。
  隱含的要寫「隱含於 L34」，不要假裝是原文。
- **不要因為找不到弱點就放水。** 找不到 kill-shot 是可能的，但要明說
  「我找不到，我最不確定的是 X」——而不是硬湊三個。
- **如果 PRD 已經自己標了「這是推論」，那是加分不是扣分。** 誠實標註的推論比偽裝成事實的推論安全得多。

## Golden test（改動這支 rubric 後必跑）

拿 `portfolio/linkju.html` 跑一次。

**必須出現在 Top 3 Kill-shots，證據強度標 0 或 1：**
- **「智生活 80% 市佔」（L418）** —— 屬「問題／規模」類。為假時整個 Track B win-back 失效
- **「26,000 個社區仍用 LINE / Excel」（L425）** —— 屬「規模」類。為假時 Track A 的 TAM 失效

**「行為」類必須被點名為整類缺席或證據 ≤ 1：**
這份 case study 論證了「無廣告」是切入點，但**沒有論證主委為什麼願意從免費的智生活
搬到要付月費的 Linkju**。那是最典型的行為假設缺口，也是這支 skill 最該抓到的東西。

它們不在 top 3 就是這支 skill 壞了。
