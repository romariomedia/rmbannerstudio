import { DEFAULT_DATA, type BannerData, type Options } from "./types";
import type { BgId, ThemeId } from "./themes";

export interface Preset {
  id: string;
  title: string;
  desc: string;
  tag: string;
  themeId: ThemeId;
  bgId: BgId;
  data: BannerData;
  opts?: Partial<Options>;
}

const d = (over: Partial<BannerData>): BannerData => ({ ...DEFAULT_DATA, ...over });

export const PRESETS: Preset[] = [
  {
    id: "lime-tech", title: "Lime Tech", desc: "SaaS и IT-продукты", tag: "Лайм • SaaS",
    themeId: "lime-acid", bgId: "auto",
    data: d({}),
  },
  {
    id: "toxic-fintech", title: "Toxic Fintech", desc: "Финтех, банки, крипто", tag: "Лайм • Финтех",
    themeId: "lime-toxic", bgId: "auto",
    data: d({
      brand: "PULSE", brandSub: "Необанк", name: "PULSE", tagline: "деньги на скорости",
      description: "Карта с кэшбэком, мгновенные переводы без комиссии и инвестиции в один тап. Оформление за 2 минуты.",
      badge: "FINTECH • 0% комиссии", cta1: "Открыть счёт", cta2: "Тарифы",
      f1: "0% комиссии", f2: "Кэшбэк 10%", f3: "Карта за 2 часа",
      s1v: "1M+", s1l: "пользователей", s2v: "10%", s2l: "кэшбэк", s3v: "0 ₽", s3l: "обслуживание",
      metricV: "+10%", metricL: "кэшбэк на всё", proof: "Выбор 1 000 000 клиентов",
      promo: "Промокод PULSE · 3 мес", site: "pulse.bank", reviews: "30 000 отзывов",
    }),
  },
  {
    id: "forest-eco", title: "Forest Eco", desc: "Эко, здоровье, натуральное", tag: "Лайм • Эко",
    themeId: "lime-forest", bgId: "auto",
    data: d({
      brand: "VERDE", brandSub: "Natural care", name: "VERDE", tagline: "живи естественно",
      description: "Натуральная косметика и забота о планете: органический состав, упаковка без пластика, доставка за 2 часа.",
      badge: "ECO • 100% ORGANIC", cta1: "Выбрать набор", cta2: "Наша философия",
      f1: "100% натурально", f2: "Zero waste", f3: "Доставка 2 часа",
      s1v: "120K+", s1l: "клиентов", s2v: "98%", s2l: "натурально", s3v: "0", s3l: "пластика",
      metricV: "−40%", metricL: "пластика в упаковке", proof: "Выбирают 120 000 человек",
      promo: "Промокод VERDE20 · −20%", site: "verde.shop", reviews: "8 400 отзывов",
    }),
  },
  {
    id: "citrus-food", title: "Citrus Food", desc: "Еда, доставка, кафе", tag: "Лайм • Еда",
    themeId: "lime-citrus", bgId: "auto",
    data: d({
      brand: "FRESH", brandSub: "Food delivery", name: "FRESH", tagline: "горячее за 25 минут",
      description: "Ресторанные блюда с доставкой быстрее пиццы. Шеф-меню обновляется каждую неделю.",
      badge: "HOT • −40% на первый заказ", cta1: "Заказать сейчас", cta2: "Меню недели",
      f1: "25 минут", f2: "Шеф-меню", f3: "Живой трекинг",
      s1v: "25 мин", s1l: "доставка", s2v: "4.8★", s2l: "рейтинг", s3v: "120+", s3l: "блюд",
      metricV: "25 мин", metricL: "средняя доставка", proof: "35 000 довольных гостей",
      promo: "Промокод FRESH40 · −40%", site: "fresh.food", reviews: "35 000 отзывов",
    }),
  },
  {
    id: "violet-gaming", title: "Lime × Violet", desc: "Игры, стримы, комьюнити", tag: "Лайм • Гейминг",
    themeId: "lime-violet", bgId: "auto",
    data: d({
      brand: "GLITCH", brandSub: "Gaming hub", name: "GLITCH", tagline: "играй без правил",
      description: "Турниры, стримы и комьюнити для тех, кто играет всерьёз. Присоединяйтесь к сезону 2026.",
      badge: "SEASON 2026 • Старт", cta1: "Вступить в клан", cta2: "Смотреть стрим",
      f1: "Турниры каждую неделю", f2: "Призовой фонд", f3: "Свой Discord",
      s1v: "50K+", s1l: "игроков", s2v: "300", s2l: "турниров", s3v: "24/7", s3l: "стримы",
      metricV: "×3", metricL: "рост комьюнити", proof: "50 000 игроков онлайн",
      promo: "Код GLITCH · бонус", site: "glitch.gg", reviews: "5 100 отзывов",
    }),
  },
  {
    id: "lime-light-studio", title: "Lime Light", desc: "Студии, агентства, бренды", tag: "Лайм • Светлый",
    themeId: "lime-light", bgId: "auto",
    data: d({
      brand: "MONO", brandSub: "Design studio", name: "MONO", tagline: "меньше — лучше",
      description: "Студия дизайна: айдентика, сайты и упаковка, которые выглядят дорого и продают без скидок.",
      badge: "STUDIO • Набор на Q4", cta1: "Обсудить проект", cta2: "Портфолио",
      f1: "Айдентика", f2: "Сайты", f3: "Упаковка",
      s1v: "340+", s1l: "проектов", s2v: "27", s2l: "наград", s3v: "12 лет", s3l: "опыта",
      metricV: "×2.4", metricL: "рост узнаваемости", proof: "340 реализованных проектов",
      promo: "Бриф бесплатно", site: "mono.studio", reviews: "120 отзывов",
    }),
  },
  {
    id: "neon-startup", title: "Neon Startup", desc: "Дерзкий неон для запуска", tag: "Классика",
    themeId: "neon", bgId: "auto",
    data: d({ badge: "NEW • AI 2.0 внутри" }),
  },
  {
    id: "gold-luxury", title: "Luxury Gold", desc: "Премиум и клубные продукты", tag: "Классика",
    themeId: "gold", bgId: "auto",
    data: d({
      brand: "AURUM", brandSub: "Private club", name: "AURUM", tagline: "роскошь в деталях",
      description: "Закрытый клуб привилегий: персональный менеджер, события только для резидентов и сервис уровня 5 звёзд.",
      badge: "LIMITED • 100 мест", cta1: "Стать резидентом", cta2: "Каталог",
      f1: "Персональный менеджер", f2: "VIP-поддержка", f3: "Закрытые события",
      s1v: "2K+", s1l: "резидентов", s2v: "5.0★", s2l: "оценка", s3v: "15 лет", s3l: "на рынке",
      metricV: "VIP", metricL: "приоритетный доступ", proof: "2 000 резидентов клуба",
      promo: "Только по приглашению", site: "aurum.club", reviews: "500 отзывов",
    }),
  },
  {
    id: "sunset-promo", title: "Sunset Sale", desc: "Распродажи и акции", tag: "Классика",
    themeId: "sunset", bgId: "auto",
    data: d({
      brand: "SALE", brandSub: "Только 3 дня", name: "ЧЁРНАЯ ПЯТНИЦА", tagline: "скидки до −70%",
      description: "Тысячи товаров по специальным ценам. Акция действует только три дня — успейте занять лучшие предложения.",
      badge: "HOT • до 23:59", cta1: "Забрать скидку", cta2: "Все товары",
      f1: "Скидки до −70%", f2: "Бесплатная доставка", f3: "Возврат 30 дней",
      s1v: "−70%", s1l: "максимум", s2v: "3 дня", s2l: "акция", s3v: "5 000+", s3l: "товаров",
      metricV: "−70%", metricL: "максимальная скидка", proof: "Тысячи заказов за выходные",
      promo: "Промокод SALE70", site: "shop.example", reviews: "12 000 отзывов",
    }),
  },
  // ---------- БЕЛЫЕ ПРЕМИУМ-ГАММЫ ----------
  {
    id: "pearl-estate", title: "Premium Estate", desc: "Недвижимость • загрузите фото объекта", tag: "Премиум • Недвижимость",
    themeId: "prem-pearl", bgId: "auto",
    data: d({
      brand: "ARKADA", brandSub: "Residence", name: "ARKADA", tagline: "дом, в котором хочется жить",
      description: "Клубный дом в тихом центре: панорамные окна, закрытый двор и подземный паркинг. Ипотека от застройщика.",
      badge: "СТАРТ ПРОДАЖ • 2026", cta1: "Записаться на показ", cta2: "Планировки",
      f1: "Закрытый двор", f2: "Подземный паркинг", f3: "Панорамные окна",
      s1v: "от 14 млн", s1l: "стоимость", s2v: "от 38 м²", s2l: "площадь", s3v: "2027", s3l: "сдача",
      metricV: "от 4,9%", metricL: "ставка по ипотеке", proof: "120 семей уже выбрали дом",
      promo: "Ипотека от 4,9% годовых", site: "arkada.estate", rating: "5.0", reviews: "Рейтинг застройщика",
    }),
  },
  {
    id: "navy-business", title: "Business Navy", desc: "Консалтинг, финансы, B2B", tag: "Премиум • Бизнес",
    themeId: "prem-navy", bgId: "auto",
    data: d({
      brand: "FINEX", brandSub: "Advisory", name: "FINEX", tagline: "решения для роста бизнеса",
      description: "Консалтинг и финансовое планирование для компаний: разберём цифры, найдём точки роста и выстроим понятный план на год.",
      badge: "КОНСАЛТИНГ • Для бизнеса", cta1: "Получить консультацию", cta2: "Кейсы",
      f1: "Аудит за 5 дней", f2: "Персональный план", f3: "Договор и NDA",
      s1v: "250+", s1l: "компаний", s2v: "×2.1", s2l: "рост выручки", s3v: "12 лет", s3l: "на рынке",
      metricV: "+38%", metricL: "прибыль клиентов", proof: "250 компаний доверяют нам",
      promo: "Первая консультация бесплатно", site: "finex.pro", rating: "4.9", reviews: "180 отзывов",
    }),
  },
  {
    id: "rose-beauty", title: "Rose Beauty", desc: "Бьюти, салоны, уход", tag: "Премиум • Бьюти",
    themeId: "prem-rose", bgId: "auto",
    data: d({
      brand: "LUMIERE", brandSub: "Beauty studio", name: "LUMIERE", tagline: "красота без компромиссов",
      description: "Студия красоты премиум-класса: уход за кожей, косметология и стилисты, которые подчёркивают вашу индивидуальность.",
      badge: "BEAUTY • Запись открыта", cta1: "Записаться онлайн", cta2: "Услуги и цены",
      f1: "Мастера с опытом 8+ лет", f2: "Премиальная косметика", f3: "Уютная атмосфера",
      s1v: "4 000+", s1l: "клиентов", s2v: "4.9★", s2l: "оценка", s3v: "8 лет", s3l: "на рынке",
      metricV: "−30%", metricL: "на первый визит", proof: "4 000 клиенток выбрали нас",
      promo: "Скидка 30% на первый визит", site: "lumiere.beauty", rating: "4.9", reviews: "2 300 отзывов",
    }),
  },
  {
    id: "ice-tech", title: "Ice Tech", desc: "Технологии и SaaS, спокойная гамма", tag: "Премиум • Технологии",
    themeId: "prem-ice", bgId: "auto",
    data: d({ badge: "NEW • Версия 2.0" }),
  },
  {
    id: "graphite-residence", title: "Graphite Residence", desc: "Резиденции бизнес-класса • тёмный премиум", tag: "Премиум • Графит",
    themeId: "prem-graphite", bgId: "auto",
    data: d({
      brand: "ONYX", brandSub: "Private residences", name: "ONYX", tagline: "статус, который виден",
      description: "Резиденции бизнес-класса с консьерж-сервисом, спа-зоной и видом на город. Показы только по записи.",
      badge: "PRIVATE • Показ по записи", cta1: "Запросить презентацию", cta2: "Планировки",
      f1: "Консьерж 24/7", f2: "Спа и фитнес", f3: "Вид на город",
      s1v: "от 32 млн", s1l: "стоимость", s2v: "от 72 м²", s2l: "площадь", s3v: "2028", s3l: "сдача",
      metricV: "36 этаж", metricL: "панорамный вид", proof: "Закрытые показы для клиентов",
      promo: "Только по приглашению", site: "onyx.residence", rating: "5.0", reviews: "Премиум-класс",
    }),
  },
];
