/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Acervo: filtros, busca (sem acentos) e cartões */
window.EC = window.EC || {}; EC.ui = EC.ui || {};
EC.ui.archive = {
  init() {
    const q = EC.$('#q'); if (!q) return;
    q.addEventListener('input', () => { EC.state.q = q.value; this.grid(); });
    EC.$('#filters').addEventListener('click', e => { const b = e.target.closest('button[data-f]'); if (!b) return; EC.state.filter = b.dataset.f; this.filters(); this.grid(); EC.ui.map.render(true); });
    EC.$('#grid').addEventListener('click', e => { const c = e.target.closest('[data-open]'); if (c) EC.openLog(c.dataset.open); });
  },
  match(a) {
    const f = EC.state.filter;
    const ok = f === 'all' || (f === 'lander' && a.type === 'lander') || (f === 'rover' && (a.type === 'rover' || a.lrv)) || (f === 'probe' && (a.type === 'probe' || a.type === 'impact'));
    if (!ok) return false;
    const q = EC.norm(EC.state.q.trim()); if (!q) return true;
    return EC.norm([a.name, a.sub, a.site, a.crew, (a.instr || []).join(' ')].join(' ')).includes(q);
  },
  filters() {
    const box = EC.$('#filters'); if (!box) return;
    box.innerHTML = ['all', 'lander', 'rover', 'probe'].map(f => `<button type="button" class="chip" data-f="${f}" aria-pressed="${EC.state.filter === f}">${EC.t('f.' + f)}</button>`).join('');
  },
  grid() {
    const g = EC.$('#grid'); if (!g) return;
    const list = EC.arts().filter(a => a.planet === EC.state.planet && this.match(a));
    if (!list.length) { g.innerHTML = `<p class="empty">${EC.t('arc.empty')}</p>`; return; }
    g.innerHTML = list.map(a => {
      const seen = EC.state.visited.has(a.id), m = EC.TYPE_META[a.type], ph = EC.photoInfo(a.id);
      return `<article class="card tilt reveal in ${seen ? 'seen' : ''}" data-open="${a.id}" tabindex="0" role="button" aria-label="${EC.esc(EC.t('card.open', { name: a.name }))}">
        <div class="card-img">${EC.artImg(a.id, 'thumb', '', 'width="480" height="270"')}<span class="chip-ill ${ph ? 'real' : ''}">${ph ? EC.t('photo.real') : EC.t('photo.illus')}</span><span class="state ${seen ? 'ok' : ''}">${EC.icon(seen ? 'check' : 'lock')}${seen ? EC.t('card.seen') : EC.t('card.unseen')}</span></div>
        <div class="card-body"><h3>${EC.esc(a.name)}</h3><p class="sub">${EC.esc(a.sub)}</p>
          <p class="meta"><span style="color:${m.color}">${EC.icon(m.icon)} ${EC.esc(EC.typeLabel(a))}</span><span class="mono">${a.landing.slice(0, 4)}</span></p></div></article>`;
    }).join('');
    EC.ui.tilt(g);
    EC.$$('.card', g).forEach(c => c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); EC.openLog(c.dataset.open); } }));
  },
  render() { this.filters(); this.grid(); }
};
