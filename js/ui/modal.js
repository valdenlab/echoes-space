/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Diário Oficial de Bordo (modal), sobreposições, rotas por hash e narração */
window.EC = window.EC || {};
(function () {
  let typer = null, speaking = false, suppress = false, last = null, tick = null;
  const open = () => EC.$$('.overlay.open');

  EC.openOverlay = function (id) {
    const o = EC.$('#' + id); if (!o) return;
    last = document.activeElement; o.classList.add('open'); o.scrollTop = 0; document.body.style.overflow = 'hidden';
    const c = EC.$('[data-close]', o); if (c) setTimeout(() => c.focus({ preventScroll: true }), 50);
  };
  EC.closeOverlays = function (keepHash) {
    const wasLog = EC.$('#logModal').classList.contains('open');
    open().forEach(o => o.classList.remove('open'));
    document.body.style.overflow = '';
    stopNarration(); clearInterval(typer); clearInterval(tick);
    EC.$$('#logContent video').forEach(v => v.pause());
    if (wasLog && !keepHash && /^#\/a\//.test(location.hash)) { suppress = true; history.replaceState(null, '', location.pathname + location.search); setTimeout(() => suppress = false, 0); }
    if (last && last.focus) try { last.focus({ preventScroll: true }); } catch (e) { }
    EC.state.currentId = null;
  };
  EC.silenceSince = function (iso) {
    const a = new Date(iso + 'T12:00:00Z'), b = new Date();
    let y = b.getUTCFullYear() - a.getUTCFullYear(), m = b.getUTCMonth() - a.getUTCMonth(), d = b.getUTCDate() - a.getUTCDate();
    if (d < 0) { m--; d += new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0)).getUTCDate(); }
    if (m < 0) { y--; m += 12; }
    return { y, m, d };
  };
  function silenceText(iso) {
    const s = EC.silenceSince(iso), p = [];
    if (s.y) p.push(s.y + ' ' + EC.unit('year', s.y)); if (s.m) p.push(s.m + ' ' + EC.unit('month', s.m)); if (s.d || !p.length) p.push(s.d + ' ' + EC.unit('day', s.d));
    return p.join(', ');
  }
  function stopNarration() { if (speaking && window.speechSynthesis) speechSynthesis.cancel(); speaking = false; const b = EC.$('#btnNarrate'); if (b) { b.innerHTML = EC.icon('headphones') + '<span>' + EC.t('log.narrate') + '</span>'; } }
  function narrate(a) {
    if (!window.speechSynthesis) return;
    if (speaking) { stopNarration(); return; }
    const u = new SpeechSynthesisUtterance(a.log.split('\n').slice(1).join('\n').trim());
    u.lang = EC.locale(); u.rate = .95; u.onend = u.onerror = () => stopNarration();
    speechSynthesis.cancel(); speechSynthesis.speak(u); speaking = true; EC.flag('narrated');
    const b = EC.$('#btnNarrate'); if (b) b.innerHTML = EC.icon('stop') + '<span>' + EC.t('log.narrate.stop') + '</span>';
  }
  function typewrite(el, text) {
    clearInterval(typer);
    if (EC.reduceMotion()) { el.textContent = text; return; }
    let i = 0; el.classList.add('typing'); el.textContent = '';
    typer = setInterval(() => {
      i += 3; el.textContent = text.slice(0, i); if (i % 12 === 0 && EC.audio) EC.audio.tick();
      if (i >= text.length) { clearInterval(typer); el.classList.remove('typing'); el.textContent = text; const sk = EC.$('#btnSkip'); if (sk) sk.hidden = true; }
    }, 16);
  }
  function mediaHTML(a) {
    const ph = EC.photoInfo(a.id);
    const vid = `<video id="logVideo" src="assets/video/clips/${a.id}.mp4" poster="assets/img/thumbs/${a.id}.webp" muted loop playsinline ${EC.reduceMotion() ? '' : 'autoplay'}></video>`;
    if (!ph) return { html: vid, toggle: '', credit: `<span class="credit">${EC.icon('spark')} ${EC.t('photo.illus')}</span>` };
    return {
      html: `<img id="logPhoto" data-id="${a.id}" data-kind="full" src="${EC.esc(ph.url)}" alt="${EC.esc(ph.title || a.name)}" onerror="EC.imgFail(this);EC.renderLog()" />` + vid.replace('<video', '<video hidden'),
      toggle: `<div class="seg mini" role="group" aria-label="${EC.t('photo.view')}"><button data-view="photo" aria-pressed="true">${EC.icon('image')}<span>${EC.t('photo.real')}</span></button><button data-view="anim" aria-pressed="false">${EC.icon('film')}<span>${EC.t('photo.anim')}</span></button></div>`,
      credit: `<a class="credit" href="${EC.esc(ph.link)}" target="_blank" rel="noopener">${EC.icon('image')} ${EC.t('photo.credit', { c: EC.esc(ph.credit) })}</a>`
    };
  }
  function bindView() {
    const box = EC.$('#logContent');
    EC.$$('[data-view]', box).forEach(b => b.onclick = () => {
      const ph = b.dataset.view === 'photo';
      EC.$$('[data-view]', box).forEach(x => x.setAttribute('aria-pressed', x === b));
      const img = EC.$('#logPhoto'), v = EC.$('#logVideo'); if (img) img.hidden = !ph; if (v) { v.hidden = ph; if (!ph) v.play().catch(() => { }); else v.pause(); }
    });
  }
  /* chega foto real depois que o diário já abriu: troca só a mídia, sem reiniciar o texto */
  EC.refreshLogMedia = function () {
    const id = EC.state.currentId, box = EC.$('#logContent'); if (!id || !EC.$('#logModal').classList.contains('open') || EC.$('#logPhoto') || !EC.photoInfo(id)) return;
    const m = mediaHTML(EC.art(id)), mm = EC.$('.log-media', box), cr = EC.$('#capR', box); if (!mm || !cr) return;
    mm.innerHTML = m.html; cr.innerHTML = m.toggle + m.credit; bindView();
    const note = EC.$('.panel .note', box); if (note) note.remove();
  };
  EC.renderLog = function () {
    const id = EC.state.currentId; if (!id) return;
    const a = EC.art(id), box = EC.$('#logContent'), ids = EC.ARTIFACTS.map(x => x.id), i = ids.indexOf(id);
    const m = mediaHTML(a), spec = (k, v) => `<div class="spec"><span>${k}</span><span>${EC.esc(v)}</span></div>`;
    const lines = a.log.split('\n'), head = lines[0], text = lines.slice(1).join('\n').trim();
    box.innerHTML = `
      <div class="log-hero"><div class="log-media">${m.html}</div>
        <div class="log-top"><span class="stamp">${EC.t('status.badge')}</span><button class="close-btn" data-close aria-label="${EC.t('log.close')}">${EC.icon('close')}</button></div>
        <div class="cap"><div><p class="label">${EC.t('log.title')} · ${EC.t('log.reg')} ${id.toUpperCase()}</p><h2 id="logTitle">${EC.esc(a.name)}</h2><p class="sub">${EC.esc(a.sub)} · ${EC.esc(a.site)}</p></div><div class="cap-r" id="capR">${m.toggle}${m.credit}</div></div>
      </div>
      <div class="log-body">
        <div>
          <h4 class="h3l">${EC.icon('info')}${EC.t('log.specs')}</h4>
          ${spec(EC.t('sp.launch'), a.launch)}${spec(EC.t('sp.landing'), a.landing)}${spec(EC.t('sp.end'), EC.fmtDate(a.end))}${spec(EC.t('sp.duration'), a.dur)}${spec(EC.t('sp.mass'), a.mass)}${spec(EC.t('sp.crew'), a.crew)}${spec(EC.t('sp.coords'), a.coords)}
          <h4 class="h3l">${EC.icon('target')}${EC.t('log.instr')}</h4><div class="tags">${(a.instr || []).map(x => `<span class="chip">${EC.esc(x)}</span>`).join('')}</div>
          <h4 class="h3l">${EC.icon('trophy')}${EC.t('log.ach')}</h4><ul class="ach">${(a.ach || []).map(x => `<li>${EC.icon('check')}<span>${EC.esc(x)}</span></li>`).join('')}</ul>
          ${a.lrv && a.lrv.mass ? `<div class="lrv-box panel"><h4 class="h3l">${EC.icon('truck')}${EC.t('log.lrv')}</h4><div class="grid2">${spec(EC.t('lrv.mass'), a.lrv.mass)}${spec(EC.t('lrv.dist'), a.lrv.dist)}${spec(EC.t('lrv.time'), a.lrv.time)}${spec(EC.t('lrv.speed'), a.lrv.speed)}</div></div>` : ''}
        </div>
        <div>
          <h4 class="h3l">${EC.icon('book')}${EC.t('log.diary')}</h4>
          <div class="entry-bar"><span class="chip mono">${EC.esc(head)}</span><button class="btn" id="btnNarrate">${EC.icon('headphones')}<span>${EC.t('log.narrate')}</span></button><button class="btn" id="btnSkip">${EC.icon('skip')}<span>${EC.t('log.skip')}</span></button><button class="btn" id="btnShare">${EC.icon('link')}<span>${EC.t('log.share')}</span></button></div>
          <div class="entry" id="entry" aria-live="off"></div>
          <p class="note">${EC.t('log.dramatized')}</p>
          <h4 class="h3l">${EC.icon('timeline')}${EC.t('log.timeline')}</h4>
          <ul class="tl">${(a.tl || []).map(([d, t]) => `<li><b>${EC.esc(d)}</b><span>${EC.esc(t)}</span></li>`).join('')}</ul>
        </div>
      </div>
      <div class="log-foot">
        <div class="panel silence"><p class="label">${EC.icon('clock')} ${EC.esc(a.endLabel)}</p><div class="big" id="silBig">${silenceText(a.end)}</div><div class="tick" id="silTick">00:00:00 UTC</div></div>
        <div class="panel"><p class="label">${EC.icon('bulb')} ${EC.t('log.fun')}</p><p style="margin-top:6px;font-size:.92rem;color:var(--text-2)">${EC.esc(a.fun)}</p>${m.credit.includes('href') ? '' : `<p class="note">${EC.t('photo.illus.note')}</p>`}</div>
        <div class="panel signal"><video src="assets/video/hero/signal-lost.mp4" muted loop playsinline ${EC.reduceMotion() ? '' : 'autoplay'}></video><span class="chip lbl">${EC.t('log.signal')}</span></div>
      </div>
      <div class="log-nav"><button class="btn" id="logPrev">${EC.icon('prev')}<span>${EC.t('log.prev')}</span></button><span class="label">${EC.t('log.silent')}</span><button class="btn" id="logNext"><span>${EC.t('log.next')}</span>${EC.icon('next')}</button></div>`;
    typewrite(EC.$('#entry'), text);
    clearInterval(tick); const st = () => { const el = EC.$('#silTick'); if (el) el.textContent = new Date().toISOString().slice(11, 19) + ' UTC'; }; st(); tick = setInterval(st, 1000);
    const go = d => { const nid = ids[(i + d + ids.length) % ids.length]; stopNarration(); EC.openLog(nid, { keep: true }); };
    EC.$('#logPrev').onclick = () => go(-1); EC.$('#logNext').onclick = () => go(1);
    EC.$('#btnNarrate').onclick = () => narrate(a);
    EC.$('#btnSkip').onclick = () => { clearInterval(typer); const e = EC.$('#entry'); e.classList.remove('typing'); e.textContent = text; EC.$('#btnSkip').hidden = true; };
    EC.$('#btnShare').onclick = () => { const u = location.origin + location.pathname + '?lang=' + EC.lang + '#/a/' + id; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).catch(() => { }).finally(() => EC.toast(EC.t('log.share'), EC.t('log.copied'), 'link')); };
    bindView();
    if (!EC.reduceMotion()) EC.$$('video', box).forEach(v => { const p = v.play(); if (p && p.catch) p.catch(() => { }); });
  };
  EC.openLog = function (id, o) {
    if (!EC.byId(id)) return;
    EC.state.currentId = id; EC.renderLog(); EC.openOverlay('logModal');
    EC.$('#logModal').scrollTop = 0; if (EC.audio) EC.audio.blip();
    const h = '#/a/' + id; if (location.hash !== h) { suppress = true; history.pushState(null, '', location.pathname + location.search + h); setTimeout(() => suppress = false, 0); }
    EC.visit(id);
    EC.ui.map.refreshTarget(); EC.ui.archive.grid(); EC.ui.timeline.render();
  };
  EC.route = function () {
    if (suppress) return;
    const h = location.hash, a = h.match(/^#\/a\/([\w-]+)/), p = h.match(/^#\/p\/(moon|mars)/);
    if (a && EC.byId(a[1])) { if (EC.state.planet !== EC.byId(a[1]).planet) EC.setPlanet(EC.byId(a[1]).planet, true); EC.openLog(a[1], { fromHash: true }); }
    else if (p) { EC.closeOverlays(true); EC.setPlanet(p[1], true); }
    else if (EC.$('#logModal').classList.contains('open')) EC.closeOverlays(true);
  };
  EC.initModalKeys = function () {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open().length) { EC.closeOverlays(); return; }
      if (EC.$('#logModal').classList.contains('open') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        if (e.key === 'ArrowRight') EC.$('#logNext').click(); if (e.key === 'ArrowLeft') EC.$('#logPrev').click();
      }
    });
    document.addEventListener('click', e => {
      if (e.target.classList && e.target.classList.contains('overlay')) EC.closeOverlays();
      else if (e.target.closest('[data-close]')) EC.closeOverlays();
    });
    addEventListener('hashchange', EC.route);
    addEventListener('popstate', EC.route);
    EC.bus.on('lang', () => { if (EC.$('#logModal').classList.contains('open')) EC.renderLog(); });
  };
})();
