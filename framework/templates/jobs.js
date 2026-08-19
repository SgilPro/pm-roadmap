// 職缺清單範本。scripts/init.mjs 會複製成 job-search/jobs.js。
//
// **這是 CI 唯一會寫入的檔案。** scripts/check-jobs.mjs 每週改 health / closedAt /
// checkedAt / retiredTotal；判斷欄位（match / why / tier / pdmExposure）一個字都不動。
//
// ⚠️ 「自動核對」不等於「自動抓職缺」。腳本只查 HTTP 狀態碼：
//    衰減（連結死掉）是純機械的事實，可以自動化；
//    發現（新職缺值不值得投）全是你的判斷，自動生成就是編造資料。這條線不要越過。
//
// ⚠️ 動這個檔之前先 git pull——本機與 CI 都會寫它。
// ⚠️ check-jobs.mjs 用 regex 解析下面的物件標頭，改格式前先跑 --dry-run。
// ⚠️ 傳統 <script src>，不可改成 type="module"。

const JOBS_META = {
  checkedAt: "{{TBD}}",        // ⚠️ 只能由真的核對過的流程更新。手填就是假資料
  trackingSince: "{{TBD}}",    // 開始追蹤這份清單的日期，衰減率用它當分母
  checkMethod: "尚未核對",
  retiredTotal: 0              // 累計因下架而移除的筆數。清單不留屍體，但保留「爛得多快」
};

const JOBS_DATA = [
  // tier: "top" = 主推投遞 | "track" = 持續觀察 | "later" = 暫緩
  // health: "open" = HTTP 200 | "closed" = 404/410 | "unknown" = 無法自動確認
  //         403 / 429 / 5xx / timeout 代表「我們被擋了」，不是「職缺沒了」
  //
  // {
  //   rank: 1, tier: "top", health: "unknown",
  //   company: "", title: "", url: "",
  //   match: 0,                  // 0–100，你的主觀匹配度
  //   why: "",                   // 為什麼值得投——寫不出來就別列
  //   pdmExposure: "low",        // high / mid / low
  //   tags: [],
  // },
];
