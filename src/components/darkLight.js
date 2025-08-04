export function setDarkMode(enabled) {
  const html = document.documentElement;
  console.log(`Setting dark mode to: ${enabled}`); // Debug log
  if (enabled) {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
  console.log(`HTML classes after toggle: ${html.className}`); // Debug log
}

export function toggleDarkMode() {
  console.log("toggleDarkMode called"); // Debug log
  const html = document.documentElement;
  const isDark = html.classList.contains("dark");
  console.log(`Current dark mode state: ${isDark}`); // Debug log
  setDarkMode(!isDark);
}

export function initDarkMode() {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  if (
    savedTheme === "dark" ||
    (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}
