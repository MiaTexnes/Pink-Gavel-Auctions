const apiKey = import.meta.env.VITE_X_NOROFF_API_KEY;

export const config = {
  // Use the environment variable, with a fallback for development
  X_NOROFF_API_KEY: apiKey,
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "https://v2.api.noroff.dev",

  // Add this for debugging (remove after fixing)
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,

  // You can also use the direct property name that matches your code
  apiKey: apiKey, // Alternative property name
};

// Debug logging (remove after deployment works)
if (import.meta.env.DEV) {
  console.log("Environment:", import.meta.env.MODE);
  console.log("API Key available:", !!config.X_NOROFF_API_KEY);
  console.log("All env vars:", import.meta.env);
}

// Debug in production (temporarily - remove after fixing)
if (!apiKey) {
  console.error("❌ API Key is missing!");
  console.log("Environment mode:", import.meta.env.MODE);
  console.log("Available env vars:", Object.keys(import.meta.env));
}

// Validate required environment variables
if (!config.X_NOROFF_API_KEY) {
  console.warn("⚠️ Warning: VITE_X_NOROFF_API_KEY is not set");
}
