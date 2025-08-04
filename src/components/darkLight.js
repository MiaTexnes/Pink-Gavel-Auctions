export function setDarkMode(enabled) {
  console.log(`🌓 setDarkMode called with: ${enabled}`); // Enhanced debug log
  const html = document.documentElement;

  if (enabled) {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
    console.log("✅ Dark mode enabled, classes:", html.classList.toString());
  } else {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
    console.log("☀️ Light mode enabled, classes:", html.classList.toString());
  }
}

export function toggleDarkMode() {
  console.log("🔄 toggleDarkMode called"); // Enhanced debug log
  const html = document.documentElement;
  const isDark = html.classList.contains("dark");
  console.log(`Current state - isDark: ${isDark}`);

  setDarkMode(!isDark);

  // Force update of button icons after toggle
  updateDarkModeIcons(!isDark);
}

export function updateDarkModeIcons(isDark) {
  console.log(`🎨 Updating icons for dark mode: ${isDark}`);
  const darkModeButtons = document.querySelectorAll(
    "#darkModeToggle, #mobileDarkModeToggle",
  );

  darkModeButtons.forEach((button) => {
    if (button.id === "mobileDarkModeToggle") {
      // Update mobile button text
      button.innerHTML = `
        <span class="inline-block align-middle mr-2">${isDark ? "☀️" : "🌙"}</span>
        <span class="align-middle">${isDark ? "Light Mode" : "Dark Mode"}</span>
      `;
    }
  });
}

export function initDarkMode() {
  console.log("🚀 initDarkMode called");
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  console.log(`Saved theme: ${savedTheme}, Prefers dark: ${prefersDark}`);

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    html.classList.add("dark");
    console.log("🌙 Initial dark mode set");
  } else {
    html.classList.remove("dark");
    console.log("☀️ Initial light mode set");
  }

  // Update icons after initialization
  setTimeout(() => {
    updateDarkModeIcons(html.classList.contains("dark"));
  }, 100);
}
