import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath, URL } from "node:url";

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
        main: resolve(
          fileURLToPath(new URL(".", import.meta.url)),
          "index.html"
        ),
        listings: resolve(
          fileURLToPath(new URL(".", import.meta.url)),
          "listings.html"
        ),
        contact: resolve(
          fileURLToPath(new URL(".", import.meta.url)),
          "contact.html"
        ),
        item: resolve(
          fileURLToPath(new URL(".", import.meta.url)),
          "item.html"
        ),
        login: resolve(
          fileURLToPath(new URL(".", import.meta.url)),
          "login.html"
        ),
        profile: resolve(
          fileURLToPath(new URL(".", import.meta.url)),
          "profile.html"
        ),
        register: resolve(
          fileURLToPath(new URL(".", import.meta.url)),
          "register.html"
        ),
        sellerProfile: resolve(
          fileURLToPath(new URL(".", import.meta.url)),
          "sellerProfile.html"
        ),
        users: resolve(
          fileURLToPath(new URL(".", import.meta.url)),
          "profiles.html"
        ),
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
