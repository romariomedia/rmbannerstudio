import { useLayoutEffect, useRef, type CSSProperties, type Ref } from "react";
import { ArrowUpRight, Globe, Play, ShieldCheck, Star, Ticket, TrendingUp, Zap } from "lucide-react";
import type { BannerData, FormatDef, FormatId, Options } from "../lib/types";
import { bgCss, scrim, textGradient, type BgDef, type Theme } from "../lib/themes";
import { alpha, clamp, readableOn } from "../lib/utils";

export interface BannerProps {
  data: BannerData;
  theme: Theme;
  bg: BgDef;
  opts: Options;
  format: FormatDef;
  logo: string | null;
  mock: string;
  customMock: boolean;
  animated: boolean;
  rootRef?: Ref<HTMLDivElement>;
  onOverflow?: (over: boolean) => void;
}

interface Metrics {
  f: number;
  pad: number;
  row: boolean;
  textW: number;
  gap: number;
  headMax: number;
  mockW: number;
  k: number;
  cardOff: number;
}

function metricsFor(id: FormatId, hasMock: boolean): Metrics {
  switch (id) {
    case "billboard":
      return { f: 1, pad: 96, row: true, textW: hasMock ? 1380 : 1750, gap: 80, headMax: 136, mockW: 760, k: 1.1, cardOff: 48 };
    case "post":
      return { f: 0.9, pad: 64, row: true, textW: hasMock ? 540 : 952, gap: 36, headMax: 104, mockW: 350, k: 0.8, cardOff: 0 };
    case "story":
      return { f: 1.15, pad: 72, row: false, textW: 936, gap: 0, headMax: 136, mockW: 936, k: 1.1, cardOff: 40 };
    case "hero":
    default:
      return { f: 1, pad: 96, row: true, textW: hasMock ? 1020 : 1360, gap: 64, headMax: 128, mockW: 620, k: 1, cardOff: 44 };
  }
}

const DISPLAY = "'Unbounded', 'Manrope', sans-serif";
const BODY = "'Manrope', 'Segoe UI', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

export default function Banner({
  data, theme: t, bg, opts, format, logo, mock, customMock, animated, rootRef, onOverflow,
}: BannerProps) {
  const { W, H } = format;
  const isPost = format.id === "post";
  const hasMock = opts.showMockup;
  const m = metricsFor(format.id, hasMock);
  const f = m.f;

  const midRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!onOverflow) return;
    let over = false;
    if (m.row) {
      const tx = textRef.current;
      const mid = midRef.current;
      if (tx && mid) over = tx.offsetHeight > mid.clientHeight + 2;
    } else {
      const c = contentRef.current;
      if (c) over = c.scrollHeight > c.clientHeight + 2;
    }
    onOverflow(over);
  });

  // ---- цвета ----
  const muted = alpha(t.text, 0.74);
  const faint = alpha(t.text, 0.55);
  const line = alpha(t.text, 0.16);
  const surface = alpha(t.text, 0.07);
  const cardBg = t.light ? "rgba(255,255,255,0.94)" : "rgba(6,6,12,0.82)";
  const onAcc = readableOn(t.a2);
  const accGrad = `linear-gradient(135deg, ${t.a1}, ${t.a2})`;

  // ---- заголовок ----
  const head = opts.headScale / 100;
  const maxHead = m.headMax * (m.row && !hasMock ? 1.15 : 1);
  const nameLen = Math.max(data.name.length, 1);
  const nameBase = clamp(Math.min(m.textW / (nameLen * 0.86), maxHead), 40, 400);
  const tagLen = Math.max(data.tagline.length, 1);
  const tagBase = clamp(Math.min(m.textW / (tagLen * 0.78), nameBase * 0.62), 34, 400);
  // ползунок масштабирует уже подобранный размер, поэтому работает при любой длине текста
  const nameSize = nameBase * head;
  const tagSize = tagBase * head;

  const showFeatures = opts.showFeatures && !(isPost && hasMock) && (data.f1 || data.f2 || data.f3);
  const features = [data.f1, data.f2, data.f3].filter(Boolean);
  const FeatIcons = [Zap, ShieldCheck, TrendingUp];
  const stats = [
    { v: data.s1v, l: data.s1l },
    { v: data.s2v, l: data.s2l },
    { v: data.s3v, l: data.s3l },
  ].filter((s) => s.v || s.l);
  const showStats = opts.showStats && stats.length > 0;
  const showPromo = opts.showPromo && !!data.promo;
  const showSite = !!data.site;
  const showBottom = showStats || showPromo || showSite;
  const showCards = opts.showCards && hasMock && !isPost;

  const fit: CSSProperties["objectFit"] = format.id === "story" && !customMock ? "contain" : opts.mockFit;

  // ---------------- блоки ----------------
  const badge = data.badge ? (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: 14 * f, padding: `${10 * f}px ${22 * f}px`,
        borderRadius: 999, border: `1.5px solid ${line}`, background: surface,
        fontSize: 18 * f, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: t.text,
      }}
    >
      <span style={{ position: "relative", width: 11 * f, height: 11 * f, display: "inline-block", flexShrink: 0 }}>
        {animated && <span className="rm-ping" style={{ position: "absolute", inset: 0, borderRadius: 999, background: t.acc }} />}
        <span style={{ position: "absolute", inset: 0, borderRadius: 999, background: t.acc, boxShadow: `0 0 ${16 * f}px ${t.acc}` }} />
      </span>
      {data.badge}
    </div>
  ) : null;

  const heading = (
    <div style={{ marginTop: badge ? 30 * f : 0 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: nameSize, lineHeight: 0.98, letterSpacing: "-0.02em", color: t.text, wordBreak: "break-word" }}>
        {data.name}
      </div>
      {data.tagline && (
        <div
          style={{
            fontFamily: DISPLAY, fontWeight: 800, fontSize: tagSize, lineHeight: 1.08, letterSpacing: "-0.02em", marginTop: 10 * f,
            backgroundImage: textGradient(t), WebkitBackgroundClip: "text", backgroundClip: "text",
            WebkitTextFillColor: "transparent", color: "transparent", wordBreak: "break-word", paddingBottom: 6 * f,
          }}
        >
          {data.tagline}
        </div>
      )}
    </div>
  );

  const desc = data.description ? (
    <div
      style={{
        marginTop: 24 * f, maxWidth: m.textW, fontSize: 28 * f, lineHeight: 1.5, fontWeight: 500, color: muted,
        display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}
    >
      {data.description}
    </div>
  ) : null;

  const pills = showFeatures ? (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 * f, marginTop: 28 * f }}>
      {features.map((txt, i) => {
        const Icon = FeatIcons[i % 3];
        return (
          <div
            key={i}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10 * f, padding: `${12 * f}px ${22 * f}px`,
              borderRadius: 999, border: `1.5px solid ${line}`, background: surface, fontSize: 22 * f, fontWeight: 700, color: t.text,
            }}
          >
            <Icon width={22 * f} height={22 * f} color={t.acc} strokeWidth={2.4} />
            {txt}
          </div>
        );
      })}
    </div>
  ) : null;

  const ctas =
    data.cta1 || (opts.showSecondary && data.cta2) ? (
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 * f, marginTop: 34 * f }}>
        {data.cta1 && (
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 14 * f, padding: `${22 * f}px ${36 * f}px`, borderRadius: 24 * f,
              background: t.ctaBg, color: t.ctaText, fontFamily: DISPLAY, fontWeight: 700, fontSize: 24 * f,
              boxShadow: `0 ${20 * f}px ${50 * f}px -${12 * f}px ${alpha(t.glow2, 0.65)}`,
            }}
          >
            {data.cta1}
            <ArrowUpRight width={28 * f} height={28 * f} strokeWidth={2.6} />
          </div>
        )}
        {opts.showSecondary && data.cta2 && (
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 14 * f, padding: `${19 * f}px ${30 * f}px`, borderRadius: 24 * f,
              border: `2px solid ${alpha(t.text, 0.28)}`, background: surface, color: t.text, fontFamily: DISPLAY, fontWeight: 700, fontSize: 22 * f,
            }}
          >
            <span style={{ width: 36 * f, height: 36 * f, borderRadius: 999, background: accGrad, color: onAcc, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Play width={16 * f} height={16 * f} fill="currentColor" strokeWidth={0} style={{ marginLeft: 2 * f }} />
            </span>
            {data.cta2}
          </div>
        )}
      </div>
    ) : null;

  const textTop = (
    <>
      {badge}
      {heading}
      {desc}
    </>
  );
  const textBottom = (
    <>
      {pills}
      {ctas}
    </>
  );

  // ---------------- мокап ----------------
  const k = m.k;
  const mockFrame = (
    <div
      style={{
        position: "relative",
        width: m.row ? m.mockW : "100%",
        height: m.row ? m.mockW * 0.75 : "100%",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute", inset: -m.mockW * 0.12,
          background: `radial-gradient(closest-side, ${alpha(t.glow1, 0.5)}, transparent 75%)`,
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: 38 * k, overflow: "hidden", background: "#04040a",
          border: `2px solid ${alpha(t.a1, 0.38)}`, boxShadow: `0 ${40 * k}px ${100 * k}px -${20 * k}px ${alpha(t.glow1, 0.7)}`,
        }}
      >
        <img src={mock} alt="" style={{ width: "100%", height: "100%", objectFit: fit, display: "block" }} />
      </div>

      {showCards && (
        <>
          {/* карточка метрики */}
          <div
            className={animated ? "rm-float" : ""}
            style={{
              position: "absolute", left: -m.cardOff, top: -m.cardOff * 0.9, padding: 18 * k, borderRadius: 26 * k,
              background: cardBg, border: `1.5px solid ${t.light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)"}`,
              boxShadow: `0 ${24 * k}px ${60 * k}px -${10 * k}px rgba(0,0,0,0.55)`, display: "flex", flexDirection: "column", gap: 12 * k,
              color: t.light ? "#0f1a05" : "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 * k }}>
              <div style={{ width: 50 * k, height: 50 * k, borderRadius: 16 * k, background: accGrad, color: onAcc, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp width={26 * k} height={26 * k} strokeWidth={2.6} />
              </div>
              <div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30 * k, lineHeight: 1 }}>{data.metricV}</div>
                <div style={{ fontSize: 15 * k, fontWeight: 700, opacity: 0.65, marginTop: 4 * k }}>{data.metricL}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6 * k, height: 44 * k }}>
              {[38, 60, 46, 76, 64, 92, 84].map((h, i) => (
                <div key={i} style={{ width: 17 * k, height: `${h}%`, borderRadius: 5 * k, background: `linear-gradient(180deg, ${t.a1}, ${t.a2})`, opacity: 0.55 + i * 0.07 }} />
              ))}
            </div>
          </div>

          {/* карточка доверия */}
          <div
            className={animated ? "rm-float2" : ""}
            style={{
              position: "absolute", right: -m.cardOff * 0.7, bottom: -m.cardOff * 0.9, padding: `${16 * k}px ${22 * k}px ${16 * k}px ${16 * k}px`,
              borderRadius: 26 * k, background: cardBg, border: `1.5px solid ${t.light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)"}`,
              boxShadow: `0 ${24 * k}px ${60 * k}px -${10 * k}px rgba(0,0,0,0.55)`, display: "flex", alignItems: "center", gap: 16 * k,
              color: t.light ? "#0f1a05" : "#fff",
            }}
          >
            <div style={{ display: "flex" }}>
              {[t.a1, t.a2, t.a3].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 42 * k, height: 42 * k, borderRadius: 999, marginLeft: i ? -14 * k : 0,
                    background: `linear-gradient(135deg, ${c}, ${t.glow1})`, border: `3px solid ${t.light ? "#fff" : "#0a0a12"}`,
                  }}
                />
              ))}
            </div>
            <div>
              <div style={{ display: "flex", gap: 2 * k }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} width={16 * k} height={16 * k} color="#fbbf24" fill="#fbbf24" strokeWidth={0} />
                ))}
              </div>
              {data.proof && <div style={{ fontSize: 15 * k, fontWeight: 800, marginTop: 5 * k, maxWidth: 260 * k, lineHeight: 1.25 }}>{data.proof}</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ---------------- верхняя полоса ----------------
  const logoH = 64 * f;
  const topBar = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 * f, minWidth: 0 }}>
        {logo ? (
          <img src={logo} alt="" style={{ height: logoH, maxWidth: logoH * 3, objectFit: "contain", display: "block" }} />
        ) : (
          <div
            style={{
              width: logoH, height: logoH, borderRadius: 18 * f, background: accGrad, color: onAcc, display: "flex",
              alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 28 * f,
              boxShadow: `0 ${10 * f}px ${30 * f}px -${6 * f}px ${alpha(t.glow2, 0.8)}`,
            }}
          >
            {(data.brand.trim().slice(0, 1) || "•").toUpperCase()}
          </div>
        )}
        <div style={{ lineHeight: 1.15, minWidth: 0 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22 * f, letterSpacing: "0.16em", textTransform: "uppercase", color: t.text, whiteSpace: "nowrap" }}>
            {data.brand}
          </div>
          {data.brandSub && <div style={{ fontSize: 16 * f, fontWeight: 700, color: faint, marginTop: 5 * f, whiteSpace: "nowrap" }}>{data.brandSub}</div>}
        </div>
      </div>
      {opts.showRating && (data.rating || data.reviews) && (
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 12 * f, padding: `${11 * f}px ${22 * f}px`, borderRadius: 999,
            border: `1.5px solid ${line}`, background: surface, fontSize: 19 * f, fontWeight: 800, color: t.text, whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          <span style={{ display: "inline-flex", gap: 2 * f }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} width={18 * f} height={18 * f} color="#fbbf24" fill="#fbbf24" strokeWidth={0} />
            ))}
          </span>
          {data.rating}
          {data.rating && data.reviews ? <span style={{ opacity: 0.45 }}>•</span> : null}
          <span style={{ fontWeight: 600, color: muted }}>{data.reviews}</span>
        </div>
      )}
    </div>
  );

  // ---------------- нижняя полоса ----------------
  const bottomBar = showBottom ? (
    <div
      style={{
        display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24 * f,
        borderTop: `1.5px solid ${line}`, paddingTop: 28 * f, marginTop: 34 * f, flexShrink: 0,
      }}
    >
      {showStats ? (
        <div style={{ display: "flex" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ paddingLeft: i ? 34 * f : 0, paddingRight: 34 * f, borderLeft: i ? `1.5px solid ${line}` : "none" }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 48 * f, lineHeight: 1, color: t.text, whiteSpace: "nowrap" }}>{s.v}</div>
              <div style={{ fontSize: 16 * f, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: faint, marginTop: 9 * f, whiteSpace: "nowrap" }}>{s.l}</div>
            </div>
          ))}
        </div>
      ) : (
        <div />
      )}
      {(showPromo || showSite) && (
        <div style={{ display: "flex", alignItems: "center", gap: 22 * f, flexWrap: "wrap" }}>
          {showPromo && (
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 14 * f, padding: `${15 * f}px ${26 * f}px`, borderRadius: 18 * f,
                border: `2.5px dashed ${alpha(t.acc, 0.8)}`, background: alpha(t.acc, 0.14), color: t.text,
                fontFamily: MONO, fontWeight: 600, fontSize: 21 * f, whiteSpace: "nowrap",
              }}
            >
              <Ticket width={26 * f} height={26 * f} color={t.acc} strokeWidth={2.4} />
              {data.promo}
            </div>
          )}
          {showSite && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 * f, fontFamily: MONO, fontWeight: 600, fontSize: 21 * f, color: muted, whiteSpace: "nowrap" }}>
              <Globe width={22 * f} height={22 * f} strokeWidth={2.2} />
              {data.site}
            </div>
          )}
        </div>
      )}
    </div>
  ) : null;

  // ---------------- слои фона ----------------
  const scrimDir = m.row ? "90deg" : "180deg";
  const cssBg = bgCss(bg, t);
  const glowSize = Math.min(W, H) * 1.05;

  return (
    <div
      ref={rootRef}
      style={{
        width: W, height: H, position: "relative", overflow: "hidden", background: t.base, color: t.text, fontFamily: BODY,
        boxSizing: "border-box", flexShrink: 0,
      }}
    >
      {bg.src && <img src={bg.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      {!bg.src && cssBg && <div style={{ position: "absolute", inset: 0, background: cssBg }} />}
      <div style={{ position: "absolute", inset: 0, background: scrim(t, opts.overlay, scrimDir, 0.2, !bg.src) }} />
      <div style={{ position: "absolute", left: -glowSize * 0.3, top: -glowSize * 0.35, width: glowSize, height: glowSize, background: `radial-gradient(closest-side, ${alpha(t.glow1, t.light ? 0.7 : 0.5)}, transparent)` }} />
      <div style={{ position: "absolute", right: -glowSize * 0.3, bottom: -glowSize * 0.4, width: glowSize, height: glowSize, background: `radial-gradient(closest-side, ${alpha(t.glow2, t.light ? 0.65 : 0.42)}, transparent)` }} />

      {opts.showPattern && (
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(${alpha(t.text, 0.07)} 1.5px, transparent 1.5px), linear-gradient(90deg, ${alpha(t.text, 0.07)} 1.5px, transparent 1.5px)`,
            backgroundSize: "56px 56px",
            WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 45%, #000 25%, transparent 78%)",
            maskImage: "radial-gradient(ellipse 85% 75% at 50% 45%, #000 25%, transparent 78%)",
          }}
        />
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 7, background: `linear-gradient(90deg, ${t.a1}, ${t.a2}, ${t.a3})` }} />

      {animated && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div className="rm-shine" style={{ position: "absolute", top: 0, bottom: 0, width: W * 0.28, background: `linear-gradient(90deg, transparent, ${alpha("#ffffff", t.light ? 0.5 : 0.14)}, transparent)` }} />
        </div>
      )}

      {/* контент */}
      <div
        ref={contentRef}
        style={{ position: "absolute", left: m.pad, right: m.pad, top: m.pad, bottom: m.pad, display: "flex", flexDirection: "column" }}
      >
        {topBar}

        {m.row ? (
          <div ref={midRef} style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", gap: m.gap }}>
            <div ref={textRef} style={{ width: m.textW, flexShrink: 0 }}>
              {textTop}
              {textBottom}
            </div>
            {hasMock && <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", minWidth: 0 }}>{mockFrame}</div>}
          </div>
        ) : (
          <>
            <div style={{ marginTop: 44 * f, flexShrink: 0 }}>{textTop}</div>
            {hasMock ? (
              <div style={{ flex: 1, minHeight: 330, margin: `${Math.max(m.cardOff + 24, 60)}px 0 ${m.cardOff + 20}px`, position: "relative" }}>{mockFrame}</div>
            ) : (
              <div style={{ flex: 1 }} />
            )}
            <div style={{ flexShrink: 0 }}>{textBottom}</div>
          </>
        )}

        {bottomBar}
      </div>
    </div>
  );
}
