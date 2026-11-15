/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Estado, persistência (localStorage com tratamento de falha), insígnias e XP */
window.EC = window.EC || {};
EC.KEY = 'ecos-do-cosmos-v3';
EC.XP = { visit: 50, badge: 100, quizOk: 20 };
EC.state = { planet: 'moon', filter: 'all', q: '', visited: new Set(), badges: new Set(), flags: {}, xp: 0, quizBest: 0, name: '', currentId: null };

const has = (s, ids) => ids.every(i => s.visited.has(i));
EC.BADGES = [
  { id: 'first', icon: 'flag', test: s => s.visited.size >= 1 },
  { id: 'lunar', icon: 'moon', test: s => has(s, EC.ARTIFACTS.filter(a => a.planet === 'moon').map(a => a.id)) },
  { id: 'martian', icon: 'globe', test: s => has(s, EC.ARTIFACTS.filter(a => a.planet === 'mars').map(a => a.id)) },
  { id: 'apollo', icon: 'rocket', test: s => has(s, ['apollo11', 'apollo12', 'apollo14', 'apollo15', 'apollo16', 'apollo17']) },
  { id: 'rover', icon: 'truck', test: s => has(s, ['apollo15', 'apollo16', 'apollo17']) },
  { id: 'surveyor', icon: 'satellite', test: s => has(s, ['surveyor3', 'surveyor6']) },
  { id: 'pathfinder', icon: 'compass', test: s => has(s, ['pathfinder', 'sojourner']) },
  { id: 'twins', icon: 'users', test: s => has(s, ['spirit', 'opportunity']) },
  { id: 'cartographer', icon: 'map', test: s => !!s.flags.switched },
  { id: 'listener', icon: 'headphones', test: s => !!s.flags.audio },
  { id: 'narrator', icon: 'mic', test: s => !!s.flags.narrated },
  { id: 'timetraveler', icon: 'clock', test: s => !!s.flags.timeline },
  { id: 'quiz', icon: 'bulb', test: s => s.quizBest >= 7 },
  { id: 'complete', icon: 'trophy', test: s => s.visited.size >= EC.ARTIFACTS.length }
];
EC.badgeText = id => ((EC.T().badges || {})[id]) || { name: id, desc: '' };

EC.store = {
  load() {
    try {
      const raw = JSON.parse(EC.ls.get(EC.KEY, '{}') || '{}');
      (raw.visited || []).forEach(id => EC.byId(id) && EC.state.visited.add(id));
      (raw.badges || []).forEach(id => EC.state.badges.add(id));
      EC.state.flags = raw.flags || {};
      EC.state.xp = raw.xp || 0; EC.state.quizBest = raw.quizBest || 0; EC.state.name = raw.name || '';
      EC.state.serial = raw.serial || '';
    } catch (e) { }
  },
  save() {
    const s = EC.state;
    EC.ls.set(EC.KEY, JSON.stringify({ visited: [...s.visited], badges: [...s.badges], flags: s.flags, xp: s.xp, quizBest: s.quizBest, name: s.name, serial: s.serial || '' }));
  },
  reset() {
    const s = EC.state; s.visited.clear(); s.badges.clear(); s.flags = {}; s.xp = 0; s.quizBest = 0; s.serial = '';
    EC.store.save(); EC.bus.emit('progress');
  }
};
EC.allBadges = () => EC.state.badges.size >= EC.BADGES.length;
EC.rankIndex = function () {
  const n = EC.state.visited.size, th = [0, 3, 7, 12, 17];
  let i = 0; th.forEach((t, k) => { if (n >= t) i = k; });
  return i;
};
EC.rankName = () => EC.T().ranks[EC.rankIndex()];

EC.evalBadges = function () {
  const s = EC.state, fresh = [];
  EC.BADGES.forEach(b => { if (!s.badges.has(b.id) && b.test(s)) { s.badges.add(b.id); s.xp += EC.XP.badge; fresh.push(b); } });
  if (fresh.length) {
    EC.store.save();
    fresh.forEach((b, i) => setTimeout(() => {
      const t = EC.badgeText(b.id);
      EC.toast(EC.t('toast.unlocked'), t.name, b.icon);
      if (EC.audio) EC.audio.chime();
    }, i * 900));
    if (EC.allBadges()) setTimeout(() => EC.toast(EC.t('cert.btn'), EC.t('cert.unlocked'), 'cert'), fresh.length * 900 + 400);
    EC.bus.emit('badges', fresh);
  }
  EC.bus.emit('progress');
  return fresh;
};
EC.visit = function (id) {
  const s = EC.state;
  if (!s.visited.has(id)) { s.visited.add(id); s.xp += EC.XP.visit; EC.store.save(); }
  EC.evalBadges();
};
EC.flag = function (name) {
  if (EC.state.flags[name]) return;
  EC.state.flags[name] = true; EC.store.save(); EC.evalBadges();
};
EC.toast = function (title, msg, icon) {
  const box = EC.$('#toasts'); if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-ico">${EC.icon(icon || 'award')}</span><div><b class="label">${EC.esc(title)}</b><strong>${EC.esc(msg)}</strong></div>`;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 4200);
};
