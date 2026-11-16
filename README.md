# PaperLens｜研究方法拆解室

以繁體中文拆解論文中的生物統計與機器學習方法，協助讀者理解「方法在做什麼、為什麼用、如何解讀、有哪些限制」。

本專案是「建立自己的 AGENTS.md」課程作業。重點是可延續的規則：每篇論文依同一份內容契約、證據標示與共用版型呈現，讓 AI 能持續新增案例。

## 目前成果

- [AGENTS.md](AGENTS.md)：規則文件 1.5，包含分類、內容、證據、視覺與開發要求。
- [分析指令](prompts/analyze-paper.md)與[資料範本](templates/paper-template.json)：資料契約 2.0。
- [首頁](index.html)：關鍵字搜尋、研究設計／時間方向／研究目的組合篩選、條件移除與清除。
- [共用分析頁](paper.html)：分類依據、八個分析區塊、方法卡片與可跳轉的證據定位。
- [方法小辭典](methods.html)：搜尋、方法類別與相關案例入口。
- 自動資料檢查、合成測試、公開檔案打包與 GitHub Pages 工作流程。

**目前有 1 篇可發布的真實教學案例、7 個方法詞條。** 首篇為 Buijze et al. 2016 的冷水淋浴 RCT（doi:10.1371/journal.pone.0161749），已閱讀主文、Table 2 與 2018 勘誤；未重分析個體資料或核對全部附件。沒有把合成測試資料放進網站。PDF 自動分析、模型 API 與完整 JSON Schema 尚未實作。

Repository：https://github.com/YCHjam/paperlens-methods
公開網站：https://ychjam.github.io/paperlens-methods/

目前為發布準備；部署完成後會更新驗證紀錄。使用者已確認首篇教學案例可發布，不代表原始資料或全部附件已獨立重現驗證。

## 本機使用

需要 Node.js 20 以上；不需安裝第三方套件。Windows 可雙擊根目錄的 start-preview.cmd，或在專案根目錄執行：

~~~powershell
node scripts/serve.mjs
~~~

瀏覽 http://127.0.0.1:4173 。不要直接雙擊 HTML，JSON 載入需要 HTTP。若埠號已使用，可在 PowerShell 設定 $env:PORT = "4174" 後再執行。按 Ctrl+C 停止。

檢查與測試：

~~~powershell
node scripts/check.mjs
node --test tests/core.test.mjs
~~~

通過檢查後打包：

~~~powershell
node scripts/build.mjs
~~~

dist/ 只包含明列的網站檔、規則文件與已公開案例。build 會替換專案內 dist/，不要在該資料夾保存手動修改。原始資料放 local/ 並保持唯讀。

## 首篇案例與本機審閱

正式資料：content/papers/2016-cold-shower-rct.json，已經使用者確認可作為教學案例發布並加入公開索引。local/reviews/ 的審閱檔保留為發布前歷史草稿；正式頁面以 JSON 目前狀態為準。

新案例尚為 draft/pending 時，可重建審閱文件（以下 placeholder 請換成新案例 id；已發布案例不接受此命令）：

~~~powershell
node scripts/render-review.mjs <paper-id>
~~~

輸出位於 local/reviews/2016-cold-shower-rct.html 與同名 .md。HTML 為獨立檔，可直接用瀏覽器開啟，不需要啟動 HTTP。local/ 已排除於 Git 與部署打包；正常網站伺服器也不提供該路徑。修改分析請編輯來源 JSON 再重建，避免只改審閱頁。

審閱重點：分類依據、模型選擇理由、主要終點與效果量、失訪與 ITT、組別合併及附件尚待確認事項。七個方法通識詞條不代表這篇分析已完成人工核對。方法解析已採每個方法一張兩欄表格，固定九個閱讀面向；正式分析頁、本機審閱 HTML 與 Markdown 使用共用列序，保留依據標籤與證據定位。

## 如何新增一篇論文

1. AI 先讀 AGENTS.md，確認全文、附件、權限與分析範圍。
2. 複製範本到 content/papers/<paper-id>.json，保持 draft／pending。
3. 填寫分類、判定理由、八個分析區塊、方法卡片及原文證據。
4. 為每個方法建立或重用 content/methods/index.json 詞條；通識文字、優缺點與引用保持一致。
5. 執行檢查並核對原文；格式檢查不代表內容已驗證。
6. 使用者審閱成果並確認教學案例可發布後，才記錄 reviewed、reviewer、reviewed_at 及實際確認範圍；不得聲稱做過未發生的原始資料或數值驗證。
7. 全文案例符合規則後改為 published，將 id 加入 content/papers/index.json，再重新檢查、測試與部署。

AI 沿用資料契約與共用版型，新增第二篇不必重新寫 HTML。draft 不會在首頁與公開打包中出現；但已提交公開 GitHub Repository 的草稿檔仍可被讀取，不可把 draft 當成隱私保護。

## 文章分類

- 研究設計單選：RCT、非隨機介入、世代、病例對照、橫斷面、病例系列、病例報告、系統性回顧、範疇性回顧、敘述性回顧、其他、資訊不足。
- 時間方向單選：前瞻、回溯、雙向、不適用、未交代／無法判定。
- 研究目的複選：描述、關聯、介入效果／因果問題、診斷準確度、預後或風險預測、方法開發與驗證、證據綜整。
- 方法標籤由卡片產生，分為生物統計、機器學習及證據綜整方法。

分類保留判定依據。RCT 資料的二次分析不自動等於 RCT；統合分析與系統性回顧分開。介面同一面向取 OR、不同面向取 AND，未選代表不限。

## GitHub Pages 部署

工作流程依 [GitHub 官方說明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)建立，尚未在遠端執行。

1. 將專案推送至自己的 GitHub Repository，主要分支使用 main。
2. 在 Repository 的 Settings → Pages，將 Source 設為 GitHub Actions。
3. main 的 push 或手動 workflow_dispatch 會依序檢查、測試、打包，再部署 dist/。Pull request 只檢查與打包，不發布。
4. 確認工作流程成功，實際開啟部署網址後，再更新本檔的 Repository／網站連結。

## 驗證與限制

本次本機檢查與瀏覽器驗證紀錄見 [docs/verification.md](docs/verification.md)。資料門檻測試使用合成案例，不能當作真實論文的來源核對或外部獨立審核。

## 課程繳交前

- [ ] 至少一篇真實全文案例已人工核對。
- [ ] 網站已公開，Repository 與網頁連結可實際開啟。
- [ ] 提供專案簡介、AGENTS.md 與新增內容方式說明。
- [ ] 用第二篇案例驗證延伸性。
- [ ] 標題依「學校 學號 系級 姓名 主題」填寫，個人資料由使用者提供。

分析供學習與批判閱讀使用。不要把未授權全文、API 金鑰、病人資料或個人資料放進公開 Repository。
