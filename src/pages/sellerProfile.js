import { isAuthenticated, getAuthHeader } from "../library/auth.js";
import { createListingCard } from "./listings.js";
import { config } from "../services/config.js";

// Constants
const API_BASE = "https://v2.api.noroff.dev";
const DEFAULT_AVATAR = "https://placehold.co/150x150?text=Avatar";
const ITEMS_PER_PAGE = 4;

// DOM Elements Manager
class DOMElements {
  constructor() {
    this.profileContainer = document.getElementById("profiles-container");
  }

  getProfileContainer() {
    return this.profileContainer;
  }
}

// URL Manager
class URLManager {
  static getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  static getSellerName() {
    return this.getQueryParam("name");
  }
}

// State Manager
class StateManager {
  constructor() {
    this.profile = null;
    this.currentListingsIndex = ITEMS_PER_PAGE;
    this.currentWinsIndex = ITEMS_PER_PAGE;
  }

  setProfile(profile) {
    this.profile = profile;
  }

  getProfile() {
    return this.profile;
  }

  resetListingsIndex() {
    this.currentListingsIndex = ITEMS_PER_PAGE;
  }

  resetWinsIndex() {
    this.currentWinsIndex = ITEMS_PER_PAGE;
  }

  incrementListingsIndex() {
    this.currentListingsIndex += ITEMS_PER_PAGE;
  }

  incrementWinsIndex() {
    this.currentWinsIndex += ITEMS_PER_PAGE;
  }

  getNextListings() {
    if (!this.profile?.listings) return [];
    return this.profile.listings.slice(
      this.currentListingsIndex,
      this.currentListingsIndex + ITEMS_PER_PAGE
    );
  }

  getNextWins() {
    if (!this.profile?.wins) return [];
    return this.profile.wins.slice(
      this.currentWinsIndex,
      this.currentWinsIndex + ITEMS_PER_PAGE
    );
  }

  getInitialListings() {
    if (!this.profile?.listings) return [];
    return this.profile.listings.slice(0, ITEMS_PER_PAGE);
  }

  getInitialWins() {
    if (!this.profile?.wins) return [];
    return this.profile.wins.slice(0, ITEMS_PER_PAGE);
  }

  hasMoreListings() {
    return this.currentListingsIndex < (this.profile?.listings?.length || 0);
  }

  hasMoreWins() {
    return this.currentWinsIndex < (this.profile?.wins?.length || 0);
  }
}

// UI Manager
class UIManager {
  constructor(elements, state) {
    this.elements = elements;
    this.state = state;
  }

  showLoading() {
    const container = this.elements.getProfileContainer();
    if (!container) return;

    container.innerHTML = `
      <div class="loading text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p>Loading seller profile...</p>
      </div>
    `;
  }

  showError(message, type = "error") {
    const container = this.elements.getProfileContainer();
    if (!container) return;

    const bgColor =
      type === "warning"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

    container.innerHTML = `
      <div class="error-message ${bgColor} p-4 rounded-lg text-center max-w-md mx-auto mt-8">
        <p>${message}</p>
        ${
          type === "warning"
            ? this.getBackToHomeButton()
            : ""
        }
      </div>
    `;
  }

  showNoSellerError() {
    const container = this.elements.getProfileContainer();
    if (!container) return;

    container.innerHTML = `
      <div class="error-message bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center max-w-md mx-auto mt-8">
        <h3 class="font-semibold mb-2">No Seller Specified</h3>
        <p>Please select a seller to view their profile.</p>
        ${this.getBackToHomeButton()}
      </div>
    `;
  }

  getBackToHomeButton() {
    return `
      <a href="/" class="mt-2 inline-block bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded transition-colors">
        Back to Home
      </a>
    `;
  }

  showAuthRequired() {
    this.showError("You must be logged in to view profiles.", "warning");
  }

  renderProfile(profile) {
    const container = this.elements.getProfileContainer();
    if (!container) return;

    if (!profile) {
      this.showError("Profile data not available.");
      return;
    }

    container.innerHTML = this.generateProfileHTML(profile);
    this.setupEventListeners();
    this.renderInitialItems();
  }

  generateProfileHTML(profile) {
    return `
      <div class="seller-profile max-w-6xl mx-auto p-6">
        ${this.generateProfileHeader(profile)}
        ${this.generateBioSection(profile)}
        ${this.generateStatsSection(profile)}
        ${this.generateListingsSection(profile)}
        ${this.generateWinsSection(profile)}
      </div>
    `;
  }

  generateProfileHeader(profile) {
    return `
      <div class="flex flex-col items-center mb-6">
        <img src="${profile.avatar?.url || DEFAULT_AVATAR}" 
             alt="Avatar" 
             class="w-32 h-32 rounded-full mb-4 object-cover border-4 border-pink-500">
        <h2 class="text-3xl font-bold mb-2">${profile.name}</h2>
        <p class="text-gray-600 dark:text-gray-300">${profile.email || "Email not available"}</p>
      </div>
    `;
  }

  generateBioSection(profile) {
    return `
      <div class="mb-6 text-center">
        <h3 class="text-xl font-semibold mb-2">Bio</h3>
        <p class="text-gray-700 dark:text-gray-300">${profile.bio || "No bio provided."}</p>
      </div>
    `;
  }

  generateStatsSection(profile) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-100 dark:bg-blue-800 border border-gray-300 p-4 rounded-lg text-center">
          <h4 class="text-lg font-semibold">Total Listings</h4>
          <p class="text-2xl font-bold text-blue-600">${profile.listings?.length || 0}</p>
        </div>
        <div class="bg-purple-100 dark:bg-purple-800 border border-gray-300 p-4 rounded-lg text-center">
          <h4 class="text-lg font-semibold">Wins</h4>
          <p class="text-2xl font-bold text-purple-600">${profile.wins?.length || 0}</p>
        </div>
        <div class="bg-green-100 dark:bg-green-800 border border-gray-300 p-4 rounded-lg text-center">
          <h4 class="text-lg font-semibold">Credits</h4>
          <p class="text-2xl font-bold text-green-600">${profile.credits || 0}</p>
        </div>
      </div>
    `;
  }

  generateListingsSection(profile) {
    return `
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">Listings</h3>
        <div id="seller-listings-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <!-- Listings will be inserted here by JavaScript -->
        </div>
        ${this.generateViewMoreButtons("listings", profile.listings?.length || 0)}
      </div>
    `;
  }

  generateWinsSection(profile) {
    return `
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">Wins</h3>
        <div id="seller-wins-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <!-- Wins will be inserted here by JavaScript -->
        </div>
        ${this.generateViewMoreButtons("wins", profile.wins?.length || 0)}
      </div>
    `;
  }

  generateViewMoreButtons(type, itemCount) {
    if (itemCount <= ITEMS_PER_PAGE) return "";

    const prefix = type === "wins" ? "Wins" : "Listings";
    return `
      <div class="flex justify-center space-x-4 mt-4">
        <button id="viewMore${prefix}Btn" class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md">View More</button>
        <button id="viewLess${prefix}Btn" class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md hidden">View Less</button>
      </div>
    `;
  }

  renderInitialItems() {
    this.renderInitialListings();
    this.renderInitialWins();
  }

  renderInitialListings() {
    const container = document.getElementById("seller-listings-container");
    if (!container) return;

    const listings = this.state.getInitialListings();
    listings.forEach((listing) => {
      container.appendChild(createListingCard(listing));
    });
  }

  renderInitialWins() {
    const container = document.getElementById("seller-wins-container");
    if (!container) return;

    const wins = this.state.getInitialWins();
    wins.forEach((win) => {
      container.appendChild(createListingCard(win));
    });
  }

  setupEventListeners() {
    this.setupListingsEventListeners();
    this.setupWinsEventListeners();
  }

  setupListingsEventListeners() {
    const viewMoreBtn = document.getElementById("viewMoreListingsBtn");
    const viewLessBtn = document.getElementById("viewLessListingsBtn");
    const container = document.getElementById("seller-listings-container");

    if (viewMoreBtn && container) {
      viewMoreBtn.addEventListener("click", () => {
        this.handleViewMoreListings(container, viewMoreBtn, viewLessBtn);
      });
    }

    if (viewLessBtn && container) {
      viewLessBtn.addEventListener("click", () => {
        this.handleViewLessListings(container, viewMoreBtn, viewLessBtn);
      });
    }
  }

  setupWinsEventListeners() {
    const viewMoreBtn = document.getElementById("viewMoreWinsBtn");
    const viewLessBtn = document.getElementById("viewLessWinsBtn");
    const container = document.getElementById("seller-wins-container");

    if (viewMoreBtn && container) {
      viewMoreBtn.addEventListener("click", () => {
        this.handleViewMoreWins(container, viewMoreBtn, viewLessBtn);
      });
    }

    if (viewLessBtn && container) {
      viewLessBtn.addEventListener("click", () => {
        this.handleViewLessWins(container, viewMoreBtn, viewLessBtn);
      });
    }
  }

  handleViewMoreListings(container, viewMoreBtn, viewLessBtn) {
    const nextListings = this.state.getNextListings();
    nextListings.forEach((listing) => {
      container.appendChild(createListingCard(listing));
    });

    this.state.incrementListingsIndex();

    if (!this.state.hasMoreListings()) {
      viewMoreBtn.classList.add("hidden");
    }
    if (viewLessBtn) {
      viewLessBtn.classList.remove("hidden");
    }
  }

  handleViewLessListings(container, viewMoreBtn, viewLessBtn) {
    container.innerHTML = "";
    this.renderInitialListings();
    this.state.resetListingsIndex();

    if (viewMoreBtn) {
      viewMoreBtn.classList.remove("hidden");
    }
    viewLessBtn.classList.add("hidden");
  }

  handleViewMoreWins(container, viewMoreBtn, viewLessBtn) {
    const nextWins = this.state.getNextWins();
    nextWins.forEach((win) => {
      container.appendChild(createListingCard(win));
    });

    this.state.incrementWinsIndex();

    if (!this.state.hasMoreWins()) {
      viewMoreBtn.classList.add("hidden");
    }
    if (viewLessBtn) {
      viewLessBtn.classList.remove("hidden");
    }
  }

  handleViewLessWins(container, viewMoreBtn, viewLessBtn) {
    container.innerHTML = "";
    this.renderInitialWins();
    this.state.resetWinsIndex();

    if (viewMoreBtn) {
      viewMoreBtn.classList.remove("hidden");
    }
    viewLessBtn.classList.add("hidden");
  }
}

// API Service
class APIService {
  static getHeaders() {
    if (!isAuthenticated()) {
      throw new Error("Authentication required");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": config.X_NOROFF_API_KEY,
      Authorization: `Bearer ${token}`,
    };
  }

  static async fetchSellerProfile(name) {
    try {
      const headers = this.getHeaders();
      const response = await fetch(
        `${API_BASE}/auction/profiles/${name}?_listings=true&_wins=true`,
        { headers }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          throw new Error("Authentication expired. Please log in again.");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.errors?.[0]?.message ||
            `Failed to fetch profile: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  }
}

// Main Seller Profile Controller
class SellerProfileController {
  constructor() {
    this.elements = new DOMElements();
    this.state = new StateManager();
    this.ui = new UIManager(this.elements, this.state);
  }

  async init() {
    const container = this.elements.getProfileContainer();
    if (!container) {
      return;
    }

    const sellerName = URLManager.getSellerName();

    if (!sellerName) {
      this.ui.showNoSellerError();
      return;
    }

    if (!isAuthenticated()) {
      this.ui.showAuthRequired();
      return;
    }

    this.ui.showLoading();

    try {
      const profile = await APIService.fetchSellerProfile(sellerName);

      if (profile) {
        this.state.setProfile(profile);
        this.ui.renderProfile(profile);
      } else {
        this.ui.showError("Failed to load seller profile. Please try again later.");
      }
    } catch (error) {
      this.ui.showError(error.message || "An unexpected error occurred.");
    }
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  const sellerProfileController = new SellerProfileController();
  sellerProfileController.init();
});

// Export for testing purposes
export { SellerProfileController, APIService, URLManager };
