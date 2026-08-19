#!/usr/bin/env node
// 一次性遷移：把 ROADMAP_DATA（92）+ SKILLS_DATA（39）收成一份 spine，
// 並把「定義」與「我的狀態」拆成兩層。
//
//   framework/competencies.js   ← 定義（可打包給別人）
//   profile/assessment.js       ← 我的狀態（status / reason / social / note / evidence）
//
// 跑完就可以刪，留著是為了讓分類決策可被審核與重跑。
//   node scripts/migrate-spine.mjs --dry-run   只印報告
//   node scripts/migrate-spine.mjs             寫檔
//
// ⚠️ 這支腳本**不發明任何 status**。每一項的狀態都是從原本兩份資料原封搬過來的；
//    同一個概念在兩邊都出現時，只有狀態一致才合併，不一致就中止並要求人工裁決。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');

// ── 載入現有資料 ───────────────────────────────────────────────────────
const load = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const sandbox = {};
new Function('g', load('data/roadmap.js') + load('data/skills.js') +
  'g.RM = ROADMAP_DATA; g.SK = SKILLS_DATA;')(sandbox);
const { RM, SK } = sandbox;

// ══════════════════════════════════════════════════════════════════════
// 分類表 ①：四種 kind
//
// 判準是**能不能指出一件具體的產出物來證明它**——這正是既有 `eval` 欄位的定義。
//
//   skill    能用產出物證明的能力。給 0–10 分，要有 eval
//   topic    概念知識。讀過就是讀過，沒有產出物可交，**不給分**
//   ability  要靠實作 + 教練 + 反思養成的（SSIR 的第二類，見 framework.md §二 ③）。
//            **刻意不給 0–10 分**，證據型態是反思紀錄
//   tool     軟體熟練度。會用就是會用，不是能力
//
// 只列 ROADMAP_DATA 需要改判的；SKILLS_DATA 的 39 項全部是 skill（它們本來就
// 是照「能不能舉證」挑出來的），例外在 SK_KIND_OVERRIDE。
// ══════════════════════════════════════════════════════════════════════
const TOPIC = new Set([
  // Phase 1 全部是課程主題，不是能力
  'What is Product Management?', 'Product vs Project Management',
  'Roles & Responsibilities', 'Key Skills Overview',
  // 只需概念認識的框架／方法（多數已標 wont）
  'SCAMPER', 'Blue Ocean Strategy', 'TRIZ', 'Five Forces Analysis', 'SWOT / PESTLE',
  'Ethnographic Research',
  // 觀念、趨勢、原則
  'Emerging Market Trends', 'Competitive Advantage', 'Strategic Thinking',
  'Goal Types & Baselines', 'Outcome-Based Roadmaps', 'Principles of UX Design',
  'Release Strategies', 'Feature Toggles / Dark Launch', 'Growth Hacking',
  'ML in Product Mgmt', 'Platform Thinking', 'Scaling Products',
  'Identifying Market Needs',
  // Phase 9 前半是「指標的定義」，不是「算得出指標的能力」。
  // 能力在 Funnel / Cohort / GA4 / SQL 那幾項。
  'DAU / MAU', 'Retention Rate', 'Churn Rate', 'Conversion Rate', 'LTV / CAC',
]);

const ABILITY = new Set([
  // Phase 10 整個 phase：溝通與影響力。framework.md §二 ③ 明寫這類不打 0–10 分
  'Active Listening', 'Conflict Resolution', 'Alignment & Buy-In',
  'Difficult Conversations', 'Executive Communication',
  'Influencing Without Authority', 'Emotional Intelligence',
]);

const TOOL = new Set([
  'Jira / GitLab', 'Notion', 'Linear', 'Slack', 'Figma（讀稿）',
  'ProductBoard / Aha', 'Amplitude / Heap', 'Miro / FigJam（workshop）',
]);

// SKILLS_DATA 的「人員領導」四項全部是 ability，不是 skill——
// 它們要靠實作 + 反思，不是交一份產出物就證明得了。與 phase 10 的判定一致。
const SK_KIND_OVERRIDE = {
  '跨部門溝通':            'ability',
  'Stakeholder Alignment': 'ability',
  'Executive Communication': 'ability',
  'Conflict Resolution':   'ability',
};

// ══════════════════════════════════════════════════════════════════════
// 分類表 ②：不打包給別人的項目
//
// 「轉職敘事」是求職材料，不是產品能力——別人 clone 這個框架不需要我的 STAR 故事庫。
//
// ⚠️ 標記成 packaged: false，**不是從資料裡刪掉**。站上照樣顯示，只有 init 產生
//    範本時會跳過。把打包邊界做成一個欄位而不是另一個檔案，是為了不讓「打包」
//    這件事偷偷改變我自己看到的畫面。
// ══════════════════════════════════════════════════════════════════════
const NOT_PACKAGED_CAT = new Set(['轉職敘事']);

// ══════════════════════════════════════════════════════════════════════
// 分類表 ③：掛到 16 個 L1 competency
//
// 用 cat（SKILLS_DATA）與 phase（ROADMAP_DATA）做預設，再用 L1_OVERRIDE 修個案。
// 這張表就是「這個框架怎麼理解這些技能」的實體，是最該被審的部分。
// ══════════════════════════════════════════════════════════════════════
const CAT_TO_L1 = {
  '商業與策略':   'strategic-impact',
  '執行力':       'product-delivery',
  '人員領導':     'stakeholder-management',
  '數據分析':     'fluency-with-data',
  '產品發現':     'voice-of-the-customer',
  '實驗驗證':     'fluency-with-data',
  '產品行銷':     'business-outcome-ownership',
  '技術能力':     'product-delivery',
  'AI-Native PM': 'feature-specification',
};

const PHASE_TO_L1 = {
  'Introduction':           null,                       // 全是 topic
  'Idea Generation':        'voice-of-the-customer',
  'Market & User Research': 'voice-of-the-customer',
  'Product Strategy':       'strategic-impact',
  'Vision & Goals':         'vision-roadmapping',
  'Product Planning':       'feature-specification',
  'Product Design':         'ux-design',
  'Development & Launch':   'product-delivery',
  'Product Metrics':        'fluency-with-data',
  'Stakeholder Management': 'stakeholder-management',
  'PM Tools':               null,                       // 全是 tool
  'Advanced / AI PM':       'feature-specification',
};

const L1_OVERRIDE = {
  // 策略類但落在別的 phase
  'Go-to-Market Strategy':  'business-outcome-ownership',
  'USP / Positioning':      'business-outcome-ownership',
  'Market Segmentation':    'business-outcome-ownership',
  'Business Model Canvas':  'financial-management',
  'LTV / CAC':              'financial-management',
  'TAM / SAM / SOM':        'strategic-impact',
  '市場規模評估（TAM/SAM/SOM）': 'strategic-impact',
  // 路線圖與願景
  'Creating a Roadmap':        'vision-roadmapping',
  'Prioritizing Features':     'vision-roadmapping',
  'RICE / MoSCoW':             'vision-roadmapping',
  'Communicating the Roadmap': 'vision-roadmapping',
  'Backlog Management':        'vision-roadmapping',
  // 品質
  'Acceptance Criteria':  'quality-assurance',
  'Usability Testing':    'quality-assurance',
  'A/B Testing':          'quality-assurance',
  // 交付模式（ISPMA）
  'Scrum': 'delivery-model', 'Kanban': 'delivery-model',
  'Sprint Planning': 'delivery-model', 'Daily Standups': 'delivery-model',
  'Retrospectives': 'delivery-model', 'MVP': 'delivery-model',
  // 影響力
  'Influencing Without Authority': 'managing-up',
  'Emotional Intelligence':        'team-leadership',
  'Executive Communication':       'managing-up',
  // 跨部門溝通 / Stakeholder Alignment 走 CAT_TO_L1['人員領導'] 的預設，不需要 override
  // 設計
  'Service Design': 'ux-design', 'Design Thinking': 'ux-design',
};

// ── 工具 ──────────────────────────────────────────────────────────────
const slug = (n) => n
  .replace(/[（(].*?[)）]/g, ' ')
  .replace(/&/g, ' and ')
  .replace(/\//g, ' ')
  .trim().toLowerCase()
  .replace(/[^a-z0-9一-鿿]+/g, '-')
  .replace(/^-+|-+$/g, '');

// 兩邊都有的 7 個概念（CLAUDE.md 已列）：靠正規化名稱配對
const norm = (n) => n.toLowerCase()
  .replace(/[（(].*?[)）]/g, '')
  .replace(/[\s\-_/·、,，.。']/g, '')
  .replace(/porters?/, '').replace(/analysis|analytics/, '')
  .replace(/設定|評估|基礎/g, '');

// ⚠️ 先看「這東西是什麼性質」，再看它來自哪個檔。
//    反過來寫會讓兩邊都有的項目（Executive Communication / Conflict Resolution）
//    被「來自 SKILLS_DATA」蓋掉 ability 判定，靜默降級成 skill。
const kindOf = (names, cat) => {
  for (const n of names) {
    if (TOOL.has(n)) return 'tool';
    if (ABILITY.has(n) || SK_KIND_OVERRIDE[n] === 'ability') return 'ability';
    if (TOPIC.has(n)) return 'topic';
  }
  return 'skill';
};

// ── 攤平 ──────────────────────────────────────────────────────────────
const rmItems = [];
RM.forEach((ph, i) => ph.groups.forEach(g => g.skills.forEach(s => rmItems.push({
  name: s.name, status: s.status, reason: s.reason || null,
  phase: ph.title, phaseIdx: i + 1, phaseIcon: ph.icon, phaseColor: ph.color, group: g.name,
}))));

const skItems = SK.map(s => ({
  name: s.skill, status: s.status, reason: s.reason || null,
  // ⚠️ note 用 ?? 不是 ||：原本是空字串的要保持空字串。渲染端直接插值，
  // null 會在表格裡印出字面的 "null"。
  cat: s.cat, priority: s.priority, note: s.note ?? null,
  social: s.social || null, eval: s.eval || null,
}));

// ── 合併 ──────────────────────────────────────────────────────────────
const bucket = new Map();
const put = (src, it) => {
  const k = norm(it.name);
  if (!bucket.has(k)) bucket.set(k, { rm: [], sk: [] });
  bucket.get(k)[src].push(it);
};
rmItems.forEach(it => put('rm', it));
skItems.forEach(it => put('sk', it));

const EQ = { have: 'have', learning: 'partial', partial: 'partial', need: 'need', wont: 'wont' };
const conflicts = [], items = [], assessment = {};
const idOf = new Map();   // 正規化名稱 → id，給 CURRICULUM 建索引用

for (const [, v] of bucket) {
  const all = [...v.rm, ...v.sk];
  const statuses = [...new Set(all.map(x => EQ[x.status]))];
  if (statuses.length > 1) {
    conflicts.push({ names: all.map(x => x.name), statuses: all.map(x => x.status) });
    continue;
  }
  const sk = v.sk[0] || null;
  const rm = v.rm[0] || null;
  const name = sk ? sk.name : rm.name;          // 中文名優先（SKILLS_DATA 的用詞是使用者自己的）
  const cat = sk ? sk.cat : null;
  const kind = kindOf(all.map(x => x.name), cat);
  const l1 = kind === 'tool' || kind === 'topic'
    ? (L1_OVERRIDE[rm?.name] || L1_OVERRIDE[name] || (cat ? CAT_TO_L1[cat] : PHASE_TO_L1[rm?.phase]) || null)
    : (L1_OVERRIDE[rm?.name] || L1_OVERRIDE[name] ||
       (cat ? CAT_TO_L1[cat] : null) || (rm ? PHASE_TO_L1[rm.phase] : null));

  const id = slug(name);
  items.push({
    id, name, kind, l1,
    cat: cat || null,
    aliases: [...new Set(all.map(x => x.name))].filter(n => n !== name),
    priority: sk ? sk.priority : null,
    eval: sk ? sk.eval : null,
    packaged: !(cat && NOT_PACKAGED_CAT.has(cat)),
  });
  // 兩份資料的字彙不同：能力地圖用 learning、技能圖譜用 partial，指同一件事。
  // canonical 存 partial（可評估層的字彙），roadmapView() 再翻回 learning。
  // 一對一、可逆，所以兩個視圖都還原得出原本的字。
  assessment[id] = {
    status: EQ[all[0].status],
    reason: all.map(x => x.reason).find(Boolean) || null,
    // ⚠️ note 的空字串**不可以**正規化成 null：技能表是 `${note}` 直接插值，
    //    null 會在表格裡印出字面的 "null"。原本是 "" 就保持 ""。
    note: sk ? (sk.note ?? null) : null,
    social: sk ? sk.social : null,
    evidence: [],
  };
  all.forEach(x => idOf.set(norm(x.name), id));
}

// ── CURRICULUM：學習路徑的結構（roadmap.sh 的 12 個 phase）────────────
// 只存「哪個 phase 的哪個 group 教哪些 item」，**不存狀態**。
// 同一個 item 可以出現在兩個 phase（North Star Metric 在 Vision & Goals 與
// Product Metrics 都出現）——那是課程結構的事實，不是重複資料。
const curriculum = RM.map((ph, i) => ({
  phase: i + 1, title: ph.title, icon: ph.icon, color: ph.color,
  // 每個 placement 帶自己的顯示名稱：課程用 roadmap.sh 的原文
  //（'Five Forces Analysis'、'Jobs to Be Done (JTBD)' 半形括號），
  // 技能表用使用者自己的用詞。**這是顯示層的差異，不是狀態的差異**——
  // 狀態只有 assessment 一份，坑仍然是補掉的。
  groups: ph.groups.map(g => ({
    name: g.name,
    items: g.skills.map(s => ({ id: idOf.get(norm(s.name)), name: s.name })),
  })),
}));
const placements = curriculum.reduce((n, p) => n + p.groups.reduce((m, g) => m + g.items.length, 0), 0);
const brokenRefs = curriculum.flatMap(p => p.groups.flatMap(g => g.items.filter(x => !x.id)));

// ── 報告 ──────────────────────────────────────────────────────────────
const by = (f) => items.reduce((a, i) => (a[f(i)] = (a[f(i)] || 0) + 1, a), {});
console.log('原始      ROADMAP_DATA %d + SKILLS_DATA %d = %d 筆', rmItems.length, skItems.length, rmItems.length + skItems.length);
console.log('去重後    %d 個概念（省下 %d 筆重複計數）', items.length, rmItems.length + skItems.length - items.length);
console.log('\nkind 分布 %s', JSON.stringify(by(i => i.kind)));
console.log('狀態分布  %s', JSON.stringify(Object.values(assessment).reduce((a, v) => (a[v.status] = (a[v.status] || 0) + 1, a), {})));

console.log('CURRICULUM %d 個 phase / %d 個 placement（原本 92，同一項可掛多個 phase）%s',
  curriculum.length, placements, brokenRefs.length ? '  ❌ 有 ' + brokenRefs.length + ' 個斷掉的 itemId' : '  ✓ 無斷鍵');
console.log('不打包的項目 %d（轉職敘事，站上照樣顯示）', items.filter(i => !i.packaged).length);

const skills = items.filter(i => i.kind === 'skill');
console.log('\nskill 共 %d 項 · 有 eval %d · 缺 eval %d  ← 發佈前要補的債',
  skills.length, skills.filter(i => i.eval).length, skills.filter(i => !i.eval).length);

const noL1 = items.filter(i => !i.l1 && i.kind !== 'topic' && i.kind !== 'tool');
console.log('沒掛到 L1 的 skill/ability: %d %s', noL1.length, noL1.length ? JSON.stringify(noL1.map(i => i.name)) : '✓');

console.log('\n每個 L1 掛了幾項:');
const l1c = by(i => i.l1 || '(topic/tool，不掛 L1)');
Object.entries(l1c).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  %s %s', String(v).padStart(3), k));

// 零覆蓋的 L1：spine 有這個能力，但一項技能都沒掛上去。
// 這不是 bug，是既有的已知缺口（CLAUDE.md 記過：ISPMA 那四項現有技能表完全空白）。
const L1_IDS = ['feature-specification','product-delivery','quality-assurance',
  'fluency-with-data','voice-of-the-customer','ux-design',
  'business-outcome-ownership','vision-roadmapping','strategic-impact',
  'pricing-packaging','delivery-model','financial-management','ecosystem-management',
  'stakeholder-management','team-leadership','managing-up'];
const empty = L1_IDS.filter(id => !l1c[id]);
console.log('\n⚠️ 零覆蓋的 L1（%d / 16）：%s', empty.length, empty.join('、') || '無');
console.log('   這是既有缺口不是遷移造成的——現有技能表在 ISPMA 那幾項本來就空白。');

// ── 死鍵檢查 ──────────────────────────────────────────────────────────
// 分類表裡比對不到任何項目的鍵，跟站上那五個手打的 JOB-xx 字串是同一種病：
// 看起來有機制，其實靜默沒生效。
const allNames = new Set([...rmItems, ...skItems].map(x => x.name));
const dead = [];
const checkKeys = (label, keys) => keys.forEach(k => { if (!allNames.has(k)) dead.push(label + ' → ' + k); });
checkKeys('TOPIC', [...TOPIC]);
checkKeys('ABILITY', [...ABILITY]);
checkKeys('TOOL', [...TOOL]);
checkKeys('SK_KIND_OVERRIDE', Object.keys(SK_KIND_OVERRIDE));
checkKeys('L1_OVERRIDE', Object.keys(L1_OVERRIDE));
if (dead.length) {
  console.log('\n❌ 分類表有 %d 個對不到任何項目的鍵（打錯字或項目已不存在）：', dead.length);
  dead.forEach(d => console.log('   ', d));
  process.exit(1);
}
console.log('✓ 分類表無死鍵——每一個鍵都真的命中某一項。');

if (conflicts.length) {
  console.log('\n❌ 狀態衝突，需要人工裁決 %d 筆：', conflicts.length);
  conflicts.forEach(c => console.log('   ', c.names.join(' / '), '→', c.statuses.join(' vs ')));
  process.exit(1);
}
console.log('\n✓ 狀態零衝突——每一項都是原封搬移，沒有發明任何判斷。');

if (DRY) { console.log('\n(dry-run，未寫入)'); process.exit(0); }
if (brokenRefs.length) { console.log('\n❌ CURRICULUM 有斷鍵，中止'); process.exit(1); }
fs.writeFileSync(path.join(ROOT, '.migrate-out.json'),
  JSON.stringify({ items, assessment, curriculum }, null, 1));
console.log('\n中間結果寫到 .migrate-out.json，由 build-spine 步驟產生正式檔案。');
