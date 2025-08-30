export const config = {
  X_NOROFF_API_KEY: import.meta.env.VITE_X_NOROFF_API_KEY || "",
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "https://v2.api.noroff.dev",
  // Add other config values as needed
};

// Validate required environment variables
if (!config.X_NOROFF_API_KEY) {
  console.warn("Warning: VITE_X_NOROFF_API_KEY is not set");
}
