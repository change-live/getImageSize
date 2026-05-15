import { useEffect, useState } from "react";
import lightThemeUrl from "primereact/resources/themes/lara-light-cyan/theme.css?url";
import darkThemeUrl from "primereact/resources/themes/lara-dark-cyan/theme.css?url";

const THEME_LINK_ID = "primereact-theme";

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
  const [isDark, setIsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    applyTheme(isDark ? darkThemeUrl : lightThemeUrl);
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return { isDark, toggleTheme: () => setIsDark((d) => !d) };
}
