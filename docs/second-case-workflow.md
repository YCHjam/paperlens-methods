# 第二篇真實論文新增流程驗證

日期：2026-11-16。基線：已發布的 083c2c6；本次不修改頁面版型或資料契約。

## 選文與來源

Wei J, Cao H, Peng M, Zhang Y, Li S, Ma W, Li Y. An interpretable machine learning model for predicting in-hospital mortality in ICU patients with ventilator-associated pneumonia. PLOS ONE 2025. DOI: 10.1371/journal.pone.0316526。

原文：https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0316526

已讀主文 HTML 並目視核對 Fig 1 與 Table 2；圖表與原始 HTML 放在 ignored 的 local/sources/。未下載 MIMIC 或附件中的個體資料，沒有重跑模型。

## 實際依規則執行

1. 讀取 AGENTS.md、分析指令、範本及現有方法詞條。
2. 新增 content/papers/2025-vap-mortality-ml.json，沿用 schema_version 2.0。
3. 分類為世代研究、回溯性、風險預測與模型開發／驗證，分別保留作者明述或推論依據。
4. 填入八個固定分析區塊、十二個方法項目與十五筆 evidence。候選十四種演算法保留在清單，核心表格聚焦最終 RF 與建模、評估、解釋流程。
5. 直接重用 mann-whitney-u 與 chi-square-test 的通識欄位，新增十個方法詞條。原有詞條不重寫；每篇只改本文用途、理由與證據。
6. 執行 node scripts/render-review.mjs 2025-vap-mortality-ml，產生 local/reviews/ 下的獨立 HTML 與 Markdown。
7. 執行既有檢查及七項測試，另核對十二個方法與辭典的一致性，及 pending 草稿無法通過發布檢查。
8. 瀏覽器驗證十二張表格各有九列，十五處 evidence，頁內失效錨點為零；Table 2 跳轉及 375px 手機版正常。
9. 保持 draft/pending；公開索引仍只有第一篇。完成使用者審閱後，才進行確認、加入索引與遠端部署。

## 延伸性證據

- 新增第二篇不需要為文章另寫 HTML，也不需要修改 assets/、scripts/ 或 templates/。
- 固定分類足以表達與 RCT 不同的回溯性觀察設計；研究目的可同時選風險預測與方法開發。
- 相同詞條跨案例重用，新增的機器學習方法仍使用既有兩欄九列版型。
- draft 機制確實阻擋未經確認的新文章進入正式案例庫。

## 分析時保留的疑問

- 作者稱外部測試的資料仍來自同院較晚年度，需與跨院驗證區分。
- 文中說明最終選模參考驗證與測試表現，需注意測試評估的獨立性。
- 前處理是否逐折執行尚不明，僅標示風險而不宣稱已證實洩漏。
- 特徵數量的文字表述不一致，待附件或程式碼澄清，不自行替作者改值。

## 目前狀態

本機：一篇 published、一篇 draft/pending、十七個方法詞條。遠端：仍為既有的一篇案例與七詞條，本次尚未提交或部署。

檢查與瀏覽器驗證不能取代科學內容的獨立核對。本次沒有自填 reviewer，也沒有建立 approval marker。

## 發布更新

使用者於 2026-11-16 指示更新網頁，第二篇因此轉為 published/reviewed 並加入公開索引；上列 draft/pending 紀錄保留為先前流程驗證歷史。現在為兩篇公開案例、十七詞條。發布確認不代表已重現研究或逐項人工科學核對。
