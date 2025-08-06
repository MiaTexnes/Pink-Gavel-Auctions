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
  const creditsElement = document.getElementById("user-credits");
  if (!creditsElement) return;

  if (isAuthenticated()) {
    const currentUser = getCurrentUser();
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.name);
        if (profile && typeof profile.credits === "number") {
          userCredits = profile.credits;
          creditsElement.textContent = `${profile.credits} credits`;
          creditsElement.classList.remove("hidden");
        }
      } catch (error) {
        console.error("Error updating credits:", error);
        creditsElement.classList.add("hidden");
      }
    }
  } else {
    creditsElement.classList.add("hidden");
  }
}

// Export this function so other modules can call it
export async function updateUserCredits() {
  await updateCreditsDisplay();
}

function renderHeader() {
  const authenticated = isAuthenticated();
  const currentUser = authenticated ? getCurrentUser() : null;

  return `
    <nav class="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <a href="/index.html" class="flex items-center space-x-2">
              <img src="/assets/images/logo.png" alt="Pink Gavel Auctions" class="h-8 w-8">
              <span class="text-xl font-bold text-gray-900 dark:text-white">Pink Gavel</span>
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

          <!-- Search Bar (between nav and right actions) -->
          <div class="hidden md:flex items-center">
            <div class="relative group">
              <input
                type="text"
                id="header-search"
                placeholder="Search..."
                class="w-16 h-8 px-2 py-1 pl-8 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
              >
              <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <button
                id="clear-search"
                class="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hidden z-10"
                title="Clear search"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              <!-- Header Search Dropdown -->
              <div id="header-search-dropdown" class="hidden absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <!-- Search results will be populated here -->
              </div>
            </div>
          </div>

          <!-- Right Side Actions -->
          <div class="flex items-center space-x-4">
            <!-- Credits Display (only when logged in) -->
            ${
              authenticated
                ? `
              <div id="user-credits" class="hidden bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                Loading...
              </div>
            `
                : ""
            }

            <!-- Dark Mode Toggle -->
            <button
              onclick="window.toggleDarkMode()"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <!-- Sun icon (visible in dark mode) -->
                <path class="hidden dark:block" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"/>
                <!-- Moon icon (visible in light mode) -->
                <path class="dark:hidden" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
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
            <!-- Mobile Search -->
            <div class="relative mb-3">
              <input
                type="text"
                id="mobile-search"
                placeholder="Search auctions..."
                class="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <!-- Mobile Search Dropdown -->
              <div id="mobile-search-dropdown" class="hidden absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <!-- Search results will be populated here -->
              </div>
            </div>

            <a href="/index.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2">Home</a>
            <a href="/allListings.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2">Auctions</a>
            ${
              authenticated
                ? `
              <a href="/profile.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2">Profile</a>
              <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
                <span class="text-gray-700 dark:text-gray-300 text-sm">Hello, ${currentUser.name}</span>
              </div>
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
