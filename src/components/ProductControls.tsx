import { useState } from "react";
import { ImagePlus, Palette, RotateCcw, Shuffle, Type } from "lucide-react";
import { BgPicker, Section, Slider, TextField, ThemePicker, Toggle, UploadCard } from "./ui";
import { DEFAULT_PRODUCT_OPTS, PL, type ProductData, type ProductOptions, type ProductProject } from "../lib/product";
import { getTheme, type BgId, type CustomColors, type ThemeId } from "../lib/themes";

type ImgKind = "logo" | "bg" | "mock";
type SimpleKey = Exclude<keyof ProductData, "features" | "specs" | "perks">;

interface Props {
  project: ProductProject;
  setField: (k: SimpleKey, v: string) => void;
  setFeature: (i: number, k: "title" | "text", v: string) => void;
  setSpec: (i: number, k: "label" | "value", v: string) => void;
  setPerk: (i: number, v: string) => void;
  setOpt: <K extends keyof ProductOptions>(k: K, v: ProductOptions[K]) => void;
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

export default function ProductControls(p: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("content");
  const { data, opts, themeId, custom, bgId, images } = p.project;
  const theme = getTheme(themeId, custom);

  const F = (label: string, k: SimpleKey, max: number, extra?: { textarea?: boolean; mono?: boolean; placeholder?: string }) => (
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
              Пустые поля на карточке не показываются. Чтобы убрать преимущество или характеристику, очистите её название.
            </p>
            <Section title="Главное" defaultOpen>
              {F("Название продукта", "name", PL.name, { placeholder: "NOVA X" })}
              {F("Слоган (градиентом)", "tagline", PL.tagline, { placeholder: "в чём главная выгода" })}
              {F("Описание", "description", PL.description, { textarea: true, placeholder: "2–3 предложения о том, что получит клиент" })}
              {F("Бейдж над названием", "badge", PL.badge)}
            </Section>
            <Section title="Бренд">
              {F("Название бренда", "brand", PL.brand)}
              {F("Подпись под брендом", "brandSub", PL.brandSub)}
            </Section>
            <Section title="Преимущества (до 6)" defaultOpen>
              {data.features.map((ft, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-2.5">
                  <div className="text-[11px] font-extrabold tracking-wider text-lime-200/80 uppercase">Преимущество {i + 1}</div>
                  <TextField label="Заголовок" value={ft.title} max={PL.featTitle} onChange={(v) => p.setFeature(i, "title", v)} />
                  <TextField label="Пояснение" value={ft.text} max={PL.featText} onChange={(v) => p.setFeature(i, "text", v)} />
                </div>
              ))}
            </Section>
            <Section title="Характеристики (до 6)">
              {data.specs.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <TextField label={`Параметр ${i + 1}`} value={s.label} max={PL.specLabel} onChange={(v) => p.setSpec(i, "label", v)} />
                  <TextField label="Значение" value={s.value} max={PL.specValue} onChange={(v) => p.setSpec(i, "value", v)} />
                </div>
              ))}
            </Section>
            <Section title="Цена и кнопка">
              <div className="grid grid-cols-2 gap-2">
                {F("Цена", "price", PL.price)}
                {F("Старая цена", "oldPrice", PL.oldPrice)}
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-2">
                {F("Скидка", "discountLabel", PL.discountLabel, { placeholder: "−30%" })}
                {F("Пояснение к цене", "priceNote", PL.priceNote)}
              </div>
              {F("Текст кнопки", "cta", PL.cta)}
            </Section>
            <Section title="Гарантии внизу">
              {data.perks.map((pk, i) => (
                <TextField key={i} label={`Пункт ${i + 1}`} value={pk} max={PL.perk} onChange={(v) => p.setPerk(i, v)} />
              ))}
            </Section>
            <Section title="Рейтинг и сайт">
              <div className="grid grid-cols-[90px_1fr] gap-2">
                {F("Оценка", "rating", PL.rating)}
                {F("Отзывы", "reviews", PL.reviews)}
              </div>
              {F("Сайт / контакт", "site", PL.site, { mono: true })}
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
                def={DEFAULT_PRODUCT_OPTS.overlay} ends={["фон виден", "сплошной цвет"]} onChange={(v) => p.setOpt("overlay", v)}
              />
              <Slider
                label="Размер названия" value={opts.headScale} min={70} max={130} unit="%"
                def={DEFAULT_PRODUCT_OPTS.headScale} ends={["мельче", "крупнее"]} onChange={(v) => p.setOpt("headScale", v)}
              />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="mb-2.5 text-[12px] font-extrabold tracking-[0.12em] text-white/60 uppercase">Блоки описания</div>
              <div className="space-y-2">
                <Toggle on={opts.showImage} onChange={(v) => p.setOpt("showImage", v)} label="Изображение продукта" />
                <Toggle on={opts.showFeatures} onChange={(v) => p.setOpt("showFeatures", v)} label="Преимущества" />
                <Toggle on={opts.showSpecs} onChange={(v) => p.setOpt("showSpecs", v)} label="Характеристики" />
                <Toggle on={opts.showPrice} onChange={(v) => p.setOpt("showPrice", v)} label="Цена и кнопка" />
                <Toggle on={opts.showPerks} onChange={(v) => p.setOpt("showPerks", v)} label="Гарантии внизу" />
                <Toggle on={opts.showRating} onChange={(v) => p.setOpt("showRating", v)} label="Рейтинг сверху" />
                <Toggle on={opts.showPattern} onChange={(v) => p.setOpt("showPattern", v)} label="Дизайн-сетка" />
              </div>
            </div>
          </>
        )}

        {tab === "media" && (
          <>
            <UploadCard title="Логотип" hint="PNG с прозрачным фоном лучше всего. Заменяет буквенный знак." image={images.logo} onUpload={(f) => p.upload("logo", f)} onClear={() => p.clearImage("logo")} />
            <UploadCard title="Фото или скриншот продукта" hint="Главная картинка карточки. Пока ничего не загружено, показан пример." image={images.mock} onUpload={(f) => p.upload("mock", f)} onClear={() => p.clearImage("mock")} />
            <UploadCard title="Свой фон" hint="Любая картинка от 1600 px. Затемнение настраивается во вкладке «Стиль»." image={images.bg} onUpload={(f) => p.upload("bg", f)} onClear={() => p.clearImage("bg")} />
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="mb-2 text-[12px] font-extrabold tracking-[0.12em] text-white/60 uppercase">Вписывание изображения</div>
              <div className="grid grid-cols-2 gap-2">
                {([["cover", "Заполнить"], ["contain", "Вписать целиком"]] as const).map(([v, label]) => (
                  <button
                    key={v} type="button" onClick={() => p.setOpt("imageFit", v)} aria-pressed={opts.imageFit === v}
                    className={`rounded-xl border px-3 py-2.5 text-[12px] font-extrabold transition ${opts.imageFit === v ? "border-lime-300 bg-lime-300/10 text-lime-200" : "border-white/10 text-white/60 hover:border-white/30"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p className="px-1 text-[11px] leading-relaxed text-white/40">
              Файлы обрабатываются прямо в браузере и никуда не отправляются.
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
