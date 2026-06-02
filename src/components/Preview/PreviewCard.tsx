import { useState, type CSSProperties } from "react";
import { Card } from "primereact/card";
import { DNA } from "react-loader-spinner";
import { useTranslation } from "react-i18next";
import { useImageStore } from "../../store/useImageStore";

export function PreviewCard() {
  const { t } = useTranslation();
  const [layoutType] = useState<"apple" | "camera">(() =>
    Math.random() < 0.5 ? "apple" : "camera"
  );

  const {
    width,
    height,
    format,
    imageSource,
    previewUrl,
    isExternalLoading,
    setIsExternalLoading,
    generatedConfig,
    photographerName,
    photographerUrl,
  } = useImageStore();

  const supportsExternalSource = format === "jpg" || format === "webp";
  const isExternal =
    imageSource === "picsum" ||
    imageSource === "loremflickr" ||
    imageSource === "unsplash";
  const isExternalSizeExceeded =
    supportsExternalSource &&
    isExternal &&
    ((width !== null && width > 5000) || (height !== null && height > 5000));

  const previewStageStyle: CSSProperties | undefined =
    width != null && height != null
      ? { aspectRatio: `${width} / ${height}` }
      : undefined;

  let specsText: string | null = null;
  if (generatedConfig) {
    const sourceText =
      generatedConfig.imageSource === "picsum"
        ? t("imageSourcePicsum")
        : generatedConfig.imageSource === "loremflickr"
          ? t("imageSourceLoremFlickr")
          : generatedConfig.imageSource === "unsplash"
            ? t("imageSourceUnsplash")
            : t("imageSourceGeometry");

    const effects: string[] = [];
    if (generatedConfig.useGrayscale) effects.push("grayscale");
    if (generatedConfig.blurAmount > 0)
      effects.push(`blur:${generatedConfig.blurAmount}`);

    specsText = t("specs", {
      width: generatedConfig.width,
      height: generatedConfig.height,
      format: generatedConfig.format.toUpperCase(),
      source: sourceText,
      effects: effects.join(", ") || t("none"),
    });
  }

  const cardContent = isExternalSizeExceeded ? (
    <div
      className="preview-placeholder"
      role="alert"
      aria-label={t("errorExternalSizeExceeded")}
    >
      <i
        className="pi pi-exclamation-triangle text-4xl mb-3"
        style={{ color: "var(--red-500)" }}
        aria-hidden="true"
      />
      <span style={{ color: "var(--red-500)", fontWeight: "bold" }}>
        {t("errorExternalSizeExceeded")}
      </span>
    </div>
  ) : previewUrl === "error-unsplash-key-missing" ? (
    <div
      className="preview-placeholder"
      role="alert"
      style={{ padding: "2rem", textAlign: "center" }}
    >
      <i
        className="pi pi-key text-4xl mb-3"
        style={{ color: "var(--orange-500)" }}
        aria-hidden="true"
      />
      <span style={{ color: "var(--orange-500)", fontWeight: "bold", display: "block", marginBottom: "0.5rem" }}>
        {t("imageSourceUnsplash")}
      </span>
      <span style={{ fontSize: "0.875rem", color: "var(--text-color-secondary)", lineHeight: "1.5" }}>
        {t("errorUnsplashKeyMissing")}
      </span>
    </div>
  ) : previewUrl === "error-unsplash-failed" ? (
    <div
      className="preview-placeholder"
      role="alert"
      style={{ padding: "2rem", textAlign: "center" }}
    >
      <i
        className="pi pi-exclamation-circle text-4xl mb-3"
        style={{ color: "var(--red-500)" }}
        aria-hidden="true"
      />
      <span style={{ color: "var(--red-500)", fontWeight: "bold", display: "block", marginBottom: "0.5rem" }}>
        {t("imageSourceUnsplash")}
      </span>
      <span style={{ fontSize: "0.875rem", color: "var(--text-color-secondary)", lineHeight: "1.5" }}>
        {t("errorUnsplashFailed")}
      </span>
    </div>
  ) : previewUrl ? (
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
        previewUrl !== "loading" && (
          <img
            src={previewUrl}
            alt={specsText ?? ""}
            className="preview-image"
            onLoad={() => setIsExternalLoading(false)}
            onError={() => setIsExternalLoading(false)}
          />
        )
      )}

      {isExternalLoading && previewUrl !== "loading" && (
        <img
          src={previewUrl}
          alt=""
          aria-hidden
          className="preview-preload-image"
          onLoad={() => setIsExternalLoading(false)}
          onError={() => setIsExternalLoading(false)}
        />
      )}

      {photographerName && photographerUrl && (
        <div className="preview-attribution">
          Photo by{" "}
          <a
            href={`${photographerUrl}?utm_source=getImageSize&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="attribution-link"
          >
            {photographerName}
          </a>{" "}
          on{" "}
          <a
            href="https://unsplash.com/?utm_source=getImageSize&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="attribution-link"
          >
            Unsplash
          </a>
        </div>
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
      {generatedConfig ? (
        layoutType === "camera" ? (
          /* ==================== 方案一：2x2 四格對稱參數面板 ==================== */
          <div className="specs-display-board quad-grid">
            {/* Cell 1: Size */}
            <div className="grid-cell">
              <i className="pi pi-expand grid-icon" aria-hidden="true" />
              <div className="grid-content">
                <span className="grid-label">{t("width")}×{t("height")}</span>
                <span className="grid-value">{generatedConfig.width} × {generatedConfig.height}</span>
              </div>
            </div>
            
            {/* Cell 2: Format */}
            <div className="grid-cell">
              <i className="pi pi-file grid-icon" aria-hidden="true" />
              <div className="grid-content">
                <span className="grid-label">{t("format")}</span>
                <span className="grid-value format-badge">{generatedConfig.format.toUpperCase()}</span>
              </div>
            </div>
            
            {/* Cell 3: Source */}
            <div className="grid-cell">
              <i className="pi pi-images grid-icon" aria-hidden="true" />
              <div className="grid-content">
                <span className="grid-label">{t("imageSource")}</span>
                <span className="grid-value">
                  {generatedConfig.imageSource === "picsum"
                    ? t("imageSourcePicsum")
                    : generatedConfig.imageSource === "loremflickr"
                      ? t("imageSourceLoremFlickr")
                      : generatedConfig.imageSource === "unsplash"
                        ? t("imageSourceUnsplash")
                        : t("imageSourceGeometry")}
                </span>
              </div>
            </div>
            
            {/* Cell 4: Effects (Always rendered to maintain perfect 2x2 symmetry!) */}
            <div className="grid-cell">
              <i className="pi pi-sliders-h grid-icon" aria-hidden="true" />
              <div className="grid-content">
                <span className="grid-label">{t("blur")}/{t("grayscale")}</span>
                <span className="grid-value">
                  {generatedConfig.useGrayscale || generatedConfig.blurAmount > 0 ? (
                    <>
                      {generatedConfig.useGrayscale ? t("grayscale") : ""}
                      {generatedConfig.useGrayscale && generatedConfig.blurAmount > 0 ? " + " : ""}
                      {generatedConfig.blurAmount > 0 ? `${t("blur")}:${generatedConfig.blurAmount}` : ""}
                    </>
                  ) : (
                    t("none")
                  )}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== 方案三：Apple 風極簡橫向流線列 ==================== */
          <div className="specs-display-board inline-meta-bar">
            <span className="meta-item">
              <i className="pi pi-expand meta-icon" aria-hidden="true" />
              <span className="meta-value">{generatedConfig.width} × {generatedConfig.height}</span>
            </span>
            
            <span className="meta-dot" aria-hidden="true">·</span>
            
            <span className="meta-item">
              <i className="pi pi-file meta-icon" aria-hidden="true" />
              <span className="meta-value format-badge">{generatedConfig.format.toUpperCase()}</span>
            </span>
            
            <span className="meta-dot" aria-hidden="true">·</span>
            
            <span className="meta-item">
              <i className="pi pi-images meta-icon" aria-hidden="true" />
              <span className="meta-value">
                {generatedConfig.imageSource === "picsum"
                  ? t("imageSourcePicsum")
                  : generatedConfig.imageSource === "loremflickr"
                    ? t("imageSourceLoremFlickr")
                    : generatedConfig.imageSource === "unsplash"
                      ? t("imageSourceUnsplash")
                      : t("imageSourceGeometry")}
              </span>
            </span>

            {((generatedConfig.useGrayscale) || (generatedConfig.blurAmount > 0)) && (
              <>
                <span className="meta-dot" aria-hidden="true">·</span>
                
                <span className="meta-item">
                  <i className="pi pi-sliders-h meta-icon" aria-hidden="true" />
                  <span className="meta-value">
                    {generatedConfig.useGrayscale ? t("grayscale") : ""}
                    {generatedConfig.useGrayscale && generatedConfig.blurAmount > 0 ? " + " : ""}
                    {generatedConfig.blurAmount > 0 ? `${t("blur")}:${generatedConfig.blurAmount}` : ""}
                  </span>
                </span>
              </>
            )}
          </div>
        )
      ) : (
        <div className="status-badge-ready">
          <span className="status-dot" aria-hidden="true" />
          <span className="status-text">{t("ready")}</span>
        </div>
      )}
    </div>
  );

  return (
    <Card footer={cardFooter} className="preview-card">
      {cardContent}
    </Card>
  );
}
