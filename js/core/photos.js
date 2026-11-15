/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Fotos reais da NASA (domínio público) com fallback para as ilustrações locais.
   Ordem de preferência para cada artefato:
     1) assets/img/photos/index.json  (gerado por tools/fetch_nasa_photos.py, arquivos locais)
     2) busca ao vivo na NASA Image and Video Library (images-api.nasa.gov) quando o site está online
     3) ilustração original local (assets/img/artifacts e thumbs)                                   */
window.EC = window.EC || {};
EC.CFG = { livePhotos: true, cacheDays: 30, api: 'https://images-api.nasa.gov/search' };
EC.photos = { index: {}, started: false };
(function () {
  const CKEY = 'ec-photos-v2';
  const illus = (id, kind) => `assets/img/${kind === 'thumb' ? 'thumbs' : 'artifacts'}/${id}.webp`;

  EC.imgFor = function (id, kind) {
    const p = EC.photos.index[id];
    if (p) return kind === 'thumb' ? (p.thumb || p.url) : p.url;
    return illus(id, kind);
  };
  EC.photoInfo = id => EC.photos.index[id] || null;
  EC.imgFail = function (el) {
    const id = el.dataset.id, kind = el.dataset.kind;
    if (!id || el.dataset.failed) return;
    el.dataset.failed = '1';
    delete EC.photos.index[id];
    el.src = illus(id, kind);
    EC.bus.emit('photos');
  };
  EC.artImg = (id, kind, alt, extra) =>
    `<img src="${EC.esc(EC.imgFor(id, kind))}" data-id="${id}" data-kind="${kind}" alt="${EC.esc(alt || '')}" loading="lazy" decoding="async" onerror="EC.imgFail(this)" ${extra || ''}>`;

  function loadCache() { try { return JSON.parse(EC.ls.get(CKEY, '{}')) || {}; } catch (e) { return {}; } }
  function saveCache(c) { EC.ls.set(CKEY, JSON.stringify(c)); }

  function pick(json, must) {
    const re = must ? new RegExp(must, 'i') : null;
    const items = (json && json.collection && json.collection.items) || [];
    for (const it of items) {
      const d = (it.data && it.data[0]) || {};
      if (d.media_type && d.media_type !== 'image') continue;
      const thumb = it.links && it.links.find(l => l.render === 'image' || /~thumb/.test(l.href));
      if (!thumb) continue;
      if (re && !re.test((d.title || '') + ' ' + (d.description || '') + ' ' + ((d.keywords || []).join(' ')))) continue;
      const base = thumb.href.replace(/~(thumb|small|medium|large|orig)\.(jpg|png|jpeg)$/i, '');
      return {
        url: base + '~medium.jpg', thumb: base + '~small.jpg', title: d.title || '',
        credit: 'NASA' + (d.center ? ' / ' + d.center : ''), nasaId: d.nasa_id || '',
        link: d.nasa_id ? 'https://images.nasa.gov/details/' + encodeURIComponent(d.nasa_id) : 'https://images.nasa.gov/'
      };
    }
    return null;
  }
  EC.photos._pick = pick;

  async function live(ids) {
    const cache = loadCache(), now = Date.now(), ttl = EC.CFG.cacheDays * 864e5;
    const todo = [];
    ids.forEach(id => {
      const c = cache[id];
      if (c && now - c.t < ttl) { if (c.p) EC.photos.index[id] = c.p; } else todo.push(id);
    });
    if (Object.keys(EC.photos.index).length) EC.bus.emit('photos');
    let n = 0;
    async function worker() {
      while (todo.length) {
        const id = todo.shift(), q = EC.PHOTO_QUERIES[id]; if (!q) continue;
        try {
          const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 9000);
          const r = await fetch(`${EC.CFG.api}?q=${encodeURIComponent(q.q)}&media_type=image&page_size=25`, { signal: ctl.signal });
          clearTimeout(to);
          if (!r.ok) throw new Error('http ' + r.status);
          const p = pick(await r.json(), q.must);
          cache[id] = { t: Date.now(), p: p };
          if (p) { EC.photos.index[id] = p; if (++n % 3 === 0) EC.bus.emit('photos'); }
        } catch (e) { /* offline ou bloqueado: mantém a ilustração */ }
      }
    }
    await Promise.all([worker(), worker()]);
    saveCache(cache);
    EC.bus.emit('photos');
  }

  EC.photos.init = async function () {
    if (EC.photos.started) return; EC.photos.started = true;
    const params = EC.safe(() => new URLSearchParams(location.search), null);
    if (params && params.get('photos') === '0') return;
    try {
      const r = await fetch('assets/img/photos/index.json', { cache: 'no-cache' });
      if (r.ok) {
        const j = await r.json();
        Object.keys(j).forEach(id => {
          const e = j[id]; if (!e || !e.file) return;
          EC.photos.index[id] = { url: 'assets/img/photos/' + e.file, thumb: 'assets/img/photos/' + (e.thumb || e.file), title: e.title || '', credit: e.credit || 'NASA', nasaId: e.nasaId || '', link: e.link || 'https://images.nasa.gov/' };
        });
        EC.bus.emit('photos');
      }
    } catch (e) { }
    const missing = EC.ARTIFACTS.map(a => a.id).filter(id => !EC.photos.index[id]);
    const online = /^https?:$/.test(location.protocol) && navigator.onLine !== false;
    if (EC.CFG.livePhotos && online && missing.length && !(params && params.get('photos') === 'local')) live(missing);
  };
})();
