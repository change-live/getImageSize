# 圖片生成器 · Image Generator

一款現代化、響應式的佔位圖片生成工具。支援自訂尺寸、多種圖片格式、外部圖庫來源，以及豐富的濾鏡特效。

## ✨ 核心功能

- **🎨 自訂生成規格**
  - **尺寸控制**：自由設定寬度與高度（支援 ±50 快捷步進）。
  - **多格式輸出**：支援 SVG、PNG、JPG、WebP 格式，一鍵快速下載。
- **🖼️ 圖片來源切換**
  - **幾何圖片 (Geometry)**：純色極簡的佔位圖片。
  - **外部圖庫 (Picsum / LoremFlickr / Unsplash)**：動態載入真實的攝影照片（僅支援 JPG / WebP）。
  - **Unsplash 官方規範合規**：完整實作官方要求的下載追蹤（Download Location Trigger），並為攝影師提供高質感的磨砂玻璃微透名片標籤與版權屬名連結。
- **🪄 視覺特效 (FX)**
  - **灰階 (Grayscale)**：支援一鍵將照片轉換為黑白。
  - **模糊 (Blur)**：提供 0~10 級的模糊效果調整。
- **⚙️ 現代化 UI 與體驗**
  - **動態主題切換**：內建 **56 款** PrimeReact 全套經典與精品主題，涵蓋 Lara 現代版、Material Design、Bootstrap 4、經典 Saga & Vela 以及 Arya 純黑系列。
  - **智慧亮暗色配對 (Smart Style Pairing)**：為每一款主題進行專屬亮/暗色調對稱配對，在單色主題（如 Tailwind、Fluent）下提供智慧 fallback，確保亮暗色切換體驗順暢。
  - **精美對話框主題選單 (Theme Dialog Modal)**：淘汰舊版下拉選單，全面改用精美的毛玻璃彈出對話框及卡片網格佈局（Theme Grid Card Layout），選中狀態高亮並帶有精美勾選圈圈。
  - **深色模式 (Dark Mode)**：自由切換淺色與深色外觀。
  - **多語系支援**：內建繁體中文與 English。
  - **偏好記憶 (Persistence)**：您的主題、深色模式與語言偏好將自動儲存於瀏覽器 `localStorage`，下次造訪無需重新設定。
  - **完美 RWD 與行動版智慧收合**：網頁使用 Flexbox 高彈性滿版佈局，桌面版 100% 貼合視窗（無任何多餘網頁捲軸）。手機行動版（寬度 <= 768px）工具列將**智慧收合為極簡列**，預設隱藏所有文字與解析度標籤以完整展示預覽圖片，並於右側保留「重新生成」、「下載檔案」和「展開設定」便捷動作按鈕。展開面板以流暢的滑動動畫呈現，在小螢幕下（<480px）對話框亦自動切換為雙欄網格卡片，便於大拇指單手操作。

## 🛠️ 技術棧

| 分類     | 套件                                     |
| -------- | ---------------------------------------- |
| **框架** | React 19 + TypeScript                    |
| **建置** | Vite 8                                   |
| **狀態** | Zustand 5                                |
| **UI**   | PrimeReact 10 + PrimeFlex 3 + PrimeIcons |
| **樣式** | SCSS (Sass)                              |
| **語系** | i18next + react-i18next                  |
| **路由** | react-router-dom                         |

## 🚀 開發與本地運作指南

本專案使用 `pnpm` 作為套件管理工具，並透過 Vite 進行極速建置。

### 環境要求
- Node.js >= 22 (LTS)
- pnpm >= 11

### 啟動步驟
1. **安裝依賴套件**
   由於 pnpm v11 具有預設的供應鏈安全審核政策（Minimum Release Age 與 Ignored Builds），安裝時請執行：
   ```bash
   pnpm install
   ```
   *備註：若遇到被忽略的構建腳本警告（如 `@parcel/watcher`），本專案已在 `pnpm-workspace.yaml` 中配置好白名單放行（allowBuilds），以保證安裝能一次通過且安全無虞。*

2. **啟動本地開發伺服器**
   專案已於 `vite.config.ts` 中指定在 `http://localhost:3000/` 啟動服務。
   ```bash
   pnpm dev
   ```
   *備註：若您的 Node.js 版本低於 v22.13 (如 Node v20.x)，可能會因為 `pnpm@11` 內部依賴 `node:sqlite` 而導致 `pnpm dev` 報錯啟動失敗。此時請改用以下任一相容指令啟動：*
   ```bash
   # 選項 A：改用 npm 啟動（最簡單無痛 🚀）
   npm run dev

   # 選項 B：使用 npx 執行相容的 pnpm@9 版本
   npx pnpm@9 dev
   ```

3. **專案建置與打包**
   執行 TypeScript 型別檢查並打包出可用於 Production 的靜態檔案。
   ```bash
   pnpm build
   ```

4. **預覽打包結果**
   在本地端模擬 Production 環境預覽。
   ```bash
   pnpm preview
   ```

## 🔑 Unsplash API 金鑰設定 (API Key Setup)

為使「外部圖片 (Unsplash)」來源能正常連線載入並合規下載，需要設定 Unsplash API Access Key：

### 1. 本地開發設定
在專案根目錄下建立 `.env.local` 檔案（此檔案已被 `.gitignore` 排除，保證金鑰不外洩），並填入：
```env
VITE_UNSPLASH_ACCESS_KEY=你的_UNSPLASH_ACCESS_KEY
```

### 2. GitHub Pages 生產環境部署設定
為使線上網頁自動擁有金鑰，請依據以下步驟設定：
1. 進入您 GitHub Repository 頂部的 **Settings**。
2. 點選左側選單中的 **Secrets and variables** → **Actions**。
3. 點選右側綠色按鈕 **New repository secret**。
4. 填入以下資料：
   - **Name**: `UNSPLASH_ACCESS_KEY`
   - **Value**: `你的_UNSPLASH_ACCESS_KEY` *(請特別注意大小寫，若大小寫錯誤會導致 Unsplash 載入時發生 401 錯誤)*
5. 設定完成後，每當您推送程式碼至 `main` 分支，GitHub Actions 會在 Build 階段自動將此金鑰編譯注入到線上靜態資源中！

---

## 📦 部署到 GitHub Pages

本專案已設定妥善的自動部署工作流。

### 設定步驟：
1. 將專案推送到 GitHub，預設分支使用 `main`。
2. 進入 GitHub Repository 的 `Settings` → `Pages`。
3. `Source` 選擇 `GitHub Actions`。
4. 此後每次 `git push` 到 `main` 分支，都會自動觸發建置並發佈。

### 網址格式：
- `https://<你的帳號>.github.io/<repo-name>/`
- 例如：`https://change-live.github.io/getImageSize/`

### 本機模擬 GitHub Pages 建置：
```bash
# 以相對路徑 base 進行打包
pnpm build:gh

# 預覽打包結果
pnpm preview:gh
```
