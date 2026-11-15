/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Orquestração: inicialização, troca de corpo celeste, áudio e renderização */
window.EC = window.EC || {};
EC.renderAll = function () {
  EC.ui.hero.render(); EC.ui.map.render(); EC.ui.timeline.render(); EC.ui.archive.render();
  EC.ui.compare.render(); EC.ui.quiz.render(); EC.ui.badges.render();
  EC.hydrateIcons(); EC.ui.reveal(); EC.ui.tilt(document);
};
EC.setPlanet = function (p, quiet) {
  if (p === EC.state.planet && !quiet) return;
  const apply = () => {
    EC.state.planet = p; document.body.dataset.planet = p;
    EC.$('#btnMoon').setAttribute('aria-pressed', p === 'moon'); EC.$('#btnMars').setAttribute('aria-pressed', p === 'mars');
    EC.state.filter = 'all'; EC.state.q = ''; const q = EC.$('#q'); if (q) q.value = '';
    if (EC.audio) EC.audio.tune(p);
    EC.renderAll();
  };
  const changed = p !== EC.state.planet;
  if (changed && !quiet) { EC.warp(apply); EC.flag('switched'); } else apply();
};
EC.updateAudioButton = function () {
  const b = EC.$('#btnAudio'); if (!b) return;
  b.setAttribute('aria-pressed', EC.audio.on); b.querySelector('[data-ico]').dataset.ico = EC.audio.on ? 'sound' : 'mute'; EC.hydrateIcons(b);
  b.setAttribute('title', EC.t(EC.audio.on ? 'audio.on' : 'audio.off'));
};
EC.setAudio = function (v) { EC.audio.set(v); EC.audio.tune(EC.state.planet); EC.updateAudioButton(); if (EC.audio.on) EC.flag('audio'); };

document.addEventListener('DOMContentLoaded', function () {
  EC.store.load();
  EC.setLang(EC.detectLang(), true);
  EC.hydrateIcons();
  EC.ui.map.init(); EC.ui.timeline.init(); EC.ui.archive.init(); EC.ui.badges.init(); EC.cert.init(); EC.initModalKeys();
  EC.$('#btnMoon').onclick = () => EC.setPlanet('moon'); EC.$('#btnMars').onclick = () => EC.setPlanet('mars');
  EC.$('#btnAudio').onclick = () => EC.setAudio(!EC.audio.on);
  EC.$('#btnBadges').onclick = () => EC.ui.badges.open();
  EC.$('#btnRandom').onclick = () => { const l = EC.ARTIFACTS.filter(a => a.planet === EC.state.planet); EC.openLog(l[Math.floor(Math.random() * l.length)].id); };
  EC.bus.on('lang', () => { EC.renderAll(); EC.updateAudioButton(); });
  EC.bus.on('photos', () => { EC.ui.timeline.render(); EC.ui.archive.grid(); EC.ui.map.refreshTarget(); EC.refreshLogMedia(); });
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a && a.getAttribute('href').length > 1 && !a.getAttribute('href').startsWith('#/')) { const t = EC.$(a.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: EC.reduceMotion() ? 'auto' : 'smooth' }); } } });
  EC.renderAll(); EC.updateAudioButton(); EC.ui.intro.run(); EC.route();
  EC.photos.init();
});
