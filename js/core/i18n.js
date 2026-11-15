/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Internacionalização estática (PT / EN / ES), sem dependências nem servidor. */
window.EC = window.EC || {};
EC.LANGS = [
  { code: 'pt', label: 'PT', name: 'Português', locale: 'pt-BR' },
  { code: 'en', label: 'EN', name: 'English', locale: 'en-US' },
  { code: 'es', label: 'ES', name: 'Español', locale: 'es-ES' }
];
EC.lang = 'pt';
EC.locale = () => (EC.LANGS.find(l => l.code === EC.lang) || EC.LANGS[0]).locale;
EC.t = function (key, vars) {
  const d = (EC.TEXT[EC.lang] && EC.TEXT[EC.lang].ui) || {};
  let s = d[key];
  if (s == null) s = (EC.TEXT.pt.ui || {})[key];
  if (s == null) return key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
};
EC.T = () => EC.TEXT[EC.lang];
EC.unit = (u, n) => { const p = EC.T().units[u]; return n === 1 ? p[0] : p[1]; };
EC.fmtNum = (n, o) => new Intl.NumberFormat(EC.locale(), o).format(n);
EC.fmtDate = (iso, o) => new Date(iso + 'T12:00:00Z').toLocaleDateString(EC.locale(), Object.assign({ year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }, o));
EC.fmtCoord = function (lat, lon, approx) {
  const f = v => EC.fmtNum(Math.abs(v), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ns = lat >= 0 ? 'N' : 'S', ew = lon >= 0 ? EC.t('dir.E') : EC.t('dir.W');
  return (approx ? '≈ ' : '') + f(lat) + '° ' + ns + ' · ' + f(lon) + '° ' + ew;
};
/* Une dados neutros + textos do idioma ativo */
EC.art = function (id) {
  const base = EC.ARTIFACTS.find(a => a.id === id);
  if (!base) return null;
  const tx = (EC.TEXT[EC.lang].art || {})[id] || (EC.TEXT.pt.art || {})[id] || {};
  return Object.assign({}, base, tx, { coords: EC.fmtCoord(base.lat, base.lon, base.approx) });
};
EC.arts = () => EC.ARTIFACTS.map(a => EC.art(a.id));
EC.byId = id => EC.ARTIFACTS.find(a => a.id === id);

EC.translateDom = function (root) {
  root = root || document;
  EC.$$('[data-i18n]', root).forEach(el => { el.textContent = EC.t(el.dataset.i18n); });
  EC.$$('[data-i18n-attr]', root).forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr.trim(), EC.t(key.trim()));
    });
  });
  document.title = EC.t('meta.title');
  const md = EC.$('meta[name="description"]'); if (md) md.content = EC.t('meta.desc');
  [['og:title', 'meta.title'], ['og:description', 'meta.desc']].forEach(([p, k]) => { const m = EC.$(`meta[property="${p}"]`); if (m) m.content = EC.t(k); });
};
EC.detectLang = function () {
  const codes = EC.LANGS.map(l => l.code);
  const q = EC.safe(() => new URLSearchParams(location.search).get('lang'), null);
  if (q && codes.includes(q.slice(0, 2).toLowerCase())) return q.slice(0, 2).toLowerCase();
  const s = EC.ls.get('ec-lang');
  if (s && codes.includes(s)) return s;
  const navs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'pt']);
  for (const n of navs) { const c = String(n).slice(0, 2).toLowerCase(); if (codes.includes(c)) return c; }
  return 'pt';
};
EC.renderLangSwitch = function () {
  EC.$$('[data-lang-switch]').forEach(box => {
    box.innerHTML = EC.LANGS.map(l => `<button type="button" data-lang="${l.code}" lang="${l.code}" title="${l.name}" aria-pressed="${l.code === EC.lang}">${l.label}</button>`).join('');
  });
};
EC.setLang = function (code, silent) {
  if (!EC.LANGS.some(l => l.code === code)) code = 'pt';
  EC.lang = code;
  EC.ls.set('ec-lang', code);
  document.documentElement.lang = EC.locale();
  document.documentElement.dataset.lang = code;
  EC.translateDom();
  EC.renderLangSwitch();
  if (!silent) EC.bus.emit('lang', code);
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-lang]');
  if (b && b.closest('[data-lang-switch]')) { EC.setLang(b.dataset.lang); }
});
