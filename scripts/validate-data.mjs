#!/usr/bin/env node
// 三層資料的完整性檢查。CI 每次 push 跑，init 之後也該跑一次。
//
//   node scripts/validate-data.mjs
//
// 檢查的是「層與層之間的參照有沒有斷」以及「有沒有繞過框架自己的規則」。
// 每一條都會 exit 1——沉默地帶著壞資料跑比沒有檢查更糟。

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (p) => path.join(ROOT, p);
const has = (p) => fs.existsSync(abs(p));

const fail = [], warn = [];
const check = (ok, msg) => { if (!ok) fail.push(msg); };

// ── 0. 每個資料檔都要是合法 JS ─────────────────────────────────────────
const FILES = ['framework/competencies.js', 'profile/assessment.js', 'profile/budget.js',
  'profile/history.js', 'job-search/pipeline.js', 'job-search/jobs.js'];
for (const f of FILES) {
  if (!has(f)) { warn.push(`${f} 不存在（沒跑過 init？）`); continue; }
  try { execFileSync(process.execPath, ['--check', abs(f)], { stdio: 'pipe' }); }
  catch (e) { fail.push(`${f} 過不了 node --check`); }
}
if (!has('framework/competencies.js')) {
  console.log('✗ 找不到 framework/competencies.js —— 框架本體不在，無法檢查。');
  process.exit(1);
}

// ── 載入 ───────────────────────────────────────────────────────────────
const g = {};
const src = FILES.filter(has).map(f => fs.readFileSync(abs(f), 'utf8')).join('\n');
new Function('g', src + `
  g.ITEMS = typeof ITEMS !== 'undefined' ? ITEMS : [];
  g.COMPETENCIES = typeof COMPETENCIES !== 'undefined' ? COMPETENCIES : [];
  g.CURRICULUM = typeof CURRICULUM !== 'undefined' ? CURRICULUM : [];
  g.ASSESSMENT = typeof ASSESSMENT !== 'undefined' ? ASSESSMENT : {};
  g.EVIDENCE = typeof EVIDENCE !== 'undefined' ? EVIDENCE : {};
  g.BUDGET = typeof BUDGET !== 'undefined' ? BUDGET : null;
  g.JOBS_DATA = typeof JOBS_DATA !== 'undefined' ? JOBS_DATA : null;
  g.JOBS_META = typeof JOBS_META !== 'undefined' ? JOBS_META : null;
`)(g);
const { ITEMS, COMPETENCIES, CURRICULUM, ASSESSMENT, EVIDENCE, BUDGET, JOBS_DATA, JOBS_META } = g;
const ids = new Set(ITEMS.map(i => i.id));
const l1s = new Set(COMPETENCIES.map(c => c.id));

// ── 1. id 唯一 ─────────────────────────────────────────────────────────
check(ids.size === ITEMS.length, `ITEMS 有重複 id（${ITEMS.length} 筆但只有 ${ids.size} 個唯一 id）`);

// ── 2. kind 合法 ───────────────────────────────────────────────────────
const KINDS = new Set(['skill', 'topic', 'ability', 'tool']);
ITEMS.filter(i => !KINDS.has(i.kind)).forEach(i => fail.push(`${i.id} 的 kind「${i.kind}」不合法`));

// ── 3. l1 必須存在（topic / tool 可以是 null）──────────────────────────
ITEMS.filter(i => i.l1 && !l1s.has(i.l1)).forEach(i => fail.push(`${i.id} 的 l1「${i.l1}」不在 COMPETENCIES 裡`));
ITEMS.filter(i => !i.l1 && (i.kind === 'skill' || i.kind === 'ability') && i.packaged !== false)
  .forEach(i => fail.push(`${i.id} 是 ${i.kind} 卻沒掛 L1 —— 掛不上去就該問它為什麼在框架裡`));

// ── 4. CURRICULUM 不得有斷鍵 ───────────────────────────────────────────
CURRICULUM.forEach(p => p.groups.forEach(gr => gr.items.forEach(it => {
  if (!ids.has(it.id)) fail.push(`CURRICULUM「${p.title} / ${gr.name}」指向不存在的 item：${it.id}`);
})));

// ── 5. 自評的參照完整性（雙向）─────────────────────────────────────────
Object.keys(ASSESSMENT).filter(k => !ids.has(k))
  .forEach(k => fail.push(`ASSESSMENT 有孤兒 key：${k}（ITEMS 裡沒有這一項）`));
const unassessed = ITEMS.filter(i => !ASSESSMENT[i.id]);
if (unassessed.length) warn.push(`${unassessed.length} 項還沒有自評紀錄（會當成 need）`);

// ── 6. wont 必須有 reason ──────────────────────────────────────────────
// 這條是框架的核心規則：刻意不學不刪除，但必須寫下為什麼。
// 沒有理由的 wont 和「還沒學」分不出來，而前者是決策、後者是待辦。
Object.entries(ASSESSMENT).filter(([, a]) => a.status === 'wont' && !a.reason)
  .forEach(([k]) => fail.push(`${k} 標了 wont 但沒有 reason —— 刻意不學必須寫理由`));

// ── 7. status 合法 ─────────────────────────────────────────────────────
const ST = new Set(['have', 'partial', 'learning', 'need', 'wont']);
Object.entries(ASSESSMENT).filter(([, a]) => !ST.has(a.status))
  .forEach(([k, a]) => fail.push(`${k} 的 status「${a.status}」不合法`));

// ── 8. 點數不得超支 ────────────────────────────────────────────────────
if (BUDGET) {
  check(BUDGET.commitments.length <= BUDGET.points,
    `點數超支：花了 ${BUDGET.commitments.length} 點但預算只有 ${BUDGET.points} 點`);
  // nodeId 可以指 L1 competency 或某個具體 item ——「花一點」的粒度兩種都合理：
  // 承諾一份證明 voice-of-the-customer 的產出物，或承諾補某一項具體技能。
  // 兩邊都對不上才是錯。
  BUDGET.commitments
    .filter(c => c.nodeId && c.nodeId !== '{{TBD}}' && !ids.has(c.nodeId) && !l1s.has(c.nodeId))
    .forEach(c => fail.push(`BUDGET 的 nodeId「${c.nodeId}」既不是 L1 competency 也不是 item id`));
  (BUDGET.retired || []).filter(r => !r.reason)
    .forEach(r => fail.push(`BUDGET.retired 的 ${r.nodeId} 沒寫 reason —— 退點必須寫理由`));
}

// ── 9. evidence 指到的檔案要真的存在 ───────────────────────────────────
// 不存在的 evidence 比沒有 evidence 更糟：它讓一個沒有佐證的分數看起來有佐證。
Object.entries(EVIDENCE || {}).forEach(([k, list]) => (list || []).forEach(f => {
  if (!has(f)) fail.push(`${k} 的 evidence「${f}」檔案不存在`);
}));

// ── 10. 求職層：機器欄位的自我一致 ─────────────────────────────────────
if (JOBS_DATA && JOBS_META) {
  const H = new Set(['open', 'closed', 'unknown']);
  JOBS_DATA.filter(j => !H.has(j.health)).forEach(j => fail.push(`${j.company} 的 health「${j.health}」不合法`));
  JOBS_DATA.filter(j => j.health === 'closed' && !j.closedAt)
    .forEach(j => fail.push(`${j.company} 已下架卻沒有 closedAt —— 那是移除的計時器，缺了就永遠不會退場`));
  const ranks = JOBS_DATA.map(j => j.rank);
  check(new Set(ranks).size === ranks.length, 'JOBS_DATA 的 rank 有重複');
}

// ── 報告 ───────────────────────────────────────────────────────────────
const skills = ITEMS.filter(i => i.kind === 'skill');
const noEval = skills.filter(i => !i.eval);
if (noEval.length) warn.push(`${noEval.length} / ${skills.length} 項 skill 沒有 eval —— 打包給別人之前要補完`);
const emptyL1 = COMPETENCIES.filter(c => !ITEMS.some(i => i.l1 === c.id));
if (emptyL1.length) warn.push(`${emptyL1.length} 個 L1 一項技能都沒掛：${emptyL1.map(c => c.id).join('、')}`);

console.log('framework  %d L1 · %d items（%s）', COMPETENCIES.length, ITEMS.length,
  Object.entries(ITEMS.reduce((a, i) => (a[i.kind] = (a[i.kind] || 0) + 1, a), {}))
    .map(([k, v]) => `${k} ${v}`).join(' / '));
console.log('profile    %d 筆自評 · 預算 %s', Object.keys(ASSESSMENT).length,
  BUDGET ? `${BUDGET.commitments.length}/${BUDGET.points} 點` : '(無)');
console.log('job-search %s', JOBS_DATA ? `${JOBS_DATA.length} 個職缺 · checkedAt ${JOBS_META.checkedAt}` : '(無)');

if (warn.length) { console.log('\n⚠️  %d 項提醒（不擋）：', warn.length); warn.forEach(w => console.log('   ', w)); }
if (fail.length) { console.log('\n✗ %d 項失敗：', fail.length); fail.forEach(f => console.log('   ', f)); process.exit(1); }
console.log('\n✓ 十條全綠。');
