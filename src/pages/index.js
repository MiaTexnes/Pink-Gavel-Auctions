import { isAuthenticated } from "../library/auth.js";
import { createListingCard } from "./allListings.js";

const API_BASE = "https://v2.api.noroff.dev";

// DOM Elements
const homeAuthButtons = document.getElementById("home-auth-buttons");
const homeLoading = document.getElementById("home-loading");
const homeError = document.getElementById("home-error");
const listingsCarousel = document.getElementById("listings-carousel");
const noListings = document.getElementById("no-listings");

// Show/hide elements
function showElement(element) {
  if (element) element.classList.remove("hidden");
}

function hideElement(element) {
  if (element) element.classList.add("hidden");
}

// Render auth buttons based on login status
function renderAuthButtons() {
  if (!homeAuthButtons) return;

  if (isAuthenticated()) {
    homeAuthButtons.innerHTML = `
      <div class="text-center">
        <p class="text-black mb-4">Welcome back! Ready to bid on some amazing items?</p>
        <a href="/allListings.html" class="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Browse Auctions
        </a>
      </div>
    `;
  } else {
    homeAuthButtons.innerHTML = `
      <div class="flex flex-col sm:flex-row gap-4">
        <a href="/auth/register.html" class="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Register
        </a>
        <a href="/auth/login.html" class="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors border border-purple-600">
          Login
        </a>
      </div>
    `;
  }
}

// Fetch and display newest listings
async function loadNewestListings() {
  if (!listingsCarousel) return;

  try {
    showElement(homeLoading);
    hideElement(homeError);
    hideElement(listingsCarousel);
    hideElement(noListings);

    const headers = {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
    };

    const response = await fetch(
      `${API_BASE}/auction/listings?_seller=true&_bids=true&limit=10&sort=created&sortOrder=desc`,
      { headers },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch listings");
    }

    const responseData = await response.json();
    const listings = responseData.data || [];

    hideElement(homeLoading);

    if (listings.length === 0) {
      showElement(noListings);
      return;
    }

    // Sort by newest first
    const sortedListings = listings.sort(
      (a, b) => new Date(b.created) - new Date(a.created),
    );

    renderCarousel(sortedListings.slice(0, 8)); // Show max 8 items in carousel
    showElement(listingsCarousel);
  } catch (error) {
    console.error("Error loading newest listings:", error);
    hideElement(homeLoading);
    showElement(homeError);
  }
}

// Render the carousel
function renderCarousel(listings) {
  if (!listingsCarousel) return;

  const carouselContainer = listingsCarousel.querySelector(".flex");
  if (!carouselContainer) return;

  carouselContainer.innerHTML = "";

  listings.forEach((listing) => {
    const card = createListingCard(listing);
    // Add some carousel-specific classes
    card.classList.add("flex-shrink-0");
    carouselContainer.appendChild(card);
  });
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Only run on index page
  if (!document.getElementById("main-content")) return;

  renderAuthButtons();
  loadNewestListings();

  // Listen for auth state changes
  window.addEventListener("storage", (e) => {
    if (e.key === "token" || e.key === "user") {
      renderAuthButtons();
    }
  });
});

// Export for other modules
export { renderCarousel };
