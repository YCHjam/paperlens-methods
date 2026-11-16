# 本機驗證紀錄

日期：2026-11-16。以下先列最新發布結果，再保留建置過程的歷史紀錄。

## 最新發布結果

- Repository：https://github.com/YCHjam/paperlens-methods（public）。
- 公開網站：https://ychjam.github.io/paperlens-methods/
- 首次部署成功：[GitHub Actions #43876680928](https://github.com/YCHjam/paperlens-methods/actions/runs/43876680928)，來源 commit 80169b1528f6eae5b2836c5621165a6e991b9459。
- 公開版已實際驗證：首頁顯示一篇案例；勾選不相符的世代研究後變成零篇，清除後回復一篇。
- 論文頁顯示七張方法表格；頁內證據錨點缺失數為零，Table 2 證據跳轉正常。
- 小辭典搜尋「負二項」取得一個詞條並可連回案例；觀察到的瀏覽器 error／warn 紀錄為空。
- 首頁、分析頁、小辭典與 AGENTS.md 的公開 HTTP 回應皆為 200。
- 七項合成測試、本機資料檢查與遠端檢查通過；不把測試通過當成研究內容的全面驗證。
- 個人原始資料、論文 HTML／圖檔及 local 審閱檔未提交。使用者發布確認範圍見 release-confirmation.md。
- 仍未完成：第二篇真實案例延伸示範、完整 JSON Schema、全部附件及原始資料重現。沒有第三方獨立科學審核。

## 以下為發布前歷史紀錄

## 已執行

- node scripts/check.mjs：JavaScript 語法、本機連結、範本狀態、公開案例與詞條一致性檢查。
- node --test tests/core.test.mjs：組合篩選、draft 排除、全文與人工核對門檻、證據引用、unknown 分類、安全 URL／id，以及格式不良輸入處理。
- 瀏覽器確認首頁、勾選世代／回溯條件、條件標籤、清除條件、方法小辭典及缺少案例的分析頁提示。
- 375px 與 1280px viewport：documentElement.scrollWidth 與 clientWidth 相等，未見水平溢出。截圖已目視檢查首頁。
- 方法小辭典頁的瀏覽器 error／warn 紀錄為空。

## 當時尚未驗證／完成（歷史）

- 目前公開案例 0、真實 draft 案例 1、方法詞條 7；已完成草稿資料結構與引用檢查，公開首頁仍不顯示草稿。尚未驗證正式公開案例在首頁的全部操作。
- AI 已對照首篇主文 HTML、Table 2 圖像及 2018 勘誤；這不是使用者人工審閱，未重跑原始資料，也尚無第二篇案例延伸示範。
- 完整 JSON Schema 尚未建立；現有程式做專案必要的結構與語意檢查，不代表全面內容驗證。
- GitHub Repository 與 Pages 尚未建立／部署，工作流程只完成原始碼準備。
- 沒有第三方獨立審查，不建立 approval marker。

## 當時下一步（歷史）

交由使用者核對現有的首篇 draft 分析；完成核對後才更新審閱紀錄、加入公開案例索引，並重新驗證與發布。


## 首篇真實案例草稿（2026-11-16）

- Buijze et al., PLOS ONE 2016，doi:10.1371/journal.pone.0161749；勘誤 doi:10.1371/journal.pone.0201978。
- 分類：RCT；時間方向依流程推論為前瞻性；目的為介入效果問題。
- 七張方法卡片、十三處證據定位；HTML 來源沒有固定頁碼，使用章節與段落定位。
- 審閱輸出在 local/reviews/，供使用者核對；草稿狀態未改為 reviewed／published，公開索引未加入該 id。
- 已區分作者明述、分析者推論與已讀範圍內未見說明；附件、登錄歷史、原始資料與模型重現尚未完成。

- 本機審閱 HTML 已於瀏覽器檢查：方法卡片顯示、Table 2 證據連結跳轉與草稿警示正常；375px viewport 的 scrollWidth 等於 clientWidth，未見水平溢出。

## 方法表格改版（2026-11-16）

- 每個方法改用兩欄語意化表格，共九個固定閱讀面向；正式分析頁、本機審閱 HTML 與 Markdown 共用 method-layout.js 列序。
- 瀏覽器確認七張表格各有九列；所有頁內證據連結均有對應錨點。
- 375px 手機與 1280px 桌面 viewport 未出現整頁水平溢出；已目視檢查手機表格的換行及標籤。
- 本次為呈現方式調整；案例維持 draft/pending，沒有加入公開索引。


## 第二篇延伸驗證（本機，2026-11-16）

已依規則新增 2025-vap-mortality-ml 的 draft/pending 草稿。十二張表格各九列、十五筆證據與全部頁內錨點已檢查；兩個既有詞條重用、十個新詞條合併後共十七個，十二組卡片通識均與詞條相符。七項既有測試與真實草稿的發布門檻檢查通過。完整紀錄見 second-case-workflow.md。未修改版型或資料契約，尚未將第二篇加入公開索引，也未更新遠端網站。

## 第二篇發布前驗證 2026-11-16

使用者授權更新網站後，兩篇資料均通過發布門檻，check 回報 2 public papers、17 dictionary entries；七項測試全數通過，build 僅包含兩篇公開案例並排除 local/。新增第二篇沒有修改共用 HTML、CSS、JavaScript 或 schema。

## 第二篇公開部署驗證

2026-11-16，commit 58bb0235231297bc0a61094ef95ed6e4e885e51e 的 GitHub Actions run 43881974679 已成功。實際公開首頁顯示共 2 篇，第二篇網址可開啟且呈現 12 張方法表格。方法小辭典資料共 17 個詞條。
