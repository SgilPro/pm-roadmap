#!/usr/bin/env node
// 核對 JOBS_DATA 裡每個職缺連結是否還活著，並就地更新 job-search/jobs.js。
//
// ⚠️ 寫入目標是 job-search/jobs.js，**不是 index.html**。
//    這讓 CI 與人工不再寫同一個檔：兩個 HTML 都是純人工檔，併發寫入點只剩這一個。
//
// 這支腳本**只查 HTTP 狀態碼**，不解析職缺頁的任何內容。
// mentor-handoff §5 的「不做自動抓職缺」指的是「發現」——新職缺的 match%、why、
// tier 都是使用者的個人判斷，自動生成就是編造資料。「衰減」（連結死掉）是純機械的
// 事實，沒有判斷成分，所以可以自動化。這條界線不要越過。
//
//   node scripts/check-jobs.mjs            核對並寫入
//   node scripts/check-jobs.mjs --dry-run  只印結果，不寫檔
//
// 無相依套件，需要 Node 18+（原生 fetch）。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'job-search', 'jobs.js');
const DRY = process.argv.includes('--dry-run');

const UA = 'pm-roadmap-linkcheck/1.0 (+https://github.com/SgilPro/pm-roadmap)';
const TIMEOUT_MS = 20_000;
const SPACING_MS = 1_000;   // 對職缺網站客氣一點：一秒一個請求
const RETIRE_AFTER_DAYS = 7;
// cake.me 的 robots.txt 完全開放（User-agent: * 無任何 Disallow）。
// 104 則整站在 Cloudflare managed challenge 後面，連 robots.txt 都要跑 JS 才拿得到,
// 所以 104 的職缺永遠無法自動核對——不浪費請求，直接標 unknown 交給人工。
const UNCHECKABLE_HOSTS = new Set(['www.104.com.tw', '104.com.tw']);
// 被擋護欄：無法驗證的比例超過這個門檻，就當作「檢查器壞了」而不是「職缺都出事了」。
const BLOCKED_THRESHOLD = 0.4;

const today = new Date().toISOString().slice(0, 10);

// ---------- 解析 ----------

// 每筆職缺的標頭都是自成一行的 `rank: N, tier: "x", health: "y"[, closedAt: "..."],`
const HEADER_RE = /^([ \t]*)rank: (\d+), tier: "(top|track|later)", health: "(open|closed|unknown)",(?: closedAt: "(\d{4}-\d{2}-\d{2})",)?$/gm;

function parseJobs(html) {
  const jobs = [];
  for (const m of html.matchAll(HEADER_RE)) {
    jobs.push({
      indent: m[1], rank: +m[2], tier: m[3], health: m[4], closedAt: m[5] || null,
      headerLine: m[0], headerIndex: m.index
    });
  }
  // url 與 company 依出現順序對應同一筆職缺（JOBS_DATA 是唯一有這些欄位的常數）
  const urls = [...html.matchAll(/^\s*url: "([^"]+)"$/gm)].map(m => m[1]);
  const companies = [...html.matchAll(/^\s*company: "([^"]+)",$/gm)].map(m => m[1]);
  if (urls.length !== jobs.length || companies.length !== jobs.length) {
    throw new Error(
      `解析對不上：${jobs.length} 個標頭 / ${urls.length} 個 url / ${companies.length} 個 company。` +
      `JOBS_DATA 的格式可能被改過，請檢查 HEADER_RE。`
    );
  }
  jobs.forEach((j, i) => { j.url = urls[i]; j.company = companies[i]; });
  return jobs;
}

// ---------- 檢查 ----------

async function probe(url) {
  const host = new URL(url).hostname;
  if (UNCHECKABLE_HOSTS.has(host)) return { verdict: 'uncheckable', detail: 'Cloudflare challenge' };
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (res.status === 200) return { verdict: 'open', detail: '200' };
    if (res.status === 404 || res.status === 410) return { verdict: 'closed', detail: String(res.status) };
    // 403 / 429 / 5xx：這是「我們被擋了」或「對方壞了」，不是「職缺下架了」。
    return { verdict: 'unverified', detail: String(res.status) };
  } catch (err) {
    return { verdict: 'unverified', detail: err.name === 'TimeoutError' ? 'timeout' : err.message };
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- 改寫 ----------

function buildHeader(job) {
  return `${job.indent}rank: ${job.rank}, tier: "${job.tier}", health: "${job.health}",`
    + (job.closedAt ? ` closedAt: "${job.closedAt}",` : '');
}

// 從標頭行往外擴到包住整個職缺物件（`  {` … `  },`），連同前後換行一併刪除。
function cutJobBlock(html, job) {
  const openBrace = html.lastIndexOf('\n  {\n', job.headerIndex);
  const closeBrace = html.indexOf('\n  },\n', job.headerIndex);
  if (openBrace === -1 || closeBrace === -1) {
    throw new Error(`找不到 ${job.company} 的物件邊界，中止`);
  }
  return html.slice(0, openBrace) + html.slice(closeBrace + '\n  },'.length);
}

// 寫檔後直接跑 node --check。壞了就還原——絕不留下打不開的站。
// 資料搬進 job-search/jobs.js 之後，這裡不必再從 HTML 裡切 <script> 了：檔案本身就是 JS。
function assertScriptParses(filePath) {
  execFileSync(process.execPath, ['--check', filePath], { stdio: 'pipe' });
}

// ---------- 主流程 ----------

const original = fs.readFileSync(FILE, 'utf8');
const jobs = parseJobs(original);
console.log(`解析到 ${jobs.length} 個職缺，開始核對（${DRY ? 'dry-run' : '會寫入'}）\n`);

let unverified = 0, checked = 0;
for (const job of jobs) {
  const { verdict, detail } = await probe(job.url);
  job.was = job.health;

  if (verdict === 'open') {
    job.health = 'open';
    job.closedAt = null;              // 復活了（重新開缺）就把計時器清掉
    checked++;
  } else if (verdict === 'closed') {
    job.health = 'closed';
    job.closedAt = job.closedAt || today;   // 只在第一次發現時蓋日期
    checked++;
  } else if (verdict === 'uncheckable') {
    job.health = 'unknown';
  } else {
    unverified++; checked++;          // 保留原值不動
  }

  const changed = job.was !== job.health ? `  ${job.was} → ${job.health}` : '';
  console.log(`  ${String(job.rank).padStart(2)} ${verdict.padEnd(11)} ${detail.padEnd(8)} ${job.company}${changed}`);
  if (verdict !== 'uncheckable') await sleep(SPACING_MS);
}

// 護欄一：檢查器被擋的時候，寧可什麼都不做，也不要把正確資料洗成 unknown。
const blockedRatio = checked ? unverified / checked : 0;
if (blockedRatio > BLOCKED_THRESHOLD) {
  console.error(
    `\n✗ ${checked} 個檢查裡有 ${unverified} 個無法驗證（${Math.round(blockedRatio * 100)}%）。` +
    `\n  這比較像是檢查器被擋，而不是職缺同時出事。未寫入任何變更。` +
    `\n  請人工開幾個連結確認，必要時調整 UA 或改回本機執行。`
  );
  process.exit(1);
}

// 退場：死掉滿 RETIRE_AFTER_DAYS 天的職缺離開清單，只留統計。
const cutoff = Date.now() - RETIRE_AFTER_DAYS * 86400_000;
const retiring = jobs.filter(j => j.health === 'closed' && j.closedAt
  && new Date(j.closedAt + 'T00:00:00').getTime() < cutoff);

let html = original;
// 先刪除（由後往前，避免位移影響前面的 index），再改寫剩下的標頭。
for (const job of [...retiring].sort((a, b) => b.headerIndex - a.headerIndex)) {
  html = cutJobBlock(html, job);
}
// 由前往後重編號是安全的：新號一定 <= 原號，而未處理的職缺原號都更大，不會撞行。
const remaining = jobs.filter(j => !retiring.includes(j));
remaining.forEach((job, i) => {
  job.rank = i + 1;                    // 移除後重編號，維持 1..N
  html = html.replace(job.headerLine, buildHeader(job));
});

const retiredTotal = Number(original.match(/retiredTotal: (\d+)/)?.[1] ?? 0) + retiring.length;
html = html
  .replace(/checkedAt: "\d{4}-\d{2}-\d{2}"/, `checkedAt: "${today}"`)
  .replace(/retiredTotal: \d+/, `retiredTotal: ${retiredTotal}`);

const tally = remaining.reduce((a, j) => (a[j.health] = (a[j.health] || 0) + 1, a), {});
console.log(`\n核對日 ${today}`);
console.log(`結果    open ${tally.open || 0} / closed ${tally.closed || 0} / unknown ${tally.unknown || 0}`);
if (unverified) console.log(`未驗證  ${unverified} 個（保留原值）`);
if (retiring.length) {
  console.log(`退場    ${retiring.length} 個（下架滿 ${RETIRE_AFTER_DAYS} 天）：${retiring.map(j => j.company).join('、')}`);
  console.log(`累計    ${retiredTotal} 個職缺自 trackingSince 起下架`);
}

if (DRY) {
  console.log('\n(dry-run，未寫入)');
} else if (html === original) {
  console.log('\n無變更。');
} else {
  fs.writeFileSync(FILE, html);
  // 護欄二：改壞了就還原。
  try {
    assertScriptParses(FILE);
  } catch (err) {
    fs.writeFileSync(FILE, original);
    console.error('\n✗ 改寫後的 job-search/jobs.js 無法通過 node --check，已還原：');
    console.error(String(err.stderr || err.message).trim());
    process.exit(1);
  }
  console.log('\n✓ job-search/jobs.js 已更新。');
}
