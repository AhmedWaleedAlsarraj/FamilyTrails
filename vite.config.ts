import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/bh_app/" : "/",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: ".htaccess",
          dest: ".",
        },
      ],
    }),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      includeAssets: ["favicon.ico", "favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "FamilyTrails - Bahrain Travel Companion",
        short_name: "FamilyTrails BH",
        description:
          "Interactive travel companion app for families visiting Bahrain points of interest.",
        theme_color: "#2E5C8A",
        background_color: "#F8F9FA",
        display: "standalone",
        start_url: "/bh_app/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
}));
