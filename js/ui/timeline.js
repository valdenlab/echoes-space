/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Linha do tempo cósmica: carrossel horizontal com miniaturas */
window.EC = window.EC || {}; EC.ui = EC.ui || {};
EC.ui.timeline = {
  init() {
    const sc = EC.$('#tlScroll'); if (!sc) return;
    const step = () => Math.max(260, sc.clientWidth * .7);
    EC.$('#tlPrev').addEventListener('click', () => sc.scrollBy({ left: -step(), behavior: 'smooth' }));
    EC.$('#tlNext').addEventListener('click', () => sc.scrollBy({ left: step(), behavior: 'smooth' }));
    sc.addEventListener('scroll', () => { if (sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 24) EC.flag('timeline'); }, { passive: true });
    sc.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) EC.openLog(b.dataset.open); });
    sc.addEventListener('keydown', e => { if (e.key === 'ArrowRight') sc.scrollBy({ left: 200, behavior: 'smooth' }); if (e.key === 'ArrowLeft') sc.scrollBy({ left: -200, behavior: 'smooth' }); });
  },
  render() {
    const sc = EC.$('#tlScroll'); if (!sc) return;
    const list = EC.arts().sort((a, b) => a.landing.localeCompare(b.landing) || a.name.localeCompare(b.name));
    sc.innerHTML = list.map(a => `
      <button type="button" class="tl-item ${a.planet === EC.state.planet ? 'on' : ''} ${EC.state.visited.has(a.id) ? 'seen' : ''}" data-open="${a.id}" aria-label="${EC.esc(EC.t('card.open', { name: a.name }))}">
        <span class="tl-year"><i></i>${a.landing.slice(0, 4)}</span>
        <span class="tl-card">${EC.artImg(a.id, 'thumb', '', 'width="480" height="270"')}<b>${EC.esc(a.name)}</b><small class="mono">${EC.t('planet.' + a.planet)} · ${EC.esc(EC.t('type.' + a.type))}</small></span>
      </button>`).join('');
  }
};
