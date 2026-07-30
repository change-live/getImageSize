import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useSEO() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // 1. Update HTML lang attribute
    const currentLang = i18n.language || "zh-TW";
    document.documentElement.setAttribute("lang", currentLang);

    // 2. Update Title
    const title = t("seoTitle");
    document.title = title;

    // 3. Update Meta Description
    const description = t("seoDescription");
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    // 4. Update Meta Keywords
    const keywords = t("seoKeywords");
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", keywords);

    // 5. Update Open Graph Meta Tags
    const updateOGMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateOGMeta("og:title", title);
    updateOGMeta("og:description", description);

    // 6. Update Twitter Card Meta Tags
    const updateTwitterMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateTwitterMeta("twitter:title", title);
    updateTwitterMeta("twitter:description", description);
  }, [t, i18n.language]);
}
