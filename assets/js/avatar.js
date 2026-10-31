/* Prabu Dass — layered 3D avatar.
   The front-view SVG portrait is split into depth layers ([data-depth]). When the head turns,
   near layers (nose, eyes, mouth) shift more than far ones (ears, back hair) while the whole rig
   rotates in perspective, so the flat illustration reads as a 3D head.
   Pupils follow the pointer; the head blinks, floats and looks around when idle. No dependencies. */
(() => {
  const host = document.querySelector("[data-avatar]");
  if (!host) return;
  const svg = host.querySelector("svg");
  const rig = host.querySelector(".avatar-rig");
  if (!svg || !rig) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const brows = svg.querySelector("[data-brows]");
  const layers = [...svg.querySelectorAll("[data-depth]")].map((el) => ({ el, d: parseFloat(el.dataset.depth) }));
  const eyes = [...svg.querySelectorAll("[data-eye]")].map((el) => ({
    el,
    cy: parseFloat(el.dataset.cy),
    pupil: el.querySelector("[data-pupil]"),
  }));

  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let lastMove = -10;
  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;

  function setTarget(clientX, clientY) {
    const r = host.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.45;
    target.x = Math.max(-1, Math.min(1, (clientX - cx) / (window.innerWidth * 0.45)));
    target.y = Math.max(-1, Math.min(1, (clientY - cy) / (window.innerHeight * 0.5)));
    lastMove = now();
    wake();
  }
  window.addEventListener("pointermove", (e) => setTarget(e.clientX, e.clientY), { passive: true });
  window.addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) setTarget(t.clientX, t.clientY); }, { passive: true });

  let nextBlink = 2 + Math.random() * 3;
  let blinkStart = -1;

  let lastT = 0;
  function render(t) {
    // idle: look around on its own when the pointer is still
    if (!reduceMotion && t - lastMove > 3.5) {
      target.x = Math.sin(t * 0.42) * 0.5;
      target.y = Math.sin(t * 0.29 + 1.2) * 0.3;
    }
    // frame-rate independent easing
    const dt = Math.min(0.1, Math.max(0, t - lastT));
    lastT = t;
    const k = 1 - Math.exp(-dt * (reduceMotion ? 14 : 6));
    current.x += (target.x - current.x) * k;
    current.y += (target.y - current.y) * k;
    const x = current.x, y = current.y;

    // depth layers: parallax in SVG units
    const lift = Math.max(0, -y) * 7; // brows rise when looking up
    for (const { el, d } of layers) {
      const ty = y * d * 0.55 - (el === brows ? lift : 0);
      el.setAttribute("transform", `translate(${(x * d).toFixed(2)} ${ty.toFixed(2)})`);
    }

    // pupils roll toward the pointer
    for (const e of eyes) e.pupil.setAttribute("transform", `translate(${(x * 9).toFixed(2)} ${(y * 7).toFixed(2)})`);

    // blink (time based)
    if (!reduceMotion) {
      if (blinkStart < 0 && t > nextBlink) blinkStart = t;
      let s = 1;
      if (blinkStart >= 0) {
        const d = t - blinkStart;
        s = d < 0.07 ? 1 - d / 0.07 : Math.min(1, (d - 0.07) / 0.09);
        s = Math.max(0.08, s);
        if (d > 0.16) { blinkStart = -1; nextBlink = t + 2.5 + Math.random() * 3.5; s = 1; }
      }
      for (const e of eyes) e.el.setAttribute("transform", s === 1 ? "" : `translate(0 ${e.cy}) scale(1 ${s.toFixed(3)}) translate(0 ${-e.cy})`);
    }

    // whole head turns in perspective, and floats
    const float = reduceMotion ? 0 : Math.sin(t * 1.2) * 6;
    rig.style.transform =
      `perspective(1100px) translateY(${float.toFixed(2)}px) rotateY(${(x * 16).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg) rotateZ(${(x * 2).toFixed(2)}deg)`;
  }

  // loop only while visible; with reduced motion, stop once settled
  let visible = true;
  let raf = 0;
  function frame() {
    raf = 0;
    if (!visible || document.hidden) return;
    render(now());
    const settled = reduceMotion && Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
    if (!settled) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf) raf = requestAnimationFrame(frame); }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }).observe(host);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });
  wake();
})();
