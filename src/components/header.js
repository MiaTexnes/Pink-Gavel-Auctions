import {
  isAuthenticated,
  getCurrentUser,
  logoutUser,
  getUserProfile,
} from "../library/auth.js";
import { searchAndSortComponent } from "./searchAndSort.js";

// Global variable to store current credits
let userCredits = null;

// Function to update credits display
async function updateCreditsDisplay() {
  const creditsElements = document.querySelectorAll("#user-credits"); // Select all instances of #user-credits
  if (!creditsElements.length) return;

  if (isAuthenticated()) {
    const currentUser = getCurrentUser();
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.name);
        if (profile && typeof profile.credits === "number") {
          userCredits = profile.credits;

          // Update all #user-credits elements
          creditsElements.forEach((element) => {
            element.textContent = `${profile.credits} credits`;
            element.classList.remove("hidden");
          });
        }
      } catch (error) {
        console.error("Error updating credits:", error);

        // Hide all #user-credits elements on error
        creditsElements.forEach((element) => {
          element.classList.add("hidden");
        });
      }
    }
  } else {
    // Hide all #user-credits elements if not authenticated
    creditsElements.forEach((element) => {
      element.classList.add("hidden");
    });
  }
}

// Export this function so other modules can call it
export async function updateUserCredits() {
  await updateCreditsDisplay();
}

function renderHeader() {
  const authenticated = isAuthenticated();
  const currentUser = authenticated ? getCurrentUser() : null;

  // Get the current page URL and normalize it
  const currentPath = window.location.pathname.toLowerCase();

  return `
    <nav class="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">

          <!-- Left Side: Logo and Navigation -->
          <div class="flex items-center space-x-6">
            <!-- Logo -->
            <div class="flex items-center space-x-3">
              <a href="/index.html" class="flex items-center space-x-2">
                <img src="/assets/images/logo.png" alt="Logo of a Pink Gavel" class="h-8 w-8">
                <span class="text-xl font-bold text-gray-900 dark:text-white">Pink Gavel Auctions</span>
              </a>
            </div>

            <!-- Navigation Links -->
            <div class="hidden md:flex items-center space-x-6">
              <a href="/index.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors ${
                currentPath.includes("/index.html")
                  ? "font-bold text-pink-600"
                  : ""
              }">Home</a>
              <a href="/listings.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors ${
                currentPath.includes("/listings.html")
                  ? "font-bold text-pink-600"
                  : ""
              }">Auctions</a>
              ${
                authenticated
                  ? `
                <a href="/profile.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors ${
                  currentPath.includes("/profile.html")
                    ? "font-bold text-pink-600"
                    : ""
                }">Profile</a>
              `
                  : ""
              }
            </div>
          </div>

          <!-- Right Side Actions (Desktop View) -->
          <div class="hidden md:flex items-center space-x-4">
            <!-- Search Field -->
            <div class="ml-5 relative">
              <input
                type="text"
                id="header-search"
                placeholder="Search auctions..."
                class="px-4 py-2 pr-10 w-64 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
            </div>
            ${
              authenticated
                ? `
              <div id="user-credits" class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                Loading...
              </div>
              <button id="logout-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                Logout
              </button>
            `
                : `
              <a href="/login.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Login</a>
              <a href="/register.html" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors text-center">Register</a>
            `
            }
            <!-- Dark mode toggle always visible -->
            <button
              onclick="window.toggleDarkMode()"
              class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path class="hidden dark:block" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                <path class="dark:hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>

          <!-- Mobile Menu Button -->
          <div class="flex items-center space-x-4 md:hidden">
            <button id="mobile-menu-btn" class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;
}

function setupEventListeners() {
  console.log("Setting up header event listeners...");

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    console.log("Setting up mobile menu toggle");
    mobileMenuBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Mobile menu button clicked");
      mobileMenu.classList.toggle("hidden");

      // Update credits display when the mobile menu is opened
      if (!mobileMenu.classList.contains("hidden")) {
        await updateCreditsDisplay();
      }
    });
  } else {
    console.error("Mobile menu elements not found:", {
      mobileMenuBtn,
      mobileMenu,
    });
  }

  // Header search button functionality
  const headerSearchBtn = document.getElementById("header-search-btn");
  if (headerSearchBtn) {
    headerSearchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const headerSearch = document.getElementById("header-search");
      if (headerSearch) {
        const query = headerSearch.value.trim();
        if (query.length > 0) {
          window.location.href = `/listings.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // Add Enter key functionality for header search
  const headerSearch = document.getElementById("header-search");
  if (headerSearch) {
    headerSearch.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = headerSearch.value.trim();
        if (query.length > 0) {
          window.location.href = `/listings.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // Add Enter key functionality for mobile search (no button needed)
  const mobileSearch = document.getElementById("mobile-search");
  if (mobileSearch) {
    mobileSearch.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = mobileSearch.value.trim();
        if (query.length > 0) {
          window.location.href = `/listings.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });
  }

  // Initialize search and sort component
  console.log("Initializing search and sort component...");
  try {
    searchAndSortComponent.init();
    console.log("✅ Search and sort component initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize search and sort component:", error);
  }
}

// Initialize header
export function initializeHeader() {
  console.log("Initializing header...");
  const headerElement = document.querySelector("header");
  if (headerElement) {
    headerElement.innerHTML = renderHeader();

    // Setup event listeners immediately after rendering
    setupEventListeners();

    // Update credits display if user is logged in
    if (isAuthenticated()) {
      updateCreditsDisplay();
    }
  } else {
    console.error("❌ Header element not found in DOM");
  }
}

// Auto-initialize when the script loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - initializing header");
  initializeHeader();
});

// Listen for storage changes to update header when login state changes
window.addEventListener("storage", (e) => {
  if (e.key === "accessToken" || e.key === "user") {
    console.log("Auth state changed, reinitializing header");
    initializeHeader();
  }
});
