(function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) o(n);
  new MutationObserver((n) => {
    for (const a of n)
      if (a.type === "childList")
        for (const s of a.addedNodes)
          s.tagName === "LINK" && s.rel === "modulepreload" && o(s);
  }).observe(document, { childList: !0, subtree: !0 });
  function r(n) {
    const a = {};
    return (
      n.integrity && (a.integrity = n.integrity),
      n.referrerPolicy && (a.referrerPolicy = n.referrerPolicy),
      n.crossOrigin === "use-credentials"
        ? (a.credentials = "include")
        : n.crossOrigin === "anonymous"
          ? (a.credentials = "omit")
          : (a.credentials = "same-origin"),
      a
    );
  }
  function o(n) {
    if (n.ep) return;
    n.ep = !0;
    const a = r(n);
    fetch(n.href, a);
  }
})();
const T = "https://v2.api.noroff.dev",
  q = {
    login: `${T}/auth/login`,
    register: `${T}/auth/register`,
    logout: `${T}/auth/logout`,
  },
  de = "https://v2.api.noroff.dev";
async function ce(t) {
  var e, r;
  try {
    console.log("Login URL:", q.login);
    const o = await fetch(q.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
        },
        body: JSON.stringify({ email: t.email, password: t.password }),
      }),
      n = await o.json();
    if ((console.log("Full login response:", n), !o.ok))
      throw o.status === 401
        ? new Error("Invalid email or password")
        : new Error(
            ((r = (e = n.errors) == null ? void 0 : e[0]) == null
              ? void 0
              : r.message) ||
              n.message ||
              "Login failed",
          );
    const a = n.data;
    console.log("Profile data from API:", a);
    const s = {
      name: a.name,
      email: a.email,
      avatar: a.avatar,
      credits: a.credits,
      accessToken: a.accessToken,
    };
    return (
      console.log("Storing user data:", s),
      localStorage.setItem("token", a.accessToken),
      localStorage.setItem("user", JSON.stringify(s)),
      n
    );
  } catch (o) {
    throw (console.error("Login error:", o), o);
  }
}
function ee() {
  (localStorage.removeItem("token"),
    localStorage.removeItem("user"),
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/"
      ? window.location.reload()
      : (window.location.href = "/login.html"));
}
function v() {
  return !!localStorage.getItem("token");
}
function te() {
  const t = localStorage.getItem("user");
  return t ? JSON.parse(t) : null;
}
function re() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}
async function he(t) {
  if (!v()) return null;
  try {
    const e = re(),
      r = await fetch(`${de}/auction/profiles/${t}`, {
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
          Authorization: e.Authorization,
        },
      });
    if (!r.ok) throw new Error("Failed to fetch user profile");
    return (await r.json()).data;
  } catch (e) {
    return (console.error("Error fetching user profile:", e), null);
  }
}
function me(t) {
  try {
    return (new URL(t), !0);
  } catch {
    return !1;
  }
}
function ue(t) {
  return !t || typeof t != "string"
    ? []
    : t
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0)
        .slice(0, 10);
}
async function ge({ title: t, description: e, endsAt: r, media: o, tags: n }) {
  var f, y;
  const a = localStorage.getItem("token");
  if (!a) throw new Error("You must be logged in to create a listing.");
  if (!t || t.trim().length === 0) throw new Error("Title is required");
  if (!e || e.trim().length === 0) throw new Error("Description is required");
  if (!r) throw new Error("End date is required");
  if (new Date(r) <= new Date())
    throw new Error("End date must be in the future");
  let i = [];
  o &&
    o.length > 0 &&
    (i = o
      .filter((m) => m && m.trim())
      .map((m) => {
        const h = m.trim();
        if (!me(h)) throw new Error("Invalid media URL format");
        return { url: h, alt: "" };
      }));
  const d = ue(n),
    u = new Date(r).toISOString(),
    p = {
      title: t.trim(),
      description: e.trim(),
      endsAt: u,
      media: i,
      tags: d,
    };
  (console.log("Sending request body:", p),
    console.log("Token:", a ? "Present" : "Missing"),
    console.log("Authorization header:", `Bearer ${a}`));
  try {
    const m = await fetch("https://v2.api.noroff.dev/auction/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
        Authorization: `Bearer ${a}`,
      },
      body: JSON.stringify(p),
    });
    if (!m.ok) {
      const h = await m.json();
      throw (
        console.error("API Error Response:", h),
        console.error("Response status:", m.status),
        console.error(
          "Response headers:",
          Object.fromEntries(m.headers.entries()),
        ),
        new Error(
          ((y = (f = h.errors) == null ? void 0 : f[0]) == null
            ? void 0
            : y.message) ||
            h.message ||
            "Failed to create listing.",
        )
      );
    }
    return m.json();
  } catch (m) {
    throw m.name === "TypeError" && m.message.includes("fetch")
      ? (console.error("Network error:", m),
        new Error("Network error. Please check your internet connection."))
      : m;
  }
}
class fe {
  constructor() {
    ((this.cache = new Map()),
      (this.cacheTimeout = 300 * 1e3),
      (this.searchTimeout = null),
      (this.isSearching = !1),
      (this.currentSort = "newest"),
      (this.dropdownVisible = !1));
  }
  init() {
    (this.setupSearchListeners(),
      this.setupSortListeners(),
      this.createDropdownContainers(),
      this.setupDocumentClickListener());
  }
  createDropdownContainers() {
    const e = document.getElementById("header-search");
    e && this.createDropdown(e, "header-search-dropdown");
    const r = document.getElementById("mobile-search");
    r && this.createDropdown(r, "mobile-search-dropdown");
  }
  createDropdown(e, r) {
    if (document.getElementById(r)) return;
    const o = document.createElement("div");
    if (((o.id = r), r === "header-search-dropdown")) {
      let n = e.parentElement;
      for (; n && !n.classList.contains("md:flex"); )
        if (((n = n.parentElement), n === document.body)) {
          n = null;
          break;
        }
      n && n.classList.contains("md:flex")
        ? ((o.className =
            "absolute left-0 mt-21 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[60] hidden max-h-80 overflow-y-auto w-80"),
          (n.style.position = "relative"),
          n.appendChild(o))
        : ((o.className =
            "fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[60] hidden max-h-80 overflow-y-auto w-80"),
          document.body.appendChild(o),
          (o._updatePosition = () => {
            const a = e.getBoundingClientRect();
            ((o.style.top = `${a.bottom + 8}px`),
              (o.style.left = `${a.left}px`));
          }));
    } else {
      o.className =
        "absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[60] hidden max-h-80 overflow-y-auto";
      const n = e.parentElement;
      ((n.style.position = "relative"), n.appendChild(o));
    }
  }
  setupDocumentClickListener() {
    document.addEventListener("click", (e) => {
      var n, a;
      const r =
          (n = document.getElementById("header-search")) == null
            ? void 0
            : n.parentElement,
        o =
          (a = document.getElementById("mobile-search")) == null
            ? void 0
            : a.parentElement;
      (r &&
        !r.contains(e.target) &&
        this.hideDropdown("header-search-dropdown"),
        o &&
          !o.contains(e.target) &&
          this.hideDropdown("mobile-search-dropdown"));
    });
  }
  setupSearchListeners() {
    const e = document.getElementById("header-search"),
      r = document.getElementById("mobile-search"),
      o = document.getElementById("clear-search");
    (e && this.setupSearchInput(e, o),
      r && this.setupSearchInput(r, null),
      o &&
        o.addEventListener("click", (n) => {
          (n.preventDefault(), this.clearSearch());
        }));
  }
  setupSortListeners() {
    document.querySelectorAll(".sort-btn").forEach((o) => {
      o.addEventListener("click", (n) => {
        n.preventDefault();
        const a = o.getAttribute("data-sort");
        (this.setSortType(a),
          this.updateSortButtonStyles(o),
          this.applySorting());
      });
    });
    const r = document.getElementById("sort-select");
    r &&
      r.addEventListener("change", (o) => {
        ((this.currentSort = o.target.value), this.applySorting());
      });
  }
  setSortType(e) {
    const r = {
      newest: "newest",
      oldest: "oldest",
      "most-bids": "most-bids",
      "active-auctions": "active-auctions",
    };
    ((this.currentSort = r[e] || e),
      console.log("Sort type set to:", this.currentSort));
  }
  filterActiveAuctions(e) {
    const r = new Date();
    return e.filter((o) => new Date(o.endsAt) > r);
  }
  updateSortButtonStyles(e) {
    (document.querySelectorAll(".sort-btn").forEach((o) => {
      (o.classList.remove("bg-pink-500", "text-white"),
        o.classList.add(
          "bg-gray-200",
          "dark:bg-gray-700",
          "text-gray-700",
          "dark:text-gray-300",
        ));
    }),
      e.classList.remove(
        "bg-gray-200",
        "dark:bg-gray-700",
        "text-gray-700",
        "dark:text-gray-300",
      ),
      e.classList.add("bg-pink-500", "text-white"));
  }
  setupSearchInput(e, r) {
    (e.addEventListener("input", (o) => {
      const n = o.target.value.trim();
      (r &&
        e.id === "header-search" &&
        (n.length > 0
          ? r.classList.remove("hidden")
          : r.classList.add("hidden")),
        this.syncSearchInputs(n, e),
        n.length > 0
          ? (clearTimeout(this.searchTimeout),
            (this.searchTimeout = setTimeout(() => {
              this.performDropdownSearch(n, e);
            }, 300)))
          : (this.hideAllDropdowns(),
            clearTimeout(this.searchTimeout),
            (this.searchTimeout = setTimeout(() => {
              this.performSearch(n);
            }, 300))));
    }),
      e.addEventListener("keydown", (o) => {
        if (o.key === "Enter") {
          o.preventDefault();
          const n = o.target.value.trim();
          n.length > 0
            ? (window.location.href = `/allListings.html?search=${encodeURIComponent(n)}`)
            : (clearTimeout(this.searchTimeout), this.performSearch(n));
        }
      }),
      e.id === "header-search" &&
        e.addEventListener("click", (o) => {
          (o.stopPropagation(), e.matches(":focus") || e.focus());
        }));
  }
  async performDropdownSearch(e, r) {
    try {
      const o = await this.searchAPI(e),
        a = this.sortListings(o, "newest").slice(0, 3);
      this.showDropdown(r, e, a, o.length);
    } catch (o) {
      console.error("Dropdown search error:", o);
    }
  }
  showDropdown(e, r, o, n) {
    const a =
        e.id === "header-search"
          ? "header-search-dropdown"
          : "mobile-search-dropdown",
      s = document.getElementById(a);
    s &&
      (s._updatePosition && s._updatePosition(),
      o.length === 0
        ? (s.innerHTML = `
        <div class="p-4 text-center text-gray-500 dark:text-gray-400">
          No results found for "${r}"
        </div>
      `)
        : (s.innerHTML = `
        <div class="p-2">
          <div class="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 mb-2">
            Showing ${o.length} of ${n} results
          </div>
          ${o.map((l) => this.createDropdownItem(l)).join("")}
          <div class="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
            <button
              onclick="window.location.href='/allListings.html?search=${encodeURIComponent(r)}'"
              class="w-full text-left px-2 py-2 text-sm text-pink-600 dark:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center font-medium"
            >
              View all ${n} results →
            </button>
          </div>
        </div>
      `),
      s.classList.remove("hidden"),
      (this.dropdownVisible = !0));
  }
  createDropdownItem(e) {
    var l;
    const r =
        e.media && e.media.length > 0 && e.media[0].url ? e.media[0].url : null,
      o = new Date(e.endsAt),
      n = new Date(),
      s = o.getTime() - n.getTime() <= 0;
    return `
      <div
        onclick="window.location.href='/item.html?id=${e.id}'"
        class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
      >
        <div class="flex-shrink-0 w-12 h-12 mr-3">
          ${r ? `<img src="${r}" alt="${e.title}" class="w-12 h-12 object-cover rounded" onerror="this.src='https://placehold.co/48x48?text=No+Image'">` : '<div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">No Img</div>'}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            ${e.title}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            ${((l = e._count) == null ? void 0 : l.bids) || 0} bids • ${s ? "Ended" : "Active"}
          </p>
        </div>
      </div>
    `;
  }
  hideDropdown(e) {
    const r = document.getElementById(e);
    (r && r.classList.add("hidden"), (this.dropdownVisible = !1));
  }
  hideAllDropdowns() {
    (this.hideDropdown("header-search-dropdown"),
      this.hideDropdown("mobile-search-dropdown"));
  }
  syncSearchInputs(e, r) {
    const o = document.getElementById("header-search"),
      n = document.getElementById("mobile-search");
    (o && o !== r && o.value !== e && (o.value = e),
      n && n !== r && n.value !== e && (n.value = e));
  }
  async performSearch(e) {
    if (!this.isSearching) {
      ((this.isSearching = !0),
        console.log(
          "Performing search for:",
          e,
          "with sort:",
          this.currentSort,
        ));
      try {
        let r = [];
        (e.trim() === ""
          ? (r = await this.searchAPI(""))
          : (r = await this.searchAPI(e)),
          (r = this.sortListings(r, this.currentSort)),
          console.log("Search completed, results:", r.length),
          this.currentSort === "active-auctions" &&
            r.length === 0 &&
            console.log("No active auctions found"),
          this.dispatchSearchEvent(e, r));
      } catch (r) {
        (console.error("Search error:", r),
          this.dispatchSearchEvent(e, [], r.message));
      } finally {
        this.isSearching = !1;
      }
    }
  }
  async searchAPI(e) {
    const r = "https://v2.api.noroff.dev",
      o = `search_${e.toLowerCase()}`,
      n = this.cache.get(o);
    if (n && Date.now() - n.timestamp < this.cacheTimeout)
      return (console.log("Using cached results for:", e), n.data);
    try {
      const a = {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      };
      if (window.isAuthenticated && window.isAuthenticated()) {
        const u = window.getAuthHeader ? window.getAuthHeader() : {};
        u.Authorization && (a.Authorization = u.Authorization);
      }
      console.log("Making search API request for query:", e);
      const s = await fetch(
        `${r}/auction/listings?_seller=true&_bids=true&limit=100&sort=created&sortOrder=desc`,
        { headers: a },
      );
      if (!s.ok) throw new Error(`API request failed: ${s.status}`);
      const i = (await s.json()).data || [];
      console.log("Search API returned", i.length, "listings");
      const d = this.filterListings(i, e);
      return (
        this.cache.set(o, { data: d, timestamp: Date.now() }),
        console.log("Filtered to", d.length, "results"),
        d
      );
    } catch (a) {
      throw (console.error("API Search error:", a), a);
    }
  }
  filterListings(e, r) {
    if (!r || r.trim().length === 0) return e;
    const n = r
      .toLowerCase()
      .trim()
      .split(" ")
      .filter((a) => a.length > 0);
    return e.filter((a) => {
      var l;
      const s = [
        a.title || "",
        a.description || "",
        ((l = a.seller) == null ? void 0 : l.name) || "",
        ...(a.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      return n.every((i) => s.includes(i));
    });
  }
  sortListings(e, r) {
    let o = [...e];
    switch ((console.log("Sorting", o.length, "listings by:", r), r)) {
      case "newest":
        return o.sort((a, s) => new Date(s.created) - new Date(a.created));
      case "oldest":
        return o.sort((a, s) => new Date(a.created) - new Date(s.created));
      case "active-auctions":
        return this.filterActiveAuctions(o).sort(
          (a, s) => new Date(a.endsAt) - new Date(s.endsAt),
        );
      case "most-bids":
        return o.sort((a, s) => {
          var l, i;
          return (
            (((l = s._count) == null ? void 0 : l.bids) || 0) -
            (((i = a._count) == null ? void 0 : i.bids) || 0)
          );
        });
      case "title-az":
        return o.sort((a, s) => (a.title || "").localeCompare(s.title || ""));
      case "title-za":
        return o.sort((a, s) => (s.title || "").localeCompare(a.title || ""));
      default:
        return (
          console.log("Unknown sort type:", r, "using newest"),
          o.sort((a, s) => new Date(s.created) - new Date(a.created))
        );
    }
  }
  applySorting() {
    const e = document.getElementById("header-search"),
      r = e ? e.value.trim() : "";
    (console.log("Applying sort:", this.currentSort, "to query:", r),
      this.performSearch(r));
  }
  dispatchSearchEvent(e, r, o = null) {
    console.log("Dispatching search event:", {
      query: e,
      resultsCount: r.length,
      error: o,
      sortBy: this.currentSort,
    });
    const n = new CustomEvent("searchPerformed", {
      detail: {
        query: e.trim(),
        results: r,
        error: o,
        timestamp: Date.now(),
        sortBy: this.currentSort,
      },
    });
    window.dispatchEvent(n);
  }
  clearSearch() {
    const e = document.getElementById("header-search"),
      r = document.getElementById("mobile-search"),
      o = document.getElementById("clear-search");
    (console.log("Clearing search"),
      e && (e.value = ""),
      r && (r.value = ""),
      o && o.classList.add("hidden"),
      this.hideAllDropdowns(),
      this.performSearch(""));
  }
  clearCache() {
    this.cache.clear();
  }
}
const U = new fe(),
  pe = "https://v2.api.noroff.dev",
  g = document.getElementById("listings-container"),
  L = document.getElementById("message-container"),
  W = document.getElementById("message-text"),
  C = document.getElementById("loading-spinner");
let oe = [],
  b = [];
function k(t, e = "info") {
  !W ||
    !L ||
    !g ||
    ((W.textContent = t),
    (L.className = `mt-8 text-center ${e === "error" ? "text-red-600" : "text-gray-600 dark:text-gray-300"}`),
    L.classList.remove("hidden"),
    (g.innerHTML = ""));
}
function ye() {
  !C ||
    !L ||
    !g ||
    (C.classList.remove("hidden"),
    L.classList.add("hidden"),
    (g.innerHTML = ""));
}
function ne() {
  C && C.classList.add("hidden");
}
function xe(t) {
  (console.error(t), k(t, "error"));
}
function ae(t) {
  var d;
  const e = new Date(t.endsAt),
    r = new Date(),
    o = e.getTime() - r.getTime();
  let n;
  if (o < 0) n = "Ended";
  else {
    const u = Math.floor(o / 864e5),
      p = Math.floor((o % (1e3 * 60 * 60 * 24)) / (1e3 * 60 * 60)),
      f = Math.floor((o % (1e3 * 60 * 60)) / (1e3 * 60));
    n = `Ends: ${u}d ${p}h ${f}m`;
  }
  const a =
      t.media && t.media.length > 0 && t.media[0].url ? t.media[0].url : null,
    s =
      t.seller && t.seller.avatar && t.seller.avatar.url
        ? t.seller.avatar.url
        : "https://placehold.co/40x40?text=S",
    l = t.seller && t.seller.name ? t.seller.name : "Unknown",
    i = document.createElement("a");
  if (
    ((i.href = `/item.html?id=${t.id}`),
    (i.className =
      "block bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-full flex flex-col cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 border border-gray-100 dark:border-gray-700"),
    (i.style.height = "420px"),
    (i.style.minHeight = "420px"),
    (i.style.maxHeight = "420px"),
    (i.innerHTML = `
    ${
      a
        ? `<div class="w-full flex-shrink-0 bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center" style="height: 192px; min-height: 192px; max-height: 192px;">
            <img src="${a}" alt="${t.title}" class="w-full h-full object-contain listing-image transition-transform duration-300 hover:scale-105" style="max-width: 100%; max-height: 100%;">
           </div>`
        : `<div class="w-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500 text-white text-center font-semibold text-lg italic flex-shrink-0 transition-all duration-300 hover:from-pink-500 hover:to-purple-600" style="height: 192px; min-height: 192px; max-height: 192px;">
            No image on this listing
           </div>`
    }
    <div class="p-4 flex-1 flex flex-col min-h-0" style="height: 228px; min-height: 228px; max-height: 228px;">
      <h2 class="text-lg font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-white transition-colors duration-200 hover:text-pink-600 dark:hover:text-pink-400" style="height: 48px; min-height: 48px; max-height: 48px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${t.title}</h2>
      <p class="text-gray-700 dark:text-gray-300 text-sm mb-3 flex-1 overflow-hidden transition-colors duration-200" style="height: 64px; min-height: 64px; max-height: 64px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${t.description || "No description provided."}</p>
      <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3 flex-shrink-0" style="height: 24px; min-height: 24px; max-height: 24px;">
        <span class="font-medium ${o < 0 ? "text-red-500 dark:text-red-400" : o < 1440 * 60 * 1e3 ? "text-orange-500 dark:text-orange-400" : "text-green-500 dark:text-green-400"} transition-colors duration-200 truncate" style="max-width: 60%;">${n}</span>
        <span class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:bg-pink-100 dark:hover:bg-pink-900 hover:scale-105 flex-shrink-0">Bids: ${((d = t._count) == null ? void 0 : d.bids) || 0}</span>
      </div>
      <div class="flex items-center space-x-2 flex-shrink-0 transition-all duration-200 hover:translate-x-1" style="height: 32px; min-height: 32px; max-height: 32px;">
        <img src="${s}" alt="${l}" class="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 transition-all duration-200 hover:border-pink-400 dark:hover:border-pink-500 hover:shadow-md flex-shrink-0" style="width: 32px; height: 32px; min-width: 32px; min-height: 32px;">
        <span class="text-gray-800 dark:text-gray-200 font-medium truncate transition-colors duration-200 hover:text-pink-600 dark:hover:text-pink-400 min-w-0" style="max-width: calc(100% - 40px);">${l}</span>
      </div>
    </div>
  `),
    a)
  ) {
    const u = i.querySelector(".listing-image");
    u &&
      u.addEventListener("error", function () {
        this.parentElement.outerHTML =
          '<div class="w-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500 text-white text-center font-semibold text-lg italic flex-shrink-0 transition-all duration-300 hover:from-pink-500 hover:to-purple-600" style="height: 192px; min-height: 192px; max-height: 192px;">No image on this listing</div>';
      });
  }
  return i;
}
async function V() {
  var t, e, r, o;
  if (g) {
    ye();
    try {
      const n = v() ? re().Authorization : "",
        a = {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
        };
      (n && (a.Authorization = n),
        console.log("Making API request with headers:", a));
      const s = await fetch(
        `${pe}/auction/listings?_seller=true&_bids=true&limit=100&sort=created&sortOrder=desc`,
        { headers: a },
      );
      if (
        (console.log("API Response status:", s.status),
        console.log(
          "API Response headers:",
          Object.fromEntries(s.headers.entries()),
        ),
        !s.ok)
      ) {
        const d = await s.json();
        throw (
          console.error("API Error:", d),
          new Error(
            ((e = (t = d.errors) == null ? void 0 : t[0]) == null
              ? void 0
              : e.message) || "Failed to fetch listings.",
          )
        );
      }
      const l = await s.json();
      (console.log("Full API Response:", l),
        console.log("Response data structure:", {
          hasData: !!l.data,
          dataLength: ((r = l.data) == null ? void 0 : r.length) || 0,
          firstItem: (o = l.data) == null ? void 0 : o[0],
          meta: l.meta,
        }));
      const i = l.data || [];
      if (i.length === 0) {
        (console.log("No listings returned from API"),
          k("No listings found.", "info"));
        return;
      }
      (console.log("First 3 listings:", i.slice(0, 3)), (oe = i), D(i));
    } catch (n) {
      (console.error("Error fetching listings:", n),
        k(`Error: ${n.message}`, "error"));
    } finally {
      ne();
    }
  }
}
function D(t) {
  if (g) {
    if ((ne(), L && L.classList.add("hidden"), t.length === 0)) {
      k("No listings found.", "info");
      return;
    }
    ((g.innerHTML = ""),
      t.forEach((e) => {
        g.appendChild(ae(e));
      }));
  }
}
function ve(t) {
  const { query: e, results: r, error: o, sortBy: n } = t.detail;
  if (
    (console.log("Search results received on listings page:", {
      query: e,
      results: r.length,
      error: o,
      sortBy: n,
    }),
    o)
  ) {
    xe(`Search error: ${o}`);
    return;
  }
  if (n === "active-auctions" && r.length === 0) {
    e.trim() === ""
      ? k("No active auctions available at the moment.", "info")
      : k(`No active auctions found for "${e}".`, "info");
    return;
  }
  if (r.length === 0) {
    e.trim() === ""
      ? k("No listings available at the moment.", "info")
      : k(`No results found for "${e}".`, "info");
    return;
  }
  e.trim() === "" ? (R(), D(r)) : (D(r), we(e, r.length));
}
function we(t, e) {
  R();
  const r = document.createElement("div");
  ((r.id = "search-indicator"),
    (r.className =
      "mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"),
    (r.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <p class="text-blue-800 dark:text-blue-200 font-medium">
          Search results for "${t}" (${e} ${e === 1 ? "result" : "results"})
        </p>
      </div>
      <button onclick="clearSearchResults()" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm underline">
        Clear search
      </button>
    </div>
  `),
    g && g.parentNode && g.parentNode.insertBefore(r, g));
}
function R() {
  const t = document.getElementById("search-indicator");
  t && t.remove();
}
window.clearSearchResults = function () {
  const t = document.getElementById("header-search"),
    e = document.getElementById("mobile-search");
  (t && (t.value = ""), e && (e.value = ""), R(), D(oe));
  const r = new URL(window.location);
  (r.searchParams.delete("search"), window.history.replaceState({}, "", r));
};
function be() {
  const t = document.getElementById("addListingModal");
  if (!t) return;
  t.classList.remove("hidden");
  const e = new Date(),
    r = new Date(e.getTime() - e.getTimezoneOffset() * 6e4)
      .toISOString()
      .slice(0, 16),
    o = document.getElementById("listingEndDate");
  (o && (o.min = r), Le(), (b = []), z());
}
function M() {
  const t = document.getElementById("addListingModal");
  if (!t) return;
  t.classList.add("hidden");
  const e = document.getElementById("addListingForm");
  e && (e.reset(), (b = []), z());
}
function ke() {
  const t = document.getElementById("addMediaModal"),
    e = document.getElementById("addListingModal");
  (console.log("Opening media modal"),
    console.log("Media modal found:", !!t),
    console.log("Listing modal found:", !!e),
    !(!t || !e) &&
      (e.classList.add("hidden"), t.classList.remove("hidden"), Ee(), Ie()));
}
function K() {
  const t = document.getElementById("addMediaModal"),
    e = document.getElementById("addListingModal");
  !t || !e || (t.classList.add("hidden"), e.classList.remove("hidden"), Se());
}
function Le() {
  const t = document.getElementById("openMediaModalBtn");
  if (t) {
    const e = t.cloneNode(!0);
    (t.parentNode.replaceChild(e, t), e.addEventListener("click", ke));
  }
}
function Ee() {
  const t = document.getElementById("addMoreUrlBtn"),
    e = document.getElementById("backToListingBtn"),
    r = document.getElementById("addMediaForm");
  (t
    ? (t.onclick = function (o) {
        (o.preventDefault(), console.log("Add more media button clicked"));
        const n = document.getElementById("mediaUrlInputs");
        if (!n) {
          console.error("Media container not found");
          return;
        }
        const a = n.querySelectorAll("input").length;
        console.log("Current inputs count:", a);
        const s = document.createElement("input");
        ((s.type = "url"),
          (s.name = "mediaUrl"),
          (s.placeholder = `Image URL ${a + 1}`),
          (s.className =
            "w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"),
          n.appendChild(s),
          console.log("New input added"));
      })
    : console.error("Add more button not found"),
    e &&
      (e.onclick = function (o) {
        (o.preventDefault(), K());
      }),
    r &&
      (r.onsubmit = function (o) {
        (o.preventDefault(), Be(), K());
      }));
}
function Ie() {
  const t = document.getElementById("mediaUrlInputs");
  if (t)
    if (((t.innerHTML = ""), b.length > 0))
      b.forEach((e, r) => {
        const o = document.createElement("input");
        ((o.type = "url"),
          (o.name = "mediaUrl"),
          (o.placeholder = `Image URL ${r + 1}`),
          (o.value = e),
          (o.className =
            "w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"),
          t.appendChild(o));
      });
    else
      for (let e = 1; e <= 2; e++) {
        const r = document.createElement("input");
        ((r.type = "url"),
          (r.name = "mediaUrl"),
          (r.placeholder = `Image URL ${e}`),
          (r.className =
            "w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"),
          t.appendChild(r));
      }
}
function Se() {
  const t = document.getElementById("mediaUrlInputs");
  t &&
    (t.innerHTML = `
      <input
        type="url"
        name="mediaUrl"
        placeholder="Image URL 1"
        class="w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
      />
      <input
        type="url"
        name="mediaUrl"
        placeholder="Image URL 2"
        class="w-full px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
      />
    `);
}
function Be() {
  const t = document.querySelectorAll("input[name='mediaUrl']");
  ((b = Array.from(t)
    .map((e) => e.value.trim())
    .filter((e) => e.length > 0)),
    z());
}
function z() {
  const t = document.getElementById("mediaCount");
  t &&
    (b.length === 0
      ? ((t.textContent = "No media selected"),
        (t.className = "text-gray-600 dark:text-gray-400"))
      : ((t.textContent = `${b.length} media item${b.length > 1 ? "s" : ""} selected`),
        (t.className = "text-green-600 dark:text-green-400")));
}
function G() {
  const t = document.getElementById("addListingBtn");
  t && (v() ? t.classList.remove("hidden") : t.classList.add("hidden"));
}
document.addEventListener("DOMContentLoaded", () => {
  if (!g) return;
  (console.log("Initializing search and sort component..."), U.init(), G());
  const t = document.querySelector('.sort-btn[data-sort="newest"]');
  (t &&
    (t.classList.remove(
      "bg-gray-200",
      "dark:bg-gray-700",
      "text-gray-700",
      "dark:text-gray-300",
    ),
    t.classList.add("bg-pink-500", "text-white")),
    V(),
    window.addEventListener("searchPerformed", ve));
  const r = new URLSearchParams(window.location.search).get("search");
  if (r) {
    const i = document.getElementById("header-search"),
      d = document.getElementById("mobile-search");
    (i &&
      ((i.value = r),
      setTimeout(() => {
        U.performSearch(r);
      }, 500)),
      d && (d.value = r));
  }
  const o = document.getElementById("addListingBtn"),
    n = document.getElementById("addListingModal"),
    a = document.getElementById("closeAddListingModal"),
    s = document.getElementById("cancelAddListingBtn");
  (o && v() && o.addEventListener("click", be),
    a && a.addEventListener("click", M),
    s && s.addEventListener("click", M),
    n &&
      n.addEventListener("click", function (i) {
        i.target === n && M();
      }));
  const l = document.getElementById("addListingForm");
  (l &&
    v() &&
    l.addEventListener("submit", async (i) => {
      i.preventDefault();
      const d = document.getElementById("listingTitle").value.trim(),
        u = document.getElementById("listingDesc").value.trim(),
        p = document.getElementById("listingEndDate").value,
        f = document.getElementById("listingTags")
          ? document.getElementById("listingTags").value.trim()
          : "";
      try {
        (await ge({ title: d, description: u, endsAt: p, media: b, tags: f }),
          M(),
          V());
      } catch (y) {
        alert(y.message || "Failed to create listing.");
      }
    }),
    window.addEventListener("storage", (i) => {
      (i.key === "token" || i.key === "user") && G();
    }));
});
const Me = "https://v2.api.noroff.dev",
  N = document.getElementById("home-auth-buttons"),
  $ = document.getElementById("home-loading"),
  X = document.getElementById("home-error"),
  P = document.getElementById("listings-carousel"),
  J = document.getElementById("no-listings");
function A(t) {
  t && t.classList.remove("hidden");
}
function S(t) {
  t && t.classList.add("hidden");
}
function Y() {
  N &&
    (v()
      ? (N.innerHTML = `
      <div class="text-center">
        <p class="text-black mb-4">Welcome back! Ready to bid on some amazing items?</p>
        <a href="/allListings.html" class="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Browse Auctions
        </a>
      </div>
    `)
      : (N.innerHTML = `
      <div class="flex flex-col sm:flex-row gap-4">
        <a href="/auth/register.html" class="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Register
        </a>
        <a href="/auth/login.html" class="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors border border-purple-600">
          Login
        </a>
      </div>
    `));
}
async function Ae(t = 20) {
  const e = await fetch(
    `${Me}/auction/listings?_seller=true&_bids=true&sort=created&sortOrder=desc&limit=${t}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      },
    },
  );
  if (!e.ok) throw new Error("Failed to fetch listings");
  return (await e.json()).data || [];
}
function Q() {
  return window.innerWidth < 640 || window.innerWidth < 768
    ? 1
    : window.innerWidth < 1024
      ? 2
      : window.innerWidth < 1280
        ? 3
        : 4;
}
function Ce(t) {
  const e = document.querySelector(".carousel-container");
  if (!e) return;
  e.innerHTML = "";
  let r = 0,
    o = Q();
  const n = t.length,
    a = document.createElement("div");
  a.className = "flex flex-col items-center w-full max-w-full overflow-hidden";
  const s = document.createElement("div");
  s.className = "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
  const l = document.createElement("div");
  l.className = "flex items-center justify-between gap-4 w-full";
  const i = document.createElement("button");
  ((i.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
    </svg>
  `),
    (i.className =
      "p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0 transform hover:scale-105 z-10"),
    i.addEventListener("click", () => {
      ((r = Math.max(0, r - 1)), y());
    }));
  const d = document.createElement("button");
  ((d.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
    </svg>
  `),
    (d.className =
      "p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0 transform hover:scale-105 z-10"),
    d.addEventListener("click", () => {
      ((r = Math.min(n - o, r + 1)), y());
    }));
  const u = document.createElement("div");
  ((u.className = "grid gap-4 flex-1 min-w-0 overflow-hidden px-2"),
    l.appendChild(i),
    l.appendChild(u),
    l.appendChild(d),
    s.appendChild(l));
  const p = document.createElement("div");
  p.className = "w-full max-w-4xl mx-auto mt-6 px-4";
  const f = document.createElement("div");
  ((f.className =
    "flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide"),
    p.appendChild(f));
  function y() {
    ((o = Q()),
      (u.style.gridTemplateColumns = `repeat(${o}, 1fr)`),
      (u.innerHTML = ""),
      (i.disabled = r === 0),
      (d.disabled = r >= n - o),
      r === 0
        ? ((i.className = i.className.replace(
            "bg-pink-500 hover:bg-pink-600",
            "bg-gray-400 cursor-not-allowed",
          )),
          (i.className = i.className.replace("hover:scale-105", "")))
        : ((i.className = i.className.replace(
            "bg-gray-400 cursor-not-allowed",
            "bg-pink-500 hover:bg-pink-600",
          )),
          i.className.includes("hover:scale-105") ||
            (i.className += " hover:scale-105")),
      r >= n - o
        ? ((d.className = d.className.replace(
            "bg-pink-500 hover:bg-pink-600",
            "bg-gray-400 cursor-not-allowed",
          )),
          (d.className = d.className.replace("hover:scale-105", "")))
        : ((d.className = d.className.replace(
            "bg-gray-400 cursor-not-allowed",
            "bg-pink-500 hover:bg-pink-600",
          )),
          d.className.includes("hover:scale-105") ||
            (d.className += " hover:scale-105")));
    for (let h = 0; h < Math.min(o, n - r); h++) {
      const w = r + h,
        x = ae(t[w]);
      ((x.style.width = "auto"),
        (x.style.minWidth = "auto"),
        (x.style.maxWidth = "none"),
        x.querySelectorAll("img").forEach((c) => {
          (c.classList.remove("object-cover"),
            c.classList.add("object-contain"),
            !c.style.height &&
              !c.classList.contains("w-full") &&
              ((c.style.height = "auto"), (c.style.maxHeight = "200px")));
        }),
        x
          .querySelectorAll('.aspect-square, .aspect-video, [class*="aspect-"]')
          .forEach((c) => {
            (c.classList.remove("aspect-square", "aspect-video"),
              Array.from(c.classList).forEach((E) => {
                E.startsWith("aspect-") && c.classList.remove(E);
              }),
              c.style.height || (c.style.height = "auto"));
          }),
        u.appendChild(x));
    }
    f.innerHTML = "";
    for (let h = 0; h < n; h++) {
      const w = document.createElement("img");
      let x = "assets/images/logo.png";
      if (t[h].media && Array.isArray(t[h].media) && t[h].media.length > 0) {
        const c = t[h].media[0];
        typeof c == "string" && c.trim() !== ""
          ? (x = c)
          : typeof c == "object" && c.url && c.url.trim() !== "" && (x = c.url);
      }
      ((w.src = x), (w.alt = `Thumbnail for ${t[h].title || "listing"}`));
      const F = Math.floor(o / 2),
        _ = r + F;
      ((w.className = `
        w-8 h-8 rounded-full object-cover border-2 cursor-pointer
        transition-all duration-200 flex-shrink-0
        ${h === _ ? "border-pink-500 ring-2 ring-pink-400 opacity-100 scale-110" : "border-gray-300 dark:border-gray-600 opacity-60 hover:opacity-100 hover:scale-105"}
      `
        .replace(/\s+/g, " ")
        .trim()),
        w.addEventListener("error", () => {
          w.src = "assets/images/logo.png";
        }),
        w.addEventListener("click", () => {
          const c = Math.floor(o / 2);
          let E = h - c;
          ((E = Math.max(0, Math.min(E, n - o))), (r = E), y());
        }),
        f.appendChild(w));
    }
  }
  let m;
  (window.addEventListener("resize", () => {
    (clearTimeout(m), (m = setTimeout(y, 100)));
  }),
    a.appendChild(s),
    a.appendChild(p),
    e.appendChild(a),
    y());
}
async function De() {
  if (P)
    try {
      (A($), S(X), S(P), S(J));
      const t = await Ae(20);
      if ((S($), t.length === 0)) {
        A(J);
        return;
      }
      (Ce(t), A(P));
    } catch (t) {
      (console.error("Error loading carousel:", t), S($), A(X));
    }
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("main-content") &&
    (Y(),
    De(),
    window.addEventListener("storage", (t) => {
      (t.key === "token" || t.key === "user") && Y();
    }));
});
function Te(t) {
  const e = document.documentElement;
  (console.log(`Setting dark mode to: ${t}`),
    t
      ? (e.classList.add("dark"), localStorage.setItem("theme", "dark"))
      : (e.classList.remove("dark"), localStorage.setItem("theme", "light")),
    console.log(`HTML classes after toggle: ${e.className}`));
}
function Ne() {
  console.log("toggleDarkMode called");
  const e = document.documentElement.classList.contains("dark");
  (console.log(`Current dark mode state: ${e}`), Te(!e));
}
function $e() {
  const t = document.documentElement,
    e = localStorage.getItem("theme");
  e === "dark" ||
  (!e && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ? t.classList.add("dark")
    : t.classList.remove("dark");
}
let Pe = null;
async function se() {
  const t = document.querySelectorAll("#user-credits");
  if (t.length)
    if (v()) {
      const e = te();
      if (e)
        try {
          const r = await he(e.name);
          r &&
            typeof r.credits == "number" &&
            ((Pe = r.credits),
            t.forEach((o) => {
              ((o.textContent = `${r.credits} credits`),
                o.classList.remove("hidden"));
            }));
        } catch (r) {
          (console.error("Error updating credits:", r),
            t.forEach((o) => {
              o.classList.add("hidden");
            }));
        }
    } else
      t.forEach((e) => {
        e.classList.add("hidden");
      });
}
function je() {
  const t = v();
  return (
    t && te(),
    `
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
              <a href="/index.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Home</a>
              <a href="/allListings.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Auctions</a>
              ${
                t
                  ? `
                <a href="/profile.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Profile</a>
              `
                  : ""
              }
            </div>
          </div>

          <!-- Right Side Actions (Desktop View) -->
          <div class="hidden md:flex items-center space-x-4">
            <!-- Search Field -->
            <div class="relative">
              <input
                type="text"
                id="header-search"
                placeholder="Search auctions..."
                class="px-4 py-2 pr-10 w-64 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
              >

            </div>
            ${
              t
                ? `
              <div id="user-credits" class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
              Loading...
            </div>
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
            <button id="logout-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
              Logout
            </button>
            `
                : `
              <a href="/login.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Login</a>
              <a href="/register.html" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors text-center">Register</a>
            `
            }
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

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col space-y-3">
            <!-- Mobile Search -->
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
              t
                ? `
              <a href="/profile.html" class="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2">Profile</a>
              <div class="pt-2 border-t border-gray-200 dark:border-gray-600 flex flex-col space-y-3"> <!-- Added flex-col and space-y-3 -->
                <div id="user-credits" class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                  Loading...
                </div>
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
                <button id="logout-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Logout
                </button>
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
  `
  );
}
function Ue() {
  console.log("Setting up header event listeners...");
  const t = document.getElementById("mobile-menu-btn"),
    e = document.getElementById("mobile-menu");
  t && e
    ? (console.log("Setting up mobile menu toggle"),
      t.addEventListener("click", async (s) => {
        (s.preventDefault(),
          s.stopPropagation(),
          console.log("Mobile menu button clicked"),
          e.classList.toggle("hidden"),
          e.classList.contains("hidden") || (await se()));
      }))
    : console.error("Mobile menu elements not found:", {
        mobileMenuBtn: t,
        mobileMenu: e,
      });
  const r = document.getElementById("header-search-btn");
  r &&
    r.addEventListener("click", (s) => {
      s.preventDefault();
      const l = document.getElementById("header-search");
      if (l) {
        const i = l.value.trim();
        i.length > 0 &&
          (window.location.href = `/allListings.html?search=${encodeURIComponent(i)}`);
      }
    });
  const o = document.getElementById("header-search");
  o &&
    o.addEventListener("keypress", (s) => {
      if (s.key === "Enter") {
        s.preventDefault();
        const l = o.value.trim();
        l.length > 0 &&
          (window.location.href = `/allListings.html?search=${encodeURIComponent(l)}`);
      }
    });
  const n = document.getElementById("mobile-search");
  n &&
    n.addEventListener("keypress", (s) => {
      if (s.key === "Enter") {
        s.preventDefault();
        const l = n.value.trim();
        l.length > 0 &&
          (window.location.href = `/allListings.html?search=${encodeURIComponent(l)}`);
      }
    });
  const a = document.getElementById("logout-btn");
  (a &&
    a.addEventListener("click", (s) => {
      (s.preventDefault(), ee());
    }),
    console.log("Initializing search and sort component..."));
  try {
    (U.init(),
      console.log("✅ Search and sort component initialized successfully"));
  } catch (s) {
    console.error("❌ Failed to initialize search and sort component:", s);
  }
}
function O() {
  console.log("Initializing header...");
  const t = document.querySelector("header");
  t
    ? ((t.innerHTML = je()), Ue(), v() && se())
    : console.error("❌ Header element not found in DOM");
}
document.addEventListener("DOMContentLoaded", () => {
  (console.log("DOM Content Loaded - initializing header"), O());
});
window.addEventListener("storage", (t) => {
  (t.key === "accessToken" || t.key === "user") &&
    (console.log("Auth state changed, reinitializing header"), O());
});
function ie(t, e = "#") {
  const r = document.createElement("a");
  return (
    (r.href = e),
    (r.textContent = t),
    (r.className =
      "text-center py-1 px-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-pink-700 transition-all duration-200"),
    r
  );
}
function He() {
  const t = document.createElement("footer");
  ((t.className =
    "bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black border-t border-gray-200 dark:border-gray-700 mt-auto"),
    (t.innerHTML = `
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      <!-- Main Footer Content -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6">

        <!-- Brand Section -->
        <div class="col-span-2 md:col-span-1 flex flex-col items-center md:items-start">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">

            </div>
            <span class="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              Pink Gavel
            </span>
          </div>
        </div>

        <!-- Browse Links -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="text-white dark:text-gray-200 font-medium text-sm mb-3">Browse</h3>
          <div class="space-y-2 flex flex-col items-center md:items-start">
            <a href="/allListings.html" class="text-gray-400 dark:text-gray-500 hover:text-pink-400 transition-colors duration-200 text-sm">
              All Auctions
            </a>
            <a href="/categories.html" class="text-gray-400 dark:text-gray-500 hover:text-pink-400 transition-colors duration-200 text-sm">
              Categories
            </a>
          </div>
        </div>

        <!-- Account Links -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="text-white dark:text-gray-200 font-medium text-sm mb-3">Account</h3>
          <div class="space-y-2 flex flex-col items-center md:items-start">
            <a href="/auth/login.html" class="text-gray-400 dark:text-gray-500 hover:text-pink-400 transition-colors duration-200 text-sm">
              Login
            </a>
            <a href="/auth/register.html" class="text-gray-400 dark:text-gray-500 hover:text-pink-400 transition-colors duration-200 text-sm">
              Register
            </a>
          </div>
        </div>

        <!-- Support Links -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="text-white dark:text-gray-200 font-medium text-sm mb-3">Support</h3>
          <div class="space-y-2 flex flex-col items-center md:items-start">
            <a href="/help.html" class="text-gray-400 dark:text-gray-500 hover:text-pink-400 transition-colors duration-200 text-sm">
              Help
            </a>
            <a href="/contact.html" class="text-gray-400 dark:text-gray-500 hover:text-pink-400 transition-colors duration-200 text-sm">
              Contact
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Copyright -->
      <div class="border-t border-gray-700 dark:border-gray-600 pt-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            &copy; ${new Date().getFullYear()} Pink Gavel Auctions. All rights reserved.
          </p>
          <div class="flex items-center gap-4 text-xs">
            <a href="/privacy.html" class="text-gray-500 dark:text-gray-400 hover:text-pink-400 transition-colors duration-200">
              Privacy
            </a>
            <a href="/terms.html" class="text-gray-500 dark:text-gray-400 hover:text-pink-400 transition-colors duration-200">
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  `),
    document.body.appendChild(t));
}
$e();
window.toggleDarkMode = Ne;
const Re = 1800 * 1e3;
let j = null;
function le() {
  (j && clearTimeout(j),
    v() &&
      (j = setTimeout(() => {
        ee();
      }, Re)));
}
["mousemove", "keydown", "scroll", "click", "touchstart"].forEach((t) => {
  window.addEventListener(t, le, !0);
});
le();
const H = document.getElementById("login-form"),
  I = document.getElementById("login-error");
function B(t, e) {
  I &&
    ((I.innerHTML = ""),
    (I.className =
      t === "success"
        ? "mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-sm"
        : "mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-sm"),
    (I.textContent = e));
}
function Z(t, e) {
  e
    ? ((t.disabled = !0),
      (t.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Logging in...`))
    : ((t.disabled = !1), (t.textContent = "Login"));
}
async function ze(t) {
  if ((t.preventDefault(), !I)) return;
  I.innerHTML = "";
  const e = document.getElementById("email").value.trim(),
    r = document.getElementById("password").value,
    o = H.querySelector('button[type="submit"]');
  if (!e || !r) {
    B("error", "Please fill in all fields");
    return;
  }
  try {
    (Z(o, !0),
      await ce({ email: e, password: r }),
      B("success", "Login successful! Redirecting..."),
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1500));
  } catch (n) {
    (console.error("Login error:", n),
      navigator.onLine
        ? n.message.includes("401") || n.message.includes("credentials")
          ? B("error", "Invalid email or password. Please try again.")
          : B("error", n.message || "Failed to log in. Please try again later.")
        : B("error", "Network error. Please check your internet connection."));
  } finally {
    Z(o, !1);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  if (H) {
    H.addEventListener("submit", ze);
    const e = document.getElementById("email");
    e && e.value === "" && e.focus();
  }
  const t = document.getElementById("home-auth-buttons");
  if (t) {
    const e = ie("Register", "register.html");
    ((e.className =
      "w-full text-center py-2 px-4 rounded-full border-2 border-black text-primary font-semibold bg-transparent hover:bg-primary hover:text-white transition-all duration-200 shadow-md"),
      t.replaceWith(e));
  }
});
function Oe() {
  (console.log("Initializing page..."), O(), He());
  const t = document.querySelector("main");
  t && t.classList.add("pt-10");
  const e = document.getElementById("home-auth-buttons");
  if (e) {
    const r = ie("Register", "register.html");
    (r.setAttribute("aria-label", "Go to registration page"), e.appendChild(r));
  }
}
document.addEventListener("DOMContentLoaded", Oe);
