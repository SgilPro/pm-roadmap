// 自評版本快照範本。scripts/init.mjs 會複製成 profile/history.js。
//
// 每次大幅重估自評時 append 一筆，這樣才看得出「我到底有沒有在動」。
// 空陣列是合法的——第一季本來就沒有歷史可比。
//
// 每筆的格式：
//   { date: "YYYY-MM-DD", label: "這次改了什麼", summary: "...",
//     data: [ ...skillsView() 當時的完整輸出 ] }
//
// ⚠️ 已經寫進去的快照**不要回頭改**。歷史快照的價值就是「當時長什麼樣」，
//    改寫它等於偽造自己的進度。
//
// ⚠️ 傳統 <script src>，不可改成 type="module"。

const SKILL_HISTORY = [];
