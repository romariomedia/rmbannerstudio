import { BG_ID_LIST, DEFAULT_CUSTOM, THEME_LIST, type BgId, type CustomColors, type ThemeId } from "./themes";
import type { Images } from "./types";

export interface Feature { title: string; text: string }
export interface Spec { label: string; value: string }

export interface ProductData {
  brand: string;
  brandSub: string;
  badge: string;
  name: string;
  tagline: string;
  description: string;
  features: Feature[];
  specs: Spec[];
  perks: string[];
  price: string;
  oldPrice: string;
  discountLabel: string;
  priceNote: string;
  cta: string;
  site: string;
  rating: string;
  reviews: string;
}

export interface ProductOptions {
  showImage: boolean;
  showFeatures: boolean;
  showSpecs: boolean;
  showPerks: boolean;
  showRating: boolean;
  showPrice: boolean;
  showPattern: boolean;
  imageFit: "cover" | "contain";
  overlay: number;
  headScale: number;
}

export type ProductFormatId = "card" | "a4" | "slide";

export interface ProductFormat {
  id: ProductFormatId;
  label: string;
  use: string;
  W: number;
  H: number;
}

export const PRODUCT_FORMATS: ProductFormat[] = [
  { id: "card", label: "Карточка 3:4", use: "Маркетплейсы, соцсети, каталоги", W: 1080, H: 1440 },
  { id: "a4", label: "Лист A4", use: "Печать, PDF-вложение, коммерческое предложение", W: 1240, H: 1754 },
  { id: "slide", label: "Слайд 16:9", use: "Презентации, сайт, YouTube", W: 1920, H: 1080 },
];

export interface ProductProject {
  data: ProductData;
  themeId: ThemeId;
  custom: CustomColors;
  bgId: BgId;
  format: ProductFormatId;
  opts: ProductOptions;
  images: Images;
}

export const FEATURE_SLOTS = 6;
export const SPEC_SLOTS = 6;
export const PERK_SLOTS = 3;

export const PL = {
  brand: 22, brandSub: 32, badge: 34, name: 26, tagline: 44, description: 300,
  featTitle: 28, featText: 80, specLabel: 22, specValue: 26, perk: 26,
  price: 12, oldPrice: 12, discountLabel: 8, priceNote: 36, cta: 24, site: 30, rating: 5, reviews: 22,
};

export function fillFeatures(list: Partial<Feature>[]): Feature[] {
  return Array.from({ length: FEATURE_SLOTS }, (_, i) => ({ title: list[i]?.title ?? "", text: list[i]?.text ?? "" }));
}
export function fillSpecs(list: Partial<Spec>[]): Spec[] {
  return Array.from({ length: SPEC_SLOTS }, (_, i) => ({ label: list[i]?.label ?? "", value: list[i]?.value ?? "" }));
}
export function fillPerks(list: string[]): string[] {
  return Array.from({ length: PERK_SLOTS }, (_, i) => list[i] ?? "");
}

export const DEFAULT_PRODUCT: ProductData = {
  brand: "NOVA",
  brandSub: "Платформа для роста",
  badge: "ХИТ 2026 • Новинка",
  name: "NOVA X",
  tagline: "платформа для роста продаж",
  description:
    "NOVA X объединяет аналитику, автоматизацию и рекламу в одном окне. Запускайте кампании за минуты, смотрите результат в реальном времени и масштабируйте то, что работает.",
  features: fillFeatures([
    { title: "Запуск за 1 день", text: "Готовые сценарии и импорт данных без программистов" },
    { title: "Аналитика онлайн", text: "Метрики, воронки и отчёты на одном дашборде" },
    { title: "Защита данных", text: "Шифрование и резервные копии каждые 24 часа" },
    { title: "Автоматизация", text: "Рассылки и задачи запускаются сами по триггерам" },
  ]),
  specs: fillSpecs([
    { label: "Платформы", value: "Web, iOS, Android" },
    { label: "Интеграции", value: "120+ сервисов" },
    { label: "Поддержка", value: "24/7, чат и email" },
    { label: "Безопасность", value: "ISO 27001" },
  ]),
  perks: fillPerks(["14 дней бесплатно", "Без привязки карты", "Отмена в любой момент"]),
  price: "1 990 ₽",
  oldPrice: "2 990 ₽",
  discountLabel: "−33%",
  priceNote: "в месяц, без скрытых платежей",
  cta: "Попробовать бесплатно",
  site: "nova.app",
  rating: "4.9",
  reviews: "1 200 отзывов",
};

export const DEFAULT_PRODUCT_OPTS: ProductOptions = {
  showImage: true,
  showFeatures: true,
  showSpecs: true,
  showPerks: true,
  showRating: true,
  showPrice: true,
  showPattern: true,
  imageFit: "cover",
  overlay: 80,
  headScale: 100,
};

export const DEFAULT_PRODUCT_PROJECT: ProductProject = {
  data: DEFAULT_PRODUCT,
  themeId: "lime-acid",
  custom: DEFAULT_CUSTOM,
  bgId: "auto",
  format: "card",
  opts: DEFAULT_PRODUCT_OPTS,
  images: { logo: null, bg: null, mock: null },
};

// ---------- безопасная загрузка ----------
const HEX = /^#[0-9a-fA-F]{6}$/;
const str = (v: unknown, fb: string, max: number) => (typeof v === "string" ? v.slice(0, max) : fb);
const bool = (v: unknown, fb: boolean) => (typeof v === "boolean" ? v : fb);
const num = (v: unknown, fb: number, min: number, max: number) =>
  typeof v === "number" && isFinite(v) ? Math.min(max, Math.max(min, v)) : fb;
const img = (v: unknown) => (typeof v === "string" && v.startsWith("data:image/") ? v : null);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

const THEME_IDS: string[] = [...THEME_LIST.map((t) => t.id), "custom"];
const BG_IDS: string[] = BG_ID_LIST;

export function normalizeProduct(raw: unknown): ProductProject {
  const r = obj(raw);
  const d = obj(r.data);
  const o = obj(r.opts);
  const c = obj(r.custom);
  const im = obj(r.images);
  const D = DEFAULT_PRODUCT;

  const feats = Array.isArray(d.features)
    ? d.features.map((x) => ({ title: str(obj(x).title, "", PL.featTitle), text: str(obj(x).text, "", PL.featText) }))
    : D.features;
  const specs = Array.isArray(d.specs)
    ? d.specs.map((x) => ({ label: str(obj(x).label, "", PL.specLabel), value: str(obj(x).value, "", PL.specValue) }))
    : D.specs;
  const perks = Array.isArray(d.perks) ? d.perks.map((x) => str(x, "", PL.perk)) : D.perks;

  const data: ProductData = {
    brand: str(d.brand, D.brand, PL.brand),
    brandSub: str(d.brandSub, D.brandSub, PL.brandSub),
    badge: str(d.badge, D.badge, PL.badge),
    name: str(d.name, D.name, PL.name),
    tagline: str(d.tagline, D.tagline, PL.tagline),
    description: str(d.description, D.description, PL.description),
    features: fillFeatures(feats),
    specs: fillSpecs(specs),
    perks: fillPerks(perks),
    price: str(d.price, D.price, PL.price),
    oldPrice: str(d.oldPrice, D.oldPrice, PL.oldPrice),
    discountLabel: str(d.discountLabel, D.discountLabel, PL.discountLabel),
    priceNote: str(d.priceNote, D.priceNote, PL.priceNote),
    cta: str(d.cta, D.cta, PL.cta),
    site: str(d.site, D.site, PL.site),
    rating: str(d.rating, D.rating, PL.rating),
    reviews: str(d.reviews, D.reviews, PL.reviews),
  };

  const images: Images = { logo: img(im.logo), bg: img(im.bg), mock: img(im.mock) };
  const rawBg = typeof r.bgId === "string" ? r.bgId : "auto";
  let bgId: BgId = BG_IDS.includes(rawBg) ? (rawBg as BgId) : "auto";
  if (bgId === "custom" && !images.bg) bgId = "auto";
  const rawTheme = typeof r.themeId === "string" ? r.themeId : "";
  const DO = DEFAULT_PRODUCT_OPTS;

  return {
    data,
    themeId: THEME_IDS.includes(rawTheme) ? (rawTheme as ThemeId) : DEFAULT_PRODUCT_PROJECT.themeId,
    custom: {
      a1: typeof c.a1 === "string" && HEX.test(c.a1) ? c.a1 : DEFAULT_CUSTOM.a1,
      a2: typeof c.a2 === "string" && HEX.test(c.a2) ? c.a2 : DEFAULT_CUSTOM.a2,
      base: typeof c.base === "string" && HEX.test(c.base) ? c.base : DEFAULT_CUSTOM.base,
      light: bool(c.light, DEFAULT_CUSTOM.light),
    },
    bgId,
    format: PRODUCT_FORMATS.some((f) => f.id === r.format) ? (r.format as ProductFormatId) : "card",
    opts: {
      showImage: bool(o.showImage, DO.showImage),
      showFeatures: bool(o.showFeatures, DO.showFeatures),
      showSpecs: bool(o.showSpecs, DO.showSpecs),
      showPerks: bool(o.showPerks, DO.showPerks),
      showRating: bool(o.showRating, DO.showRating),
      showPrice: bool(o.showPrice, DO.showPrice),
      showPattern: bool(o.showPattern, DO.showPattern),
      imageFit: o.imageFit === "contain" ? "contain" : "cover",
      overlay: num(o.overlay, DO.overlay, 0, 100),
      headScale: num(o.headScale, DO.headScale, 70, 130),
    },
    images,
  };
}

/** Текстовая версия описания — для карточек маркетплейсов, сайта, постов */
export function buildProductText(d: ProductData): string {
  const lines: string[] = [];
  const title = [d.name, d.tagline].filter(Boolean).join(" — ");
  if (title) lines.push(title.toUpperCase(), "");
  if (d.description) lines.push(d.description, "");
  const feats = d.features.filter((f) => f.title);
  if (feats.length) {
    lines.push("ПРЕИМУЩЕСТВА");
    feats.forEach((f) => lines.push(`• ${f.title}${f.text ? ` — ${f.text}` : ""}`));
    lines.push("");
  }
  const specs = d.specs.filter((s) => s.label || s.value);
  if (specs.length) {
    lines.push("ХАРАКТЕРИСТИКИ");
    specs.forEach((s) => lines.push(`${s.label}${s.label && s.value ? ": " : ""}${s.value}`));
    lines.push("");
  }
  if (d.price) {
    lines.push(`ЦЕНА: ${d.price}${d.oldPrice ? ` (было ${d.oldPrice})` : ""}${d.priceNote ? `, ${d.priceNote}` : ""}`);
  }
  const perks = d.perks.filter(Boolean);
  if (perks.length) lines.push(perks.map((p) => `✓ ${p}`).join("  "));
  if (d.cta || d.site) lines.push([d.cta, d.site].filter(Boolean).join(" → "));
  return lines.join("\n").trim();
}
