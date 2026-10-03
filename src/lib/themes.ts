import bgNeon from "../../public/images/bg-neon.jpg";
import bgGold from "../../public/images/bg-gold.jpg";
import bgAurora from "../../public/images/bg-aurora.jpg";
import bgLime1 from "../assets/bg-lime1.jpg";
import bgLime2 from "../assets/bg-lime2.jpg";
import bgLime3 from "../assets/bg-lime3.jpg";
import mockViolet from "../assets/mock-violet.jpg";
import mockLime from "../assets/mock-lime.jpg";
import { alpha, readableOn } from "./utils";

export type BgId =
  | "auto"
  | "neon"
  | "gold"
  | "aurora"
  | "lime1"
  | "lime2"
  | "lime3"
  | "carbon"
  | "mesh"
  | "aura"
  | "marble"
  | "lines"
  | "custom";

export interface BgDef {
  id: BgId;
  label: string;
  /** Фон-картинка */
  src?: string;
  /** Статичный CSS-фон */
  css?: string;
  /** CSS-фон, который строится из цветов выбранной темы */
  dyn?: (t: Theme) => string;
}

export const BGS: BgDef[] = [
  { id: "auto", label: "Авто" },
  { id: "marble", label: "Мрамор", dyn: (t) => `repeating-linear-gradient(115deg, transparent 0 150px, ${alpha(t.text, 0.045)} 150px 152px, transparent 152px 330px), repeating-linear-gradient(62deg, transparent 0 230px, ${alpha(t.text, 0.035)} 230px 232px, transparent 232px 470px), radial-gradient(90% 70% at 18% 8%, ${alpha(t.glow1, 0.45)}, transparent 70%), radial-gradient(80% 70% at 88% 96%, ${alpha(t.glow2, 0.4)}, transparent 70%), ${t.base}` },
  { id: "lines", label: "Линии", dyn: (t) => `repeating-linear-gradient(90deg, transparent 0 119px, ${alpha(t.text, 0.07)} 119px 120px), linear-gradient(180deg, ${alpha(t.glow1, 0.4)}, transparent 45%), radial-gradient(70% 60% at 90% 100%, ${alpha(t.glow2, 0.35)}, transparent 70%), ${t.base}` },
  { id: "aura", label: "Сияние", dyn: (t) => `radial-gradient(75% 65% at 50% 0%, ${alpha(t.glow1, 0.6)}, transparent 70%), radial-gradient(60% 50% at 50% 100%, ${alpha(t.glow2, 0.45)}, transparent 70%), ${t.base}` },
  { id: "mesh", label: "Градиент", dyn: (t) => `radial-gradient(60% 55% at 12% 10%, ${alpha(t.glow1, 0.6)}, transparent 70%), radial-gradient(55% 60% at 92% 90%, ${alpha(t.glow2, 0.55)}, transparent 70%), radial-gradient(40% 40% at 72% 18%, ${alpha(t.a1, 0.18)}, transparent 70%), ${t.base}` },
  { id: "lime1", label: "Лайм 1", src: bgLime1 },
  { id: "lime2", label: "Лайм 2", src: bgLime2 },
  { id: "lime3", label: "Лайм 3", src: bgLime3 },
  { id: "neon", label: "Неон", src: bgNeon },
  { id: "gold", label: "Золото", src: bgGold },
  { id: "aurora", label: "Аврора", src: bgAurora },
  { id: "carbon", label: "Карбон", css: "repeating-linear-gradient(45deg,#0c0c10 0px,#0c0c10 7px,#121218 7px,#121218 14px)" },
];

export const BG_ID_LIST: string[] = [...BGS.map((b) => b.id), "custom"];

/** CSS-фон (если у фона нет картинки) */
export function bgCss(b: BgDef, t: Theme): string | undefined {
  return b.dyn ? b.dyn(t) : b.css;
}

export type ThemeId =
  | "prem-pearl"
  | "prem-ice"
  | "prem-navy"
  | "prem-emerald"
  | "prem-rose"
  | "prem-graphite"
  | "lime-acid"
  | "lime-toxic"
  | "lime-forest"
  | "lime-citrus"
  | "lime-violet"
  | "lime-light"
  | "neon"
  | "gold"
  | "aurora"
  | "light"
  | "sunset"
  | "custom";

export interface Theme {
  id: ThemeId;
  label: string;
  group: "premium" | "lime" | "classic" | "custom";
  light: boolean;
  base: string;
  text: string;
  a1: string;
  a2: string;
  a3: string;
  acc: string;
  ctaBg: string;
  ctaText: string;
  glow1: string;
  glow2: string;
  bg: BgId;
  mock: "violet" | "lime";
}

export interface CustomColors {
  a1: string;
  a2: string;
  base: string;
  light: boolean;
}

export const DEFAULT_CUSTOM: CustomColors = {
  a1: "#bef264",
  a2: "#22d3ee",
  base: "#071008",
  light: false,
};

const DARK_TEXT = "#ffffff";
const LIGHT_TEXT = "#0f1a05";

export const THEME_LIST: Theme[] = [
  // ---------- БЕЛЫЕ ПРЕМИУМ-ГАММЫ ----------
  {
    id: "prem-pearl", label: "Жемчуг", group: "premium", light: true,
    base: "#faf8f4", text: "#1b1a17",
    a1: "#1b1a17", a2: "#6b5a3e", a3: "#a07f45", acc: "#9a7b3f",
    ctaBg: "#1b1a17", ctaText: "#f7ecd5",
    glow1: "#e8dcc4", glow2: "#f2e9d8", bg: "marble", mock: "violet",
  },
  {
    id: "prem-ice", label: "Лёд", group: "premium", light: true,
    base: "#f7f9fb", text: "#0f172a",
    a1: "#0f172a", a2: "#334155", a3: "#64748b", acc: "#334155",
    ctaBg: "#0f172a", ctaText: "#ffffff",
    glow1: "#cfd8e3", glow2: "#e4eaf1", bg: "lines", mock: "violet",
  },
  {
    id: "prem-navy", label: "Бизнес", group: "premium", light: true,
    base: "#ffffff", text: "#0b1b33",
    a1: "#0b2a55", a2: "#1d4ed8", a3: "#3b82f6", acc: "#1d4ed8",
    ctaBg: "#0b2a55", ctaText: "#ffffff",
    glow1: "#bfd4fb", glow2: "#dbe7fd", bg: "aura", mock: "violet",
  },
  {
    id: "prem-emerald", label: "Изумруд", group: "premium", light: true,
    base: "#f6faf7", text: "#0b2218",
    a1: "#064e3b", a2: "#047857", a3: "#10b981", acc: "#047857",
    ctaBg: "#064e3b", ctaText: "#ffffff",
    glow1: "#bfe8d0", glow2: "#dcf3e6", bg: "aura", mock: "lime",
  },
  {
    id: "prem-rose", label: "Шампань", group: "premium", light: true,
    base: "#fdf8f6", text: "#2a1518",
    a1: "#7f1d3a", a2: "#be3a5a", a3: "#d98a9b", acc: "#be3a5a",
    ctaBg: "#2a1518", ctaText: "#fde8e3",
    glow1: "#f6cfd0", glow2: "#fbe5df", bg: "marble", mock: "violet",
  },
  {
    id: "prem-graphite", label: "Графит", group: "premium", light: false,
    base: "#0f1115", text: "#f4f1ea",
    a1: "#f4f1ea", a2: "#d9c08a", a3: "#b89b62", acc: "#d9c08a",
    ctaBg: "#f4f1ea", ctaText: "#0f1115",
    glow1: "#3a4150", glow2: "#8a7442", bg: "lines", mock: "violet",
  },
  // ---------- ЛАЙМОВЫЕ ГАММЫ ----------
  {
    id: "lime-acid", label: "Кислота", group: "lime", light: false,
    base: "#080b02", text: DARK_TEXT,
    a1: "#d9f99d", a2: "#a3e635", a3: "#bef264", acc: "#a3e635",
    ctaBg: "linear-gradient(90deg,#d9f99d,#a3e635)", ctaText: "#0a1000",
    glow1: "#65a30d", glow2: "#a3e635", bg: "lime1", mock: "lime",
  },
  {
    id: "lime-toxic", label: "Токсик", group: "lime", light: false,
    base: "#03100c", text: DARK_TEXT,
    a1: "#bef264", a2: "#4ade80", a3: "#22d3ee", acc: "#a3e635",
    ctaBg: "linear-gradient(90deg,#a3e635,#22d3ee)", ctaText: "#02120d",
    glow1: "#84cc16", glow2: "#06b6d4", bg: "lime2", mock: "lime",
  },
  {
    id: "lime-forest", label: "Лес", group: "lime", light: false,
    base: "#04130a", text: DARK_TEXT,
    a1: "#d9f99d", a2: "#86efac", a3: "#a3e635", acc: "#84cc16",
    ctaBg: "#d9f99d", ctaText: "#052e16",
    glow1: "#16a34a", glow2: "#a3e635", bg: "lime2", mock: "lime",
  },
  {
    id: "lime-citrus", label: "Цитрус", group: "lime", light: false,
    base: "#0c0a00", text: DARK_TEXT,
    a1: "#fef08a", a2: "#bef264", a3: "#facc15", acc: "#facc15",
    ctaBg: "linear-gradient(90deg,#fde047,#a3e635)", ctaText: "#1a1400",
    glow1: "#ca8a04", glow2: "#84cc16", bg: "lime3", mock: "lime",
  },
  {
    id: "lime-violet", label: "Лайм × Ультрафиолет", group: "lime", light: false,
    base: "#0d0618", text: DARK_TEXT,
    a1: "#bef264", a2: "#a3e635", a3: "#c4b5fd", acc: "#a3e635",
    ctaBg: "#bef264", ctaText: "#12081f",
    glow1: "#7c3aed", glow2: "#84cc16", bg: "lime1", mock: "violet",
  },
  {
    id: "lime-light", label: "Лайм Лайт", group: "lime", light: true,
    base: "#f7ffe5", text: LIGHT_TEXT,
    a1: "#3f6212", a2: "#65a30d", a3: "#84cc16", acc: "#65a30d",
    ctaBg: "#0f1a05", ctaText: "#bef264",
    glow1: "#bef264", glow2: "#d9f99d", bg: "mesh", mock: "lime",
  },
  // ---------- КЛАССИКА ----------
  {
    id: "neon", label: "Неон", group: "classic", light: false,
    base: "#0b0518", text: DARK_TEXT,
    a1: "#a78bfa", a2: "#f0abfc", a3: "#67e8f9", acc: "#d946ef",
    ctaBg: "#ffffff", ctaText: "#0b0518",
    glow1: "#7c3aed", glow2: "#06b6d4", bg: "neon", mock: "violet",
  },
  {
    id: "gold", label: "Люкс", group: "classic", light: false,
    base: "#0d0a02", text: DARK_TEXT,
    a1: "#fde68a", a2: "#facc15", a3: "#fcd34d", acc: "#fbbf24",
    ctaBg: "linear-gradient(90deg,#fcd34d,#eab308)", ctaText: "#111111",
    glow1: "#b45309", glow2: "#facc15", bg: "gold", mock: "violet",
  },
  {
    id: "aurora", label: "Аврора", group: "classic", light: false,
    base: "#03130f", text: DARK_TEXT,
    a1: "#a7f3d0", a2: "#5eead4", a3: "#d9f99d", acc: "#34d399",
    ctaBg: "#6ee7b7", ctaText: "#022c22",
    glow1: "#10b981", glow2: "#2dd4bf", bg: "aurora", mock: "lime",
  },
  {
    id: "light", label: "Светлый", group: "classic", light: true,
    base: "#f5f6ff", text: "#0b0b14",
    a1: "#4f46e5", a2: "#7c3aed", a3: "#c026d3", acc: "#4f46e5",
    ctaBg: "#0b0b14", ctaText: "#ffffff",
    glow1: "#a5b4fc", glow2: "#f0abfc", bg: "mesh", mock: "violet",
  },
  {
    id: "sunset", label: "Закат", group: "classic", light: false,
    base: "#1a0a05", text: DARK_TEXT,
    a1: "#fdba74", a2: "#fb923c", a3: "#fb7185", acc: "#fb923c",
    ctaBg: "linear-gradient(90deg,#f97316,#f43f5e)", ctaText: "#ffffff",
    glow1: "#ea580c", glow2: "#e11d48", bg: "mesh", mock: "violet",
  },
];

export function buildCustomTheme(c: CustomColors): Theme {
  const light = c.light;
  return {
    id: "custom", label: "Свой", group: "custom", light,
    base: c.base, text: light ? LIGHT_TEXT : DARK_TEXT,
    a1: c.a1, a2: c.a2, a3: c.a1, acc: c.a1,
    ctaBg: c.a1, ctaText: readableOn(c.a1),
    glow1: c.a1, glow2: c.a2, bg: "mesh", mock: "lime",
  };
}

export function getTheme(id: ThemeId, custom: CustomColors): Theme {
  if (id === "custom") return buildCustomTheme(custom);
  return THEME_LIST.find((t) => t.id === id) ?? THEME_LIST[0];
}

export function themeSwatch(t: Theme): string {
  return `linear-gradient(135deg, ${t.base} 0%, ${t.glow1} 38%, ${t.a2} 70%, ${t.a1} 100%)`;
}

export function textGradient(t: Theme): string {
  return `linear-gradient(90deg, ${t.a1}, ${t.a2}, ${t.a3})`;
}

export function resolveBg(themeBg: BgId, selected: BgId, customSrc: string | null): BgDef {
  if (selected === "custom") {
    return { id: "custom", label: "Свой", src: customSrc ?? undefined };
  }
  const id = selected === "auto" ? themeBg : selected;
  return BGS.find((b) => b.id === id) ?? (BGS.find((b) => b.id === "mesh") as BgDef);
}

/**
 * Подложка поверх фона. Затемнение работает ЛИНЕЙНО и для любого фона:
 * 0% — фон виден полностью, 100% — сплошной цвет темы.
 * Посередине подложка чуть гуще со стороны текста, чтобы он читался.
 */
export function scrim(t: Theme, overlay: number, dir: string, spread = 0.2, soft = false): string {
  let o = Math.min(1, Math.max(0, overlay / 100));
  // Для генерируемых фонов (мрамор, линии, сияние) рисунок тонкий: до 70% подложка мягкая,
  // а к 100% всё равно доходит до сплошного цвета.
  if (soft) o = o <= 0.7 ? o * 0.5 : 0.35 + ((o - 0.7) / 0.3) * 0.65;
  const k = (bias: number) => Math.min(1, Math.max(0, o + bias * 4 * o * (1 - o)));
  return `linear-gradient(${dir}, ${alpha(t.base, k(spread))} 0%, ${alpha(t.base, k(0))} 55%, ${alpha(t.base, k(-spread))} 100%)`;
}

export const MOCKS = { violet: mockViolet, lime: mockLime };
