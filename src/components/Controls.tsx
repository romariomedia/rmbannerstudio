import { useState } from "react";
import { ImagePlus, Palette, RotateCcw, Shuffle, Type } from "lucide-react";
import { BgPicker, Section, Slider, TextField, ThemePicker, Toggle, UploadCard } from "./ui";
import { getTheme, type BgId, type CustomColors, type ThemeId } from "../lib/themes";
import { DEFAULT_OPTS, LIMITS, type BannerData, type Options, type Project } from "../lib/types";

type ImgKind = "logo" | "bg" | "mock";

interface Props {
  project: Project;
  setData: (k: keyof BannerData, v: string) => void;
  setOpt: <K extends keyof Options>(k: K, v: Options[K]) => void;
  setTheme: (id: ThemeId) => void;
  setCustom: (patch: Partial<CustomColors>) => void;
  setBg: (id: BgId) => void;
  upload: (kind: ImgKind, file: File) => void;
  clearImage: (kind: ImgKind) => void;
  onRandom: () => void;
  onReset: () => void;
}

const TABS = [
  { id: "content", label: "Контент", icon: Type },
  { id: "style", label: "Стиль", icon: Palette },
  { id: "media", label: "Медиа", icon: ImagePlus },
] as const;

export default function Controls({ project, setData, setOpt, setTheme, setCustom, setBg, upload, clearImage, onRandom, onReset }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("content");
  const { data, opts, themeId, custom, bgId, images } = project;
  const theme = getTheme(themeId, custom);

  const F = (label: string, k: keyof BannerData, extra?: { textarea?: boolean; mono?: boolean; placeholder?: string }) => (
    <TextField label={label} value={data[k]} max={LIMITS[k]} onChange={(v) => setData(k, v)} {...extra} />
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c0f07]/90 backdrop-blur">
      <div className="flex items-center gap-1 border-b border-white/10 p-2">
        {TABS.map((t) => (
          <button
            key={t.id} type="button" onClick={() => setTab(t.id)} aria-pressed={tab === t.id}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-extrabold transition ${
              tab === t.id ? "bg-lime-300 text-[#0a1000]" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5 p-3.5">
        {tab === "content" && (
          <>
            <Section title="Главный текст" defaultOpen>
              {F("Название проекта", "name", { placeholder: "NOVA X" })}
              {F("Слоган (градиентом)", "tagline", { placeholder: "будущее уже здесь" })}
              {F("Описание", "description", { textarea: true, placeholder: "Коротко о выгоде" })}
              {F("Бейдж над заголовком", "badge", { placeholder: "NEW • Запуск 2026" })}
            </Section>
            <Section title="Бренд" defaultOpen>
              {F("Название бренда", "brand")}
              {F("Подпись под брендом", "brandSub")}
            </Section>
            <Section title="Кнопки">
              {F("Главная кнопка", "cta1")}
              {F("Вторая кнопка", "cta2")}
            </Section>
            <Section title="Преимущества">
              {F("Преимущество 1", "f1")}
              {F("Преимущество 2", "f2")}
              {F("Преимущество 3", "f3")}
            </Section>
            <Section title="Цифры внизу">
              {([["s1v", "s1l", "1"], ["s2v", "s2l", "2"], ["s3v", "s3l", "3"]] as const).map(([v, l, n]) => (
                <div key={n} className="grid grid-cols-[110px_1fr] gap-2">
                  {F(`Цифра ${n}`, v)}
                  {F("Подпись", l)}
                </div>
              ))}
            </Section>
            <Section title="Рейтинг (справа сверху)">
              <div className="grid grid-cols-[90px_1fr] gap-2">
                {F("Оценка", "rating")}
                {F("Отзывы", "reviews")}
              </div>
            </Section>
            <Section title="Карточки на мокапе">
              <div className="grid grid-cols-[110px_1fr] gap-2">
                {F("Показатель", "metricV")}
                {F("Подпись", "metricL")}
              </div>
              {F("Текст доверия", "proof")}
            </Section>
            <Section title="Оффер и сайт">
              {F("Промокод / акция", "promo", { mono: true })}
              {F("Сайт / @контакт", "site", { mono: true })}
            </Section>
          </>
        )}

        {tab === "style" && (
          <>
            <ThemePicker themeId={themeId} custom={custom} setTheme={setTheme} setCustom={setCustom} />
            <BgPicker bgId={bgId} customBg={images.bg} setBg={setBg} theme={theme} />
            <div className="space-y-2.5">
              <Slider
                label={theme.light ? "Осветление фона" : "Затемнение фона"} value={opts.overlay} min={0} max={100} unit="%"
                def={DEFAULT_OPTS.overlay} ends={["фон виден", "сплошной цвет"]} onChange={(v) => setOpt("overlay", v)}
              />
              <Slider
                label="Размер заголовка" value={opts.headScale} min={70} max={130} unit="%"
                def={DEFAULT_OPTS.headScale} ends={["мельче", "крупнее"]} onChange={(v) => setOpt("headScale", v)}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="mb-2.5 text-[12px] font-extrabold tracking-[0.12em] text-white/60 uppercase">Блоки баннера</div>
              <div className="space-y-2">
                <Toggle on={opts.showMockup} onChange={(v) => setOpt("showMockup", v)} label="Мокап продукта" />
                <Toggle on={opts.showCards} onChange={(v) => setOpt("showCards", v)} label="Карточки на мокапе" hint="Недоступны в формате 1:1" />
                <Toggle on={opts.showFeatures} onChange={(v) => setOpt("showFeatures", v)} label="Преимущества" hint="В формате 1:1 скрыты при включённом мокапе" />
                <Toggle on={opts.showStats} onChange={(v) => setOpt("showStats", v)} label="Цифры внизу" />
                <Toggle on={opts.showRating} onChange={(v) => setOpt("showRating", v)} label="Рейтинг сверху" />
                <Toggle on={opts.showPromo} onChange={(v) => setOpt("showPromo", v)} label="Промокод" />
                <Toggle on={opts.showSecondary} onChange={(v) => setOpt("showSecondary", v)} label="Вторая кнопка" />
                <Toggle on={opts.showPattern} onChange={(v) => setOpt("showPattern", v)} label="Дизайн-сетка" />
                <Toggle on={opts.animate} onChange={(v) => setOpt("animate", v)} label="Анимация в превью" hint="В PNG/JPG попадает статичный кадр" />
              </div>
            </div>
          </>
        )}

        {tab === "media" && (
          <>
            <UploadCard title="Логотип" hint="PNG с прозрачным фоном лучше всего. Заменяет буквенный знак." image={images.logo} onUpload={(f) => upload("logo", f)} onClear={() => clearImage("logo")} />
            <UploadCard title="Скриншот или фото продукта" hint="Заменяет встроенный мокап. Лучше всего подходит пропорция 4:3." image={images.mock} onUpload={(f) => upload("mock", f)} onClear={() => clearImage("mock")} />
            <UploadCard title="Свой фон" hint="Любая картинка от 1600 px. Затемнение настраивается во вкладке «Стиль»." image={images.bg} onUpload={(f) => upload("bg", f)} onClear={() => clearImage("bg")} />
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="mb-2 text-[12px] font-extrabold tracking-[0.12em] text-white/60 uppercase">Вписывание мокапа</div>
              <div className="grid grid-cols-2 gap-2">
                {([["cover", "Заполнить"], ["contain", "Вписать целиком"]] as const).map(([v, label]) => (
                  <button
                    key={v} type="button" onClick={() => setOpt("mockFit", v)} aria-pressed={opts.mockFit === v}
                    className={`rounded-xl border px-3 py-2.5 text-[12px] font-extrabold transition ${opts.mockFit === v ? "border-lime-300 bg-lime-300/10 text-lime-200" : "border-white/10 text-white/60 hover:border-white/30"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p className="px-1 text-[11px] leading-relaxed text-white/40">
              Файлы обрабатываются прямо в браузере и никуда не отправляются. Большие изображения автоматически уменьшаются.
            </p>
          </>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button type="button" onClick={onRandom} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[12.5px] font-bold transition hover:bg-white/10">
            <Shuffle className="h-4 w-4" /> Случайный стиль
          </button>
          <button type="button" onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[12.5px] font-bold transition hover:border-rose-400/60 hover:text-rose-300">
            <RotateCcw className="h-4 w-4" /> Сбросить всё
          </button>
        </div>
      </div>
    </div>
  );
}
