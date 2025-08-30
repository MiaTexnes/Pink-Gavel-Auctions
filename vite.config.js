import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath, URL } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./", // Important for deployment
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
        listings: resolve(__dirname, "listings.html"),
        contact: resolve(__dirname, "contact.html"),
        item: resolve(__dirname, "item.html"),
        login: resolve(__dirname, "login.html"),
        profile: resolve(__dirname, "profile.html"),
        register: resolve(__dirname, "register.html"),
        sellerProfile: resolve(__dirname, "sellerProfile.html"),
        users: resolve(__dirname, "profiles.html"),
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
  // Ensure environment variables are available
  define: {
    "import.meta.env.VITE_API_KEY": JSON.stringify(
      process.env.VITE_API_KEY || ""
    ),
  },
});
