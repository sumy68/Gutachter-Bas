// ==============================
// Header & Footer laden
// ==============================
(async function () {
  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");

  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch("/partials/header.html"),
      fetch("/partials/footer.html"),
    ]);

    if (headerRes.ok) headerMount.innerHTML = await headerRes.text();
    if (footerRes.ok) footerMount.innerHTML = await footerRes.text();
  } catch (e) {
    // silent fail
  }
})();

// ==============================
// Testimonials Slider
// ==============================
(function () {
  const slider = document.getElementById("testimonial-slider");
  if (!slider) return;

  let currentIndex = 0;
  const slides = slider.children.length;
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  function goTo(index) {
    currentIndex = (index + slides) % slides;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  const auto = setInterval(() => goTo(currentIndex + 1), 4000);

  nextBtn?.addEventListener("click", () => goTo(currentIndex + 1));
  prevBtn?.addEventListener("click", () => goTo(currentIndex - 1));

  slider.addEventListener("mouseenter", () => clearInterval(auto));
})();

// ==============================
// Respect reduced motion
// ==============================
(function () {
  const video = document.getElementById("heroVideo");
  if (!video) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    try {
      video.pause();
    } catch (e) {}
    video.removeAttribute("autoplay");
  }
})();

// ==============================
// Mobile Burger Menu (☰ → X) via aria-expanded
// ==============================
(function () {
  function initMenu() {
    const btn = document.getElementById("burgerBtn");
    const panel = document.getElementById("mobileMenu");
    const overlay = document.getElementById("menuOverlay");
    if (!btn || !panel || !overlay) return;

    const open = () => {
      btn.setAttribute("aria-expanded", "true");
      overlay.hidden = false;
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add("open"));
      document.body.classList.add("menu-open");
    };

    const close = () => {
      btn.setAttribute("aria-expanded", "false");
      panel.classList.remove("open");
      document.body.classList.remove("menu-open");
      setTimeout(() => {
        panel.hidden = true;
        overlay.hidden = true;
      }, 250);
    };

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      expanded ? close() : open();
    });

    overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
    panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  }

  // warten bis Header per fetch da ist
  const wait = setInterval(() => {
    if (document.getElementById("burgerBtn")) {
      clearInterval(wait);
      initMenu();
    }
  }, 50);
})();
