// ===============================
// Theme (Light / Dark Mode) Logic
// ===============================

// Use localStorage key to remember theme preference
const THEME_KEY = "portfolio-theme";

// Cache some key DOM elements once
const body = document.body;
const themeToggleBtn = document.getElementById("theme-toggle");
const themeToggleIcon = themeToggleBtn?.querySelector("i");
const nav = document.getElementById("nav");
const menuToggleBtn = document.getElementById("menu-toggle");
const navLinks = document.querySelectorAll(".nav-link");
const yearSpan = document.getElementById("year");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

// Helper: apply theme class to body
function applyTheme(theme) {
  const isDark = theme === "dark";
  body.classList.toggle("dark", isDark);

  // Update icon based on current theme
  if (themeToggleIcon) {
    themeToggleIcon.classList.toggle("fa-moon", !isDark);
    themeToggleIcon.classList.toggle("fa-sun", isDark);
  }
}

// Helper: get preferred theme
// - If user has a stored choice, use it
// - Otherwise default to dark for a darker overall look
function getInitialTheme() {
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Default to dark theme when there is no stored preference
  return "dark";
}

// Initialize theme on page load
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

// Allow user to toggle theme manually
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const current = body.classList.contains("dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
  });
}

// ===============================
// Mobile Navigation Toggle
// ===============================

if (menuToggleBtn && nav) {
  menuToggleBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

// Close mobile nav when clicking a link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("open");
  });
});

// ===============================
// Active Navigation on Scroll
// ===============================

// Observe section intersections to highlight matching nav link
const sections = document.querySelectorAll("section[id]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        const link = document.querySelector(`.nav-link[href="#${id}"]`);

        if (!link) return;

        if (entry.isIntersecting) {
          navLinks.forEach((navLink) => navLink.classList.remove("active"));
          link.classList.add("active");
          entry.target.classList.add("visible");
          // Layer-by-layer: add .in-view to scroll sections for reveal animations
          if (entry.target.classList.contains("scroll-section")) {
            entry.target.classList.add("in-view");
          }
        }
      });
    },
    { root: null, threshold: 0.2, rootMargin: "0px 0px -5% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

// ===============================
// Scroll-reveal: layer-by-layer in-view
// ===============================
// When a .scroll-section enters viewport, CSS reveals .scroll-layer elements with staggered delays.
const scrollSections = document.querySelectorAll(".scroll-section");
if ("IntersectionObserver" in window && scrollSections.length) {
  const scrollRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { root: null, threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  scrollSections.forEach((el) => scrollRevealObserver.observe(el));
}

// ===============================
// Contact Form Handling
// ===============================

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    // Basic client-side validation (HTML5 validation already in place)
    if (!name || !email || !message) {
      formStatus.textContent = "Please fill out all fields.";
      formStatus.classList.remove("success");
      formStatus.classList.add("error");
      return;
    }

    // Demo behavior: show success message instead of real backend call
    formStatus.textContent = "Thanks for your message! I'll get back to you soon.";
    formStatus.classList.remove("error");
    formStatus.classList.add("success");

    // Optionally clear the form
    contactForm.reset();

    // Optionally, in a real app you could:
    // - Send data to an API endpoint with fetch()
    // - Or open a mailto: link pre-filled with the message
  });
}

// ===============================
// Misc: Dynamic Year in Footer
// ===============================

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear().toString();
}

