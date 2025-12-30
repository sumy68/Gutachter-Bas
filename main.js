// Header/Footer laden
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
  
  // Slider
  (function(){
    let currentIndex = 0;
    const slider = document.getElementById('testimonial-slider');
    const totalSlides = slider.children.length;
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
  
    function goTo(index){
      currentIndex = (index + totalSlides) % totalSlides;
      slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  
    const auto = setInterval(()=>goTo(currentIndex + 1), 4000);
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  
    // Pause on hover for accessibility/usability
    slider.addEventListener('mouseenter', ()=> clearInterval(auto));
  })();
  
  // Respect reduced motion
  (function(){
    const video = document.getElementById('heroVideo');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try { video.pause(); } catch(e) {}
      video.removeAttribute('autoplay');
    }
  })();
  
  // Mobile Burger Menu
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
      }, 320);
    };

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      expanded ? close() : open();
    });

    overlay.addEventListener("click", close);

    // close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // close after clicking a link
    panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  }

  // header wird per fetch geladen → kurz warten bis DOM da ist
  const t = setInterval(() => {
    const btn = document.getElementById("burgerBtn");
    if (btn) {
      clearInterval(t);
      initMenu();
    }
  }, 50);
})();
