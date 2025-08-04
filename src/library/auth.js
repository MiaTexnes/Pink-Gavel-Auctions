import { AUTH_ENDPOINTS } from "../services/baseApi.js";

export async function loginUser(userData) {
  try {
    console.log("Login URL:", AUTH_ENDPOINTS.login);
    const response = await fetch(AUTH_ENDPOINTS.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    const data = await response.json();
    console.log("Full login response:", data);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid email or password");
      }
      throw new Error(
        data.errors?.[0]?.message || data.message || "Login failed",
      );
    }

    // The Noroff API v2 returns the data in a specific structure
    // Extract from data.data instead of just data
    const profileData = data.data;
    console.log("Profile data from API:", profileData);

    // Store the access token and user data with proper structure
    const userToStore = {
      name: profileData.name,
      email: profileData.email,
      avatar: profileData.avatar,
      credits: profileData.credits,
      accessToken: profileData.accessToken,
    };

    console.log("Storing user data:", userToStore);

    localStorage.setItem("token", profileData.accessToken);
    localStorage.setItem("user", JSON.stringify(userToStore));

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function registerUser(userData) {
  // Validate required fields
  if (!userData.name || !userData.email || !userData.password) {
    throw new Error("Name, email, and password are required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error("Invalid email format");
  }

  // Validate password length
  if (userData.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  try {
    const response = await fetch(`${AUTH_ENDPOINTS.register}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": "781ee7f3-d027-488c-b315-2ef77865caff",
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
        data.errors?.[0]?.message || data.message || "Registration failed",
      );
    }

    return data;
  } catch (error) {
    console.error("Registration error:", error);
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
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
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
