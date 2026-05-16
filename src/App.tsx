import { useTranslation } from "react-i18next";
import { ImageToolbar } from "./components/Toolbar/ImageToolbar";
import { PreviewCard } from "./components/Preview/PreviewCard";
import "./App.scss";

export default function App() {
  const { t } = useTranslation();

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t("skipToContent")}
      </a>

      <h1 className="sr-only">{t("appTitle")}</h1>

      <ImageToolbar />

      <main id="main-content" className="app-content" tabIndex={-1}>
        <PreviewCard />
      </main>
    </>
  );
}
