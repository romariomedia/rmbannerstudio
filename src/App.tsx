import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowDownToLine, Check, ClipboardCopy, FileDown, FileUp, ImageDown, Megaphone, Redo2,
  Sparkles, Undo2, Wand2, Zap, LayoutTemplate, MousePointerClick, Palette, X, ArrowRight, FileText, ShoppingBag,
} from "lucide-react";
import Banner from "./components/Banner";
import Controls from "./components/Controls";
import PreviewFrame from "./components/PreviewFrame";
import Templates from "./components/Templates";
import ProductStudio from "./components/ProductStudio";
import MarketStudio from "./components/MarketStudio";
import { SaveBadge } from "./components/ui";
import { PRESETS, type Preset } from "./lib/presets";
import { DEFAULT_OPTS, DEFAULT_PROJECT, FORMATS, normalizeProject, type BannerData, type FormatId, type Options, type Project } from "./lib/types";
import { MOCKS, THEME_LIST, getTheme, resolveBg, type BgId, type CustomColors, type ThemeId } from "./lib/themes";
import { downloadDataUrl, downloadText, loadImageFile, slug } from "./lib/utils";
import { renderToDataUrl, wait } from "./lib/exporter";
import { useProject } from "./lib/useProject";

const STORAGE_KEY = "rm-banner-studio:v1";
const MODULE_KEY = "rm-banner-studio:module";
type ModuleId = "banner" | "product" | "market";

function loadInitial(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeProject(JSON.parse(raw));
  } catch {
    /* повреждённое сохранение — начинаем заново */
  }
  return DEFAULT_PROJECT;
}

const slim = (p: Project): Project => ({
  ...p,
  images: { logo: null, bg: null, mock: null },
  bgId: p.bgId === "custom" ? "auto" : p.bgId,
});

type ToastState = { msg: string; kind: "ok" | "error" } | null;

export default function App() {
  const { project, update, undo, redo, canUndo, canRedo, saveState } = useProject<Project>(STORAGE_KEY, loadInitial, slim);

  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exporting, setExporting] = useState(false);
  const [quality, setQuality] = useState<1 | 2>(1);
  const [overflow, setOverflow] = useState(false);
  const [moduleId, setModuleId] = useState<ModuleId>(() => {
    try {
      const saved = localStorage.getItem(MODULE_KEY);
      return saved === "product" || saved === "market" ? saved : "banner";
    } catch {
      return "banner";
    }
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string, kind: "ok" | "error" = "ok") => {
    setToast({ msg, kind });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- горячие клавиши ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (moduleId !== "banner") return; // в других модулях свои горячие клавиши
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, moduleId]);

  // ---------- производные ----------
  const { data, opts, images } = project;
  const theme = useMemo(() => getTheme(project.themeId, project.custom), [project.themeId, project.custom]);
  const bg = useMemo(() => resolveBg(theme.bg, project.bgId, images.bg), [theme.bg, project.bgId, images.bg]);
  const format = FORMATS.find((f) => f.id === project.format) ?? FORMATS[0];
  const mock = images.mock ?? MOCKS[theme.mock];

  // ---------- обработчики ----------
  const setData = useCallback((k: keyof BannerData, v: string) => update((p) => ({ ...p, data: { ...p.data, [k]: v } })), [update]);
  const setOpt = useCallback(
    <K extends keyof Options>(k: K, v: Options[K]) =>
      update((p) => ({ ...p, opts: { ...p.opts, [k]: v } }), typeof v === "number"), // ползунок — один шаг истории на всё движение
    [update],
  );
  const setTheme = useCallback((id: ThemeId) => update((p) => ({ ...p, themeId: id }), false), [update]);
  const setCustom = useCallback((patch: Partial<CustomColors>) => update((p) => ({ ...p, themeId: "custom", custom: { ...p.custom, ...patch } })), [update]);
  const setBg = useCallback((id: BgId) => update((p) => ({ ...p, bgId: id }), false), [update]);
  const setFormat = useCallback((id: FormatId) => update((p) => ({ ...p, format: id }), false), [update]);

  const upload = useCallback(
    (kind: "logo" | "bg" | "mock", file: File) => {
      loadImageFile(file, kind === "bg" ? 2400 : kind === "mock" ? 1800 : 800, kind === "logo" ? true : kind === "mock" ? "auto" : false)
        .then((url) => {
          update((p) => ({ ...p, images: { ...p.images, [kind]: url }, bgId: kind === "bg" ? "custom" : p.bgId }), false);
          showToast(kind === "logo" ? "Логотип загружен" : kind === "bg" ? "Фон загружен" : "Изображение продукта загружено");
        })
        .catch((e: Error) => showToast(e.message || "Не удалось загрузить файл", "error"));
    },
    [update, showToast],
  );

  const clearImage = useCallback(
    (kind: "logo" | "bg" | "mock") => {
      update((p) => ({ ...p, images: { ...p.images, [kind]: null }, bgId: kind === "bg" && p.bgId === "custom" ? "auto" : p.bgId }), false);
    },
    [update],
  );

  const scrollToStudio = () => document.getElementById("studio")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const openModule = (id: ModuleId, scroll = true) => {
    setModuleId(id);
    try {
      localStorage.setItem(MODULE_KEY, id);
    } catch {
      /* хранилище недоступно — не критично */
    }
    if (scroll) setTimeout(scrollToStudio, 60);
  };

  const applyPreset = useCallback(
    (preset: Preset) => {
      update(
        (p) => ({
          ...p,
          data: preset.data,
          themeId: preset.themeId,
          bgId: preset.bgId === "custom" && !p.images.bg ? "auto" : preset.bgId,
          opts: { ...DEFAULT_OPTS, ...preset.opts, animate: p.opts.animate },
        }),
        false,
      );
      scrollToStudio();
      showToast(`Шаблон «${preset.title}» применён`);
    },
    [update, showToast],
  );

  const randomStyle = useCallback(() => {
    update((p) => {
      const pool = THEME_LIST.filter((t) => t.id !== p.themeId);
      const t = pool[Math.floor(Math.random() * pool.length)];
      return { ...p, themeId: t.id, bgId: "auto" };
    }, false);
    showToast("Новый стиль применён");
  }, [update, showToast]);

  const resetAll = useCallback(() => {
    update(() => DEFAULT_PROJECT, false);
    showToast("Проект сброшен. Вернуть его можно кнопкой «Отменить» (Ctrl+Z)");
  }, [update, showToast]);

  // ---------- экспорт ----------
  const renderImage = async (type: "png" | "jpeg"): Promise<string> => {
    const node = canvasRef.current;
    if (!node) throw new Error("Холст не найден");
    setExporting(true);
    await wait(150); // даём React убрать анимации
    try {
      return await renderToDataUrl(node, { W: format.W, H: format.H, ratio: quality, type, bg: theme.base });
    } finally {
      setExporting(false);
    }
  };

  const fileName = (ext: string) => `${slug(data.brand)}-${format.id}-${format.W * quality}x${format.H * quality}.${ext}`;

  const doDownload = async (type: "png" | "jpeg") => {
    if (exporting) return;
    try {
      const url = await renderImage(type);
      downloadDataUrl(url, fileName(type === "png" ? "png" : "jpg"));
      showToast(`Файл сохранён: ${format.W * quality}×${format.H * quality}`);
    } catch {
      showToast("Не удалось создать изображение. Попробуйте ещё раз или выберите качество 1×.", "error");
    }
  };

  const doCopy = async () => {
    if (exporting) return;
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      showToast("Ваш браузер не поддерживает копирование картинок. Используйте «Скачать PNG».", "error");
      return;
    }
    try {
      const url = await renderImage("png");
      const blob = await (await fetch(url)).blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("Баннер скопирован в буфер обмена");
    } catch {
      showToast("Не удалось скопировать. Скачайте PNG.", "error");
    }
  };

  const saveProject = () => {
    downloadText(JSON.stringify({ app: "rm-banner-studio", version: 1, ...project }, null, 2), `${slug(data.brand)}-project.json`);
    showToast("Проект сохранён в файл .json");
  };

  const openProject = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      update(() => normalizeProject(parsed), false);
      showToast("Проект загружен");
    } catch {
      showToast("Файл проекта повреждён или имеет неверный формат", "error");
    }
  };

  const downloadCurrent = () => {
    if (moduleId === "banner") doDownload("png");
    else {
      scrollToStudio();
      showToast(moduleId === "market" ? "Скачайте слайд или весь набор кнопками под превью" : "Скачайте описание кнопкой «Скачать PNG» под превью");
    }
  };

  const animated = opts.animate && !exporting;

  const marquee = ["БЕЛЫЕ ПРЕМИУМ-ГАММЫ", "6 ЛАЙМОВЫХ ГАММ", "РЕКЛАМНЫЕ БАННЕРЫ", "ОПИСАНИЕ ПРОДУКТА", "КАРТОЧКИ ДЛЯ WB И OZON", "НАБОР СЛАЙДОВ В ZIP", "СВОЙ ЛОГОТИП", "АВТОСОХРАНЕНИЕ", "РАБОТАЕТ ОФЛАЙН"];

  return (
    <div className="min-h-screen overflow-x-clip bg-[#070905] text-white">
      {/* фоновое свечение */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-48 left-1/2 h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-lime-400/[0.13] blur-[150px]" />
        <div className="absolute top-[45%] -left-48 h-[520px] w-[520px] rounded-full bg-emerald-500/[0.08] blur-[130px]" />
        <div className="absolute top-[65%] -right-48 h-[520px] w-[520px] rounded-full bg-lime-300/[0.07] blur-[130px]" />
      </div>

      {/* ШАПКА */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#070905]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-5">
          <a href="#top" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-200 to-lime-500 font-display text-[15px] font-extrabold text-[#0a1000] shadow-[0_0_30px_rgba(163,230,53,0.45)]">RM</span>
            <span className="leading-none">
              <span className="font-display block text-[15px] font-extrabold tracking-tight">
                RM Banner <span className="text-lime-300">studio</span>
              </span>
              <span className="mt-1 block font-mono text-[10px] tracking-[0.2em] text-white/45 uppercase">Конструктор рекламы</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-[13px] font-bold text-white/65 lg:flex">
            <button type="button" onClick={() => openModule("banner")} className={`transition hover:text-lime-300 ${moduleId === "banner" ? "text-lime-300" : ""}`}>Баннеры</button>
            <button type="button" onClick={() => openModule("product")} className={`transition hover:text-lime-300 ${moduleId === "product" ? "text-lime-300" : ""}`}>Описание продукта</button>
            <button type="button" onClick={() => openModule("market")} className={`transition hover:text-lime-300 ${moduleId === "market" ? "text-lime-300" : ""}`}>Карточка товара</button>
            {moduleId === "banner" && <a href="#templates" className="transition hover:text-lime-300">Шаблоны</a>}
            {moduleId === "banner" && <a href="#formats" className="transition hover:text-lime-300">Форматы</a>}
            <a href="#guide" className="transition hover:text-lime-300">Как работать</a>
          </nav>
          <button
            type="button" onClick={downloadCurrent} disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-4 py-2.5 text-[13px] font-extrabold text-[#0a1000] transition hover:bg-lime-200 disabled:opacity-60"
          >
            <ArrowDownToLine className="h-4 w-4" /> {moduleId === "banner" ? <><span className="hidden sm:inline">Скачать</span> PNG</> : "К редактору"}
          </button>
        </div>
      </header>

      {/* ПЕРВЫЙ ЭКРАН */}
      <section id="top" className="relative z-10 mx-auto max-w-7xl px-5 pt-[112px] pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-[12px] font-extrabold tracking-wide text-lime-200">
          <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300" /> Баннеры, описание продукта и карточки для маркетплейсов
        </div>
        <h1 className="font-display mx-auto mt-5 max-w-4xl text-[clamp(2rem,5.2vw,4rem)] leading-[1] font-extrabold tracking-tight">
          Реклама премиум-класса <span className="bg-gradient-to-r from-lime-200 via-lime-300 to-emerald-300 bg-clip-text text-transparent">за пару минут</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed font-medium text-white/60 sm:text-[17px]">
          Для бизнеса и недвижимости выберите спокойную белую гамму, для молодой аудитории — яркий лайм. Впишите текст и скачайте готовые файлы.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => openModule("banner")} className="group inline-flex items-center gap-2 rounded-2xl bg-lime-300 px-6 py-3.5 font-display text-[13px] font-bold text-[#0a1000] shadow-[0_18px_50px_-12px_rgba(163,230,53,0.6)] transition hover:scale-[1.03] hover:bg-lime-200">
            <Wand2 className="h-4 w-4" /> Создать баннер <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
          <button type="button" onClick={() => openModule("product")} className="inline-flex items-center gap-2 rounded-2xl border border-lime-300/40 bg-lime-300/10 px-6 py-3.5 font-display text-[13px] font-bold text-lime-200 transition hover:bg-lime-300/20">
            <FileText className="h-4 w-4" /> Описание продукта
          </button>
          <button type="button" onClick={() => openModule("market")} className="inline-flex items-center gap-2 rounded-2xl border border-lime-300/40 bg-lime-300/10 px-6 py-3.5 font-display text-[13px] font-bold text-lime-200 transition hover:bg-lime-300/20">
            <ShoppingBag className="h-4 w-4" /> Карточка товара
          </button>
          <button type="button" onClick={() => { openModule("banner", false); setTimeout(() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" }), 80); }} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-display text-[13px] font-bold transition hover:bg-white/10">
            <LayoutTemplate className="h-4 w-4" /> Шаблоны баннеров
          </button>
        </div>
      </section>

      {/* КОНСТРУКТОР */}
      <section id="studio" className="relative z-10 mx-auto max-w-7xl scroll-mt-[84px] px-5 pb-8">
        <div className="mb-5 grid gap-3 md:grid-cols-3" role="tablist" aria-label="Модуль">
          {([
            { id: "banner", icon: Megaphone, title: "Рекламный баннер", sub: `4 формата • ${PRESETS.length} шаблонов • PNG и JPG` },
            { id: "product", icon: FileText, title: "Описание продукта", sub: "Карточка, лист A4, слайд • текст" },
            { id: "market", icon: ShoppingBag, title: "Карточка товара", sub: "WB, Ozon, Маркет • 6 слайдов • ZIP" },
          ] as const).map((m) => {
            const active = moduleId === m.id;
            return (
              <button
                key={m.id} type="button" role="tab" aria-selected={active} onClick={() => openModule(m.id, false)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  active ? "border-lime-300 bg-lime-300/10 shadow-[0_16px_50px_-20px_rgba(163,230,53,0.55)]" : "border-white/10 bg-white/[0.03] hover:border-white/30"
                }`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${active ? "bg-lime-300 text-[#0a1000]" : "bg-white/10 text-white/70"}`}>
                  <m.icon className="h-6 w-6" />
                </span>
                <span>
                  <span className="font-display block text-[14px] font-bold">{m.title}</span>
                  <span className="mt-0.5 block text-[12px] font-semibold text-white/50">{m.sub}</span>
                </span>
              </button>
            );
          })}
        </div>

        {moduleId === "banner" ? (
          <div className="grid gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
            <div className="order-2 lg:order-1">
              <Controls
                project={project} setData={setData} setOpt={setOpt} setTheme={setTheme} setCustom={setCustom}
                setBg={setBg} upload={upload} clearImage={clearImage} onRandom={randomStyle} onReset={resetAll}
              />
            </div>

            <div className="order-1 min-w-0 lg:sticky lg:top-[84px] lg:order-2 lg:self-start">
              {/* панель над превью */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#0c0f07]/90 p-2 backdrop-blur">
                <div className="flex gap-1 overflow-x-auto">
                  {FORMATS.map((fm) => {
                    const active = fm.id === format.id;
                    const r = fm.W / fm.H;
                    return (
                      <button
                        key={fm.id} type="button" onClick={() => setFormat(fm.id)} aria-pressed={active}
                        className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-extrabold transition ${active ? "bg-lime-300 text-[#0a1000]" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
                      >
                        <span className="inline-block rounded-[3px] border-2 border-current" style={{ width: r >= 1 ? 20 : 20 * r, height: r >= 1 ? 20 / r : 20 }} />
                        {fm.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5">
                  <SaveBadge state={saveState} />
                  <button type="button" onClick={undo} disabled={!canUndo} aria-label="Отменить" title="Отменить (Ctrl+Z)" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 transition enabled:hover:bg-white/10 disabled:opacity-30">
                    <Undo2 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={redo} disabled={!canRedo} aria-label="Повторить" title="Повторить (Ctrl+Shift+Z)" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 transition enabled:hover:bg-white/10 disabled:opacity-30">
                    <Redo2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* превью */}
              <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-3 sm:p-4">
                <PreviewFrame W={format.W} H={format.H} fitViewport>
                  <Banner
                    rootRef={canvasRef} data={data} theme={theme} bg={bg} opts={opts} format={format}
                    logo={images.logo} mock={mock} customMock={!!images.mock} animated={animated} onOverflow={setOverflow}
                  />
                </PreviewFrame>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[12px] font-semibold text-white/45">
                  <span className="font-mono">{format.W}×{format.H} px • {format.use}</span>
                  {overflow && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 font-sans font-bold text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5" /> Текст не помещается — сократите его или отключите блок
                    </span>
                  )}
                </div>
              </div>

              {/* экспорт */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-[#0c0f07]/90 p-3 backdrop-blur">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-xl border border-white/10 p-1" role="group" aria-label="Качество">
                    {([1, 2] as const).map((q) => (
                      <button
                        key={q} type="button" onClick={() => setQuality(q)} aria-pressed={quality === q}
                        className={`rounded-lg px-3 py-1.5 text-[12px] font-extrabold transition ${quality === q ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
                      >
                        {q}× <span className="font-mono text-[10px] font-semibold opacity-70">{format.W * q}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button" onClick={() => doDownload("png")} disabled={exporting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-2.5 font-display text-[12.5px] font-bold text-[#0a1000] shadow-[0_12px_30px_-10px_rgba(163,230,53,0.6)] transition hover:bg-lime-200 disabled:opacity-60"
                  >
                    <ImageDown className="h-4 w-4" /> {exporting ? "Рендеринг…" : "Скачать PNG"}
                  </button>
                  <button type="button" onClick={() => doDownload("jpeg")} disabled={exporting} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[12.5px] font-bold transition hover:bg-white/10 disabled:opacity-60">
                    <FileDown className="h-4 w-4" /> JPG
                  </button>
                  <button type="button" onClick={doCopy} disabled={exporting} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[12.5px] font-bold transition hover:bg-white/10 disabled:opacity-60">
                    <ClipboardCopy className="h-4 w-4" /> Копировать
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 text-[12px]">
                  <span className="font-semibold text-white/40">Проект сохраняется в браузере автоматически</span>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={saveProject} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold text-white/70 transition hover:bg-white/10 hover:text-lime-200">
                      <FileDown className="h-3.5 w-3.5" /> Проект в файл
                    </button>
                    <button type="button" onClick={() => importRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold text-white/70 transition hover:bg-white/10 hover:text-lime-200">
                      <FileUp className="h-3.5 w-3.5" /> Открыть файл
                    </button>
                    <input
                      ref={importRef} type="file" accept=".json,application/json" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) openProject(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : moduleId === "product" ? (
          <ProductStudio showToast={showToast} />
        ) : (
          <MarketStudio showToast={showToast} />
        )}
      </section>

      {/* БЕГУЩАЯ СТРОКА */}
      <div className="relative z-10 mt-10 overflow-hidden border-y border-lime-300/20 bg-lime-300 py-3.5 text-[#0a1000]">
        <div className="ui-marquee flex w-max whitespace-nowrap font-display text-[13px] font-extrabold tracking-[0.16em]">
          {[0, 1].map((k) => (
            <div key={k} className="flex">
              {marquee.map((t, i) => (
                <span key={i} className="flex items-center gap-8 pr-8">
                  <span>{t}</span>
                  <Sparkles className="h-4 w-4" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {moduleId === "banner" && <Templates onApply={applyPreset} />}

      {/* ФОРМАТЫ */}
      {moduleId === "banner" && (
        <section id="formats" className="relative z-10 scroll-mt-24 border-y border-white/10 bg-[#090c05] py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="text-center">
              <h2 className="font-display mx-auto max-w-2xl text-[clamp(1.6rem,3.5vw,2.6rem)] leading-tight font-extrabold">Один проект — все площадки</h2>
              <p className="mx-auto mt-3 max-w-xl text-[14px] text-white/55">
                Переключите формат в конструкторе, и баннер перестроится под нужные пропорции. Тексты и стиль сохранятся.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FORMATS.map((fm) => {
                const r = fm.W / fm.H;
                return (
                  <button
                    key={fm.id} type="button"
                    onClick={() => { setFormat(fm.id); scrollToStudio(); }}
                    className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-lime-300/50 hover:bg-lime-300/[0.05]"
                  >
                    <div className="flex h-16 items-center">
                      <span
                        className="block rounded-lg border-2 border-lime-300 bg-lime-300/10 transition group-hover:bg-lime-300/25"
                        style={{ width: r >= 1 ? Math.min(96, 56 * r) : 56 * r, height: r >= 1 ? (r > 1.7 ? 40 : 56) : 56 }}
                      />
                    </div>
                    <div className="font-display mt-4 text-[14px] font-bold">{fm.label}</div>
                    <div className="mt-2 text-[13px] leading-relaxed text-white/55">{fm.use}</div>
                    <div className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] font-bold text-white/70">{fm.W}×{fm.H}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* КАК РАБОТАТЬ */}
      <section id="guide" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
        <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.6rem)] leading-tight font-extrabold">Как сделать сильную рекламу</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: MousePointerClick, n: "01", t: "Один посыл — одна кнопка", d: "Заголовок говорит о выгоде, кнопка — о действии. Лишние блоки отключайте во вкладке «Стиль»." },
            { icon: Palette, n: "02", t: "Гамма под аудиторию", d: "Недвижимость, консалтинг и услуги выигрывают от белых премиум-гамм, а молодёжные продукты — от лайма и неона. Если текст сливается с фоном, меняйте затемнение." },
            { icon: Zap, n: "03", t: "Проверьте в маленьком размере", d: "Посмотрите превью с расстояния. Заголовок и кнопка должны читаться, даже когда баннер размером с ладонь." },
          ].map((c) => (
            <div key={c.n} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-[#0a1000]"><c.icon className="h-5 w-5" /></span>
                <span className="font-mono text-[13px] font-bold text-white/25">{c.n}</span>
              </div>
              <div className="font-display mt-5 text-[15px] font-bold">{c.t}</div>
              <div className="mt-2 text-[13px] leading-relaxed text-white/55">{c.d}</div>
            </div>
          ))}
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[32px] border border-lime-300/25 bg-gradient-to-br from-lime-300/15 via-[#0c1205] to-[#070905] p-8 text-center sm:p-12">
          <h3 className="font-display mx-auto max-w-2xl text-[clamp(1.4rem,3vw,2.2rem)] leading-tight font-extrabold">
            Готовы? Макет уже ждёт вашего текста
          </h3>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={scrollToStudio} className="inline-flex items-center gap-2 rounded-2xl bg-lime-300 px-7 py-4 font-display text-[13px] font-extrabold text-[#0a1000] transition hover:scale-[1.03] hover:bg-lime-200">
              <Wand2 className="h-4 w-4" /> К конструктору
            </button>
            <button type="button" onClick={downloadCurrent} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-4 font-display text-[13px] font-bold transition hover:bg-white/10">
              <ArrowDownToLine className="h-4 w-4" /> {moduleId === "banner" ? "Скачать текущий PNG" : "К редактору"}
            </button>
          </div>
        </div>

        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[12px] font-semibold text-white/40 sm:flex-row">
          <div className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-lime-300" /> RM Banner studio • {new Date().getFullYear()}</div>
          <div className="font-mono tracking-wider">ВСЕ ДАННЫЕ ОСТАЮТСЯ В ВАШЕМ БРАУЗЕРЕ</div>
        </footer>
      </section>

      {/* ТОСТ */}
      {toast && (
        <div className="ui-toast fixed bottom-6 left-1/2 z-[60] w-max max-w-[92vw]" role="status" aria-live="polite">
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-black/90 px-5 py-3.5 shadow-2xl backdrop-blur-xl">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toast.kind === "ok" ? "bg-lime-300 text-[#0a1000]" : "bg-rose-500 text-white"}`}>
              {toast.kind === "ok" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </span>
            <span className="text-[13px] font-bold">{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
