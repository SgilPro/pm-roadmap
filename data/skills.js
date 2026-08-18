// 扁平技能表 39 項 + 版本快照。餵 roadmap.html 技能圖譜的**三個** sub-view：
// renderSkills()（清單）、buildCatGroups()（雷達）、renderSkillTree()（技能樹），
// 全部經 getActiveSkillsData()。改任何狀態後三個都要驗證，不要只看清單。
//
// ⚠️ Phase 2 會把這份拆成 data/competencies.js（定義）+ data/assessment.js（我的分數），
//    現在不拆——語意變更不該和搬檔混在同一批 diff 裡。
// ⚠️ 傳統 <script src>，不可改成 type="module"。

const SKILLS_DATA = [
  // social: "high"=社創背景直接可轉移 "mid"=部分可轉移 "low"=需從頭學（SE或純商業）
  // eval: 最具體的能力佐證方式（作品集素材或認證）；hover 可見
  { cat: "商業與策略", skill: "市場規模評估（TAM/SAM/SOM）", status: "need", priority: 60, note: "PDM 面試必考", social: "low",
    eval: "用公開資料計算一個市場的 TAM/SAM/SOM，附假設來源，以 1 頁簡報呈現" },
  { cat: "商業與策略", skill: "Business Model Canvas", status: "need", priority: 55, note: "理解商業邏輯", social: "mid",
    eval: "對一個真實產品填完整 Strategyzer BMC，配合競品做對比，放作品集" },
  { cat: "商業與策略", skill: "競品分析", status: "partial", priority: 80, note: "Phase 1 作業：輸出一份", social: "low",
    eval: "選 4~6 家競品、定義 8~10 個比較維度（功能/定價/GTM/壁壘），輸出競品矩陣 + Positioning Map" },
  { cat: "商業與策略", skill: "Porter's Five Forces", status: "wont", priority: 40, note: "概念理解即可", social: "low", reason: "概念理解即可，不需深入。" },
  { cat: "執行力", skill: "OKR 設定", status: "have", priority: 90, note: "Scrum Master 期間用過", social: "mid" },
  { cat: "執行力", skill: "RICE / MoSCoW 優先序", status: "partial", priority: 85, note: "理論懂，需要實際帶過一輪", social: "low",
    eval: "對真實 Backlog（≥10 項）做 RICE 評分，附每個假設的來源（訪談/數據/商業目標），以 Google Sheets 呈現" },
  { cat: "執行力", skill: "PRD 撰寫", status: "partial", priority: 95, note: "Phase 1 首要任務", social: "low",
    eval: "寫完整 PRD（問題陳述 + 使用者故事 + 驗收標準 + 成功指標 + 邊界條件），公開發布在 Notion，可作為帶回家作業範本" },
  { cat: "執行力", skill: "Agile / Scrum", status: "have", priority: 95, note: "SM 3個月，直接對應", social: "low" },
  { cat: "執行力", skill: "Risk Management", status: "need", priority: 45, note: "PJM 較重要", social: "mid",
    eval: "建立 RAID Log + 機率/影響矩陣，提出 Top 5 風險緩解計畫；Google PM Certificate（Coursera）可作憑證" },
  { cat: "人員領導", skill: "跨部門溝通", status: "have", priority: 90, note: "工程師 + 獵頭背景都有", social: "high" },
  { cat: "人員領導", skill: "Stakeholder Alignment", status: "have", priority: 90, note: "SM 期間實戰過", social: "high" },
  { cat: "人員領導", skill: "Executive Communication", status: "need", priority: 70, note: "需要練習 C-level 簡報", social: "mid",
    eval: "寫一份 1-page Executive Brief（BLUF 格式：結論先行 → 背景 → 選項 → 建議 → 所需決策），模擬向 C-level 報告" },
  { cat: "人員領導", skill: "Conflict Resolution", status: "have", priority: 75, note: "", social: "high" },
  { cat: "數據分析", skill: "GA4 / 分析工具", status: "partial", priority: 90, note: "Phase 1：完成 GA4 認證", social: "low",
    eval: "完成 Google Skillshop GA4 Certification（免費，~4~6h，頒發可分享 badge，可直接列履歷）" },
  { cat: "數據分析", skill: "SQL（Product Analytics）", status: "partial", priority: 85, note: "Phase 2：Mode Analytics Tutorial", social: "low",
    eval: "在 StrataScratch 完成 30 題 PM/Data 等級 SQL 題；用 BigQuery 公開資料集產出一份 Retention 分析放作品集" },
  { cat: "數據分析", skill: "Funnel / Cohort 分析", status: "need", priority: 85, note: "面試必問", social: "low",
    eval: "用 Kaggle 電商公開資料集做完整留存曲線 + Funnel 分析，輸出帶結論的圖表報告（SQL + 圖），放作品集" },
  { cat: "數據分析", skill: "A/B Testing 設計", status: "need", priority: 70, note: "", social: "low",
    eval: "寫 A/B Test Design Doc：假設 → 組別定義 → Primary metric + Guardrail → 樣本數計算（Evan Miller）→ 決策標準" },
  { cat: "數據分析", skill: "North Star Metric", status: "partial", priority: 80, note: "理解概念，需要實例", social: "low",
    eval: "為一個真實產品定義 NSM，並畫出完整 Input Metrics Tree（3 層），說明每層指標與 NSM 的關係，以 1 頁文件呈現" },
  { cat: "產品發現", skill: "User Interview 設計", status: "need", priority: 80, note: "PDM 核心，需補", social: "high",
    eval: "完成 5 次使用者訪談 → 輸出逐字稿 + Affinity Diagram + ≥3 個洞察報告，放作品集（參考《The Mom Test》避免引導性問題）" },
  { cat: "產品發現", skill: "Jobs to Be Done（JTBD）", status: "partial", priority: 75, note: "概念理解中", social: "mid",
    eval: "為一個產品寫 5 個 JTBD Job Statement（When [situation], I want to [goal], so I can [outcome]），附用戶研究依據" },
  { cat: "產品發現", skill: "Usability Testing", status: "need", priority: 65, note: "", social: "low",
    eval: "用 Figma prototype 對 5 名目標用戶做 Think-Aloud test，輸出任務成功率 + 錯誤類型 + Severity Rating（Nielsen 1~4 分）" },
  { cat: "產品發現", skill: "Problem Definition", status: "have", priority: 90, note: "工程師debug思維直接轉", social: "high" },
  { cat: "產品發現", skill: "Service Design", status: "need", priority: 55, note: "長期社創工具：NGO/社企方案設計核心", social: "high",
    eval: "對一個社會議題用 Service Blueprint 呈現前後台流程與接觸點，識別 2~3 個痛點改善機會，以圖表輸出" },
  { cat: "實驗驗證", skill: "MVP 定義", status: "partial", priority: 85, note: "理論懂，需要輸出案例", social: "mid",
    eval: "寫 MVP Scoping 案例文件：列入選/排除功能 + 理由 + 驗證 MVP 成功的最低指標，以 Notion 頁面呈現放作品集" },
  { cat: "實驗驗證", skill: "A/B Testing 執行", status: "need", priority: 70, note: "", social: "low",
    eval: "用 GrowthBook（免費開源）在 side project 實際設定一個 experiment flag，截圖紀錄設定流程與結果分析，放作品集" },
  { cat: "實驗驗證", skill: "假型（Fake Door）測試", status: "wont", priority: 50, note: "概念理解就好", social: "low",
    reason: "概念理解就好；真正要練的是「如何問對問題、選對驗證方法」。",
    reasonDetail: "你有前端背景＋現在在整理一整套技能圖，對你而言更核心的是「實驗設計與驗證思維」，而不是每個 tactic 的細緻玩法。你只要能聽懂這個詞在會議裡出現時的意思：知道它是「先露出入口，還沒做完功能，用點擊看需求」，能評估對你現在的產品／社會現場是否合適。真正需要刻意練的，是「如何問對問題、選對驗證方法」。多數時候你會有更乾淨的替代方案：訪談、可用性測試、原型測試、等候名單（waitlist）、Landing Page 測試、價格／方案實驗等等。假門只是眾多選項之一，不值得獨立成一項長期修煉目標。" },
  { cat: "產品行銷", skill: "GTM Strategy", status: "need", priority: 60, note: "PJM 較少用，PDM 必要", social: "low",
    eval: "寫 GTM Plan 文件：ICP 定義 → 定價策略 → 行銷通路 → 銷售動作 → 上市時程 → 成功指標（1 頁內最佳）" },
  { cat: "產品行銷", skill: "Value Proposition 設計", status: "need", priority: 70, note: "", social: "mid",
    eval: "完成 Strategyzer Value Proposition Canvas：Customer Jobs/Pains/Gains ≥5 項，對應 Pain Relievers/Gain Creators，圖文並茂放作品集" },
  { cat: "產品行銷", skill: "Launch Planning", status: "need", priority: 65, note: "", social: "low",
    eval: "撰寫產品上市計畫：目標 → 時程 → 溝通計畫 → 成功指標，含 RACI chart，以 1~2 頁文件呈現放作品集" },
  { cat: "技術能力", skill: "API / 系統架構溝通", status: "have", priority: 95, note: "最大優勢，直接命中JD", social: "low" },
  { cat: "技術能力", skill: "前端可行性評估", status: "have", priority: 90, note: "", social: "low" },
  { cat: "技術能力", skill: "後端 / DB 邏輯理解", status: "have", priority: 85, note: "", social: "low" },
  { cat: "技術能力", skill: "Figma 讀稿 / 基礎操作", status: "have", priority: 80, note: "", social: "low" },
  // AI-Native PM：只列與 ROADMAP_DATA「Advanced / AI PM」不重疊的項目。
  // Prompt Engineering / AI Feature Design / Model Limitation 評估 已在該分類標為 have。
  { cat: "AI-Native PM", skill: "RAG 知識庫治理", status: "need", priority: 70, note: "切偵策略、資料新鮮度、權限分層、回答品質評估", social: "mid",
    eval: "設計一個 RAG 系統的資料品質審核 checklist + 回答品質評估框架（RAGAS 或自訂指標），以文件形式呈現" },
  { cat: "AI-Native PM", skill: "AI 輔助 discovery 的證據紀律", status: "need", priority: 80, note: "區分真實證據與模型推論", social: "high",
    eval: "完成一次 AI 輔助 discovery 報告，明確標記哪些 insight 來自真實用戶訪談、哪些來自模型推論，呈現方法論" },
  { cat: "AI-Native PM", skill: "vibe-coding prototype", status: "partial", priority: 85, note: "本站與 portfolio 即為產出", social: "mid" },
  { cat: "AI-Native PM", skill: "Agent 工作流設計", status: "partial", priority: 75, note: "拆解任務、工具邊界、人工介入點、失敗回復", social: "mid",
    eval: "設計並實作一個 3 步驟以上的 agent workflow，記錄工具邊界、人工介入點、失敗回復機制，以流程圖+說明文件呈現" },
  // 轉職敘事：面試的實際門檻，不是技術問題。
  { cat: "轉職敘事", skill: "Why PM / Why now / Why you 敘事", status: "need", priority: 95, note: "含工程→PM 的能力翻譯；面試必問", social: "high",
    eval: "寫出並練習一個 90 秒版本的 PM 轉職故事，涵蓋 why PM/why now/why you，請 2 人以上提供回饋並迭代" },
  { cat: "轉職敘事", skill: "STAR 故事庫（3–5 則）", status: "need", priority: 90, note: "含社創動機與 PM 能力的連結", social: "high",
    eval: "整理 3~5 則 STAR 格式的職涯故事（含社創經驗），每則含 PM 能力連結，備好面試即取用的 Notion 頁面" },
];

// ===== SNAPSHOT HISTORY =====
// 每次更新技能資料時，將舊版 SKILLS_DATA 推入此陣列（含 date 標籤）
const SKILL_HISTORY = [
  // { date: "2026-MM-DD", label: "...", summary: "...", data: [...] }
  {
    date: "2026-07-27",
    label: "2026-07-27 改版：pipeline 主指標",
    summary: "主指標改為 pipeline、刻意不學 8 項、新增 AI-Native PM 與轉職敘事。SKILLS_DATA 32 → 39 項（+4 AI-Native PM、+2 轉職敘事、+1 Service Design），其中 2 項轉為刻意不學，計入完成度的有效項數 30 → 37。ROADMAP_DATA 維持 92 項，7 項轉為刻意不學、Feature Toggles / Dark Launch 由待學改為已具備，有效項數 92 → 85。",
    data: [
  // social: "high"=社創背景直接可轉移 "mid"=部分可轉移 "low"=需從頭學（SE或純商業）
  { cat: "商業與策略", skill: "市場規模評估（TAM/SAM/SOM）", status: "need", priority: 60, note: "PDM 面試必考", social: "low" },
  { cat: "商業與策略", skill: "Business Model Canvas", status: "need", priority: 55, note: "理解商業邏輯", social: "mid" },
  { cat: "商業與策略", skill: "競品分析", status: "partial", priority: 80, note: "Phase 1 作業：輸出一份", social: "low" },
  { cat: "商業與策略", skill: "Porter's Five Forces", status: "wont", priority: 40, note: "概念理解即可", social: "low", reason: "概念理解即可，不需深入。" },
  { cat: "執行力", skill: "OKR 設定", status: "have", priority: 90, note: "Scrum Master 期間用過", social: "mid" },
  { cat: "執行力", skill: "RICE / MoSCoW 優先序", status: "partial", priority: 85, note: "理論懂，需要實際帶過一輪", social: "low" },
  { cat: "執行力", skill: "PRD 撰寫", status: "partial", priority: 95, note: "Phase 1 首要任務", social: "low" },
  { cat: "執行力", skill: "Agile / Scrum", status: "have", priority: 95, note: "SM 3個月，直接對應", social: "low" },
  { cat: "執行力", skill: "Risk Management", status: "need", priority: 45, note: "PJM 較重要", social: "mid" },
  { cat: "人員領導", skill: "跨部門溝通", status: "have", priority: 90, note: "工程師 + 獵頭背景都有", social: "high" },
  { cat: "人員領導", skill: "Stakeholder Alignment", status: "have", priority: 90, note: "SM 期間實戰過", social: "high" },
  { cat: "人員領導", skill: "Executive Communication", status: "need", priority: 70, note: "需要練習 C-level 簡報", social: "mid" },
  { cat: "人員領導", skill: "Conflict Resolution", status: "have", priority: 75, note: "", social: "high" },
  { cat: "數據分析", skill: "GA4 / 分析工具", status: "partial", priority: 90, note: "Phase 1：完成 GA4 認證", social: "low" },
  { cat: "數據分析", skill: "SQL（Product Analytics）", status: "partial", priority: 85, note: "Phase 2：Mode Analytics Tutorial", social: "low" },
  { cat: "數據分析", skill: "Funnel / Cohort 分析", status: "need", priority: 85, note: "面試必問", social: "low" },
  { cat: "數據分析", skill: "A/B Testing 設計", status: "need", priority: 70, note: "", social: "low" },
  { cat: "數據分析", skill: "North Star Metric", status: "partial", priority: 80, note: "理解概念，需要實例", social: "low" },
  { cat: "產品發現", skill: "User Interview 設計", status: "need", priority: 80, note: "PDM 核心，需補", social: "high" },
  { cat: "產品發現", skill: "Jobs to Be Done（JTBD）", status: "partial", priority: 75, note: "概念理解中", social: "mid" },
  { cat: "產品發現", skill: "Usability Testing", status: "need", priority: 65, note: "", social: "low" },
  { cat: "產品發現", skill: "Problem Definition", status: "have", priority: 90, note: "工程師debug思維直接轉", social: "high" },
  { cat: "產品發現", skill: "Service Design", status: "need", priority: 55, note: "長期社創工具：NGO/社企方案設計核心", social: "high" },
  { cat: "實驗驗證", skill: "MVP 定義", status: "partial", priority: 85, note: "理論懂，需要輸出案例", social: "mid" },
  { cat: "實驗驗證", skill: "A/B Testing 執行", status: "need", priority: 70, note: "", social: "low" },
  { cat: "實驗驗證", skill: "假型（Fake Door）測試", status: "wont", priority: 50, note: "概念理解就好", social: "low",
    reason: "概念理解就好；真正要練的是「如何問對問題、選對驗證方法」。",
    reasonDetail: "你有前端背景＋現在在整理一整套技能圖，對你而言更核心的是「實驗設計與驗證思維」，而不是每個 tactic 的細緻玩法。你只要能聽懂這個詞在會議裡出現時的意思：知道它是「先露出入口，還沒做完功能，用點擊看需求」，能評估對你現在的產品／社會現場是否合適。真正需要刻意練的，是「如何問對問題、選對驗證方法」。多數時候你會有更乾淨的替代方案：訪談、可用性測試、原型測試、等候名單（waitlist）、Landing Page 測試、價格／方案實驗等等。假門只是眾多選項之一，不值得獨立成一項長期修煉目標。" },
  { cat: "產品行銷", skill: "GTM Strategy", status: "need", priority: 60, note: "PJM 較少用，PDM 必要", social: "low" },
  { cat: "產品行銷", skill: "Value Proposition 設計", status: "need", priority: 70, note: "", social: "mid" },
  { cat: "產品行銷", skill: "Launch Planning", status: "need", priority: 65, note: "", social: "low" },
  { cat: "技術能力", skill: "API / 系統架構溝通", status: "have", priority: 95, note: "最大優勢，直接命中JD", social: "low" },
  { cat: "技術能力", skill: "前端可行性評估", status: "have", priority: 90, note: "", social: "low" },
  { cat: "技術能力", skill: "後端 / DB 邏輯理解", status: "have", priority: 85, note: "", social: "low" },
  { cat: "技術能力", skill: "Figma 讀稿 / 基礎操作", status: "have", priority: 80, note: "", social: "low" },
  // AI-Native PM：只列與 ROADMAP_DATA「Advanced / AI PM」不重疊的項目。
  // Prompt Engineering / AI Feature Design / Model Limitation 評估 已在該分類標為 have。
  { cat: "AI-Native PM", skill: "RAG 知識庫治理", status: "need", priority: 70, note: "切偵策略、資料新鮮度、權限分層、回答品質評估", social: "mid" },
  { cat: "AI-Native PM", skill: "AI 輔助 discovery 的證據紀律", status: "need", priority: 80, note: "區分真實證據與模型推論", social: "high" },
  { cat: "AI-Native PM", skill: "vibe-coding prototype", status: "partial", priority: 85, note: "本站與 portfolio 即為產出", social: "mid" },
  { cat: "AI-Native PM", skill: "Agent 工作流設計", status: "partial", priority: 75, note: "拆解任務、工具邊界、人工介入點、失敗回復", social: "mid" },
  // 轉職敘事：面試的實際門檻，不是技術問題。
  { cat: "轉職敘事", skill: "Why PM / Why now / Why you 敘事", status: "need", priority: 95, note: "含工程→PM 的能力翻譯；面試必問", social: "high" },
  { cat: "轉職敘事", skill: "STAR 故事庫（3–5 則）", status: "need", priority: 90, note: "含社創動機與 PM 能力的連結", social: "high" },
]
  }
];
