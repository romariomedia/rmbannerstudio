import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, type Ref } from "react";
import {
  BadgeCheck, Check, Gauge, Globe, Heart, Layers, RotateCcw, Ruler, ShieldCheck, Sparkles, Star, Truck, Zap,
} from "lucide-react";
import type { MarketData, MarketFormat, MarketOptions, SlideId } from "../lib/market";
import { bgCss, scrim, textGradient, type BgDef, type Theme } from "../lib/themes";
import { alpha, clamp, readableOn } from "../lib/utils";

const DISPLAY = "'Unbounded', 'Manrope', sans-serif";
const BODY = "'Manrope', 'Segoe UI', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const BEN_ICONS = [Zap, Gauge, ShieldCheck, Sparkles, Layers, Heart];
const TRUST_ICONS = [ShieldCheck, Truck, RotateCcw, BadgeCheck];

export interface MarketSlideProps {
  slide: SlideId;
  data: MarketData;
  theme: Theme;
  bg: BgDef;
  opts: MarketOptions;
  format: MarketFormat;
  logo: string | null;
  photo: string;
  /** Фото с вырезанным тёмным фоном (для режима «растворить»); null — фото не подходит */
  photoCut?: string | null;
  rootRef?: Ref<HTMLDivElement>;
  onOverflow?: (over: boolean) => void;
}

export default function MarketSlide({ slide, data, theme: t, bg, opts, format, logo, photo, photoCut, rootRef, onOverflow }: MarketSlideProps) {
  const { W, H } = format;
  // Виртуальный холст всегда 1200 по высоте: 3:4 → 900×1200, 1:1 → 1200×1200
  const f = Math.min(W / 900, H / 1200);
  const wideL = W / f > 1000;
  const pad = 56 * f;
  const head = opts.headScale / 100;
  const white = slide === "main" && opts.cleanWhite;

  const contentRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!onOverflow) return;
    const c = contentRef.current;
    onOverflow(c ? c.scrollHeight > c.clientHeight + 2 : false);
  });

  // ---- цвета ----
  const muted = alpha(t.text, 0.74);
  const faint = alpha(t.text, 0.55);
  const line = alpha(t.text, 0.16);
  const surface = alpha(t.text, 0.07);
  const onAcc = readableOn(t.a2);
  const accGrad = `linear-gradient(135deg, ${t.a1}, ${t.a2})`;
  const glass: CSSProperties = {
    border: `1.5px solid ${line}`,
    background: t.light ? "rgba(255,255,255,0.72)" : "rgba(8,10,6,0.55)",
  };

  // ---- данные ----
  const benefits = data.benefits.filter((x) => x.title.trim());
  const specs = data.specs.filter((x) => x.label.trim() || x.value.trim());
  const box = data.box.filter((x) => x.trim());
  const dims = data.dims.filter((x) => x.label.trim() || x.value.trim());
  const trust = data.trust.filter((x) => x.title.trim());
  const showPrice = opts.showPrice && !!data.price;
  const showRating = opts.showRating && (!!data.rating || !!data.reviews);

  // ---------- общие блоки ----------
  const blend = opts.photoMode === "blend" && !t.light && !white;

  const stage = (glow = 0.5): ReactNode => (
    <div style={{ position: "relative", flex: 1, minHeight: 0, minWidth: 0 }}>
      {!white && (
        <div style={{ position: "absolute", inset: "-6%", background: `radial-gradient(closest-side, ${alpha(t.glow1, glow)}, transparent 72%)` }} />
      )}
      {white ? (
        <img src={photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 24px 28px rgba(0,0,0,0.22))" }} />
      ) : blend && photoCut ? (
        <img src={photoCut} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
      ) : (
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: 34 * f, overflow: "hidden", background: "#04040a",
            border: `2px solid ${alpha(t.a1, 0.4)}`, boxShadow: `0 ${30 * f}px ${80 * f}px -${24 * f}px ${alpha(t.glow1, 0.75)}`,
          }}
        >
          <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}
    </div>
  );

  const body = (photoNode: ReactNode, content: ReactNode): ReactNode =>
    wideL ? (
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 40 * f }}>
        <div style={{ width: "40%", flexShrink: 0, display: "flex" }}>{photoNode}</div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 * f }}>{content}</div>
      </div>
    ) : (
      <>
        <div style={{ flex: 1, minHeight: 230 * f, display: "flex" }}>{photoNode}</div>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 * f }}>{content}</div>
      </>
    );

  const header = (title: string): ReactNode => {
    const avail = W - 2 * pad;
    const size = clamp(Math.min((avail * 2.5) / Math.max(title.length, 1), 84 * f), 32 * f, 400) * head;
    return (
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * f, fontSize: 16 * f, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: t.acc, minWidth: 0 }}>
          <span style={{ width: 44 * f, height: 4 * f, borderRadius: 4 * f, background: accGrad, flexShrink: 0 }} />
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.title}</span>
        </div>
        <div
          style={{
            marginTop: 14 * f, paddingBottom: 6 * f, fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.02em",
            backgroundImage: textGradient(t), WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", wordBreak: "break-word",
          }}
        >
          {title}
        </div>
      </div>
    );
  };

  const brandMark = (size: number): ReactNode =>
    logo ? (
      <img src={logo} alt="" style={{ height: size, maxWidth: size * 3, objectFit: "contain", display: "block" }} />
    ) : (
      <div
        style={{
          width: size, height: size, borderRadius: size * 0.3, background: accGrad, color: onAcc, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: DISPLAY, fontWeight: 800, fontSize: size * 0.45, flexShrink: 0,
        }}
      >
        {(data.brand.trim().slice(0, 1) || "•").toUpperCase()}
      </div>
    );

  const topBar = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 * f, minWidth: 0 }}>
        {brandMark(58 * f)}
        <div style={{ lineHeight: 1.15, minWidth: 0 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21 * f, letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{data.brand}</div>
          {data.brandSub && <div style={{ fontSize: 16 * f, fontWeight: 700, color: faint, marginTop: 4 * f, whiteSpace: "nowrap" }}>{data.brandSub}</div>}
        </div>
      </div>
      {showRating && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 * f, padding: `${10 * f}px ${20 * f}px`, borderRadius: 999, ...glass, fontSize: 19 * f, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>
          <Star width={20 * f} height={20 * f} color="#fbbf24" fill="#fbbf24" strokeWidth={0} />
          {data.rating}
          {data.rating && data.reviews ? <span style={{ opacity: 0.4 }}>•</span> : null}
          <span style={{ fontWeight: 600, color: muted }}>{data.reviews}</span>
        </div>
      )}
    </div>
  );

  const footer = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0, borderTop: `1.5px solid ${line}`, paddingTop: 18 * f }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * f, minWidth: 0 }}>
        {brandMark(38 * f)}
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17 * f, letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{data.brand}</span>
      </div>
      {data.site && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 * f, fontFamily: MONO, fontWeight: 600, fontSize: 18 * f, color: muted, whiteSpace: "nowrap" }}>
          <Globe width={20 * f} height={20 * f} strokeWidth={2.2} /> {data.site}
        </span>
      )}
    </div>
  );

  const iconBox = (Icon: typeof Zap, size: number): ReactNode => (
    <div style={{ width: size, height: size, borderRadius: size * 0.32, background: accGrad, color: onAcc, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon width={size * 0.52} height={size * 0.52} strokeWidth={2.4} />
    </div>
  );

  // ---------- слайды ----------
  let content: ReactNode = null;

  if (slide === "promo") {
    const avail = W - 2 * pad;
    const sizeBase = clamp(Math.min((avail * 2.7) / Math.max(data.title.length, 1), 88 * f), 30 * f, 400);
    const tagBase = clamp(Math.min((avail * 1.6) / Math.max(data.tagline.length, 1), sizeBase * 0.5), 24 * f, 400);
    const size = sizeBase * head;
    const tagSize = tagBase * head;
    const chips = benefits.slice(0, 3);
    const chipPos: CSSProperties[] = [
      { left: 0, top: "9%" },
      { right: 0, top: "42%" },
      { left: "3%", bottom: "8%" },
    ];
    content = (
      <>
        {topBar}
        <div style={{ flexShrink: 0 }}>
          {opts.showBadge && data.badge && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12 * f, padding: `${9 * f}px ${20 * f}px`, borderRadius: 999, ...glass, fontSize: 16 * f, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18 * f }}>
              <span style={{ width: 10 * f, height: 10 * f, borderRadius: 999, background: t.acc, boxShadow: `0 0 ${14 * f}px ${t.acc}` }} />
              {data.badge}
            </div>
          )}
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 1.0, letterSpacing: "-0.02em", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {data.title}
          </div>
          {data.tagline && (
            <div style={{ marginTop: 10 * f, paddingBottom: 6 * f, fontFamily: DISPLAY, fontWeight: 800, fontSize: tagSize, lineHeight: 1.1, letterSpacing: "-0.02em", backgroundImage: textGradient(t), WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", wordBreak: "break-word" }}>
              {data.tagline}
            </div>
          )}
        </div>
        <div style={{ position: "relative", flex: 1, minHeight: 300 * f, display: "flex" }}>
          {stage(0.55)}
          {chips.map((c, i) => {
            const Icon = BEN_ICONS[i];
            return (
              <div key={i} style={{ position: "absolute", ...chipPos[i], display: "inline-flex", alignItems: "center", gap: 12 * f, padding: `${12 * f}px ${22 * f}px ${12 * f}px ${14 * f}px`, borderRadius: 999, ...glass, backdropFilter: "none", boxShadow: `0 ${16 * f}px ${40 * f}px -${12 * f}px rgba(0,0,0,0.6)`, fontSize: 21 * f, fontWeight: 800, maxWidth: "62%" }}>
                {iconBox(Icon, 38 * f)}
                <span style={{ lineHeight: 1.2 }}>{c.title}</span>
              </div>
            );
          })}
          {showPrice && data.discountLabel && (
            <div style={{ position: "absolute", right: 6 * f, top: 6 * f, width: 128 * f, height: 128 * f, borderRadius: 999, background: accGrad, color: onAcc, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 30 * f, transform: "rotate(-8deg)", boxShadow: `0 ${14 * f}px ${36 * f}px -${6 * f}px ${alpha(t.glow2, 0.85)}` }}>
              {data.discountLabel}
            </div>
          )}
        </div>
        {showPrice && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 * f, flexShrink: 0, padding: `${20 * f}px ${28 * f}px`, borderRadius: 30 * f, border: `1.5px solid ${alpha(t.acc, 0.5)}`, background: `linear-gradient(135deg, ${alpha(t.acc, 0.2)}, ${surface})` }}>
            <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", columnGap: 16 * f }}>
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 60 * f, lineHeight: 1.05, whiteSpace: "nowrap" }}>{data.price}</span>
              {data.oldPrice && <span style={{ fontSize: 28 * f, fontWeight: 700, color: faint, textDecoration: "line-through", whiteSpace: "nowrap" }}>{data.oldPrice}</span>}
            </div>
            {data.sold && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 * f, padding: `${12 * f}px ${22 * f}px`, borderRadius: 999, background: t.ctaBg, color: t.ctaText, fontSize: 20 * f, fontWeight: 800, whiteSpace: "nowrap" }}>
                <Check width={22 * f} height={22 * f} strokeWidth={3} /> {data.sold}
              </span>
            )}
          </div>
        )}
      </>
    );
  }

  if (slide === "benefits") {
    const cols = wideL ? 1 : 2;
    const list = benefits.slice(0, 6);
    content = (
      <>
        {header(data.hBenefits)}
        {body(
          stage(0.5),
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 * f }}>
            {list.map((b, i) => {
              const Icon = BEN_ICONS[i % BEN_ICONS.length];
              return (
                <div key={i} style={{ position: "relative", display: "flex", gap: 16 * f, alignItems: "flex-start", padding: `${16 * f}px ${18 * f}px`, borderRadius: 26 * f, ...glass, minWidth: 0, overflow: "hidden" }}>
                  <div style={{ position: "absolute", right: 14 * f, top: 2 * f, fontFamily: DISPLAY, fontWeight: 800, fontSize: 50 * f, lineHeight: 1, color: alpha(t.acc, 0.18) }}>{String(i + 1).padStart(2, "0")}</div>
                  {iconBox(Icon, 46 * f)}
                  <div style={{ minWidth: 0, position: "relative", paddingRight: 34 * f }}>
                    <div style={{ fontSize: 21 * f, fontWeight: 800, lineHeight: 1.2 }}>{b.title}</div>
                    {b.text && <div style={{ marginTop: 4 * f, fontSize: 16.5 * f, lineHeight: 1.4, fontWeight: 500, color: muted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.text}</div>}
                  </div>
                </div>
              );
            })}
          </div>,
        )}
        {footer}
      </>
    );
  }

  if (slide === "specs") {
    const list = specs.slice(0, 8);
    content = (
      <>
        {header(data.hSpecs)}
        {body(
          stage(0.45),
          <div style={{ display: "flex", flexDirection: "column", gap: 8 * f }}>
            {list.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 * f, padding: `${12 * f}px ${20 * f}px`, borderRadius: 18 * f, background: i % 2 === 0 ? surface : "transparent", border: `1.5px solid ${i % 2 === 0 ? line : "transparent"}` }}>
                <span style={{ fontSize: 19 * f, fontWeight: 700, color: muted, whiteSpace: "nowrap" }}>{s.label}</span>
                <span style={{ flex: 1, borderBottom: `2px dotted ${alpha(t.text, 0.25)}`, transform: `translateY(${4 * f}px)`, minWidth: 16 * f }} />
                <span style={{ fontSize: 21 * f, fontWeight: 800, textAlign: "right", maxWidth: "58%", lineHeight: 1.2 }}>{s.value}</span>
              </div>
            ))}
          </div>,
        )}
        {footer}
      </>
    );
  }

  if (slide === "box") {
    content = (
      <>
        {header(data.hBox)}
        {body(
          stage(0.5),
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 * f }}>
              {box.slice(0, 6).map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 * f, padding: `${14 * f}px ${16 * f}px`, borderRadius: 20 * f, ...glass, minWidth: 0 }}>
                  <span style={{ width: 34 * f, height: 34 * f, borderRadius: 999, background: accGrad, color: onAcc, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check width={20 * f} height={20 * f} strokeWidth={3.2} />
                  </span>
                  <span style={{ fontSize: 19 * f, fontWeight: 700, lineHeight: 1.2 }}>{b}</span>
                </div>
              ))}
            </div>
            {dims.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(dims.length, 2) === 1 ? 1 : 2}, 1fr)`, gap: 10 * f }}>
                {dims.slice(0, 4).map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 * f, padding: `${14 * f}px ${18 * f}px`, borderRadius: 20 * f, border: `1.5px solid ${alpha(t.acc, 0.45)}`, background: alpha(t.acc, 0.1), minWidth: 0 }}>
                    <Ruler width={28 * f} height={28 * f} color={t.acc} strokeWidth={2.3} style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5 * f, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: faint }}>{d.label}</div>
                      <div style={{ fontSize: 22 * f, fontWeight: 800, marginTop: 2 * f }}>{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>,
        )}
        {footer}
      </>
    );
  }

  if (slide === "trust") {
    const big = clamp(260 * f * (data.rating.length > 3 ? 0.8 : 1), 120 * f, 400);
    content = (
      <>
        {header(data.hTrust)}
        <div style={{ flex: 1, minHeight: 250 * f, display: "flex", alignItems: "center", justifyContent: "center", gap: 40 * f, borderRadius: 34 * f, border: `1.5px solid ${alpha(t.acc, 0.5)}`, background: `linear-gradient(135deg, ${alpha(t.acc, 0.2)}, ${surface})`, padding: 30 * f, flexWrap: "wrap" }}>
          {showRating && data.rating && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: big, lineHeight: 1, backgroundImage: textGradient(t), WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", paddingBottom: 8 * f }}>{data.rating}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6 * f, marginTop: 6 * f }}>
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} width={36 * f} height={36 * f} color="#fbbf24" fill="#fbbf24" strokeWidth={0} />)}
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 * f, alignItems: "flex-start" }}>
            {data.reviews && <div style={{ fontSize: 30 * f, fontWeight: 800 }}>{data.reviews}</div>}
            {data.sold && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 * f, padding: `${12 * f}px ${22 * f}px`, borderRadius: 999, background: t.ctaBg, color: t.ctaText, fontSize: 21 * f, fontWeight: 800 }}>
                <Check width={22 * f} height={22 * f} strokeWidth={3} /> {data.sold}
              </span>
            )}
            {data.brandSub && <div style={{ fontSize: 20 * f, fontWeight: 600, color: muted }}>{data.brandSub}</div>}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 * f, flexShrink: 0 }}>
          {trust.slice(0, 4).map((x, i) => {
            const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
            return (
              <div key={i} style={{ display: "flex", gap: 16 * f, alignItems: "flex-start", padding: `${18 * f}px ${20 * f}px`, borderRadius: 26 * f, ...glass, minWidth: 0 }}>
                {iconBox(Icon, 52 * f)}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 21 * f, fontWeight: 800, lineHeight: 1.2 }}>{x.title}</div>
                  {x.text && <div style={{ marginTop: 5 * f, fontSize: 16.5 * f, lineHeight: 1.4, fontWeight: 500, color: muted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{x.text}</div>}
                </div>
              </div>
            );
          })}
        </div>
        {footer}
      </>
    );
  }

  // ---------- фон ----------
  const glowSize = Math.min(W, H) * 1.05;
  const cssBg = bgCss(bg, t);
  const rootBg = white ? "#ffffff" : t.base;

  return (
    <div
      ref={rootRef}
      style={{ width: W, height: H, position: "relative", overflow: "hidden", background: rootBg, color: white ? "#111" : t.text, fontFamily: BODY, boxSizing: "border-box", flexShrink: 0 }}
    >
      {!white && bg.src && <img src={bg.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      {!white && !bg.src && cssBg && <div style={{ position: "absolute", inset: 0, background: cssBg }} />}
      {!white && <div style={{ position: "absolute", inset: 0, background: scrim(t, opts.overlay, "180deg", 0.1, !bg.src) }} />}
      {!white && (
        <>
          <div style={{ position: "absolute", left: -glowSize * 0.3, top: -glowSize * 0.35, width: glowSize, height: glowSize, background: `radial-gradient(closest-side, ${alpha(t.glow1, t.light ? 0.7 : 0.45)}, transparent)` }} />
          <div style={{ position: "absolute", right: -glowSize * 0.3, bottom: -glowSize * 0.4, width: glowSize, height: glowSize, background: `radial-gradient(closest-side, ${alpha(t.glow2, t.light ? 0.65 : 0.38)}, transparent)` }} />
        </>
      )}
      {!white && opts.showPattern && slide !== "main" && (
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(${alpha(t.text, 0.06)} 1.5px, transparent 1.5px), linear-gradient(90deg, ${alpha(t.text, 0.06)} 1.5px, transparent 1.5px)`,
            backgroundSize: `${56 * f}px ${56 * f}px`,
            WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 40%, #000 25%, transparent 78%)",
            maskImage: "radial-gradient(ellipse 85% 75% at 50% 40%, #000 25%, transparent 78%)",
          }}
        />
      )}
      {slide !== "main" && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 7 * f, background: `linear-gradient(90deg, ${t.a1}, ${t.a2}, ${t.a3})` }} />}

      {slide === "main" ? (
        <div style={{ position: "absolute", inset: `${W * 0.05}px`, display: "flex" }}>{stage(0.6)}</div>
      ) : (
        <div ref={contentRef} style={{ position: "absolute", left: pad, right: pad, top: pad, bottom: pad, display: "flex", flexDirection: "column", gap: 22 * f }}>
          {content}
        </div>
      )}
    </div>
  );
}
