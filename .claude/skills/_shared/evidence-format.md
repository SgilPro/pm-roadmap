# Rubric 輸出契約

所有 rubric skill（`prd-review`、`prd-redteam`、`mock-interview-*`、以及後續加的）跑完都要輸出一份符合這個格式的 JSON。

## 為什麼要有統一格式

因為這些分數**最終要餵進能力骨架的 `evidence[]`**，而 `data/assessment.js` 有一條會被 `validate-data.mjs` 強制的規則：

> `current > 5` 但 `evidence[]` 為空 → 驗證失敗。

也就是說：**沒有跑過 rubric 的產出物，不能拿來主張自己某項能力在中上水準。** 這是整個框架防自我灌水的主力。格式不統一，這條就強制不了。

## 存放位置

| 東西 | 放哪 | 為什麼 |
|---|---|---|
| **rubric 定義**（`.claude/skills/*/SKILL.md`） | 版控、public | 這本身就是作品，可以給面試官看 |
| **rubric 跑出來的分數**（本格式的 JSON） | `docs/evidence/`，**已 gitignored** | 個人評分，不公開 |
| **人工判斷後的 `current` 分數** | `data/assessment.js`，版控 | 這是你的主張，該公開 |

## 格式

```json
{
  "artifact": "portfolio/linkju.html#prd",
  "rubric": "prd-review",
  "rubricVersion": "1.0",
  "date": "2026-08-12",
  "dimensions": [
    { "key": "problem-framing",   "score": 2, "max": 3, "severity": null },
    { "key": "evidence-quality",  "score": 1, "max": 3, "severity": "blocker" },
    { "key": "success-metrics",    "score": 2, "max": 3, "severity": "major" }
  ],
  "overall": 1,
  "overallRule": "min",
  "competencies": ["feature-specification", "voice-of-the-customer"],
  "topFix": "「追繳佔 40% 工時」這個數字沒有來源，整份 PRD 的問題規模都建立在它上面。"
}
```

### 欄位

| 欄位 | 規則 |
|---|---|
| `artifact` | repo 相對路徑，可帶 `#anchor`。模擬面試沒有檔案時填 `"mock-interview:<公司>-<題號>"` |
| `rubric` | skill 目錄名，與 `.claude/skills/<name>/` 一致 |
| `rubricVersion` | **改動評分維度或 anchor 就要進版。** 沒有這個，跨時間的分數不可比 |
| `date` | 跑的當天，`YYYY-MM-DD` |
| `dimensions[].key` | 該 rubric 自己定義的維度代號，kebab-case |
| `dimensions[].severity` | `blocker` / `major` / `minor` / `null`。只有找到具體缺陷才填 |
| `overall` | 依 `overallRule` 算出來 |
| `overallRule` | `"min"`（取短板）或 `"sum"`。**`mock-interview-*` 一律 `min`** |
| `competencies` | 必須是 `data/competencies.js` 的 `COMPETENCY_IDS` 裡的值。**不得自創** |
| `topFix` | 一句話。最該先修的**一件**事，不是清單 |

## 檔名

```
docs/evidence/<rubric>-<YYYYMMDD>.json
```

同一天同一支 rubric 跑第二次就加序號：`prd-review-20260812-2.json`。
**不要覆蓋。** 分數的變化軌跡本身就是「學習觀測」要用的資料。

## 界線

**分數是機械的，能力評級是判斷。**

rubric 可以說「這份 PRD 的 success metrics 缺 baseline，這一維 2/3」——那是對照 anchor 就能得出的事實。
rubric **不能**說「所以你的 Feature Specification 能力是 7 分」——那是你自己看著累積的 evidence 決定的，寫進 `data/assessment.js`。

同一條線在這個 repo 裡已經用過三次：職缺的「衰減 vs 發現」（`scripts/check-jobs.mjs`）、產出物的「分數 vs 評級」（這裡）、資訊源的「有新文章 vs 要不要進骨架」。
