import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

const PREFIX = "rm-banner-studio";

/** Не даёт приложению превратиться в белый экран и позволяет восстановиться */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* ошибка показана пользователю; отправлять её некуда — приложение работает без сервера */
  }

  /** Удаляет только данные студии, чтобы вернуть рабочее состояние */
  private resetData = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* хранилище недоступно */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#070905", color: "#fff", fontFamily: "'Manrope', 'Segoe UI', sans-serif" }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, margin: "0 auto 20px", borderRadius: 18, background: "linear-gradient(135deg,#d9f99d,#a3e635)", color: "#0a1000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>RM</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Что-то пошло не так</h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.65)", margin: "0 0 24px" }}>
            Приложение остановилось из-за ошибки. Обычно помогает перезагрузка страницы. Если ошибка повторяется, сбросьте сохранённые данные: проекты в этом браузере будут удалены.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => window.location.reload()} style={{ padding: "12px 22px", borderRadius: 14, border: 0, background: "#bef264", color: "#0a1000", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              Перезагрузить
            </button>
            <button type="button" onClick={this.resetData} style={{ padding: "12px 22px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Сбросить данные и перезагрузить
            </button>
          </div>
          <p style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", wordBreak: "break-word" }}>{this.state.error.message}</p>
        </div>
      </div>
    );
  }
}
