/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Comparador Planejado × Real (Marte) */
window.EC = window.EC || {}; EC.ui = EC.ui || {};
EC.ui.compare = {
  render() {
    const box = EC.$('#cmp'); if (!box) return;
    const rows = EC.ARTIFACTS.filter(a => a.planet === 'mars' && a.planned).map(a => {
      const days = Math.max(1, Math.round((new Date(a.end) - new Date(a.landing)) / 864e5));
      return { a: EC.art(a.id), planned: a.planned, days, x: days / a.planned };
    });
    const max = Math.max(...rows.map(r => r.days));
    const sq = v => Math.sqrt(v / max) * 100;
    box.innerHTML = rows.map(r => `
      <div class="cmp-row" data-open="${r.a.id}" tabindex="0" role="button">
        <div class="cmp-name"><b>${EC.esc(r.a.name)}</b><span class="mono">×${EC.fmtNum(r.x, { maximumFractionDigits: 1 })}</span></div>
        <div class="bar planned"><i style="width:${sq(r.planned)}%"></i><span>${EC.t('cmp.planned')}: ${EC.fmtNum(r.planned)} ${EC.t('cmp.days')}</span></div>
        <div class="bar actual"><i style="width:${sq(r.days)}%"></i><span>${EC.t('cmp.actual')}: ${EC.fmtNum(r.days)} ${EC.t('cmp.days')}</span></div>
      </div>`).join('') + `<p class="note">${EC.t('cmp.note')}</p>`;
    EC.$$('.cmp-row', box).forEach(r => { r.onclick = () => EC.openLog(r.dataset.open); r.onkeydown = e => { if (e.key === 'Enter') EC.openLog(r.dataset.open); }; });
  }
};
