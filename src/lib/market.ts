import { BG_ID_LIST, DEFAULT_CUSTOM, THEME_LIST, type BgId, type CustomColors, type ThemeId } from "./themes";
import type { Images } from "./types";
import type { Feature, Spec } from "./product";

export type SlideId = "main" | "promo" | "benefits" | "specs" | "box" | "trust";

export interface SlideDef {
  id: SlideId;
  label: string;
  hint: string;
  /** Слайд-инфографика допускает текст; главное фото — нет */
  clean?: boolean;
}

export const SLIDES: SlideDef[] = [
  { id: "main", label: "Главное фото", hint: "Чистый товар без текста — проходит модерацию", clean: true },
  { id: "promo", label: "Промо-обложка", hint: "Название, плюсы, цена — для рекламы и соцсетей" },
  { id: "benefits", label: "Преимущества", hint: "Инфографика: почему стоит купить" },
  { id: "specs", label: "Характеристики", hint: "Таблица параметров товара" },
  { id: "box", label: "Комплектация", hint: "Что в коробке и габариты" },
  { id: "trust", label: "Гарантии", hint: "Рейтинг, доставка, возврат" },
];

export type MarketFormatId = "portrait" | "square";

export interface MarketFormat {
  id: MarketFormatId;
  label: string;
  ratio: string;
  use: string;
  W: number;
  H: number;
}

export const MARKET_FORMATS: MarketFormat[] = [
  { id: "portrait", label: "3:4 вертикаль", ratio: "3:4", use: "Wildberries, Ozon, Яндекс Маркет", W: 900, H: 1200 },
  { id: "square", label: "1:1 квадрат", ratio: "1:1", use: "Яндекс Маркет, Avito, соцсети, Ozon Fresh", W: 1000, H: 1000 },
];

export const BENEFIT_SLOTS = 6;
export const SPEC_SLOTS = 8;
export const BOX_SLOTS = 6;
export const DIM_SLOTS = 4;
export const TRUST_SLOTS = 4;

export interface MarketData {
  brand: string;
  brandSub: string;
  title: string;
  tagline: string;
  badge: string;
  price: string;
  oldPrice: string;
  discountLabel: string;
  sold: string;
  rating: string;
  reviews: string;
  site: string;
  benefits: Feature[];
  specs: Spec[];
  box: string[];
  dims: Spec[];
  trust: Feature[];
  hBenefits: string;
  hSpecs: string;
  hBox: string;
  hTrust: string;
  listing: string;
  keywords: string;
}

export const ML = {
  brand: 22, brandSub: 30, title: 60, tagline: 42, badge: 22, price: 12, oldPrice: 12, discountLabel: 8, sold: 26,
  rating: 5, reviews: 22, site: 30,
  benTitle: 28, benText: 90, specLabel: 24, specValue: 28, box: 34, dimLabel: 20, dimValue: 22,
  trustTitle: 26, trustText: 70, heading: 26, listing: 1500, keywords: 240,
};

export interface MarketOptions {
  enabled: Record<SlideId, boolean>;
  showPrice: boolean;
  showRating: boolean;
  showBadge: boolean;
  showPattern: boolean;
  photoMode: "frame" | "blend";
  cleanWhite: boolean;
  overlay: number;
  headScale: number;
}

export interface MarketProject {
  data: MarketData;
  themeId: ThemeId;
  custom: CustomColors;
  bgId: BgId;
  format: MarketFormatId;
  opts: MarketOptions;
  images: Images;
}

function fill<T>(list: (Partial<T> | undefined)[] | undefined, n: number, blank: T): T[] {
  return Array.from({ length: n }, (_, i) => ({ ...blank, ...(list?.[i] ?? {}) }));
}
export const fillBenefits = (l?: Partial<Feature>[]) => fill<Feature>(l, BENEFIT_SLOTS, { title: "", text: "" });
export const fillSpecs = (l?: Partial<Spec>[]) => fill<Spec>(l, SPEC_SLOTS, { label: "", value: "" });
export const fillDims = (l?: Partial<Spec>[]) => fill<Spec>(l, DIM_SLOTS, { label: "", value: "" });
export const fillTrust = (l?: Partial<Feature>[]) => fill<Feature>(l, TRUST_SLOTS, { title: "", text: "" });
export const fillBox = (l: string[] = []) => Array.from({ length: BOX_SLOTS }, (_, i) => l[i] ?? "");

export const DEFAULT_MARKET: MarketData = {
  brand: "SONIQ",
  brandSub: "Официальный магазин",
  title: "Беспроводные наушники SONIQ Air Pro",
  tagline: "шумоподавление и 40 часов музыки",
  badge: "Новинка",
  price: "4 990 ₽",
  oldPrice: "7 490 ₽",
  discountLabel: "−33%",
  sold: "5 000+ купили",
  rating: "4.9",
  reviews: "2 140 отзывов",
  site: "",
  benefits: fillBenefits([
    { title: "Активное шумоподавление", text: "Гасит до 35 дБ городского шума" },
    { title: "40 часов без зарядки", text: "Быстрая зарядка: 10 минут дают 5 часов" },
    { title: "Чистый студийный звук", text: "Драйверы 40 мм и поддержка AAC" },
    { title: "Мягкие амбушюры", text: "Эко-кожа и memory-пена не давят на уши" },
    { title: "Две связи одновременно", text: "Подключение к телефону и ноутбуку" },
    { title: "Складной корпус", text: "Компактно убирается в чехол" },
  ]),
  specs: fillSpecs([
    { label: "Тип", value: "Накладные закрытые" },
    { label: "Подключение", value: "Bluetooth 5.3" },
    { label: "Время работы", value: "до 40 часов" },
    { label: "Время зарядки", value: "2 часа" },
    { label: "Шумоподавление", value: "ANC до 35 дБ" },
    { label: "Драйверы", value: "40 мм" },
    { label: "Вес", value: "255 г" },
    { label: "Микрофон", value: "Есть, с шумодавом" },
  ]),
  box: fillBox([
    "Наушники SONIQ Air Pro",
    "Жёсткий чехол",
    "Кабель USB-C",
    "Аудиокабель 3,5 мм",
    "Инструкция на русском",
    "Гарантийный талон",
  ]),
  dims: fillDims([
    { label: "Вес", value: "255 г" },
    { label: "Упаковка", value: "20×18×8 см" },
    { label: "Цвет", value: "Чёрный" },
    { label: "Гарантия", value: "12 месяцев" },
  ]),
  trust: fillTrust([
    { title: "Гарантия 12 месяцев", text: "Официальная, ремонт или замена" },
    { title: "Быстрая доставка", text: "От 1 дня по всей России" },
    { title: "Возврат 14 дней", text: "Если товар не подошёл" },
    { title: "Проверено перед отправкой", text: "Каждый экземпляр тестируется" },
  ]),
  hBenefits: "Почему выбирают",
  hSpecs: "Характеристики",
  hBox: "Что в комплекте",
  hTrust: "Гарантии и отзывы",
  listing:
    "Беспроводные наушники SONIQ Air Pro подарят чистый звук и тишину в любом месте. Активное шумоподавление убирает шум улицы и транспорта, а аккумулятор работает до 40 часов. Мягкие амбушюры комфортны при длительном ношении, складной корпус легко убирается в чехол. Подключайтесь к двум устройствам одновременно и не пропускайте звонки.",
  keywords: "наушники беспроводные, наушники с шумоподавлением, bluetooth наушники, накладные наушники",
};

export const DEFAULT_MARKET_OPTS: MarketOptions = {
  enabled: { main: true, promo: true, benefits: true, specs: true, box: true, trust: true },
  showPrice: true,
  showRating: true,
  showBadge: true,
  showPattern: true,
  photoMode: "blend",
  cleanWhite: false,
  overlay: 80,
  headScale: 100,
};

export const DEFAULT_MARKET_PROJECT: MarketProject = {
  data: DEFAULT_MARKET,
  themeId: "lime-acid",
  custom: DEFAULT_CUSTOM,
  bgId: "auto",
  format: "portrait",
  opts: DEFAULT_MARKET_OPTS,
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
const arr = (v: unknown): unknown[] | null => (Array.isArray(v) ? v : null);

const THEME_IDS: string[] = [...THEME_LIST.map((t) => t.id), "custom"];
const BG_IDS: string[] = BG_ID_LIST;

export function normalizeMarket(raw: unknown): MarketProject {
  const r = obj(raw);
  const d = obj(r.data);
  const o = obj(r.opts);
  const c = obj(r.custom);
  const im = obj(r.images);
  const en = obj(o.enabled);
  const D = DEFAULT_MARKET;
  const DO = DEFAULT_MARKET_OPTS;

  const feat = (v: unknown, fb: Feature[], tl: number, xl: number): Feature[] => {
    const a = arr(v);
    return a ? a.map((x) => ({ title: str(obj(x).title, "", tl), text: str(obj(x).text, "", xl) })) : fb;
  };
  const spec = (v: unknown, fb: Spec[], ll: number, vl: number): Spec[] => {
    const a = arr(v);
    return a ? a.map((x) => ({ label: str(obj(x).label, "", ll), value: str(obj(x).value, "", vl) })) : fb;
  };
  const boxArr = arr(d.box);

  const data: MarketData = {
    brand: str(d.brand, D.brand, ML.brand),
    brandSub: str(d.brandSub, D.brandSub, ML.brandSub),
    title: str(d.title, D.title, ML.title),
    tagline: str(d.tagline, D.tagline, ML.tagline),
    badge: str(d.badge, D.badge, ML.badge),
    price: str(d.price, D.price, ML.price),
    oldPrice: str(d.oldPrice, D.oldPrice, ML.oldPrice),
    discountLabel: str(d.discountLabel, D.discountLabel, ML.discountLabel),
    sold: str(d.sold, D.sold, ML.sold),
    rating: str(d.rating, D.rating, ML.rating),
    reviews: str(d.reviews, D.reviews, ML.reviews),
    site: str(d.site, D.site, ML.site),
    benefits: fillBenefits(feat(d.benefits, D.benefits, ML.benTitle, ML.benText)),
    specs: fillSpecs(spec(d.specs, D.specs, ML.specLabel, ML.specValue)),
    box: fillBox(boxArr ? boxArr.map((x) => str(x, "", ML.box)) : D.box),
    dims: fillDims(spec(d.dims, D.dims, ML.dimLabel, ML.dimValue)),
    trust: fillTrust(feat(d.trust, D.trust, ML.trustTitle, ML.trustText)),
    hBenefits: str(d.hBenefits, D.hBenefits, ML.heading),
    hSpecs: str(d.hSpecs, D.hSpecs, ML.heading),
    hBox: str(d.hBox, D.hBox, ML.heading),
    hTrust: str(d.hTrust, D.hTrust, ML.heading),
    listing: str(d.listing, D.listing, ML.listing),
    keywords: str(d.keywords, D.keywords, ML.keywords),
  };

  const images: Images = { logo: img(im.logo), bg: img(im.bg), mock: img(im.mock) };
  const rawBg = typeof r.bgId === "string" ? r.bgId : "auto";
  let bgId: BgId = BG_IDS.includes(rawBg) ? (rawBg as BgId) : "auto";
  if (bgId === "custom" && !images.bg) bgId = "auto";
  const rawTheme = typeof r.themeId === "string" ? r.themeId : "";

  return {
    data,
    themeId: THEME_IDS.includes(rawTheme) ? (rawTheme as ThemeId) : DEFAULT_MARKET_PROJECT.themeId,
    custom: {
      a1: typeof c.a1 === "string" && HEX.test(c.a1) ? c.a1 : DEFAULT_CUSTOM.a1,
      a2: typeof c.a2 === "string" && HEX.test(c.a2) ? c.a2 : DEFAULT_CUSTOM.a2,
      base: typeof c.base === "string" && HEX.test(c.base) ? c.base : DEFAULT_CUSTOM.base,
      light: bool(c.light, DEFAULT_CUSTOM.light),
    },
    bgId,
    format: MARKET_FORMATS.some((f) => f.id === r.format) ? (r.format as MarketFormatId) : "portrait",
    opts: {
      enabled: {
        main: bool(en.main, DO.enabled.main),
        promo: bool(en.promo, DO.enabled.promo),
        benefits: bool(en.benefits, DO.enabled.benefits),
        specs: bool(en.specs, DO.enabled.specs),
        box: bool(en.box, DO.enabled.box),
        trust: bool(en.trust, DO.enabled.trust),
      },
      showPrice: bool(o.showPrice, DO.showPrice),
      showRating: bool(o.showRating, DO.showRating),
      showBadge: bool(o.showBadge, DO.showBadge),
      showPattern: bool(o.showPattern, DO.showPattern),
      photoMode: o.photoMode === "frame" ? "frame" : "blend",
      cleanWhite: bool(o.cleanWhite, DO.cleanWhite),
      overlay: num(o.overlay, DO.overlay, 0, 100),
      headScale: num(o.headScale, DO.headScale, 70, 130),
    },
    images,
  };
}

/** Готовый текст для полей карточки на площадке */
export function buildMarketText(d: MarketData): string {
  const L: string[] = [];
  L.push(`НАЗВАНИЕ (${d.title.length}/60)`, d.title, "");
  const desc =
    d.listing.trim() ||
    [d.tagline, ...d.benefits.filter((b) => b.title).map((b) => `• ${b.title}${b.text ? `: ${b.text}` : ""}`)].filter(Boolean).join("\n");
  if (desc) L.push("ОПИСАНИЕ", desc, "");
  const specs = d.specs.filter((s) => s.label || s.value);
  if (specs.length) {
    L.push("ХАРАКТЕРИСТИКИ");
    specs.forEach((s) => L.push(`${s.label}${s.label && s.value ? ": " : ""}${s.value}`));
    L.push("");
  }
  const box = d.box.filter(Boolean);
  if (box.length) L.push("КОМПЛЕКТАЦИЯ", ...box.map((b) => `• ${b}`), "");
  const dims = d.dims.filter((s) => s.label || s.value);
  if (dims.length) L.push("ГАБАРИТЫ И ДАННЫЕ", ...dims.map((s) => `${s.label}: ${s.value}`), "");
  const trust = d.trust.filter((t) => t.title);
  if (trust.length) L.push("ГАРАНТИИ", ...trust.map((t) => `✓ ${t.title}${t.text ? ` — ${t.text}` : ""}`), "");
  if (d.keywords.trim()) L.push("КЛЮЧЕВЫЕ СЛОВА", d.keywords.trim());
  return L.join("\n").trim();
}
