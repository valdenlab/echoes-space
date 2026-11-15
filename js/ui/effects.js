/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Efeitos: campo de estrelas (parallax), brilho do cursor, revelação, inclinação 3D, salto de dobra */
window.EC = window.EC || {}; EC.ui = EC.ui || {};
(function () {
  const reduce = EC.reduceMotion();
  // ---- estrelas
  const cv = EC.$('#stars');
  if (cv) {
    const ctx = cv.getContext('2d'); let W, H, stars = [], mx = 0, my = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(260, Math.floor(W * H / 6500)), r = EC.rng(42);
      stars = Array.from({ length: n }, () => ({ x: r() * W, y: r() * H, z: .3 + r() * .9, s: .5 + r() * 2, p: r() * 6.28 }));
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = reduce ? .7 : .4 + .5 * Math.sin(t / 1000 * s.s + s.p);
        const x = (s.x + mx * s.z * 18 + W) % W, y = (s.y + my * s.z * 12 + scrollY * s.z * .05 + H) % H;
        ctx.fillStyle = `rgba(215,230,255,${a * s.z})`; ctx.fillRect(x, y, s.z * 1.8, s.z * 1.8);
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    addEventListener('resize', resize); resize();
    addEventListener('pointermove', e => { mx = e.clientX / W - .5; my = e.clientY / H - .5; }, { passive: true });
    requestAnimationFrame(draw);
  }
  // ---- brilho do cursor
  const glow = EC.$('#glow');
  if (glow && !reduce && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => { glow.style.transform = `translate(${e.clientX - 200}px,${e.clientY - 200}px)`; glow.style.opacity = 1; }, { passive: true });
  }
  // ---- revelação ao rolar
  EC.ui.reveal = function (root) {
    const els = EC.$$('.reveal:not(.in)', root);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .08 });
    els.forEach(e => io.observe(e));
  };
  // ---- inclinação 3D nos cartões
  EC.ui.tilt = function (root) {
    if (reduce || !matchMedia('(pointer:fine)').matches) return;
    EC.$$('.tilt:not([data-tilt])', root).forEach(el => {
      el.dataset.tilt = '1';
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(700px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-3px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  };
  // ---- salto de dobra
  EC.warp = function (cb) {
    const w = EC.$('#warp');
    if (!w || reduce) { cb && cb(); return; }
    if (EC.audio) EC.audio.whoosh();
    w.classList.add('on');
    setTimeout(() => { cb && cb(); }, 320);
    setTimeout(() => w.classList.remove('on'), 800);
  };
  // ---- contador animado
  EC.countTo = function (el, n, dec) {
    if (!el) return;
    const from = parseFloat(el.dataset.v || '0') || 0; el.dataset.v = n;
    if (reduce) { el.textContent = EC.fmtNum(n, { maximumFractionDigits: dec || 0 }); return; }
    EC.tween(from, n, 700, v => { el.textContent = EC.fmtNum(dec ? v : Math.round(v), { maximumFractionDigits: dec || 0 }); });
  };
  // relógio UTC
  const clk = EC.$('#clock');
  if (clk) { const tick = () => { clk.textContent = new Date().toISOString().slice(11, 19); }; tick(); setInterval(tick, 1000); }
})();
