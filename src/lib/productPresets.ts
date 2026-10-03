import { DEFAULT_PRODUCT, fillFeatures, fillPerks, fillSpecs, type ProductData } from "./product";
import type { BgId, ThemeId } from "./themes";

export interface ProductPreset {
  id: string;
  title: string;
  desc: string;
  themeId: ThemeId;
  bgId: BgId;
  data: ProductData;
}

const make = (over: Partial<ProductData>): ProductData => ({ ...DEFAULT_PRODUCT, ...over });

export const PRODUCT_PRESETS: ProductPreset[] = [
  {
    id: "saas", title: "SaaS-платформа", desc: "Кислотный лайм", themeId: "lime-acid", bgId: "auto",
    data: DEFAULT_PRODUCT,
  },
  {
    id: "app", title: "Мобильное приложение", desc: "Лайм × циан", themeId: "lime-toxic", bgId: "auto",
    data: make({
      brand: "FLOW", brandSub: "Fitness app", badge: "ПРИЛОЖЕНИЕ ГОДА", name: "FLOW", tagline: "тренировки, которые держат в форме",
      description: "Персональные программы, умный подсчёт нагрузки и мотивация от тренеров. Занимайтесь дома, в зале или на улице: приложение подстроится под ваш день.",
      features: fillFeatures([
        { title: "Персональный план", text: "Подбираем нагрузку под цель и уровень подготовки" },
        { title: "Умные напоминания", text: "Тренировка в удобное для вас время" },
        { title: "Видеоуроки", text: "300+ упражнений с разбором техники" },
        { title: "Синхронизация", text: "Работает с часами и фитнес-браслетами" },
      ]),
      specs: fillSpecs([
        { label: "Платформы", value: "iOS, Android" },
        { label: "Программ", value: "40+" },
        { label: "Языки", value: "Русский, English" },
        { label: "Офлайн-режим", value: "Есть" },
      ]),
      perks: fillPerks(["7 дней бесплатно", "Без рекламы", "Отмена в 1 клик"]),
      price: "490 ₽", oldPrice: "790 ₽", discountLabel: "−38%", priceNote: "в месяц при оплате за год",
      cta: "Начать бесплатно", site: "flow.fit", rating: "4.8", reviews: "9 400 отзывов",
    }),
  },
  {
    id: "course", title: "Онлайн-курс", desc: "Цитрусовый лайм", themeId: "lime-citrus", bgId: "auto",
    data: make({
      brand: "SKILLUP", brandSub: "Online school", badge: "НАБОР • Старт 1 числа", name: "SKILLUP PRO", tagline: "новая профессия за 4 месяца",
      description: "Практический курс с проверкой заданий наставником и помощью в трудоустройстве. Учитесь в своём темпе, а итоговый проект пополнит портфолио.",
      features: fillFeatures([
        { title: "Практика с первой недели", text: "Реальные задачи вместо лекций ради лекций" },
        { title: "Личный наставник", text: "Проверяет работы и отвечает в течение дня" },
        { title: "Диплом и портфолио", text: "Итоговый проект для резюме" },
        { title: "Помощь с работой", text: "Разбор резюме и пробные собеседования" },
      ]),
      specs: fillSpecs([
        { label: "Длительность", value: "4 месяца" },
        { label: "Формат", value: "Онлайн, записи" },
        { label: "Нагрузка", value: "6–8 часов в неделю" },
        { label: "Рассрочка", value: "До 12 месяцев" },
      ]),
      perks: fillPerks(["Возврат в течение 14 дней", "Рассрочка 0%", "Доступ навсегда"]),
      price: "39 900 ₽", oldPrice: "59 900 ₽", discountLabel: "−33%", priceNote: "или 3 325 ₽ в месяц",
      cta: "Записаться на курс", site: "skillup.school", rating: "4.9", reviews: "3 200 отзывов",
    }),
  },
  {
    id: "premium", title: "Премиум-сервис", desc: "Люкс, золото", themeId: "gold", bgId: "auto",
    data: make({
      brand: "AURUM", brandSub: "Private concierge", badge: "ТОЛЬКО ПО ПРИГЛАШЕНИЮ", name: "AURUM", tagline: "сервис, о котором не нужно просить",
      description: "Персональный консьерж решает бытовые и деловые вопросы: от билетов и бронирований до организации событий. Вы получаете время, мы берём на себя детали.",
      features: fillFeatures([
        { title: "Личный менеджер", text: "Один контакт для всех задач, 24 часа в сутки" },
        { title: "Закрытые события", text: "Приглашения на мероприятия для резидентов" },
        { title: "Приоритетный доступ", text: "Лучшие места и бронирования без очередей" },
        { title: "Конфиденциальность", text: "Данные клиентов защищены соглашением" },
      ]),
      specs: fillSpecs([
        { label: "Срок членства", value: "12 месяцев" },
        { label: "Обращений", value: "Без ограничений" },
        { label: "Время ответа", value: "до 15 минут" },
        { label: "География", value: "Россия и Европа" },
      ]),
      perks: fillPerks(["Гарантия качества", "Персональный договор", "Продление по желанию"]),
      price: "9 900 ₽", oldPrice: "", discountLabel: "", priceNote: "в месяц, первый месяц — подарок",
      cta: "Оставить заявку", site: "aurum.club", rating: "5.0", reviews: "180 отзывов",
    }),
  },
  {
    id: "light", title: "Светлая карточка", desc: "Лайм Лайт", themeId: "lime-light", bgId: "auto",
    data: make({
      brand: "MONO", brandSub: "Design studio", badge: "ПАКЕТ УСЛУГ • Старт", name: "MONO START", tagline: "айдентика для запуска бренда",
      description: "Логотип, фирменные цвета и шрифты, брендбук и шаблоны для соцсетей. Всё, что нужно, чтобы выглядеть дорого с первого дня и не тратить бюджет впустую.",
      features: fillFeatures([
        { title: "Логотип и знак", text: "3 концепции, доработка выбранной" },
        { title: "Брендбук", text: "Цвета, шрифты и правила применения" },
        { title: "Шаблоны для соцсетей", text: "12 макетов для постов и сторис" },
        { title: "Фирменный стиль", text: "Визитки, бланки и презентация" },
      ]),
      specs: fillSpecs([
        { label: "Срок", value: "14 рабочих дней" },
        { label: "Правки", value: "3 круга" },
        { label: "Файлы", value: "PNG, SVG, PDF" },
        { label: "Права", value: "Передаются полностью" },
      ]),
      perks: fillPerks(["Фиксированная цена", "Договор и акты", "Поддержка 30 дней"]),
      price: "89 000 ₽", oldPrice: "", discountLabel: "", priceNote: "предоплата 50%",
      cta: "Обсудить проект", site: "mono.studio", rating: "5.0", reviews: "120 отзывов",
    }),
  },
  {
    id: "estate", title: "Недвижимость", desc: "Белый «Жемчуг» • загрузите фото объекта", themeId: "prem-pearl", bgId: "auto",
    data: make({
      brand: "ARKADA", brandSub: "Residence", badge: "СТАРТ ПРОДАЖ • 2026", name: "ARKADA", tagline: "клубный дом в тихом центре",
      description: "Камерный дом на 84 квартиры с панорамным остеклением, закрытым двором и подземным паркингом. Продуманные планировки и сдача в 2027 году.",
      features: fillFeatures([
        { title: "Панорамные окна", text: "Высота потолков 3,2 м и вид на парк" },
        { title: "Закрытый двор", text: "Без машин, с детской и зонами отдыха" },
        { title: "Подземный паркинг", text: "Машино-место для каждой квартиры" },
        { title: "Консьерж и охрана", text: "Видеонаблюдение и контроль доступа" },
      ]),
      specs: fillSpecs([
        { label: "Квартир", value: "84" },
        { label: "Площадь", value: "от 38 до 142 м²" },
        { label: "Срок сдачи", value: "IV квартал 2027" },
        { label: "Отделка", value: "Предчистовая / White box" },
      ]),
      perks: fillPerks(["Ипотека от 4,9%", "Рассрочка без переплат", "Эскроу-счета"]),
      price: "от 14 млн ₽", oldPrice: "", discountLabel: "", priceNote: "ипотека от 4,9% • рассрочка 0%",
      cta: "Записаться на показ", site: "arkada.estate", rating: "5.0", reviews: "Рейтинг застройщика",
    }),
  },
  {
    id: "business", title: "Услуги и консалтинг", desc: "Белый «Бизнес»", themeId: "prem-navy", bgId: "auto",
    data: make({
      brand: "FINEX", brandSub: "Advisory", badge: "КОНСАЛТИНГ • Для бизнеса", name: "FINEX", tagline: "финансовый план на год вперёд",
      description: "Разберём финансовую модель компании, найдём точки роста и соберём понятный план действий. Результат — отчёт и сопровождение на каждом этапе.",
      features: fillFeatures([
        { title: "Аудит за 5 дней", text: "Анализ финансов, затрат и денежных потоков" },
        { title: "План роста", text: "Конкретные шаги с расчётом эффекта" },
        { title: "Сопровождение", text: "Куратор на связи весь период работы" },
        { title: "Конфиденциальность", text: "Договор и соглашение о неразглашении" },
      ]),
      specs: fillSpecs([
        { label: "Срок", value: "от 14 дней" },
        { label: "Формат", value: "Онлайн или офис" },
        { label: "Результат", value: "Отчёт и дорожная карта" },
        { label: "Отчётность", value: "Еженедельно" },
      ]),
      perks: fillPerks(["Первая консультация бесплатно", "Договор и акты", "Гарантия результата"]),
      price: "от 120 000 ₽", oldPrice: "", discountLabel: "", priceNote: "фиксированная стоимость проекта",
      cta: "Получить консультацию", site: "finex.pro", rating: "4.9", reviews: "180 отзывов",
    }),
  },
];
