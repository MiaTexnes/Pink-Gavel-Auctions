import {
  isAuthenticated,
  getCurrentUser,
  getAuthHeader,
} from "../library/auth.js";

const API_BASE = "https://v2.api.noroff.dev";

// DOM Elements
const loadingSpinner = document.getElementById("loading-spinner");
const errorContainer = document.getElementById("error-container");
const errorText = document.getElementById("error-text");
const itemContent = document.getElementById("item-content");

// Item Details Elements
const mainImage = document.getElementById("main-image");
const imageGallery = document.getElementById("image-gallery");
const auctionStatus = document.getElementById("auction-status");
const itemTitle = document.getElementById("item-title");
const itemDescription = document.getElementById("item-description");
const sellerAvatar = document.getElementById("seller-avatar");
const sellerName = document.getElementById("seller-name");
const currentBid = document.getElementById("current-bid");
const bidCount = document.getElementById("bid-count");
const timeRemaining = document.getElementById("time-remaining");
const endDate = document.getElementById("end-date");

// Bidding Elements
const biddingSection = document.getElementById("bidding-section");
const bidForm = document.getElementById("bid-form");
const bidAmountInput = document.getElementById("bid-amount");
const minBidText = document.getElementById("min-bid-text");
const ownerActions = document.getElementById("owner-actions");
const authRequired = document.getElementById("auth-required");

// Bidding History Elements
const biddingHistory = document.getElementById("bidding-history");
const noBids = document.getElementById("no-bids");

// Modal Elements
const deleteModal = document.getElementById("delete-modal");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

// Edit Modal Elements
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-listing-form");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const editTitleInput = document.getElementById("edit-title");
const editDescriptionInput = document.getElementById("edit-description");
const editMediaInput = document.getElementById("edit-media");

// Global Variables
let currentListing = null;
let countdownInterval = null;

// Get listing ID from URL parameters
function getListingId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Show loading state
function showLoading() {
  loadingSpinner.classList.remove("hidden");
  errorContainer.classList.add("hidden");
  itemContent.classList.add("hidden");
}

// Show error state
function showError(message) {
  loadingSpinner.classList.add("hidden");
  errorContainer.classList.remove("hidden");
  itemContent.classList.add("hidden");
  errorText.textContent = message;
}

// Show item content
function showContent() {
  loadingSpinner.classList.add("hidden");
  errorContainer.classList.add("hidden");
  itemContent.classList.remove("hidden");
}

// Format time remaining
function formatTimeRemaining(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const timeLeft = end.getTime() - now.getTime();

  if (timeLeft <= 0) {
    return { text: "Auction Ended", isEnded: true };
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  if (days > 0) {
    return { text: `${days}d ${hours}h ${minutes}m`, isEnded: false };
  } else if (hours > 0) {
    return { text: `${hours}h ${minutes}m ${seconds}s`, isEnded: false };
  } else {
    return { text: `${minutes}m ${seconds}s`, isEnded: false };
  }
}

// Update countdown timer
function updateCountdown() {
  if (!currentListing) return;

  const timeInfo = formatTimeRemaining(currentListing.endsAt);
  timeRemaining.textContent = timeInfo.text;

  if (timeInfo.isEnded) {
    auctionStatus.textContent = "Ended";
    auctionStatus.className =
      "absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white";
    biddingSection.classList.add("hidden");
    authRequired.classList.add("hidden");

    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  } else {
    auctionStatus.textContent = "Active";
    auctionStatus.className =
      "absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white";
  }
}

// Start countdown timer
function startCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

// Render listing details
function renderListing(listing) {
  currentListing = listing;

  // Set title and description
  itemTitle.textContent = listing.title;
  itemDescription.textContent =
    listing.description || "No description provided.";

  // Set main image
  if (listing.media && listing.media.length > 0 && listing.media[0].url) {
    mainImage.src = listing.media[0].url;
    mainImage.alt = listing.title;

    // Show gallery if multiple images
    if (listing.media.length > 1) {
      renderImageGallery(listing.media);
    }
  } else {
    mainImage.src = "https://placehold.co/600x400?text=No+Image";
    mainImage.alt = "No image available";
  }

  // Set seller info
  const sellerAvatarUrl =
    listing.seller?.avatar?.url || "https://placehold.co/48x48?text=S";
  sellerAvatar.src = sellerAvatarUrl;
  sellerAvatar.alt = `${listing.seller?.name || "Unknown"} avatar`;
  sellerName.textContent = listing.seller?.name || "Unknown Seller";

  // Set bid information
  const bids = listing.bids || [];
  const highestBid =
    bids.length > 0 ? Math.max(...bids.map((bid) => bid.amount)) : 0;

  currentBid.textContent =
    highestBid > 0 ? `${highestBid} credits` : "No bids yet";
  bidCount.textContent = `${bids.length} bid${bids.length !== 1 ? "s" : ""}`;

  // Set end date
  const endDateTime = new Date(listing.endsAt);
  endDate.textContent = `Ends: ${endDateTime.toLocaleDateString()} ${endDateTime.toLocaleTimeString()}`;

  // Set minimum bid
  const minBid = highestBid + 1;
  bidAmountInput.min = minBid;
  bidAmountInput.placeholder = `Minimum bid: ${minBid}`;
  minBidText.textContent = `Minimum bid: ${minBid} credits`;

  // Start countdown
  startCountdown();

  // Handle bidding/owner actions
  handleUserActions(listing, bids);

  // Render bidding history
  renderBiddingHistory(bids);
}

// Render image gallery
function renderImageGallery(media) {
  const gallery = document.getElementById("image-gallery");
  gallery.innerHTML = "";

  media.forEach((item, index) => {
    const thumbnail = document.createElement("img");
    thumbnail.src = item.url;
    thumbnail.alt = item.alt || `Image ${index + 1}`;
    thumbnail.className =
      "w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity";

    if (index === 0) {
      thumbnail.classList.add("border-2", "border-pink-500");
    }

    thumbnail.addEventListener("click", () => {
      mainImage.src = item.url;
      // Update active thumbnail
      gallery.querySelectorAll("img").forEach((img) => {
        img.classList.remove("border-2", "border-pink-500");
      });
      thumbnail.classList.add("border-2", "border-pink-500");
    });

    gallery.appendChild(thumbnail);
  });

  gallery.classList.remove("hidden");
}

// Handle user actions (bidding, owner actions, auth required)
function handleUserActions(listing, bids) {
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();
  const isOwner =
    authenticated && currentUser && currentUser.name === listing.seller?.name;
  const timeInfo = formatTimeRemaining(listing.endsAt);

  if (isOwner) {
    // User owns this listing - show owner actions regardless of auction status
    biddingSection?.classList.add("hidden");
    authRequired?.classList.add("hidden");
    ownerActions?.classList.remove("hidden");
  } else if (timeInfo.isEnded) {
    // Auction ended and user is not owner - hide all action sections
    biddingSection?.classList.add("hidden");
    ownerActions?.classList.add("hidden");
    authRequired?.classList.add("hidden");
  } else if (authenticated) {
    // Authenticated user can bid (auction still active)
    authRequired?.classList.add("hidden");
    ownerActions?.classList.add("hidden");
    biddingSection?.classList.remove("hidden");
  } else {
    // Not authenticated
    biddingSection?.classList.add("hidden");
    ownerActions?.classList.add("hidden");
    authRequired?.classList.remove("hidden");
  }
}

// Render bidding history
function renderBiddingHistory(bids) {
  biddingHistory.innerHTML = "";

  if (bids.length === 0) {
    noBids.classList.remove("hidden");
    return;
  }

  noBids.classList.add("hidden");

  // Sort bids by amount (highest first)
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);

  sortedBids.forEach((bid, index) => {
    const bidElement = document.createElement("div");
    bidElement.className =
      "flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg";

    const isHighestBid = index === 0;

    bidElement.innerHTML = `
      <div class="flex items-center space-x-3">
        <img src="${
          bid.bidder?.avatar?.url || "https://placehold.co/40x40?text=B"
        }"
             alt="${bid.bidder?.name || "Unknown"}"
             class="w-10 h-10 rounded-full object-cover border-2 ${
               isHighestBid
                 ? "border-pink-500"
                 : "border-gray-300 dark:border-gray-600"
             }">
        <div>
          <p class="font-semibold ${isHighestBid ? "text-pink-600" : ""}">${
            bid.bidder?.name || "Unknown Bidder"
          }</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">${new Date(
            bid.created,
          ).toLocaleString()}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-bold text-lg ${isHighestBid ? "text-pink-600" : ""}">${
          bid.amount
        } credits</p>
        ${
          isHighestBid
            ? '<span class="text-xs text-pink-500 font-semibold">Highest Bid</span>'
            : ""
        }
      </div>
    `;

    biddingHistory.appendChild(bidElement);
  });
}

// Fetch listing details
async function fetchListing(id) {
  showLoading();

  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
    };

    // Add auth header if user is authenticated
    if (isAuthenticated()) {
      const authHeader = getAuthHeader();
      headers.Authorization = authHeader.Authorization;
    }

    const response = await fetch(
      `${API_BASE}/auction/listings/${id}?_seller=true&_bids=true`,
      {
        headers: headers,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to fetch listing",
      );
    }

    const responseData = await response.json();
    const listing = responseData.data;

    if (!listing) {
      throw new Error("Listing not found");
    }

    renderListing(listing);
    showContent();
  } catch (error) {
    console.error("Error fetching listing:", error);
    showError(error.message);
  }
}

// Place bid
async function placeBid(amount) {
  if (!isAuthenticated()) {
    alert("You must be logged in to place a bid");
    return;
  }

  try {
    const authHeader = getAuthHeader();
    const response = await fetch(
      `${API_BASE}/auction/listings/${currentListing.id}/bids`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
          Authorization: authHeader.Authorization,
        },
        body: JSON.stringify({ amount: parseInt(amount) }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.message || "Failed to place bid");
    }

    // Refresh the listing to show updated bid information
    await fetchListing(currentListing.id);
    alert("Bid placed successfully!");
  } catch (error) {
    console.error("Error placing bid:", error);
    alert(error.message);
  }
}

// Delete listing
async function deleteListing() {
  if (!isAuthenticated()) {
    alert("You must be logged in to delete a listing");
    return;
  }

  try {
    const authHeader = getAuthHeader();
    const response = await fetch(
      `${API_BASE}/auction/listings/${currentListing.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
          Authorization: authHeader.Authorization,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to delete listing",
      );
    }

    alert("Listing deleted successfully!");
    window.location.href = "/allListings.html";
  } catch (error) {
    console.error("Error deleting listing:", error);
    alert(error.message);
  }
}

// Edit listing
async function editListing(updatedData) {
  if (!isAuthenticated()) {
    alert("You must be logged in to edit a listing");
    return;
  }

  try {
    const authHeader = getAuthHeader();
    const response = await fetch(
      `${API_BASE}/auction/listings/${currentListing.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
          Authorization: authHeader.Authorization,
        },
        body: JSON.stringify(updatedData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to update listing",
      );
    }

    // Refresh the listing to show updated data
    await fetchListing(currentListing.id);

    alert("Listing updated successfully!");
    editModal.classList.add("hidden");
  } catch (error) {
    console.error("Error updating listing:", error);
    alert(error.message);
  }
}

// Populate edit form with current listing data
function populateEditForm() {
  if (!currentListing) return;

  editTitleInput.value = currentListing.title || "";
  editDescriptionInput.value = currentListing.description || "";

  // Convert media array to newline-separated URLs
  const mediaUrls =
    currentListing.media?.map((item) => item.url).join("\n") || "";
  editMediaInput.value = mediaUrls;
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const listingId = getListingId();

  if (!listingId) {
    showError("No listing ID provided");
    return;
  }

  fetchListing(listingId);

  // Bid form submission
  if (bidForm) {
    bidForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const amount = bidAmountInput.value;

      if (!amount || amount < bidAmountInput.min) {
        alert(`Minimum bid is ${bidAmountInput.min} credits`);
        return;
      }

      await placeBid(amount);
    });
  }

  // Edit listing button
  const editListingBtn = document.getElementById("edit-listing-btn");
  if (editListingBtn) {
    editListingBtn.addEventListener("click", () => {
      populateEditForm();
      editModal.classList.remove("hidden");
    });
  }

  // Edit form submission
  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = editTitleInput.value.trim();
      const description = editDescriptionInput.value.trim();
      const mediaText = editMediaInput.value.trim();

      // Validate required fields
      if (!title) {
        alert("Title is required");
        return;
      }

      if (!description) {
        alert("Description is required");
        return;
      }

      // Parse media URLs and format as objects
      const mediaUrls = mediaText
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
        .map((url) => ({
          url: url,
          alt: title, // Use the title as alt text, or you could make this more specific
        }));

      const updatedData = {
        title,
        description,
        media: mediaUrls,
      };

      await editListing(updatedData);
    });
  }

  // Edit modal actions
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      editModal.classList.add("hidden");
    });
  }

  // Delete listing button
  const deleteListingBtn = document.getElementById("delete-listing-btn");
  if (deleteListingBtn) {
    deleteListingBtn.addEventListener("click", () => {
      deleteModal.classList.remove("hidden");
    });
  }

  // Delete modal actions
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      deleteModal.classList.add("hidden");
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      deleteModal.classList.add("hidden");
      await deleteListing();
    });
  }

  // Close modals when clicking outside
  if (deleteModal) {
    deleteModal.addEventListener("click", (e) => {
      if (e.target === deleteModal) {
        deleteModal.classList.add("hidden");
      }
    });
  }

  if (editModal) {
    editModal.addEventListener("click", (e) => {
      if (e.target === editModal) {
        editModal.classList.add("hidden");
      }
    });
  }
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
