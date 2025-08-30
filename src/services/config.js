const apiKey = import.meta.env.VITE_X_NOROFF_API_KEY;

export const config = {
  // Standardize on one property name
  X_NOROFF_API_KEY: apiKey || "",
  apiKey: apiKey || "", // Remove this duplicate
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "https://v2.api.noroff.dev",
};

// Add better error handling
if (!apiKey) {
  console.error("❌ CRITICAL: VITE_X_NOROFF_API_KEY is missing!");
  console.error("Make sure to set environment variables in Netlify dashboard");
}
