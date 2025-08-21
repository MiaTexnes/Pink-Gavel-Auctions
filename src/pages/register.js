import { registerUser } from "../library/auth.js";
import { createGradientButton } from "../components/buttons.js";

const form = document.getElementById("register-form");
const errorDiv = document.getElementById("register-error");
const successDiv = document.getElementById("register-success");

function showError(message) {
  errorDiv.innerHTML = "";
  errorDiv.className =
    "mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md";
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
  successDiv.classList.add("hidden");
}

function showSuccess(message) {
  successDiv.innerHTML = "";
  successDiv.className =
    "mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-md";
  successDiv.textContent = message;
  successDiv.classList.remove("hidden");
  errorDiv.classList.add("hidden");
}

function toggleLoadingState(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Registering...
    `;
  } else {
    button.disabled = false;
    button.textContent = "Register";
  }
}

// Initialize the form styling
function initializeFormStyling() {
  // Add login button using purple-pink gradient button component
  const loginContainer = document.getElementById("login-button-container");
  if (loginContainer) {
    const loginButton = createGradientButton("Login", "login.html");
    loginContainer.appendChild(loginButton);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorDiv.classList.add("hidden");
  successDiv.classList.add("hidden");

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const avatar = form.avatar.value.trim();
  const submitButton = form.querySelector('button[type="submit"]');

  try {
    toggleLoadingState(submitButton, true);

    const userData = {
      name,
      email,
      password,
      avatar: avatar || undefined,
    };

    await registerUser(userData);

    showSuccess("Registration successful! Redirecting to login...");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    console.error("Registration error:", error);
    showError(error.message || "Registration failed. Please try again.");
  } finally {
    toggleLoadingState(submitButton, false);
  }
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (form) {
    initializeFormStyling();

    const nameField = document.getElementById("name");
    if (nameField && nameField.value === "") {
      nameField.focus();
    }
  }
});
