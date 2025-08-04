import { isAuthenticated, logoutUser } from "../library/auth.js";
import { toggleDarkMode, initDarkMode } from "./darkLight.js";
import { createGradientButton } from "./buttons.js";

// Header configuration
const HEADER_CONFIG = {
  BREAKPOINT: 768, // md breakpoint in Tailwind
  NAV_LINKS: [
    { text: "HOME", href: "/" },
    { text: "PROFILE", href: "/profile.html" },
    { text: "LISTINGS", href: "/allListings.html" },
    { text: "REGISTER", href: "/register.html" },
    { text: "LOGIN", href: "/login.html" },
    // { text: 'LOGOUT', href: '#' } when logged in the login becomes logout
  ],
};

class Header {
  constructor() {
    // Only create one instance
    if (window.headerInstance) {
      return window.headerInstance;
    }
    window.headerInstance = this;

    this.header = document.querySelector("header");
    if (!this.header) {
      throw new Error("Header element not found");
    }

    this.menuButton = null;
    this.mobileMenu = null;
    this.navLinksList = null;
    this.resizeHandler = this.handleResize.bind(this);
    this.clickHandler = this.handleOutsideClick.bind(this);
  }

  createNavigationLink(link) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.text;
    a.className =
      "block w-full text-gray-800 hover:text-primary hover:bg-pink-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-pink-900 px-3 py-2 rounded-lg transition-all duration-200 font-semibold";

    const currentPage = window.location.pathname;
    if (currentPage === link.href) {
      a.classList.add(
        "text-black",
        "dark:text-[#e157b1]",
        "bg-pink-200",
        "dark:bg-pink-900",
      );
    }

    li.appendChild(a);
    return li;
  }

  createLogoutButton(isMobile = false) {
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "LOGOUT";
    logoutBtn.className = isMobile
      ? "block w-full text-center py-2 rounded-full text-primary font-semibold bg-transparent border-none hover:bg-pink-50"
      : "ml-2 px-4 py-2 rounded-full text-primary font-semibold bg-transparent border-none hover:underline";
    logoutBtn.style.cursor = "pointer";
    logoutBtn.addEventListener("click", () => {
      logoutUser();
    });
    return logoutBtn;
  }

  createMobileMenu() {
    this.mobileMenu = document.createElement("div");
    this.mobileMenu.className =
      "hidden md:hidden w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-2 pl-15";
    this.mobileMenu.setAttribute("aria-hidden", "true");

    const mobileMenuList = document.createElement("ul");
    mobileMenuList.className = "py-2";

    const authed = isAuthenticated();
    HEADER_CONFIG.NAV_LINKS.forEach((link) => {
      if (authed && (link.text === "LOGIN" || link.text === "REGISTER")) return;
      if (!authed && link.text === "LOGOUT") return;
      const li = this.createNavigationLink(link);
      li.className = "block w-full";
      mobileMenuList.appendChild(li);
    });
    this.mobileMenu.appendChild(mobileMenuList);

    // Auth button (Login or Logout)
    const authBtnContainer = document.createElement("div");
    authBtnContainer.className = "px-4 py-2";
    if (authed) {
      authBtnContainer.appendChild(this.createLogoutButton(true));
    } else {
      // Login button using createGradientButton
      const loginBtn = createGradientButton("LOGIN", "/login.html");
      loginBtn.className =
        "block w-full text-gray-600 hover:text-primary hover:bg-pink-50 dark:text-gray-300 dark:hover:text-[#e157b1] dark:hover:bg-pink-950/20 px-3 py-2 rounded-lg transition-all duration-200 font-semibold bg-gradient-to-br from-purple-500 to-primary text-white shadow-md mt-2";
      authBtnContainer.appendChild(loginBtn);
    }
    this.mobileMenu.appendChild(authBtnContainer);

    // Dark mode toggle
    const darkModeToggle = document.createElement("button");
    darkModeToggle.id = "mobileDarkModeToggle";
    darkModeToggle.className =
      "block w-full mt-2 p-2 rounded-lg hover:bg-pink-100 dark:hover:bg-gray-800 transition-colors text-center text-gray-700 dark:text-gray-300";
    darkModeToggle.innerHTML = `
      <span class="inline-block align-middle mr-2">🌓</span>
      <span class="align-middle">Toggle Dark Mode</span>
    `;

    // Enhanced event listener with debugging
    darkModeToggle.addEventListener("click", (e) => {
      console.log("📱 Mobile dark mode button clicked!");
      e.preventDefault();
      e.stopPropagation();
      toggleDarkMode();
    });

    this.mobileMenu.appendChild(darkModeToggle);
  }

  createMenuButton() {
    this.menuButton = document.createElement("button");
    this.menuButton.id = "mobile-menu-button";
    this.menuButton.className =
      "block md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-black dark:text-white";
    this.menuButton.setAttribute("aria-label", "Open menu");
    this.menuButton.setAttribute("aria-expanded", "false");

    // Menu icon (using text instead of SVG)
    const menuIcon = document.createElement("span");
    menuIcon.id = "menu-icon";
    menuIcon.className = "text-2xl font-bold";
    menuIcon.textContent = "☰";

    // Close icon (using text instead of SVG)
    const closeIcon = document.createElement("span");
    closeIcon.id = "close-icon";
    closeIcon.className = "text-2xl font-bold hidden";
    closeIcon.textContent = "✕";

    this.menuButton.appendChild(menuIcon);
    this.menuButton.appendChild(closeIcon);

    this.menuButton.addEventListener("click", () => this.toggleMenu());
  }

  toggleMenu() {
    const isOpen = !this.mobileMenu.classList.contains("hidden");
    this.mobileMenu.classList.toggle("hidden");

    const menuIcon = document.getElementById("menu-icon");
    const closeIcon = document.getElementById("close-icon");

    if (menuIcon && closeIcon) {
      menuIcon.classList.toggle("hidden");
      closeIcon.classList.toggle("hidden");
    }

    this.menuButton.setAttribute(
      "aria-label",
      isOpen ? "Open menu" : "Close menu",
    );
    this.menuButton.setAttribute("aria-expanded", !isOpen);
    this.mobileMenu.setAttribute("aria-hidden", isOpen);
  }

  handleResize() {
    const isMobile = window.innerWidth < HEADER_CONFIG.BREAKPOINT;
    if (this.menuButton) {
      this.menuButton.style.display = isMobile ? "block" : "none";
    }
    if (this.mobileMenu) {
      this.mobileMenu.classList.add("hidden");
    }
    if (this.navLinksList) {
      this.navLinksList.style.display = isMobile ? "none" : "flex";
    }
    if (this.menuButton) {
      this.menuButton.setAttribute("aria-expanded", "false");
    }
    if (this.mobileMenu) {
      this.mobileMenu.setAttribute("aria-hidden", "true");
    }
  }

  handleOutsideClick(event) {
    const isMenuOpen = !this.mobileMenu.classList.contains("hidden");
    if (
      isMenuOpen &&
      !this.mobileMenu.contains(event.target) &&
      !this.menuButton.contains(event.target)
    ) {
      this.toggleMenu();
    }
  }

  init() {
    // Initialize dark mode
    initDarkMode();
    // Clear any existing content
    this.header.innerHTML = "";

    const nav = document.createElement("nav");
    nav.className = "container mx-auto px-3 pt-2 pb-1";

    const mainHeaderContent = document.createElement("div");
    mainHeaderContent.className =
      "flex justify-between items-center w-full pl-10";

    // LEFT SECTION: Logo and Brand
    const logoContainer = document.createElement("div");
    logoContainer.className = "flex items-center space-x-2";
    logoContainer.innerHTML = `
      <a href="/" class="flex items-center space-x-2 group ">
        <img src="/assets/images/logo.png" alt="Auction House Logo" class="h-20 w-20">
        <span class="text-xl font-bold text-primary dark:text-primary group-hover:text-primary dark:group-hover:text-[#e157b1]">Pink Gavel Auctions</span>
      </a>
    `;

    // MIDDLE SECTION: Desktop Navigation (HOME, PROFILE, LISTINGS)
    const mainNavLinks = document.createElement("ul");
    mainNavLinks.className = "hidden md:flex items-center space-x-8";
    HEADER_CONFIG.NAV_LINKS.forEach((link) => {
      if (["HOME", "PROFILE", "LISTINGS"].includes(link.text.toUpperCase())) {
        mainNavLinks.appendChild(this.createNavigationLink(link));
      }
    });

    // RIGHT SECTION: Login/Logout, Dark mode toggle, Mobile menu button
    const rightSection = document.createElement("div");
    rightSection.className = "flex items-center space-x-4";

    const authed = isAuthenticated();
    if (authed) {
      rightSection.appendChild(this.createLogoutButton(false));
    } else {
      // Desktop Login button using createGradientButton
      const loginBtn = createGradientButton("LOGIN", "/login.html");
      loginBtn.classList.add("hidden", "md:block");
      rightSection.appendChild(loginBtn);
    }

    // Dark mode toggle (desktop)
    const darkModeToggle = document.createElement("button");
    darkModeToggle.id = "darkModeToggle";
    darkModeToggle.className =
      "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden md:block";
    darkModeToggle.innerHTML = `
      <svg class="w-5 h-5 text-gray-600 dark:text-gray-300 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
      <svg class="w-5 h-5 text-gray-600 dark:text-gray-300 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
      </svg>
    `;

    // Enhanced event listener with debugging
    darkModeToggle.addEventListener("click", (e) => {
      console.log("🖥️ Desktop dark mode button clicked!");
      e.preventDefault();
      e.stopPropagation();
      toggleDarkMode();
    });

    rightSection.appendChild(darkModeToggle);

    // Create mobile menu button (visible on all screen sizes to handle toggle)
    this.createMenuButton();
    rightSection.appendChild(this.menuButton);

    // Create mobile menu
    this.createMobileMenu();

    // Assemble the navigation
    mainHeaderContent.appendChild(logoContainer);
    mainHeaderContent.appendChild(mainNavLinks);
    mainHeaderContent.appendChild(rightSection);

    nav.appendChild(mainHeaderContent);
    nav.appendChild(this.mobileMenu);
    this.header.appendChild(nav);

    // Add event listeners
    window.addEventListener("resize", this.resizeHandler);
    document.addEventListener("click", this.clickHandler);
    this.handleResize();
  }

  destroy() {
    window.removeEventListener("resize", this.resizeHandler);
    document.removeEventListener("click", this.clickHandler);
  }
}

// Export the class
export default Header;

export function createHeader() {
  const header = document.createElement("header");
  header.className = "bg-white shadow-sm";

  const isAuthenticated = localStorage.getItem("token") !== null;
  const user = isAuthenticated
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  header.innerHTML = `
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <a href="/" class="text-xl font-bold text-primary">Pink Gavel</a>

        <nav>
          ${
            isAuthenticated
              ? `
            <div class="flex items-center gap-4">
              <span>Credits: ${user?.credits || 0}</span>
              <span>${user?.name}</span>
              <button onclick="window.logout()" class="text-red-600">Logout</button>
            </div>
          `
              : `
            <div class="flex items-center gap-4">
              <a href="/login.html">Login</a>
              <a href="/register.html" class="bg-primary text-white px-4 py-2 rounded-sm">Register</a>
            </div>
          `
          }
        </nav>
      </div>
    </div>
  `;

  return header;
}

window.logout = function () {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
};
