import { useCallback, useEffect, useRef, useState } from "react";

export type SaveState = "saved" | "saving" | "partial" | "error";

/**
 * Состояние проекта с историей (отмена/повтор) и автосохранением в localStorage.
 * `slim` — облегчённая версия проекта на случай, если полная не помещается в хранилище.
 * Несохранённые изменения записываются при уходе со страницы и при переключении модуля.
 */
export function useProject<T>(storageKey: string, load: () => T, slim?: (p: T) => T) {
  const [project, setProject] = useState<T>(load);
  const ref = useRef(project);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const lastPush = useRef(0);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const update = useCallback((fn: (p: T) => T, coalesce = true) => {
    const cur = ref.current;
    const next = fn(cur);
    if (next === cur) return;
    const now = Date.now();
    if (!coalesce || now - lastPush.current > 800) {
      past.current.push(cur);
      if (past.current.length > 80) past.current.shift();
    }
    lastPush.current = now;
    future.current = [];
    ref.current = next;
    setProject(next);
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (prev === undefined) return;
    future.current.push(ref.current);
    ref.current = prev;
    lastPush.current = 0;
    setProject(prev);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(ref.current);
    ref.current = next;
    lastPush.current = 0;
    setProject(next);
  }, []);

  const persist = useCallback(
    (p: T): SaveState => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(p));
        return "saved";
      } catch {
        if (!slim) return "error";
        try {
          localStorage.setItem(storageKey, JSON.stringify(slim(p)));
          return "partial"; // тексты и стиль сохранены, тяжёлые картинки — нет
        } catch {
          return "error";
        }
      }
    },
    [storageKey, slim],
  );

  // отложенное автосохранение
  useEffect(() => {
    setSaveState("saving");
    const id = setTimeout(() => setSaveState(persist(project)), 600);
    return () => clearTimeout(id);
  }, [project, persist]);

  // немедленная запись при закрытии вкладки и при уходе из модуля
  useEffect(() => {
    const flush = () => {
      persist(ref.current);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [persist]);

  return {
    project, update, undo, redo, saveState,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
