/* activities.js - category filter + live search for the activity cards */
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const cards = [...document.querySelectorAll("[data-activity]")];
  const buttons = document.querySelectorAll("#activityFilters .filter-btn");
  const search = document.getElementById("activitySearch");
  const empty = document.getElementById("activityEmpty");
  let cat = "all";

  function apply() {
    const q = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(c => {
      const ok = (cat === "all" || c.dataset.activity === cat) && (!q || c.textContent.toLowerCase().includes(q));
      c.hidden = !ok; if (ok) visible++;
    });
    empty.hidden = visible !== 0;
  }
  buttons.forEach(b => b.addEventListener("click", () => {
    cat = b.dataset.filter;
    buttons.forEach(x => { x.classList.toggle("active", x === b); x.setAttribute("aria-pressed", x === b); });
    apply();
  }));
  search.addEventListener("input", apply);
});
