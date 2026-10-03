import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Отрисовывает тяжёлое содержимое только когда блок приближается к экрану.
 * После первого показа содержимое остаётся, чтобы не мигать при прокрутке.
 */
export default function LazyMount({ children, W, H, margin = 400 }: { children: ReactNode; W: number; H: number; margin?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (seen) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: `${margin}px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, margin]);

  return (
    <div ref={ref} style={{ width: W, height: H, background: "#0b0e06" }}>
      {seen ? children : null}
    </div>
  );
}
