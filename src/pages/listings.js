import { isAuthenticated, getAuthHeader } from "../library/auth.js";
import { createListing } from "../library/newListing.js";
import { searchAndSortComponent } from "../components/searchAndSort.js";

const API_BASE = "https://v2.api.noroff.dev";
const listingsContainer = document.getElementById("listings-container");
const messageContainer = document.getElementById("message-container");
const messageText = document.getElementById("message-text");
const loadingSpinner = document.getElementById("loading-spinner");

// Global variables for search functionality
let listings = [];
let filteredListings = [];

// Global variable to store selected media URLs
let selectedMediaUrls = [];

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
      (timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
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
  // Fixed card dimensions with consistent height
  card.className =
    "block bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-full flex flex-col cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 border border-gray-100 dark:border-gray-700";

  // Set fixed height using inline style to ensure consistency
  card.style.height = "420px";
  card.style.minHeight = "420px";
  card.style.maxHeight = "420px";

  // Template with absolutely fixed sizing - ensuring all cards are identical
  card.innerHTML = `
    ${
      imageUrl
        ? `<div class="w-full flex-shrink-0 bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center" style="height: 192px; min-height: 192px; max-height: 192px;">
            <img src="${imageUrl}" alt="${listing.title}" class="w-full h-full object-contain listing-image transition-transform duration-300 hover:scale-105" style="max-width: 100%; max-height: 100%;">
           </div>`
        : `<div class="w-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500 text-white text-center font-semibold text-lg italic flex-shrink-0 transition-all duration-300 hover:from-pink-500 hover:to-purple-600" style="height: 192px; min-height: 192px; max-height: 192px;">
            No image on this listing
           </div>`
    }
    <div class="p-4 flex-1 flex flex-col min-h-0" style="height: 228px; min-height: 228px; max-height: 228px;">
      <h2 class="text-lg font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-white transition-colors duration-200 hover:text-pink-600 dark:hover:text-pink-400" style="height: 48px; min-height: 48px; max-height: 48px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${listing.title}</h2>
      <p class="text-gray-700 dark:text-gray-300 text-sm mb-3 flex-1 overflow-hidden transition-colors duration-200" style="height: 64px; min-height: 64px; max-height: 64px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${
        listing.description || "No description provided."
      }</p>
      <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3 flex-shrink-0" style="height: 24px; min-height: 24px; max-height: 24px;">
        <span class="font-medium ${timeLeftMs < 0 ? "text-red-500 dark:text-red-400" : timeLeftMs < 24 * 60 * 60 * 1000 ? "text-orange-500 dark:text-orange-400" : "text-green-500 dark:text-green-400"} transition-colors duration-200 truncate" style="max-width: 60%;">${timeLeftString}</span>
        <span class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:bg-pink-100 dark:hover:bg-pink-900 hover:scale-105 flex-shrink-0">Bids: ${listing._count?.bids || 0}</span>
      </div>
      <div class="flex items-center space-x-2 flex-shrink-0 transition-all duration-200 hover:translate-x-1" style="height: 32px; min-height: 32px; max-height: 32px;">
        <img src="${sellerAvatar}" alt="${sellerName}" class="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 transition-all duration-200 hover:border-pink-400 dark:hover:border-pink-500 hover:shadow-md flex-shrink-0" style="width: 32px; height: 32px; min-width: 32px; min-height: 32px;">
        <span class="text-gray-800 dark:text-gray-200 font-medium truncate transition-colors duration-200 hover:text-pink-600 dark:hover:text-pink-400 min-w-0" style="max-width: calc(100% - 40px);">${sellerName}</span>
      </div>
    </div>
  `;

  // Handle image error with JavaScript
  if (imageUrl) {
    const img = card.querySelector(".listing-image");
    if (img) {
      img.addEventListener("error", function () {
        this.parentElement.outerHTML =
          '<div class="w-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500 text-white text-center font-semibold text-lg italic flex-shrink-0 transition-all duration-300 hover:from-pink-500 hover:to-purple-600" style="height: 192px; min-height: 192px; max-height: 192px;">No image on this listing</div>';
      });
    }
  }

  return card;
}

// Fetch all listings from API
async function fetchlistings() {
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

    console.log("Making API request with headers:", headers);

    const response = await fetch(
      `${API_BASE}/auction/listings?_seller=true&_bids=true&limit=100&sort=created&sortOrder=desc`,
      {
        headers: headers,
      }
    );

    console.log("API Response status:", response.status);
    console.log(
      "API Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to fetch listings."
      );
    }

    const responseData = await response.json();
    console.log("Full API Response:", responseData);

    listings = responseData.data || []; // Now this reassignment works

    if (listings.length === 0) {
      console.log("No listings returned from API");
      showMessage("No listings found.", "info");
      return;
    }

    displayListings(listings);
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

  // Handle special case for active auctions with no results
  if (sortBy === "active-auctions" && results.length === 0) {
    if (query.trim() === "") {
      showMessage("No active auctions available at the moment.", "info");
    } else {
      showMessage(`No active auctions found for "${query}".`, "info");
    }
    return;
  }

  // Handle empty results for other sorts
  if (results.length === 0) {
    if (query.trim() === "") {
      showMessage("No listings available at the moment.", "info");
    } else {
      showMessage(`No results found for "${query}".`, "info");
    }
    return;
  }

  // Always display the results from the search component
  if (query.trim() === "") {
    // No search query - just sorting/displaying all listings
    removeSearchIndicator();
    displayListings(results);
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
  displayListings(listings);

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
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);
  const listingEndDate = document.getElementById("listingEndDate");
  if (listingEndDate) {
    listingEndDate.min = localDateTime;
  }

  // Setup media modal button
  setupMediaModalButton();
  // Reset selected media
  selectedMediaUrls = [];
  updateMediaPreview();
}

function closeAddListing() {
  const addListingModal = document.getElementById("addListingModal");
  if (!addListingModal) return;
  addListingModal.classList.add("hidden");
  const form = document.getElementById("addListingForm");
  if (form) {
    form.reset();
    selectedMediaUrls = [];
    updateMediaPreview();
  }
}

// Media Modal functions
function openMediaModal() {
  const mediaModal = document.getElementById("addMediaModal");
  const listingModal = document.getElementById("addListingModal");

  console.log("Opening media modal"); // Debug log
  console.log("Media modal found:", !!mediaModal); // Debug log
  console.log("Listing modal found:", !!listingModal); // Debug log

  if (!mediaModal || !listingModal) return;

  listingModal.classList.add("hidden");
  mediaModal.classList.remove("hidden");

  // Use the simpler event setup
  setupMediaInputsSimple();
  populateExistingMedia();
}

function closeMediaModal() {
  const mediaModal = document.getElementById("addMediaModal");
  const listingModal = document.getElementById("addListingModal");
  if (!mediaModal || !listingModal) return;

  mediaModal.classList.add("hidden");
  listingModal.classList.remove("hidden");
  resetMediaInputs();
}

function setupMediaModalButton() {
  const openMediaBtn = document.getElementById("openMediaModalBtn");
  if (openMediaBtn) {
    // Remove existing event listeners
    const newBtn = openMediaBtn.cloneNode(true);
    openMediaBtn.parentNode.replaceChild(newBtn, openMediaBtn);
    newBtn.addEventListener("click", openMediaModal);
  }
}

// Setup dynamic media inputs
function setupMediaInputs() {
  const addMoreBtn = document.getElementById("addMoreUrlBtn");
  const backBtn = document.getElementById("backToListingBtn");
  const mediaForm = document.getElementById("addMediaForm");

  // Clear existing event listeners and add new ones
  if (addMoreBtn) {
    // Remove existing listeners by cloning
    const newAddMoreBtn = addMoreBtn.cloneNode(true);
    addMoreBtn.parentNode.replaceChild(newAddMoreBtn, addMoreBtn);

    // Add event listener to the new button
    newAddMoreBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Add more media button clicked"); // Debug log

      const mediaContainer = document.getElementById("mediaUrlInputs");
      if (!mediaContainer) {
        console.error("Media container not found");
        return;
      }

      const currentInputs = mediaContainer.querySelectorAll("input").length;
      console.log("Current inputs count:", currentInputs); // Debug log

      const newInput = document.createElement("input");
      newInput.type = "url";
      newInput.name = "mediaUrl";
      newInput.placeholder = `Image URL ${currentInputs + 1}`;
      newInput.className =
        "w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white";

      mediaContainer.appendChild(newInput);
      console.log("New input added"); // Debug log
    });
  } else {
    console.error("Add more button not found");
  }

  if (backBtn) {
    const newBackBtn = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(newBackBtn, backBtn);
    newBackBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeMediaModal();
    });
  }

  if (mediaForm) {
    const newMediaForm = mediaForm.cloneNode(true);
    mediaForm.parentNode.replaceChild(newMediaForm, mediaForm);
    newMediaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      collectAndSaveMediaUrls();
      closeMediaModal();
    });
  }
}

// Alternative approach - simpler event handling
function setupMediaInputsSimple() {
  // Remove any existing event listeners by using onclick
  const addMoreBtn = document.getElementById("addMoreUrlBtn");
  const backBtn = document.getElementById("backToListingBtn");
  const mediaForm = document.getElementById("addMediaForm");

  if (addMoreBtn) {
    addMoreBtn.onclick = function (e) {
      e.preventDefault();
      console.log("Add more media button clicked"); // Debug log

      const mediaContainer = document.getElementById("mediaUrlInputs");
      if (!mediaContainer) {
        console.error("Media container not found");
        return;
      }

      const currentInputs = mediaContainer.querySelectorAll("input").length;
      console.log("Current inputs count:", currentInputs); // Debug log

      const newInput = document.createElement("input");
      newInput.type = "url";
      newInput.name = "mediaUrl";
      newInput.placeholder = `Image URL ${currentInputs + 1}`;
      newInput.className =
        "w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white";

      mediaContainer.appendChild(newInput);
      console.log("New input added"); // Debug log
    };
  } else {
    console.error("Add more button not found");
  }

  if (backBtn) {
    backBtn.onclick = function (e) {
      e.preventDefault();
      closeMediaModal();
    };
  }

  if (mediaForm) {
    mediaForm.onsubmit = function (e) {
      e.preventDefault();
      collectAndSaveMediaUrls();
      closeMediaModal();
    };
  }
}

// Populate existing media URLs in the modal
function populateExistingMedia() {
  const mediaContainer = document.getElementById("mediaUrlInputs");
  if (!mediaContainer) return;

  // Clear existing inputs
  mediaContainer.innerHTML = "";

  // Add existing URLs or default empty inputs
  if (selectedMediaUrls.length > 0) {
    selectedMediaUrls.forEach((url, index) => {
      const input = document.createElement("input");
      input.type = "url";
      input.name = "mediaUrl";
      input.placeholder = `Image URL ${index + 1}`;
      input.value = url;
      input.className =
        "w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white";
      mediaContainer.appendChild(input);
    });
  } else {
    // Add default two empty inputs
    for (let i = 1; i <= 2; i++) {
      const input = document.createElement("input");
      input.type = "url";
      input.name = "mediaUrl";
      input.placeholder = `Image URL ${i}`;
      input.className =
        "w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white";
      mediaContainer.appendChild(input);
    }
  }
}

// Reset media inputs to default state
function resetMediaInputs() {
  const mediaContainer = document.getElementById("mediaUrlInputs");
  if (mediaContainer) {
    mediaContainer.innerHTML = `
      <input
        type="url"
        name="mediaUrl"
        placeholder="Image URL 1"
        class="w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
      />
      <input
        type="url"
        name="mediaUrl"
        placeholder="Image URL 2"
        class="w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
      />
    `;
  }
}

// Collect media URLs from modal and save them
function collectAndSaveMediaUrls() {
  const mediaInputs = document.querySelectorAll("input[name='mediaUrl']");
  selectedMediaUrls = Array.from(mediaInputs)
    .map((input) => input.value.trim())
    .filter((url) => url.length > 0);

  updateMediaPreview();
}

// Update the media preview in the main modal
function updateMediaPreview() {
  const mediaCount = document.getElementById("mediaCount");
  if (mediaCount) {
    if (selectedMediaUrls.length === 0) {
      mediaCount.textContent = "No media selected";
      mediaCount.className = "text-gray-600 dark:text-gray-400";
    } else {
      mediaCount.textContent = `${selectedMediaUrls.length} media item${
        selectedMediaUrls.length > 1 ? "s" : ""
      } selected`;
      mediaCount.className = "text-green-600 dark:text-green-400";
    }
  }
}

// Function to collect media URLs from form (updated to use selectedMediaUrls)
function collectMediaUrls() {
  return selectedMediaUrls;
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
  // Only run on listings page
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
      "dark:text-gray-300"
    );
    newestButton.classList.add("bg-pink-500", "text-white");
  }

  // Load initial listings (will be sorted newest first)
  fetchlistings();

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
      const tags = document.getElementById("listingTags")
        ? document.getElementById("listingTags").value.trim()
        : "";

      try {
        await createListing({
          title,
          description,
          endsAt,
          media: selectedMediaUrls,
          tags: tags, // Pass tags string to createListing function
        });
        closeAddListing();
        fetchlistings();
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

// Helper function to process tags from comma-separated string
function processTags(tagsString) {
  if (!tagsString || typeof tagsString !== "string") {
    return [];
  }

  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 10); // Limit to 10 tags
}
