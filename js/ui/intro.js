/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Introdução (boot de controle de missão) */
window.EC = window.EC || {}; EC.ui = EC.ui || {};
EC.ui.intro = {
  skip() { return /^#\/a\//.test(location.hash) || EC.safe(() => new URLSearchParams(location.search).get('intro') === '0', false) || EC.safe(() => sessionStorage.getItem('ec-intro') === '1', false); },
  hide(sound) {
    const el = EC.$('#intro'); if (!el) return;
    EC.safe(() => sessionStorage.setItem('ec-intro', '1'));
    if (sound) { EC.setAudio(true); }
    el.classList.add('out'); setTimeout(() => { el.style.display = 'none'; }, 700);
    document.body.classList.remove('lock');
    EC.ui.hero.videos();
  },
  run() {
    const el = EC.$('#intro'); if (!el) return;
    if (this.skip()) { el.style.display = 'none'; return; }
    document.body.classList.add('lock');
    const boot = EC.$('#boot'); const lines = ['intro.b1', 'intro.b2', 'intro.b3', 'intro.b4']; boot.innerHTML = '';
    lines.forEach((k, i) => setTimeout(() => { const d = document.createElement('div'); d.innerHTML = `<span class="ok">[ OK ]</span> ${EC.esc(EC.t(k))}`; boot.appendChild(d); if (EC.audio && EC.audio.on) EC.audio.tick(); }, EC.reduceMotion() ? 0 : 350 + i * 450));
    EC.$('#introSound').onclick = () => this.hide(true);
    EC.$('#introMute').onclick = () => this.hide(false);
    EC.bus.on('lang', () => { boot.innerHTML = lines.map(k => `<div><span class="ok">[ OK ]</span> ${EC.esc(EC.t(k))}</div>`).join(''); });
    setTimeout(() => { const b = EC.$('#introSound'); if (b) b.focus({ preventScroll: true }); }, 100);
  }
};
