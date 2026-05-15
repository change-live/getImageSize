import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "zh-TW": {
    translation: {
      width: "寬度",
      height: "高度",
      format: "格式",
      generate: "重新生成",
      download: "下載檔案",
      noImage: "尚未生成圖片",
      ready: "READY",
      specs: "規格：{{width}} × {{height}} · {{format}}",
    },
  },
  en: {
    translation: {
      width: "Width",
      height: "Height",
      format: "Format",
      generate: "Generate",
      download: "Download",
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
