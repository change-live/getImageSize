import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "zh-TW": {
    translation: {
      appTitle: "圖片生成器",
      width: "寬度",
      height: "高度",
      format: "格式",
      generate: "重新生成",
      download: "下載檔案",
      language: "語言",
      switchToLight: "切換到淺色模式",
      switchToDark: "切換到深色模式",
      skipToContent: "跳到主要內容",
      noImage: "尚未生成圖片",
      ready: "READY",
      specs: "規格：{{width}} × {{height}} · {{format}}",
    },
  },
  en: {
    translation: {
      appTitle: "Image Generator",
      width: "Width",
      height: "Height",
      format: "Format",
      generate: "Generate",
      download: "Download",
      language: "Language",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode",
      skipToContent: "Skip to main content",
      noImage: "No image generated yet",
      ready: "READY",
      specs: "SPECS: {{width}} × {{height}} · {{format}}",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "zh-TW",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
