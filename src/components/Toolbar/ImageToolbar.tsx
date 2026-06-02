import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toolbar } from "primereact/toolbar";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";
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
  const languageMenuRef = useRef<Menu>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
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
      // Ignore scrolling inside the menu itself or any of its sub-containers
      if (target && target.closest && target.closest(".p-menu")) return;

      if (languageMenuRef.current) {
        (languageMenuRef.current as unknown as { hide: (e: Event) => void }).hide(e);
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
        <Button
          icon="pi pi-palette"
          severity="secondary"
          text
          size="small"
          rounded
          onClick={() => setThemeDialogVisible(true)}
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
      {isMobile ? (
        <div className="mobile-navbar-container">
          <div className="mobile-header-bar">
            <div className="mobile-header-actions">
              <Button
                icon="pi pi-sync"
                text
                rounded
                size="small"
                onClick={() => {
                  handleGenerate();
                  setIsSettingsExpanded(false); // Collapse to immediately reveal image
                }}
                disabled={!isReady || isExternalSizeExceeded}
                aria-label={t("generate")}
                tooltip={t("generate")}
                tooltipOptions={{ position: "bottom" }}
              />
              <Button
                icon="pi pi-download"
                severity="secondary"
                text
                rounded
                size="small"
                onClick={handleDownload}
                disabled={!previewUrl || isExternalLoading || isExternalSizeExceeded}
                aria-label={t("download")}
                tooltip={t("download")}
                tooltipOptions={{ position: "bottom" }}
              />
              <Button
                icon={isSettingsExpanded ? "pi pi-times" : "pi pi-sliders-h"}
                severity={isSettingsExpanded ? "danger" : undefined}
                raised={!isSettingsExpanded}
                text={isSettingsExpanded}
                rounded
                size="small"
                onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                aria-label={isSettingsExpanded ? t("collapseSettings") : t("expandSettings")}
                tooltip={isSettingsExpanded ? t("collapseSettings") : t("expandSettings")}
                tooltipOptions={{ position: "bottom" }}
              />
            </div>
          </div>
          <div className={`mobile-settings-drawer ${isSettingsExpanded ? "expanded" : ""}`}>
            <div className="mobile-settings-fields">
              <div className="mobile-field-group">
                <label htmlFor="mobile-input-width" className="mobile-field-label">{t("width")}</label>
                <InputText
                  id="mobile-input-width"
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
                  className="p-inputtext p-component w-full"
                />
              </div>

              <div className="mobile-field-group">
                <label htmlFor="mobile-input-height" className="mobile-field-label">{t("height")}</label>
                <InputText
                  id="mobile-input-height"
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
                  className="p-inputtext p-component w-full"
                />
              </div>

              <div className="mobile-field-group">
                <label htmlFor="mobile-input-format" className="mobile-field-label">{t("format")}</label>
                <Dropdown
                  inputId="mobile-input-format"
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
                  className="w-full"
                />
              </div>

              {supportsExternalSource && (
                <div className="mobile-field-group">
                  <label htmlFor="mobile-input-image-source" className="mobile-field-label">{t("imageSource")}</label>
                  <Dropdown
                    inputId="mobile-input-image-source"
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
                    className="w-full"
                  />
                </div>
              )}

              {supportsExternalSource && isExternal && (
                <>
                  <div className="mobile-field-group">
                    <label htmlFor="mobile-input-grayscale" className="mobile-field-label">{t("grayscale")}</label>
                    <Dropdown
                      inputId="mobile-input-grayscale"
                      value={useGrayscale}
                      options={grayscaleOptions}
                      onChange={(e) => setUseGrayscale(Boolean(e.value))}
                      placeholder={t("grayscale")}
                      className="w-full"
                    />
                  </div>

                  {(imageSource === "picsum" || imageSource === "unsplash") && (
                    <div className="mobile-field-group">
                      <label htmlFor="mobile-input-blur" className="mobile-field-label">{t("blur")}</label>
                      <Dropdown
                        inputId="mobile-input-blur"
                        value={blurAmount}
                        options={blurOptions}
                        onChange={(e) => setBlurAmount(e.value ?? 0)}
                        placeholder={t("blur")}
                        className="w-full"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mobile-settings-actions">
              <Button
                label={t("generate")}
                icon="pi pi-sync"
                onClick={() => {
                  handleGenerate();
                  setIsSettingsExpanded(false); // Collapse to immediately reveal image
                }}
                disabled={!isReady || isExternalSizeExceeded}
                className="w-full"
                raised
              />
              <Button
                label={t("download")}
                icon="pi pi-download"
                severity="secondary"
                onClick={handleDownload}
                disabled={!previewUrl || isExternalLoading || isExternalSizeExceeded}
                className="w-full"
                outlined
              />
            </div>

            <div className="mobile-utility-tools">
              <Button
                icon="pi pi-palette"
                severity="secondary"
                text
                size="small"
                rounded
                onClick={() => setThemeDialogVisible(true)}
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
        </div>
      ) : (
        <Toolbar start={toolbarStart} end={toolbarEnd} className="app-toolbar" />
      )}
      <a ref={downloadRef} style={{ display: "none" }} aria-hidden />
      <Menu
        model={languageMenuItems}
        popup
        ref={languageMenuRef}
        id="language_menu"
      />

      <Dialog
        header={t("theme")}
        visible={themeDialogVisible}
        style={{ width: "90vw", maxWidth: "600px" }}
        onHide={() => setThemeDialogVisible(false)}
        draggable={false}
        resizable={false}
        dismissableMask
        className="theme-dialog"
      >
        <div className="theme-grid">
          {THEME_OPTIONS.map((opt) => {
            const isSelected = themeName === opt.value;
            return (
              <button
                key={opt.value}
                className={`theme-card ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  setThemeName(opt.value);
                  setThemeDialogVisible(false);
                }}
              >
                <span className="theme-card-icon pi pi-palette" />
                <span className="theme-card-label">{opt.label}</span>
                {isSelected && <span className="theme-card-check pi pi-check-circle" />}
              </button>
            );
          })}
        </div>
      </Dialog>
    </>
  );
}
