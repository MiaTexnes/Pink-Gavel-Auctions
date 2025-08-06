import { loginUser } from "../library/auth.js";
import { createGradientButton } from "../components/buttons.js";

// DOM elements
const loginForm = document.getElementById("login-form");
const alertContainer = document.getElementById("login-error");

function showAlert(type, message) {
  alertContainer.innerHTML = "";
  alertContainer.className =
    type === "success"
      ? "mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-md"
      : "mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md";
  alertContainer.textContent = message;
}

function toggleLoadingState(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Logging in...
    `;
  } else {
    button.disabled = false;
    button.textContent = "Login";
  }
}

// Initialize the form styling
function initializeFormStyling() {
  // Login button already has the pink-green gradient classes in HTML

  // Add register button using purple-pink gradient button component
  const registerContainer = document.getElementById(
    "register-button-container",
  );
  if (registerContainer) {
    const registerButton = createGradientButton("Register", "register.html");
    registerContainer.appendChild(registerButton);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  alertContainer.innerHTML = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const submitButton = loginForm.querySelector('button[type="submit"]');

  if (!email || !password) {
    showAlert("error", "Please fill in all fields");
    return;
  }

  try {
    toggleLoadingState(submitButton, true);
    const userData = { email, password };
    await loginUser(userData);

    showAlert("success", "Login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1500);
  } catch (error) {
    console.error("Login error:", error);
    if (!navigator.onLine) {
      showAlert(
        "error",
        "Network error. Please check your internet connection.",
      );
    } else if (
      error.message.includes("401") ||
      error.message.includes("credentials")
    ) {
      showAlert("error", "Invalid email or password. Please try again.");
    } else {
      showAlert(
        "error",
        error.message || "Failed to log in. Please try again later.",
      );
    }
  } finally {
    toggleLoadingState(submitButton, false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (loginForm) {
    // Initialize form styling with gradient buttons
    initializeFormStyling();

    loginForm.addEventListener("submit", handleLogin);
    const emailField = document.getElementById("email");
    if (emailField && emailField.value === "") {
      emailField.focus();
    }
  }
});
