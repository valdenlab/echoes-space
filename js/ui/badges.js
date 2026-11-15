/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Painel de insígnias + acesso ao certificado */
window.EC = window.EC || {}; EC.ui = EC.ui || {};
EC.ui.badges = {
  init() {
    const reset = EC.$('#btnReset');
    if (reset) reset.addEventListener('click', () => { if (confirm(EC.t('badges.confirm'))) { EC.store.reset(); EC.renderAll(); this.render(); } });
    const cta = EC.$('#certCta');
    if (cta) cta.addEventListener('click', e => { if (e.target.closest('#certOpen')) EC.cert.open(); });
    EC.bus.on('badges', () => this.render());
  },
  render() {
    const g = EC.$('#badgeGrid'); if (!g) return;
    g.innerHTML = EC.BADGES.map(b => {
      const t = EC.badgeText(b.id), on = EC.state.badges.has(b.id);
      return `<div class="badge ${on ? 'on' : ''}" title="${EC.esc(t.desc)}"><span class="medal">${EC.icon(on ? b.icon : 'lock')}</span><b>${EC.esc(t.name)}</b><small>${EC.esc(t.desc)}</small><em class="label">${on ? EC.t('badges.earned') : EC.t('badges.locked')}</em></div>`;
    }).join('');
    const cta = EC.$('#certCta'), n = EC.state.badges.size, tot = EC.BADGES.length;
    if (cta) cta.innerHTML = EC.allBadges()
      ? `<div class="cert-cta-in ok"><span class="medal big">${EC.icon('cert')}</span><div><b class="display">${EC.t('cert.title')}</b><p>${EC.t('cert.progress', { n, total: tot })}</p></div><button class="btn primary" id="certOpen">${EC.icon('award')}<span>${EC.t('cert.btn')}</span></button></div>`
      : `<div class="cert-cta-in"><span class="medal big">${EC.icon('lock')}</span><div><b class="display">${EC.t('cert.title')}</b><p>${EC.t('cert.locked', { total: tot })}</p><div class="progress"><i style="width:${n / tot * 100}%"></i></div><p class="label">${EC.t('cert.progress', { n, total: tot })}</p></div></div>`;
  },
  open() { this.render(); EC.openOverlay('badgeModal'); }
};
