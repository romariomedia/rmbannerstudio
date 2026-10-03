import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ClipboardCopy, FileDown, FileText, FileUp, ImageDown, Redo2, Undo2,
} from "lucide-react";
import { SaveBadge } from "./ui";
import { renderToDataUrl, wait } from "../lib/exporter";
import ProductSheet from "./ProductSheet";
import ProductControls from "./ProductControls";
import PreviewFrame from "./PreviewFrame";
import {
  DEFAULT_PRODUCT_PROJECT, PRODUCT_FORMATS, buildProductText, normalizeProduct,
  type ProductData, type ProductFormatId, type ProductOptions, type ProductProject,
} from "../lib/product";
import { PRODUCT_PRESETS, type ProductPreset } from "../lib/productPresets";
import { MOCKS, THEME_LIST, getTheme, resolveBg, themeSwatch, type BgId, type CustomColors, type ThemeId } from "../lib/themes";
import { useProject } from "../lib/useProject";
import { downloadDataUrl, downloadText, loadImageFile, slug } from "../lib/utils";

const STORAGE_KEY = "rm-banner-studio:product:v1";
type SimpleKey = Exclude<keyof ProductData, "features" | "specs" | "perks">;

const loadInitial = (): ProductProject => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeProduct(JSON.parse(raw));
  } catch {
    /* повреждённое сохранение — начинаем заново */
  }
  return DEFAULT_PRODUCT_PROJECT;
};

const slim = (p: ProductProject): ProductProject => ({
  ...p,
  images: { logo: null, bg: null, mock: null },
  bgId: p.bgId === "custom" ? "auto" : p.bgId,
});


interface Props {
  showToast: (msg: string, kind?: "ok" | "error") => void;
}

export default function ProductStudio({ showToast }: Props) {
  const { project, update, undo, redo, canUndo, canRedo, saveState } = useProject<ProductProject>(STORAGE_KEY, loadInitial, slim);
  const [exporting, setExporting] = useState(false);
  const [quality, setQuality] = useState<1 | 2>(1);
  const [overflow, setOverflow] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const { data, opts, images } = project;
  const theme = useMemo(() => getTheme(project.themeId, project.custom), [project.themeId, project.custom]);
  const bg = useMemo(() => resolveBg(theme.bg, project.bgId, images.bg), [theme.bg, project.bgId, images.bg]);
  const format = PRODUCT_FORMATS.find((f) => f.id === project.format) ?? PRODUCT_FORMATS[0];
  const photo = images.mock ?? MOCKS[theme.mock];

  // горячие клавиши (только пока открыт этот модуль)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && k === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // ---------- обработчики ----------
  const setField = useCallback((k: SimpleKey, v: string) => update((p) => ({ ...p, data: { ...p.data, [k]: v } })), [update]);
  const setFeature = useCallback(
    (i: number, k: "title" | "text", v: string) =>
      update((p) => ({ ...p, data: { ...p.data, features: p.data.features.map((x, j) => (j === i ? { ...x, [k]: v } : x)) } })),
    [update],
  );
  const setSpec = useCallback(
    (i: number, k: "label" | "value", v: string) =>
      update((p) => ({ ...p, data: { ...p.data, specs: p.data.specs.map((x, j) => (j === i ? { ...x, [k]: v } : x)) } })),
    [update],
  );
  const setPerk = useCallback(
    (i: number, v: string) => update((p) => ({ ...p, data: { ...p.data, perks: p.data.perks.map((x, j) => (j === i ? v : x)) } })),
    [update],
  );
  const setOpt = useCallback(
    <K extends keyof ProductOptions>(k: K, v: ProductOptions[K]) =>
      update((p) => ({ ...p, opts: { ...p.opts, [k]: v } }), typeof v === "number"), // ползунок — один шаг истории на всё движение
    [update],
  );
  const setTheme = useCallback((id: ThemeId) => update((p) => ({ ...p, themeId: id }), false), [update]);
  const setCustom = useCallback((patch: Partial<CustomColors>) => update((p) => ({ ...p, themeId: "custom", custom: { ...p.custom, ...patch } })), [update]);
  const setBg = useCallback((id: BgId) => update((p) => ({ ...p, bgId: id }), false), [update]);
  const setFormat = useCallback((id: ProductFormatId) => update((p) => ({ ...p, format: id }), false), [update]);

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
    (kind: "logo" | "bg" | "mock") =>
      update((p) => ({ ...p, images: { ...p.images, [kind]: null }, bgId: kind === "bg" && p.bgId === "custom" ? "auto" : p.bgId }), false),
    [update],
  );

  const applyPreset = (preset: ProductPreset) => {
    update((p) => ({ ...p, data: preset.data, themeId: preset.themeId, bgId: p.bgId === "custom" && p.images.bg ? p.bgId : "auto" }), false);
    showToast(`Шаблон «${preset.title}» применён`);
  };

  const randomStyle = () => {
    update((p) => {
      const pool = THEME_LIST.filter((t) => t.id !== p.themeId);
      return { ...p, themeId: pool[Math.floor(Math.random() * pool.length)].id, bgId: "auto" };
    }, false);
    showToast("Новый стиль применён");
  };

  const resetAll = () => {
    update(() => DEFAULT_PRODUCT_PROJECT, false);
    showToast("Проект сброшен. Вернуть его можно кнопкой «Отменить» (Ctrl+Z)");
  };

  // ---------- экспорт ----------
  const renderImage = async (type: "png" | "jpeg"): Promise<string> => {
    const node = canvasRef.current;
    if (!node) throw new Error("Холст не найден");
    setExporting(true);
    await wait(100);
    try {
      return await renderToDataUrl(node, { W: format.W, H: format.H, ratio: quality, type, bg: theme.base });
    } finally {
      setExporting(false);
    }
  };

  const fileBase = `${slug(data.name || data.brand)}-opisanie-${format.id}`;

  const doDownload = async (type: "png" | "jpeg") => {
    if (exporting) return;
    try {
      const url = await renderImage(type);
      downloadDataUrl(url, `${fileBase}-${format.W * quality}x${format.H * quality}.${type === "png" ? "png" : "jpg"}`);
      showToast(`Файл сохранён: ${format.W * quality}×${format.H * quality}`);
    } catch {
      showToast("Не удалось создать изображение. Попробуйте ещё раз или выберите качество 1×.", "error");
    }
  };

  const copyImage = async () => {
    if (exporting) return;
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      showToast("Ваш браузер не поддерживает копирование картинок. Используйте «Скачать PNG».", "error");
      return;
    }
    try {
      const url = await renderImage("png");
      const blob = await (await fetch(url)).blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("Описание скопировано как картинка");
    } catch {
      showToast("Не удалось скопировать. Скачайте PNG.", "error");
    }
  };

  const copyText = async () => {
    const text = buildProductText(data);
    try {
      await navigator.clipboard.writeText(text);
      showToast("Текст описания скопирован");
    } catch {
      downloadText(text, `${fileBase}.txt`, "text/plain;charset=utf-8");
      showToast("Буфер недоступен, текст сохранён в файл .txt");
    }
  };

  const saveTxt = () => {
    downloadText(buildProductText(data), `${fileBase}.txt`, "text/plain;charset=utf-8");
    showToast("Текст сохранён в файл .txt");
  };

  const saveProject = () => {
    downloadText(JSON.stringify({ app: "rm-banner-studio", module: "product", version: 1, ...project }, null, 2), `${fileBase}-project.json`);
    showToast("Проект сохранён в файл .json");
  };

  const openProject = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      update(() => normalizeProduct(parsed), false);
      showToast("Проект загружен");
    } catch {
      showToast("Файл проекта повреждён или имеет неверный формат", "error");
    }
  };

  return (
    <div>
      {/* стартовые шаблоны */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-[#0c0f07]/90 p-3 backdrop-blur">
        <div className="mb-2 px-1 text-[11px] font-extrabold tracking-[0.14em] text-white/45 uppercase">Стартовые шаблоны описания</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PRODUCT_PRESETS.map((pr) => {
            const th = getTheme(pr.themeId, project.custom);
            return (
              <button
                key={pr.id} type="button" onClick={() => applyPreset(pr)}
                className="group flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] py-2 pr-4 pl-2 text-left transition hover:border-lime-300/60 hover:bg-lime-300/[0.06]"
              >
                <span className="h-10 w-10 rounded-lg ring-1 ring-white/15" style={{ background: themeSwatch(th) }} />
                <span>
                  <span className="block text-[13px] font-extrabold">{pr.title}</span>
                  <span className="block text-[11px] text-white/45">{pr.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="order-2 lg:order-1">
          <ProductControls
            project={project} setField={setField} setFeature={setFeature} setSpec={setSpec} setPerk={setPerk} setOpt={setOpt}
            setTheme={setTheme} setCustom={setCustom} setBg={setBg} upload={upload} clearImage={clearImage}
            onRandom={randomStyle} onReset={resetAll}
          />
        </div>

        <div className="order-1 min-w-0 lg:sticky lg:top-[84px] lg:order-2 lg:self-start">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#0c0f07]/90 p-2 backdrop-blur">
            <div className="flex gap-1 overflow-x-auto">
              {PRODUCT_FORMATS.map((fm) => {
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

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-3 sm:p-4">
            <PreviewFrame W={format.W} H={format.H} fitViewport>
              <ProductSheet
                rootRef={canvasRef} data={data} theme={theme} bg={bg} opts={opts} format={format}
                logo={images.logo} photo={photo} onOverflow={setOverflow}
              />
            </PreviewFrame>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[12px] font-semibold text-white/45">
              <span className="font-mono">{format.W}×{format.H} px • {format.use}</span>
              {overflow && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 font-sans font-bold text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5" /> Не помещается — сократите текст или отключите блок
                </span>
              )}
            </div>
          </div>

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
              <button type="button" onClick={copyImage} disabled={exporting} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[12.5px] font-bold transition hover:bg-white/10 disabled:opacity-60">
                <ClipboardCopy className="h-4 w-4" /> Картинка
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2">
              <button type="button" onClick={copyText} className="inline-flex items-center gap-2 rounded-xl border border-lime-300/30 bg-lime-300/10 px-3.5 py-2 text-[12.5px] font-bold text-lime-200 transition hover:bg-lime-300/20">
                <ClipboardCopy className="h-4 w-4" /> Копировать текст
              </button>
              <button type="button" onClick={saveTxt} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-[12.5px] font-bold transition hover:bg-white/10">
                <FileText className="h-4 w-4" /> Текст .txt
              </button>
              <span className="hidden text-[11px] font-semibold text-white/35 md:inline">Для карточек маркетплейсов и сайта</span>
              <div className="ml-auto flex gap-1.5">
                <button type="button" onClick={saveProject} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-white/70 transition hover:bg-white/10 hover:text-lime-200">
                  <FileDown className="h-3.5 w-3.5" /> Проект в файл
                </button>
                <button type="button" onClick={() => importRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-white/70 transition hover:bg-white/10 hover:text-lime-200">
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
    </div>
  );
}
