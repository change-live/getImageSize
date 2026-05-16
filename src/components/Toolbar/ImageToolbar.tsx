import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Toolbar } from "primereact/toolbar";
import { Menu } from "primereact/menu";
import {
  FORMAT_OPTIONS,
  IMAGE_SOURCE_OPTIONS,
  LANGUAGES,
  THEME_OPTIONS,
} from "../../constants/options";
import { useImageStore } from "../../store/useImageStore";
import { useTheme } from "../../hooks/useTheme";
import {
  buildPicsumUrl,
  buildLoremFlickrUrl,
  generateSVGString,
  generateCanvasDataUrl,
} from "../../utils/image";

export function ImageToolbar() {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme, themeName, setThemeName } = useTheme();
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const themeMenuRef = useRef<Menu>(null);
  const languageMenuRef = useRef<Menu>(null);

  const {
    width,
    setWidth,
    height,
    setHeight,
    format,
    setFormat,
    imageSource,
    setImageSource,
    useGrayscale,
    setUseGrayscale,
    blurAmount,
    setBlurAmount,
    externalSeed,
    setExternalSeed,
    previewUrl,
    setPreviewUrl,
    isExternalLoading,
    setIsExternalLoading,
    setGeneratedConfig,
  } = useImageStore();

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      // Ignore scrolling inside the menu itself
      if (target && target.classList && target.classList.contains("p-menu-list")) return;
      
      if (themeMenuRef.current) {
        (themeMenuRef.current as any).hide(e);
      }
      if (languageMenuRef.current) {
        (languageMenuRef.current as any).hide(e);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  const isReady = width != null && height != null && format != null;
  const supportsExternalSource = format === "jpg" || format === "webp";
  const isExternal = imageSource === "picsum" || imageSource === "loremflickr";
  const isExternalSizeExceeded =
    supportsExternalSource &&
    isExternal &&
    ((width !== null && width > 5000) || (height !== null && height > 5000));

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

  const themeMenuItems = THEME_OPTIONS.map((opt) => ({
    label: opt.label,
    icon: themeName === opt.value ? "pi pi-check" : "pi pi-fw",
    command: () => setThemeName(opt.value),
  }));

  const languageMenuItems = LANGUAGES.map((opt) => ({
    label: opt.label,
    icon: i18n.language === opt.value ? "pi pi-check" : "pi pi-fw",
    command: () => i18n.changeLanguage(opt.value),
  }));

  const handleGenerate = () => {
    if (!isReady || width === null || height === null) return;
    let url: string;

    if (supportsExternalSource && isExternal) {
      const lockId = Math.floor(Math.random() * 1_000_000) + 1;
      const nextSeed = `${Date.now()}-${lockId}`;
      const externalFormat = format as "jpg" | "webp";

      if (imageSource === "picsum") {
        url = buildPicsumUrl(
          width,
          height,
          externalFormat,
          useGrayscale,
          blurAmount,
          nextSeed,
        );
      } else {
        url = buildLoremFlickrUrl(width, height, useGrayscale, lockId);
      }

      setExternalSeed(nextSeed);
      setIsExternalLoading(true);
    } else if (format === "svg") {
      url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateSVGString(width, height))}`;
      setExternalSeed(null);
      setIsExternalLoading(false);
    } else {
      url = generateCanvasDataUrl(width, height, format!);
      setExternalSeed(null);
      setIsExternalLoading(false);
    }

    setPreviewUrl(url);
    setGeneratedConfig({
      width,
      height,
      format: format!,
      imageSource:
        isExternal && supportsExternalSource ? imageSource : "geometry",
      useGrayscale: supportsExternalSource && isExternal ? useGrayscale : false,
      blurAmount:
        supportsExternalSource && imageSource === "picsum" ? blurAmount : 0,
    });
  };

  const handleDownload = async () => {
    if (!previewUrl || !isReady || !downloadRef.current || isExternalLoading)
      return;

    const fileName = `img_${width}x${height}.${format}`;

    if (supportsExternalSource && isExternal && externalSeed !== null) {
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
            const nextSource = e.value as "geometry" | "picsum" | "loremflickr";
            setImageSource(nextSource);
            if (!["picsum", "loremflickr"].includes(nextSource)) {
              setIsExternalLoading(false);
            }
          }}
          placeholder={t("imageSource")}
          ariaLabel={t("imageSource")}
          className="toolbar-field toolbar-field-source"
          style={{ width: "260px" }}
        />
      )}

      {supportsExternalSource && isExternal && (
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

          {imageSource === "picsum" && (
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
          )}
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
        disabled={!isReady || isExternalSizeExceeded}
        aria-label={t("generate")}
        size="small"
        raised
      />
      <Button
        label={t("download")}
        icon="pi pi-download"
        severity="secondary"
        onClick={handleDownload}
        disabled={!previewUrl || isExternalLoading || isExternalSizeExceeded}
        aria-label={t("download")}
        size="small"
        outlined
      />
      <div className="toolbar-tools">
        <Menu model={themeMenuItems} popup ref={themeMenuRef} id="theme_menu" />
        <Button
          icon="pi pi-palette"
          severity="secondary"
          text
          size="small"
          rounded
          onClick={(e) => themeMenuRef.current?.toggle(e)}
          aria-controls="theme_menu"
          aria-haspopup
          aria-label={t("theme")}
          tooltip={t("theme")}
          tooltipOptions={{ position: "bottom" }}
        />

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

        <Menu
          model={languageMenuItems}
          popup
          ref={languageMenuRef}
          id="language_menu"
        />
        <Button
          icon="pi pi-globe"
          severity="secondary"
          text
          size="small"
          rounded
          onClick={(e) => languageMenuRef.current?.toggle(e)}
          aria-controls="language_menu"
          aria-haspopup
          aria-label={t("language")}
          tooltip={t("language")}
          tooltipOptions={{ position: "bottom" }}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toolbar start={toolbarStart} end={toolbarEnd} className="app-toolbar" />
      <a ref={downloadRef} style={{ display: "none" }} aria-hidden />
    </>
  );
}
