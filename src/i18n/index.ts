import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "zh-TW": {
    translation: {
      appTitle: "圖片生成器",
      seoTitle: "圖片生成器 | 佔位圖片快速生成與下載工具",
      seoDescription: "一款現代化、響應式的佔位圖片生成工具。支援自訂尺寸、多種圖片格式（SVG, PNG, JPG, WebP）、外部圖庫來源（Picsum, LoremFlickr, Unsplash），以及豐富的濾鏡特效（灰階, 模糊），為開發者與設計師提供快速便利的測試圖片生成。",
      seoKeywords: "圖片生成器, 佔位圖片, 圖片尺寸, 隨機圖片, Picsum, Unsplash, LoremFlickr, WebP, SVG, PNG, JPG, 圖片編輯, 網頁開發工具, 圖片下載",
      width: "寬度",
      height: "高度",
      format: "格式",
      imageSource: "圖片來源",
      imageSourceGeometry: "幾何圖片",
      imageSourcePicsum: "外部圖片 (Picsum)",
      imageSourceLoremFlickr: "外部圖片 (LoremFlickr)",
      imageSourceUnsplash: "外部圖片 (Unsplash)",
      errorUnsplashKeyMissing: "未設定 Unsplash 存取金鑰，請參閱說明在 GitHub Secrets 或 .env.local 中設定 VITE_UNSPLASH_ACCESS_KEY",
      errorUnsplashFailed: "從 Unsplash API 獲取隨機圖片失敗，請檢查金鑰與網路連線",
      grayscale: "灰階",
      grayscaleOnLabel: "灰階開啟（黑白）",
      grayscaleOffLabel: "灰階關閉（彩色）",
      blur: "模糊",
      blurNone: "無",
      blurNoneLabel: "無模糊（0）",
      blurLevelLabel: "模糊等級 {{level}}",
      on: "開",
      off: "關",
      none: "無",
      generate: "重新生成",
      download: "下載檔案",
      language: "語言",
      theme: "主題",
      switchToLight: "切換到淺色模式",
      switchToDark: "切換到深色模式",
      skipToContent: "跳到主要內容",
      expandSettings: "展開設定",
      collapseSettings: "收起設定",
      noImage: "尚未生成圖片",
      loadingImage: "外部圖片載入中...",
      ready: "READY",
      specs:
        "規格：{{width}} × {{height}} · {{format}} · {{source}} · 效果: {{effects}}",
      errorExternalSizeExceeded: "外部圖片尺寸最大僅支援到 5000×5000",
    },
  },
  en: {
    translation: {
      appTitle: "Image Generator",
      seoTitle: "Image Generator | Fast Placeholder Image Tool & Downloader",
      seoDescription: "A modern and responsive placeholder image generator. Supports custom sizes, multiple formats (SVG, PNG, JPG, WebP), external image libraries (Picsum, LoremFlickr, Unsplash), and rich filter effects like grayscale and blur, perfect for developer and designer placeholders.",
      seoKeywords: "image generator, placeholder image, image size, random image, Picsum, Unsplash, LoremFlickr, WebP, SVG, PNG, JPG, image editor, developer tools, download image",
      width: "Width",
      height: "Height",
      format: "Format",
      imageSource: "Image source",
      imageSourceGeometry: "Geometry",
      imageSourcePicsum: "External (Picsum)",
      imageSourceLoremFlickr: "External (LoremFlickr)",
      imageSourceUnsplash: "External (Unsplash)",
      errorUnsplashKeyMissing: "Unsplash Access Key is not configured. Please set VITE_UNSPLASH_ACCESS_KEY in GitHub Repository Secrets or .env.local",
      errorUnsplashFailed: "Failed to fetch a random image from Unsplash. Please check your Access Key and connection",
      grayscale: "Grayscale",
      grayscaleOnLabel: "Enabled (black and white)",
      grayscaleOffLabel: "Disabled (color)",
      blur: "Blur",
      blurNone: "None",
      blurNoneLabel: "No blur (0)",
      blurLevelLabel: "Blur level {{level}}",
      on: "On",
      off: "Off",
      none: "None",
      generate: "Generate",
      download: "Download",
      language: "Language",
      theme: "Theme",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode",
      skipToContent: "Skip to main content",
      expandSettings: "Expand Settings",
      collapseSettings: "Collapse Settings",
      noImage: "No image generated yet",
      loadingImage: "Loading external image...",
      ready: "READY",
      specs:
        "SPECS: {{width}} × {{height}} · {{format}} · {{source}} · FX: {{effects}}",
      errorExternalSizeExceeded: "External images support a maximum size of 5000×5000",
    },
  },
};

const savedLanguage = localStorage.getItem("app-language") || "zh-TW";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("app-language", lng);
});

export default i18n;
