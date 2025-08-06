import { isAuthenticated, getAuthHeader } from "../library/auth.js";
import { createListing } from "../library/newListing.js";
import { searchAndSortComponent } from "../components/searchAndSort.js";

const API_BASE = "https://v2.api.noroff.dev";
const listingsContainer = document.getElementById("listings-container");
const messageContainer = document.getElementById("message-container");
const messageText = document.getElementById("message-text");
const loadingSpinner = document.getElementById("loading-spinner");

// Global variables for search functionality
let allListings = [];
let filteredListings = [];

function showMessage(msg, type = "info") {
  if (!messageText || !messageContainer || !listingsContainer) return;
  messageText.textContent = msg;
  messageContainer.className = `mt-8 text-center ${
    type === "error" ? "text-red-600" : "text-gray-600 dark:text-gray-300"
  }`;
  messageContainer.classList.remove("hidden");
  listingsContainer.innerHTML = "";
}

function showLoading() {
  if (!loadingSpinner || !messageContainer || !listingsContainer) return;
  loadingSpinner.classList.remove("hidden");
  messageContainer.classList.add("hidden");
  listingsContainer.innerHTML = "";
}

function hideLoading() {
  if (!loadingSpinner) return;
  loadingSpinner.classList.add("hidden");
}

function showError(message) {
  console.error(message);
  showMessage(message, "error");
}

export function createListingCard(listing) {
  const endDate = new Date(listing.endsAt);
  const now = new Date();
  const timeLeftMs = endDate.getTime() - now.getTime();

  let timeLeftString;
  if (timeLeftMs < 0) {
    timeLeftString = "Ended";
  } else {
    const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    timeLeftString = `Ends: ${days}d ${hours}h ${minutes}m`;
  }

  const imageUrl =
    listing.media && listing.media.length > 0 && listing.media[0].url
      ? listing.media[0].url
      : null;
  const sellerAvatar =
    listing.seller && listing.seller.avatar && listing.seller.avatar.url
      ? listing.seller.avatar.url
      : "https://placehold.co/40x40?text=S";
  const sellerName =
    listing.seller && listing.seller.name ? listing.seller.name : "Unknown";

  const card = document.createElement("a");
  card.href = `/item.html?id=${listing.id}`;
  card.className =
    "block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden w-72 h-[420px] flex flex-col mx-auto";

  card.innerHTML = `
    ${
      imageUrl
        ? `<img src="${imageUrl}" alt="${listing.title}" class="w-full h-40 object-contain dark:bg-gray-700 flex-shrink-0" onerror="this.outerHTML='<div class=\'w-full h-40 flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500 text-white text-center font-semibold text-lg italic flex-shrink-0\'>No image on this listing</div>'">`
        : `<div class="w-full h-40 flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500 text-white text-center font-semibold text-lg italic flex-shrink-0">No image on this listing</div>`
    }
    <div class="p-4 flex-1 flex flex-col">
      <h2 class="text-xl font-semibold mb-2 truncate">${listing.title}</h2>
      <p class="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">${
        listing.description || "No description provided."
      }</p>
      <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
        <span>${timeLeftString}</span>
        <span>Bids: ${listing._count?.bids || 0}</span>
      </div>
      <div class="flex items-center space-x-2 mt-auto">
        <img src="${sellerAvatar}" alt="${sellerName}" class="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600">
        <span class="text-gray-800 dark:text-gray-200 font-medium">${sellerName}</span>
      </div>
    </div>
  `;
  return card;
}

// Fetch all listings from API
async function fetchAllListings() {
  if (!listingsContainer) return;
  showLoading();

  try {
    const token = isAuthenticated() ? getAuthHeader().Authorization : "";
    const headers = {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
    };
    if (token) {
      headers["Authorization"] = token;
    }

    const response = await fetch(
      `${API_BASE}/auction/listings?_seller=true&_bids=true`,
      {
        headers: headers,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to fetch listings.",
      );
    }

    const responseData = await response.json();
    console.log("API Response:", responseData);
    const listings = responseData.data || [];

    // Sort listings by newest first (created date descending)
    const sortedListings = listings.sort(
      (a, b) => new Date(b.created) - new Date(a.created),
    );

    // Store sorted listings for search functionality
    allListings = sortedListings;

    if (sortedListings.length === 0) {
      showMessage("No listings found.", "info");
      return;
    }

    // Display sorted listings initially
    displayListings(sortedListings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    showMessage(`Error: ${error.message}`, "error");
  } finally {
    hideLoading();
  }
}

// Display listings in the UI
function displayListings(listings) {
  if (!listingsContainer) return;

  // Hide loading and messages
  hideLoading();
  if (messageContainer) {
    messageContainer.classList.add("hidden");
  }

  if (listings.length === 0) {
    showMessage("No listings found.", "info");
    return;
  }

  // Clear container and add listings
  listingsContainer.innerHTML = "";
  listings.forEach((listing) => {
    listingsContainer.appendChild(createListingCard(listing));
  });
}

// Search results handling
function handleSearchResults(event) {
  const { query, results, error, sortBy } = event.detail;

  console.log("Search results received on listings page:", {
    query,
    results: results.length,
    error,
    sortBy,
  });

  if (error) {
    showError(`Search error: ${error}`);
    return;
  }

  // Always display the results from the search component, whether it's a search or just sorting
  if (query.trim() === "") {
    // No search query - just sorting/displaying all listings
    removeSearchIndicator();
    displayListings(results); // Use the sorted results, not allListings
  } else {
    // Search results with query
    filteredListings = results;
    displayListings(results);
    updateSearchIndicator(query, results.length);
  }
}

function updateSearchIndicator(query, resultCount) {
  // Remove existing indicator first
  removeSearchIndicator();

  // Create new search indicator
  const indicator = document.createElement("div");
  indicator.id = "search-indicator";
  indicator.className =
    "mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg";

  indicator.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <p class="text-blue-800 dark:text-blue-200 font-medium">
          Search results for "${query}" (${resultCount} ${resultCount === 1 ? "result" : "results"})
        </p>
      </div>
      <button onclick="clearSearchResults()" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm underline">
        Clear search
      </button>
    </div>
  `;

  // Insert before listings container
  if (listingsContainer && listingsContainer.parentNode) {
    listingsContainer.parentNode.insertBefore(indicator, listingsContainer);
  }
}

function removeSearchIndicator() {
  const indicator = document.getElementById("search-indicator");
  if (indicator) {
    indicator.remove();
  }
}

// Make clearSearchResults globally available
window.clearSearchResults = function () {
  const headerSearch = document.getElementById("header-search");
  const mobileSearch = document.getElementById("mobile-search");
  if (headerSearch) headerSearch.value = "";
  if (mobileSearch) mobileSearch.value = "";

  removeSearchIndicator();
  displayListings(allListings);

  const url = new URL(window.location);
  url.searchParams.delete("search");
  window.history.replaceState({}, "", url);
};

// Modal functions
function openAddListingModal() {
  const addListingModal = document.getElementById("addListingModal");
  if (!addListingModal) return;
  addListingModal.classList.remove("hidden");

  // Set minimum date to current date/time
  const now = new Date();
  const localDateTime = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);
  const listingEndDate = document.getElementById("listingEndDate");
  if (listingEndDate) {
    listingEndDate.min = localDateTime;
  }
}

function closeAddListing() {
  const addListingModal = document.getElementById("addListingModal");
  if (!addListingModal) return;
  addListingModal.classList.add("hidden");
  const form = document.getElementById("addListingForm");
  if (form) {
    form.reset();
  }
}

// Function to update UI based on authentication status
function updateAuthUI() {
  const addListingBtn = document.getElementById("addListingBtn");

  if (addListingBtn) {
    if (isAuthenticated()) {
      addListingBtn.classList.remove("hidden");
    } else {
      addListingBtn.classList.add("hidden");
    }
  }
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Only run on allListings page
  if (!listingsContainer) return;

  // Initialize search and sort component
  console.log("Initializing search and sort component...");
  searchAndSortComponent.init();

  // Update UI based on authentication status
  updateAuthUI();

  // Set default active sort button to "Newest"
  const newestButton = document.querySelector('.sort-btn[data-sort="newest"]');
  if (newestButton) {
    newestButton.classList.remove(
      "bg-gray-200",
      "dark:bg-gray-700",
      "text-gray-700",
      "dark:text-gray-300",
    );
    newestButton.classList.add("bg-pink-500", "text-white");
  }

  // Load initial listings (will be sorted newest first)
  fetchAllListings();

  // Listen for search events
  window.addEventListener("searchPerformed", handleSearchResults);

  // Check URL for search parameter and trigger search
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search");
  if (searchQuery) {
    const headerSearch = document.getElementById("header-search");
    const mobileSearch = document.getElementById("mobile-search");
    if (headerSearch) {
      headerSearch.value = searchQuery;
      // Trigger search for this query
      setTimeout(() => {
        searchAndSortComponent.performSearch(searchQuery);
      }, 500);
    }
    if (mobileSearch) {
      mobileSearch.value = searchQuery;
    }
  }

  // Modal event listeners (only if user is authenticated)
  const addListingBtn = document.getElementById("addListingBtn");
  const addListingModal = document.getElementById("addListingModal");
  const closeAddListingModal = document.getElementById("closeAddListingModal");
  const cancelAddListingBtn = document.getElementById("cancelAddListingBtn");

  if (addListingBtn && isAuthenticated()) {
    addListingBtn.addEventListener("click", openAddListingModal);
  }
  if (closeAddListingModal)
    closeAddListingModal.addEventListener("click", closeAddListing);
  if (cancelAddListingBtn)
    cancelAddListingBtn.addEventListener("click", closeAddListing);

  // Close modal when clicking outside
  if (addListingModal) {
    addListingModal.addEventListener("click", function (event) {
      if (event.target === addListingModal) {
        closeAddListing();
      }
    });
  }

  // Add Listing Form Submission (only if user is authenticated)
  const addListingForm = document.getElementById("addListingForm");
  if (addListingForm && isAuthenticated()) {
    addListingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("listingTitle").value.trim();
      const description = document.getElementById("listingDesc").value.trim();
      const endsAt = document.getElementById("listingEndDate").value;
      const mediaUrl = document.getElementById("listingImage").value.trim();

      try {
        await createListing({
          title,
          description,
          endsAt,
          media: mediaUrl ? [mediaUrl] : [],
        });
        closeAddListing();
        fetchAllListings();
      } catch (err) {
        alert(err.message || "Failed to create listing.");
      }
    });
  }

  // Listen for authentication state changes
  window.addEventListener("storage", (e) => {
    if (e.key === "token" || e.key === "user") {
      updateAuthUI();
    }
  });
});
