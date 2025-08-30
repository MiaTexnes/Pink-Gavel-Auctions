const apiKey = import.meta.env.VITE_X_NOROFF_API_KEY;

export const config = {
  X_NOROFF_API_KEY: apiKey || "",
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "https://v2.api.noroff.dev",
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
};

// Production error logging
if (!apiKey) {
  console.error("❌ CRITICAL: VITE_X_NOROFF_API_KEY is missing!");
  console.error("Environment mode:", import.meta.env.MODE);
  console.error(
    "Available vars:",
    Object.keys(import.meta.env).filter((k) => k.startsWith("VITE_"))
  );
}
