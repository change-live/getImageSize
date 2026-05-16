import type { CSSProperties } from "react";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { DNA } from "react-loader-spinner";
import { useTranslation } from "react-i18next";
import { useImageStore } from "../../store/useImageStore";

export function PreviewCard() {
  const { t } = useTranslation();

  const {
    width,
    height,
    format,
    imageSource,
    previewUrl,
    isExternalLoading,
    setIsExternalLoading,
    generatedConfig,
  } = useImageStore();

  const supportsExternalSource = format === "jpg" || format === "webp";
  const isExternal = imageSource === "picsum" || imageSource === "loremflickr";
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
        <img
          src={previewUrl}
          alt={specsText ?? ""}
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
        value={specsText ?? t("ready")}
        severity={specsText ? "info" : undefined}
        rounded
        className="spec-tag"
      />
    </div>
  );

  return (
    <Card footer={cardFooter} className="preview-card">
      {cardContent}
    </Card>
  );
}
