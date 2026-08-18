// 求職結果指標與投遞窗口。index.html（求職）與 roadmap.html（框架）都載這一份——
// 框架頁只用來畫頂端那條 strip，讓「能力進度」永遠和「投遞數字」擺在同一個畫面上。
//
// ⚠️ 載入順序必須在 data/budget.js 之後：runwayState() 讀 BUDGET。
// ⚠️ 傳統 <script src>，不可改成 type="module"（ES module 在 file:// 下被 CORS 擋掉）。

// ===== NORTH STAR =====
// The only outcome metric on this site. Update by hand as the search progresses.
const PIPELINE_DATA = {
  applied: 0,
  screening: 0,
  interview: 0,
  final: 0,
  offer: 0,
  updatedAt: "2026-07-27"
};

// 第一波投遞日。準備期的所有倒數都錨在這一天。
// ⚠️ 這是第三個投遞日（8/17 → 9/13 → 11/16），前兩個都因為計畫超編而滑掉。
//    改這個常數之前先算容量，不要先改日期。
const APPLY_DATE = '2026-11-16';

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

// 投遞窗口的狀態機。兩頁共用同一套到期邏輯：求職頁排成一整塊、框架頁排成一行，
// 但「還剩幾天／交了幾份／過期了沒」只算在這裡一個地方。
// 到期日就是 APPLY_DATE——過了那天而 applied 仍是 0，phase 會變成 'overdue'，
// 不是靜默消失。
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
