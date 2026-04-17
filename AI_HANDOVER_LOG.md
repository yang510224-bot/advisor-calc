# 專業財務顧問計算機 - AI 接手與開發日誌 (AI Handover Memo)

## 📌 專案概述
- **專案名稱**：`advisor-calc` (專業財務顧問計算機)
- **專案定位**：這是一套「獨立於客戶現金流規劃機 (financial-planner)」的**重武裝顧問展示版**。主要目的在於量化展示四大財務工程：銀行定額VS投資型定額、單筆保單滾存、獨立貸款試算、以及最強大的「信貸借款套利配息轉滾存」決算。
- **技術架構**：React + Next.js (App Router), Vanilla CSS。所有計算邏輯都集中在 `src/utils/calculations.js`。畫面集中在 `src/app/page.js`。

## 📅 目前已完成里程碑 (2026/04/17)
1. **基礎建設**：以 Next.js 完成建置，套用與財務計算機同等質感的全局 `globals.css` 色調與樣式。
2. **精算引擎實裝 (`calculations.js`)**：
   - 包含 `calculateBankSIP` (銀行0成本純複利)。
   - 包含 `calculateAllianzSIP` (投資型定期定額，支援「目標保費」與「超額保費」雙層計算，以及完美植入的十來旺男女危險費率表)。
   - 包含 `calculateChubbLumpSum` (安達大贏家單筆：實作了 0.2%->0% 管理費階梯與高保費免收機制)。
   - 包含 `calculateArbitrage` (套利大決算引擎：算出信貸月付、每月真實淨掏錢，跟配息拿去定額後的終極資產)。
3. **即時互動 UI 介面 (`page.js`)**：綁定了四個頁籤，輸入改動即刻 `useEffect` 觸發全盤更新。

## ⚠️ 給接手 AI 的交接指南與下一步 (Next Steps)
你接手後的下一步：
1. **業務邏輯微調**：客戶可能在試玩後會提出某些特定的費用計算方式要修改（例如安達的超額保費費率、返還趴數調整等），請優先去 `calculations.js` 修改。
2. **介面擴充**：如果要加上「列印成 PDF 或截圖匯出」功能給顧問列印報表，可以在 `page.js` 擴增功能。
3. **佈署紀律**：
   - 目前程式碼已被推上 GitHub Repository (`advisor-calc`)。
   - 同時也綁定在專屬 Vercel 網址 ( `https://advisor-calc-pro.vercel.app` ) 上。
   - **請記住**：如果你改動了程式碼，必須使用 `git commit` 以及 `git push origin main` 推進 Github。若要更換主網域名稱，請確實使用 `npx vercel --prod` 以及 `vercel alias` 指令。

## 💡 開發重點備忘錄
所有的保單危險費率 (`COI`)，目前使用預設的男女查表法，因為安達與安聯的底層都極度接近變額萬能壽險 5/6 回合生命表。如果顧問要求精度提升，請直接替換 `calculations.js` 裡的 `insuranceRates` Json 陣列。

**> 交接完畢，祝好運！**
