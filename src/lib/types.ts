import { BG_ID_LIST, DEFAULT_CUSTOM, THEME_LIST, type BgId, type CustomColors, type ThemeId } from "./themes";

export interface BannerData {
  brand: string;
  brandSub: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  cta1: string;
  cta2: string;
  f1: string;
  f2: string;
  f3: string;
  s1v: string;
  s1l: string;
  s2v: string;
  s2l: string;
  s3v: string;
  s3l: string;
  rating: string;
  reviews: string;
  metricV: string;
  metricL: string;
  proof: string;
  promo: string;
  site: string;
}

export interface Options {
  showMockup: boolean;
  showPattern: boolean;
  showFeatures: boolean;
  showStats: boolean;
  showRating: boolean;
  showCards: boolean;
  showPromo: boolean;
  showSecondary: boolean;
  animate: boolean;
  mockFit: "cover" | "contain";
  overlay: number; // 0..100 затемнение фона
  headScale: number; // 70..130 размер заголовка, %
}

export interface Images {
  logo: string | null;
  bg: string | null;
  mock: string | null;
}

export type FormatId = "hero" | "post" | "story" | "billboard";

export interface FormatDef {
  id: FormatId;
  label: string;
  short: string;
  use: string;
  W: number;
  H: number;
}

export const FORMATS: FormatDef[] = [
  { id: "hero", label: "Hero 16:9", short: "16:9", use: "Сайт, YouTube, презентации", W: 1920, H: 1080 },
  { id: "post", label: "Пост 1:1", short: "1:1", use: "Instagram, VK, Telegram, маркетплейсы", W: 1080, H: 1080 },
  { id: "story", label: "Stories 9:16", short: "9:16", use: "Stories, Reels, Shorts, TikTok", W: 1080, H: 1920 },
  { id: "billboard", label: "Billboard 21:9", short: "21:9", use: "Шапки, digital-экраны, наружка", W: 2560, H: 1080 },
];

export interface Project {
  data: BannerData;
  themeId: ThemeId;
  custom: CustomColors;
  bgId: BgId;
  format: FormatId;
  opts: Options;
  images: Images;
}

export const DEFAULT_DATA: BannerData = {
  brand: "NOVA",
  brandSub: "Новинка 2026",
  name: "NOVA X",
  tagline: "будущее уже здесь",
  description:
    "Платформа нового поколения: запускайте, масштабируйте и зарабатывайте быстрее — всё в одном окне, без лишних настроек.",
  badge: "NEW • Запуск 2026",
  cta1: "Попробовать бесплатно",
  cta2: "Смотреть демо",
  f1: "Запуск за 1 день",
  f2: "Безопасно",
  f3: "Рост продаж",
  s1v: "48K+",
  s1l: "клиентов",
  s2v: "4.9★",
  s2l: "рейтинг",
  s3v: "99.9%",
  s3l: "аптайм",
  rating: "4.9",
  reviews: "1 200 отзывов",
  metricV: "+98%",
  metricL: "рост конверсии",
  proof: "Нам доверяют 48 000 клиентов",
  promo: "Промокод NOVA30 · −30%",
  site: "nova.app",
};

export const DEFAULT_OPTS: Options = {
  showMockup: true,
  showPattern: true,
  showFeatures: true,
  showStats: true,
  showRating: true,
  showCards: true,
  showPromo: true,
  showSecondary: true,
  animate: true,
  mockFit: "cover",
  overlay: 70,
  headScale: 100,
};

export const DEFAULT_PROJECT: Project = {
  data: DEFAULT_DATA,
  themeId: "lime-acid",
  custom: DEFAULT_CUSTOM,
  bgId: "auto",
  format: "hero",
  opts: DEFAULT_OPTS,
  images: { logo: null, bg: null, mock: null },
};

/** Лимиты длины полей (чтобы текст не ломал вёрстку) */
export const LIMITS: Record<keyof BannerData, number> = {
  brand: 22,
  brandSub: 32,
  name: 24,
  tagline: 38,
  description: 190,
  badge: 36,
  cta1: 26,
  cta2: 22,
  f1: 26,
  f2: 26,
  f3: 26,
  s1v: 9,
  s1l: 16,
  s2v: 9,
  s2l: 16,
  s3v: 9,
  s3l: 16,
  rating: 5,
  reviews: 22,
  metricV: 8,
  metricL: 22,
  proof: 40,
  promo: 40,
  site: 30,
};

const HEX = /^#[0-9a-fA-F]{6}$/;

function str(v: unknown, fallback: string, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : fallback;
}
function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function num(v: unknown, fallback: number, min: number, max: number): number {
  return typeof v === "number" && isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
}
function img(v: unknown): string | null {
  return typeof v === "string" && v.startsWith("data:image/") ? v : null;
}

const THEME_IDS: string[] = [...THEME_LIST.map((t) => t.id), "custom"];
const BG_IDS: string[] = BG_ID_LIST;

/** Безопасно приводит любые данные (localStorage / импорт JSON) к валидному проекту */
export function normalizeProject(raw: unknown): Project {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  const d = (r.data && typeof r.data === "object" ? r.data : {}) as Record<string, unknown>;
  const o = (r.opts && typeof r.opts === "object" ? r.opts : {}) as Record<string, unknown>;
  const c = (r.custom && typeof r.custom === "object" ? r.custom : {}) as Record<string, unknown>;
  const im = (r.images && typeof r.images === "object" ? r.images : {}) as Record<string, unknown>;

  const data = { ...DEFAULT_DATA } as Record<string, string>;
  (Object.keys(DEFAULT_DATA) as (keyof BannerData)[]).forEach((k) => {
    data[k] = str(d[k], DEFAULT_DATA[k], LIMITS[k]);
  });

  const images: Images = { logo: img(im.logo), bg: img(im.bg), mock: img(im.mock) };
  let bgId = BG_IDS.includes(r.bgId) ? (r.bgId as BgId) : "auto";
  if (bgId === "custom" && !images.bg) bgId = "auto";

  return {
    data: data as unknown as BannerData,
    themeId: THEME_IDS.includes(r.themeId) ? (r.themeId as ThemeId) : DEFAULT_PROJECT.themeId,
    custom: {
      a1: typeof c.a1 === "string" && HEX.test(c.a1) ? c.a1 : DEFAULT_CUSTOM.a1,
      a2: typeof c.a2 === "string" && HEX.test(c.a2) ? c.a2 : DEFAULT_CUSTOM.a2,
      base: typeof c.base === "string" && HEX.test(c.base) ? c.base : DEFAULT_CUSTOM.base,
      light: bool(c.light, DEFAULT_CUSTOM.light),
    },
    bgId,
    format: FORMATS.some((f) => f.id === r.format) ? (r.format as FormatId) : "hero",
    opts: {
      showMockup: bool(o.showMockup, DEFAULT_OPTS.showMockup),
      showPattern: bool(o.showPattern, DEFAULT_OPTS.showPattern),
      showFeatures: bool(o.showFeatures, DEFAULT_OPTS.showFeatures),
      showStats: bool(o.showStats, DEFAULT_OPTS.showStats),
      showRating: bool(o.showRating, DEFAULT_OPTS.showRating),
      showCards: bool(o.showCards, DEFAULT_OPTS.showCards),
      showPromo: bool(o.showPromo, DEFAULT_OPTS.showPromo),
      showSecondary: bool(o.showSecondary, DEFAULT_OPTS.showSecondary),
      animate: bool(o.animate, DEFAULT_OPTS.animate),
      mockFit: o.mockFit === "contain" ? "contain" : "cover",
      overlay: num(o.overlay, DEFAULT_OPTS.overlay, 0, 100),
      headScale: num(o.headScale, DEFAULT_OPTS.headScale, 70, 130),
    },
    images,
  };
}
