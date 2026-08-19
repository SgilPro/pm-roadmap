# pm-roadmap

前端工程師轉軟體 PM 的求職追蹤站，外加一套正在長出來的產品力養成框架。GitHub Pages 靜態站，無 build step、無後端、無相依套件。

**三層資料，判準是「擁有權」不是主題（2026-08-19 建立）：**

| 目錄 | 是什麼 | 誰的 |
|---|---|---|
| `framework/` | **框架本體**：16 個 L1 competency、121 個項目、學習路徑結構、空白範本 | 可打包給別人 clone。**沒有任何一個人的自評** |
| `profile/` | **我的框架套用**：自評狀態、6 點預算、版本快照 | 我的 |
| `job-search/` | **我的求職追蹤**：Pipeline、職缺清單 | 我的 |

別人 clone 後跑 `node scripts/init.mjs`：從 `framework/templates/` 複製空白檔到 `profile/` 與 `job-search/`。無 server、無登入、無資料庫——資料就是 repo 裡的幾個 `.js`。**init 不會覆蓋既有檔案**（要覆蓋得加 `--force`）。

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
| `framework/competencies.js` | 能力骨架 + 121 個項目 + `CURRICULUM` + 衍生視圖函式 |
| `framework/templates/*.js` | 空白範本，`init.mjs` 用 |
| `profile/{assessment,budget,history}.js` | 我的自評、預算、快照 |
| `job-search/{pipeline,jobs}.js` | 我的求職資料。**`jobs.js` 是 CI 唯一寫入的檔** |
| `scripts/init.mjs` | 初始化（複製範本） |
| `scripts/validate-data.mjs` | 十條跨層完整性檢查 |
| `scripts/{migrate-spine,build-layers}.mjs` | 一次性遷移，留著讓分類決策可被審核與重跑 |
| `portfolio/linkju.html`、`portfolio/voipark.html` | 兩份 PM case study |
| `scripts/check-jobs.mjs` | 職缺連結核對器（無相依套件，Node 18+）。**寫入 `job-search/jobs.js`** |
| `.github/workflows/check-jobs.yml` | 每週一跑上面那支，有變更就自動 commit |
| `docs/mentor-handoff.md` | 改版任務單與診斷（活文件） |
| `docs/user-interviews/` | 訪談指南模板與紀錄 |
| `docs/job-triage.md` | 雙週 15 分鐘的人工職缺 triage 流程 |
| `docs/framework.md` | **產品力養成框架的完整設計**（架構、SSOT、rubrics、spine、視覺化、Phase 2/3）。活文件 |
| `docs/job-search-2027.md` | **錨定 2027 年終的求職時程**（六個雙週窗口、容量算式、投遞規模）。活文件 |

驗證方式：`node scripts/validate-data.mjs`（十條跨層檢查），再 `open index.html` **與** `open roadmap.html`。沒有測試，改完兩頁都要開、逐分頁看過並確認 console 無錯誤。技能圖譜的**三個 sub-view（清單／雷達／技能樹）都要點過**，不要只看清單。

⚠️ **三層的 `.js` 一律用傳統 `<script src>`，永遠不要改成 `type="module"`。** ES module 在 `file://` 下被 CORS 擋掉，直接開檔就會整頁空白。

⚠️ **載入順序有意義**，兩頁都要照這個序：`profile/budget.js` → `job-search/pipeline.js`（`runwayState()` 讀 `BUDGET`）→ `framework/competencies.js` → `profile/assessment.js`（衍生視圖要吃它）→ `profile/history.js`。

⚠️ **`roadmap.html` 開頭有個缺檔守衛**（`guardMissingData()`）：少了任何一個資料檔就在畫面上指名道姓，而不是整頁空白。**它必須用 `typeof X` 逐項寫死，不能跑迴圈查 `window[name]`**——`const` 宣告的頂層變數是語彙綁定，不會變成 `window` 的屬性，寫成迴圈會讓正常頁面也被判定缺檔。第一版就是這樣壞掉的。

CI 存在**不代表網站有 build step**——兩個頁面都仍然是打開就能跑。workflow 只改 `job-search/jobs.js` 的資料欄位，不產生網站。

## 資料常數

| 常數 | 檔案 | 用途 |
|---|---|---|
| `COMPETENCIES` | `framework/competencies.js` | 16 個 L1（Ravi Mehta 12 + ISPMA 4） |
| `ITEMS` | `framework/competencies.js` | 121 個項目。`kind` = `skill` / `topic` / `ability` / `tool`；`l1` 掛哪個能力；`eval` 要拿什麼當佐證；`packaged: false` = 不隨框架出去 |
| `CURRICULUM` | `framework/competencies.js` | 12 個 phase 的學習路徑結構。**只存哪個 phase 教哪些 item，不存狀態** |
| `skillsView()` / `roadmapView()` | `framework/competencies.js` | 衍生視圖，render 時算不存。吃 `ASSESSMENT` |
| `ASSESSMENT` | `profile/assessment.js` | **狀態的唯一來源**，key 是 item id。`have`/`partial`/`learning`/`need`/`wont` |
| `SKILL_HISTORY` | `profile/history.js` | 版本快照。每筆 `data` 是合併前的扁平格式，**刻意不遷移** |
| `BUDGET` | `profile/budget.js`（兩頁都載） | 6 點預算，一點 = 一份過 rubric 的產出物 |
| `PIPELINE_DATA` | `job-search/pipeline.js`（兩頁都載） | **唯一的結果指標** |
| `APPLY_DATE` / `runwayState()` | `job-search/pipeline.js` | 投遞日與窗口狀態機。**到期邏輯只有這一份**，兩頁共用 |
| `JOBS_DATA` / `JOBS_META` | `job-search/jobs.js` | 12 個職缺（原 23，已退場 11）+ `checkedAt` |

## ✅ 「兩份技能資料」那個坑已經補掉了（2026-08-19）

以前 `ROADMAP_DATA`（92）與 `SKILLS_DATA`（39）**各自帶一份 status、不互相同步**，7 個概念同時存在於兩邊（GA4、SQL、JTBD、MVP、A/B Testing、Five Forces、Service Design），改一邊不會動另一邊，而且沒有任何東西會提醒你。這是本檔以前標記的「最容易踩的地方」。

現在**狀態只有 `profile/assessment.js` 一份**，兩個畫面都是它的衍生視圖：

- `roadmapView(ASSESSMENT)` → Roadmap tab 的 `renderRoadmap()`
- `skillsView(ASSESSMENT)` → 技能圖譜 tab 的**三個** sub-view，全部經 `getActiveSkillsData()`

改一個 id 的 status，兩邊一起變。遷移時已驗證兩個視圖的輸出與合併前**逐字相同**。

⚠️ 兩邊的**顯示名稱與字彙刻意不同**，那是顯示層而非狀態：課程用 roadmap.sh 原文（`Five Forces Analysis`、半形括號的 `Jobs to Be Done (JTBD)`），技能表用使用者自己的用詞；canonical status 存 `partial`，`roadmapView()` 翻成 `learning`。**不要為了「統一」把這些抹平**，那會改變站上的文字。

改任何技能狀態後，三個 sub-view 都要驗證，不要只看清單。

## 慣例

- **資料與呈現分離**：新欄位加在 `*_DATA` 常數，不要硬編碼進 HTML。（既有例外：jobs tab 的 readiness panel 是硬編碼的。）
- **`wont`（刻意不學）不刪除**。保留項目、標狀態、填 `reason`，由 `renderWontList()` 集中展示——這個 scope cut 清單本身就是給面試官看的東西。`reasonDetail` 為選填長版。
- **`wont` 一律排除在所有分數之外**：`calcCompletion()`、`buildCatGroups()`、`renderSkillTree()` 的分母都已過濾。新增計算時記得比照。
- **`Five Forces` 在兩個視圖裡叫不同名字**（課程用 `Five Forces Analysis`、技能表用 `Porter's Five Forces`），靠 `WONT_ALIASES` 在不學清單中合併成一筆。狀態本身早就只有一份了。
- **`framework/` 裡不放任何人的自評。** 新增欄位前先問「這是框架的意見，還是我的狀態」——前者進 `framework/competencies.js`，後者進 `profile/assessment.js`。
- ⚠️ **`framework/` 目前還不能發佈**：76 項 skill 裡有 51 項的 `eval` 是 `null`，而 `eval`（要拿什麼當佐證）就是這個框架的價值。空白的 `eval` 等於送一張空表格。`validate-data.mjs` 會提醒但不擋。
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
- ⚠️ **改 `job-search/jobs.js` 前先 `git pull --rebase`。** CI 每週一自動 commit 這個檔案，所以本機放個幾天就會**靜默地**落後。不先 pull 就會用舊的 `health` / `checkedAt` 蓋掉新的，等於手動製造假的 `checkedAt`。（2026-08-12 實際踩到：本機落後兩個 commit，`JOBS_META.checkedAt` 差了兩週，`JOBS_DATA` 少了 10 筆退場紀錄。）
- ✅ **`job-search/jobs.js` 是唯一的併發寫入點。** CI 只寫這一個檔；`index.html` / `roadmap.html` / `assets/` / `framework/` / `profile/` 全是純人工檔。這條護欄的範圍因此從「整站」縮到一個資料檔。
