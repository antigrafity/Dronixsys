/* ============================================================
   Product detail — renders from ?id= against product data
   ============================================================ */
(function () {
  "use strict";
  const data = window.DRONIXSYS_PRODUCTS || [];
  const cats = window.DRONIXSYS_CATEGORIES || {};
  const root = document.getElementById("productDetail");
  if (!root) return;

  const id = parseInt(new URLSearchParams(location.search).get("id"), 10);
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
        <a href="contact.html" class="btn btn--primary">Request a Quote
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a href="products.html" class="btn btn--outline">Back to Products</a>
      </div>
    </div>`;

  root.querySelector("#pdFeatures").innerHTML = `
    <h2 class="section-title" style="font-size:1.6rem">Key Features</h2>
    <ul class="check pd-features">${features}</ul>`;

  root.querySelector("#pdSpecs").innerHTML = `
    <h2 class="section-title" style="font-size:1.6rem">Specifications</h2>
    <div class="spec-table">${specs}</div>`;

  // related — same category, exclude current
  const related = data.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);
  const relatedEl = document.getElementById("pdRelated");
  if (relatedEl && related.length) {
    relatedEl.innerHTML = `
      <div class="container">
        <div class="center" style="margin-bottom:40px">
          <span class="eyebrow" style="justify-content:center">Related Products</span>
          <h2 class="section-title">Explore more in this category</h2>
        </div>
        <div class="grid grid-3">
          ${related.map((r) => `
            <article class="prod-card">
              <a class="prod-card__media" href="product-detail.html?id=${r.id}">
                <img src="${r.image}" alt="${r.name}" loading="lazy" />
                <span class="prod-card__cat">${cats[r.category]}</span>
              </a>
              <div class="prod-card__body">
                <h3>${r.name}</h3>
                ${r.collaboration ? `<span class="prod-collab">In collaboration with ${r.collaboration}</span>` : ""}
                <p>${r.description}</p>
                <a href="product-detail.html?id=${r.id}" class="link-more">View Details
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
              </div>
            </article>`).join("")}
        </div>
      </div>`;
  } else if (relatedEl) {
    relatedEl.style.display = "none";
  }

  // trigger reveals
  root.querySelectorAll(".reveal").forEach((el, i) => setTimeout(() => el.classList.add("in"), 80 + i * 100));
})();
