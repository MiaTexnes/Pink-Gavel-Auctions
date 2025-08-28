import { isAuthenticated, getAuthHeader } from "../library/auth.js";
import { createListingCard } from "./listings.js";

const API_BASE = "https://v2.api.noroff.dev";
const profileContainer = document.getElementById("profiles-container");

// Utility function to get query parameters
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Function to fetch a specific seller's profile
async function fetchSellerProfile(name) {
  if (!isAuthenticated()) {
    profileContainer.innerHTML =
      "<p>You must be logged in to view profiles.</p>";
    return null; // Return null instead of undefined
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      Authorization: `Bearer ${token}`,
    };

    // Fetch profile with both listings and wins
    const response = await fetch(
      `${API_BASE}/auction/profiles/${name}?_listings=true&_wins=true`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Authentication expired. Please log in again.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.errors?.[0]?.message ||
          `Failed to fetch profile: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data; // Return the profile data
  } catch (error) {
    console.error("Fetch Seller Profile Error:", error);
    profileContainer.innerHTML = `
      <div class="error-message bg-red-100 text-red-800 p-4 rounded-lg text-center">
        <p>${error.message || "Failed to load seller profile. Please try again later."}</p>
      </div>
    `;
    return null;
  }
}

// Function to fetch seller's wins
async function fetchSellerWins(name) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(
      `${API_BASE}/auction/profiles/${name}/wins`, // Adjust endpoint as needed
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch wins: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch Seller Wins Error:", error);
    return [];
  }
}

// Function to render the seller's profile
function renderSellerProfile(profile) {
  if (!profile) {
    profileContainer.innerHTML = `
      <div class="error-message bg-red-100 text-red-800 p-4 rounded-lg text-center">
        <p>Profile data not available.</p>
      </div>
    `;
    return;
  }

  profileContainer.innerHTML = `
    <div class="seller-profile max-w-6xl mx-auto p-6">
      <div class="flex flex-col items-center mb-6">
        <img src="${
          profile.avatar?.url || "https://placehold.co/150x150?text=Avatar"
        }" alt="Avatar" class="w-32 h-32 rounded-full mb-4 object-cover border-4 border-pink-500">
        <h2 class="text-3xl font-bold mb-2">${profile.name}</h2>
        <p class="text-gray-600 dark:text-gray-300">${profile.email || "Email not available"}</p>
      </div>

      <div class="mb-6 text-center">
        <h3 class="text-xl font-semibold mb-2">Bio</h3>
        <p class="text-gray-700 dark:text-gray-300">${
          profile.bio || "No bio provided."
        }</p>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-100 dark:bg-blue-800 border border-gray-300 p-4 rounded-lg text-center">
          <h4 class="text-lg font-semibold">Total Listings</h4>
          <p class="text-2xl font-bold text-blue-600">${profile.listings?.length || 0}</p>
        </div>
        <div class="bg-green-100 dark:bg-green-800 border border-gray-300 p-4 rounded-lg text-center">
          <h4 class="text-lg font-semibold">Total Wins</h4>
          <p class="text-2xl font-bold text-green-600">${profile.wins?.length || 0}</p>
        </div>
        <div class="bg-purple-100 dark:bg-purple-800 border border-gray-300 p-4 rounded-lg text-center">
          <h4 class="text-lg font-semibold">Credits</h4>
          <p class="text-2xl font-bold text-purple-600">${profile.credits || 0}</p>
        </div>
      </div>

      <!-- Listings Section -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">Listings</h3>
        <div id="seller-listings-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <!-- Listings will be inserted here by JavaScript -->
        </div>
        ${
          profile.listings.length > 4
            ? `
            <div class=" flex justify-center space-x-4 mt-4">
              <button id="viewMoreListingsBtn" class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md">View More</button>
              <button id="viewLessListingsBtn" class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md hidden">View Less</button>
            </div>
            `
            : ""
        }
      </div>

      <!-- Wins Section -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">Wins</h3>
        <div id="seller-wins-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <!-- Wins will be inserted here by JavaScript -->
        </div>
        ${
          profile.wins.length > 4
            ? `
            <div class="flex justify-center space-x-4 mt-4">
              <button id="viewMoreWinsBtn" class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md">View More</button>
              <button id="viewLessWinsBtn" class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md hidden">View Less</button>
            </div>
            `
            : ""
        }
      </div>
    </div>
  `;

  // Render the first 4 listings
  const listingsContainer = document.getElementById(
    "seller-listings-container"
  );
  if (profile.listings && profile.listings.length > 0) {
    let currentListingsIndex = 4;
    const initialListings = profile.listings.slice(0, 4);
    initialListings.forEach((listing) => {
      listingsContainer.appendChild(createListingCard(listing));
    });

    const viewMoreListingsBtn = document.getElementById("viewMoreListingsBtn");
    const viewLessListingsBtn = document.getElementById("viewLessListingsBtn");

    if (viewMoreListingsBtn) {
      viewMoreListingsBtn.addEventListener("click", () => {
        const nextListings = profile.listings.slice(
          currentListingsIndex,
          currentListingsIndex + 4
        );
        nextListings.forEach((listing) => {
          listingsContainer.appendChild(createListingCard(listing));
        });
        currentListingsIndex += 4;

        if (currentListingsIndex >= profile.listings.length) {
          viewMoreListingsBtn.classList.add("hidden");
        }
        viewLessListingsBtn.classList.remove("hidden");
      });
    }

    if (viewLessListingsBtn) {
      viewLessListingsBtn.addEventListener("click", () => {
        listingsContainer.innerHTML = "";
        const initialListings = profile.listings.slice(0, 4);
        initialListings.forEach((listing) => {
          listingsContainer.appendChild(createListingCard(listing));
        });
        currentListingsIndex = 4;

        viewMoreListingsBtn.classList.remove("hidden");
        viewLessListingsBtn.classList.add("hidden");
      });
    }
  }

  // Render the first 4 wins
  const winsContainer = document.getElementById("seller-wins-container");
  if (profile.wins && profile.wins.length > 0) {
    let currentWinsIndex = 4;
    const initialWins = profile.wins.slice(0, 4);
    initialWins.forEach((win) => {
      winsContainer.appendChild(createListingCard(win));
    });

    const viewMoreWinsBtn = document.getElementById("viewMoreWinsBtn");
    const viewLessWinsBtn = document.getElementById("viewLessWinsBtn");

    if (viewMoreWinsBtn) {
      viewMoreWinsBtn.addEventListener("click", () => {
        const nextWins = profile.wins.slice(
          currentWinsIndex,
          currentWinsIndex + 4
        );
        nextWins.forEach((win) => {
          winsContainer.appendChild(createListingCard(win));
        });
        currentWinsIndex += 4;

        if (currentWinsIndex >= profile.wins.length) {
          viewMoreWinsBtn.classList.add("hidden");
        }
        viewLessWinsBtn.classList.remove("hidden");
      });
    }

    if (viewLessWinsBtn) {
      viewLessWinsBtn.addEventListener("click", () => {
        winsContainer.innerHTML = "";
        const initialWins = profile.wins.slice(0, 4);
        initialWins.forEach((win) => {
          winsContainer.appendChild(createListingCard(win));
        });
        currentWinsIndex = 4;

        viewMoreWinsBtn.classList.remove("hidden");
        viewLessWinsBtn.classList.add("hidden");
      });
    }
  }
}

// Main function to load the seller's profile
async function loadPageContent() {
  console.log("Loading seller profile page...");

  const sellerName = getQueryParam("name");
  console.log("Seller name from URL:", sellerName);

  if (!sellerName) {
    profileContainer.innerHTML = `
      <div class="error-message bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center max-w-md mx-auto mt-8">
        <h3 class="font-semibold mb-2">No Seller Specified</h3>
        <p>Please select a seller to view their profile.</p>
        <a href="/" class="mt-2 inline-block bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded transition-colors">
          Back to Home
        </a>
      </div>
    `;
    return;
  }

  // Show loading state
  profileContainer.innerHTML = `
    <div class="loading text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
      <p>Loading seller profile...</p>
    </div>
  `;

  try {
    const profile = await fetchSellerProfile(sellerName);

    if (profile) {
      renderSellerProfile(profile);
    } else {
      profileContainer.innerHTML = `
        <div class="error-message bg-red-100 text-red-800 p-4 rounded-lg text-center">
          <p>Failed to load seller profile. Please try again later.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error loading seller profile:", error);
    profileContainer.innerHTML = `
      <div class="error-message bg-red-100 text-red-800 p-4 rounded-lg text-center">
        <p>${error.message || "An unexpected error occurred."}</p>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadPageContent);
