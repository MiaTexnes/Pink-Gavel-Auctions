import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    minify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        allListings: resolve(__dirname, "allListings.html"),
        contact: resolve(__dirname, "contact.html"),
        item: resolve(__dirname, "item.html"),
        login: resolve(__dirname, "login.html"),
        profile: resolve(__dirname, "profile.html"),
        register: resolve(__dirname, "register.html"),
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
