import { useLayoutEffect, useRef, type Ref } from "react";
import { ArrowUpRight, Check, Gauge, Globe, Heart, Layers, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";
import type { ProductData, ProductFormat, ProductOptions } from "../lib/product";
import { bgCss, scrim, textGradient, type BgDef, type Theme } from "../lib/themes";
import { alpha, clamp, readableOn } from "../lib/utils";

const DISPLAY = "'Unbounded', 'Manrope', sans-serif";
const BODY = "'Manrope', 'Segoe UI', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const ICONS = [Zap, Gauge, ShieldCheck, Sparkles, Layers, Heart];

interface Props {
  data: ProductData;
  theme: Theme;
  bg: BgDef;
  opts: ProductOptions;
  format: ProductFormat;
  logo: string | null;
  photo: string;
  rootRef?: Ref<HTMLDivElement>;
  onOverflow?: (over: boolean) => void;
}

export default function ProductSheet({ data, theme: t, bg, opts, format, logo, photo, rootRef, onOverflow }: Props) {
  const { W, H } = format;
  const wide = format.id === "slide";
  const f = wide ? 1 : W / 1080;
  const pad = wide ? 72 : 60 * f;
  const gap = 24 * f;

  const contentRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!onOverflow) return;
    const c = contentRef.current;
    if (c) onOverflow(c.scrollHeight > c.clientHeight + 2);
  });

  // ---- цвета ----
  const muted = alpha(t.text, 0.74);
  const faint = alpha(t.text, 0.55);
  const line = alpha(t.text, 0.16);
  const surface = alpha(t.text, 0.07);
  const onAcc = readableOn(t.a2);
  const accGrad = `linear-gradient(135deg, ${t.a1}, ${t.a2})`;

  // ---- данные ----
  const features = data.features.filter((x) => x.title.trim());
  const specs = data.specs.filter((x) => x.label.trim() || x.value.trim());
  const perks = data.perks.filter((x) => x.trim());
  const showFeatures = opts.showFeatures && features.length > 0;
  const showSpecs = opts.showSpecs && specs.length > 0;
  const showPerks = opts.showPerks && perks.length > 0;
  const showPrice = opts.showPrice && (!!data.price || !!data.cta);
  const showRating = opts.showRating && (!!data.rating || !!data.reviews);

  // ---- заголовок ----
  const textW = wide ? 960 : W - 2 * pad;
  const head = opts.headScale / 100;
  const maxHead = wide ? 118 : 112 * f;
  const nameBase = clamp(Math.min(textW / (Math.max(data.name.length, 1) * 0.86), maxHead), 40, 400);
  const tagBase = clamp(Math.min(textW / (Math.max(data.tagline.length, 1) * 0.78), nameBase * 0.5), 30, 400);
  // ползунок масштабирует уже подобранный размер, поэтому работает при любой длине текста
  const nameSize = nameBase * head;
  const tagSize = tagBase * head;

  // ---------- блоки ----------
  const topBar = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 * f, minWidth: 0 }}>
        {logo ? (
          <img src={logo} alt="" style={{ height: 60 * f, maxWidth: 180 * f, objectFit: "contain", display: "block" }} />
        ) : (
          <div
            style={{
              width: 60 * f, height: 60 * f, borderRadius: 18 * f, background: accGrad, color: onAcc, display: "flex",
              alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 27 * f,
              boxShadow: `0 ${10 * f}px ${30 * f}px -${6 * f}px ${alpha(t.glow2, 0.8)}`,
            }}
          >
            {(data.brand.trim().slice(0, 1) || "•").toUpperCase()}
          </div>
        )}
        <div style={{ lineHeight: 1.15, minWidth: 0 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21 * f, letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{data.brand}</div>
          {data.brandSub && <div style={{ fontSize: 16 * f, fontWeight: 700, color: faint, marginTop: 5 * f, whiteSpace: "nowrap" }}>{data.brandSub}</div>}
        </div>
      </div>
      {showRating && (
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 12 * f, padding: `${10 * f}px ${20 * f}px`, borderRadius: 999,
            border: `1.5px solid ${line}`, background: surface, fontSize: 18 * f, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          <span style={{ display: "inline-flex", gap: 2 * f }}>
            {[0, 1, 2, 3, 4].map((i) => <Star key={i} width={17 * f} height={17 * f} color="#fbbf24" fill="#fbbf24" strokeWidth={0} />)}
          </span>
          {data.rating}
          {data.rating && data.reviews ? <span style={{ opacity: 0.45 }}>•</span> : null}
          <span style={{ fontWeight: 600, color: muted }}>{data.reviews}</span>
        </div>
      )}
    </div>
  );

  const titleBlock = (
    <div style={{ flexShrink: 0 }}>
      {data.badge && (
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 12 * f, padding: `${9 * f}px ${20 * f}px`, borderRadius: 999,
            border: `1.5px solid ${line}`, background: surface, fontSize: 16 * f, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
          }}
        >
          <span style={{ width: 10 * f, height: 10 * f, borderRadius: 999, background: t.acc, boxShadow: `0 0 ${14 * f}px ${t.acc}` }} />
          {data.badge}
        </div>
      )}
      <div style={{ marginTop: data.badge ? 24 * f : 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: nameSize, lineHeight: 0.98, letterSpacing: "-0.02em", wordBreak: "break-word" }}>
        {data.name}
      </div>
      {data.tagline && (
        <div
          style={{
            marginTop: 10 * f, paddingBottom: 6 * f, fontFamily: DISPLAY, fontWeight: 800, fontSize: tagSize, lineHeight: 1.1, letterSpacing: "-0.02em",
            backgroundImage: textGradient(t), WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", wordBreak: "break-word",
          }}
        >
          {data.tagline}
        </div>
      )}
      {data.description && (
        <div
          style={{
            marginTop: 18 * f, fontSize: (wide ? 27 : 25 * f), lineHeight: 1.5, fontWeight: 500, color: muted,
            display: "-webkit-box", WebkitLineClamp: wide ? 4 : 4, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {data.description}
        </div>
      )}
    </div>
  );

  const photoBlock = (
    <div style={{ position: "relative", flex: 1, minHeight: (wide ? 240 : 230 * f), minWidth: 0 }}>
      <div style={{ position: "absolute", inset: -30 * f, background: `radial-gradient(closest-side, ${alpha(t.glow1, 0.45)}, transparent 75%)` }} />
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: 34 * f, overflow: "hidden", background: "#04040a",
          border: `2px solid ${alpha(t.a1, 0.4)}`, boxShadow: `0 ${30 * f}px ${80 * f}px -${24 * f}px ${alpha(t.glow1, 0.75)}`,
        }}
      >
        <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: opts.imageFit, display: "block" }} />
      </div>
      {data.discountLabel && (
        <div
          style={{
            position: "absolute", top: 22 * f, right: 22 * f, padding: `${12 * f}px ${22 * f}px`, borderRadius: 999,
            background: accGrad, color: onAcc, fontFamily: DISPLAY, fontWeight: 800, fontSize: 26 * f,
            boxShadow: `0 ${12 * f}px ${30 * f}px -${6 * f}px ${alpha(t.glow2, 0.8)}`,
          }}
        >
          {data.discountLabel}
        </div>
      )}
    </div>
  );

  const featuresBlock = showFeatures ? (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 * f, flexShrink: 0 }}>
      {features.map((ft, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <div
            key={i}
            style={{
              display: "flex", gap: 16 * f, alignItems: "flex-start", padding: `${16 * f}px ${18 * f}px`, borderRadius: 24 * f,
              border: `1.5px solid ${line}`, background: surface, minWidth: 0,
            }}
          >
            <div style={{ width: 50 * f, height: 50 * f, borderRadius: 16 * f, background: accGrad, color: onAcc, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon width={26 * f} height={26 * f} strokeWidth={2.4} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22 * f, fontWeight: 800, lineHeight: 1.2 }}>{ft.title}</div>
              {ft.text && (
                <div style={{ marginTop: 5 * f, fontSize: 17 * f, lineHeight: 1.4, fontWeight: 500, color: muted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {ft.text}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  ) : null;

  const specsBlock = showSpecs ? (
    <div style={{ flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * f, marginBottom: 12 * f }}>
        <span style={{ fontSize: 15 * f, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: t.acc }}>Характеристики</span>
        <span style={{ flex: 1, height: 1.5, background: line }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 * f }}>
        {specs.map((s, i) => (
          <div key={i} style={{ padding: `${10 * f}px ${18 * f}px`, borderLeft: `3px solid ${t.acc}`, background: surface, borderRadius: `0 ${14 * f}px ${14 * f}px 0`, minWidth: 0 }}>
            <div style={{ fontSize: 13.5 * f, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</div>
            <div style={{ fontSize: 21 * f, fontWeight: 800, marginTop: 3 * f, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  const priceBlock = showPrice ? (
    <div
      style={{
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 * f, flexShrink: 0,
        padding: `${22 * f}px ${28 * f}px`, borderRadius: 30 * f, border: `1.5px solid ${alpha(t.acc, 0.5)}`,
        background: `linear-gradient(135deg, ${alpha(t.acc, 0.18)}, ${surface})`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", columnGap: 16 * f }}>
          {data.price && <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56 * f, lineHeight: 1.05, whiteSpace: "nowrap" }}>{data.price}</span>}
          {data.oldPrice && <span style={{ fontSize: 27 * f, fontWeight: 700, color: faint, textDecoration: "line-through", whiteSpace: "nowrap" }}>{data.oldPrice}</span>}
        </div>
        {data.priceNote && <div style={{ marginTop: 6 * f, fontSize: 18 * f, fontWeight: 600, color: muted }}>{data.priceNote}</div>}
      </div>
      {data.cta && (
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 14 * f, padding: `${20 * f}px ${32 * f}px`, borderRadius: 22 * f,
            background: t.ctaBg, color: t.ctaText, fontFamily: DISPLAY, fontWeight: 700, fontSize: 22 * f, whiteSpace: "nowrap",
            boxShadow: `0 ${18 * f}px ${44 * f}px -${12 * f}px ${alpha(t.glow2, 0.65)}`,
          }}
        >
          {data.cta}
          <ArrowUpRight width={26 * f} height={26 * f} strokeWidth={2.6} />
        </div>
      )}
    </div>
  ) : null;

  const footer =
    showPerks || data.site ? (
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 * f, borderTop: `1.5px solid ${line}`, paddingTop: 20 * f, flexShrink: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: `${10 * f}px ${24 * f}px` }}>
          {showPerks && perks.map((p, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10 * f, fontSize: 18 * f, fontWeight: 700 }}>
              <span style={{ width: 26 * f, height: 26 * f, borderRadius: 999, background: alpha(t.acc, 0.2), display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Check width={16 * f} height={16 * f} color={t.acc} strokeWidth={3.2} />
              </span>
              {p}
            </span>
          ))}
        </div>
        {data.site && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 * f, fontFamily: MONO, fontWeight: 600, fontSize: 19 * f, color: muted, whiteSpace: "nowrap" }}>
            <Globe width={21 * f} height={21 * f} strokeWidth={2.2} /> {data.site}
          </span>
        )}
      </div>
    ) : null;

  // ---------- фон ----------
  const glowSize = Math.min(W, H) * 1.05;
  const cssBg = bgCss(bg, t);

  return (
    <div
      ref={rootRef}
      style={{ width: W, height: H, position: "relative", overflow: "hidden", background: t.base, color: t.text, fontFamily: BODY, boxSizing: "border-box", flexShrink: 0 }}
    >
      {bg.src && <img src={bg.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      {!bg.src && cssBg && <div style={{ position: "absolute", inset: 0, background: cssBg }} />}
      <div style={{ position: "absolute", inset: 0, background: scrim(t, opts.overlay, "180deg", 0.1, !bg.src) }} />
      <div style={{ position: "absolute", left: -glowSize * 0.3, top: -glowSize * 0.35, width: glowSize, height: glowSize, background: `radial-gradient(closest-side, ${alpha(t.glow1, t.light ? 0.7 : 0.45)}, transparent)` }} />
      <div style={{ position: "absolute", right: -glowSize * 0.3, bottom: -glowSize * 0.4, width: glowSize, height: glowSize, background: `radial-gradient(closest-side, ${alpha(t.glow2, t.light ? 0.65 : 0.38)}, transparent)` }} />
      {opts.showPattern && (
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(${alpha(t.text, 0.06)} 1.5px, transparent 1.5px), linear-gradient(90deg, ${alpha(t.text, 0.06)} 1.5px, transparent 1.5px)`,
            backgroundSize: "56px 56px",
            WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 40%, #000 25%, transparent 78%)",
            maskImage: "radial-gradient(ellipse 85% 75% at 50% 40%, #000 25%, transparent 78%)",
          }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 7, background: `linear-gradient(90deg, ${t.a1}, ${t.a2}, ${t.a3})` }} />

      <div ref={contentRef} style={{ position: "absolute", left: pad, right: pad, top: pad, bottom: pad, display: "flex", flexDirection: "column", gap }}>
        {topBar}

        {wide ? (
          <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 64, marginTop: 8 }}>
            <div style={{ width: opts.showImage || showSpecs || showPrice ? 960 : "100%", flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ marginTop: "auto", marginBottom: "auto", display: "flex", flexDirection: "column", gap: 30 }}>
                {titleBlock}
                {featuresBlock}
              </div>
            </div>
            {(opts.showImage || showSpecs || showPrice) && (
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
                {opts.showImage ? photoBlock : <div style={{ flex: 1 }} />}
                {specsBlock}
                {priceBlock}
              </div>
            )}
          </div>
        ) : (
          <>
            {titleBlock}
            {opts.showImage ? photoBlock : <div style={{ flex: 1 }} />}
            {featuresBlock}
            {specsBlock}
            {priceBlock}
          </>
        )}

        {footer}
      </div>
    </div>
  );
}
