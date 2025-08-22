import {
  isAuthenticated, // Checks if the user is authenticated
  getCurrentUser, // Retrieves the current user's details
  logoutUser, // Logs out the user
  getUserProfile, // Fetches the user's profile details
} from "../library/auth.js";

import { searchAndSortComponent } from "./searchAndSort.js"; // Handles search and sort functionality

// Global variable to store the user's credits
let userCredits = null;

/**
 * Updates the display of user credits in both desktop and mobile views.
 * Fetches the user's profile to retrieve the current credit balance.
 */
async function updateCreditsDisplay() {
  const creditsElement = document.getElementById("user-credits"); // Desktop credits display
  const mobileCreditsElement = document.getElementById("mobile-user-credits"); // Mobile credits display

  // If neither element exists, exit the function
  if (!creditsElement && !mobileCreditsElement) return;

  // Check if the user is authenticated
  if (isAuthenticated()) {
    const currentUser = getCurrentUser(); // Get the current user's details
    if (currentUser) {
      try {
        // Fetch the user's profile
        const profile = await getUserProfile(currentUser.name);
        if (profile && typeof profile.credits === "number") {
          userCredits = profile.credits; // Update the global credits variable

          // Update desktop credits display
          if (creditsElement) {
            creditsElement.textContent = `${profile.credits} credits`;
            creditsElement.classList.remove("hidden");
          }

          // Update mobile credits display
          if (mobileCreditsElement) {
            mobileCreditsElement.textContent = `${profile.credits} credits`;
            mobileCreditsElement.classList.remove("hidden");
          }
        }
      } catch (error) {
        console.error("Error updating credits:", error);

        // Hide credits display in case of an error
        if (creditsElement) creditsElement.classList.add("hidden");
        if (mobileCreditsElement) mobileCreditsElement.classList.add("hidden");
      }
    }
  } else {
    // Hide credits display if the user is not authenticated
    if (creditsElement) creditsElement.classList.add("hidden");
    if (mobileCreditsElement) mobileCreditsElement.classList.add("hidden");
  }
}

/**
 * Exports a function to allow other modules to trigger the credits update.
 */
export async function updateUserCredits() {
  await updateCreditsDisplay();
}

/**
 * Renders the HTML structure of the header, including navigation links,
 * user actions, and the mobile menu.
 * @returns {string} The HTML string for the header.
 */
function renderHeader() {
  const authenticated = isAuthenticated(); // Check if the user is authenticated
  const currentUser = authenticated ? getCurrentUser() : null; // Get current user details if authenticated

  return `
    <nav class="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div class=" mx-2 px-4">
        <div class="flex justify-between items-center py-4">
          <!-- Left Side: Logo and Navigation -->
          <div class="flex items-center space-x-6">
            <!-- Logo -->
            <div class="flex items-center space-x-3">
              <a href="/index.html" class="flex items-center space-x-2">
                <img src="/assets/images/logo.png" alt="Pink Gavel Auctions" class="h-8 w-8">
                <span class="text-xl font-bold text-gray-900 dark:text-white">Pink Gavel Auctions</span>
              </a>
            </div>

            <!-- Navigation Links -->
            <div class="hidden md:flex items-center space-x-6">
              <a href="/index.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Home</a>
              <a href="/allListings.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Auctions</a>
              ${
                authenticated
                  ? `
                <a href="/profile.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Profile</a>
              `
                  : ""
              }
            </div>
          </div>

          <!-- Right Side Actions -->
          <div class="flex items-center space-x-4">
            <!-- Search Bar with attached button -->
            <div class="hidden md:flex items-center">
              <!-- Search input with attached button -->
              <div class="flex items-center">
                <input
                  type="text"
                  id="header-search"
                  placeholder="Search auctions..."
                  class="px-3 py-2 w-38 text-sm border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                >
                <!-- Search icon button -->
                <button
                  id="header-search-btn"
                  type="button"
                  class="px-3 py-2 dark:bg-gray-600 border border-l-0 dark:border-gray-600 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label="Search"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Credits Display (only when logged in) -->
            ${
              authenticated
                ? `
              <div class="flex items-center space-x-3">
                <span class="text-gray-700 dark:text-gray-300">Hello, ${currentUser.name}</span>
                <div id="user-credits" class="hidden bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                  Loading...
                </div>
              </div>
            `
                : ""
            }

            <!-- Dark Mode Toggle -->
            <button
              onclick="window.toggleDarkMode()"
              class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path class="hidden dark:block" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                <path class="dark:hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <!-- User Actions -->
            ${
              authenticated
                ? `
              <div class="flex items-center space-x-3">
                <span class="hidden sm:block text-gray-700 dark:text-gray-300">Hello, ${currentUser.name}</span>
                <button id="logout-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Logout
                </button>
              </div>
            `
                : `
              <div class="flex items-center space-x-3">
                <a href="/login.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Login</a>
                <a href="/register.html" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors">Register</a>
              </div>
            `
            }

            <!-- Mobile Menu Button -->
            <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col space-y-3">
            <!-- Mobile Search - input only, no button -->
            <div class="relative mb-3">
              <input
                type="text"
                id="mobile-search"
                placeholder="Search auctions..."
                class="px-4 py-2 pr-10 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
            </div>

            <a href="/index.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2">Home</a>
            <a href="/allListings.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2">Auctions</a>
            ${
              authenticated
                ? `
              <a href="/profile.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2">Profile</a>
              <div class="pt-2 border-t border-gray-200 dark:border-gray-600 flex items-center space-x-2">
                <span class="text-gray-700 dark:text-gray-300 text-sm">Hello, ${currentUser.name}</span>
                <div id="mobile-user-credits" class="hidden bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                  Loading...
                </div>
              </div>
              <button id="logout-btn-mobile" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                Logout
              </button>
            `
                : `
              <div class="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <a href="/login.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2">Login</a>
                <a href="/register.html" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors text-center">Register</a>
              </div>
            `
            }
          </div>
        </div>
      </div>
    </nav>
  `;
}

/**
 * Sets up event listeners for various header elements, such as the mobile menu toggle,
 * search functionality, and logout buttons.
 */
function setupEventListeners() {
  console.log("Setting up header event listeners...");

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    console.log("Setting up mobile menu toggle");
    mobileMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Mobile menu button clicked");
      mobileMenu.classList.toggle("hidden");
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
          window.location.href = `/allListings.html?search=${encodeURIComponent(query)}`;
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
          window.location.href = `/allListings.html?search=${encodeURIComponent(query)}`;
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
          window.location.href = `/allListings.html?search=${encodeURIComponent(query)}`;
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

  // Logout functionality for mobile button
  const logoutBtnMobile = document.getElementById("logout-btn-mobile");
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });
  }
}

/**
 * Initializes the header by rendering its HTML, setting up event listeners,
 * and initializing the search and sort component.
 */
export function initializeHeader() {
  console.log("Initializing header...");
  const headerElement = document.querySelector("header");
  if (headerElement) {
    headerElement.innerHTML = renderHeader();
    setupEventListeners();
    updateCreditsDisplay(); // Ensure credits are updated on header initialization

    // Initialize the search and sort component
    try {
      searchAndSortComponent.init();
      console.log("✅ Search and sort component initialized successfully");
    } catch (error) {
      console.error(
        "❌ Failed to initialize search and sort component:",
        error,
      );
    }

    console.log("Header initialized successfully");
  } else {
    console.error("Header element not found");
  }
}

// Call initializeHeader on script load
initializeHeader();
