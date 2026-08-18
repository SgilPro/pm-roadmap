// 12 個 phase 的能力地圖，92 項。只餵 roadmap.html 的 renderRoadmap()。
//
// ⚠️ 這份與 data/skills.js 的 SKILLS_DATA **不會互相同步**，且本來就有大量重複項目
//    （GA4、SQL、JTBD、MVP、A/B Testing、Five Forces、Service Design 兩邊都有）。
//    改一邊記得看另一邊。Phase 2 會決定它退場或降級成「學習路徑」視圖。
// ⚠️ 傳統 <script src>，不可改成 type="module"。

// status: "have" | "learning" | "need" | "wont"
// "wont" = 刻意不學（scope cut）。保留可見，不刪除；每項須有 reason。
const ROADMAP_DATA = [
  {
    title: "Introduction", icon: "📌", color: "#6366f1",
    groups: [
      { name: "基礎概念", skills: [
        { name: "What is Product Management?", status: "have" },
        { name: "Product vs Project Management", status: "learning" },
        { name: "Roles & Responsibilities", status: "have" },
        { name: "Key Skills Overview", status: "learning" },
      ]}
    ]
  },
  {
    title: "Idea Generation", icon: "💡", color: "#0891b2",
    groups: [
      { name: "發想工具", skills: [
        { name: "Mind Mapping", status: "have" },
        { name: "Brainstorming", status: "have" },
        { name: "SCAMPER", status: "wont", reason: "需要時現查即可，不需預先學。" },
        { name: "Problem Framing", status: "learning" },
        { name: "Blue Ocean Strategy", status: "wont", reason: "層級太高，現在用不到。" },
        { name: "TRIZ", status: "wont", reason: "算是選修不是必修，優先度低。" },
      ]}
    ]
  },
  {
    title: "Market & User Research", icon: "🔍", color: "#059669",
    groups: [
      { name: "市場分析", skills: [
        { name: "Identifying Market Needs", status: "need" },
        { name: "Competitive Analysis", status: "learning" },
        { name: "Emerging Market Trends", status: "need" },
        { name: "TAM / SAM / SOM", status: "need" },
      ]},
      { name: "用戶研究", skills: [
        { name: "User Personas", status: "learning" },
        { name: "User Interviews", status: "need" },
        { name: "Surveys & Questionnaires", status: "need" },
        { name: "Ethnographic Research", status: "wont", reason: "成本太高，先做 User Interview。" },
        { name: "Jobs to Be Done (JTBD)", status: "learning" },
        { name: "Usability Testing", status: "need" },
      ]}
    ]
  },
  {
    title: "Product Strategy", icon: "🎯", color: "#d97706",
    groups: [
      { name: "定位", skills: [
        { name: "USP / Positioning", status: "need" },
        { name: "Market Segmentation", status: "need" },
        { name: "Value Proposition Canvas", status: "need" },
        { name: "Business Model Canvas", status: "need" },
      ]},
      { name: "策略", skills: [
        { name: "Five Forces Analysis", status: "wont", reason: "概念理解即可，不需深入。" },
        { name: "SWOT / PESTLE", status: "wont",
          reason: "輸入品質遠比工具本身重要；低頻工具，不值得反覆操練。",
          reasonDetail: "輸入品質遠比工具本身重要。你真正需要的是：對政策、總體經濟、社會文化、技術、法規有基本敏感度，知道去看什麼資料、問什麼人。而不是對那幾個英文字母多熟。在多數 PM / 社創的日常裡，它是低頻工具。你頂多在寫企劃書、做長期規劃、寫報告給董事會或評審時，用它來「確認沒漏掉重要外部因素」。這種頻率，不值得當成需要反覆操練的技能。容易淪為「列點清單」，沒有分析。很多 PESTLE 的實作是：每一格列三點，看起來很完整，但沒有觸及「哪些因素真的會改變我們的策略選擇」。這種缺陷，靠的是策略思維與系統思考去補，跟多練 PESTLE 本身也無關。" },
        { name: "Competitive Advantage", status: "need" },
        { name: "Strategic Thinking", status: "learning" },
      ]}
    ]
  },
  {
    title: "Vision & Goals", icon: "🌟", color: "#7c3aed",
    groups: [
      { name: "目標設定", skills: [
        { name: "OKRs", status: "have" },
        { name: "North Star Metric", status: "learning" },
        { name: "Goal Types & Baselines", status: "need" },
        { name: "Product Vision Statement", status: "need" },
      ]}
    ]
  },
  {
    title: "Product Planning", icon: "📋", color: "#db2777",
    groups: [
      { name: "Roadmap", skills: [
        { name: "Creating a Roadmap", status: "learning" },
        { name: "Prioritizing Features", status: "learning" },
        { name: "RICE / MoSCoW", status: "learning" },
        { name: "Outcome-Based Roadmaps", status: "need" },
        { name: "Communicating the Roadmap", status: "need" },
      ]},
      { name: "需求", skills: [
        { name: "Writing PRDs", status: "learning" },
        { name: "User Stories", status: "have" },
        { name: "Job Stories", status: "need" },
        { name: "Acceptance Criteria", status: "have" },
        { name: "Backlog Management", status: "have" },
        { name: "User Story Mapping", status: "have" },
      ]}
    ]
  },
  {
    title: "Product Design", icon: "🎨", color: "#0891b2",
    groups: [
      { name: "UX/UI", skills: [
        { name: "Principles of UX Design", status: "have" },
        { name: "Wireframing & Prototyping", status: "have" },
        { name: "Design Thinking", status: "learning" },
        { name: "Service Design", status: "need" },
        { name: "Interaction Design", status: "have" },
        { name: "A/B Testing", status: "need" },
      ]}
    ]
  },
  {
    title: "Development & Launch", icon: "🚀", color: "#059669",
    groups: [
      { name: "Agile", skills: [
        { name: "Scrum", status: "have" },
        { name: "Kanban", status: "have" },
        { name: "Sprint Planning", status: "have" },
        { name: "Daily Standups", status: "have" },
        { name: "Retrospectives", status: "have" },
        { name: "MVP", status: "learning" },
      ]},
      { name: "上市", skills: [
        { name: "Go-to-Market Strategy", status: "need" },
        { name: "Release Strategies", status: "need" },
        { name: "Feature Toggles / Dark Launch", status: "have" },
        { name: "Growth Hacking", status: "wont",
          reason: "應該拆回基礎能力（funnel、實驗設計、單位經濟），而不是當一顆要不要學的大球。",
          reasonDetail: "在你的技能地圖裡，更應該拆回基礎能力。把 Growth Hacking 拆解，而不是當作一顆要不要學的大球，比較符合你要的精確度。實際上，Growth Hacking 這顆球底下是：對 funnel / AARRR / 北極星指標的理解（基本產品度量）、設計與解讀實驗（A/B test、分群、樣本量、指標選擇）、基礎行銷／文案（landing page、email / in-app message）、使用者洞察與動機理解、商業模式與單位經濟（LTV、CAC、付費結構）。這些東西各自都有比「學 growth hacking」更好的學習入口，而且你很多已經在碰。把注意力放在這些基礎能力的打磨，長期複利會比去上幾堂打著 Growth Hacking 標籤的課高很多。" },
      ]}
    ]
  },
  {
    title: "Product Metrics", icon: "📊", color: "#d97706",
    groups: [
      { name: "核心指標", skills: [
        { name: "DAU / MAU", status: "learning" },
        { name: "Retention Rate", status: "need" },
        { name: "Churn Rate", status: "need" },
        { name: "Conversion Rate", status: "need" },
        { name: "LTV / CAC", status: "need" },
        { name: "North Star Metric", status: "learning" },
      ]},
      { name: "數據分析", skills: [
        { name: "Funnel Analysis", status: "learning" },
        { name: "Cohort Analysis", status: "need" },
        { name: "GA4 / Mixpanel", status: "learning" },
        { name: "SQL for Product", status: "learning" },
        { name: "A/B Testing", status: "need" },
      ]}
    ]
  },
  {
    title: "Stakeholder Management", icon: "🤝", color: "#dc2626",
    groups: [
      { name: "溝通", skills: [
        { name: "Active Listening", status: "have" },
        { name: "Conflict Resolution", status: "have" },
        { name: "Alignment & Buy-In", status: "have" },
        { name: "Difficult Conversations", status: "learning" },
        { name: "Executive Communication", status: "need" },
      ]}
    ]
  },
  {
    title: "PM Tools", icon: "🛠", color: "#4f46e5",
    groups: [
      { name: "已熟悉", skills: [
        { name: "Jira / GitLab", status: "have" },
        { name: "Notion", status: "have" },
        { name: "Linear", status: "have" },
        { name: "Slack", status: "have" },
        { name: "Figma（讀稿）", status: "have" },
      ]},
      { name: "待學", skills: [
        { name: "ProductBoard / Aha", status: "need" },
        { name: "Amplitude / Heap", status: "need" },
        { name: "Miro / FigJam（workshop）", status: "need" },
      ]}
    ]
  },
  {
    title: "Advanced / AI PM", icon: "🤖", color: "#7c3aed",
    groups: [
      { name: "AI 相關", skills: [
        { name: "AI Feature Design", status: "have" },
        { name: "Prompt Engineering", status: "have" },
        { name: "Model Limitation 評估", status: "have" },
        { name: "ML in Product Mgmt", status: "learning" },
        { name: "AI 風險評估", status: "need" },
      ]},
      { name: "高階技能", skills: [
        { name: "Platform Thinking", status: "need" },
        { name: "Scaling Products", status: "need" },
        { name: "Influencing Without Authority", status: "need" },
        { name: "Emotional Intelligence", status: "learning" },
      ]}
    ]
  },
];
