import { useState } from "react";
import { ImagePlus, Palette, RotateCcw, Shuffle, Type } from "lucide-react";
import { BgPicker, Section, Slider, TextField, ThemePicker, Toggle, UploadCard } from "./ui";
import { DEFAULT_MARKET_OPTS, ML, type MarketData, type MarketOptions, type MarketProject } from "../lib/market";
import { getTheme, type BgId, type CustomColors, type ThemeId } from "../lib/themes";

type ImgKind = "logo" | "bg" | "mock";
export type MarketTextKey = Exclude<keyof MarketData, "benefits" | "specs" | "box" | "dims" | "trust">;

interface Props {
  project: MarketProject;
  setField: (k: MarketTextKey, v: string) => void;
  setBenefit: (i: number, k: "title" | "text", v: string) => void;
  setSpec: (i: number, k: "label" | "value", v: string) => void;
  setBox: (i: number, v: string) => void;
  setDim: (i: number, k: "label" | "value", v: string) => void;
  setTrust: (i: number, k: "title" | "text", v: string) => void;
  setOpt: <K extends keyof MarketOptions>(k: K, v: MarketOptions[K]) => void;
  setTheme: (id: ThemeId) => void;
  setCustom: (p: Partial<CustomColors>) => void;
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

export default function MarketControls(p: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("content");
  const { data, opts, themeId, custom, bgId, images } = p.project;
  const theme = getTheme(themeId, custom);

  const F = (label: string, k: MarketTextKey, max: number, extra?: { textarea?: boolean; mono?: boolean; placeholder?: string; rows?: number }) => (
    <TextField label={label} value={data[k]} max={max} onChange={(v) => p.setField(k, v)} {...extra} />
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
            <p className="px-1 text-[11px] leading-relaxed text-white/45">
              Пустые поля на слайдах не показываются. Чтобы убрать пункт, очистите его название. Один набор текстов используется на всех слайдах.
            </p>
            <Section title="Товар" defaultOpen>
              {F("Название товара (для площадки до 60 символов)", "title", ML.title, { placeholder: "Беспроводные наушники SONIQ Air Pro" })}
              {F("Слоган (градиентом)", "tagline", ML.tagline)}
              {F("Бейдж", "badge", ML.badge, { placeholder: "Новинка" })}
            </Section>
            <Section title="Бренд и магазин">
              {F("Бренд", "brand", ML.brand)}
              {F("Подпись (магазин, слоган бренда)", "brandSub", ML.brandSub)}
              {F("Сайт / контакт (необязательно)", "site", ML.site, { mono: true, placeholder: "Оставьте пустым для площадок" })}
            </Section>
            <Section title="Цена, продажи и рейтинг">
              <div className="grid grid-cols-2 gap-2">
                {F("Цена", "price", ML.price)}
                {F("Старая цена", "oldPrice", ML.oldPrice)}
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-2">
                {F("Скидка", "discountLabel", ML.discountLabel, { placeholder: "−30%" })}
                {F("Продажи", "sold", ML.sold)}
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-2">
                {F("Оценка", "rating", ML.rating)}
                {F("Отзывы", "reviews", ML.reviews)}
              </div>
            </Section>
            <Section title="Преимущества (до 6)" defaultOpen>
              {data.benefits.map((b, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-2.5">
                  <div className="text-[11px] font-extrabold tracking-wider text-lime-200/80 uppercase">Преимущество {i + 1}{i < 3 ? " • на обложке" : ""}</div>
                  <TextField label="Заголовок" value={b.title} max={ML.benTitle} onChange={(v) => p.setBenefit(i, "title", v)} />
                  <TextField label="Пояснение" value={b.text} max={ML.benText} onChange={(v) => p.setBenefit(i, "text", v)} />
                </div>
              ))}
            </Section>
            <Section title="Характеристики (до 8)">
              {data.specs.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <TextField label={`Параметр ${i + 1}`} value={s.label} max={ML.specLabel} onChange={(v) => p.setSpec(i, "label", v)} />
                  <TextField label="Значение" value={s.value} max={ML.specValue} onChange={(v) => p.setSpec(i, "value", v)} />
                </div>
              ))}
            </Section>
            <Section title="Комплектация и габариты">
              {data.box.map((b, i) => (
                <TextField key={i} label={`В комплекте ${i + 1}`} value={b} max={ML.box} onChange={(v) => p.setBox(i, v)} />
              ))}
              <div className="pt-1 text-[11px] font-extrabold tracking-wider text-lime-200/80 uppercase">Габариты и данные (до 4)</div>
              {data.dims.map((d, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <TextField label={`Название ${i + 1}`} value={d.label} max={ML.dimLabel} onChange={(v) => p.setDim(i, "label", v)} />
                  <TextField label="Значение" value={d.value} max={ML.dimValue} onChange={(v) => p.setDim(i, "value", v)} />
                </div>
              ))}
            </Section>
            <Section title="Гарантии (до 4)">
              {data.trust.map((x, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-2.5">
                  <TextField label={`Гарантия ${i + 1}`} value={x.title} max={ML.trustTitle} onChange={(v) => p.setTrust(i, "title", v)} />
                  <TextField label="Пояснение" value={x.text} max={ML.trustText} onChange={(v) => p.setTrust(i, "text", v)} />
                </div>
              ))}
            </Section>
            <Section title="Заголовки слайдов">
              {F("Преимущества", "hBenefits", ML.heading)}
              {F("Характеристики", "hSpecs", ML.heading)}
              {F("Комплектация", "hBox", ML.heading)}
              {F("Гарантии", "hTrust", ML.heading)}
            </Section>
            <Section title="Текст для карточки на площадке">
              {F("Описание товара", "listing", ML.listing, { textarea: true, rows: 7, placeholder: "Оставьте пустым — описание соберётся из преимуществ" })}
              {F("Ключевые слова", "keywords", ML.keywords, { textarea: true, rows: 3 })}
              <p className="text-[11px] leading-relaxed text-white/40">Этот текст не попадает на картинки. Он выгружается кнопкой «Копировать текст» вместе с названием и характеристиками.</p>
            </Section>
          </>
        )}

        {tab === "style" && (
          <>
            <ThemePicker themeId={themeId} custom={custom} setTheme={p.setTheme} setCustom={p.setCustom} />
            <BgPicker bgId={bgId} customBg={images.bg} setBg={p.setBg} theme={theme} />
            <div className="space-y-2.5">
              <Slider
                label={theme.light ? "Осветление фона" : "Затемнение фона"} value={opts.overlay} min={0} max={100} unit="%"
                def={DEFAULT_MARKET_OPTS.overlay} ends={["фон виден", "сплошной цвет"]} onChange={(v) => p.setOpt("overlay", v)}
              />
              <Slider
                label="Размер заголовков" value={opts.headScale} min={70} max={130} unit="%"
                def={DEFAULT_MARKET_OPTS.headScale} ends={["мельче", "крупнее"]} onChange={(v) => p.setOpt("headScale", v)}
              />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="mb-2 text-[12px] font-extrabold tracking-[0.12em] text-white/60 uppercase">Как показывать фото товара</div>
              <div className="grid grid-cols-2 gap-2">
                {([["blend", "Растворить тёмный фон"], ["frame", "В рамке"]] as const).map(([v, label]) => (
                  <button
                    key={v} type="button" onClick={() => p.setOpt("photoMode", v)} aria-pressed={opts.photoMode === v}
                    className={`rounded-xl border px-3 py-2.5 text-[12px] font-extrabold transition ${opts.photoMode === v ? "border-lime-300 bg-lime-300/10 text-lime-200" : "border-white/10 text-white/60 hover:border-white/30"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-white/40">«Растворить» хорошо работает для товаров, снятых на чёрном фоне, и для PNG без фона на тёмных темах. На светлых темах фото показывается в рамке.</p>
              <div className="mt-3">
                <Toggle on={opts.cleanWhite} onChange={(v) => p.setOpt("cleanWhite", v)} label="Главное фото на белом фоне" hint="Для фото с белым фоном или PNG без фона. Так требуют площадки." />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="mb-2.5 text-[12px] font-extrabold tracking-[0.12em] text-white/60 uppercase">Элементы</div>
              <div className="space-y-2">
                <Toggle on={opts.showBadge} onChange={(v) => p.setOpt("showBadge", v)} label="Бейдж на обложке" />
                <Toggle on={opts.showPrice} onChange={(v) => p.setOpt("showPrice", v)} label="Цена и скидка на обложке" hint="Площадки не допускают цены на главном фото" />
                <Toggle on={opts.showRating} onChange={(v) => p.setOpt("showRating", v)} label="Рейтинг" />
                <Toggle on={opts.showPattern} onChange={(v) => p.setOpt("showPattern", v)} label="Дизайн-сетка" />
              </div>
            </div>
          </>
        )}

        {tab === "media" && (
          <>
            <UploadCard title="Фото товара" hint="Главное изображение для всех слайдов. Лучше всего: товар по центру, высокое разрешение. Пока ничего не загружено, показан пример." image={images.mock} onUpload={(f) => p.upload("mock", f)} onClear={() => p.clearImage("mock")} />
            <UploadCard title="Логотип бренда" hint="PNG с прозрачным фоном. Заменяет буквенный знак." image={images.logo} onUpload={(f) => p.upload("logo", f)} onClear={() => p.clearImage("logo")} />
            <UploadCard title="Свой фон" hint="Любая картинка от 1600 px. Затемнение настраивается во вкладке «Стиль»." image={images.bg} onUpload={(f) => p.upload("bg", f)} onClear={() => p.clearImage("bg")} />
            <p className="px-1 text-[11px] leading-relaxed text-white/40">
              Файлы обрабатываются прямо в браузере и никуда не отправляются. Загружайте только те фото, на которые у вас есть права.
            </p>
          </>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button type="button" onClick={p.onRandom} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[12.5px] font-bold transition hover:bg-white/10">
            <Shuffle className="h-4 w-4" /> Случайный стиль
          </button>
          <button type="button" onClick={p.onReset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[12.5px] font-bold transition hover:border-rose-400/60 hover:text-rose-300">
            <RotateCcw className="h-4 w-4" /> Сбросить всё
          </button>
        </div>
      </div>
    </div>
  );
}
