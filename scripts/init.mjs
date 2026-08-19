#!/usr/bin/env node
// 初始化一份屬於你自己的 PM 能力框架。
//
//   node scripts/init.mjs             建立 profile/ 與 job-search/
//   node scripts/init.mjs --no-job-search   只要能力框架，不要求職追蹤
//   node scripts/init.mjs --force     覆蓋既有檔案（會先問）
//
// 做的事只有一件：把 framework/templates/ 的空白範本複製到 profile/ 與 job-search/。
// 沒有 server、沒有登入、沒有資料庫——你的資料就是你 repo 裡的幾個 .js 檔，
// 版控在你自己手上。
//
// ⚠️ 這支腳本**不會覆蓋已存在的檔案**，除非你加 --force。
//    profile/assessment.js 是你花好幾個小時想出來的判斷，弄掉了沒有備份。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FORCE = process.argv.includes('--force');
const NO_JOBS = process.argv.includes('--no-job-search');

const PLAN = [
  { from: 'framework/templates/assessment.js', to: 'profile/assessment.js',   layer: '框架套用' },
  { from: 'framework/templates/budget.js',     to: 'profile/budget.js',       layer: '框架套用' },
  { from: 'framework/templates/history.js',    to: 'profile/history.js',      layer: '框架套用', optional: true },
  { from: 'framework/templates/pipeline.js',   to: 'job-search/pipeline.js',  layer: '求職追蹤', jobSearch: true },
  { from: 'framework/templates/jobs.js',       to: 'job-search/jobs.js',      layer: '求職追蹤', jobSearch: true },
];

const abs = (p) => path.join(ROOT, p);
let created = 0, skipped = 0, missing = 0;

console.log('PM 能力框架 —— 初始化\n');

for (const step of PLAN) {
  if (step.jobSearch && NO_JOBS) continue;
  if (!fs.existsSync(abs(step.from))) {
    if (!step.optional) { console.log('  ✗ 範本不存在：%s', step.from); missing++; }
    continue;
  }
  if (fs.existsSync(abs(step.to)) && !FORCE) {
    console.log('  – 已存在，跳過   %s（要覆蓋請加 --force）', step.to.padEnd(24));
    skipped++;
    continue;
  }
  fs.mkdirSync(path.dirname(abs(step.to)), { recursive: true });
  fs.copyFileSync(abs(step.from), abs(step.to));
  console.log('  ✓ 建立 [%s]  %s', step.layer, step.to);
  created++;
}

if (missing) { console.log('\n✗ 有 %d 份必要範本不存在，framework/ 可能不完整。', missing); process.exit(1); }

// ── 檢查 spine 有沒有到位 ─────────────────────────────────────────────
const spinePath = abs('framework/competencies.js');
if (!fs.existsSync(spinePath)) {
  console.log('\n✗ 找不到 framework/competencies.js —— 這是框架本體，沒有它初始化沒有意義。');
  process.exit(1);
}
const sandbox = {};
new Function('g', fs.readFileSync(spinePath, 'utf8') +
  'g.ITEMS = ITEMS; g.COMPETENCIES = COMPETENCIES; g.CURRICULUM = CURRICULUM;')(sandbox);
const { ITEMS, COMPETENCIES } = sandbox;
const kinds = ITEMS.reduce((a, i) => (a[i.kind] = (a[i.kind] || 0) + 1, a), {});
const skills = ITEMS.filter(i => i.kind === 'skill');
const noEval = skills.filter(i => !i.eval);

console.log('\n框架內容：%d 個 L1 competency · %d 個項目（%s）',
  COMPETENCIES.length, ITEMS.length,
  Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(' / '));

if (noEval.length) {
  console.log('\n⚠️  %d / %d 項 skill 還沒有 eval（「要拿什麼當佐證」）。',
    noEval.length, skills.length);
  console.log('    eval 是這個框架真正的價值。空白的 eval 等於一張空表格——');
  console.log('    自評時如果講不出佐證方式，那一格的分數就沒有意義。');
}

console.log(`
接下來：

  1. 開 profile/assessment.js，把你**明顯已具備**的改成 have。
     不確定的留 need。這一步不要花超過 30 分鐘——
     精確度會在你交出第一份產出物時自己長出來，現在糾結是浪費。

  2. 不想學的標 wont 並**寫下理由**。這份 scope cut 清單本身就是給面試官看的東西：
     「我選擇不學 X，因為 Y」比「我什麼都會一點」強得多。

  3. 開 profile/budget.js，把這一季的 6 點花掉。一點 = 一份能過 rubric 的產出物。
     ⚠️ 不是「讀完一本書」。點數花完就鎖住。

  4. open index.html 與 open roadmap.html（直接開檔，不需要起 server）。

驗證：node scripts/validate-data.mjs
`);

console.log('建立 %d 份 · 跳過 %d 份', created, skipped);
if (!created && skipped) console.log('（全都已存在——你已經初始化過了。）');
