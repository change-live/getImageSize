import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
        window.matchMedia("(pointer: coarse)").matches
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    setPhotographer,
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
  const isExternal =
    imageSource === "picsum" ||
    imageSource === "loremflickr" ||
    imageSource === "unsplash";
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
    const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    if (supportsExternalSource && imageSource === "unsplash") {
      if (!UNSPLASH_ACCESS_KEY) {
        setPreviewUrl("error-unsplash-key-missing");
        setIsExternalLoading(false);
        setPhotographer(null, null);
        setGeneratedConfig({
          width,
          height,
          format: format!,
          imageSource: "unsplash",
          useGrayscale,
          blurAmount,
        });
        return;
      }

      setIsExternalLoading(true);
      setPreviewUrl("loading");

      fetch(`https://api.unsplash.com/photos/random`, {
        headers: {
          "Authorization": `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          "Accept-Version": "v1",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const rawUrl = data.urls.raw;
          const downloadLocation = data.links.download_location;
          setExternalSeed(downloadLocation);
          setPhotographer(data.user.name, data.user.links.html);

          const params = new URLSearchParams();
          params.set("w", String(width));
          params.set("h", String(height));
          params.set("fit", "crop");
          params.set("fm", format === "webp" ? "webp" : "jpg");
          if (useGrayscale) {
            params.set("sat", "-100");
          }
          if (blurAmount > 0) {
            params.set("blur", String(blurAmount * 15));
          }
          const finalUrl = `${rawUrl}&${params.toString()}`;
          setPreviewUrl(finalUrl);
        })
        .catch((err) => {
          console.error(err);
          setPreviewUrl("error-unsplash-failed");
          setPhotographer(null, null);
          setIsExternalLoading(false);
        });

      setGeneratedConfig({
        width,
        height,
        format: format!,
        imageSource: "unsplash",
        useGrayscale,
        blurAmount,
      });
      return;
    }

    setPhotographer(null, null);
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
        supportsExternalSource && (imageSource === "picsum" || imageSource === "unsplash") ? blurAmount : 0,
    });
  };

  const handleDownload = async () => {
    if (!previewUrl || !isReady || !downloadRef.current || isExternalLoading)
      return;

    const fileName = `img_${width}x${height}.${format}`;

    if (supportsExternalSource && isExternal && externalSeed !== null) {
      if (imageSource === "unsplash") {
        try {
          const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
          await fetch(externalSeed, {
            headers: {
              "Authorization": `Client-ID ${UNSPLASH_ACCESS_KEY}`,
              "Accept-Version": "v1",
            },
          });
        } catch (err) {
          console.error("Failed to track Unsplash download:", err);
        }
      }

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
      {isMobile ? (
        <InputText
          id="input-width"
          type="number"
          value={width === null ? "" : String(width)}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setWidth(null);
            } else {
              const parsed = parseInt(val, 10);
              setWidth(isNaN(parsed) ? null : parsed);
            }
          }}
          step={50}
          min={10}
          placeholder={t("width")}
          aria-label={t("width")}
          className="toolbar-field toolbar-field-number"
          style={{ width: "260px" }}
        />
      ) : (
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
          style={{ width: "260px" }}
          inputStyle={{ width: "100%" }}
        />
      )}

      {isMobile ? (
        <InputText
          id="input-height"
          type="number"
          value={height === null ? "" : String(height)}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setHeight(null);
            } else {
              const parsed = parseInt(val, 10);
              setHeight(isNaN(parsed) ? null : parsed);
            }
          }}
          step={50}
          min={10}
          placeholder={t("height")}
          aria-label={t("height")}
          className="toolbar-field toolbar-field-number"
          style={{ width: "260px" }}
        />
      ) : (
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
          style={{ width: "260px" }}
          inputStyle={{ width: "100%" }}
        />
      )}

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
        style={{ width: "260px" }}
      />

      {supportsExternalSource && (
        <Dropdown
          inputId="input-image-source"
          value={imageSource}
          options={imageSourceOptions}
          onChange={(e) => {
            const nextSource = e.value as "geometry" | "picsum" | "loremflickr" | "unsplash";
            setImageSource(nextSource);
            if (!["picsum", "loremflickr", "unsplash"].includes(nextSource)) {
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
            style={{ width: "260px" }}
          />

          {(imageSource === "picsum" || imageSource === "unsplash") && (
            <Dropdown
              inputId="input-blur"
              value={blurAmount}
              options={blurOptions}
              onChange={(e) => setBlurAmount(e.value ?? 0)}
              placeholder={t("blur")}
              ariaLabel={t("blur")}
              className="toolbar-field toolbar-field-advanced"
              style={{ width: "260px" }}
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
