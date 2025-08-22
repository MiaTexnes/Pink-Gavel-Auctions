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

// Fetch latest listings
async function fetchLatestListings(limit = 20) {
  const response = await fetch(
    `${API_BASE}/auction/listings?_seller=true&_bids=true&sort=created&sortOrder=desc&limit=${limit}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      },
    },
  );
  if (!response.ok) throw new Error("Failed to fetch listings");
  const responseData = await response.json();
  return responseData.data || [];
}

// Get cards per view based on screen size - showing fewer cards for full display
function getCardsPerView() {
  if (window.innerWidth < 640) return 1; // mobile - show 1 full card
  if (window.innerWidth < 768) return 1; // sm - show 1 full card
  if (window.innerWidth < 1024) return 2; // md - show 2 full cards
  if (window.innerWidth < 1280) return 3; // lg - show 3 full cards
  return 4; // xl and up - show 4 full cards
}

// Render the carousel
function renderCarousel(listings) {
  const container = document.querySelector(".carousel-container");
  if (!container) return;
  container.innerHTML = "";

  let currentIndex = 0;
  let cardsPerView = getCardsPerView();
  const total = listings.length;

  // Main wrapper with overflow control
  const carouselWrapper = document.createElement("div");
  carouselWrapper.className =
    "flex flex-col items-center w-full max-w-full overflow-hidden";

  // Container for the main carousel area with proper constraints
  const carouselContainer = document.createElement("div");
  carouselContainer.className = "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  // Main carousel area: arrows and cards in a row
  const mainArea = document.createElement("div");
  mainArea.className = "flex items-center justify-between gap-4 w-full";

  const leftBtn = document.createElement("button");
  leftBtn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
    </svg>
  `;
  leftBtn.className =
    "p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0 transform hover:scale-105 z-10";
  leftBtn.setAttribute("aria-label", "Scroll carousel left"); // Added ARIA label
  leftBtn.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  });

  const rightBtn = document.createElement("button");
  rightBtn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
    </svg>
  `;
  rightBtn.className =
    "p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0 transform hover:scale-105 z-10";
  rightBtn.setAttribute("aria-label", "Scroll carousel right"); // Added ARIA label
  rightBtn.addEventListener("click", () => {
    currentIndex = Math.min(total - cardsPerView, currentIndex + 1);
    updateCarousel();
  });

  // Card area with proper overflow handling - use grid for consistent sizing
  const cardArea = document.createElement("div");
  cardArea.className = `grid gap-4 flex-1 min-w-0 overflow-hidden px-2`;

  mainArea.appendChild(leftBtn);
  mainArea.appendChild(cardArea);
  mainArea.appendChild(rightBtn);

  carouselContainer.appendChild(mainArea);

  // Thumbnail scrollbar with controlled width
  const scrollBarContainer = document.createElement("div");
  scrollBarContainer.className = "w-full max-w-4xl mx-auto mt-6 px-4";

  const scrollBar = document.createElement("div");
  scrollBar.className =
    "flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide";

  scrollBarContainer.appendChild(scrollBar);

  function updateCarousel() {
    cardsPerView = getCardsPerView();

    // Update grid template columns based on cards per view
    cardArea.style.gridTemplateColumns = `repeat(${cardsPerView}, 1fr)`;
    cardArea.innerHTML = "";

    // Update button states
    leftBtn.disabled = currentIndex === 0;
    rightBtn.disabled = currentIndex >= total - cardsPerView;

    // Update button colors based on state
    if (currentIndex === 0) {
      leftBtn.className = leftBtn.className.replace(
        "bg-pink-500 hover:bg-pink-600",
        "bg-gray-400 cursor-not-allowed",
      );
      leftBtn.className = leftBtn.className.replace("hover:scale-105", "");
    } else {
      leftBtn.className = leftBtn.className.replace(
        "bg-gray-400 cursor-not-allowed",
        "bg-pink-500 hover:bg-pink-600",
      );
      if (!leftBtn.className.includes("hover:scale-105")) {
        leftBtn.className += " hover:scale-105";
      }
    }

    if (currentIndex >= total - cardsPerView) {
      rightBtn.className = rightBtn.className.replace(
        "bg-pink-500 hover:bg-pink-600",
        "bg-gray-400 cursor-not-allowed",
      );
      rightBtn.className = rightBtn.className.replace("hover:scale-105", "");
    } else {
      rightBtn.className = rightBtn.className.replace(
        "bg-gray-400 cursor-not-allowed",
        "bg-pink-500 hover:bg-pink-600",
      );
      if (!rightBtn.className.includes("hover:scale-105")) {
        rightBtn.className += " hover:scale-105";
      }
    }

    // Add cards to view - keep original card sizing and ensure images aren't cropped
    for (let i = 0; i < Math.min(cardsPerView, total - currentIndex); i++) {
      const idx = currentIndex + i;
      const card = createListingCard(listings[idx]);

      // Keep the original card styling - don't resize
      card.style.width = "auto";
      card.style.minWidth = "auto";
      card.style.maxWidth = "none";

      // Find all images in the card and ensure they show full image without cropping
      const images = card.querySelectorAll("img");
      images.forEach((img) => {
        // Remove any object-cover classes that crop images
        img.classList.remove("object-cover");
        // Add object-contain to show full image
        img.classList.add("object-contain");
        // Ensure proper aspect ratio handling
        if (!img.style.height && !img.classList.contains("w-full")) {
          img.style.height = "auto";
          img.style.maxHeight = "200px"; // Set a reasonable max height
        }
      });

      // Also check for any container that might be cropping
      const imageContainers = card.querySelectorAll(
        '.aspect-square, .aspect-video, [class*="aspect-"]',
      );
      imageContainers.forEach((container) => {
        // Remove fixed aspect ratios that might crop images
        container.classList.remove("aspect-square", "aspect-video");
        // Remove any aspect-* classes
        Array.from(container.classList).forEach((cls) => {
          if (cls.startsWith("aspect-")) {
            container.classList.remove(cls);
          }
        });
        // Add flexible height
        if (!container.style.height) {
          container.style.height = "auto";
        }
      });

      cardArea.appendChild(card);
    }

    // Update thumbnail scrollbar (keep existing thumbnail logic)
    scrollBar.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const thumb = document.createElement("img");

      // Handle media URL properly
      let imageUrl = "assets/images/logo.png";
      if (
        listings[i].media &&
        Array.isArray(listings[i].media) &&
        listings[i].media.length > 0
      ) {
        const media = listings[i].media[0];
        if (typeof media === "string" && media.trim() !== "") {
          imageUrl = media;
        } else if (
          typeof media === "object" &&
          media.url &&
          media.url.trim() !== ""
        ) {
          imageUrl = media.url;
        }
      }

      thumb.src = imageUrl;
      thumb.alt = `Thumbnail for ${listings[i].title || "listing"}`;

      // Calculate middle index for highlighting
      const middleIndex = Math.floor(cardsPerView / 2);
      const centerCardIndex = currentIndex + middleIndex;

      // For thumbnails, we can keep object-cover since they're small
      thumb.className = `
        w-8 h-8 rounded-full object-cover border-2 cursor-pointer
        transition-all duration-200 flex-shrink-0
        ${
          i === centerCardIndex
            ? "border-pink-500 ring-2 ring-pink-400 opacity-100 scale-110"
            : "border-gray-300 dark:border-gray-600 opacity-60 hover:opacity-100 hover:scale-105"
        }
      `
        .replace(/\s+/g, " ")
        .trim();

      thumb.addEventListener("error", () => {
        thumb.src = "assets/images/logo.png";
      });

      thumb.addEventListener("click", () => {
        const middleIndex = Math.floor(cardsPerView / 2);
        let targetIndex = i - middleIndex;
        targetIndex = Math.max(0, Math.min(targetIndex, total - cardsPerView));
        currentIndex = targetIndex;
        updateCarousel();
      });

      scrollBar.appendChild(thumb);
    }
  }

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCarousel, 100);
  });

  carouselWrapper.appendChild(carouselContainer);
  carouselWrapper.appendChild(scrollBarContainer);
  container.appendChild(carouselWrapper);

  updateCarousel();
}

// Load and display carousel
async function loadCarousel() {
  if (!listingsCarousel) return;

  try {
    showElement(homeLoading);
    hideElement(homeError);
    hideElement(listingsCarousel);
    hideElement(noListings);

    const listings = await fetchLatestListings(20);

    hideElement(homeLoading);

    if (listings.length === 0) {
      showElement(noListings);
      return;
    }

    renderCarousel(listings);
    showElement(listingsCarousel);
  } catch (error) {
    console.error("Error loading carousel:", error);
    hideElement(homeLoading);
    showElement(homeError);
  }
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Only run on index page
  if (!document.getElementById("main-content")) return;

  renderAuthButtons();
  loadCarousel();

  // Listen for auth state changes
  window.addEventListener("storage", (e) => {
    if (e.key === "token" || e.key === "user") {
      renderAuthButtons();
    }
  });
});

// Export for other modules
export { renderCarousel };
