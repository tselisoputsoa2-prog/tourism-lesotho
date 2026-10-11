/* destinations.js - search, category filtering, sorting, pagination, details modal, saved places */
"use strict";
(function () {
  const PER_PAGE = 9;
  const state = { all: [], q: "", cat: "All", sort: "default", page: 1 };
  const grid = document.getElementById("destGrid");
  const pager = document.getElementById("pager");
  const count = document.getElementById("resultCount");
  const searchBox = document.getElementById("destSearch");
  const filterBox = document.getElementById("filterButtons");
  const savedList = document.getElementById("savedList");

  function filtered() {
    const q = state.q.toLowerCase();
    let list = state.all.filter(d =>
      (state.cat === "All" || d.category === state.cat) &&
      (!q || [d.name, d.region, d.summary, d.tag, d.bestFor, d.category].join(" ").toLowerCase().includes(q)));
    if (state.sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === "za") list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }

  function render() {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    state.page = Math.min(state.page, pages);
    const slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);

    count.textContent = list.length === 0 ? "No places found"
      : `Showing ${slice.length} of ${list.length} place${list.length === 1 ? "" : "s"}`;

    grid.innerHTML = slice.length ? slice.map(LT.cardHTML).join("") :
      `<div class="col-12"><div class="empty-state"><h3>Nothing matches "${LT.esc(state.q)}"</h3>
       <p class="mx-auto">Try a shorter word such as "falls", "dam" or "hike", or reset the filters.</p>
       <button class="btn btn-brand" id="resetFilters">Reset filters</button></div></div>`;

    // Bootstrap pagination
    let html = `<li class="page-item ${state.page === 1 ? "disabled" : ""}"><a class="page-link" href="#" data-page="${state.page - 1}">Previous</a></li>`;
    for (let i = 1; i <= pages; i++)
      html += `<li class="page-item ${i === state.page ? "active" : ""}"><a class="page-link" href="#" data-page="${i}" ${i === state.page ? 'aria-current="page"' : ""}>${i}</a></li>`;
    html += `<li class="page-item ${state.page === pages ? "disabled" : ""}"><a class="page-link" href="#" data-page="${state.page + 1}">Next</a></li>`;
    pager.innerHTML = pages > 1 ? html : "";
    renderSaved();
  }

  function renderSaved() {
    const ids = LT.favourites();
    const items = state.all.filter(d => ids.includes(d.id));
    savedList.innerHTML = items.length
      ? items.map(d => `<li class="d-flex justify-content-between align-items-center gap-2 mb-2">
            <button class="btn btn-link p-0 text-start" data-details="${d.id}">${LT.esc(d.name)}</button>
            <button class="btn btn-sm btn-ghost py-0 px-2" data-fav="${d.id}" aria-label="Remove ${LT.esc(d.name)} from saved places">✕</button></li>`).join("")
      : '<li class="text-muted-lt">Tap the heart on a card to save a place. Your list stays on this device.</li>';
  }

  function setCategory(cat) {
    state.cat = cat; state.page = 1;
    filterBox.querySelectorAll(".filter-btn").forEach(b => {
      const on = b.dataset.cat === cat; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on);
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try { state.all = await LT.loadDestinations(); }
    catch (e) { grid.innerHTML = '<div class="col-12"><div class="alert alert-lt-warm" role="alert">Places could not be loaded. Please refresh.</div></div>'; return; }
    window.__dest = state.all;

    // build filter buttons from the data
    const cats = ["All", ...new Set(state.all.map(d => d.category))];
    filterBox.innerHTML = cats.map(c => `<button type="button" class="btn filter-btn ${c === "All" ? "active" : ""}" data-cat="${c}" aria-pressed="${c === "All"}">${c}</button>`).join("");

    const params = new URLSearchParams(location.search);
    if (params.get("q")) { state.q = params.get("q"); searchBox.value = state.q; }
    if (params.get("cat") && cats.includes(params.get("cat"))) setCategory(params.get("cat"));
    render();

    searchBox.addEventListener("input", () => { state.q = searchBox.value.trim(); state.page = 1; render(); });
    document.getElementById("searchForm").addEventListener("submit", e => e.preventDefault());
    document.getElementById("sortSelect").addEventListener("change", e => { state.sort = e.target.value; render(); });
    document.querySelectorAll("[data-cat-link]").forEach(a => a.addEventListener("click", () => { setCategory(a.dataset.catLink); render(); }));

    filterBox.addEventListener("click", e => {
      const b = e.target.closest(".filter-btn"); if (!b) return;
      setCategory(b.dataset.cat); render();
    });
    pager.addEventListener("click", e => {
      const a = e.target.closest("[data-page]"); if (!a) return;
      e.preventDefault();
      const p = +a.dataset.page; if (p < 1) return;
      state.page = p; render();
      document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.addEventListener("click", e => {
      if (e.target.id === "resetFilters") { state.q = ""; searchBox.value = ""; setCategory("All"); render(); }
      const fav = e.target.closest("[data-fav]");
      if (fav) { LT.toggleFav(fav.dataset.fav); render(); }
      const det = e.target.closest("[data-details]");
      if (det) window.openDetails(state.all.find(d => d.id === det.dataset.details));
    });
  });
})();
