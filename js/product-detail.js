/* ============================================================
   Product detail — renders from ?id= (single product) or
   ?group= (product family, e.g. NOVAIR) against product data
   ============================================================ */
(function () {
  "use strict";
  const data = window.DRONIXSYS_PRODUCTS || [];
  const cats = window.DRONIXSYS_CATEGORIES || {};
  const groups = window.DRONIXSYS_GROUPS || {};
  const root = document.getElementById("productDetail");
  if (!root) return;

  const icon = () =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function collapseRelated(list) {
    // Collapse grouped items into a single card for related/preview lists.
    const seen = new Set();
    const out = [];
    list.forEach((p) => {
      if (p.group) {
        if (seen.has(p.group)) return;
        seen.add(p.group);
        const g = groups[p.group] || {};
        out.push({
          isGroup: true,
          groupId: p.group,
          name: g.name || p.group,
          category: g.category || p.category,
          collaboration: g.collaboration || p.collaboration,
          description: g.description || p.description,
          image: g.image || p.image
        });
      } else {
        out.push(p);
      }
    });
    return out;
  }

  function cardHTML(r) {
    const href = r.isGroup ? `product-detail.html?group=${r.groupId}` : `product-detail.html?id=${r.id}`;
    return `
      <article class="prod-card">
        <a class="prod-card__media" href="${href}">
          <img src="${r.image}" alt="${r.name}" loading="lazy" />
          <span class="prod-card__cat">${cats[r.category] || r.category}</span>
        </a>
        <div class="prod-card__body">
          <h3>${r.name}</h3>
          ${r.collaboration ? `<span class="prod-collab">In collaboration with ${r.collaboration}</span>` : ""}
          <p>${r.description}</p>
          <a href="${href}" class="link-more">View Details ${icon()}</a>
        </div>
      </article>`;
  }

  function renderRelated(category, excludeIds, excludeGroup) {
    const pool = data.filter((x) => x.category === category && !excludeIds.includes(x.id) && x.group !== excludeGroup);
    const related = collapseRelated(pool).slice(0, 3);
    const relatedEl = document.getElementById("pdRelated");
    if (relatedEl && related.length) {
      relatedEl.innerHTML = `
        <div class="container">
          <div class="center" style="margin-bottom:40px">
            <span class="eyebrow" style="justify-content:center">Related Products</span>
            <h2 class="section-title">Explore more in this category</h2>
          </div>
          <div class="grid grid-3">${related.map(cardHTML).join("")}</div>
        </div>`;
    } else if (relatedEl) {
      relatedEl.style.display = "none";
    }
  }

  const params = new URLSearchParams(location.search);
  const groupId = params.get("group");

  if (groupId && groups[groupId]) {
    // ---- Group overview page (e.g. NOVAIR) ----
    const g = groups[groupId];
    const members = data.filter((x) => x.group === groupId);

    document.title = `${g.name} | Dronixsys`;

    const collab = g.collaboration
      ? `<span class="pd-collab">In collaboration with ${g.collaboration}</span>` : "";

    root.querySelector("#pdCrumb").textContent = g.name;

    root.querySelector("#pdMain").innerHTML = `
      <div class="pd-gallery reveal">
        <img src="${g.image}" alt="${g.name}" />
      </div>
      <div class="pd-info reveal d1">
        <span class="pd-cat">${cats[g.category] || g.category}</span>
        <h1>${g.name}</h1>
        ${collab}
        <p class="pd-desc">${g.description}</p>
        <div class="pd-cta">
          <a href="contact.html" class="btn btn--primary">Request a Quote ${icon()}</a>
          <a href="products.html" class="btn btn--outline">Back to Products</a>
        </div>
      </div>`;

    // Group pages don't use the two-column features/specs grid — hide it
    // and render the family members as a full-width product grid instead.
    const pdGrid = root.querySelector(".pd-grid");
    if (pdGrid) pdGrid.style.display = "none";

    const membersEl = document.getElementById("pdRelated");
    if (membersEl) {
      membersEl.style.display = "";
      membersEl.innerHTML = `
        <div class="container">
          <div class="center" style="margin-bottom:44px">
            <span class="eyebrow" style="justify-content:center">${g.name} Family</span>
            <h2 class="section-title">Products in the ${g.name} range</h2>
          </div>
          <div class="grid grid-3">${members.map(cardHTML).join("")}</div>
        </div>`;
    }
  } else {
    // ---- Single product page ----
    const id = parseInt(params.get("id"), 10);
    const p = data.find((x) => x.id === id) || data[0];
    if (!p) return;

    document.title = `${p.name} | Dronixsys`;

    const features = p.features.map((f) =>
      `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>${f}</li>`
    ).join("");

    const specs = Object.entries(p.specs).map(([k, v]) =>
      `<div class="spec-row"><span class="spec-k">${k}</span><span class="spec-v">${v}</span></div>`
    ).join("");

    const collab = p.collaboration
      ? `<span class="pd-collab">In collaboration with ${p.collaboration}</span>` : "";

    root.querySelector("#pdCrumb").textContent = p.name;

    root.querySelector("#pdMain").innerHTML = `
      <div class="pd-gallery reveal">
        <img src="${p.image}" alt="${p.name}" />
      </div>
      <div class="pd-info reveal d1">
        <span class="pd-cat">${cats[p.category] || p.category}</span>
        <h1>${p.name}</h1>
        ${collab}
        <p class="pd-desc">${p.fullDescription}</p>
        <div class="pd-cta">
          <a href="contact.html" class="btn btn--primary">Request a Quote ${icon()}</a>
          <a href="products.html" class="btn btn--outline">Back to Products</a>
        </div>
      </div>`;

    root.querySelector("#pdFeatures").innerHTML = `
      <h2 class="section-title" style="font-size:1.6rem">Key Features</h2>
      <ul class="check pd-features">${features}</ul>`;

    root.querySelector("#pdSpecs").innerHTML = `
      <h2 class="section-title" style="font-size:1.6rem">Specifications</h2>
      <div class="spec-table">${specs}</div>`;

    renderRelated(p.category, [p.id], p.group);
  }

  // trigger reveals
  root.querySelectorAll(".reveal").forEach((el, i) => setTimeout(() => el.classList.add("in"), 80 + i * 100));
})();
