// ════════════════════════════════════════════════════════════════════════
// 職缺探索的來源清單 —— 「要盯哪些公司」是你的判斷，這個檔就是那份判斷。
//
// scripts/discover-jobs.mjs 讀它，機械地把每家公司目前開的缺抓下來，
// 比對 JOBS_DATA 與 SEEN，**新的寫進 job-search/inbox.md 等你 triage**。
//
// ⚠️ 這條線不要越過（CLAUDE.md 與 mentor-handoff §5）：
//    腳本只做「發現有這個 URL 存在」——那是可查證的事實。
//    match / why / tier / pdmExposure 全是你的判斷，**腳本一個字都不會填**，
//    也不會寫 job-search/jobs.js。自動生成那些欄位就是編造資料。
//
// ⚠️ 傳統 <script src> 相容格式，但目前只有 Node 腳本讀它，網頁不載。
// ════════════════════════════════════════════════════════════════════════

// 來源型態：
//   cake-company    cake.me 的公司職缺頁。**SSR，HTML 裡直接有連結**，robots.txt 全開
//   greenhouse      boards-api.greenhouse.io 公開 API（需要公司 slug）
//   lever           api.lever.co 公開 API，robots 明寫 Allow: / 與 Crawl-delay: 1
//
// 查不到 / 不做的來源，理由寫在這裡免得下次又去試：
//   104.com.tw   整站在 Cloudflare managed challenge 後面。繞過它等於規避存取控制，不做
//   Ashby        jobs.ashbyhq.com/robots.txt 明寫 Disallow: /api/ —— 人家自己說不要
//   Yourator     robots 允許頁面，但職缺是 XHR 載入的，HTML 裡沒有東西可抓
//   CakeResume 全站搜尋  sitemap 只有分類頁不是職缺；公司頁才有料，所以用 cake-company
//   LinkedIn / Indeed    服務條款禁止

const JOB_SOURCES = [
  { kind: "cake-company", slug: "MaiAgent", label: "MaiAgent 思邁智能" },
  { kind: "cake-company", slug: "akohub", label: "Akohub" },
  { kind: "cake-company", slug: "addcn", label: "addcn" },
  { kind: "cake-company", slug: "iscoollab", label: "IsCoolLab" },
  { kind: "cake-company", slug: "GoFreight", label: "GoFreight" },
  { kind: "cake-company", slug: "shopline", label: "Shopline" },
  { kind: "cake-company", slug: "hour-loop", label: "HourLoop" },
  { kind: "cake-company", slug: "systex", label: "SYSTEX 精誠資訊" },
  { kind: "cake-company", slug: "104-company-1a2x6blq4a", label: "雲策數據" },
  { kind: "cake-company", slug: "witsper", label: "WitsPer 智選家" },
  { kind: "cake-company", slug: "drbreaths", label: "原氣" },
  // 庠菻：www.104.com.tw 無法自動核對，維持人工
];

// 粗篩關鍵字。**這不是判斷，是省掉一眼就知道不相關的東西**——
// 抓到的標題只要命中任何一個 titleAny 就進 inbox，寧可多給你看也不要漏。
// 命中 titleNone 才排除，而且只排除明顯不是 PM 的職能。
const DISCOVERY_FILTER = {
  titleAny: [
    "product manager", "產品經理", "產品企劃", "product owner", "PdM", "PM",
    "project manager", "專案經理", "產品營運", "product operations",
    "associate product", "APM", "產品助理",
  ],
  titleNone: [
    "engineer", "工程師", "developer", "設計師", "designer", "業務", "sales",
    "行銷企劃", "客服", "會計", "人資", "實習", "intern", "秘書", "助理工程",
  ],
};

// 看過而且決定不列的 URL。寫進來就不會再出現在 inbox。
// **決定不列也是一種判斷，所以要留痕跡** —— 六個月後你不會記得為什麼跳過它。
const SEEN = [
  // { url: "...", skippedAt: "YYYY-MM-DD", reason: "職級太高 / 不是 PM / 地點不符" },
];

