// data/budget.js — SSOT（人工）
//
// 這是準備期唯一擋在拖延前面的東西。
//
// 為什麼需要它：2026-08-18 到 11/16 有 13 週，而 PIPELINE_DATA 在這段期間
// 會一直是 0——投遞日還沒到。這代表站上唯一的結果指標會有三個月不動，
// renderApplyGap() 那行紅字失效，「還沒到投遞時間」變成一個合法藉口。
// 半年準備期 + 一個很好玩的框架 = 完美的拖延溫床。
//
// 機制（RPG 天賦樹的稀缺性，不是它的美術）：
//   13 週 = 6.5 個雙週窗口 ≈ 6 點。每個窗口花一點。
//   花一點 = 交一份「能通過該節點 rubric」的產出物，不是「上完一堂課」。
//   evidence === null → 已承諾、進行中
//   evidence !== null → 完成（值是 docs/evidence/*.json 的檔名）
//   點數花完就鎖住。想換必須先退點，而退點要寫 reason。
//
// ⚠️ 這個檔案不接 UI。Phase 3 的天賦樹視圖（2027-01-31）才會讀它。
//    紀律來自這份資料 + 雙週儀式，不是來自那張圖——所以圖可以晚，這個檔不行。
//
// ⚠️ 計數的是產出物，不是投入的小時數。前者是 output，後者是 input 冒充結果，
//    而「整體完成度」已經因為同一個理由被刪掉一次了。同一個錯不要換名字再犯。

const BUDGET = {
  quarter: "2026 準備期（8/18 → 11/16，13 週）",
  points: 6,

  // nodeId 取自 data/competencies.js 的 COMPETENCY_IDS
  commitments: [
    {
      nodeId: "feature-specification",
      window: "W1",           // 8/18–8/31
      title: "PRD v1 本體（Linkju MVP，八維度完整版）",
      committedAt: "2026-08-18",
      evidence: null
    },
    {
      nodeId: "voice-of-the-customer",
      window: "W2",           // 9/1–9/14
      title: "PRD 收斂 v2 — 過 prd-review + prd-redteam，修掉所有 blocker",
      committedAt: "2026-08-18",
      evidence: null
    },
    {
      nodeId: "managing-up",
      window: "W3",           // 9/15–9/28
      title: "履歷 v2 — PM 語言 + 掛上 PRD 作品",
      committedAt: "2026-08-18",
      evidence: null
    },
    {
      nodeId: "strategic-impact",
      window: "W4",           // 9/29–10/12
      title: "職缺清單 12 → 25+，match / why / tier / pdmExposure 全部人工評",
      committedAt: "2026-08-18",
      evidence: null
    },
    {
      // ⚠️ nodeId 刻意留 {{TBD}}：這一點花在哪，由 mock 輪 1–3 的「最低分那一維」決定。
      //    現在指定就是在猜自己的弱點，而 mock rubric 存在的理由就是不要猜。
      nodeId: "{{TBD}}",
      window: "W5",           // 10/13–10/26
      title: "補第二份產出物 — 題目由 mock 輪 1–3 的最低分維度決定",
      committedAt: "2026-08-18",
      evidence: null
    },
    {
      nodeId: "business-outcome-ownership",
      window: "W6",           // 10/27–11/9
      title: "投遞包 — cover letter 模板 + 15–20 間客製化 + 清單補到 25–35",
      committedAt: "2026-08-18",
      evidence: null
    }
  ],

  // 退點必須寫 reason。沒有理由的退點就是把承諾偷偷刪掉。
  retired: []
};

// 剩餘點數 = points − commitments.length。這個數字要顯示在最上方，
// 而不是「已完成 N%」——後者會變成另一個 calcCompletion()。
const BUDGET_SPENT = BUDGET.commitments.length;
const BUDGET_DONE  = BUDGET.commitments.filter(c => c.evidence !== null).length;
