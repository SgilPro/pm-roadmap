#!/usr/bin/env node
// 從 job-search/sources.js 的來源清單抓目前開著的職缺，比對後把**新的**寫進
// job-search/inbox.md 等人工 triage。
//
//   node scripts/discover-jobs.mjs             抓 + 寫 inbox
//   node scripts/discover-jobs.mjs --dry-run   只印，不寫檔
//
// ⚠️ 這支腳本**永遠不會寫 job-search/jobs.js**。
//
// 這是「衰減 vs 發現」那條線的第三次使用（CLAUDE.md、mentor-handoff §5）：
//
//   機械（可自動）  這個 URL 存在、標題是什麼、之前有沒有看過
//   判斷（純人工）  match / why / tier / pdmExposure —— 自動生成就是編造資料
//
// 所以腳本只做前者，把候選丟進 inbox；把 inbox 的東西升級進 jobs.js 是
// job-triage 的工作，而那一步一定要你回答四個問題。
//
// 無相依套件，Node 18+（原生 fetch）。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
const abs = (p) => path.join(ROOT, p);

const UA = 'pm-roadmap-jobdiscovery/1.0 (+https://github.com/SgilPro/pm-roadmap)';
const TIMEOUT_MS = 20_000;
const SPACING_MS = 1_200;   // 對來源站客氣一點。Lever 的 robots 寫 Crawl-delay: 1

// ── 載入 ───────────────────────────────────────────────────────────────
const g = {};
new Function('g', fs.readFileSync(abs('job-search/sources.js'), 'utf8') +
  fs.readFileSync(abs('job-search/jobs.js'), 'utf8') +
  'g.SOURCES = JOB_SOURCES; g.FILTER = DISCOVERY_FILTER; g.SEEN = SEEN; g.JOBS = JOBS_DATA;')(g);
const { SOURCES, FILTER, SEEN, JOBS } = g;

const known = new Set([
  ...JOBS.map(j => j.url.replace(/[?#].*$/, '').replace(/\/$/, '')),
  ...SEEN.map(s => s.url.replace(/[?#].*$/, '').replace(/\/$/, '')),
]);
const norm = (u) => u.replace(/[?#].*$/, '').replace(/\/$/, '');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function get(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal, redirect: 'follow' });
    return { status: res.status, body: res.ok ? await res.text() : '' };
  } catch (e) {
    return { status: 0, body: '', error: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally { clearTimeout(t); }
}

// ── 各來源的抓法 ───────────────────────────────────────────────────────
const FETCHERS = {
  // cake.me 的公司職缺頁是 SSR，標題就在 <a> 的文字裡。
  //
  // ⚠️ **一頁只有 10 筆，必須跟著 ?page= 翻完。** 第一版沒翻頁，Shopline 23 個缺
  //    只看到 10 個——而且畫面上完全看不出少了東西。這種靜默的半套結果比抓不到更糟：
  //    抓不到會報錯，半套會讓你以為看完了。
  async 'cake-company'(src) {
    const base = `https://www.cake.me/companies/${src.slug}/jobs`;
    const re = /<a href="(https:\/\/www\.cake\.me\/companies\/[^/]+\/jobs\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    const seen = new Set(), jobs = [];
    const MAX_PAGES = 12;          // 120 個缺。超過這個數的公司請縮小 watchlist
    let page = 1, truncated = false;
    for (; page <= MAX_PAGES; page++) {
      const url = page === 1 ? base : `${base}?page=${page}`;
      const { status, body, error } = await get(url);
      if (status !== 200) {
        if (page === 1) return { error: error || `HTTP ${status}`, jobs: [] };
        break;                      // 後續頁掛掉：回報已抓到的，別把整家算成 0
      }
      let added = 0;
      for (const m of body.matchAll(re)) {
        const u = norm(m[1]);
        if (seen.has(u)) continue;
        seen.add(u); jobs.push({ url: u, title: m[2].trim() }); added++;
      }
      if (added === 0) break;       // 這一頁沒有新東西 = 翻完了
      if (page === MAX_PAGES) truncated = true;
      await sleep(SPACING_MS);
    }
    return { jobs, sourceUrl: base, pages: page - 1, truncated };
  },

  async greenhouse(src) {
    const url = `https://boards-api.greenhouse.io/v1/boards/${src.slug}/jobs?content=false`;
    const { status, body, error } = await get(url);
    if (status !== 200) return { error: error || `HTTP ${status}`, jobs: [] };
    let d; try { d = JSON.parse(body); } catch { return { error: 'JSON 解不開', jobs: [] }; }
    return {
      sourceUrl: url,
      jobs: (d.jobs || []).map(j => ({
        url: norm(j.absolute_url), title: j.title,
        location: j.location?.name || null, postedAt: (j.first_published || '').slice(0, 10) || null,
      })),
    };
  },

  async lever(src) {
    const url = `https://api.lever.co/v0/postings/${src.slug}?mode=json`;
    const { status, body, error } = await get(url);
    if (status !== 200) return { error: error || `HTTP ${status}`, jobs: [] };
    let d; try { d = JSON.parse(body); } catch { return { error: 'JSON 解不開', jobs: [] }; }
    if (!Array.isArray(d)) return { error: '回傳不是陣列', jobs: [] };
    return {
      sourceUrl: url,
      jobs: d.map(j => ({
        url: norm(j.hostedUrl), title: j.text,
        location: j.categories?.location || null,
        postedAt: j.createdAt ? new Date(j.createdAt).toISOString().slice(0, 10) : null,
      })),
    };
  },
};

// ── 粗篩 ───────────────────────────────────────────────────────────────
// 只做字串比對，不做判斷。寧可多留給人看，也不要自動丟掉。
const lower = (s) => s.toLowerCase();
function passesFilter(title) {
  const t = lower(title);
  if (FILTER.titleNone.some(k => t.includes(lower(k)))) return false;
  return FILTER.titleAny.some(k => t.includes(lower(k)));
}

// ── 主流程 ─────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
console.log('探索 %d 個來源（%s）\n', SOURCES.length, DRY ? 'dry-run' : '會寫 inbox');

const found = [], problems = [];
let totalSeen = 0;

for (const src of SOURCES) {
  const fetcher = FETCHERS[src.kind];
  if (!fetcher) { problems.push(`${src.label}：不認得的來源型態「${src.kind}」`); continue; }

  const { jobs, error, sourceUrl, pages, truncated } = await fetcher(src);
  if (error) {
    problems.push(`${src.label}：${error}`);
    console.log('  %s %s  ✗ %s', '✗', src.label.padEnd(20), error);
    await sleep(SPACING_MS);
    continue;
  }
  totalSeen += jobs.length;

  // 抓到 0 筆有兩種可能：真的沒開缺，或版面改了讓 regex 失效。
  // 分不出來就要講出來——沉默地當成「沒開缺」會讓這支腳本無聲失效。
  if (jobs.length === 0) problems.push(`${src.label}：抓到 0 筆（真的沒開缺，還是解析壞了？）`);

  const fresh = jobs.filter(j => !known.has(j.url) && passesFilter(j.title));
  fresh.forEach(j => found.push({ ...j, company: src.label, source: src.kind, sourceUrl, firstSeen: today }));

  if (truncated) problems.push(`${src.label}：翻到上限還有東西，可能沒抓完`);
  console.log('  %s %s %s 個缺%s · %s 個相關且是新的',
    fresh.length ? '●' : '·', src.label.padEnd(18),
    String(jobs.length).padStart(3),
    pages > 1 ? `（${pages} 頁）` : '      ',
    String(fresh.length).padStart(2));
  await sleep(SPACING_MS);
}

console.log('\n掃過 %d 個職缺 · 新候選 %d 個 · 已在 pool 或已跳過的不重複列出', totalSeen, found.length);

if (problems.length) {
  console.log('\n⚠️ %d 個來源有問題：', problems.length);
  problems.forEach(p => console.log('   ', p));
}

// 護欄：超過一半的來源掛掉 = 很可能是我們被擋了或版面改了，不要寫一份殘缺的 inbox
if (problems.length > SOURCES.length / 2) {
  console.error('\n✗ 超過一半的來源失敗，判定為檢查器壞掉而不是市場沒缺。一個字都不寫。');
  process.exit(1);
}

if (!found.length) {
  console.log('\n沒有新候選。');
  process.exit(0);
}

console.log('\n新候選：');
found.forEach((f, i) => console.log('  %d. [%s] %s\n     %s', i + 1, f.company, f.title, f.url));

if (DRY) { console.log('\n(dry-run，未寫入)'); process.exit(0); }

// ── 寫 inbox ───────────────────────────────────────────────────────────
const INBOX = abs('job-search/inbox.md');
const prev = fs.existsSync(INBOX) ? fs.readFileSync(INBOX, 'utf8') : '';
const already = new Set([...prev.matchAll(/\((https?:\/\/[^)\s]+)\)/g)].map(m => norm(m[1])));
const toAdd = found.filter(f => !already.has(f.url));

const header = `# 職缺 triage 佇列

> **這裡的東西還不是 pool。** \`scripts/discover-jobs.mjs\` 只確認「這個 URL 存在、標題是什麼」——
> 那是事實。\`match\` / \`why\` / \`tier\` / \`pdmExposure\` 是你的判斷，腳本一個字都不會填。
>
> 處理方式：跟 Claude 說「triage inbox」，它會逐筆問你那四個問題，然後幫你寫進
> \`job-search/jobs.js\`。不要列的就記進 \`job-search/sources.js\` 的 \`SEEN\`（**要寫 reason**）。
>
> 最後探索：${today}
`;

const rows = toAdd.map(f =>
  `- [ ] **${f.company}** — [${f.title}](${f.url})\n` +
  `      _${f.source} · 首次看到 ${f.firstSeen}${f.location ? ' · ' + f.location : ''}${f.postedAt ? ' · 張貼 ' + f.postedAt : ''}_`
).join('\n');

const body = prev.includes('## 待處理')
  ? prev.replace(/## 待處理\n/, `## 待處理\n${rows}\n`)
  : `${header}\n## 待處理\n${rows}\n`;

fs.writeFileSync(INBOX, body);
console.log('\n✓ %d 筆寫進 job-search/inbox.md（%d 筆本來就在裡面）。**沒有動 jobs.js。**',
  toAdd.length, found.length - toAdd.length);
