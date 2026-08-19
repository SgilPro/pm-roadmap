#!/usr/bin/env node
// 從 .migrate-out.json 產生三層檔案。跑在 migrate-spine.mjs 之後。
//
//   framework/   上游：能力骨架 + 技能定義 + 學習路徑結構 + 空白範本
//   profile/     我的框架套用：自評狀態、預算、快照
//   job-search/  我的求職追蹤：pipeline、職缺清單
//
// 為什麼要分三層：框架本身要能打包給別人 clone，而「我的自評」與「我的求職」
// 一個字都不該跟著出去。分層的判準是**擁有權**，不是主題。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const R = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const W = (f, s) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, f), s);
  console.log('  %s %5d 行', f.padEnd(40), s.split('\n').length - 1);
};

const { items, assessment, curriculum } = JSON.parse(R('.migrate-out.json'));

// 從現有 data/competencies.js 原封取出 L1 骨架（areas / sources / 16 項定義）
const old = R('data/competencies.js');
const spineHead = old.slice(old.indexOf('const COMPETENCY_AREAS'), old.indexOf('const COMPETENCY_IDS'));

const j = (v) => JSON.stringify(v);
const q = (v) => (v === null || v === undefined ? 'null' : j(v));

// ══════════════════════════════════════════════════════════════════════
// framework/competencies.js
// ══════════════════════════════════════════════════════════════════════
const itemLines = items.map(i =>
  `  { id: ${j(i.id)}, kind: ${j(i.kind)}, l1: ${q(i.l1)}, cat: ${q(i.cat)}, priority: ${q(i.priority)},` +
  (i.packaged ? '' : ' packaged: false,') +
  (i.aliases.length ? ` aliases: ${j(i.aliases)},` : '') +
  `\n    name: ${j(i.name)},` +
  (i.eval ? `\n    eval: ${j(i.eval)} },` : `\n    eval: null },`)
).join('\n');

const curriculumLines = curriculum.map(p =>
  `  { phase: ${p.phase}, title: ${j(p.title)}, icon: ${j(p.icon)}, color: ${j(p.color)}, groups: [\n` +
  p.groups.map(g => `    { name: ${j(g.name)}, items: [\n` +
    g.items.map(it => `      { id: ${j(it.id)}, name: ${j(it.name)} },`).join('\n') + `\n    ]},`).join('\n') +
  `\n  ]},`
).join('\n');

W('framework/competencies.js', `// ════════════════════════════════════════════════════════════════════════
// 能力骨架（competency spine）—— 這是框架本體，可以打包給別人 clone。
//
// **這個檔案裡沒有任何一個人的自評。** 誰學到哪裡在 profile/assessment.js，
// 兩者靠 id 對應。分層的判準是擁有權：框架是共用的，自評是你的。
//
// ⚠️ 2026-08-19 由 ROADMAP_DATA（92）+ SKILLS_DATA（39）合併而來，去重後 ${items.length} 個概念。
//    合併前那兩份**各自帶一份 status，不互相同步**，CLAUDE.md 標為「這個 repo 最容易
//    踩的地方」。現在狀態只存在 assessment 一個地方，兩個視圖都從它衍生——
//    改一次，兩邊一起變。這是這次合併真正買到的東西。
//
// ⚠️ 傳統 <script src>，不可改成 type="module"（ES module 在 file:// 下被 CORS 擋掉）。
// ════════════════════════════════════════════════════════════════════════

${spineHead.trimEnd()}

const COMPETENCY_IDS = COMPETENCIES.map(c => c.id);

// ── ITEMS：可評估的項目 ────────────────────────────────────────────────
//
// kind 的判準是**能不能指出一件具體的產出物來證明它**（也就是 eval 欄位）：
//
//   skill    能用產出物證明的能力。給分，要有 eval
//   topic    概念知識。讀過就是讀過，沒有產出物可交，**不給分**
//   ability  要靠實作 + 反思養成的（溝通、衝突處理、影響力）。**刻意不給 0–10 分**，
//            證據型態是反思紀錄。來源見 framework.md §二 ③（SSIR 的 skills / abilities 二分）
//   tool     軟體熟練度。會用就是會用，不是能力
//
// 把 topic 與 tool 分出來的實際效果：可評分的集合從 131 縮到 ${items.filter(i => i.kind === 'skill').length} 項 skill。
// 「讀過 What is Product Management?」本來就不該和「做得出一份過 rubric 的 PRD」
// 佔同一格分數。
//
// packaged: false = 不隨框架打包（求職材料，不是產品能力）。站上照樣顯示。
// l1 = 掛在哪個 L1 competency。topic / tool 可以是 null。
// cat = Product Compass 分類，技能圖譜的雷達軸用它。只有原本在 SKILLS_DATA 的項目有。
//
// ⚠️ 目前 ${items.filter(i => i.kind === 'skill' && !i.eval).length} 項 skill 的 eval 還是 null。**要打包給別人之前得補完**——
//    eval 是這個框架真正的價值，空白的 eval 等於送一張空表格。
const ITEMS = [
${itemLines}
];

// ── CURRICULUM：學習路徑結構（沿用 roadmap.sh 的 12 個 phase）───────────
//
// 只存「哪個 phase 的哪個 group 教哪些 item」，**不存狀態**。
// 同一個 itemId 可以出現在兩個 phase——North Star Metric 在 Vision & Goals 與
// Product Metrics 都出現，那是課程結構的事實，不是重複資料。
const CURRICULUM = [
${curriculumLines}
];

// ── 衍生視圖（render 時算，不存）──────────────────────────────────────
// 兩個函式都需要 ASSESSMENT（profile/assessment.js）。載入順序：competencies 先。

// 取代原本的 SKILLS_DATA：扁平技能表，餵技能圖譜的三個 sub-view。
// 只回傳有 cat 的項目，所以輸出與合併前的 39 項逐項相同。
function skillsView(assessment) {
  return ITEMS.filter(i => i.cat).map(i => ({
    id: i.id, cat: i.cat, skill: i.name, priority: i.priority, eval: i.eval,
    kind: i.kind, l1: i.l1,
    ...(assessment[i.id] || { status: 'need', reason: null, note: null, social: null, evidence: [] }),
  }));
}

// 取代原本的 ROADMAP_DATA：12 個 phase 的巢狀結構，餵能力地圖。
function roadmapView(assessment) {
  const byId = new Map(ITEMS.map(i => [i.id, i]));
  return CURRICULUM.map(p => ({
    title: p.title, icon: p.icon, color: p.color,
    groups: p.groups.map(g => ({
      name: g.name,
      // name 用 placement 自己的（roadmap.sh 原文）；status 從 assessment 翻回
      // 能力地圖的字彙：canonical 的 partial 在這裡叫 learning。
      skills: g.items.map(p => {
        const a = assessment[p.id] || {};
        const st = a.status === 'partial' ? 'learning' : (a.status || 'need');
        return { name: p.name, status: st, reason: a.reason || undefined };
      }),
    })),
  }));
}
`);

// ══════════════════════════════════════════════════════════════════════
// profile/assessment.js —— 我的自評
// ══════════════════════════════════════════════════════════════════════
const assessLines = items.map(i => {
  const a = assessment[i.id];
  const parts = [`status: ${j(a.status)}`];
  if (a.reason) parts.push(`reason: ${j(a.reason)}`);
  if (a.social) parts.push(`social: ${j(a.social)}`);
  if (a.note !== null && a.note !== undefined) parts.push(`note: ${j(a.note)}`);  // "" 也要留
  return `  ${j(i.id)}: { ${parts.join(', ')} },`;
}).join('\n');

W('profile/assessment.js', `// ════════════════════════════════════════════════════════════════════════
// 我的自評 —— 這一層是「我」，不是框架。別人 clone 框架時不會拿到這個檔。
//
// key 對應 framework/competencies.js 的 ITEMS[].id。
//
//   status    have / partial / learning / need / wont
//   reason    wont 必填：為什麼刻意不學。這份 scope cut 清單本身就是給面試官看的東西
//   social    社創／LFT 背景的可轉移程度（high / mid / low）
//   note      我自己的備註
//   evidence  過了 rubric 的產出物路徑。空陣列 = 還沒有佐證，**不要因為覺得會了就填**
//
// ⚠️ 2026-08-19 從 ROADMAP_DATA + SKILLS_DATA 搬出來，每一項狀態都是**原封搬移**，
//    遷移腳本不發明任何判斷。原本同一個概念在兩份資料裡各有一份 status；
//    現在只有這裡一份，兩個視圖都讀它。
//
// ⚠️ 傳統 <script src>，不可改成 type="module"。
// ════════════════════════════════════════════════════════════════════════

const ASSESSMENT = {
${assessLines}
};

// evidence 是另一個 map，刻意分開：狀態是我的判斷（常改），
// 佐證是 rubric 跑出來的事實（只增不改）。混在一起會讓人手改到後者。
const EVIDENCE = {
  // "prd-writing": ["docs/evidence/prd-review-20260914.json"],
};
`);

// ══════════════════════════════════════════════════════════════════════
// framework/templates/ —— init 用的空白範本
// ══════════════════════════════════════════════════════════════════════
const blankLines = items.filter(i => i.packaged)
  .map(i => `  ${j(i.id)}: { status: "need" },`).join('\n');

W('framework/templates/assessment.js', `// 空白自評範本。scripts/init.mjs 會把它複製成 profile/assessment.js。
//
// 全部 need、沒有 evidence、沒有 wont。**這是刻意的**：
// 框架提供的是骨架與「要拿什麼當佐證」（eval），不是別人的自評分數。
// 你的第一個動作應該是把明顯已具備的改成 have，而不是相信一份預設值。
//
// ⚠️ 傳統 <script src>，不可改成 type="module"。

const ASSESSMENT = {
${blankLines}
};

const EVIDENCE = {};
`);

console.log('\n打包範圍：%d / %d 項（packaged: false 的 %d 項不進範本）',
  items.filter(i => i.packaged).length, items.length, items.filter(i => !i.packaged).length);
