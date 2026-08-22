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

fetch("data/content.json")
  .then((res) => res.json())
  .then((data) => {
    // Text fields marked with data-field="hero.title" etc.
    document.querySelectorAll("[data-field]").forEach((el) => {
      const path = el.getAttribute("data-field");
      const value = getPath(data, path);
      if (value === null) return;
      // Preserve the <span class="accent"> inside the hero title
      if (path === "hero.title") {
        el.innerHTML = value.replace(
          "Xtreme",
          '<span class="accent">Xtreme</span>'
        );
      } else if (el.tagName === "A") {
        el.textContent = value;
      } else {
        el.textContent = value;
      }
    });

    // Hero background image
    if (data.hero && data.hero.backgroundImage) {
      const hero = document.getElementById("hero");
      hero.style.backgroundImage = `linear-gradient(160deg, rgba(23,19,16,0.85), rgba(122,18,32,0.75)), url('${data.hero.backgroundImage}')`;
      hero.style.backgroundSize = "cover";
      hero.style.backgroundPosition = "center";
    }

    // About photo
    if (data.about && data.about.image) {
      const aboutPhoto = document.getElementById("aboutPhoto");
      aboutPhoto.src = data.about.image;
      aboutPhoto.hidden = false;
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

    // Testimonials
    const testimonialGrid = document.getElementById("testimonialGrid");
    if (data.testimonials) {
      testimonialGrid.innerHTML = data.testimonials
        .map(
          (t) => `
        <div class="testimonial-card">
          <p class="quote">&ldquo;${t.quote}&rdquo;</p>
          <p class="name">${t.name}</p>
        </div>`
        )
        .join("");
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
