# pm-roadmap

前端工程師轉軟體 PM 的求職追蹤站，外加一套正在長出來的產品力養成框架。GitHub Pages 靜態站，無 build step、無後端、無相依套件。

**兩個頁面，兩條線，2026-08-19 分家：**

| 頁面 | 是什麼 | 指標性質 |
|---|---|---|
| `index.html` | **求職**：Pipeline + 倒數 + 投遞準備度 + 職缺清單 + Portfolio | `PIPELINE_DATA` 是**唯一的結果指標** |
| `roadmap.html` | **能力框架**：能力地圖 + 技能圖譜三個 sub-view + 刻意不學清單 | 全部是 **input metric** |

分家的理由不是整潔：readiness panel 問的是「我準備好投遞了嗎」，如果能力進度和投遞數字並列在同一個 tab bar 上，「把格子從 `need` 改成 `have`」就會看起來像朝 offer 前進了一步——而它完全不是。這也是為什麼 `roadmap.html` 頂端**必須**掛那條 north-star strip（見 `renderNorthStarStrip()`）：拆頁把「看技能就會看到 `applied: 0`」這個約束拆掉了，strip 是把它裝回去。**礙眼是它的功能，不要拿掉。**

**開工前先讀對應那份活文件**：框架／機制的工作看 `docs/framework.md`，求職時程與投遞的工作看 `docs/job-search-2027.md`。7 月那一波改版的脈絡見 `docs/mentor-handoff.md`（已結案，只剩 §4、§5 仍在承重）。

**`docs/` 在 `.gitignore` 裡，只存在本機。** repo 是 public，而 `docs/` 內含求職診斷、目標公司評估與訪談紀錄，不想被 GitHub 或 Pages 公開。新的訪談紀錄一律放這裡；要放進版控的內容請放別處。

## 檔案

| 路徑 | 內容 |
|---|---|
| `index.html` | 求職頁。**無任何外部依賴**（Chart.js 只有 `roadmap.html` 需要），離線可開 |
| `roadmap.html` | 能力框架頁。載 Chart.js CDN 畫雷達 |
| `assets/site.css` | 兩頁共用的全部樣式。**一份不拆三份**——拆了才會漂 |
| `data/*.js` | 全部資料常數，見下表。傳統 `<script src>` 載入 |
| `portfolio/linkju.html`、`portfolio/voipark.html` | 兩份 PM case study |
| `scripts/check-jobs.mjs` | 職缺連結核對器（無相依套件，Node 18+）。**寫入 `data/jobs.js`，不碰 `index.html`** |
| `.github/workflows/check-jobs.yml` | 每週一跑上面那支，有變更就自動 commit |
| `docs/mentor-handoff.md` | 改版任務單與診斷（活文件） |
| `docs/user-interviews/` | 訪談指南模板與紀錄 |
| `docs/job-triage.md` | 雙週 15 分鐘的人工職缺 triage 流程 |
| `docs/framework.md` | **產品力養成框架的完整設計**（架構、SSOT、rubrics、spine、視覺化、Phase 2/3）。活文件 |
| `docs/job-search-2027.md` | **錨定 2027 年終的求職時程**（六個雙週窗口、容量算式、投遞規模）。活文件 |

驗證方式：`open index.html` **與** `open roadmap.html`。沒有測試，改完兩頁都要開、逐分頁看過並確認 console 無錯誤。技能圖譜的**三個 sub-view（清單／雷達／技能樹）都要點過**，不要只看清單。

⚠️ **`data/*.js` 一律用傳統 `<script src>`，永遠不要改成 `type="module"`。** ES module 在 `file://` 下被 CORS 擋掉，直接開檔就會整頁空白。載入順序也有意義：`data/pipeline.js` 的 `runwayState()` 讀 `data/budget.js` 的 `BUDGET`，budget 必須在前面。

CI 存在**不代表網站有 build step**——兩個頁面都仍然是打開就能跑。workflow 只改 `data/jobs.js` 的資料欄位，不產生網站。

## 資料常數（都在 `data/*.js`，2026-08-19 從 `index.html` 搬出來）

| 常數 | 檔案 | 用途 | status 值 |
|---|---|---|---|
| `PIPELINE_DATA` | `data/pipeline.js`（兩頁都載） | 主指標：投遞→面試→offer。**唯一的結果指標** | — |
| `ROADMAP_DATA` | `data/roadmap.js` | 12 個 phase 的能力地圖，92 項 | `have` / `learning` / `need` / `wont` |
| `SKILLS_DATA` | `data/skills.js` | 扁平技能表，39 項 | `have` / `partial` / `need` / `wont` |
| `JOBS_DATA` | `data/jobs.js` | 12 個職缺（原 23，已退場 11），每筆帶 `health` | `open` / `closed` / `unknown` |
| `JOBS_META` | `data/jobs.js` | `checkedAt` — 職缺清單最後核對日；`checkMethod` — 怎麼核的 | — |
| `SKILL_HISTORY` | `data/skills.js` | 版本快照，每筆帶完整 `SKILLS_DATA` 副本 | — |
| `BUDGET` | `data/budget.js`（兩頁都載） | 準備期 6 點預算，一點 = 一份過 rubric 的產出物 | — |
| `APPLY_DATE` / `runwayState()` | `data/pipeline.js` | 投遞日與窗口狀態機。**到期邏輯只有這一份**，兩頁共用 | — |

## ⚠️ 兩份技能資料，餵不同的畫面

這是這個 repo 最容易踩的地方：

- **`ROADMAP_DATA`** → 只餵 `roadmap.html` Roadmap tab 的 `renderRoadmap()`
- **`SKILLS_DATA`** → 餵 `roadmap.html` 技能圖譜 tab 的**三個** sub-view：`renderSkills()`（清單）、`buildCatGroups()`（雷達）、`renderSkillTree()`（技能樹），全部經 `getActiveSkillsData()`

兩者**不會互相同步**，且本來就有大量重複項目（GA4、SQL、JTBD、MVP、A/B Testing、Five Forces、Service Design 都同時存在於兩邊）。改一邊記得看另一邊。

改任何技能狀態後，三個 sub-view 都要驗證，不要只看清單。

## 慣例

- **資料與呈現分離**：新欄位加在 `*_DATA` 常數，不要硬編碼進 HTML。（既有例外：jobs tab 的 readiness panel 是硬編碼的。）
- **`wont`（刻意不學）不刪除**。保留項目、標狀態、填 `reason`，由 `renderWontList()` 集中展示——這個 scope cut 清單本身就是給面試官看的東西。`reasonDetail` 為選填長版。
- **`wont` 一律排除在所有分數之外**：`calcCompletion()`、`buildCatGroups()`、`renderSkillTree()` 的分母都已過濾。新增計算時記得比照。
- **`Five Forces` 在兩份資料裡叫不同名字**（`Five Forces Analysis` / `Porter's Five Forces`），靠 `WONT_ALIASES` 在不學清單中合併成一筆。
- **不要編造資料**。技能狀態、不學的理由、職缺資訊都是使用者的個人判斷，無法確認時填 `{{TBD}}`。`JOBS_META.checkedAt` 必須是真的核對過的日期。
- **淨方向是減少**。這個站的失敗模式是堆一份永遠學不完的清單來說服自己還不能投遞。新增項目前先想能砍什麼。

## 職缺清單的更新機制

2026-07-27 實抓證實：清單建立四週後，**23 個裡有 10 個已下架（43%）**。所以核對必須自動化。

**「自動核對」不等於「自動抓職缺」。** handoff §5 禁止的是後者，這條線不要越過：

| | 誰做 | 為什麼 |
|---|---|---|
| **衰減**（連結死掉） | `scripts/check-jobs.mjs`，每週一自動 | 純機械，HTTP 狀態碼就是答案，零判斷 |
| **發現**（新職缺） | 人工，見 `docs/job-triage.md` | `match` / `why` / `tier` / `pdmExposure` 全是使用者的個人判斷，自動生成就是編造資料 |

腳本**只查 HTTP 狀態碼，不解析職缺頁內容**。

- **`health` 判定**：200 → `open`；404 / 410 → `closed`；**其他一律不是 `closed`**。403 / 429 / 5xx / timeout 代表「我們被擋了」而不是「職缺沒了」，一律保留原值。
- **104.com.tw 永遠無法自動核對**。整站在 Cloudflare managed challenge 後面，連 `robots.txt` 都要跑 JS 才拿得到。腳本直接跳過不發請求，強制 `unknown`，交給人工點開。（cake.me 的 `robots.txt` 則完全開放，自報身分的 UA 就能通，不需要偽裝瀏覽器。）
- **兩道護欄，都會 `exit 1` 讓 CI 失敗**：未驗證比例 > 40% 視為檢查器被擋，一個字都不寫；寫入後 `<script>` 過不了 `node --check` 就還原檔案。沉默地寫入錯誤資料比沒有機制更糟。
- **`closedAt` 是移除的計時器**。死掉當下蓋日期，滿 7 天後由下一次核對從 `JOBS_DATA` 移除、`rank` 重編、`JOBS_META.retiredTotal` 遞增。**清單不留屍體，但保留「爛得多快」這個統計。**
- **`JOBS_META.checkedAt` 只能由真的核對過的流程更新**（腳本會自己更新，手動改請先實跑）。
- **`renderApplyGap()` 是刻意的刺**：主推開放數 vs `PIPELINE_DATA.applied`。維護清單很像在前進，但它不會讓投遞數字動。不要為了讓那行紅字消失而去改資料。
- ⚠️ **GitHub 會在 repo 連續 60 天無活動後停掉排程 workflow**，要用 email 重新啟用。
- ⚠️ **改 `data/jobs.js` 前先 `git pull --rebase`。** CI 每週一自動 commit 這個檔案，所以本機放個幾天就會**靜默地**落後。不先 pull 就會用舊的 `health` / `checkedAt` 蓋掉新的，等於手動製造假的 `checkedAt`。（2026-08-12 實際踩到：本機落後兩個 commit，`JOBS_META.checkedAt` 差了兩週，`JOBS_DATA` 少了 10 筆退場紀錄。）
- ✅ **2026-08-19 起，`data/jobs.js` 是唯一的併發寫入點。** 資料搬出 `index.html` 之後，CI 只寫這一個檔，`index.html` / `roadmap.html` / `assets/` / 其餘 `data/*.js` 全是純人工檔。上面那條護欄的範圍因此從「整站」縮到一個檔——這就是搬檔真正買到的東西。
