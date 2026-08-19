// 點數預算範本。scripts/init.mjs 會複製成 profile/budget.js。
//
// 一點 = 一份能通過該節點 rubric 的產出物，**不是**「讀完一本書」或「上完一堂課」。
// 點數花完就鎖住；想換必須先退點，而退點要寫理由。
//
// 為什麼要有預算：一棵最後可以點滿的天賦樹，只是換了皮的 checklist。
// 稀缺才會產生取捨，取捨才是這個框架要練的東西。
//
// ⚠️ 傳統 <script src>，不可改成 type="module"。

const BUDGET = {
  quarter: "{{TBD}} —— 這一季的起訖，例如「2027-Q1（1/1 → 3/31，13 週）」",
  points: 6,                    // 13 週 ≈ 6.5 個雙週窗口。實跑一季後再校正
  commitments: [
    // { nodeId: "prd-writing", window: "W1", title: "PRD v1 本體",
    //   committedAt: "YYYY-MM-DD", evidence: null }
    //
    // nodeId  對應 framework/competencies.js 的 ITEMS[].id
    // evidence  null = 已承諾、還沒交；填檔名 = 交了且過了 rubric
  ],
  retired: [
    // { nodeId, retiredAt, reason } —— 退點必須寫 reason
  ]
};

const BUDGET_SPENT = BUDGET.commitments.length;
const BUDGET_DONE  = BUDGET.commitments.filter(c => c.evidence !== null).length;
