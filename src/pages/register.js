import { registerUser } from "../library/auth.js";

const form = document.getElementById("register-form");
const errorDiv = document.getElementById("register-error");
const successDiv = document.getElementById("register-success");

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
  successDiv.classList.add("hidden");
}

function showSuccess(message) {
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
