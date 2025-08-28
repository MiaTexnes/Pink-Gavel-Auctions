import { isAuthenticated, getAuthHeader } from "../library/auth.js";

const API_BASE = "https://v2.api.noroff.dev";
const profileContainer = document.getElementById("profiles-container");

/**
 * Fetch the 100 newest created profiles
 * @returns {Promise<Array>} List of profiles
 */
async function fetchProfiles() {
  if (!isAuthenticated()) {
    profileContainer.innerHTML = `
      <div class="error-message bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center">
        <p>You must be logged in to view profiles.</p>
      </div>
    `;
    return [];
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      ...getAuthHeader(),
    };

    // Add query parameters to fetch the 100 newest profiles
    const response = await fetch(
      `${API_BASE}/auction/profiles?_sort=created&_order=asc&_limit=100`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch profiles: ${response.statusText}`);
    }

    const profiles = await response.json();
    return Array.isArray(profiles) ? profiles : profiles.data || [];
  } catch (error) {
    console.error("Error fetching profiles:", error);
    profileContainer.innerHTML = `
      <div class="error-message bg-red-100 text-red-800 p-4 rounded-lg text-center">
        <p>Failed to load profiles. Please try again later.</p>
      </div>
    `;
    return [];
  }
}

/**
 * Fetch the 100 newest created users
 * @returns {Promise<Array>} List of users
 */
async function fetchUsers() {
  if (!isAuthenticated()) {
    profileContainer.innerHTML = `
      <div class="error-message bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center">
        <p>You must be logged in to view users.</p>
      </div>
    `;
    return [];
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      ...getAuthHeader(),
    };

    // Add query parameters to fetch the 100 newest users
    const response = await fetch(
      `${API_BASE}/auction/users?_sort=created&_order=desc&_limit=100`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const users = await response.json();
    return Array.isArray(users) ? users : users.data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    profileContainer.innerHTML = `
      <div class="error-message bg-red-100 text-red-800 p-4 rounded-lg text-center">
        <p>Failed to load users. Please try again later.</p>
      </div>
    `;
    return [];
  }
}

/**
 * Render all profiles with sorting and "View More" and "View Less" buttons
 * @param {Array} profiles - List of profiles
 */
function renderProfiles(profiles) {
  if (!profiles || profiles.length === 0) {
    profileContainer.innerHTML = `
      <div class="error-message bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 p-4 rounded-lg text-center">
        <p>No profiles found.</p>
      </div>
    `;
    return;
  }

  let sortedProfiles = [...profiles]; // Create a copy of the profiles array
  const profilesToShow = 12; // Number of profiles to show initially
  let currentIndex = 0;

  function renderBatch() {
    profileContainer.innerHTML = ""; // Clear container before rendering

    const batch = sortedProfiles.slice(0, currentIndex + profilesToShow);
    batch.forEach((profile) => {
      const profileElement = document.createElement("div");
      profileElement.classList.add(
        "profile",
        "p-6",
        "border",
        "border-gray-300",
        "dark:border-gray-700",
        "rounded-lg",
        "shadow-md",
        "bg-white",
        "dark:bg-gray-800",
        "hover:shadow-lg",
        "hover:shadow-black",
        "transition-shadow",
        "mb-6"
      );

      const avatarUrl =
        profile.avatar?.url ||
        profile.avatar ||
        "https://placehold.co/100x100?text=Avatar";

      profileElement.innerHTML = `
        <div class="flex items-center space-x-4">
          <img src="${avatarUrl}" alt="${profile.name}'s avatar" class="w-16 h-16 rounded-full object-cover border-2 border-pink-500">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">${profile.name}</h2>
            <p class="text-gray-700 dark:text-gray-400">${profile.email || "Email not available"}</p>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-white p-4 rounded-lg text-center">
            <h4 class="text-sm font-semibold">Credits</h4>
            <p class="text-lg font-bold">${profile.credits || 0}</p>
          </div>
          <div class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-white p-4 rounded-lg text-center">
            <h4 class="text-sm font-semibold">Listings</h4>
            <p class="text-lg font-bold">${profile._count?.listings || 0}</p>
          </div>
        </div>
        <div class="mt-4 text-center">
          <a href="/sellerProfile.html?name=${profile.name}" class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all">
            View Profile
          </a>
        </div>
      `;

      profileContainer.appendChild(profileElement);
    });

    addControlButtons();
  }

  function addControlButtons() {
    let controlsContainer = document.querySelector("#controls-container");
    if (!controlsContainer) {
      controlsContainer = document.createElement("div");
      controlsContainer.id = "controls-container";
      controlsContainer.classList.add(
        "flex",
        "justify-center",
        "space-x-4",
        "mt-4"
      );

      profileContainer.parentElement.appendChild(controlsContainer);
    }

    controlsContainer.innerHTML = "";

    if (currentIndex + profilesToShow < sortedProfiles.length) {
      const viewMoreButton = document.createElement("button");
      viewMoreButton.textContent = "View More";
      viewMoreButton.classList.add(
        "bg-pink-500",
        "hover:bg-pink-600",
        "text-white",
        "font-semibold",
        "py-2",
        "px-6",
        "rounded-lg",
        "transition-all",
        "shadow-md"
      );

      viewMoreButton.addEventListener("click", () => {
        currentIndex += profilesToShow;
        renderBatch();
      });

      controlsContainer.appendChild(viewMoreButton);
    }

    if (currentIndex > 0) {
      const viewLessButton = document.createElement("button");
      viewLessButton.textContent = "View Less";
      viewLessButton.classList.add(
        "bg-pink-500",
        "hover:bg-pink-600",
        "text-white",
        "font-semibold",
        "py-2",
        "px-6",
        "rounded-lg",
        "transition-all",
        "shadow-md"
      );

      viewLessButton.addEventListener("click", () => {
        currentIndex = Math.max(0, currentIndex - profilesToShow);
        renderBatch();
      });

      controlsContainer.appendChild(viewLessButton);
    }
  }

  // Add sorting controls
  function addSortingControls() {
    let sortingContainer = document.querySelector("#sorting-container");
    if (!sortingContainer) {
      sortingContainer = document.createElement("div");
      sortingContainer.id = "sorting-container";
      sortingContainer.classList.add(
        "flex",
        "justify-center",
        "space-x-4",
        "mb-4"
      );

      profileContainer.parentElement.insertBefore(
        sortingContainer,
        profileContainer
      );
    }

    sortingContainer.innerHTML = `
      <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-all" id="toggleCreditsSort">Sort by Most Credits</button>
      <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-all" id="toggleListingsSort">Sort by Most Listings</button>
    `;

    let isSortingByMostCredits = true; // Track the current sorting state for credits
    let isSortingByMostListings = true; // Track the current sorting state for listings

    // Toggle sorting for credits
    document
      .getElementById("toggleCreditsSort")
      .addEventListener("click", () => {
        if (isSortingByMostCredits) {
          sortProfiles("leastCredits");
          document.getElementById("toggleCreditsSort").textContent =
            "Sort by Least Credits";
        } else {
          sortProfiles("mostCredits");
          document.getElementById("toggleCreditsSort").textContent =
            "Sort by Most Credits";
        }
        isSortingByMostCredits = !isSortingByMostCredits; // Toggle the state
      });

    // Toggle sorting for listings
    document
      .getElementById("toggleListingsSort")
      .addEventListener("click", () => {
        if (isSortingByMostListings) {
          sortProfiles("leastListings");
          document.getElementById("toggleListingsSort").textContent =
            "Sort by Least Listings";
        } else {
          sortProfiles("mostListings");
          document.getElementById("toggleListingsSort").textContent =
            "Sort by Most Listings";
        }
        isSortingByMostListings = !isSortingByMostListings; // Toggle the state
      });
  }

  /**
   * Sort profiles based on the selected criteria
   * @param {string} criteria - The sorting criteria ("mostCredits", "leastCredits", "mostListings", "leastListings")
   */
  function sortProfiles(criteria) {
    if (!sortedProfiles || sortedProfiles.length === 0) return;

    switch (criteria) {
      case "mostCredits":
        sortedProfiles.sort((a, b) => (b.credits || 0) - (a.credits || 0));
        break;
      case "leastCredits":
        sortedProfiles.sort((a, b) => (a.credits || 0) - (b.credits || 0));
        break;
      case "mostListings":
        sortedProfiles.sort(
          (a, b) => (b._count?.listings || 0) - (a._count?.listings || 0)
        );
        break;
      case "leastListings":
        sortedProfiles.sort(
          (a, b) => (a._count?.listings || 0) - (b._count?.listings || 0)
        );
        break;
      default:
        console.warn("Unknown sorting criteria:", criteria);
    }

    // Re-render the profiles after sorting
    renderBatch();
  }

  addSortingControls();
  renderBatch(); // Render the first batch of profiles
}

/**
 * Initialize the profiles page
 */
async function initializeProfilesPage() {
  profileContainer.innerHTML = `
    <div class="loading text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
      <p>Loading profiles...</p>
    </div>
  `;

  try {
    const profiles = await fetchProfiles();
    renderProfiles(profiles);
  } catch (error) {
    console.error("Error initializing profiles page:", error);
    profileContainer.innerHTML = `
      <div class="error-message bg-red-100 text-red-800 p-4 rounded-lg text-center">
        <p>${error.message || "An unexpected error occurred."}</p>
      </div>
    `;
  }
}

// Initialize the page when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeProfilesPage);
