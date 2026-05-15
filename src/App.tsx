import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Tag } from "primereact/tag";
import { Toolbar } from "primereact/toolbar";
import { DNA } from "react-loader-spinner";
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
  { label: "繁體中文", value: "zh-TW" },
  { label: "EN", value: "en" },
];

const IMAGE_SOURCE_OPTIONS = [
  { labelKey: "imageSourceGeometry", value: "geometry" },
  { labelKey: "imageSourceExternal", value: "external" },
];

function buildPicsumUrl(
  w: number,
  h: number,
  format: "jpg" | "webp",
  grayscale: boolean,
  blurAmount: number,
  seed: string,
): string {
  const params: string[] = [];
  if (grayscale) {
    params.push("grayscale");
  }
  if (blurAmount > 0) {
    params.push(`blur=${blurAmount}`);
  }
  const qs = params.length > 0 ? `?${params.join("&")}` : "";
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}.${format}${qs}`;
}

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
  const [imageSource, setImageSource] = useState<"geometry" | "external">(
    "geometry",
  );
  const [useGrayscale, setUseGrayscale] = useState<boolean>(false);
  const [blurAmount, setBlurAmount] = useState<number>(0);
  const [externalSeed, setExternalSeed] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExternalLoading, setIsExternalLoading] = useState<boolean>(false);
  const [specs, setSpecs] = useState<string | null>(null);

  const downloadRef = useRef<HTMLAnchorElement>(null);

  const isReady = width != null && height != null && format != null;
  const supportsExternalSource = format === "jpg" || format === "webp";
  const previewStageStyle: CSSProperties | undefined =
    width != null && height != null
      ? { aspectRatio: `${width} / ${height}` }
      : undefined;

  const imageSourceOptions = IMAGE_SOURCE_OPTIONS.map((opt) => ({
    label: t(opt.labelKey),
    value: opt.value,
  }));

  const grayscaleOptions = [
    { label: t("grayscaleOffLabel"), value: false },
    { label: t("grayscaleOnLabel"), value: true },
  ];

  const blurOptions = Array.from({ length: 11 }, (_, n) => ({
    label: n === 0 ? t("blurNoneLabel") : t("blurLevelLabel", { level: n }),
    value: n,
  }));

  const handleGenerate = () => {
    if (!isReady) return;
    let url: string;
    if (supportsExternalSource && imageSource === "external") {
      const nextSeed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
      const externalFormat = format as "jpg" | "webp";
      url = buildPicsumUrl(
        width,
        height,
        externalFormat,
        useGrayscale,
        blurAmount,
        nextSeed,
      );
      setExternalSeed(nextSeed);
      setIsExternalLoading(true);
    } else if (format === "svg") {
      url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateSVGString(width, height))}`;
      setExternalSeed(null);
      setIsExternalLoading(false);
    } else {
      url = generateCanvasDataUrl(width, height, format);
      setExternalSeed(null);
      setIsExternalLoading(false);
    }

    const sourceText =
      supportsExternalSource && imageSource === "external"
        ? t("imageSourceExternal")
        : t("imageSourceGeometry");
    const effects: string[] = [];
    if (supportsExternalSource && imageSource === "external") {
      if (useGrayscale) effects.push("grayscale");
      if (blurAmount > 0) effects.push(`blur:${blurAmount}`);
    }

    setPreviewUrl(url);
    setSpecs(
      t("specs", {
        width,
        height,
        format: format.toUpperCase(),
        source: sourceText,
        effects: effects.join(", ") || t("none"),
      }),
    );
  };

  const handleDownload = async () => {
    if (!previewUrl || !isReady || !downloadRef.current || isExternalLoading)
      return;

    const fileName = `img_${width}x${height}.${format}`;

    if (
      supportsExternalSource &&
      imageSource === "external" &&
      externalSeed !== null
    ) {
      try {
        const response = await fetch(previewUrl);
        if (!response.ok)
          throw new Error(`Download failed: ${response.status}`);

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        downloadRef.current.href = objectUrl;
        downloadRef.current.download = fileName;
        downloadRef.current.click();
        URL.revokeObjectURL(objectUrl);
        return;
      } catch {
        // Fall back to direct link if blob download is blocked by network/CORS.
      }
    }

    downloadRef.current.href = previewUrl;
    downloadRef.current.download = fileName;
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
        onChange={(e) => {
          const nextFormat = e.value as string | null;
          setFormat(nextFormat);
          if (nextFormat !== "jpg" && nextFormat !== "webp") {
            setImageSource("geometry");
            setUseGrayscale(false);
            setBlurAmount(0);
          }
        }}
        placeholder={t("format")}
        ariaLabel={t("format")}
        className="toolbar-field toolbar-field-format"
        style={{ width: "190px" }}
      />

      {supportsExternalSource && (
        <Dropdown
          inputId="input-image-source"
          value={imageSource}
          options={imageSourceOptions}
          onChange={(e) => {
            const nextSource = e.value as "geometry" | "external";
            setImageSource(nextSource);
            if (nextSource !== "external") {
              setIsExternalLoading(false);
            }
          }}
          placeholder={t("imageSource")}
          ariaLabel={t("imageSource")}
          className="toolbar-field toolbar-field-source"
          style={{ width: "260px" }}
        />
      )}

      {supportsExternalSource && imageSource === "external" && (
        <>
          <Dropdown
            inputId="input-grayscale"
            value={useGrayscale}
            options={grayscaleOptions}
            onChange={(e) => setUseGrayscale(Boolean(e.value))}
            placeholder={t("grayscale")}
            ariaLabel={t("grayscale")}
            className="toolbar-field toolbar-field-advanced"
            style={{ width: "220px" }}
          />

          <Dropdown
            inputId="input-blur"
            value={blurAmount}
            options={blurOptions}
            onChange={(e) => setBlurAmount(e.value ?? 0)}
            placeholder={t("blur")}
            ariaLabel={t("blur")}
            className="toolbar-field toolbar-field-advanced"
            style={{ width: "220px" }}
          />
        </>
      )}
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
        disabled={!previewUrl || isExternalLoading}
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
          className="toolbar-language-dropdown"
          style={{ width: "152px" }}
        />
      </div>
    </div>
  );

  // ── Card content ───────────────────────────────────

  const cardContent = previewUrl ? (
    <div className="preview-stage" style={previewStageStyle}>
      {isExternalLoading ? (
        <div
          className="preview-loading-placeholder"
          role="status"
          aria-live="polite"
          aria-label={t("loadingImage")}
        >
          <DNA visible height={88} width={88} ariaLabel="preview-loading-dna" />
          <span>{t("loadingImage")}</span>
        </div>
      ) : (
        <img
          src={previewUrl}
          alt={specs ?? ""}
          className="preview-image"
          onLoad={() => setIsExternalLoading(false)}
          onError={() => setIsExternalLoading(false)}
        />
      )}

      {isExternalLoading && (
        <img
          src={previewUrl}
          alt=""
          aria-hidden
          className="preview-preload-image"
          onLoad={() => setIsExternalLoading(false)}
          onError={() => setIsExternalLoading(false)}
        />
      )}
    </div>
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
    <div className="spec-footer" role="status" aria-live="polite">
      <Tag
        value={specs ?? t("ready")}
        severity={specs ? "info" : undefined}
        rounded
        className="spec-tag"
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
