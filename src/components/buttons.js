// Reusable gradient button component for Pink Gavel Auctions
// Usage: createGradientButton('Button Text', '/some-link.html')

export function createGradientButton(text, href = "#") {
  const btn = document.createElement("a");
  btn.href = href;
  btn.textContent = text;
  btn.className =
    "text-center py-1 px-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold shadow-md";
  return btn;
}
