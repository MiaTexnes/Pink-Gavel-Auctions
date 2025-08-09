// newListing.js

// Helper function to validate URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

// Function to create a new listing via the API
export async function createListing({ title, description, endsAt, media }) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("You must be logged in to create a listing.");

  // Client-side validation
  if (!title || title.trim().length === 0) {
    throw new Error("Title is required");
  }

  if (!description || description.trim().length === 0) {
    throw new Error("Description is required");
  }

  if (!endsAt) {
    throw new Error("End date is required");
  }

  // Check if end date is in the future
  const endDate = new Date(endsAt);
  const now = new Date();
  if (endDate <= now) {
    throw new Error("End date must be in the future");
  }

  // Validate media URLs if provided and format them correctly
  let formattedMedia = [];
  if (media && media.length > 0) {
    formattedMedia = media
      .filter((url) => url && url.trim()) // Filter out empty or null URLs
      .map((url) => {
        const trimmedUrl = url.trim();
        if (!isValidUrl(trimmedUrl)) {
          throw new Error("Invalid media URL format");
        }
        return {
          url: trimmedUrl,
          alt: "",
        };
      });
  }

  // Ensure endsAt is in ISO 8601 format
  const formattedEndsAt = new Date(endsAt).toISOString();

  const requestBody = {
    title: title.trim(),
    description: description.trim(),
    endsAt: formattedEndsAt,
    media: formattedMedia,
  };

  console.log("Sending request body:", requestBody);
  console.log("Token:", token ? "Present" : "Missing");
  console.log("Authorization header:", `Bearer ${token}`);

  try {
    const res = await fetch("https://v2.api.noroff.dev/auction/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("API Error Response:", errorData);
      console.error("Response status:", res.status);
      console.error(
        "Response headers:",
        Object.fromEntries(res.headers.entries()),
      );
      throw new Error(
        errorData.errors?.[0]?.message ||
          errorData.message ||
          "Failed to create listing.",
      );
    }

    return res.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.error("Network error:", error);
      throw new Error("Network error. Please check your internet connection.");
    }
    throw error;
  }
}
