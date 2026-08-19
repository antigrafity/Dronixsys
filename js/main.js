/* ============================================================
   DRONIXSYS — Interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Navbar scroll state ---------- */
  const nav = document.querySelector(".nav");
  const isSolid = nav && nav.classList.contains("nav--solid");
  const onScroll = () => {
    if (!nav || isSolid) return;
    nav.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll progress bar ---------- */
  const progress = document.querySelector(".scroll-progress");
  if (progress) {
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progress.style.width = pct + "%";
    }, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.querySelector(".nav__menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        menu.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split(".")[1] || "").length;
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = dec ? val.toFixed(dec) : Math.round(val).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCounter(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Timeline interactive ---------- */
  const timeline = document.querySelector(".timeline");
  if (timeline) {
    const steps = timeline.querySelectorAll(".tl-step");
    const bar = timeline.querySelector(".timeline__progress");
    const activate = () => {
      steps.forEach((s, i) => {
        setTimeout(() => s.classList.add("on"), i * 220);
      });
      if (bar) bar.style.width = "100%";
    };
    const tio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            activate();
            tio.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    tio.observe(timeline);

    steps.forEach((s) => {
      s.addEventListener("mouseenter", () => {
        steps.forEach((x) => x.classList.remove("hot"));
        s.classList.add("hot");
      });
    });
  }

  /* ---------- Hero particles ---------- */
  const canvas = document.getElementById("particles");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const ctx = canvas.getContext("2d");
    let w, h, particles, raf;
    const COUNT = window.innerWidth < 720 ? 34 : 70;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    const init = () => {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,.55)";
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(180,30,37,${0.14 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.strokeStyle = `rgba(201,204,211,${0.1 * (1 - dist / 130)})`;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    window.addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); init(); draw(); });
  }

  /* ---------- Puzzle Captcha Modal ---------- */
  (function setupCaptchaModal() {
    const demoForms = document.querySelectorAll("form[data-demo]");
    if (!demoForms.length) return;

    const CW = 240, CH = 130, PIECE = 38, BUMP = 7, TOLERANCE = 5;
    const IMAGES = [
      "assets/images/about-us.png",
      "assets/images/why-choose.png",
      "assets/images/reliability.png",
      "assets/images/excellence.png",
      "assets/images/our-story.png",
      "assets/images/product-design.png"
    ];

    const modal = document.createElement("div");
    modal.className = "captcha-modal";
    modal.innerHTML = `
      <div class="captcha-modal__box">
        <div class="captcha-modal__head">
          <h3>Security Check</h3>
          <button type="button" class="captcha-modal__close" aria-label="Close">&times;</button>
        </div>
        <p class="captcha-modal__hint">Drag the slider to complete the picture</p>
        <div class="captcha-stage">
          <canvas class="captcha-stage__bg" width="${CW}" height="${CH}"></canvas>
          <canvas class="captcha-stage__piece" width="${CW}" height="${CH}"></canvas>
        </div>
        <input type="range" class="captcha-slider" min="0" max="${CW - PIECE}" value="0" step="1" aria-label="Drag to complete the puzzle" />
        <p class="captcha-modal__msg" aria-live="polite"></p>
        <button type="button" class="captcha-modal__refresh">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v6h6M20 20v-6h-6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 10a8 8 0 0 0-14.9-3M4 14a8 8 0 0 0 14.9 3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          New puzzle
        </button>
      </div>`;
    document.body.appendChild(modal);

    const bgCanvas = modal.querySelector(".captcha-stage__bg");
    const pieceCanvas = modal.querySelector(".captcha-stage__piece");
    const slider = modal.querySelector(".captcha-slider");
    const msg = modal.querySelector(".captcha-modal__msg");
    const closeBtn = modal.querySelector(".captcha-modal__close");
    const refreshBtn = modal.querySelector(".captcha-modal__refresh");
    const bgCtx = bgCanvas.getContext("2d");
    const pieceCtx = pieceCanvas.getContext("2d");

    let gapX = 0, gapY = 0, solved = false, pendingForm = null;

    // Traces a square jigsaw piece with a bump on top and a notch on the left.
    function tracePiece(ctx, x, y, size, r) {
      const midX = x + size / 2;
      const midY = y + size / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(midX - r, y);
      ctx.arc(midX, y, r, Math.PI, 0, false);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x, midY + r);
      ctx.arc(x, midY, r, Math.PI / 2, -Math.PI / 2, true);
      ctx.lineTo(x, y);
      ctx.closePath();
    }

    function coverParams(img, w, h) {
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = w / h;
      let sw, sh, sx, sy;
      if (ir > cr) {
        sh = img.naturalHeight;
        sw = sh * cr;
        sx = (img.naturalWidth - sw) / 2;
        sy = 0;
      } else {
        sw = img.naturalWidth;
        sh = sw / cr;
        sx = 0;
        sy = (img.naturalHeight - sh) / 2;
      }
      return { sx, sy, sw, sh };
    }

    function newPuzzle() {
      solved = false;
      slider.value = 0;
      slider.disabled = false;
      msg.textContent = "";
      msg.className = "captcha-modal__msg";
      pieceCanvas.style.transform = "translateX(0px)";

      gapX = Math.round(60 + Math.random() * (196 - 60));
      gapY = Math.round(13 + Math.random() * (86 - 13));

      const src = IMAGES[Math.floor(Math.random() * IMAGES.length)];
      const img = new Image();
      img.onload = () => {
        const { sx, sy, sw, sh } = coverParams(img, CW, CH);

        bgCtx.clearRect(0, 0, CW, CH);
        bgCtx.drawImage(img, sx, sy, sw, sh, 0, 0, CW, CH);
        bgCtx.save();
        tracePiece(bgCtx, gapX, gapY, PIECE, BUMP);
        bgCtx.fillStyle = "rgba(13,15,19,.65)";
        bgCtx.fill();
        bgCtx.strokeStyle = "rgba(255,255,255,.9)";
        bgCtx.lineWidth = 1.5;
        bgCtx.stroke();
        bgCtx.restore();

        pieceCtx.clearRect(0, 0, CW, CH);
        pieceCtx.save();
        tracePiece(pieceCtx, 0, gapY, PIECE, BUMP);
        pieceCtx.clip();
        pieceCtx.drawImage(img, sx, sy, sw, sh, -gapX, 0, CW, CH);
        pieceCtx.restore();
        tracePiece(pieceCtx, 0, gapY, PIECE, BUMP);
        pieceCtx.strokeStyle = "rgba(255,255,255,.95)";
        pieceCtx.lineWidth = 1.5;
        pieceCtx.stroke();
      };
      img.src = src;
    }

    function openCaptcha(form) {
      pendingForm = form;
      modal.classList.add("open");
      newPuzzle();
    }
    function closeCaptcha() {
      modal.classList.remove("open");
      pendingForm = null;
    }
    function finalizeSubmit(form) {
      const ok = form.querySelector(".form__ok");
      if (ok) ok.style.display = "block";
      form.querySelectorAll("input, textarea, select").forEach((f) => (f.value = ""));
      if (ok) setTimeout(() => ok.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }

    closeBtn.addEventListener("click", closeCaptcha);
    refreshBtn.addEventListener("click", newPuzzle);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeCaptcha(); });

    slider.addEventListener("input", () => {
      pieceCanvas.style.transform = `translateX(${slider.value}px)`;
    });
    slider.addEventListener("change", () => {
      if (solved) return;
      const val = parseInt(slider.value, 10);
      if (Math.abs(val - gapX) <= TOLERANCE) {
        solved = true;
        slider.disabled = true;
        pieceCanvas.style.transform = `translateX(${gapX}px)`;
        msg.textContent = "✓ Verified";
        msg.className = "captcha-modal__msg is-success";
        const formToSubmit = pendingForm;
        setTimeout(() => {
          closeCaptcha();
          if (formToSubmit) finalizeSubmit(formToSubmit);
        }, 600);
      } else {
        msg.textContent = "Not quite — try again.";
        msg.className = "captcha-modal__msg is-error";
        slider.value = 0;
        pieceCanvas.style.transform = "translateX(0px)";
      }
    });

    demoForms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        openCaptcha(form);
      });
    });
  })();

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
