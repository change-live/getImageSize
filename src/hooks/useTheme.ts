import { useEffect, useState } from "react";

const THEME_LINK_ID = "primereact-theme";

const THEMES: Record<string, { light: () => Promise<{ default: string }>; dark: () => Promise<{ default: string }> }> = {
  // Lara Modern
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
  "lara-purple": {
    light: () => import("primereact/resources/themes/lara-light-purple/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-purple/theme.css?url"),
  },
  "lara-teal": {
    light: () => import("primereact/resources/themes/lara-light-teal/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-teal/theme.css?url"),
  },
  "lara-pink": {
    light: () => import("primereact/resources/themes/lara-light-pink/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-pink/theme.css?url"),
  },
  "lara-amber": {
    light: () => import("primereact/resources/themes/lara-light-amber/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-amber/theme.css?url"),
  },

  // Material Design (MD)
  "md-indigo": {
    light: () => import("primereact/resources/themes/md-light-indigo/theme.css?url"),
    dark: () => import("primereact/resources/themes/md-dark-indigo/theme.css?url"),
  },
  "md-deeppurple": {
    light: () => import("primereact/resources/themes/md-light-deeppurple/theme.css?url"),
    dark: () => import("primereact/resources/themes/md-dark-deeppurple/theme.css?url"),
  },

  // Material Design Components (MDC)
  "mdc-indigo": {
    light: () => import("primereact/resources/themes/mdc-light-indigo/theme.css?url"),
    dark: () => import("primereact/resources/themes/mdc-dark-indigo/theme.css?url"),
  },
  "mdc-deeppurple": {
    light: () => import("primereact/resources/themes/mdc-light-deeppurple/theme.css?url"),
    dark: () => import("primereact/resources/themes/mdc-dark-deeppurple/theme.css?url"),
  },

  // Bootstrap 4
  "bootstrap4-blue": {
    light: () => import("primereact/resources/themes/bootstrap4-light-blue/theme.css?url"),
    dark: () => import("primereact/resources/themes/bootstrap4-dark-blue/theme.css?url"),
  },
  "bootstrap4-purple": {
    light: () => import("primereact/resources/themes/bootstrap4-light-purple/theme.css?url"),
    dark: () => import("primereact/resources/themes/bootstrap4-dark-purple/theme.css?url"),
  },

  // Designer Premium
  "soho": {
    light: () => import("primereact/resources/themes/soho-light/theme.css?url"),
    dark: () => import("primereact/resources/themes/soho-dark/theme.css?url"),
  },
  "viva": {
    light: () => import("primereact/resources/themes/viva-light/theme.css?url"),
    dark: () => import("primereact/resources/themes/viva-dark/theme.css?url"),
  },
  "mira": {
    light: () => import("primereact/resources/themes/mira/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-cyan/theme.css?url"),
  },
  "nano": {
    light: () => import("primereact/resources/themes/nano/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-cyan/theme.css?url"),
  },
  "rhea": {
    light: () => import("primereact/resources/themes/rhea/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-indigo/theme.css?url"),
  },
  "nova": {
    light: () => import("primereact/resources/themes/nova/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-blue/theme.css?url"),
  },
  "nova-accent": {
    light: () => import("primereact/resources/themes/nova-accent/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-blue/theme.css?url"),
  },
  "nova-alt": {
    light: () => import("primereact/resources/themes/nova-alt/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-blue/theme.css?url"),
  },

  // Frameworks
  "tailwind": {
    light: () => import("primereact/resources/themes/tailwind-light/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-blue/theme.css?url"),
  },
  "fluent": {
    light: () => import("primereact/resources/themes/fluent-light/theme.css?url"),
    dark: () => import("primereact/resources/themes/lara-dark-blue/theme.css?url"),
  },

  // Classic Saga & Vela
  "classic-blue": {
    light: () => import("primereact/resources/themes/saga-blue/theme.css?url"),
    dark: () => import("primereact/resources/themes/vela-blue/theme.css?url"),
  },
  "classic-green": {
    light: () => import("primereact/resources/themes/saga-green/theme.css?url"),
    dark: () => import("primereact/resources/themes/vela-green/theme.css?url"),
  },
  "classic-orange": {
    light: () => import("primereact/resources/themes/saga-orange/theme.css?url"),
    dark: () => import("primereact/resources/themes/vela-orange/theme.css?url"),
  },
  "classic-purple": {
    light: () => import("primereact/resources/themes/saga-purple/theme.css?url"),
    dark: () => import("primereact/resources/themes/vela-purple/theme.css?url"),
  },

  // Classic Arya (Pure Dark Black) - Paired with Saga Light
  "arya-blue": {
    light: () => import("primereact/resources/themes/saga-blue/theme.css?url"),
    dark: () => import("primereact/resources/themes/arya-blue/theme.css?url"),
  },
  "arya-green": {
    light: () => import("primereact/resources/themes/saga-green/theme.css?url"),
    dark: () => import("primereact/resources/themes/arya-green/theme.css?url"),
  },
  "arya-orange": {
    light: () => import("primereact/resources/themes/saga-orange/theme.css?url"),
    dark: () => import("primereact/resources/themes/arya-orange/theme.css?url"),
  },
  "arya-purple": {
    light: () => import("primereact/resources/themes/saga-purple/theme.css?url"),
    dark: () => import("primereact/resources/themes/arya-purple/theme.css?url"),
  },

  // Luna (Dark only, paired with Lara Light)
  "luna-amber": {
    light: () => import("primereact/resources/themes/lara-light-amber/theme.css?url"),
    dark: () => import("primereact/resources/themes/luna-amber/theme.css?url"),
  },
  "luna-blue": {
    light: () => import("primereact/resources/themes/lara-light-blue/theme.css?url"),
    dark: () => import("primereact/resources/themes/luna-blue/theme.css?url"),
  },
  "luna-green": {
    light: () => import("primereact/resources/themes/lara-light-green/theme.css?url"),
    dark: () => import("primereact/resources/themes/luna-green/theme.css?url"),
  },
  "luna-pink": {
    light: () => import("primereact/resources/themes/lara-light-pink/theme.css?url"),
    dark: () => import("primereact/resources/themes/luna-pink/theme.css?url"),
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
