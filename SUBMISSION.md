# 作業繳交內容

繳交標題：［學校］［學號］［系級］［姓名］PaperLens 研究方法拆解室

個人資料請由本人填寫；本檔不包含或推測學號、姓名。

## 1. 專案簡介

PaperLens 是繁體中文研究方法學學習網站，協助讀者理解論文用了什麼生物統計或機器學習方法、選用理由、條件與優缺點。第一篇案例為冷水淋浴 RCT，包含研究設計、時間方向與研究目的分類，八個固定分析區塊、七個方法解析表格及原文證據定位。

目前以 AI 整理、使用者確認教學案例發布的流程運作；尚未提供網站內 PDF 自動分析或模型 API。案例仍保留未核對附件等限制，不宣稱已重現原始分析。

## 2. GitHub Repository

[PaperLens 原始碼](https://github.com/YCHjam/paperlens-methods)

## 3. 網頁成果

[PaperLens 網站](https://ychjam.github.io/paperlens-methods/)

[首篇論文方法學分析](https://ychjam.github.io/paperlens-methods/paper.html?id=2016-cold-shower-rct)

## 4. AGENTS.md

[專案規則文件](https://github.com/YCHjam/paperlens-methods/blob/main/AGENTS.md)

## 5. 如何幫助 AI 持續新增內容？

AGENTS.md 定義專案目的、分類選項、JSON 欄位、八個分析區塊、方法表格格式、證據標示、命名規則與公開條件。AI 新增論文時先複製資料範本，依規則分類、分析並留下原文定位；使用者確認可發布後更新案例索引，即能沿用相同網頁版型。共用方法詞條與表格列序避免每篇各寫一套規則。

開發者可執行檢查與測試，驗證資料結構、分類選項、證據引用與公開門檻；推送 main 後 GitHub Actions 自動檢查及部署。如此可持續累積不同設計的論文案例與方法知識。

發布狀態：2026-11-16 已成功部署，首頁、分析頁與方法小辭典均已實際開啟驗證。繳交時請填妥標題的學校、學號、系級與姓名。
