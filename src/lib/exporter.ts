import { toJpeg, toPng } from "html-to-image";

const isSafari = () => typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
let warmed = false;

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Размер data URL в байтах */
export const bytesOf = (url: string) => Math.round(((url.length - url.indexOf(",") - 1) * 3) / 4);
export const mb = (n: number) => (n / 1024 / 1024).toFixed(2).replace(".", ",");

/** Ждём, пока все картинки внутри узла декодированы */
export async function imagesReady(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map((i) => (i.complete && i.naturalWidth > 0 ? Promise.resolve() : i.decode().catch(() => undefined))),
  );
}

export interface ExportOptions {
  W: number;
  H: number;
  ratio: number;
  type: "png" | "jpeg";
  bg: string;
}

/** Единая точка экспорта: шрифты, картинки, прогрев Safari, рендер в PNG/JPG */
export async function renderToDataUrl(node: HTMLElement, o: ExportOptions): Promise<string> {
  if (document.fonts?.ready) await document.fonts.ready;
  await imagesReady(node);
  const opts = { width: o.W, height: o.H, pixelRatio: o.ratio, cacheBust: false, backgroundColor: o.bg, quality: 0.95 };
  if (isSafari() && !warmed) {
    await toPng(node, opts); // Safari в первый раз отдаёт пустые картинки
    warmed = true;
  }
  return o.type === "png" ? await toPng(node, opts) : await toJpeg(node, opts);
}
