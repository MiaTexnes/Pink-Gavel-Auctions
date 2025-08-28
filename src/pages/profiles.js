import { isAuthenticated, getAuthHeader } from "../library/auth.js";

const API_BASE = "https://v2.api.noroff.dev";
const profileContainer = document.getElementById("profiles-container");

async function fetchProfiles() {
  if (!isAuthenticated()) {
    profileContainer.innerHTML =
      "<p>You must be logged in to view profiles.</p>";
    return;
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeader(), // Add the Authorization header
    };

    const response = await fetch(`${API_BASE}/auction/profiles`, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch profiles: ${response.statusText}`);
    }
    const profiles = await response.json();
    renderProfiles(profiles);
  } catch (error) {
    console.error(error);
    profileContainer.innerHTML =
      "<p>Failed to load profiles. Please try again later.</p>";
  }
}

function renderProfiles(profiles) {
  profileContainer.innerHTML = ""; // Clear any existing content

  profiles.forEach((profile) => {
    const profileElement = document.createElement("div");
    profileElement.classList.add("profile", "p-4", "border", "rounded", "mb-4");

    profileElement.innerHTML = `
      <img src="${profile.avatar || "https://placehold.co/100x100?text=Avatar"}" alt="${profile.name}'s avatar" class="w-16 h-16 rounded-full mb-2">
      <h2 class="text-lg font-bold">${profile.name}</h2>
      <p>Email: ${profile.email}</p>
      <p>Credits: ${profile.credits}</p>
      <p>Wins: ${profile.wins.length > 0 ? profile.wins.join(", ") : "None"}</p>
      <p>Listings: ${profile._count.listings}</p>
    `;

    profileContainer.appendChild(profileElement);
  });
}

// Fetch and display profiles when the page loads
fetchProfiles();
