// 能力骨架（competency spine）—— L1 層，Phase 1 stub。
//
// 這是 SSOT：「有哪些能力」是判斷，不是任何程式能推導出來的東西。
//
// ⚠️ Phase 1 的範圍限制，刻意不做的事：
//   - 沒有 L2 skills（Phase 2 再補 40–60 項）
//   - 沒有 prereq 邊（天賦樹要用，Phase 3）
//   - 沒有 role profile 的 importance（那在 data/role-profiles.js，Phase 2）
//   - 沒有我的 current 分數（那在 data/assessment.js，Phase 2）
//   - **index.html 目前不載入這個檔案**，也還沒有任何 render function 讀它
//
// 那它現在為什麼要存在？
//   .claude/skills/ 底下的 rubric 會在輸出裡填 `competencies: [...]`。
//   沒有這份 id 清單，那個欄位就是自由文字，Phase 2 建 spine 時得回頭改每一支 rubric。
//   先把詞彙表釘死，成本 40 行，省掉一次回頭。
//
// 未來從 roadmap.html 載入時，必須用傳統 <script src>，不可用 type="module"——
// ES module 在 file:// 下會被 CORS 擋掉，而這個站的驗證方式就是直接 open index.html。
//
// ── 骨架來源 ──────────────────────────────────────────────────────────
// 主幹：Ravi Mehta / Reforge Product Competency Model 的 12 項（4 areas × 3）。
//       選它的理由是它最接近 MECE，且有 APM→VP 的 level matrix。
// 補充：ISPMA SPM Framework 的 4 項軟體產品特有能力。這 4 項在 Ravi Mehta 的
//       模型裡沒有對應，而它們正是現有 SKILLS_DATA 完全空白的地方——要對標有料的
//       軟體產品公司，Pricing / Delivery Model / Financial Mgmt / Ecosystem 躲不掉。
//
// `sources` 只列**實際查證過該體系有涵蓋這項**的來源，不臆測。
// validate-data.mjs（Phase 2）會強制每項 sources 不得為空：
// 沒有外部依據的 competency 就是自己發明的。

const COMPETENCY_AREAS = [
  { id: "product-execution",  name: "Product Execution",  nameZh: "產品執行", definition: "把卓越的產品做出來的能力。" },
  { id: "customer-insight",   name: "Customer Insight",   nameZh: "顧客洞察", definition: "理解並回應顧客需求的能力。" },
  { id: "product-strategy",   name: "Product Strategy",   nameZh: "產品策略", definition: "透過產品驅動商業成果的能力。" },
  { id: "influencing-people", name: "Influencing People", nameZh: "影響他人", definition: "讓人們聚集在團隊工作周圍的能力。" },
];

// 來源代號 → 完整出處。改版時（例如 SFIA 9 → 10）只需要改這裡。
const COMPETENCY_SOURCES = {
  "ravi-mehta-12":     { label: "Ravi Mehta / Reforge Product Competency Model（12 competencies）", url: "https://www.ravi-mehta.com/product-manager-skills/", checkedAt: "2026-08-01" },
  "ispma-spm":         { label: "ISPMA SPM Framework（SPM Foundation Syllabus V.2.1）",             url: "https://ispma.org/bok/",                              checkedAt: "2026-08-01" },
  "svpg-assessment":   { label: "SVPG Coaching Tools: The Assessment（3 pillars / 13 criteria）",   url: "https://www.svpg.com/coaching-tools-the-assessment/",  checkedAt: "2026-08-01" },
  "product-compass-8": { label: "Product Compass PM Competence Map（8 categories）",                url: "https://www.productcompass.pm/p/your-pm-competence-map-skills-assessment", checkedAt: "2026-08-01" },
  "sfia-9-prod":       { label: "SFIA 9 — Product management (PROD)，定義於 level 2–6",             url: "https://sfia-online.org/en/sfia-9/skills/product-management", checkedAt: "2026-08-01", note: "SFIA 10 在 consultation，改版時這裡要更新" },
  "pmwheel":           { label: "Petra Wille PMwheel（8 dimensions）",                              url: "https://www.strongproductpeople.com/pmwheel",         checkedAt: "2026-08-01" },
};

const COMPETENCIES = [
  // ── Product Execution ─────────────────────────────────────────────
  {
    id: "feature-specification", area: "product-execution",
    name: "Feature Specification", nameZh: "需求規格",
    definition: "蒐集需求、定義功能、設定目標，並寫成清楚可執行的格式。",
    sources: ["ravi-mehta-12", "ispma-spm", "product-compass-8"],
  },
  {
    id: "product-delivery", area: "product-execution",
    name: "Product Delivery", nameZh: "產品交付",
    definition: "與工程、設計等直屬團隊緊密合作，快速且迭代地把功能交出去。",
    sources: ["ravi-mehta-12", "ispma-spm", "product-compass-8", "pmwheel"],
  },
  {
    id: "quality-assurance", area: "product-execution",
    name: "Quality Assurance", nameZh: "品質把關",
    definition: "找出、排序並解決技術、功能與商業面的品質問題。",
    sources: ["ravi-mehta-12", "sfia-9-prod"],
  },

  // ── Customer Insight ──────────────────────────────────────────────
  {
    id: "fluency-with-data", area: "customer-insight",
    name: "Fluency with Data", nameZh: "數據流暢度",
    definition: "用數據產生可行動的洞察，並用那些洞察達成目標。",
    sources: ["ravi-mehta-12", "svpg-assessment", "product-compass-8"],
  },
  {
    id: "voice-of-the-customer", area: "customer-insight",
    name: "Voice of the Customer", nameZh: "顧客之聲",
    definition: "運用各種形式的使用者回饋，理解使用者實際如何使用產品。",
    sources: ["ravi-mehta-12", "svpg-assessment", "product-compass-8", "ispma-spm", "pmwheel"],
  },
  {
    id: "ux-design", area: "customer-insight",
    name: "User Experience Design", nameZh: "使用者體驗設計",
    definition: "定義需求並產出好用的 UX 設計。",
    sources: ["ravi-mehta-12"],
  },

  // ── Product Strategy ──────────────────────────────────────────────
  {
    id: "business-outcome-ownership", area: "product-strategy",
    name: "Business Outcome Ownership", nameZh: "商業成果當責",
    definition: "把產品功能與目標連到商業成果，並對那個成果負責。",
    sources: ["ravi-mehta-12", "product-compass-8"],
  },
  {
    id: "vision-roadmapping", area: "product-strategy",
    name: "Product Vision & Roadmapping", nameZh: "產品願景與 Roadmap",
    definition: "為自己負責的範圍定義願景，並讓它連回公司策略。",
    sources: ["ravi-mehta-12", "ispma-spm", "sfia-9-prod", "pmwheel"],
  },
  {
    id: "strategic-impact", area: "product-strategy",
    name: "Strategic Impact", nameZh: "策略影響力",
    definition: "理解並實質貢獻於公司層級的商業策略。",
    sources: ["ravi-mehta-12", "ispma-spm", "sfia-9-prod"],
  },

  // ISPMA 補充：軟體產品特有，Ravi Mehta 的 12 項沒有對應。
  // 這 4 項是現有 SKILLS_DATA 的完全空白區。
  {
    id: "pricing-packaging", area: "product-strategy",
    name: "Pricing & Packaging", nameZh: "定價與方案設計",
    definition: "設計定價模型與方案分層，讓收費結構同時符合顧客價值與商業目標。",
    sources: ["ispma-spm", "product-compass-8"],
  },
  {
    id: "delivery-model", area: "product-strategy",
    name: "Delivery Model & Service Strategy", nameZh: "交付模式與服務策略",
    definition: "決定產品怎麼交付與怎麼被服務（雲端／地端、自助／導入、SLA 與支援層級）。",
    sources: ["ispma-spm"],
  },
  {
    id: "financial-management", area: "product-strategy",
    name: "Financial Management", nameZh: "產品財務管理",
    definition: "看懂並管理產品的損益：成本結構、單位經濟、投資回收。",
    sources: ["ispma-spm"],
  },
  {
    id: "ecosystem-management", area: "product-strategy",
    name: "Ecosystem Management", nameZh: "生態系管理",
    definition: "經營產品周邊的夥伴、整合與平台關係。",
    sources: ["ispma-spm"],
  },

  // ── Influencing People ────────────────────────────────────────────
  {
    id: "stakeholder-management", area: "influencing-people",
    name: "Stakeholder Management", nameZh: "利害關係人管理",
    definition: "主動辨識受自己負責範圍影響的利害關係人，並建立共識。",
    sources: ["ravi-mehta-12", "svpg-assessment", "product-compass-8"],
  },
  {
    id: "team-leadership", area: "influencing-people",
    name: "Team Leadership", nameZh: "團隊領導",
    definition: "管理與輔導直屬部屬，讓他們能自己把事情做成。",
    sources: ["ravi-mehta-12", "svpg-assessment", "pmwheel"],
  },
  {
    id: "managing-up", area: "influencing-people",
    name: "Managing Up", nameZh: "向上管理",
    definition: "借助資深主管與高層的力量來達成目標。",
    sources: ["ravi-mehta-12"],
  },
];

// 給 rubric 用的合法值域檢查。Phase 2 的 validate-data.mjs 會用同一份。
const COMPETENCY_IDS = COMPETENCIES.map(c => c.id);
