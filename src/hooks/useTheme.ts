import { useEffect, useState } from "react";

const THEME_LINK_ID = "primereact-theme";

const THEMES: Record<string, { light: () => Promise<{ default: string }>; dark: () => Promise<{ default: string }> }> = {
  "lara-cyan": {
    light: () => import("primereact/resources/themes/lara-light-cyan/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-cyan/theme.css?url"),
  },
  "lara-indigo": {
    light: () => import("primereact/resources/themes/lara-light-indigo/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-indigo/theme.css?url"),
  },
  "lara-green": {
    light: () => import("primereact/resources/themes/lara-light-green/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-green/theme.css?url"),
  },
  "lara-blue": {
    light: () => import("primereact/resources/themes/lara-light-blue/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-blue/theme.css?url"),
  },
  "md-indigo": {
    light: () => import("primereact/resources/themes/md-light-indigo/theme.css?url"),
    dark: () => import("primereact/resources/themes/md-dark-indigo/theme.css?url"),
  },
};

function applyTheme(href: string) {
  let link = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = THEME_LINK_ID;
    link.rel = "stylesheet";
    document.head.prepend(link);
  }
  link.href = href;
}

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("app-dark-mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [themeName, setThemeName] = useState<string>(() => {
    return localStorage.getItem("app-theme") || "lara-cyan";
  });

  useEffect(() => {
    localStorage.setItem("app-dark-mode", String(isDark));
    localStorage.setItem("app-theme", themeName);
  }, [isDark, themeName]);

  useEffect(() => {
    let mounted = true;
    const themeConfig = THEMES[themeName] || THEMES["lara-cyan"];
    const loader = isDark ? themeConfig.dark : themeConfig.light;
    
    loader().then((module) => {
      if (mounted) {
        applyTheme(module.default);
      }
    });

    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );

    return () => {
      mounted = false;
    };
  }, [isDark, themeName]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return { 
    isDark, 
    toggleTheme: () => setIsDark((d) => !d),
    themeName,
    setThemeName
  };
}
