/* =========================================================
   main.js - shared by every page
   Features: dark/light mode (localStorage), sticky nav behaviour, back-to-top,
   favourites store (localStorage), welcome name (localStorage), JSON data loader (Fetch API),
   reusable card renderer.
   ========================================================= */
"use strict";

const LT = {
  /* ---------- safe localStorage helpers ---------- */
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ }
  },

  /* ---------- favourites ---------- */
  favourites() { return LT.get("lt_favourites", []); },
  isFav(id) { return LT.favourites().includes(id); },
  toggleFav(id) {
    let favs = LT.favourites();
    favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    LT.set("lt_favourites", favs);
    LT.updateFavBadge();
    document.dispatchEvent(new CustomEvent("favourites-changed"));
    return favs.includes(id);
  },
  updateFavBadge() {
    document.querySelectorAll("[data-fav-count]").forEach(el => { el.textContent = LT.favourites().length; });
  },

  /* ---------- data loader: fetch JSON, fall back to the bundled copy ---------- */
  async loadDestinations() {
    try {
      const res = await fetch("data/destinations.json");
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      if (window.DESTINATIONS_FALLBACK) return window.DESTINATIONS_FALLBACK;
      throw err;
    }
  },

  /* ---------- helpers ---------- */
  esc(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  },

  /* Dynamic destination card (used on Home and Destinations pages) */
  cardHTML(d) {
    const saved = LT.isFav(d.id);
    return `
    <div class="col-12 col-sm-6 col-lg-4">
      <article class="lt-card" aria-labelledby="t-${d.id}">
        <div class="media">
          <img src="${d.image}" alt="${LT.esc(d.alt)}" loading="lazy" width="800" height="600">
          <span class="badge-tag">${LT.esc(d.tag)}</span>
          <button type="button" class="fav-btn ${saved ? "saved" : ""}" data-fav="${d.id}"
                  aria-pressed="${saved}" aria-label="${saved ? "Remove" : "Save"} ${LT.esc(d.name)} ${saved ? "from" : "to"} my saved places">${saved ? "♥" : "♡"}</button>
        </div>
        <div class="body">
          <h3 id="t-${d.id}">${LT.esc(d.name)}</h3>
          <p class="where">${LT.esc(d.region)}</p>
          <p>${LT.esc(d.summary)}</p>
          <div class="actions">
            <button type="button" class="btn btn-brand btn-sm" data-details="${d.id}">View details</button>
            <a class="btn btn-ghost btn-sm" href="contact.html?destination=${encodeURIComponent(d.id)}#booking">Plan a visit</a>
          </div>
        </div>
      </article>
    </div>`;
  }
};

/* ---------- Dark / light mode ---------- */
(function initTheme() {
  const saved = LT.get("lt_theme", null);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));

  function applyTheme(mode) {
    document.documentElement.setAttribute("data-bs-theme", mode);
    document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
      btn.setAttribute("aria-pressed", mode === "dark");
      btn.querySelector(".label").textContent = mode === "dark" ? "Light mode" : "Dark mode";
      btn.querySelector(".ico").textContent = mode === "dark" ? "☀" : "☾";
    });
  }
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    const next = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    LT.set("lt_theme", next);
    applyTheme(next);
  });
  document.addEventListener("DOMContentLoaded", () => applyTheme(document.documentElement.getAttribute("data-bs-theme")));
})();

/* ---------- Interactive navigation + page chrome ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".lt-nav");
  const toTop = document.getElementById("toTop");
  const onScroll = () => {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 10);
    if (toTop) toTop.classList.toggle("show", window.scrollY > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Close the mobile menu after choosing a link
  const menu = document.getElementById("mainMenu");
  if (menu) {
    menu.querySelectorAll("a.nav-link:not(.dropdown-toggle), a.dropdown-item").forEach(a =>
      a.addEventListener("click", () => {
        if (menu.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }));
  }

  // Mark the current page in the nav
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".lt-nav .nav-link[href]").forEach(a => {
    if (a.getAttribute("href") === page) { a.classList.add("active"); a.setAttribute("aria-current", "page"); }
  });

  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
  LT.updateFavBadge();
  LT.showWelcome();
});

/* Greeting from the saved username (localStorage retrieve) */
LT.showWelcome = function () {
  const name = LT.get("lt_username", null);
  document.querySelectorAll("[data-welcome]").forEach(el => {
    el.textContent = name ? "Hello, " + name : "Sign up";
    el.setAttribute("href", name ? "contact.html#account" : "contact.html#account");
  });
};

/* Details modal shared by Home and Destinations */
window.openDetails = function (d) {
  if (!d) return;
  const el = document.getElementById("detailsModal");
  const title = el.querySelector("[data-m-title]"); if (title) title.textContent = d.name;
  const img = el.querySelector("[data-m-img]"); img.src = d.image; img.alt = d.alt;
  el.querySelector("[data-m-cat]").textContent = d.category;
  el.querySelector("[data-m-region]").textContent = d.region;
  el.querySelector("[data-m-summary]").textContent = d.summary;
  el.querySelector("[data-m-best]").textContent = d.bestFor;
  el.querySelector("[data-m-book]").href = "contact.html?destination=" + encodeURIComponent(d.id) + "#booking";
  bootstrap.Modal.getOrCreateInstance(el).show();
};
