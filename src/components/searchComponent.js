import { isAuthenticated, getAuthHeader } from "../library/auth.js";

const API_BASE = "https://v2.api.noroff.dev";

/**
 * Search Component - Handles all search functionality
 */
export class SearchComponent {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.searchTimeout = null;
    this.isSearching = false;
  }

  /**
   * Initialize search functionality
   */
  init() {
    this.setupSearchListeners();
  }

  /**
   * Setup search event listeners
   */
  setupSearchListeners() {
    const headerSearch = document.getElementById("header-search");
    const mobileSearch = document.getElementById("mobile-search");
    const clearSearch = document.getElementById("clear-search");

    // Setup desktop search
    if (headerSearch) {
      this.setupSearchInput(headerSearch, clearSearch);
    }

    // Setup mobile search
    if (mobileSearch) {
      this.setupSearchInput(mobileSearch, null);
    }

    // Clear search functionality
    if (clearSearch) {
      clearSearch.addEventListener("click", () => {
        this.clearSearch();
      });
    }
  }

  /**
   * Setup individual search input
   */
  setupSearchInput(searchInput, clearButton) {
    // Real-time search with debouncing
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      // Show/hide clear button for header search
      if (clearButton && searchInput.id === "header-search") {
        if (query.length > 0) {
          clearButton.classList.remove("hidden");
          clearButton.classList.add("opacity-100");
        } else {
          clearButton.classList.add("hidden");
          clearButton.classList.remove("opacity-100");
        }
      }

      // Show/hide clear button for mobile search
      if (searchInput.id === "mobile-search") {
        // You could add a clear button for mobile search too if needed
      }

      // Sync search inputs
      this.syncSearchInputs(query, searchInput);

      // Update placeholder when expanded
      if (searchInput.id === "header-search") {
        if (query.length > 0 || document.activeElement === searchInput) {
          searchInput.placeholder = "Search auctions...";
        } else {
          searchInput.placeholder = "Search...";
        }
      }

      // Debounce search
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });

    // Search on Enter key
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(this.searchTimeout);
        this.performSearch(e.target.value.trim());
      }
    });

    // Focus handling for header search
    if (searchInput.id === "header-search") {
      searchInput.addEventListener("focus", () => {
        searchInput.placeholder = "Search auctions...";
      });

      searchInput.addEventListener("blur", () => {
        if (searchInput.value.trim() === "") {
          searchInput.placeholder = "Search...";
        }
      });
    }

    // Focus handling for mobile search
    if (searchInput.id === "mobile-search") {
      searchInput.addEventListener("focus", () => {
        searchInput.classList.add("ring-2", "ring-pink-500");
      });

      searchInput.addEventListener("blur", () => {
        searchInput.classList.remove("ring-2", "ring-pink-500");
      });
    }
  }

  /**
   * Sync search inputs between desktop and mobile
   */
  syncSearchInputs(query, excludeInput) {
    const headerSearch = document.getElementById("header-search");
    const mobileSearch = document.getElementById("mobile-search");

    if (headerSearch && headerSearch !== excludeInput) {
      headerSearch.value = query;
    }
    if (mobileSearch && mobileSearch !== excludeInput) {
      mobileSearch.value = query;
    }
  }

  /**
   * Perform search operation
   */
  async performSearch(query) {
    if (this.isSearching) return;

    this.isSearching = true;
    this.showSearchLoading();

    try {
      let results = [];

      if (query.length > 0) {
        // Try API search first, fall back to local filtering
        results = await this.searchAPI(query);
      }

      // Dispatch search event for pages to handle
      this.dispatchSearchEvent(query, results);
    } catch (error) {
      console.error("Search error:", error);
      this.dispatchSearchEvent(query, [], error.message);
    } finally {
      this.isSearching = false;
      this.hideSearchLoading();
    }
  }

  /**
   * Search via API
   */
  async searchAPI(query) {
    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);

    // Return cached results if available and not expired
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const token = isAuthenticated() ? getAuthHeader().Authorization : "";
      const headers = {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      };

      if (token) {
        headers["Authorization"] = token;
      }

      // Search using the listings endpoint with query
      const response = await fetch(
        `${API_BASE}/auction/listings?_seller=true&_bids=true&limit=100`,
        { headers },
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const responseData = await response.json();
      const allListings = responseData.data || [];

      // Filter locally for more comprehensive search
      const results = this.filterListings(allListings, query);

      // Cache the results
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
      });

      return results;
    } catch (error) {
      console.error("API Search error:", error);
      throw error;
    }
  }

  /**
   * Filter listings locally by query
   */
  filterListings(listings, query) {
    if (!query || query.trim().length === 0) {
      return listings;
    }

    const searchTerm = query.toLowerCase().trim();
    const words = searchTerm.split(" ").filter((word) => word.length > 0);

    return listings.filter((listing) => {
      const searchableText = [
        listing.title || "",
        listing.description || "",
        listing.seller?.name || "",
        ...(listing.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      // Check if all search words are found in the searchable text
      return words.every((word) => searchableText.includes(word));
    });
  }

  /**
   * Show search loading indicator
   */
  showSearchLoading() {
    const searchInputs = [
      document.getElementById("header-search"),
      document.getElementById("mobile-search"),
    ];

    searchInputs.forEach((input) => {
      if (input) {
        input.classList.add("animate-pulse");
        input.disabled = true;
      }
    });
  }

  /**
   * Hide search loading indicator
   */
  hideSearchLoading() {
    const searchInputs = [
      document.getElementById("header-search"),
      document.getElementById("mobile-search"),
    ];

    searchInputs.forEach((input) => {
      if (input) {
        input.classList.remove("animate-pulse");
        input.disabled = false;
      }
    });
  }

  /**
   * Dispatch search event for pages to handle
   */
  dispatchSearchEvent(query, results, error = null) {
    const searchEvent = new CustomEvent("searchPerformed", {
      detail: {
        query: query.trim(),
        results: results,
        error: error,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(searchEvent);
  }

  /**
   * Clear search
   */
  clearSearch() {
    const headerSearch = document.getElementById("header-search");
    const mobileSearch = document.getElementById("mobile-search");
    const clearButton = document.getElementById("clear-search");

    if (headerSearch) {
      headerSearch.value = "";
      headerSearch.placeholder = "Search...";
    }
    if (mobileSearch) mobileSearch.value = "";
    if (clearButton) {
      clearButton.classList.add("hidden");
      clearButton.classList.remove("opacity-100");
    }

    this.performSearch("");
  }

  /**
   * Get search suggestions
   */
  getSearchSuggestions(listings, query) {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const suggestions = new Set();

    listings.forEach((listing) => {
      // Add title suggestions
      if (listing.title && listing.title.toLowerCase().includes(searchTerm)) {
        suggestions.add(listing.title);
      }

      // Add seller suggestions
      if (
        listing.seller &&
        listing.seller.name &&
        listing.seller.name.toLowerCase().includes(searchTerm)
      ) {
        suggestions.add(listing.seller.name);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }

  /**
   * Clear search cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Create and export singleton instance
export const searchComponent = new SearchComponent();

// Export convenience functions
export const performSearch = (query) => searchComponent.performSearch(query);
export const clearSearch = () => searchComponent.clearSearch();
export const filterListings = (listings, query) =>
  searchComponent.filterListings(listings, query);
