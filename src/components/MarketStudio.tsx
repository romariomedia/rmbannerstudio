import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  AlertTriangle, Archive, ClipboardCopy, FileDown, FileText, FileUp, ImageDown, Info, Redo2, Undo2,
} from "lucide-react";
import { SaveBadge } from "./ui";
import { bytesOf, mb, renderToDataUrl, wait } from "../lib/exporter";
import MarketSlide from "./MarketSlide";
import MarketControls, { type MarketTextKey } from "./MarketControls";
import PreviewFrame from "./PreviewFrame";
import {
  DEFAULT_MARKET_PROJECT, MARKET_FORMATS, SLIDES, buildMarketText, normalizeMarket,
  type MarketFormatId, type MarketOptions, type MarketProject, type SlideId,
} from "../lib/market";
import { MARKET_PRESETS, type MarketPreset } from "../lib/marketPresets";
import { THEME_LIST, getTheme, resolveBg, themeSwatch, type BgId, type CustomColors, type ThemeId } from "../lib/themes";
import { useProject } from "../lib/useProject";
import { cutBlack, downloadDataUrl, downloadText, loadImageFile, slug } from "../lib/utils";
import sample from "../assets/product-sample.jpg";

const STORAGE_KEY = "rm-banner-studio:market:v1";
const MAX_BYTES = 10 * 1024 * 1024;

const loadInitial = (): MarketProject => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeMarket(JSON.parse(raw));
  } catch {
    /* повреждённое сохранение — начинаем заново */
  }
  return DEFAULT_MARKET_PROJECT;
};

const slim = (p: MarketProject): MarketProject => ({
  ...p,
  images: { logo: null, bg: null, mock: null },
  bgId: p.bgId === "custom" ? "auto" : p.bgId,
});


interface Props {
  showToast: (msg: string, kind?: "ok" | "error") => void;
}

export default function MarketStudio({ showToast }: Props) {
  const { project, update, undo, redo, canUndo, canRedo, saveState } = useProject<MarketProject>(STORAGE_KEY, loadInitial, slim);
  const deferred = useDeferredValue(project);

  const [active, setActive] = useState<SlideId>("main");
  const [quality, setQuality] = useState<1 | 2>(1);
  const [fileType, setFileType] = useState<"png" | "jpeg">("jpeg");
  const [exporting, setExporting] = useState(false);
  const [batch, setBatch] = useState(false);
  const [ov, setOv] = useState<Partial<Record<SlideId, boolean>>>({});

  const canvasRef = useRef<HTMLDivElement>(null);
  const batchRefs = useRef<Partial<Record<SlideId, HTMLDivElement | null>>>({});
  const importRef = useRef<HTMLInputElement>(null);

  const { data, opts, images } = project;
  const format = MARKET_FORMATS.find((f) => f.id === project.format) ?? MARKET_FORMATS[0];
  const theme = useMemo(() => getTheme(project.themeId, project.custom), [project.themeId, project.custom]);
  const bg = useMemo(() => resolveBg(theme.bg, project.bgId, images.bg), [theme.bg, project.bgId, images.bg]);
  const photo = images.mock ?? sample;
  const dPhoto = deferred.images.mock ?? sample;

  // фото с вырезанным чёрным фоном (для режима «Растворить тёмный фон»)
  const [cuts, setCuts] = useState<Record<string, string | null>>({});
  useEffect(() => {
    let dead = false;
    for (const src of new Set([photo, dPhoto])) {
      cutBlack(src).then((url) => {
        if (!dead) setCuts((c) => (c[src] === url ? c : { ...c, [src]: url }));
      });
    }
    return () => {
      dead = true;
    };
  }, [photo, dPhoto]);
  const cutOf = (src: string) => cuts[src] ?? null;

  const dTheme = useMemo(() => getTheme(deferred.themeId, deferred.custom), [deferred.themeId, deferred.custom]);
  const dBg = useMemo(() => resolveBg(dTheme.bg, deferred.bgId, deferred.images.bg), [dTheme.bg, deferred.bgId, deferred.images.bg]);
  const dFormat = MARKET_FORMATS.find((f) => f.id === deferred.format) ?? MARKET_FORMATS[0];

  const enabledSlides = SLIDES.filter((s) => opts.enabled[s.id]);

  // горячие клавиши
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
  const setField = useCallback((k: MarketTextKey, v: string) => update((p) => ({ ...p, data: { ...p.data, [k]: v } })), [update]);
  const setBenefit = useCallback(
    (i: number, k: "title" | "text", v: string) => update((p) => ({ ...p, data: { ...p.data, benefits: p.data.benefits.map((x, j) => (j === i ? { ...x, [k]: v } : x)) } })),
    [update],
  );
  const setSpec = useCallback(
    (i: number, k: "label" | "value", v: string) => update((p) => ({ ...p, data: { ...p.data, specs: p.data.specs.map((x, j) => (j === i ? { ...x, [k]: v } : x)) } })),
    [update],
  );
  const setBox = useCallback(
    (i: number, v: string) => update((p) => ({ ...p, data: { ...p.data, box: p.data.box.map((x, j) => (j === i ? v : x)) } })),
    [update],
  );
  const setDim = useCallback(
    (i: number, k: "label" | "value", v: string) => update((p) => ({ ...p, data: { ...p.data, dims: p.data.dims.map((x, j) => (j === i ? { ...x, [k]: v } : x)) } })),
    [update],
  );
  const setTrust = useCallback(
    (i: number, k: "title" | "text", v: string) => update((p) => ({ ...p, data: { ...p.data, trust: p.data.trust.map((x, j) => (j === i ? { ...x, [k]: v } : x)) } })),
    [update],
  );
  const setOpt = useCallback(
    <K extends keyof MarketOptions>(k: K, v: MarketOptions[K]) =>
      update((p) => ({ ...p, opts: { ...p.opts, [k]: v } }), typeof v === "number"), // ползунок — один шаг истории на всё движение
    [update],
  );
  const toggleSlide = (id: SlideId) =>
    update((p) => ({ ...p, opts: { ...p.opts, enabled: { ...p.opts.enabled, [id]: !p.opts.enabled[id] } } }), false);
  const setTheme = useCallback((id: ThemeId) => update((p) => ({ ...p, themeId: id }), false), [update]);
  const setCustom = useCallback((patch: Partial<CustomColors>) => update((p) => ({ ...p, themeId: "custom", custom: { ...p.custom, ...patch } })), [update]);
  const setBg = useCallback((id: BgId) => update((p) => ({ ...p, bgId: id }), false), [update]);
  const setFormat = useCallback((id: MarketFormatId) => update((p) => ({ ...p, format: id }), false), [update]);

  const upload = useCallback(
    (kind: "logo" | "bg" | "mock", file: File) => {
      loadImageFile(file, kind === "bg" ? 2400 : kind === "mock" ? 2000 : 800, kind === "logo" ? true : kind === "mock" ? "auto" : false)
        .then((url) => {
          update((p) => ({ ...p, images: { ...p.images, [kind]: url }, bgId: kind === "bg" ? "custom" : p.bgId }), false);
          showToast(kind === "logo" ? "Логотип загружен" : kind === "bg" ? "Фон загружен" : "Фото товара загружено");
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

  const applyPreset = (pr: MarketPreset) => {
    update((p) => ({ ...p, data: pr.data, themeId: pr.themeId, bgId: p.bgId === "custom" && p.images.bg ? p.bgId : "auto" }), false);
    showToast(`Шаблон «${pr.title}» применён`);
  };

  const randomStyle = () => {
    update((p) => {
      const pool = THEME_LIST.filter((t) => t.id !== p.themeId);
      return { ...p, themeId: pool[Math.floor(Math.random() * pool.length)].id, bgId: "auto" };
    }, false);
    showToast("Новый стиль применён");
  };

  const resetAll = () => {
    update(() => DEFAULT_MARKET_PROJECT, false);
    showToast("Проект сброшен. Вернуть его можно кнопкой «Отменить» (Ctrl+Z)");
  };

  // ---------- экспорт ----------
  const bgFor = (id: SlideId) => (id === "main" && opts.cleanWhite ? "#ffffff" : theme.base);

  const renderNode = async (node: HTMLElement, id: SlideId, type: "png" | "jpeg"): Promise<string> => {
    return renderToDataUrl(node, { W: format.W, H: format.H, ratio: quality, type, bg: bgFor(id) });
  };

  const ext = fileType === "png" ? "png" : "jpg";
  const dimsLabel = `${format.W * quality}x${format.H * quality}`;
  const baseName = slug(data.title || data.brand);

  const downloadSlide = async () => {
    const node = canvasRef.current;
    if (!node || exporting) return;
    setExporting(true);
    try {
      await wait(60);
      const url = await renderNode(node, active, fileType);
      const size = bytesOf(url);
      downloadDataUrl(url, `${baseName}-${String(SLIDES.findIndex((s) => s.id === active) + 1).padStart(2, "0")}-${active}-${dimsLabel}.${ext}`);
      if (size > MAX_BYTES) showToast(`Файл ${mb(size)} МБ — больше лимита площадок (10 МБ). Выберите JPG или качество 1×.`, "error");
      else showToast(`Слайд сохранён: ${format.W * quality}×${format.H * quality}, ${mb(size)} МБ`);
    } catch {
      showToast("Не удалось создать изображение. Попробуйте ещё раз или выберите качество 1×.", "error");
    } finally {
      setExporting(false);
    }
  };

  const downloadAll = async () => {
    if (exporting) return;
    if (enabledSlides.length === 0) {
      showToast("Включите хотя бы один слайд в наборе", "error");
      return;
    }
    setExporting(true);
    setBatch(true);
    try {
      await wait(450);
      const zip = new JSZip();
      let oversize = 0;
      for (const s of enabledSlides) {
        const node = batchRefs.current[s.id];
        if (!node) throw new Error("slide not rendered");
        const url = await renderNode(node, s.id, fileType);
        if (bytesOf(url) > MAX_BYTES) oversize++;
        const n = String(SLIDES.findIndex((x) => x.id === s.id) + 1).padStart(2, "0");
        zip.file(`${n}-${s.id}.${ext}`, url.slice(url.indexOf(",") + 1), { base64: true });
      }
      zip.file("описание.txt", buildMarketText(data));
      const blob = await zip.generateAsync({ type: "blob" });
      const href = URL.createObjectURL(blob);
      downloadDataUrl(href, `${baseName}-nabor-${dimsLabel}.zip`);
      setTimeout(() => URL.revokeObjectURL(href), 4000);
      if (oversize > 0) showToast(`Набор сохранён, но ${oversize} файл(ов) больше 10 МБ. Выберите JPG или качество 1×.`, "error");
      else showToast(`Набор сохранён: ${enabledSlides.length} слайд(ов) + описание.txt`);
    } catch {
      showToast("Не удалось собрать набор. Попробуйте качество 1× или формат JPG.", "error");
    } finally {
      setBatch(false);
      setExporting(false);
    }
  };

  const copyImage = async () => {
    const node = canvasRef.current;
    if (!node || exporting) return;
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      showToast("Ваш браузер не поддерживает копирование картинок. Используйте скачивание.", "error");
      return;
    }
    setExporting(true);
    try {
      const url = await renderNode(node, active, "png");
      const blob = await (await fetch(url)).blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("Слайд скопирован как картинка");
    } catch {
      showToast("Не удалось скопировать. Скачайте файл.", "error");
    } finally {
      setExporting(false);
    }
  };

  const copyText = async () => {
    const text = buildMarketText(data);
    try {
      await navigator.clipboard.writeText(text);
      showToast("Текст для карточки скопирован");
    } catch {
      downloadText(text, `${baseName}-opisanie.txt`, "text/plain;charset=utf-8");
      showToast("Буфер недоступен, текст сохранён в файл .txt");
    }
  };

  const saveTxt = () => {
    downloadText(buildMarketText(data), `${baseName}-opisanie.txt`, "text/plain;charset=utf-8");
    showToast("Текст сохранён в файл .txt");
  };

  const saveProject = () => {
    downloadText(JSON.stringify({ app: "rm-banner-studio", module: "market", version: 1, ...project }, null, 2), `${baseName}-card-project.json`);
    showToast("Проект сохранён в файл .json");
  };

  const openProject = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      update(() => normalizeMarket(parsed), false);
      showToast("Проект загружен");
    } catch {
      showToast("Файл проекта повреждён или имеет неверный формат", "error");
    }
  };

  const activeDef = SLIDES.find((s) => s.id === active) ?? SLIDES[0];
  const activeOver = !!ov[active] && opts.enabled[active];

  return (
    <div>
      {/* шаблоны */}
      <div className="mb-4 rounded-2xl border border-white/10 bg-[#0c0f07]/90 p-3 backdrop-blur">
        <div className="mb-2 px-1 text-[11px] font-extrabold tracking-[0.14em] text-white/45 uppercase">Стартовые шаблоны карточки</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MARKET_PRESETS.map((pr) => {
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

      {/* набор слайдов */}
      <div className="mb-4 rounded-2xl border border-white/10 bg-[#0c0f07]/90 p-3 backdrop-blur">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="text-[11px] font-extrabold tracking-[0.14em] text-white/45 uppercase">Набор слайдов карточки • {enabledSlides.length} из {SLIDES.length}</div>
          <div className="text-[11px] font-semibold text-white/35">Галочка — слайд попадёт в набор и ZIP</div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {SLIDES.map((s, i) => {
            const on = opts.enabled[s.id];
            const isActive = s.id === active;
            return (
              <div key={s.id} className={`overflow-hidden rounded-xl border transition ${isActive ? "border-lime-300 ring-2 ring-lime-300/40" : "border-white/10 hover:border-white/30"}`}>
                <button type="button" onClick={() => setActive(s.id)} aria-pressed={isActive} aria-label={s.label} className="relative block w-full bg-black/40" style={{ opacity: on ? 1 : 0.4 }}>
                  <PreviewFrame W={dFormat.W} H={dFormat.H} rounded={0} className="[&>div]:!shadow-none [&>div]:!ring-0">
                    <MarketSlide
                      slide={s.id} data={deferred.data} theme={dTheme} bg={dBg} opts={deferred.opts} format={dFormat}
                      logo={deferred.images.logo} photo={dPhoto} photoCut={cutOf(dPhoto)}
                      onOverflow={(v) => setOv((prev) => (prev[s.id] === v ? prev : { ...prev, [s.id]: v }))}
                    />
                  </PreviewFrame>
                  <span className="absolute top-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[10px] font-bold">{i + 1}</span>
                  {on && ov[s.id] && (
                    <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-black" title="Текст не помещается">
                      <AlertTriangle className="h-3 w-3" />
                    </span>
                  )}
                </button>
                <div className="flex items-center justify-between gap-1 bg-black/50 px-2 py-1.5">
                  <span className="truncate text-[11px] font-extrabold">{s.label}</span>
                  <button
                    type="button" role="switch" aria-checked={on} aria-label={`Включить слайд «${s.label}»`} onClick={() => toggleSlide(s.id)}
                    className={`relative h-4 w-7 shrink-0 rounded-full transition ${on ? "bg-lime-300" : "bg-white/20"}`}
                  >
                    <span className={`absolute top-0.5 h-3 w-3 rounded-full transition-all ${on ? "left-[14px] bg-[#0a1000]" : "left-0.5 bg-white"}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2.5 rounded-xl border border-lime-300/20 bg-lime-300/[0.05] p-3 text-[12px] leading-relaxed text-white/65">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />
          <p>
            Требования Wildberries, Ozon и Яндекс Маркета: <b className="text-white">3:4, 900×1200 px</b>, JPG, PNG или WEBP, до <b className="text-white">10 МБ</b>.
            На <b className="text-white">главном фото</b> не должно быть текста, цен, скидок, логотипов и водяных знаков, поэтому слайд 1 сделан чистым.
            Промо-обложка нужна для рекламы и соцсетей, а инфографику (слайды 3–6) загружайте как дополнительные фото.
            Правила площадок меняются, перед загрузкой сверьтесь с кабинетом продавца.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="order-2 lg:order-1">
          <MarketControls
            project={project} setField={setField} setBenefit={setBenefit} setSpec={setSpec} setBox={setBox} setDim={setDim} setTrust={setTrust}
            setOpt={setOpt} setTheme={setTheme} setCustom={setCustom} setBg={setBg} upload={upload} clearImage={clearImage}
            onRandom={randomStyle} onReset={resetAll}
          />
        </div>

        <div className="order-1 min-w-0 lg:sticky lg:top-[84px] lg:order-2 lg:self-start">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#0c0f07]/90 p-2 backdrop-blur">
            <div className="flex gap-1 overflow-x-auto">
              {MARKET_FORMATS.map((fm) => {
                const isActive = fm.id === format.id;
                const r = fm.W / fm.H;
                return (
                  <button
                    key={fm.id} type="button" onClick={() => setFormat(fm.id)} aria-pressed={isActive}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-extrabold transition ${isActive ? "bg-lime-300 text-[#0a1000]" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
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
              <MarketSlide
                rootRef={canvasRef} slide={active} data={data} theme={theme} bg={bg} opts={opts} format={format}
                logo={images.logo} photo={photo} photoCut={cutOf(photo)}
              />
            </PreviewFrame>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[12px] font-semibold text-white/45">
              <span><b className="text-white/70">{SLIDES.findIndex((s) => s.id === active) + 1}. {activeDef.label}</b> • {activeDef.hint}</span>
              <span className="font-mono">{format.W}×{format.H} px</span>
            </div>
            {activeOver && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-[12px] font-bold text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" /> Текст не помещается: сократите его или уберите пункт
              </div>
            )}
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-[#0c0f07]/90 p-3 backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl border border-white/10 p-1" role="group" aria-label="Тип файла">
                {([["jpeg", "JPG"], ["png", "PNG"]] as const).map(([v, label]) => (
                  <button key={v} type="button" onClick={() => setFileType(v)} aria-pressed={fileType === v} className={`rounded-lg px-3 py-1.5 text-[12px] font-extrabold transition ${fileType === v ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex rounded-xl border border-white/10 p-1" role="group" aria-label="Качество">
                {([1, 2] as const).map((q) => (
                  <button key={q} type="button" onClick={() => setQuality(q)} aria-pressed={quality === q} className={`rounded-lg px-3 py-1.5 text-[12px] font-extrabold transition ${quality === q ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>
                    {q}× <span className="font-mono text-[10px] font-semibold opacity-70">{format.W * q}</span>
                  </button>
                ))}
              </div>
              <button
                type="button" onClick={downloadSlide} disabled={exporting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-lime-300/40 bg-lime-300/10 px-4 py-2.5 font-display text-[12.5px] font-bold text-lime-200 transition hover:bg-lime-300/20 disabled:opacity-60"
              >
                <ImageDown className="h-4 w-4" /> {exporting && !batch ? "Рендеринг…" : "Скачать слайд"}
              </button>
              <button type="button" onClick={copyImage} disabled={exporting} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[12.5px] font-bold transition hover:bg-white/10 disabled:opacity-60">
                <ClipboardCopy className="h-4 w-4" /> Картинка
              </button>
            </div>
            <button
              type="button" onClick={downloadAll} disabled={exporting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3.5 font-display text-[13px] font-bold text-[#0a1000] shadow-[0_14px_36px_-10px_rgba(163,230,53,0.65)] transition hover:bg-lime-200 disabled:opacity-60"
            >
              <Archive className="h-4 w-4" /> {batch ? "Собираем набор…" : `Скачать весь набор (${enabledSlides.length}) — ZIP`}
            </button>

            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2">
              <button type="button" onClick={copyText} className="inline-flex items-center gap-2 rounded-xl border border-lime-300/30 bg-lime-300/10 px-3.5 py-2 text-[12.5px] font-bold text-lime-200 transition hover:bg-lime-300/20">
                <ClipboardCopy className="h-4 w-4" /> Копировать текст
              </button>
              <button type="button" onClick={saveTxt} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-[12.5px] font-bold transition hover:bg-white/10">
                <FileText className="h-4 w-4" /> Текст .txt
              </button>
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

      {/* скрытый холст для пакетного экспорта */}
      {batch && (
        <div aria-hidden style={{ position: "fixed", left: -30000, top: 0, pointerEvents: "none" }}>
          {enabledSlides.map((s) => (
            <MarketSlide
              key={s.id} slide={s.id} data={data} theme={theme} bg={bg} opts={opts} format={format} logo={images.logo} photo={photo} photoCut={cutOf(photo)}
              rootRef={(el) => { batchRefs.current[s.id] = el; }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
