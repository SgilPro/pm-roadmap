// 求職結果指標範本。scripts/init.mjs 會複製成 job-search/pipeline.js。
//
// 這是**唯一的結果指標**。能力進度全部是 input metric——
// 把技能格子從 need 改成 have 不會讓下面這幾個數字動。
//
// ⚠️ 載入順序必須在 profile/budget.js 之後：runwayState() 讀 BUDGET。
// ⚠️ 傳統 <script src>，不可改成 type="module"。

const PIPELINE_DATA = {
  applied: 0,
  screening: 0,
  interview: 0,
  final: 0,
  offer: 0,
  updatedAt: "{{TBD}}"        // 手動維護。改數字的同時改這個日期
};

// 第一波投遞日。準備期的所有倒數都錨在這一天。
// ⚠️ 改這個常數之前先算容量，不要先改日期——先改日期就是下一次滑掉的開始。
const APPLY_DATE = "{{TBD}}";  // YYYY-MM-DD

function daysUntilApply() {
  const t = new Date(APPLY_DATE + 'T00:00:00');
  return Math.ceil((t.getTime() - Date.now()) / 86400000);
}

const PIPELINE_STAGES = [
  { key: 'applied',   label: '已投遞' },
  { key: 'screening', label: '履歷篩選' },
  { key: 'interview', label: '面試邀約' },
  { key: 'final',     label: '進入複試' },
  { key: 'offer',     label: 'Offer' }
];

// 投遞窗口的狀態機。兩個頁面共用同一套到期邏輯，不要在頁面裡各寫一份日期。
function runwayState() {
  const applied = PIPELINE_DATA.applied;
  const left = daysUntilApply();
  return {
    phase: applied > 0 ? 'launched' : (left < 0 ? 'overdue' : 'counting'),
    applied,
    left,
    done: BUDGET.commitments.filter(c => c.evidence !== null).length,
    total: BUDGET.points,
    current: BUDGET.commitments.find(c => c.evidence === null) || null
  };
}
