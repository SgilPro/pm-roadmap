# pm-roadmap

前端工程師轉軟體 PM 的求職追蹤站。GitHub Pages 靜態單頁，無 build step、無後端、無相依套件（Chart.js 走 CDN）。

改版脈絡與任務單見 `docs/mentor-handoff.md`。

**`docs/` 在 `.gitignore` 裡，只存在本機。** repo 是 public，而 `docs/` 內含求職診斷、目標公司評估與訪談紀錄，不想被 GitHub 或 Pages 公開。新的訪談紀錄一律放這裡；要放進版控的內容請放別處。

## 檔案

| 路徑 | 內容 |
|---|---|
| `index.html` | 整站。HTML + CSS + JS + 資料全部在這一個檔案裡 |
| `portfolio/linkju.html`、`portfolio/voipark.html` | 兩份 PM case study |
| `docs/mentor-handoff.md` | 改版任務單與診斷（活文件） |
| `docs/user-interviews/` | 訪談指南模板與紀錄 |

驗證方式：`open index.html`。沒有測試，改完請開瀏覽器逐分頁看過並確認 console 無錯誤。

## 資料常數（都在 `index.html` 的 `<script>` 內）

| 常數 | 用途 | status 值 |
|---|---|---|
| `PIPELINE_DATA` | 首頁主指標：投遞→面試→offer。**唯一的結果指標** | — |
| `ROADMAP_DATA` | 12 個 phase 的能力地圖，92 項 | `have` / `learning` / `need` / `wont` |
| `SKILLS_DATA` | 扁平技能表，39 項 | `have` / `partial` / `need` / `wont` |
| `JOBS_DATA` | 23 個職缺 | — |
| `JOBS_META` | `checkedAt` — 職缺清單最後核對日 | — |
| `SKILL_HISTORY` | 版本快照，每筆帶完整 `SKILLS_DATA` 副本 | — |

## ⚠️ 兩份技能資料，餵不同的畫面

這是這個 repo 最容易踩的地方：

- **`ROADMAP_DATA`** → 只餵 roadmap tab 的 `renderRoadmap()`
- **`SKILLS_DATA`** → 餵技能圖譜 tab 的**三個** sub-view：`renderSkills()`（清單）、`buildCatGroups()`（雷達）、`renderSkillTree()`（技能樹），全部經 `getActiveSkillsData()`

兩者**不會互相同步**，且本來就有大量重複項目（GA4、SQL、JTBD、MVP、A/B Testing、Five Forces、Service Design 都同時存在於兩邊）。改一邊記得看另一邊。

改任何技能狀態後，三個 sub-view 都要驗證，不要只看清單。

## 慣例

- **資料與呈現分離**：新欄位加在 `*_DATA` 常數，不要硬編碼進 HTML。（既有例外：jobs tab 的 readiness panel 是硬編碼的。）
- **`wont`（刻意不學）不刪除**。保留項目、標狀態、填 `reason`，由 `renderWontList()` 集中展示——這個 scope cut 清單本身就是給面試官看的東西。`reasonDetail` 為選填長版。
- **`wont` 一律排除在所有分數之外**：`calcCompletion()`、`buildCatGroups()`、`renderSkillTree()` 的分母都已過濾。新增計算時記得比照。
- **`Five Forces` 在兩份資料裡叫不同名字**（`Five Forces Analysis` / `Porter's Five Forces`），靠 `WONT_ALIASES` 在不學清單中合併成一筆。
- **不要編造資料**。技能狀態、不學的理由、職缺資訊都是使用者的個人判斷，無法確認時填 `{{TBD}}`。`JOBS_META.checkedAt` 必須是真的核對過的日期。
- **淨方向是減少**。這個站的失敗模式是堆一份永遠學不完的清單來說服自己還不能投遞。新增項目前先想能砍什麼。
