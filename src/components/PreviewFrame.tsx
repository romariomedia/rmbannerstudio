import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  W: number;
  H: number;
  children: ReactNode;
  /** Ограничивать высоту по окну браузера */
  fitViewport?: boolean;
  className?: string;
  rounded?: number;
}

/** Показывает холст W×H в уменьшенном виде. Сам холст всегда остаётся в полном разрешении (для экспорта). */
export default function PreviewFrame({ W, H, children, fitViewport = false, className = "", rounded = 18 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 900);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setCw(el.clientWidth);
    const ro = new ResizeObserver(() => setCw(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!fitViewport) return;
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fitViewport]);

  const maxH = fitViewport ? Math.max(320, vh - 310) : Infinity;
  const scale = cw > 0 ? Math.min(cw / W, maxH / H) : 0.2;

  return (
    <div ref={wrapRef} className={`flex w-full justify-center ${className}`}>
      <div
        style={{ width: W * scale, height: H * scale, borderRadius: rounded }}
        className="relative overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
      >
        <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", left: 0, top: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
