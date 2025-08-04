import {
  isAuthenticated,
  getCurrentUser,
  logoutUser,
  getUserProfile,
} from "../library/auth.js";

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

  const headerHTML = `
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
                <span class="text-gray-700 dark:text-gray-300">Hello, ${currentUser.name}</span>
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
            <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col space-y-3">
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
      </div>
    </nav>
  `;

  return headerHTML;
}

function setupEventListeners() {
  // Logout functionality
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

// Initialize header
export function initializeHeader() {
  const headerElement = document.querySelector("header");
  if (headerElement) {
    headerElement.innerHTML = renderHeader();
    setupEventListeners();

    // Update credits display if user is logged in
    if (isAuthenticated()) {
      updateCreditsDisplay();
    }
  }
}

// Auto-initialize when the script loads
document.addEventListener("DOMContentLoaded", initializeHeader);

// Listen for storage changes to update header when login state changes
window.addEventListener("storage", (e) => {
  if (e.key === "accessToken" || e.key === "user") {
    initializeHeader();
  }
});
