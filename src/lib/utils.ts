/** Hex (#rrggbb) → rgba-строка с прозрачностью */
export function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/** Относительная яркость цвета 0..1 */
export function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const toLin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin((n >> 16) & 255) + 0.7152 * toLin((n >> 8) & 255) + 0.0722 * toLin(n & 255);
}

/** Читаемый цвет текста поверх фона */
export function readableOn(hex: string): string {
  return luminance(hex) > 0.4 ? "#0a0a0a" : "#ffffff";
}

export function slug(s: string): string {
  const r = s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return r || "banner";
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Читает файл-картинку, уменьшает до maxSize и возвращает dataURL (PNG для логотипов с прозрачностью) */
/** Есть ли в картинке прозрачные пиксели (проверка по уменьшенной копии) */
function hasTransparency(img: HTMLImageElement): boolean {
  try {
    const s = 96;
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0, s, s);
    const d = ctx.getImageData(0, 0, s, s).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
  } catch {
    /* не удалось проверить — считаем, что прозрачности нет */
  }
  return false;
}

export function loadImageFile(file: File, maxSize: number, keepAlpha: boolean | "auto" = false): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Нужен файл-изображение"));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error("Файл больше 15 МБ"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Не удалось открыть изображение"));
      img.onload = () => {
        // SVG без явных размеров отдаёт ширину 0 — берём разумное значение
        const iw = img.naturalWidth || img.width || 512;
        const ih = img.naturalHeight || img.height || 512;
        const ratio = Math.min(1, maxSize / Math.max(iw, ih));
        const w = Math.max(1, Math.round(iw * ratio));
        const h = Math.max(1, Math.round(ih * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas недоступен"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        // PNG — только если нужна прозрачность (логотип или фото товара с вырезанным фоном), иначе JPEG
        const png = keepAlpha === "auto" ? hasTransparency(img) : keepAlpha;
        resolve(png ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const cutCache = new Map<string, Promise<string | null>>();

/**
 * Превращает чёрный фон фото в прозрачность (яркость → альфа-канал).
 * Заменяет CSS mix-blend-mode, который нестабильно попадает в экспортируемый PNG.
 * Возвращает null, если фон фото не тёмный (тогда фото показывается в рамке).
 */
export function cutBlack(src: string, maxSize = 1600): Promise<string | null> {
  const hit = cutCache.get(src);
  if (hit) return hit;
  const p = new Promise<string | null>((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(null);
    img.onload = () => {
      try {
        const r = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * r));
        const h = Math.max(1, Math.round(img.naturalHeight * r));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h);
        const d = data.data;
        const at = (x: number, y: number) => {
          const i = (y * w + x) * 4;
          return Math.max(d[i], d[i + 1], d[i + 2]);
        };
        const m = Math.min(3, w - 1, h - 1);
        if (Math.max(at(m, m), at(w - 1 - m, m), at(m, h - 1 - m), at(w - 1 - m, h - 1 - m)) > 70) return resolve(null);
        for (let i = 0; i < d.length; i += 4) {
          const mx = Math.max(d[i], d[i + 1], d[i + 2]);
          if (mx === 0) {
            d[i + 3] = 0;
            continue;
          }
          const a = Math.min(255, mx * 4);
          const k = 255 / a;
          d[i] = Math.min(255, d[i] * k);
          d[i + 1] = Math.min(255, d[i + 1] * k);
          d[i + 2] = Math.min(255, d[i + 2] * k);
          d[i + 3] = a;
        }
        ctx.putImageData(data, 0, 0);
        resolve(c.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.src = src;
  });
  cutCache.set(src, p);
  return p;
}

export function downloadDataUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadText(text: string, filename: string, mime = "application/json") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
