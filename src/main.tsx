import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Шрифты вшиты в сборку (кириллица + латиница) — баннер выглядит одинаково везде и корректно экспортируется
import "@fontsource/unbounded/cyrillic-500.css";
import "@fontsource/unbounded/latin-500.css";
import "@fontsource/unbounded/cyrillic-700.css";
import "@fontsource/unbounded/latin-700.css";
import "@fontsource/unbounded/cyrillic-800.css";
import "@fontsource/unbounded/latin-800.css";
import "@fontsource/manrope/cyrillic-500.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/cyrillic-600.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/cyrillic-700.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/cyrillic-800.css";
import "@fontsource/manrope/latin-800.css";
import "@fontsource/jetbrains-mono/cyrillic-600.css";
import "@fontsource/jetbrains-mono/latin-600.css";

import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
