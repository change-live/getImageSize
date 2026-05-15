# 圖片生成器 · Image Generator

產生任意尺寸的佔位圖片，支援 SVG / PNG / JPG / WebP 格式，可直接下載使用。

## 功能

- 自訂寬高（可使用 ±50 快捷步進）
- 輸出格式：SVG、PNG、JPG、WebP
- 即時預覽生成結果
- 一鍵下載
- 深色 / 淺色模式切換（跟隨系統或手動切換）
- 多語系：繁體中文 / English

## 技術棧

| 分類     | 套件                                     |
| -------- | ---------------------------------------- |
| 框架     | React 19 + TypeScript 6                  |
| 建置工具 | Vite 8                                   |
| UI 元件  | PrimeReact 10 + PrimeFlex 3 + PrimeIcons |
| 樣式     | SCSS (sass)                              |
| 國際化   | i18next + react-i18next                  |
| 套件管理 | pnpm                                     |

## 開發

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器（port 3000）
pnpm dev

# 建置
pnpm build

# 預覽建置結果
pnpm preview
```

## 路由結構（React Router）

- 已啟用 `react-router-dom`
- 路由入口：`src/router.tsx`
- 目前路由：
  - `/`（首頁，現有圖片工具）
  - `/tools/image-size`（同一工具路由，方便未來整合多工具）
- 若要新增新工具頁，直接在 `src/router.tsx` 增加新 route 即可

## 部署到 GitHub Pages

### 1) 專案前處理（已完成）

- `vite.config.ts` 已加入 `base` 自動判斷
- `package.json` 已加入 `build:gh`
- `.github/workflows/deploy-pages.yml` 已加入自動部署流程

### 2) 你要做的設定

1. 把專案推到 GitHub，預設分支使用 `main`。
2. 到 GitHub Repo 的 `Settings` → `Pages`。
3. `Source` 選 `GitHub Actions`。
4. 之後每次 push 到 `main`，會自動 build 並發佈。

### 3) 網址格式

- Repo Pages 網址為：`https://<你的帳號>.github.io/<repo-name>/`
- 例如 repo 名稱是 `getImageSize`：
  `https://<你的帳號>.github.io/getImageSize/`

### 4) 本機模擬 GitHub Pages 打包

router.tsx # 路由設定

```bash
pnpm build:gh
pnpm preview

      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
