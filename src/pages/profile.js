import {
  isAuthenticated,
  getCurrentUser,
  logoutUser,
} from "../library/auth.js";
import { createListingCard } from "./listings.js";

const API_BASE = "https://v2.api.noroff.dev";
const profileContainer = document.getElementById("profile-content");

function showMessage(type, message) {
  const msg = document.createElement("div");
  msg.className = `my-4 p-3 rounded-sm text-center ${
    type === "success"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"
  }`;
  msg.textContent = message;
  profileContainer.prepend(msg);
  setTimeout(() => msg.remove(), 4000);
}

function renderProfileView(profile) {
  profileContainer.innerHTML = `
    <div class="flex flex-col items-center mb-6">
      <img src="${
        profile.avatar?.url || "https://placehold.co/150x150?text=Avatar"
      }" alt="Avatar" class="w-32 h-32 rounded-full mb-4 object-cover border-4 border-pink-500">
      <h2 class="text-3xl font-bold mb-2">${profile.name}</h2>
      <p class="text-gray-600 dark:text-gray-300">${profile.email}</p>
    </div>

    <!-- User Bio Section -->
    <div class="mb-6 text-center">
      <h3 class="text-xl font-semibold mb-2">User Bio</h3>
      <p class="text-gray-700 dark:text-gray-300">${
        profile.bio || "No bio provided."
      }</p>
    </div>

    <div class="flex justify-center space-x-4 mb-6">
      <button id="newListingBtn" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">New Listing</button>
      <button id="editProfileBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">Edit Profile</button>
    </div>

    <div class="mb-6">
      <h3 class="text-xl font-semibold mb-2">Wins</h3>
      <ul class="list-disc list-inside bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-xs">
        ${
          profile.wins && profile.wins.length
            ? profile.wins
                .map(
                  (win) =>
                    `<li class="py-1 border-b border-gray-200 dark:border-gray-600 last:border-b-0">${
                      win.title || win.id
                    }</li>`
                )
                .join("")
            : '<li class="text-gray-500 dark:text-gray-400">No wins yet.</li>'
        }
      </ul>
    </div>

    ${
      profile.listings && profile.listings.length > 0
        ? `
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">Your Listings</h3>
        <div id="user-listings-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <!-- Listings will be inserted here by JavaScript -->
        </div>
        ${
          profile.listings.length > 4
            ? `
            <div class="flex justify-center space-x-4 mt-4">
              <button id="viewMoreBtn" class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md">View More</button>
              <button id="viewLessBtn" class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md hidden">View Less</button>
            </div>
            `
            : ""
        }
      </div>
    `
        : `
      <div class="mb-6 text-center text-gray-500 dark:text-gray-400">
        No listings created yet.
      </div>
    `
    }

    <div id="newListingModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 hidden">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button id="closeNewListingModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white">&times;</button>
        <h2 class="text-2xl font-bold mb-4">Create New Listing</h2>
        <form id="newListingForm" class="space-y-4">
          <div>
            <label for="listingTitle" class="block mb-1 font-semibold">Title</label>
            <input type="text" id="listingTitle" name="title" class="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white" required>
          </div>
          <div>
            <label for="listingDesc" class="block mb-1 font-semibold">Description</label>
            <textarea id="listingDesc" name="description" class="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white" rows="3" required></textarea>
          </div>
          <div>
            <label for="listingEndDate" class="block mb-1 font-semibold">End Date</label>
            <input type="datetime-local" id="listingEndDate" name="endsAt" class="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white" required>
          </div>
          <div>
            <label for="listingImage" class="block mb-1 font-semibold">Image URL</label>
            <input type="url" id="listingImage" name="media" class="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white">
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button" id="cancelNewListingBtn" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors">Cancel</button>
            <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Create</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Render the first 4 listings
  if (profile.listings && profile.listings.length > 0) {
    const userListingsContainer = document.getElementById(
      "user-listings-container"
    );
    if (userListingsContainer) {
      const initialListings = profile.listings.slice(0, 4);
      initialListings.forEach((listing) => {
        userListingsContainer.appendChild(createListingCard(listing));
      });

      // Add event listeners for "View More" and "View Less" buttons
      const viewMoreBtn = document.getElementById("viewMoreBtn");
      const viewLessBtn = document.getElementById("viewLessBtn");
      let currentIndex = 4; // Start after the first 4 listings

      if (viewMoreBtn) {
        viewMoreBtn.addEventListener("click", () => {
          const nextListings = profile.listings.slice(
            currentIndex,
            profile.listings.length
          );
          nextListings.forEach((listing) => {
            userListingsContainer.appendChild(createListingCard(listing));
          });
          currentIndex = profile.listings.length;

          // Show "View Less" button and hide "View More" button
          viewMoreBtn.classList.add("hidden");
          viewLessBtn.classList.remove("hidden");
        });
      }

      if (viewLessBtn) {
        viewLessBtn.addEventListener("click", () => {
          // Remove all listings and re-render the first 4
          userListingsContainer.innerHTML = "";
          const initialListings = profile.listings.slice(0, 4);
          initialListings.forEach((listing) => {
            userListingsContainer.appendChild(createListingCard(listing));
          });
          currentIndex = 4;

          // Show "View More" button and hide "View Less" button
          viewMoreBtn.classList.remove("hidden");
          viewLessBtn.classList.add("hidden");
        });
      }
    }
  }

  document
    .getElementById("editProfileBtn")
    .addEventListener("click", () => renderProfileEditForm(profile));

  // Set minimum date for listing end date
  const listingEndDate = document.getElementById("listingEndDate");
  if (listingEndDate) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Set to 1 minute from now
    listingEndDate.min = now.toISOString().slice(0, 16);
  }

  // Modal logic
  const newListingBtn = document.getElementById("newListingBtn");
  const newListingModal = document.getElementById("newListingModal");
  const closeNewListingModal = document.getElementById("closeNewListingModal");
  const cancelNewListingBtn = document.getElementById("cancelNewListingBtn");

  function openNewListingModal() {
    newListingModal.classList.remove("hidden");
  }
  function closeNewListing() {
    newListingModal.classList.add("hidden");
    document.getElementById("newListingForm").reset();
  }
  newListingBtn.addEventListener("click", openNewListingModal);
  closeNewListingModal.addEventListener("click", closeNewListing);
  cancelNewListingBtn.addEventListener("click", closeNewListing);

  document
    .getElementById("newListingForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("listingTitle").value.trim();
      const description = document.getElementById("listingDesc").value.trim();
      const endsAt = document.getElementById("listingEndDate").value;
      const mediaUrl = document.getElementById("listingImage").value.trim();

      // Convert to ISO string
      const endDate = new Date(endsAt).toISOString();

      try {
        await createListing({
          title,
          description,
          endsAt: endDate,
          media: mediaUrl ? [{ url: mediaUrl, alt: title }] : [],
        });
        showMessage("success", "Listing created successfully!");
        closeNewListing();
        // Refresh profile view to show new listing
        const refreshedProfile = await fetchProfile(profile.name);
        renderProfileView(refreshedProfile);
      } catch (err) {
        showMessage("error", err.message || "Failed to create listing.");
      }
    });
}

function renderProfileEditForm(profile) {
  profileContainer.innerHTML = `
    <div class="flex justify-center">
      <form id="profile-form" class="space-y-4 w-full max-w-80">
        <div class="flex flex-col items-center">
          <img id="avatar-preview" src="${
            profile.avatar?.url || "https://placehold.co/150x150?text=Avatar"
          }" alt="Avatar" class="w-32 h-32 rounded-full mb-4 object-cover border-4 border-pink-500">
          <h3 class="text-lg font-semibold mb-2">Change Profile Picture</h3>
          <input type="url" id="avatar" name="avatar" class="w-full border-gray-300 px-3 py-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white" placeholder="Avatar URL" value="${
            profile.avatar?.url || ""
          }">
        </div>

        <!-- User Bio Section -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Update Bio</h3>
          <textarea id="bio" name="bio" class="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white" rows="4" placeholder="Write something about yourself...">${
            profile.bio || ""
          }</textarea>
        </div>

        <div class="flex justify-center space-x-4 mt-6">
          <button type="submit" class="bg-pink-300 hover:bg-pink-200 text-black font-semibold py-2 px-6 rounded-lg transition-colors">Save Changes</button>
          <button type="button" id="cancelEditBtn" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  `;

  // Avatar live preview
  const avatarInput = document.getElementById("avatar");
  const avatarPreview = document.getElementById("avatar-preview");
  avatarInput.addEventListener("input", () => {
    avatarPreview.src =
      avatarInput.value || "https://placehold.co/150x150?text=Avatar";
  });

  // Cancel button
  document
    .getElementById("cancelEditBtn")
    .addEventListener("click", () => renderProfileView(profile));

  // Save handler
  document
    .getElementById("profile-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const avatar = document.getElementById("avatar").value.trim();
      const bio = document.getElementById("bio").value.trim();

      try {
        // Call the updateProfile function
        await updateProfile({ avatar, bio, name: profile.name });

        // Fetch the updated profile and refresh the view
        const refreshedProfile = await fetchProfile(profile.name);
        showMessage("success", "Profile updated successfully!");
        renderProfileView(refreshedProfile);

        // Update localStorage user for header/other components
        const user = getCurrentUser();
        if (user) {
          user.avatar = refreshedProfile.avatar;
          user.bio = refreshedProfile.bio;
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch (err) {
        showMessage("error", err.message || "Failed to update profile.");
      }
    });
}

async function fetchProfile(name) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(
    `${API_BASE}/auction/profiles/${name}?_listings=true&_wins=true`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    if (res.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login.html";
      return;
    }
    const errorData = await res.json();
    throw new Error(errorData.errors?.[0]?.message || "Failed to load profile");
  }

  const responseData = await res.json();
  return responseData.data;
}

async function updateAvatar({ avatar, name }) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE}/auction/profiles/${name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      avatar: {
        url: avatar, // Ensure the avatar URL is sent in the correct format
        alt: "User avatar", // Optional: Add an alt text for the avatar
      },
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.errors?.[0]?.message || "Failed to update avatar"
    );
  }

  const responseData = await res.json();
  return responseData.data;
}

async function createListing({ title, description, endsAt, media }) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE}/auction/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, endsAt, media }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.errors?.[0]?.message || "Failed to create listing"
    );
  }

  const responseData = await res.json();
  return responseData.data;
}

async function updateProfile({ avatar, bio, name }) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const body = {};
  if (avatar) body.avatar = { url: avatar, alt: "User avatar" };
  if (bio) body.bio = bio;

  const res = await fetch(`${API_BASE}/auction/profiles/${name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.errors?.[0]?.message || "Failed to update profile"
    );
  }

  const responseData = await res.json();
  return responseData.data;
}

async function main() {
  console.log("Profile page: Starting main function");

  const token = localStorage.getItem("token");
  console.log("Profile page: Token exists:", !!token);

  if (!isAuthenticated()) {
    console.log("Profile page: User not authenticated");
    if (profileContainer) {
      profileContainer.innerHTML =
        '<div class="text-center text-red-600">You must be logged in to view your profile. <a href="/login.html" class="underline text-blue-500 hover:text-blue-700">Login here</a>.</div>';
    }
    return;
  }

  const user = getCurrentUser();
  console.log("Profile page: Current user data:", user);

  if (!user || !user.name) {
    console.log(
      "Profile page: User data incomplete - user:",
      user,
      "user.name:",
      user?.name
    );
    if (profileContainer) {
      profileContainer.innerHTML =
        '<div class="text-center text-red-600">User data incomplete. Please log in again. <a href="/login.html" class="underline text-blue-500 hover:text-blue-700">Login here</a>.</div>';
    }
    logoutUser(); // Clear invalid state
    return;
  }

  try {
    console.log("Profile page: Fetching profile for user:", user.name);
    const profile = await fetchProfile(user.name);
    console.log("Profile page: Successfully fetched profile:", profile);
    renderProfileView(profile);
  } catch (err) {
    console.error("Profile page: Error fetching profile:", err);
    if (profileContainer) {
      showMessage("error", err.message || "Could not load profile.");
    }
    // Optionally redirect to login if profile cannot be loaded (e.g., token expired)
    if (
      err.message.includes("Failed to load profile") ||
      err.message.includes("No token found")
    ) {
      setTimeout(() => logoutUser(), 2000);
    }
  }
}

// Only run if we're on the profile page
if (profileContainer) {
  main();
}
