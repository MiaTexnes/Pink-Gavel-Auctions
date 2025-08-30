import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  return {
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
    // Explicitly define which env vars to expose
    define: {
      __VITE_X_NOROFF_API_KEY__: JSON.stringify(process.env.VITE_X_NOROFF_API_KEY),
    },
  };
});

// import { defineConfig } from "vite";
// import { resolve } from "path";
// import { register } from "module";

// export default defineConfig({
//   server: {
//     port: 3000,
//     open: true,
//   },
//   build: {
//     outDir: "dist",
//     assetsDir: "assets",
//     minify: true,
//     rollupOptions: {
//       input: {
//         main: resolve(__dirname, "index.html"),
//         listings: resolve(__dirname, "listings.html"),
//         contact: resolve(__dirname, "contact.html"),
//         item: resolve(__dirname, "item.html"),
//         login: resolve(__dirname, "login.html"),
//         profile: resolve(__dirname, "profile.html"),
//         register: resolve(__dirname, "register.html"),
//         sellerProfile: resolve(__dirname, "sellerProfile.html"),
//         users: resolve(__dirname, "profiles.html"),
//       },
//     },
//   },
//   css: {
//     postcss: "./postcss.config.js",
//   },
//   test: {
//     globals: true,
//     environment: "jsdom",
//   },
// });
