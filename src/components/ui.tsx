import { useRef, type CSSProperties, type ReactNode } from "react";
import { Check, ChevronDown, CloudCheck, ImagePlus, RotateCcw, Sparkles, Trash2, Upload, Gem } from "lucide-react";
import {
  BGS, THEME_LIST, bgCss, buildCustomTheme, themeSwatch,
  type BgId, type CustomColors, type Theme, type ThemeId,
} from "../lib/themes";
import type { SaveState } from "../lib/useProject";

export function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-white/10 bg-white/[0.03]">
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-[12px] font-extrabold tracking-[0.12em] text-white/80 uppercase select-none">
        {title}
        <ChevronDown className="h-4 w-4 text-white/40 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-2.5 px-4 pb-4">{children}</div>
    </details>
  );
}

export function TextField({
  label, value, max, onChange, textarea, mono, placeholder, rows = 4,
}: {
  label: string; value: string; max: number; onChange: (v: string) => void;
  textarea?: boolean; mono?: boolean; placeholder?: string; rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[11px] font-bold text-white/50">
        {label}
        <span className={`font-mono text-[10px] ${value.length >= max ? "text-amber-300" : "text-white/25"}`}>{value.length}/{max}</span>
      </span>
      {textarea ? (
        <textarea
          value={value} maxLength={max} rows={rows} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`rm-input resize-none leading-relaxed ${mono ? "font-mono" : ""}`}
        />
      ) : (
        <input
          value={value} maxLength={max} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`rm-input ${mono ? "font-mono" : ""}`}
        />
      )}
    </label>
  );
}

export function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left transition hover:border-white/25"
    >
      <span>
        <span className="block text-[13px] font-bold">{label}</span>
        {hint && <span className="block text-[11px] text-white/45">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-lime-300" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full shadow transition-all ${on ? "left-[22px] bg-[#0a1000]" : "left-0.5 bg-white"}`} />
      </span>
    </button>
  );
}

/** Ползунок: широкая зона захвата, заливка до текущего значения, сброс к значению по умолчанию */
export function Slider({
  label, value, min, max, unit, onChange, def, ends,
}: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void;
  def?: number; ends?: [string, string];
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const changed = def !== undefined && value !== def;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 pt-3 pb-2.5">
      <div className="mb-1 flex items-center justify-between text-[12px] font-bold">
        <span>{label}</span>
        <span className="flex items-center gap-1.5">
          {changed && (
            <button
              type="button" onClick={() => onChange(def as number)} aria-label={`Сбросить: ${label}`} title="Сбросить"
              className="flex h-6 w-6 items-center justify-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-lime-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="min-w-[52px] rounded-md bg-lime-300/15 px-2 py-0.5 text-center font-mono text-[11px] text-lime-200">{value}{unit}</span>
        </span>
      </div>
      <input
        type="range" className="rm-range" min={min} max={max} step={1} value={value}
        style={{ "--p": `${pct}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))} aria-label={label}
      />
      {ends && (
        <div className="flex justify-between text-[10px] font-semibold text-white/35">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  );
}

export function SaveBadge({ state }: { state: SaveState }) {
  const map: Record<SaveState, { text: string; cls: string; title?: string }> = {
    saved: { text: "Сохранено", cls: "text-white/40" },
    saving: { text: "Сохранение…", cls: "text-white/40" },
    partial: { text: "Без картинок", cls: "text-amber-300", title: "Тексты и стиль сохранены, а загруженные картинки слишком тяжёлые для хранилища браузера. Сохраните проект в файл." },
    error: { text: "Не сохранено", cls: "text-rose-300", title: "Хранилище браузера недоступно или переполнено. Сохраните проект в файл." },
  };
  const s = map[state];
  return (
    <span title={s.title} className={`mr-1 hidden items-center gap-1.5 text-[11px] font-bold sm:inline-flex ${s.cls}`}>
      <CloudCheck className="h-4 w-4" />
      {s.text}
    </span>
  );
}

export function UploadCard({
  title, hint, image, onUpload, onClear,
}: {
  title: string; hint: string; image: string | null; onUpload: (f: File) => void; onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
      <div className="flex gap-3.5">
        <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(45deg,#14180b_25%,#0b0e06_25%,#0b0e06_50%,#14180b_50%,#14180b_75%,#0b0e06_75%)] bg-[length:16px_16px]">
          {image ? <img src={image} alt="" className="h-full w-full object-contain" /> : <ImagePlus className="h-6 w-6 text-white/25" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-extrabold">{title}</div>
          <div className="mt-0.5 text-[11px] leading-snug text-white/45">{hint}</div>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button" onClick={() => ref.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-lime-300 px-3 py-1.5 text-[12px] font-extrabold text-[#0a1000] transition hover:bg-lime-200"
            >
              <Upload className="h-3.5 w-3.5" /> Загрузить
            </button>
            {image && (
              <button
                type="button" onClick={onClear} aria-label="Удалить изображение"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[12px] font-bold text-white/70 transition hover:border-rose-400/60 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function ThemePicker({
  themeId, custom, setTheme, setCustom,
}: {
  themeId: ThemeId; custom: CustomColors; setTheme: (id: ThemeId) => void; setCustom: (p: Partial<CustomColors>) => void;
}) {
  const premium = THEME_LIST.filter((t) => t.group === "premium");
  const lime = THEME_LIST.filter((t) => t.group === "lime");
  const classic = THEME_LIST.filter((t) => t.group === "classic");
  const customTheme = buildCustomTheme(custom);

  const Btn = ({ id, label, swatch }: { id: ThemeId; label: string; swatch: string }) => (
    <button
      type="button" onClick={() => setTheme(id)} aria-pressed={themeId === id}
      className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-2 transition ${
        themeId === id ? "border-lime-300 bg-lime-300/10" : "border-white/10 bg-white/[0.03] hover:border-white/30"
      }`}
    >
      <span className="h-9 w-full rounded-lg ring-1 ring-white/20" style={{ background: swatch }} />
      <span className="text-center text-[10.5px] leading-tight font-bold">{label}</span>
      {themeId === id && <Check className="absolute top-1 right-1 h-4 w-4 rounded-full bg-lime-300 p-0.5 text-[#0a1000]" />}
    </button>
  );

  return (
    <>
      <div className="rounded-2xl border border-white/20 bg-white/[0.06] p-3.5">
        <div className="mb-1 flex items-center gap-2 text-[12px] font-extrabold tracking-[0.12em] text-white uppercase">
          <Gem className="h-4 w-4" /> Белые премиум-гаммы
        </div>
        <p className="mb-2.5 text-[11px] leading-snug text-white/45">Спокойный контраст для недвижимости, бизнеса, услуг и бьюти.</p>
        <div className="grid grid-cols-3 gap-2">
          {premium.map((t) => <Btn key={t.id} id={t.id} label={t.label} swatch={themeSwatch(t)} />)}
        </div>
      </div>

      <div className="rounded-2xl border border-lime-300/25 bg-lime-300/[0.05] p-3.5">
        <div className="mb-2.5 flex items-center gap-2 text-[12px] font-extrabold tracking-[0.12em] text-lime-200 uppercase">
          <Sparkles className="h-4 w-4" /> Лаймовые гаммы
        </div>
        <div className="grid grid-cols-3 gap-2">
          {lime.map((t) => <Btn key={t.id} id={t.id} label={t.label} swatch={themeSwatch(t)} />)}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
        <div className="mb-2.5 text-[12px] font-extrabold tracking-[0.12em] text-white/60 uppercase">Классика и свой цвет</div>
        <div className="grid grid-cols-3 gap-2">
          {classic.map((t) => <Btn key={t.id} id={t.id} label={t.label} swatch={themeSwatch(t)} />)}
          <Btn id="custom" label="Свой цвет" swatch={themeSwatch(customTheme)} />
        </div>
        {themeId === "custom" && (
          <div className="mt-3 space-y-2.5 rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="grid grid-cols-3 gap-2.5">
              {([["a1", "Акцент 1"], ["a2", "Акцент 2"], ["base", "Фон"]] as const).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-[11px] font-bold text-white/50">{label}</span>
                  <input type="color" className="rm-color" value={custom[key]} onChange={(e) => setCustom({ [key]: e.target.value })} aria-label={label} />
                </label>
              ))}
            </div>
            <Toggle on={custom.light} onChange={(v) => setCustom({ light: v })} label="Светлая тема" hint="Тёмный текст на светлом фоне" />
          </div>
        )}
      </div>
    </>
  );
}

export function BgPicker({ bgId, customBg, setBg, theme }: { bgId: BgId; customBg: string | null; setBg: (id: BgId) => void; theme: Theme }) {
  const cell = (active: boolean) =>
    `overflow-hidden rounded-xl border text-center transition ${active ? "border-lime-300 ring-2 ring-lime-300/40" : "border-white/10 hover:border-white/30"}`;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
      <div className="mb-2.5 text-[12px] font-extrabold tracking-[0.12em] text-white/60 uppercase">Фон</div>
      <div className="grid grid-cols-4 gap-2">
        {BGS.map((b) => {
          const style: CSSProperties = b.src
            ? { backgroundImage: `url(${b.src})`, backgroundSize: "cover", backgroundPosition: "center" }
            : b.id === "auto"
              ? { background: "#10150a" }
              : { background: bgCss(b, theme), backgroundSize: "cover", backgroundPosition: "center" };
          return (
            <button key={b.id} type="button" onClick={() => setBg(b.id)} aria-pressed={bgId === b.id} className={cell(bgId === b.id)}>
              <div className="flex h-11 w-full items-center justify-center" style={style}>
                {b.id === "auto" && <span className="text-[10px] font-extrabold text-lime-200/80">AUTO</span>}
              </div>
              <div className="bg-black/60 py-1 text-[10px] font-bold">{b.label}</div>
            </button>
          );
        })}
        {customBg && (
          <button type="button" onClick={() => setBg("custom")} aria-pressed={bgId === "custom"} className={cell(bgId === "custom")}>
            <div className="h-11 w-full bg-cover bg-center" style={{ backgroundImage: `url(${customBg})` }} />
            <div className="bg-black/60 py-1 text-[10px] font-bold">Мой</div>
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-white/40">«Авто» подбирает фон под выбранную гамму. Мрамор, линии, сияние и градиент строятся из цветов гаммы.</p>
    </div>
  );
}
