export function buildPicsumUrl(
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

export function buildLoremFlickrUrl(
  w: number,
  h: number,
  grayscale: boolean,
  lockId: number,
): string {
  const filter = grayscale ? "g/" : "";
  return `https://loremflickr.com/${filter}${w}/${h}/all?lock=${lockId}`;
}

export function getArtData(w: number, h: number) {
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

export function generateSVGString(w: number, h: number): string {
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

export function generateCanvasDataUrl(w: number, h: number, fmt: string): string {
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
