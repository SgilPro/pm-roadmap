// 我的自評版本快照。每次大幅更新技能狀態時 append 一筆。
//
// ⚠️ 每筆的 data 是**合併前 SKILLS_DATA 的扁平格式**，刻意不遷移：
//    歷史快照的價值就是「當時長什麼樣」，改寫它等於偽造歷史。
//    getActiveSkillsData() 對現況呼叫 skillsView()、對歷史直接回傳 snap.data，
//    兩者格式相同所以不需要轉換。
//
// ⚠️ 傳統 <script src>，不可改成 type="module"。

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
