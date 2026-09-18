import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppErrorBoundary } from "./app/AppErrorBoundary";
import { PublicRouter } from "./public/PublicRouter";
import "./styles.css";

const isAppRoute = /^\/app(?:\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      {isAppRoute ? <App /> : <PublicRouter />}
    </AppErrorBoundary>
  </StrictMode>
);
