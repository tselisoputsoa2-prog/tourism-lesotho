/* gallery.js - filterable image gallery with lightbox (preview, next/previous, thumbnails, keyboard) */
"use strict";
(function () {
  let all = [], shown = [], index = 0;
  const grid = document.getElementById("galleryGrid");
  const filters = document.getElementById("galleryFilters");
  const modalEl = document.getElementById("lightbox");
  const img = document.getElementById("lbImage");
  const cap = document.getElementById("lbCaption");
  const meta = document.getElementById("lbMeta");
  const strip = document.getElementById("lbThumbs");
  const counter = document.getElementById("lbCounter");

  function renderGrid() {
    grid.innerHTML = shown.map((d, i) => `
      <div class="col-6 col-md-4 col-xl-3">
        <button type="button" class="gallery-item" data-i="${i}" aria-label="Open photo: ${LT.esc(d.name)}">
          <img src="${d.image}" alt="${LT.esc(d.alt)}" loading="lazy" width="800" height="600">
          <span class="cap">${LT.esc(d.name)}</span>
        </button>
      </div>`).join("");
    document.getElementById("galleryCount").textContent = shown.length + " pictures";
  }

  function show(i) {
    index = (i + shown.length) % shown.length;       // wraps around
    const d = shown[index];
    img.src = d.image; img.alt = d.alt;
    cap.textContent = d.name;
    meta.textContent = d.region + " - " + d.category;
    counter.textContent = (index + 1) + " / " + shown.length;
    strip.querySelectorAll("button").forEach((b, n) => b.classList.toggle("on", n === index));
    const on = strip.querySelector("button.on"); if (on) on.scrollIntoView({ inline: "center", block: "nearest" });
  }

  function openAt(i) {
    strip.innerHTML = shown.map((d, n) => `<button type="button" data-t="${n}" aria-label="Show ${LT.esc(d.name)}"><img src="${d.image}" alt=""></button>`).join("");
    show(i);
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try { all = await LT.loadDestinations(); } catch (e) { grid.innerHTML = '<p class="alert alert-lt-warm">Pictures could not be loaded.</p>'; return; }
    shown = all;
    const cats = ["All", ...new Set(all.map(d => d.category))];
    filters.innerHTML = cats.map(c => `<button type="button" class="btn filter-btn ${c === "All" ? "active" : ""}" data-cat="${c}" aria-pressed="${c === "All"}">${c}</button>`).join("");
    renderGrid();

    filters.addEventListener("click", e => {
      const b = e.target.closest(".filter-btn"); if (!b) return;
      filters.querySelectorAll(".filter-btn").forEach(x => { x.classList.toggle("active", x === b); x.setAttribute("aria-pressed", x === b); });
      shown = b.dataset.cat === "All" ? all : all.filter(d => d.category === b.dataset.cat);
      renderGrid();
    });
    grid.addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) openAt(+b.dataset.i); });
    document.getElementById("lbPrev").addEventListener("click", () => show(index - 1));
    document.getElementById("lbNext").addEventListener("click", () => show(index + 1));
    strip.addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (b) show(+b.dataset.t); });
    modalEl.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  });
})();
