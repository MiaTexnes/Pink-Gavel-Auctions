import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "Pink-Gavel-Auctions",
    assetsDir: "assets",
    minify: true,
    rollupOptions: {
      input: {
        main: "index.html",
        style: "src/css/style.css",
      },
    },
  },
  css: {
    postcss: "./postcss.config.js",
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
