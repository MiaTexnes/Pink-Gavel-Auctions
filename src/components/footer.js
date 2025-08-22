export function initializeFooter() {
  const footer = document.createElement("footer");
  footer.className =
    "bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black border-t border-gray-200 dark:border-gray-700 mt-auto";

  footer.innerHTML = `
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
  `;

  document.body.appendChild(footer);
}
