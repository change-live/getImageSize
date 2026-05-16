import { create } from "zustand";

export interface GeneratedConfig {
  width: number;
  height: number;
  format: string;
  imageSource: "geometry" | "picsum" | "loremflickr";
  useGrayscale: boolean;
  blurAmount: number;
}

interface ImageState {
  // Input Configuration
  width: number | null;
  height: number | null;
  format: string | null;
  imageSource: "geometry" | "picsum" | "loremflickr";
  useGrayscale: boolean;
  blurAmount: number;

  // Actions
  setWidth: (w: number | null) => void;
  setHeight: (h: number | null) => void;
  setFormat: (fmt: string | null) => void;
  setImageSource: (src: "geometry" | "picsum" | "loremflickr") => void;
  setUseGrayscale: (g: boolean) => void;
  setBlurAmount: (b: number) => void;

  // Output/Preview State
  externalSeed: string | null;
  previewUrl: string | null;
  isExternalLoading: boolean;
  generatedConfig: GeneratedConfig | null;

  setExternalSeed: (seed: string | null) => void;
  setPreviewUrl: (url: string | null) => void;
  setIsExternalLoading: (loading: boolean) => void;
  setGeneratedConfig: (config: GeneratedConfig | null) => void;
}

export const useImageStore = create<ImageState>()((set) => ({
  width: null,
  height: null,
  format: null,
  imageSource: "geometry",
  useGrayscale: false,
  blurAmount: 0,

  setWidth: (width) => set({ width }),
  setHeight: (height) => set({ height }),
  setFormat: (format) => set({ format }),
  setImageSource: (imageSource) => set({ imageSource }),
  setUseGrayscale: (useGrayscale) => set({ useGrayscale }),
  setBlurAmount: (blurAmount) => set({ blurAmount }),

  externalSeed: null,
  previewUrl: null,
  isExternalLoading: false,
  generatedConfig: null,

  setExternalSeed: (externalSeed) => set({ externalSeed }),
  setPreviewUrl: (previewUrl) => set({ previewUrl }),
  setIsExternalLoading: (isExternalLoading) => set({ isExternalLoading }),
  setGeneratedConfig: (generatedConfig) => set({ generatedConfig }),
}));
