# 題庫

綁定 `JOBS_DATA` 裡目前**仍開放的主推職缺**，不用通用題。理由：product sense 的第 5 維度（Solution Development）要求「解法吃到公司既有的優勢」，用通用題根本練不到這一格。

> ⚠️ 題目只鎖定各公司的**產業與產品類型**（這些來自 JD），不假設任何未經查證的產品細節。
> 面試前若查到更多真實資訊，補進對應段落——但別編。

職缺現況見 `index.html` 的 `JOBS_DATA`。25sprout 已下架（`closedAt: 2026-07-27`），不列。

---

## MaiAgent 思邁智能 — AI Project Manager（PJM + PDM，match 88，薪資最高）

企業級 AI agent SaaS。這是唯一同時給 PJM title 與 PDM discovery 經驗的職缺，**練這家的權重最高**。

1. 企業客戶買了 AI agent 平台，三個月後使用率掉到只剩少數幾個人在用。你會怎麼查、怎麼修？
2. 為「不信任 AI 輸出」的企業使用者設計一個功能。先講他們為什麼不信任。
3. AI agent 會答錯。設計一套讓使用者能安全地在正式流程裡用它的機制。
4. 公司想從「賣 agent 平台」走到「賣某個垂直產業的現成 agent」。你選哪個產業，第一版做什麼？

**壓力點**：第 2、3 題直接考「AI 產品的責任邊界」——這正好是 `SKILLS_DATA` 裡「AI 輔助 discovery 的證據紀律」與「RAG 知識庫治理」對應的能力。

## Akohub — Project Manager（Shopify 系統整合，match 85，年資門檻最低）

Shopify 生態的電商工具與系統整合。

5. Shopify 店家裝了你們的 app，七天後就停用。你怎麼找出是哪一步流失？
6. 為「一人經營」的 Shopify 店主設計一個功能。他和有專職行銷的店家差在哪？
7. 你們要決定 app 的定價從免費增值改成純付費。你會先看什麼、怎麼驗證？

**壓力點**：第 7 題考 `pricing-packaging`——這是 spine 裡從 ISPMA 補進來、而現有技能表完全空白的四項之一。

## addcn — 產品經理 PM（Tasker 外包網，PDM，需 GA4）

任務外包媒合平台，雙邊市場。JD 明確要求網站 UX 與數據分析。

8. 平台上「發案方發了案但沒人接」的比例偏高。你怎麼拆這個問題？
9. 雙邊市場要先長哪一邊？講你的判準，不要只講答案。
10. 為「第一次發案、不知道該寫什麼」的發案方設計 onboarding。
11. 你只能看三個數字來判斷這個平台健康與否。選哪三個，為什麼不選第四個？

**壓力點**：第 11 題是 metrics 段的核心題；第 9 題考 `business-outcome-ownership`。這家是唯一的 PDM 高曝光職缺（`pdmExposure: "high"`）。

## IsCoolLab — Junior Project Manager（RPA 產品，match 78）

RPA（流程自動化）產品。JD 要求 IT 背景。

12. 客戶說「我們想自動化」，但講不出要自動化什麼。你怎麼帶他找出第一個該做的流程？
13. RPA 腳本在客戶環境會壞（介面改了、資料格式變了）。設計一個讓客戶自己就能發現並回報的機制。

**壓力點**：第 12 題考 Problem Identification 的根因 vs 症狀（rubric 4 分那一格）。

## GoFreight — Associate Product Manager（物流 SaaS，英文環境）

貨運承攬垂直 SaaS。JD 註明英文環境，**這家的題目用英文練**。

14. Freight forwarders still run large parts of their operation on email and spreadsheets. Pick one workflow and explain why it hasn't moved yet — then design the v1 that would move it.
15. You have to choose between shipping a feature that helps 5 large forwarders and one that helps 200 small ones. Walk me through how you decide.
16. How would you measure whether a vertical SaaS product is actually replacing a customer's spreadsheet, versus just sitting next to it?

**壓力點**：語言 + `delivery-model`（垂直 SaaS 的導入模式）。第 16 題是很好的 metrics 題——它問的是「取代」而不是「使用」，容易答成 DAU。

---

## 出題規則

- **一場只出一題。** 兩題會兩題都潦草。
- 第一次練先出 MaiAgent 或 Akohub（match 最高、最快投）。GoFreight 的英文題留到第三輪之後，先把中文的結構練穩再加語言負載。
- 同一題**可以重練**。第二次的分數才有意義——第一次多半在適應格式，不是在展現 product sense。
- 使用者指定公司時就照他指定的出。
