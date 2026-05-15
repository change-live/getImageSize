import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Tag } from "primereact/tag";
import { Toolbar } from "primereact/toolbar";
import { useTheme } from "./hooks/useTheme";
import "./App.scss";

// ── constants ──────────────────────────────────────────

const FORMAT_OPTIONS = [
  { label: "SVG (Vector)", value: "svg" },
  { label: "PNG (Lossless)", value: "png" },
  { label: "JPG (Photo)", value: "jpg" },
  { label: "WebP (Modern)", value: "webp" },
];

const LANGUAGES = [
  { label: "繁中", value: "zh-TW" },
  { label: "EN", value: "en" },
];

// ── art helpers ────────────────────────────────────────

function getArtData(w: number, h: number) {
  const hue = Math.random() * 360;
  return {
    shapes: Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (0.2 + Math.random() * 0.3) * w,
      c: `hsla(${(hue + i * 45) % 360}, 70%, 65%, 0.4)`,
    })),
  };
}

function generateSVGString(w: number, h: number): string {
  const { shapes } = getArtData(w, h);
  const circles = shapes
    .map((s) => `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="${s.c}"/>`)
    .join("");
  const fs = Math.floor(w / 6.5);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<rect width="100%" height="100%" fill="#ffffff"/>` +
    circles +
    `<text x="50%" y="50%" fill="rgba(0,0,0,0.8)" font-size="${fs}" ` +
    `font-family="Arial Black,sans-serif" font-weight="900" ` +
    `text-anchor="middle" dominant-baseline="central">${w}x${h}</text>` +
    `</svg>`
  );
}

function generateCanvasDataUrl(w: number, h: number, fmt: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const { shapes } = getArtData(w, h);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  shapes.forEach((s) => {
    ctx.fillStyle = s.c;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  const fs = Math.floor(w / 6.5);
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.font = `900 ${fs}px "Arial Black",sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${w}x${h}`, w / 2, h / 2);
  const mime = fmt === "jpg" ? "image/jpeg" : `image/${fmt}`;
  return canvas.toDataURL(mime, 0.95);
}

// ── App ────────────────────────────────────────────────

export default function App() {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [specs, setSpecs] = useState<string | null>(null);

  const downloadRef = useRef<HTMLAnchorElement>(null);

  const isReady = width != null && height != null && format != null;

  const handleGenerate = () => {
    if (!isReady) return;
    let url: string;
    if (format === "svg") {
      url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateSVGString(width, height))}`;
    } else {
      url = generateCanvasDataUrl(width, height, format);
    }
    setPreviewUrl(url);
    setSpecs(t("specs", { width, height, format: format.toUpperCase() }));
  };

  const handleDownload = () => {
    if (!previewUrl || !isReady || !downloadRef.current) return;
    downloadRef.current.href = previewUrl;
    downloadRef.current.download = `img_${width}x${height}.${format}`;
    downloadRef.current.click();
  };

  // ── Toolbar slots ──────────────────────────────────

  const toolbarStart = (
    <div className="toolbar-cluster toolbar-cluster-start">
      <InputNumber
        inputId="input-width"
        value={width}
        onValueChange={(e) => setWidth(e.value ?? null)}
        showButtons
        step={50}
        min={10}
        placeholder={t("width")}
        aria-label={t("width")}
        className="toolbar-field toolbar-field-number"
        inputStyle={{ width: "88px" }}
      />

      <InputNumber
        inputId="input-height"
        value={height}
        onValueChange={(e) => setHeight(e.value ?? null)}
        showButtons
        step={50}
        min={10}
        placeholder={t("height")}
        aria-label={t("height")}
        className="toolbar-field toolbar-field-number"
        inputStyle={{ width: "88px" }}
      />

      <Dropdown
        inputId="input-format"
        value={format}
        options={FORMAT_OPTIONS}
        onChange={(e) => setFormat(e.value)}
        placeholder={t("format")}
        ariaLabel={t("format")}
        className="toolbar-field toolbar-field-format"
        style={{ width: "190px" }}
      />
    </div>
  );

  const toolbarEnd = (
    <div className="toolbar-cluster toolbar-cluster-end">
      <Button
        label={t("generate")}
        icon="pi pi-sync"
        onClick={handleGenerate}
        disabled={!isReady}
        aria-label={t("generate")}
        size="small"
        raised
      />
      <Button
        label={t("download")}
        icon="pi pi-download"
        severity="secondary"
        onClick={handleDownload}
        disabled={!previewUrl}
        aria-label={t("download")}
        size="small"
        outlined
      />
      <div className="toolbar-tools">
        <Button
          icon={isDark ? "pi pi-sun" : "pi pi-moon"}
          severity="secondary"
          text
          size="small"
          rounded
          onClick={toggleTheme}
          aria-label={isDark ? t("switchToLight") : t("switchToDark")}
          tooltip={isDark ? t("switchToLight") : t("switchToDark")}
          tooltipOptions={{ position: "bottom" }}
        />
        <Dropdown
          value={i18n.language}
          options={LANGUAGES}
          onChange={(e) => i18n.changeLanguage(e.value)}
          ariaLabel={t("language")}
          style={{ width: "112px" }}
        />
      </div>
    </div>
  );

  // ── Card content ───────────────────────────────────

  const cardContent = previewUrl ? (
    <img
      src={previewUrl}
      alt={specs ?? ""}
      style={{ display: "block", maxWidth: "80vw", maxHeight: "60vh" }}
    />
  ) : (
    <div className="preview-placeholder" role="img" aria-label={t("noImage")}>
      <i
        className="pi pi-image text-4xl mb-3"
        style={{ color: "var(--text-color-secondary)" }}
        aria-hidden="true"
      />
      <span>{t("noImage")}</span>
    </div>
  );

  const cardFooter = (
    <div
      className="flex justify-content-center"
      role="status"
      aria-live="polite"
    >
      <Tag
        value={specs ?? t("ready")}
        severity={specs ? "info" : undefined}
        rounded
      />
    </div>
  );

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t("skipToContent")}
      </a>

      <h1 className="sr-only">{t("appTitle")}</h1>

      <Toolbar start={toolbarStart} end={toolbarEnd} className="app-toolbar" />

      <main id="main-content" className="app-content" tabIndex={-1}>
        <Card footer={cardFooter} className="preview-card">
          {cardContent}
        </Card>
      </main>

      <a ref={downloadRef} style={{ display: "none" }} aria-hidden />
    </>
  );
}
