/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Utilidades gerais do namespace EC */
window.EC = window.EC || {};
EC.$ = (s, r) => (r || document).querySelector(s);
EC.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
EC.icon = (name, cls) => `<svg class="ico ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${EC.ICONS[name] || ''}"/></svg>`;
EC.hydrateIcons = function (root) {
  EC.$$('[data-ico]', root).forEach(el => {
    if (el.dataset.icoDone === el.dataset.ico) return;
    el.innerHTML = EC.icon(el.dataset.ico);
    el.dataset.icoDone = el.dataset.ico;
  });
};
EC.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
EC.rng = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
EC.bus = (function () {
  const m = {};
  return { on(e, f) { (m[e] = m[e] || []).push(f); }, emit(e, d) { (m[e] || []).forEach(f => { try { f(d); } catch (err) { console.error(err); } }); } };
})();
EC.safe = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };
EC.reduceMotion = () => EC.safe(() => matchMedia('(prefers-reduced-motion: reduce)').matches, false);
EC.tween = function (from, to, ms, step, done) {
  const t0 = performance.now();
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  (function f(now) {
    const t = Math.min(1, (now - t0) / ms);
    step(from + (to - from) * ease(t));
    if (t < 1) requestAnimationFrame(f); else if (done) done();
  })(t0);
};
EC.norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
EC.ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { } }
};
