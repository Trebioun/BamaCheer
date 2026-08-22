document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

// ---------- Load editable content ----------
function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
}

// ---------- Photo carousel (used by the About section) ----------
function initCarousel(images) {
  const carousel = document.getElementById("aboutCarousel");
  const track = document.getElementById("aboutCarouselTrack");
  const dotsWrap = document.getElementById("aboutCarouselDots");
  const prevBtn = document.getElementById("aboutCarouselPrev");
  const nextBtn = document.getElementById("aboutCarouselNext");

  track.innerHTML = images
    .map((src, i) => `<div class="carousel-slide"><img src="${src}" alt="Bama Cheer Xtreme photo ${i + 1}" loading="lazy"></div>`)
    .join("");
  dotsWrap.innerHTML = images
    .map((_, i) => `<button type="button" class="carousel-dot${i === 0 ? " active" : ""}" aria-label="Go to photo ${i + 1}"></button>`)
    .join("");
  carousel.hidden = false;

  const dots = Array.from(dotsWrap.children);
  let active = 0;

  function goTo(index) {
    active = (index + images.length) % images.length;
    track.scrollTo({ left: active * track.clientWidth, behavior: "smooth" });
  }

  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));
  prevBtn.addEventListener("click", () => goTo(active - 1));
  nextBtn.addEventListener("click", () => goTo(active + 1));

  // Keep dots in sync when the user swipes/scrolls the track directly
  let scrollTimeout;
  track.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      dots[active]?.classList.remove("active");
      active = index;
      dots[active]?.classList.add("active");
    }, 100);
  });

  if (images.length > 1) {
    let autoplay = setInterval(() => goTo(active + 1), 5000);
    carousel.addEventListener("mouseenter", () => clearInterval(autoplay));
    carousel.addEventListener("mouseleave", () => {
      autoplay = setInterval(() => goTo(active + 1), 5000);
    });
  } else {
    prevBtn.hidden = true;
    nextBtn.hidden = true;
    dotsWrap.hidden = true;
  }
}

fetch("data/content.json")
  .then((res) => res.json())
  .then((data) => {
    // Text fields marked with data-field="hero.eyebrow" etc.
    document.querySelectorAll("[data-field]").forEach((el) => {
      const path = el.getAttribute("data-field");
      const value = getPath(data, path);
      if (value === null) return;
      el.textContent = value;
    });

    // Hero background image (dark pocket on the right where the copy sits)
    if (data.hero && data.hero.backgroundImage) {
      const hero = document.getElementById("hero");
      hero.style.backgroundImage = `radial-gradient(ellipse 110% 160% at 78% 50%, rgba(23,19,16,0.94) 0%, rgba(23,19,16,0.85) 30%, rgba(23,19,16,0.55) 55%, rgba(23,19,16,0.15) 75%, rgba(23,19,16,0) 90%), url('${data.hero.backgroundImage}')`;
      hero.style.backgroundSize = "cover";
      hero.style.backgroundPosition = "center";
    }

    // About photo carousel
    if (data.about && Array.isArray(data.about.images) && data.about.images.length) {
      initCarousel(data.about.images);
    }

    // Stats
    const statBar = document.getElementById("statBar");
    if (data.stats) {
      statBar.innerHTML = data.stats
        .map(
          (s) => `
        <div class="stat">
          <span class="number">${s.number}</span>
          <span class="label">${s.label}</span>
        </div>`
        )
        .join("");
    }

    // Programs
    const programsGrid = document.getElementById("programsGrid");
    if (data.programs) {
      programsGrid.innerHTML = data.programs
        .map(
          (p) => `
        <div class="program-card">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
        </div>`
        )
        .join("");
    }

    // Testimonials (embedded Facebook posts/videos from parents)
    const testimonialGrid = document.getElementById("testimonialGrid");
    if (data.testimonials) {
      testimonialGrid.innerHTML = data.testimonials
        .map((t) => {
          const pluginClass = t.type === "video" ? "fb-video" : "fb-post";
          return `
        <div class="testimonial-card">
          <div class="${pluginClass}" data-href="${t.url}" data-width="340"></div>
        </div>`;
        })
        .join("");

      // Facebook's SDK auto-parses on load, but our embeds are injected
      // after that fetch resolves, so re-parse explicitly.
      if (window.FB && window.FB.XFBML) {
        window.FB.XFBML.parse(testimonialGrid);
      }
    }

    // Contact info (shared email/hours) + per-location cards
    if (data.contact) {
      const c = data.contact;

      const sharedRows = [];
      if (c.email) sharedRows.push(`<dt>Email</dt><dd><a href="mailto:${c.email}">${c.email}</a></dd>`);
      if (c.hours) sharedRows.push(`<dt>Hours</dt><dd>${c.hours}</dd>`);
      document.getElementById("contactShared").innerHTML = sharedRows.join("");

      const locationsGrid = document.getElementById("locationsGrid");
      if (Array.isArray(c.locations)) {
        locationsGrid.innerHTML = c.locations
          .map(
            (loc) => `
          <div class="location-card">
            <h3>${loc.name}</h3>
            <p class="location-address">${loc.address}</p>
            ${loc.phone ? `<p class="location-phone"><a href="tel:${loc.phone.replace(/[^\d+]/g, "")}">${loc.phone}</a></p>` : ""}
            ${
              loc.mapEmbedSrc
                ? `<div class="map-embed"><iframe src="${loc.mapEmbedSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${loc.name} map"></iframe></div>`
                : ""
            }
          </div>`
          )
          .join("");
      }
    }

    // Social links
    if (data.social) {
      const s = data.social;
      const links = [];
      if (s.instagram) links.push(`<a href="${s.instagram}" target="_blank" rel="noopener">Instagram</a>`);
      if (s.facebook) links.push(`<a href="${s.facebook}" target="_blank" rel="noopener">Facebook</a>`);
      document.getElementById("socialLinks").innerHTML = links.join(" ");
    }
  })
  .catch((err) => {
    console.error("Could not load content.json", err);
  });

// ---------- Contact form (Formspree) ----------
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "Sending...";
  status.className = "form-status";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      status.textContent = "Thanks! We'll be in touch soon.";
      status.className = "form-status success";
      form.reset();
    } else {
      throw new Error("Form submission failed");
    }
  } catch (err) {
    status.textContent = "Something went wrong. Please call or email us directly.";
    status.className = "form-status error";
  }
});
