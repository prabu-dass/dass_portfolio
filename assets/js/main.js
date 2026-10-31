/* Prabu Dass portfolio — interactions. No dependencies. */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionOK = () => !reduceMotion.matches;

  if (motionOK()) root.classList.add("js-motion");
  // Start the hero entrance once fonts are ready (images don't matter), never later than 500ms.
  const markLoaded = () => root.classList.add("is-loaded");
  document.fonts?.ready.then(markLoaded);
  setTimeout(markLoaded, 500);

  /* ---------- Header: scrolled state + hide on scroll down ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 8);
      const menuOpen = document.body.classList.contains("menu-open");
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (!menuOpen && goingDown && y > 320) header.classList.add("is-hidden");
      else if (goingUp || y < 320) header.classList.remove("is-hidden");
      lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
    // Keep the header visible while keyboard users tab through it.
    header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
  }

  /* ---------- Nav: active indicator ---------- */
  const navList = document.querySelector(".nav-list");
  const indicator = document.querySelector(".nav-indicator");
  if (navList && indicator) {
    const current = navList.querySelector('a[aria-current="page"]');
    const moveTo = (el) => {
      if (!el) { indicator.style.opacity = "0"; return; }
      const listBox = navList.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      indicator.style.opacity = "1";
      indicator.style.width = `${box.width}px`;
      indicator.style.transform = `translateX(${box.left - listBox.left}px)`;
    };
    const reset = () => moveTo(current);
    navList.querySelectorAll("a").forEach((a) => {
      a.addEventListener("mouseenter", () => moveTo(a));
      a.addEventListener("focus", () => moveTo(a));
    });
    navList.addEventListener("mouseleave", reset);
    navList.addEventListener("focusout", (e) => { if (!navList.contains(e.relatedTarget)) reset(); });
    window.addEventListener("resize", reset);
    document.fonts?.ready.then(reset);
    reset();
  }

  /* ---------- Mobile menu ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".nav-toggle-label").textContent = open ? "Close" : "Menu";
      document.body.classList.toggle("menu-open", open);
      if (open) nav.querySelector(".nav-list a")?.focus();
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    nav.querySelectorAll(".nav-list a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Image reveals ---------- */
  const revealables = document.querySelectorAll("[data-reveal]");
  if (motionOK() && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Hero wordmark: variable-width entrance + pointer response ---------- */
  const heroName = document.querySelector("[data-hero-name]");
  if (heroName) {
    // Split each line into characters (keeps screen-reader text via aria-label on the h1).
    heroName.querySelectorAll(".line").forEach((line) => {
      const text = line.textContent;
      line.textContent = "";
      [...text].forEach((ch) => {
        const span = document.createElement("span");
        span.className = "char";
        span.setAttribute("aria-hidden", "true");
        span.textContent = ch;
        if (ch === "D" && line.dataset.dmark !== undefined) span.classList.add("d-mark");
        line.appendChild(span);
      });
    });
    const chars = [...heroName.querySelectorAll(".char")];
    const REST = 72;

    if (motionOK()) {
      chars.forEach((c) => {
        c.style.setProperty("--w", "50");
        c.style.transition = "none";
      });
      // Force a style flush, then animate to rest width. A timeout (not rAF) so it always
      // completes, even in background tabs or screenshot tools where rAF is paused.
      void heroName.offsetWidth;
      setTimeout(() => {
        chars.forEach((c, i) => {
          c.style.transition = `font-variation-settings 1100ms cubic-bezier(0.22, 1, 0.36, 1) ${120 + i * 55}ms`;
          c.style.setProperty("--w", String(REST));
        });
        // After the entrance, switch to a quicker transition for pointer response.
        setTimeout(() => chars.forEach((c) => { c.style.transition = ""; }), 1300 + chars.length * 55);
      }, 30);

      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      if (finePointer.matches) {
        let raf = 0;
        const onMove = (e) => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            chars.forEach((c) => {
              const box = c.getBoundingClientRect();
              const dx = Math.abs(e.clientX - (box.left + box.width / 2));
              const dy = Math.abs(e.clientY - (box.top + box.height / 2));
              const dist = Math.hypot(dx, dy * 1.4);
              const influence = Math.max(0, 1 - dist / 420);
              c.style.setProperty("--w", String(Math.round(REST + influence * 26)));
            });
          });
        };
        const hero = heroName.closest(".hero") || heroName;
        hero.addEventListener("pointermove", onMove);
        hero.addEventListener("pointerleave", () => chars.forEach((c) => c.style.setProperty("--w", String(REST))));
      }
    }
  }

  /* ---------- Video modal ---------- */
  const modal = document.querySelector(".media-modal");
  if (modal) {
    const stage = modal.querySelector(".media-modal-stage");
    const titleEl = modal.querySelector(".media-modal-title");
    const closeBtn = modal.querySelector(".media-modal-close");
    let lastTrigger = null;

    const clearStage = () => {
      stage.querySelectorAll("video").forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); });
      stage.innerHTML = "";
      stage.classList.remove("is-portrait");
    };

    const open = (trigger) => {
      lastTrigger = trigger;
      clearStage();
      const { video, youtube, image, title, poster, portrait } = trigger.dataset;
      titleEl.textContent = title || "";
      if (image) {
        const im = document.createElement("img");
        im.src = image;
        im.alt = title || "";
        stage.appendChild(im);
      } else if (youtube) {
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtube)}?autoplay=1&rel=0`;
        iframe.title = title || "Video";
        iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        iframe.allowFullscreen = true;
        stage.appendChild(iframe);
      } else if (video) {
        const v = document.createElement("video");
        v.controls = true;
        v.playsInline = true;
        v.preload = "metadata";
        if (poster) v.poster = poster;
        v.src = video;
        if (portrait !== undefined) stage.classList.add("is-portrait");
        stage.appendChild(v);
        v.play().catch(() => { /* autoplay with sound may be blocked; controls remain */ });
      }
      if (typeof modal.showModal === "function") modal.showModal();
      else modal.setAttribute("open", "");
      document.body.style.overflow = "hidden";
    };

    // Cleanup runs directly on every close path; the dialog's `close` event is only a fallback
    // (it is dispatched asynchronously and can arrive late or not at all in some environments).
    const finish = () => {
      if (!lastTrigger) return;
      clearStage();
      document.body.style.overflow = "";
      const t = lastTrigger;
      lastTrigger = null;
      t.focus();
    };

    const close = () => {
      if (modal.open && typeof modal.close === "function") modal.close();
      else modal.removeAttribute("open");
      finish();
    };

    modal.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.open) close(); });
    modal.addEventListener("close", finish);
    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });

    document.querySelectorAll("[data-video], [data-youtube], [data-image]").forEach((t) => {
      t.addEventListener("click", (e) => { e.preventDefault(); open(t); });
    });
  }

  /* ---------- Ambient hero video (video page): load only when it makes sense ---------- */
  const ambient = document.querySelector("video[data-ambient]");
  if (ambient) {
    const saveData = navigator.connection?.saveData;
    const wide = window.matchMedia("(min-width: 700px)").matches;
    if (motionOK() && !saveData && wide) {
      const start = () => {
        ambient.src = ambient.dataset.src;
        ambient.play().catch(() => {});
      };
      if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 2000 });
      else setTimeout(start, 800);
    }
  }

  /* ---------- 3D tilt + glare on project frames (fine pointers only) ---------- */
  const tiltSelector = [
    ".featured .frame", ".project-index .frame", ".video-grid .frame", ".reel-row .frame",
    ".switcher-stage .frame", ".poster-row .frame", ".campaign .frame", ".ed-media .frame",
    ".gd-hero .frame", ".stills .frame", ".case-gallery .frame", ".page-hero-media .frame",
    ".reel-feature .frame", ".about-portrait .frame", ".story-media .frame", ".promo-feature .frame",
  ].join(",");
  if (motionOK() && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(tiltSelector).forEach((el) => {
      el.setAttribute("data-tilt", "");
      let raf = 0;
      el.addEventListener("pointermove", (e) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.classList.add("is-tilting");
          el.style.setProperty("--ry", `${(px * 9).toFixed(2)}deg`);
          el.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
          el.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
          el.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`);
        });
      });
      el.addEventListener("pointerleave", () => {
        cancelAnimationFrame(raf);
        el.classList.remove("is-tilting");
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--rx", "0deg");
        el.style.removeProperty("--gx");
        el.style.removeProperty("--gy");
      });
    });
  }

  /* ---------- Screen switcher (tabs that swap a mockup and its flat screen) ---------- */
  document.querySelectorAll("[data-switcher]").forEach((group) => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const mockup = group.querySelector("[data-switch-mockup]");
    const flat = group.querySelector("[data-switch-screen]");
    const flatBtn = flat?.closest("[data-image]");
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      const label = tab.textContent.trim();
      if (mockup) { mockup.src = tab.dataset.mockup; mockup.alt = `${label} screen on the car's centre display`; }
      if (flat) { flat.src = tab.dataset.screen; flat.alt = `${label} screen, flat`; }
      if (flatBtn) { flatBtn.dataset.image = tab.dataset.screen; flatBtn.dataset.title = `${group.dataset.switcher}: ${label}`; }
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (e.key === "Home") { e.preventDefault(); select(tabs[0], true); }
        else if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1], true); }
        else if (step) { e.preventDefault(); select(tabs[(i + step + tabs.length) % tabs.length], true); }
      });
    });
  });

  /* ---------- Open a <details> case study when linked to by #id ---------- */
  const openFromHash = () => {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && target.tagName === "DETAILS" && !target.open) {
      target.open = true;
      target.scrollIntoView({ block: "start" });
    }
  };
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
