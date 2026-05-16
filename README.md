# 圖片生成器 · Image Generator

一款現代化、響應式的佔位圖片生成工具。支援自訂尺寸、多種圖片格式、外部圖庫來源，以及豐富的濾鏡特效。

## ✨ 核心功能

- **🎨 自訂生成規格**
  - **尺寸控制**：自由設定寬度與高度（支援 ±50 快捷步進）。
  - **多格式輸出**：支援 SVG、PNG、JPG、WebP 格式，一鍵快速下載。
- **🖼️ 圖片來源切換**
  - **幾何圖片 (Geometry)**：純色極簡的佔位圖片。
  - **外部圖庫 (Picsum / LoremFlickr)**：動態載入真實的攝影照片（僅支援 JPG / WebP）。
- **🪄 視覺特效 (FX)**
  - **灰階 (Grayscale)**：支援一鍵將照片轉換為黑白。
  - **模糊 (Blur)**：提供 0~10 級的模糊效果調整。
- **⚙️ 現代化 UI 與體驗**
  - **動態主題切換**：內建 5 款 PrimeReact 主題（Lara Cyan, Indigo, Green, Blue, MD Indigo）。
  - **深色模式 (Dark Mode)**：自由切換淺色與深色外觀。
  - **多語系支援**：內建繁體中文與 English。
  - **偏好記憶 (Persistence)**：您的主題、深色模式與語言偏好將自動儲存於瀏覽器 `localStorage`，下次造訪無需重新設定。
  - **完美 RWD**：為手機與小螢幕最佳化的圖示彈出選單 (Icon Popup Menu) 設計，操作不擁擠。

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

## 🚀 開發指南

```bash
# 安裝依賴套件
pnpm install

# 啟動本地開發伺服器
pnpm dev

# 專案建置與打包
pnpm build

# 預覽打包結果
pnpm preview
```

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
