/* ============================================================
   Products catalog — grid, filter, search, pagination
   ============================================================ */
(function () {
  "use strict";
  const data = window.DRONIXSYS_PRODUCTS || [];
  const cats = window.DRONIXSYS_CATEGORIES || {};
  const groups = window.DRONIXSYS_GROUPS || {};
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  // Collapse grouped products (e.g. NOVAIR family) into a single catalog entry.
  const seenGroups = new Set();
  const catalog = [];
  data.forEach((p) => {
    if (p.group) {
      if (seenGroups.has(p.group)) return;
      seenGroups.add(p.group);
      const g = groups[p.group] || {};
      catalog.push({
        isGroup: true,
        groupId: p.group,
        name: g.name || p.group,
        category: g.category || p.category,
        collaboration: g.collaboration || p.collaboration,
        description: g.description || p.description,
        image: g.image || p.image
      });
    } else {
      catalog.push(p);
    }
  });

  const searchInput = document.getElementById("searchInput");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const resultsCount = document.getElementById("resultsCount");
  const totalCount = document.getElementById("totalCount");
  const emptyState = document.getElementById("emptyState");

  let activeCat = "";
  let term = "";

  function icon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function cardHTML(p) {
    const href = p.isGroup ? `product-detail.html?group=${p.groupId}` : `product-detail.html?id=${p.id}`;
    const collab = p.collaboration
      ? `<span class="prod-collab">In collaboration with ${p.collaboration}</span>` : "";
    return `
      <article class="prod-card reveal">
        <a class="prod-card__media" href="${href}">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
          <span class="prod-card__cat">${cats[p.category] || p.category}</span>
        </a>
        <div class="prod-card__body">
          <h3>${p.name}</h3>
          ${collab}
          <p>${p.description}</p>
          <a href="${href}" class="link-more">View Details ${icon()}</a>
        </div>
      </article>`;
  }

  function render() {
    const filtered = catalog.filter((p) => {
      const matchCat = !activeCat || p.category === activeCat;
      const matchTerm = !term ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term);
      return matchCat && matchTerm;
    });

    grid.innerHTML = filtered.map(cardHTML).join("");
    if (resultsCount) resultsCount.textContent = filtered.length;
    if (totalCount) totalCount.textContent = catalog.length;
    if (emptyState) emptyState.style.display = filtered.length ? "none" : "block";

    // re-trigger reveal
    grid.querySelectorAll(".reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("in"), 60 + i * 60);
    });
  }

  // filter from URL (?category=...)
  const params = new URLSearchParams(location.search);
  const initCat = params.get("category");
  if (initCat && cats[initCat]) activeCat = initCat;

  filterButtons.forEach((btn) => {
    if (btn.dataset.filter === activeCat) {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      activeCat = btn.dataset.filter;
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      render();
    });
  });

  if (searchInput) {
    let t;
    searchInput.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => { term = searchInput.value.toLowerCase().trim(); render(); }, 250);
    });
  }

  render();
})();
