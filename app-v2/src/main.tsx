import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppErrorBoundary } from "./app/AppErrorBoundary";
import { PublicSite } from "./public/PublicSite";
import "./styles.css";

const isAppRoute = /^\/app(?:\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      {isAppRoute ? <App /> : <PublicSite />}
    </AppErrorBoundary>
  </StrictMode>
);
