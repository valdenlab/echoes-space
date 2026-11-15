/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Mapa interativo (SVG + textura) com marcadores, zoom, arrastar, ficha do alvo e lista de seleção */
window.EC = window.EC || {}; EC.ui = EC.ui || {};
EC.TYPE_META = {
  lander: { color: 'var(--accent)', icon: 'rocket' },
  rover: { color: '#34d399', icon: 'truck' },
  probe: { color: '#fbbf24', icon: 'satellite' },
  impact: { color: '#fb7185', icon: 'target' }
};
EC.typeLabel = a => EC.t('type.' + a.type) + (a.lrv ? EC.t('type.lrv') : '');
EC.ui.map = (function () {
  const NS = 'http://www.w3.org/2000/svg', W = 720, Hh = 360;
  let svg, vb = { x: 0, y: 0, w: W, h: Hh }, planet = null, selected = null, anim = 0;
  const project = (lon, lat) => [(lon + 180) * 2, (90 - lat) * 2];
  const setVB = () => { svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`); const k = vb.w / W; EC.$$('.mk', svg).forEach(g => g.setAttribute('transform', `translate(${g.dataset.x} ${g.dataset.y}) scale(${k})`)); };
  const clamp = () => { vb.w = Math.max(W / 8, Math.min(W, vb.w)); vb.h = vb.w / 2; vb.x = Math.max(0, Math.min(W - vb.w, vb.x)); vb.y = Math.max(0, Math.min(Hh - vb.h, vb.y)); };
  function fly(to, ms) {
    const from = Object.assign({}, vb); cancelAnimationFrame(anim);
    if (EC.reduceMotion()) { vb = Object.assign({}, to); clamp(); setVB(); return; }
    const t0 = performance.now();
    (function f(now) {
      let t = Math.min(1, (now - t0) / (ms || 600)); t = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      ['x', 'y', 'w', 'h'].forEach(k => vb[k] = from[k] + (to[k] - from[k]) * t); clamp(); setVB();
      if (t < 1) anim = requestAnimationFrame(f);
    })(t0);
  }
  function zoomBy(f, cx, cy) {
    cx = cx == null ? vb.x + vb.w / 2 : cx; cy = cy == null ? vb.y + vb.h / 2 : cy;
    const w = Math.max(W / 8, Math.min(W, vb.w * f)), h = w / 2;
    fly({ x: cx - (cx - vb.x) * (w / vb.w), y: cy - (cy - vb.y) * (h / vb.h), w, h }, 300);
  }
  function build() {
    const p = EC.state.planet; planet = p;
    svg.innerHTML = '';
    const mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
    svg.appendChild(mk('image', { href: `assets/img/maps/${p}-map.webp`, x: 0, y: 0, width: W, height: Hh, preserveAspectRatio: 'none' }));
    const grid = mk('g', { class: 'grid' });
    for (let lon = -180; lon <= 180; lon += 30) { const x = (lon + 180) * 2; grid.appendChild(mk('line', { x1: x, y1: 0, x2: x, y2: Hh })); }
    for (let lat = -90; lat <= 90; lat += 30) { const y = (90 - lat) * 2; grid.appendChild(mk('line', { x1: 0, y1: y, x2: W, y2: y })); }
    svg.appendChild(grid);
    EC.ARTIFACTS.filter(a => a.planet === p).forEach(a => {
      const off = a.off || [0, 0], [x, y] = project(a.lon + off[0], a.lat + off[1]);
      const meta = EC.TYPE_META[a.type], seen = EC.state.visited.has(a.id);
      const g = mk('g', { class: 'mk' + (seen ? ' seen' : '') + (EC.state.filter !== 'all' && !match(a) ? ' dim' : ''), 'data-id': a.id, 'data-x': x, 'data-y': y, tabindex: 0, role: 'button', 'aria-label': a.name });
      g.style.setProperty('--c', meta.color);
      g.appendChild(mk('circle', { class: 'pulse', r: 11 }));
      g.appendChild(mk('circle', { class: 'dot', r: 5.5 }));
      g.appendChild(mk('circle', { class: 'hit', r: 15 }));
      const t = mk('text', { class: 'lbl', x: 10, y: -8 }); t.textContent = a.name.split(' · ')[0]; g.appendChild(t);
      g.addEventListener('click', () => select(a.id, true));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(a.id, true); } });
      g.addEventListener('pointerenter', () => readout(a.id));
      g.addEventListener('pointerleave', () => readout(selected));
      svg.appendChild(g);
    });
    vb = { x: 0, y: 0, w: W, h: Hh }; setVB();
  }
  const match = a => { const f = EC.state.filter; return f === 'all' || (f === 'lander' && a.type === 'lander') || (f === 'rover' && (a.type === 'rover' || a.lrv)) || (f === 'probe' && (a.type === 'probe' || a.type === 'impact')); };
  function readout(id) {
    const el = EC.$('#mapReadout'); if (!el) return;
    const a = id && EC.art(id);
    el.innerHTML = a ? `${EC.t('map.target')}: <b class="accent">${EC.esc(a.name)}</b> · ${EC.esc(a.coords)} · ${EC.esc(a.site)}` : '';
  }
  function target(id) {
    const box = EC.$('#target'); if (!box) return;
    const a = EC.art(id);
    if (!a) { box.innerHTML = ''; return; }
    const seen = EC.state.visited.has(id), meta = EC.TYPE_META[a.type], ph = EC.photoInfo(id);
    box.innerHTML = `
      <div class="t-media">${EC.artImg(id, 'full', a.name)}<span class="chip-ill ${ph ? 'real' : ''}">${ph ? EC.t('photo.real') : EC.t('photo.illus')}</span></div>
      <div class="t-body">
        <p class="label">${EC.t('map.target')} · <span class="mono">${EC.esc(a.coords)}</span></p>
        <h3 class="display">${EC.esc(a.name)}</h3>
        <p class="t-sub">${EC.esc(a.sub)} · <span style="color:${meta.color}">${EC.esc(EC.typeLabel(a))}</span></p>
        <p class="stamp-inline"><i></i>${EC.t('status.badge')}</p>
        <dl class="t-dl"><div><dt>${EC.t('sp.landing')}</dt><dd>${EC.esc(a.landing)}</dd></div><div><dt>${EC.t('sp.duration')}</dt><dd>${EC.esc(a.dur)}</dd></div></dl>
        <p class="t-site">${EC.icon('pin')} ${EC.esc(a.site)}</p>
        <button class="btn primary" data-open="${id}">${EC.icon('book')}<span>${EC.t('target.open')}</span></button>
        ${seen ? `<span class="seen-tag">${EC.icon('check')} ${EC.t('target.seen')}</span>` : ''}
      </div>`;
  }
  function select(id, fl) {
    selected = id; if (EC.audio) EC.audio.blip();
    EC.$$('.mk', svg).forEach(g => g.classList.toggle('sel', g.dataset.id === id));
    EC.$$('#pickList button').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === id));
    target(id); readout(id);
    if (fl) { const g = EC.$(`.mk[data-id="${id}"]`, svg); if (g) { const x = +g.dataset.x, y = +g.dataset.y, w = W / 2.6; fly({ x: x - w / 2, y: y - w / 4, w, h: w / 2 }, 650); } }
  }
  function pickList() {
    const box = EC.$('#pickList'); if (!box) return;
    box.innerHTML = EC.arts().filter(a => a.planet === EC.state.planet).map(a => `<button type="button" class="chip" data-id="${a.id}" aria-pressed="${a.id === selected}">${EC.esc(a.name)}</button>`).join('');
  }
  function legend() {
    const box = EC.$('#mapLegend'); if (!box) return;
    box.innerHTML = Object.keys(EC.TYPE_META).filter(t => t !== 'impact' || EC.state.planet === 'moon').map(t => `<span><i style="background:${EC.TYPE_META[t].color}"></i>${EC.t('type.' + t)}</span>`).join('') + `<span><i class="ring"></i>${EC.t('legend.visited')}</span>`;
  }
  return {
    init() {
      svg = EC.$('#map'); if (!svg) return;
      let drag = null;
      svg.addEventListener('pointerdown', e => { if (e.target.closest('.mk')) return; drag = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y }; svg.setPointerCapture(e.pointerId); svg.classList.add('grab'); });
      svg.addEventListener('pointermove', e => { if (!drag) return; const r = svg.getBoundingClientRect(), s = vb.w / r.width; vb.x = drag.vx - (e.clientX - drag.x) * s; vb.y = drag.vy - (e.clientY - drag.y) * s; clamp(); setVB(); });
      const end = () => { drag = null; svg.classList.remove('grab'); };
      svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
      svg.addEventListener('wheel', e => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); const r = svg.getBoundingClientRect(); zoomBy(e.deltaY < 0 ? .8 : 1.25, vb.x + (e.clientX - r.left) / r.width * vb.w, vb.y + (e.clientY - r.top) / r.height * vb.h); }, { passive: false });
      EC.$('#zoomIn').addEventListener('click', () => zoomBy(.6)); EC.$('#zoomOut').addEventListener('click', () => zoomBy(1.6));
      EC.$('#zoomReset').addEventListener('click', () => fly({ x: 0, y: 0, w: W, h: Hh }, 500));
      EC.$('#pickList').addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (b) select(b.dataset.id, true); });
      EC.$('#target').addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) EC.openLog(b.dataset.open); });
    },
    render(force) {
      if (!svg) return;
      if (force || planet !== EC.state.planet) { selected = null; build(); pickList(); const first = EC.ARTIFACTS.find(a => a.planet === EC.state.planet); legend(); select(first.id, false); }
      else { build(); pickList(); legend(); select(selected && EC.byId(selected).planet === planet ? selected : EC.ARTIFACTS.find(a => a.planet === planet).id, false); }
    },
    select, refreshTarget() { if (selected) target(selected); }
  };
})();
