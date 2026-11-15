/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Herói: textos, vídeo de fundo por corpo celeste, HUD de progresso */
window.EC = window.EC || {}; EC.ui = EC.ui || {};
EC.ui.hero = {
  render() {
    const p = EC.state.planet;
    const sub = EC.$('#heroSub'), tx = EC.$('#heroText');
    if (sub) sub.textContent = EC.t('hero.' + p + '.sub');
    if (tx) tx.textContent = EC.t('hero.' + p + '.text');
    const sb = EC.$('#acervoSub'); if (sb) sb.textContent = EC.t('arc.sub.' + p);
    this.videos(); this.hud();
  },
  videos() {
    const p = EC.state.planet, save = EC.safe(() => navigator.connection && navigator.connection.saveData, false);
    EC.$$('.hero-media video').forEach(v => {
      const act = v.dataset.planet === p;
      v.dataset.active = act;
      if (EC.reduceMotion() || save) { v.pause(); return; }
      if (act) { v.preload = 'auto'; const pr = v.play(); if (pr && pr.catch) pr.catch(() => { }); } else setTimeout(() => { if (v.dataset.active !== 'true') v.pause(); }, 900);
    });
  },
  hud() {
    const s = EC.state, total = EC.ARTIFACTS.length;
    EC.countTo(EC.$('#stRelics'), s.visited.size);
    const arts = EC.ARTIFACTS.filter(a => a.planet === s.planet);
    const yrs = arts.length ? Math.round(arts.reduce((x, a) => x + (new Date() - new Date(a.end)) / 31557600000, 0) / arts.length) : 0;
    EC.countTo(EC.$('#stSilence'), yrs); EC.countTo(EC.$('#stXP'), s.xp);
    const ri = EC.rankIndex(), th = [0, 3, 7, 12, 17], next = th[ri + 1];
    const r = EC.$('#hudRank'); if (r) r.textContent = EC.rankName();
    const nx = EC.$('#hudNext'); if (nx) nx.textContent = next != null ? EC.t('hud.next', { n: next - s.visited.size }) : EC.t('hud.max');
    const pct = Math.round(s.visited.size / total * 100);
    const bar = EC.$('#hudBar'); if (bar) bar.style.width = pct + '%';
    const wrap = EC.$('#hudBarWrap'); if (wrap) wrap.setAttribute('aria-valuenow', pct);
    const c = EC.$('#hudCount'); if (c) c.textContent = EC.t('hud.count', { n: s.visited.size, total, b: s.badges.size, bt: EC.BADGES.length });
    const bc = EC.$('#badgeCount'); if (bc) bc.textContent = s.badges.size;
  }
};
EC.bus.on('progress', () => EC.ui.hero.hud());
