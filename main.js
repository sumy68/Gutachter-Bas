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
// Testimonials Slider (Improved)
// ==============================
(function () {
  const slider = document.getElementById("testimonial-slider");
  if (!slider) return;

  let currentIndex = 0;
  const slides = slider.children.length;
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  let autoplayInterval;

  function goTo(index) {
    currentIndex = (index + slides) % slides;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      goTo(currentIndex + 1);
    }, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // Initial autoplay
  startAutoplay();

  // Button controls
  nextBtn?.addEventListener("click", () => {
    stopAutoplay();
    goTo(currentIndex + 1);
    startAutoplay();
  });

  prevBtn?.addEventListener("click", () => {
    stopAutoplay();
    goTo(currentIndex - 1);
    startAutoplay();
  });

  // Pause on hover
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);

  // Touch support
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  });

  slider.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    startAutoplay();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        goTo(currentIndex + 1);
      } else {
        goTo(currentIndex - 1);
      }
    }
  }
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
// Mobile Burger Menu
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
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    panel.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", close);
    });
  }

  // Wait for header to load
  const wait = setInterval(() => {
    if (document.getElementById("burgerBtn")) {
      clearInterval(wait);
      initMenu();
    }
  }, 50);
})();

// ==============================
// Smooth Scroll with offset
// ==============================
(function () {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      
      // Skip if href is just "#"
      if (href === "#") return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        const headerOffset = 96;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
})();

// ==============================
// Intersection Observer for fade-in animations
// ==============================
(function () {
  if (!window.IntersectionObserver) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe service cards
  document.querySelectorAll(".service-card").forEach((card) => {
    observer.observe(card);
  });

  // Observe testimonial cards
  document.querySelectorAll(".testimonial-card").forEach((card) => {
    observer.observe(card);
  });
})();

// ==============================
// Video Loading Optimization
// ==============================
(function () {
  const video = document.getElementById("heroVideo");
  if (!video) return;

  // Add loading indicator
  video.addEventListener("loadstart", () => {
    video.style.opacity = "0.5";
  });

  video.addEventListener("canplay", () => {
    video.style.opacity = "1";
  });

  // Pause video when not in viewport (performance)
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    videoObserver.observe(video);
  }
})();