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

// Track the section at the top of the viewport. This stays reliable for tall
// sections (such as Certificates) on mobile screens.
const sections = document.querySelectorAll("section[id]");
const header = document.querySelector(".header");

function updateActiveNavLink() {
  const scrollMarker = window.scrollY + (header?.offsetHeight || 0) + 1;
  let currentSection = sections[0];

  sections.forEach((section) => {
    if (section.offsetTop <= scrollMarker) currentSection = section;
  });

  const currentId = currentSection?.getAttribute("id");
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
  });
}

window.addEventListener("scroll", updateActiveNavLink, { passive: true });
window.addEventListener("resize", updateActiveNavLink);
updateActiveNavLink();

if ("IntersectionObserver" in window) {
  const sectionRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Layer-by-layer: add .in-view to scroll sections for reveal animations
          if (entry.target.classList.contains("scroll-section")) {
            entry.target.classList.add("in-view");
          }
        }
      });
    },
    { root: null, threshold: 0.01, rootMargin: "0px 0px -5% 0px" },
  );

  sections.forEach((section) => sectionRevealObserver.observe(section));
} else {
  // Never leave reveal content hidden in browsers without this API.
  sections.forEach((section) => section.classList.add("in-view"));
}

// ===============================
// Interactive Particle-Network Background
// ===============================

(function initParticleBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  let width, height, particles, animationId;
  const mouse = { x: null, y: null, radius: 140 };

  function isDark() {
    return document.body.classList.contains("dark");
  }

  function particleColor() {
    return isDark() ? "196, 255, 61" : "79, 122, 0";
  }
  function lineColor() {
    return isDark() ? "56, 224, 200" : "15, 156, 136";
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(90, Math.floor((width * height) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);
    const pColor = particleColor();
    const lColor = lineColor();

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Gentle pull toward the cursor
      if (mouse.x !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          p.x -= dx * 0.0015;
          p.y -= dy * 0.0015;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pColor}, 0.7)`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          const opacity = (1 - dist / 130) * 0.18;
          ctx.strokeStyle = `rgba(${lColor}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(step);
  }

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });
  window.addEventListener("resize", resize);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animationId = requestAnimationFrame(step);
    }
  });

  resize();
  step();
})();

// ===============================
// Cursor Glow (desktop pointer only)
// ===============================

(function initCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (!glow) return;
  if (window.matchMedia("(hover: none)").matches) return;

  window.addEventListener("mousemove", (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    glow.classList.add("active");
  });
  document.addEventListener("mouseleave", () => glow.classList.remove("active"));
})();

// ===============================
// Magnetic Hover Effect (icons, logo, buttons)
// ===============================

(function initMagnetic() {
  if (window.matchMedia("(hover: none)").matches) return;

  const strength = 0.4;

  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });

  // Slightly weaker pull for small inline icons
  document.querySelectorAll(".magnetic-icon").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${relX * 0.3}px, ${relY * 0.3}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
})();

// ===============================
// Tilt Effect for Cards
// ===============================

(function initTiltCards() {
  if (window.matchMedia("(hover: none)").matches) return;

  document.querySelectorAll(".tilt-card").forEach((card) => {
    const maxTilt = 8;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - py) * maxTilt * 2;

      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

// ===============================
// Logo Scramble Effect on Hover
// ===============================

(function initLogoScramble() {
  const logo = document.getElementById("logo");
  if (!logo) return;

  const original = logo.getAttribute("data-text") || logo.textContent.trim();
  const scrambleChars = "!<>-_\\/[]{}—=+*^?#________";
  let scrambleTimer = null;

  logo.addEventListener("mouseenter", () => {
    let iteration = 0;
    clearInterval(scrambleTimer);

    scrambleTimer = setInterval(() => {
      logo.childNodes[0].nodeValue = original
        .split("")
        .map((letter, index) => {
          if (index < iteration) return original[index];
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        })
        .join("");

      if (iteration >= original.length) {
        clearInterval(scrambleTimer);
        logo.childNodes[0].nodeValue = original;
      }
      iteration += 1 / 2;
    }, 35);
  });

  logo.addEventListener("mouseleave", () => {
    clearInterval(scrambleTimer);
    logo.childNodes[0].nodeValue = original;
  });
})();

// ===============================
// Reveal Timeline Items on Scroll
// ===============================

const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  revealEls.forEach((el) => revealObserver.observe(el));
}

// ===============================
// Hero Stat Counters (count up once in view)
// ===============================

const statNumbers = document.querySelectorAll(".stat-number");

function animateCount(el) {
  const target = parseInt(el.getAttribute("data-target"), 10) || 0;
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(tick);
}

if ("IntersectionObserver" in window && statNumbers.length) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 },
  );

  statNumbers.forEach((el) => statObserver.observe(el));
} else {
  statNumbers.forEach((el) => {
    el.textContent = el.getAttribute("data-target") || "0";
  });
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
    formStatus.textContent =
      "Thanks for your message! I'll get back to you soon.";
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

// Certificate Image Popup (Works for Unlimited Images)

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("certificate-img")) {
    const src = e.target.src;

    const modal = document.createElement("div");
    modal.classList.add("image-modal");

    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <img src="${src}" class="modal-image">
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", () => {
      modal.remove();
    });
  }
});

// Auto stagger animation for unlimited cards
document.querySelectorAll(".scroll-section").forEach((section) => {
  const cards = section.querySelectorAll(".layer-card");
  cards.forEach((card, index) => {
    card.style.setProperty("--card-index", index);
  });
});

// Click to expand card
function toggleCard(card) {
  card.classList.toggle("active");
}

const words = [
  "Software Dev",
  "Full Stack",
  "SQA Engineer",
  "QA Tester",
  "Automation QA",
  "Bug Hunter",
  "Test Engineer",
  "AI Enthusiast",
  "ML Explorer",
  "Problem Solver",
  "Tech Explorer",
  "Web Developer",
  "DevOps Learner",
  "Clean Coder",
  "Debug Mode On",
];

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const el = document.getElementById("changing-text");

let wordIndex = 0;
let iteration = 0;

function decodeText() {
  if (!el) return;

  const currentWord = words[wordIndex];

  const interval = setInterval(() => {
    el.innerText = currentWord
      .split("")
      .map((letter, index) => {
        if (index < iteration) {
          return currentWord[index];
        }
        return letters[Math.floor(Math.random() * letters.length)];
      })
      .join("");

    iteration += 0.5; // smooth speed

    if (iteration >= currentWord.length) {
      clearInterval(interval);

      // Pause before next word
      setTimeout(() => {
        iteration = 0;
        wordIndex = (wordIndex + 1) % words.length;
        decodeText();
      }, 1500);
    }
  }, 30);
}

// Start animation
if (el) {
  decodeText();
}

$(document).ready(function () {
  $(".projects-slides").owlCarousel({
    loop: true,
    margin: 25,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 3500,
    smartSpeed: 800,

    responsive: {
      0: {
        items: 1,
      },

      768: {
        items: 2,
      },

      1200: {
        items: 3,
      },
    },
  });
});


