import { createListingCard } from "./allListings.js";

const API_BASE = "https://v2.api.noroff.dev";

async function fetchLatestListings(limit = 15) {
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

function getCardsPerView() {
  if (window.innerWidth < 640) return 1; // mobile
  if (window.innerWidth < 768) return 2; // sm
  if (window.innerWidth < 1024) return 3; // md
  return 4; // lg and up
}

export function renderCarousel(listings) {
  const container = document.querySelector(".carousel-container");
  if (!container) return;
  container.innerHTML = "";

  let currentIndex = 0;
  let cardsPerView = getCardsPerView();
  const total = listings.length;

  const carouselWrapper = document.createElement("div");
  carouselWrapper.className = "flex flex-col items-center w-full";

  // Main carousel area: arrows and cards in a row, arrows outside
  const mainArea = document.createElement("div");
  mainArea.className = "w-full flex items-center justify-center gap-2";

  const leftBtn = document.createElement("button");
  leftBtn.innerHTML = "&#8592;";
  leftBtn.className =
    "p-2 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0";
  leftBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + total) % total;
    updateCarousel();
  });

  const rightBtn = document.createElement("button");
  rightBtn.innerHTML = "&#8594;";
  rightBtn.className =
    "p-2 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0";
  rightBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % total;
    updateCarousel();
  });

  const cardArea = document.createElement("div");
  cardArea.className =
    "flex justify-center items-center gap-4 flex-nowrap overflow-x-auto scrollbar-thin w-full";

  mainArea.appendChild(leftBtn);
  mainArea.appendChild(cardArea);
  mainArea.appendChild(rightBtn);

  // Scrollbar (thumbnails)
  const scrollBar = document.createElement("div");
  scrollBar.className =
    "flex justify-center gap-2 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-200";

  function updateCarousel() {
    cardsPerView = getCardsPerView();
    cardArea.innerHTML = "";
    for (let i = 0; i < cardsPerView; i++) {
      const idx = (currentIndex + i) % total;
      cardArea.appendChild(createListingCard(listings[idx]));
    }

    // Scrollbar thumbnails
    scrollBar.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const thumb = document.createElement("img");

      // Better image URL handling with logo fallback
      let imageUrl = "assets/images/logo.png"; // Changed to use your logo

      if (
        listings[i].media &&
        Array.isArray(listings[i].media) &&
        listings[i].media.length > 0
      ) {
        const media = listings[i].media[0];
        // Check if media is a string URL or an object with url property
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

      // Enhanced styling with better spacing
      thumb.className = `
    w-8 h-8 rounded-full object-cover border-2 cursor-pointer
    transition-all duration-200 flex-shrink-0 bg-gray-200 dark:bg-gray-700
    ${
      i === currentIndex
        ? "border-pink-500 ring-2 ring-pink-400 opacity-100"
        : "border-gray-300 dark:border-gray-600 opacity-60 hover:opacity-100"
    }
  `
        .replace(/\s+/g, " ")
        .trim();

      // Add loading and error handling with logo fallback
      thumb.addEventListener("load", () => {
        thumb.classList.remove("bg-gray-200", "dark:bg-gray-700");
      });

      thumb.addEventListener("error", () => {
        console.log(`Failed to load image for listing ${i}:`, imageUrl);
        // Use logo as fallback instead of placeholder
        thumb.src = "assets/images/logo.png";
        thumb.classList.add("bg-gray-200", "dark:bg-gray-700");
      });

      thumb.addEventListener("click", () => {
        currentIndex = i;
        updateCarousel();
      });

      scrollBar.appendChild(thumb);
    }
  }

  carouselWrapper.appendChild(mainArea);
  carouselWrapper.appendChild(scrollBar);
  container.appendChild(carouselWrapper);

  updateCarousel();
}

document.addEventListener("DOMContentLoaded", async () => {
  // Only run on index page
  const carouselContainer = document.querySelector(".carousel-container");
  if (!carouselContainer) return;

  try {
    const listings = await fetchLatestListings(15);
    renderCarousel(listings);
  } catch (err) {
    carouselContainer.innerHTML =
      "<p class='text-red-600'>Failed to load listings.</p>";
  }
});
