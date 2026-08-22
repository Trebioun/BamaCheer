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

    // Contact info + map
    if (data.contact) {
      const c = data.contact;
      document.getElementById("contactInfo").innerHTML = `
        <dt>Address</dt><dd>${c.address}</dd>
        <dt>Phone</dt><dd><a href="tel:${c.phone.replace(/[^\d+]/g, "")}">${c.phone}</a></dd>
        <dt>Email</dt><dd><a href="mailto:${c.email}">${c.email}</a></dd>
        <dt>Hours</dt><dd>${c.hours}</dd>
      `;
      if (c.mapEmbedSrc) {
        document.getElementById("mapFrame").src = c.mapEmbedSrc;
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
