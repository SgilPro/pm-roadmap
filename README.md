# pm-roadmap

一套 PM 能力養成框架，加上一個人正在用它轉職的實例。

靜態站，**無 build step、無後端、無資料庫、無登入**。資料就是 repo 裡的幾個 `.js`，
版控在你自己手上。想用就 clone 下來 `node scripts/init.mjs`。

```
open index.html      求職：Pipeline · 倒數 · 投遞準備度 · 職缺清單 · Portfolio
open roadmap.html    能力框架：能力地圖 · 技能圖譜（清單／雷達／技能樹）· 刻意不學清單
```

直接開檔就能跑，不需要起 server。

---

## 三層資料，判準是「擁有權」

這是整個 repo 最重要的一件事。**新增任何東西之前先問：這是誰的？**

| 目錄 | 是什麼 | 誰的 | 可以打包給別人嗎 |
|---|---|---|---|
| **`framework/`** | 能力骨架、121 個項目、每項的 `eval`、學習路徑結構、空白範本 | 共用 | ✅ 這就是要輸出的東西 |
| **`profile/`** | 我的自評 `status`、刻意不學的理由、6 點預算、版本快照 | 我 | ❌ |
| **`job-search/`** | 我的 Pipeline、職缺 pool、探索來源清單、triage 佇列 | 我 | ❌（機制可以，資料不行） |

分層的判準**不是主題，是擁有權**。「競品分析這項技能的定義與佐證方式」是框架的；
「我競品分析做到哪了」是我的。兩者主題相同，但分屬不同層。

> 上一版的目錄叫 `data/`。那個名字對「這是誰的資料」零說明力，所以才會出現
> 框架定義與個人自評混在同一個檔案裡的情況。

### 別人 clone 之後

```bash
git clone <repo> && cd pm-roadmap
node scripts/init.mjs              # 從 framework/templates/ 複製空白檔
node scripts/init.mjs --no-job-search   # 只要能力框架，不要求職追蹤
node scripts/validate-data.mjs     # 十條跨層檢查
open roadmap.html
```

`init` **不會覆蓋既有檔案**（要覆蓋得加 `--force`）——`profile/assessment.js` 是花好幾個
小時想出來的判斷，弄掉了沒有備份。

拿到的是：完整的 spine、每項的 `eval`、三支 rubric，但 **`status` 全部空白**。
框架給的是骨架與「要拿什麼當佐證」，不是別人的分數。

> ⚠️ **`framework/` 目前還不能發佈。** 76 項 `skill` 裡有 51 項的 `eval` 是 `null`，
> 而 `eval` 就是這個框架唯一的差異化價值。空白的 `eval` 等於送一張空表格。
> 補完它是發佈的前置條件。

---

## 貫穿整個 repo 的一條線：機械 vs 判斷

同一條判準用在五個地方。**理解這條線，就理解了這個 repo 的所有設計決策。**

| 層 | 機械（可自動化） | 判斷（只有人能做） |
|---|---|---|
| 職缺 | 連結死掉了（HTTP 狀態碼就是答案） | 這個缺值不值得投（`match` / `why` / `tier`） |
| 職缺探索 | 這個 URL 存在、標題是什麼 | 同上 |
| 產出物 | 「這份 PRD 的 metrics 有沒有 baseline」 | 「我的 Feature Specification 是 7 還是 8」 |
| 資訊源 | 「有新文章」「SFIA 頁面內容變了」 | 「這該不該改我的能力地圖」 |
| 專案管理 | ticket 現在是什麼狀態 | 哪張 ticket 對應站上哪一格 |

**機械的那一半可以自動化；判斷的那一半自動生成就是編造資料。**

具體後果：`scripts/discover-jobs.mjs` 會幫你找到新職缺，但它**永遠不寫
`job-search/jobs.js`**——它只寫 `inbox.md` 等你 triage。那四個判斷欄位一定要你回答。

---

## 三個 agent，對應三層

`.claude/agents/` 裡有三個 subagent，每個只准寫自己那一層：

| Agent | 管什麼 | 只能寫 |
|---|---|---|
| **`framework-builder`** | spine、`eval`、rubrics、範本、validator | `framework/` `.claude/skills/` `scripts/` |
| **`profile-keeper`** | 自評重估、`wont` 的理由、evidence、點數預算 | `profile/` |
| **`job-hunter`** | 職缺探索、triage、Pipeline、清單衰減 | `job-search/` |

邊界寫死在各自的 system prompt 裡。要跨層就得停下來說明——因為跨層通常代表
「這件事到底屬於誰」還沒想清楚。

---

## 檔案

| 路徑 | 內容 |
|---|---|
| `index.html` | 求職頁。**零外部依賴**，離線可開 |
| `roadmap.html` | 能力框架頁。載 Chart.js CDN 畫雷達 |
| `assets/site.css` | 兩頁共用的全部樣式。**一份不拆三份** |
| `framework/competencies.js` | 16 個 L1 + 121 個 `ITEMS` + `CURRICULUM` + 衍生視圖函式 |
| `framework/templates/*.js` | 空白範本，`init.mjs` 用 |
| `profile/{assessment,budget,history}.js` | 我的自評、預算、快照 |
| `job-search/{pipeline,jobs,sources}.js` | Pipeline、職缺 pool、探索來源 |
| `job-search/inbox.md` | 探索到的候選，等人工 triage。**還不是 pool** |
| `scripts/init.mjs` | 初始化 |
| `scripts/validate-data.mjs` | 十條跨層完整性檢查 |
| `scripts/check-jobs.mjs` | 每週核對職缺連結（衰減）。**CI 唯一寫入的檔是 `job-search/jobs.js`** |
| `scripts/discover-jobs.mjs` | 職缺探索（發現）。**只寫 `inbox.md`** |
| `scripts/{migrate-spine,build-layers}.mjs` | 一次性遷移，留著讓分類決策可被審核與重跑 |
| `.claude/skills/` | 三支檢測 rubric：`prd-review` / `prd-redteam` / `mock-interview-product-sense` |
| `.claude/agents/` | 三個分層 agent |
| `portfolio/*.html` | 兩份 PM case study |

`docs/` 在 `.gitignore` 裡，**只存在本機**——repo 是 public，而那裡面有求職診斷、
目標公司評估與訪談紀錄。活文件在 `docs/framework.md` 與 `docs/job-search-2027.md`。

---

## 資料模型

```
framework/competencies.js
  COMPETENCIES   16 個 L1（Ravi Mehta 12 + ISPMA 4）
  ITEMS          121 項，每項有 kind / l1 / eval / priority
  CURRICULUM     12 個 phase 的學習路徑。只存「哪個 phase 教哪些 item」，不存狀態
  skillsView()   ─┐
  roadmapView()  ─┴─ 衍生視圖，render 時算不存，都吃 ASSESSMENT

profile/assessment.js
  ASSESSMENT     狀態的唯一來源，key 是 item id
```

`ITEMS[].kind` 分四種，判準是**能不能指出一件具體產出物來證明它**：

| kind | 數量 | 給分？ | 說明 |
|---|---|---|---|
| `skill` | 76 | ✅ | 能用產出物證明，**必須有 `eval`** |
| `topic` | 28 | ❌ | 概念知識。讀過就是讀過 |
| `ability` | 9 | ❌ | 靠實作＋反思（溝通、衝突、影響力）。證據是反思紀錄 |
| `tool` | 8 | ❌ | 軟體熟練度，不是能力 |

把 `topic` 與 `tool` 分出來的實際效果：**可評分的集合從 131 縮到 76**。
「讀過 What is Product Management?」本來就不該和「做得出一份過 rubric 的 PRD」
佔同一格分數。

> **兩個畫面是同一份資料的兩個視圖。** 改一個 id 的 `status`，能力地圖與技能圖譜
> 一起變。（2026-08-19 之前它們是兩份各自帶 status 的資料，改一邊不會動另一邊，
> 而且沒有任何東西會提醒你——那是這個 repo 以前最容易踩的坑。）

---

## 硬規矩

改任何東西之前讀 `CLAUDE.md`。最容易踩的幾條：

- ⚠️ **`.js` 一律用傳統 `<script src>`，永遠不要改成 `type="module"`。**
  ES module 在 `file://` 下被 CORS 擋掉，直接開檔會整頁空白。
- ⚠️ **載入順序有意義**：`profile/budget.js` → `job-search/pipeline.js` →
  `framework/competencies.js` → `profile/assessment.js` → `profile/history.js`。
- ⚠️ **改 `job-search/jobs.js` 前先 `git pull --rebase`。** CI 每週一自動 commit 它，
  這是唯一的併發寫入點。
- ⚠️ **機器寫的欄位不手改**（`health` / `closedAt` / `checkedAt` / `retiredTotal`）。
  手改會被下次跑掉，而且會製造假的 `checkedAt`。
- **`wont`（刻意不學）不刪除**，保留項目 + 填 `reason`。這份 scope cut 清單本身
  就是給面試官看的東西，而且一律排除在所有分數之外。
- **不要編造資料。** 技能狀態、不學的理由、職缺評價都是個人判斷，無法確認填 `{{TBD}}`。
- **淨方向是減少。** 這個站的失敗模式是堆一份永遠學不完的清單來說服自己還不能投遞。

## 驗證

```bash
node scripts/validate-data.mjs        # 十條跨層檢查
node scripts/check-jobs.mjs --dry-run # 職缺解析器沒壞
open index.html && open roadmap.html  # 兩頁都要開，console 要乾淨
```

沒有自動化測試。`roadmap.html` 技能圖譜的**三個 sub-view（清單／雷達／技能樹）
都要點過**，不要只看清單。
