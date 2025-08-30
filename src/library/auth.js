import { AUTH_ENDPOINTS } from "../services/baseApi.js";
import { config } from "../services/config.js";

const API_BASE = "https://v2.api.noroff.dev";

export async function loginUser(userData) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": config.apiKey, // Fixed: use config.apiKey
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid email or password");
      }
      throw new Error(
        data.errors?.[0]?.message || data.message || "Login failed"
      );
    }

    const profileData = data.data;

    const userToStore = {
      name: profileData.name,
      email: profileData.email,
      avatar: profileData.avatar,
      credits: profileData.credits,
      accessToken: profileData.accessToken,
    };

    localStorage.setItem("token", profileData.accessToken);
    localStorage.setItem("user", JSON.stringify(userToStore));

    return data;
  } catch (error) {
    throw error;
  }
}

export async function registerUser(userData) {
  if (!userData.name || !userData.email || !userData.password) {
    throw new Error("Name, email, and password are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error("Invalid email format");
  }

  if (!userData.email.endsWith("stud.noroff.no")) {
    throw new Error("Email must be a valid stud.noroff.no address");
  }

  if (userData.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  try {
    const response = await fetch(`${AUTH_ENDPOINTS.register}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": config.apiKey, // Fixed: use config.apiKey
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        avatar: userData.avatar || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.errors?.[0]?.message || data.message || "Registration failed"
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/"
  ) {
    window.location.reload();
  } else {
    window.location.href = "/login.html";
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function getCurrentUser() {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}

export function updateUserData(newData) {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...newData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  }
  return null;
}

export function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getUserProfile(name) {
  if (!isAuthenticated()) return null;

  try {
    const authHeader = getAuthHeader();
    const response = await fetch(
      `${API_BASE}/auction/profiles/${name}?_listings=true&_wins=true`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": config.apiKey, // Fixed: use config.apiKey
          Authorization: authHeader.Authorization,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch user profile: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    return null;
  }
}
