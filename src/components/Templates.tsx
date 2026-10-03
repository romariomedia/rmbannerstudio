import { memo } from "react";
import { ArrowUpRight, Layers } from "lucide-react";
import Banner from "./Banner";
import PreviewFrame from "./PreviewFrame";
import LazyMount from "./LazyMount";
import { PRESETS, type Preset } from "../lib/presets";
import { DEFAULT_CUSTOM, MOCKS, getTheme, resolveBg } from "../lib/themes";
import { DEFAULT_OPTS, FORMATS } from "../lib/types";

const HERO = FORMATS[0];

const PresetCard = memo(function PresetCard({ preset, onApply }: { preset: Preset; onApply: (p: Preset) => void }) {
  const theme = getTheme(preset.themeId, DEFAULT_CUSTOM);
  const bg = resolveBg(theme.bg, preset.bgId, null);
  const isLime = theme.group === "lime";
  return (
    <button
      type="button"
      onClick={() => onApply(preset)}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0c0f07] text-left transition hover:-translate-y-1 hover:border-lime-300/60 hover:shadow-[0_24px_70px_-20px_rgba(163,230,53,0.45)]"
    >
      <div className="relative">
        <PreviewFrame W={HERO.W} H={HERO.H} rounded={0} className="[&>div]:!shadow-none [&>div]:!ring-0">
          <LazyMount W={HERO.W} H={HERO.H}>
            <Banner
              data={preset.data}
              theme={theme}
              bg={bg}
              opts={{ ...DEFAULT_OPTS, ...preset.opts, animate: false }}
              format={HERO}
              logo={null}
              mock={MOCKS[theme.mock]}
              customMock={false}
              animated={false}
            />
          </LazyMount>
        </PreviewFrame>
        <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-extrabold ${isLime ? "bg-lime-300 text-[#0a1000]" : "bg-black/70 text-white"}`}>
          {preset.tag}
        </span>
        <span className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black opacity-0 transition group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          <div className="text-[14px] font-extrabold">{preset.title}</div>
          <div className="text-[12px] text-white/50">{preset.desc}</div>
        </div>
        <span className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-bold transition group-hover:border-lime-300 group-hover:bg-lime-300 group-hover:text-[#0a1000]">
          Применить
        </span>
      </div>
    </button>
  );
});

export default function Templates({ onApply }: { onApply: (p: Preset) => void }) {
  return (
    <section id="templates" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.16em] text-lime-200 uppercase">
            <Layers className="h-3.5 w-3.5" /> Библиотека шаблонов
          </div>
          <h2 className="font-display mt-4 text-[clamp(1.6rem,3.5vw,2.6rem)] leading-tight font-extrabold">
            {PRESETS.length} готовых баннеров.
            <br />
            <span className="text-white/45">Нажмите, и шаблон откроется в редакторе.</span>
          </h2>
        </div>
        <p className="max-w-sm text-[14px] leading-relaxed font-medium text-white/55">
          Каждый шаблон — законченный баннер: своя гамма, тексты и оффер. Тексты в шаблонах примерные, замените их своими. Логотип и загруженные картинки при смене шаблона сохраняются.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PRESETS.map((p) => (
          <PresetCard key={p.id} preset={p} onApply={onApply} />
        ))}
      </div>
    </section>
  );
}
