import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.svg"],
      manifest: {
        id: "/",
        name: "Threshold — separation training",
        short_name: "Threshold",
        description:
          "A calm, structured companion for gradual dog separation training.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f4f1eb",
        theme_color: "#f4f1eb",
        categories: ["lifestyle"],
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: [/^\/$/]
      }
    })
  ],
  test: {
    environment: "node",
    include: ["app-v2/src/**/*.test.ts"]
  },
  build: {
    outDir: "../dist-v2",
    emptyOutDir: true
  }
});
