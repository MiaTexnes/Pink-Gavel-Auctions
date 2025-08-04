import { isAuthenticated, getAuthHeader } from "../library/auth.js";
import { createListing } from "../library/newListing.js";

const API_BASE = "https://v2.api.noroff.dev";
const listingsContainer = document.getElementById("listings-container");
const messageContainer = document.getElementById("message-container");
const messageText = document.getElementById("message-text");
const loadingSpinner = document.getElementById("loading-spinner");

function showMessage(msg, type = "info") {
  if (!messageText || !messageContainer || !listingsContainer) return;
  messageText.textContent = msg;
  messageContainer.className = `mt-8 text-center ${
    type === "error" ? "text-red-600" : "text-gray-600 dark:text-gray-300"
  }`;
  messageContainer.classList.remove("hidden");
  listingsContainer.innerHTML = ""; // Clear listings if there's a message
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

    if (listings.length === 0) {
      showMessage("No listings found.", "info");
      return;
    }

    listingsContainer.innerHTML = ""; // Clear loading message
    listings.forEach((listing) => {
      listingsContainer.appendChild(createListingCard(listing));
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    showMessage(`Error: ${error.message}`, "error");
  } finally {
    hideLoading();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Only run on allListings page
  if (!listingsContainer) return;

  fetchAllListings();

  // Modal logic
  const addListingBtn = document.getElementById("addListingBtn");
  const addListingModal = document.getElementById("addListingModal");
  const closeAddListingModal = document.getElementById("closeAddListingModal");
  const cancelAddListingBtn = document.getElementById("cancelAddListingBtn");

  function openAddListingModal() {
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
    if (!addListingModal) return;
    addListingModal.classList.add("hidden");
    const form = document.getElementById("addListingForm");
    if (form) {
      form.reset();
    }
  }
  if (addListingBtn)
    addListingBtn.addEventListener("click", openAddListingModal);
  if (closeAddListingModal)
    closeAddListingModal.addEventListener("click", closeAddListing);
  if (cancelAddListingBtn)
    cancelAddListingBtn.addEventListener("click", closeAddListing);

  // Close modal when clicking outside the modal content
  if (addListingModal) {
    addListingModal.addEventListener("click", function (event) {
      if (event.target === addListingModal) {
        closeAddListing();
      }
    });
  }

  // Add Listing Form Submission
  const addListingForm = document.getElementById("addListingForm");
  if (addListingForm) {
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
        // Success: close modal, refresh listings
        closeAddListing();
        fetchAllListings();
      } catch (err) {
        alert(err.message || "Failed to create listing.");
      }
    });
  }
});
