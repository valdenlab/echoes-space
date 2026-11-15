/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Certificado espacial (canvas → PNG / PDF / impressão), com todas as insígnias conquistadas.
   Sem logotipos, bandeiras ou emblemas da NASA. Arte gerada por código com auxílio de IA. */
window.EC = window.EC || {};
EC.cert = (function () {
  const W = 1600, H = 1130;
  const DISPLAY = "Orbitron, 'Segoe UI', 'Trebuchet MS', sans-serif", BODY = "Inter, 'Segoe UI', Arial, sans-serif", MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
  const GOLD = '#fbbf24', CY = '#22d3ee';

  function wrap(ctx, text, maxW) {
    const words = String(text).split(/\s+/), lines = []; let cur = '';
    words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }
  function planetBall(ctx, x, y, r, c1, c2, c3, seed) {
    const g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r);
    g.addColorStop(0, c1); g.addColorStop(.6, c2); g.addColorStop(1, c3);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    const rnd = EC.rng(seed);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    for (let i = 0; i < 16; i++) {
      const a = rnd() * 6.28, d = Math.sqrt(rnd()) * r * .85, cr = r * (.04 + rnd() * .12);
      const cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d;
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx - cr * .1, cy - cr * .1, cr, 3.5, 5.6); ctx.stroke();
    }
    const sh = ctx.createRadialGradient(x - r * .5, y - r * .5, r * .2, x, y, r * 1.1);
    sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,10,.65)'); ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }
  function medal(ctx, cx, cy, r, b, on) {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    if (on) { g.addColorStop(0, '#fde68a'); g.addColorStop(.5, '#f59e0b'); g.addColorStop(1, '#22d3ee'); } else { g.addColorStop(0, '#475569'); g.addColorStop(1, '#1e293b'); }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    const f = ctx.createRadialGradient(cx, cy - r * .3, r * .1, cx, cy, r * .88);
    f.addColorStop(0, '#16233d'); f.addColorStop(1, '#060b18'); ctx.fillStyle = f; ctx.beginPath(); ctx.arc(cx, cy, r * .84, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r * .72, 0, 7); ctx.stroke();
    ctx.save(); const s = r * 1.0 / 24 * 1.05; ctx.translate(cx - 12 * s, cy - 12 * s); ctx.scale(s, s);
    ctx.lineWidth = 1.9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = on ? '#fef3c7' : '#64748b';
    ctx.stroke(new Path2D(EC.ICONS[b.icon])); ctx.restore();
  }
  function ringText(ctx, text, cx, cy, r, a0, span) {
    const n = text.length; ctx.save(); ctx.translate(cx, cy);
    for (let i = 0; i < n; i++) { const a = a0 + span * (i / (n - 1)); ctx.save(); ctx.rotate(a); ctx.translate(0, -r); ctx.fillText(text[i], 0, 0); ctx.restore(); }
    ctx.restore();
  }
  function serial() {
    if (!EC.state.serial) { const d = new Date(); EC.state.serial = 'EC-' + d.getFullYear() + '-' + (Math.floor(Math.random() * 1679616) + 100000).toString(36).toUpperCase().slice(0, 5); EC.store.save(); }
    return EC.state.serial;
  }
  function draw(canvas) {
    const ctx = canvas.getContext('2d'); canvas.width = W; canvas.height = H;
    const name = (EC.state.name || '').trim() || EC.t('cert.name.def');
    // fundo
    const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#050914'); bg.addColorStop(.5, '#0a1226'); bg.addColorStop(1, '#0b0716');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    [[.18, .2, 520, 'rgba(34,211,238,.16)'], [.86, .3, 560, 'rgba(168,85,247,.14)'], [.7, .95, 600, 'rgba(251,113,60,.13)'], [.1, .9, 460, 'rgba(59,130,246,.12)']].forEach(([x, y, r, c]) => {
      const g = ctx.createRadialGradient(x * W, y * H, 0, x * W, y * H, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
    const rnd = EC.rng(2026);
    for (let i = 0; i < 520; i++) { const a = .25 + rnd() * .75, s = rnd() < .08 ? 2.4 : 1.2; ctx.fillStyle = `rgba(220,235,255,${a})`; ctx.fillRect(rnd() * W, rnd() * H, s, s); }
    // órbitas decorativas
    ctx.strokeStyle = 'rgba(34,211,238,.10)'; ctx.lineWidth = 2;
    [420, 560, 700].forEach(r => { ctx.beginPath(); ctx.ellipse(W / 2, H * .46, r * 1.3, r * .5, -.12, 0, 7); ctx.stroke(); });
    // planetas
    planetBall(ctx, 90, 1110, 140, '#d9d9d6', '#8d8d8a', '#25252a', 3);
    planetBall(ctx, 1520, 1110, 130, '#f0a070', '#b85a34', '#3a1810', 8);
    // moldura
    const fr = ctx.createLinearGradient(0, 0, W, H); fr.addColorStop(0, GOLD); fr.addColorStop(.5, CY); fr.addColorStop(1, GOLD);
    ctx.strokeStyle = fr; ctx.lineWidth = 6; ctx.strokeRect(34, 34, W - 68, H - 68);
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.strokeRect(52, 52, W - 104, H - 104);
    [[34, 34, 1, 1], [W - 34, 34, -1, 1], [34, H - 34, 1, -1], [W - 34, H - 34, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + sx * 70, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * 70); ctx.stroke();
      ctx.fillStyle = CY; ctx.beginPath(); ctx.arc(x + sx * 16, y + sy * 16, 5, 0, 7); ctx.fill();
    });
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    // cabeçalho
    ctx.fillStyle = CY; ctx.font = `600 22px ${MONO}`; ctx.letterSpacing = '6px';
    ctx.fillText(EC.t('cert.kicker').toUpperCase(), W / 2, 118);
    ctx.letterSpacing = '0px';
    const tg = ctx.createLinearGradient(300, 0, 1300, 0); tg.addColorStop(0, '#fde68a'); tg.addColorStop(.5, '#ffffff'); tg.addColorStop(1, '#67e8f9');
    ctx.fillStyle = tg; ctx.font = `900 68px ${DISPLAY}`; ctx.shadowColor = 'rgba(34,211,238,.55)'; ctx.shadowBlur = 24;
    let title = EC.t('cert.title').toUpperCase(), fs = 68;
    while (ctx.measureText(title).width > W - 520 && fs > 34) { fs -= 2; ctx.font = `900 ${fs}px ${DISPLAY}`; }
    ctx.fillText(title, W / 2, 205); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(203,213,225,.9)'; ctx.font = `400 26px ${BODY}`;
    ctx.fillText(EC.t('cert.presented'), W / 2, 268);
    // nome
    let nfs = 104; ctx.font = `700 ${nfs}px ${DISPLAY}`;
    while (ctx.measureText(name).width > W - 360 && nfs > 40) { nfs -= 4; ctx.font = `700 ${nfs}px ${DISPLAY}`; }
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(251,191,36,.5)'; ctx.shadowBlur = 20; ctx.fillText(name, W / 2, 372); ctx.shadowBlur = 0;
    const nw = Math.min(W - 320, ctx.measureText(name).width + 120);
    const ul = ctx.createLinearGradient(W / 2 - nw / 2, 0, W / 2 + nw / 2, 0); ul.addColorStop(0, 'rgba(251,191,36,0)'); ul.addColorStop(.5, GOLD); ul.addColorStop(1, 'rgba(251,191,36,0)');
    ctx.strokeStyle = ul; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 - nw / 2, 400); ctx.lineTo(W / 2 + nw / 2, 400); ctx.stroke();
    // texto
    ctx.fillStyle = '#e2e8f0'; ctx.font = `400 29px ${BODY}`;
    const body = EC.t('cert.body', { total: EC.ARTIFACTS.length, n: EC.BADGES.length });
    wrap(ctx, body, 1060).forEach((l, i) => ctx.fillText(l, W / 2, 452 + i * 40));
    // insígnias
    ctx.fillStyle = CY; ctx.font = `600 20px ${MONO}`; ctx.letterSpacing = '5px'; ctx.fillText(EC.t('cert.badges').toUpperCase(), W / 2, 574); ctx.letterSpacing = '0px';
    const earned = EC.BADGES.filter(b => EC.state.badges.has(b.id));
    const perRow = earned.length > 8 ? 7 : Math.max(1, earned.length), rows = Math.ceil(earned.length / perRow), gapX = 190, r = 52;
    earned.forEach((b, i) => {
      const row = Math.floor(i / perRow), inRow = Math.min(perRow, earned.length - row * perRow), col = i % perRow;
      const cx = W / 2 + (col - (inRow - 1) / 2) * gapX, cy = 640 + row * 150;
      medal(ctx, cx, cy, r, b, true);
      ctx.fillStyle = '#f1f5f9'; ctx.font = `600 17px ${BODY}`;
      wrap(ctx, EC.badgeText(b.id).name, 170).slice(0, 2).forEach((l, k) => ctx.fillText(l, cx, cy + r + 26 + k * 21));
    });
    // dados
    const by = 640 + (rows - 1) * 150 + 118;
    const stats = [[EC.t('cert.rank'), EC.rankName()], [EC.t('cert.xp'), EC.fmtNum(EC.state.xp) + ' XP'], [EC.t('stat.relics'), EC.state.visited.size + '/' + EC.ARTIFACTS.length], [EC.t('cert.date'), EC.fmtDate(new Date().toISOString().slice(0, 10))]];
    stats.forEach(([k, v], i) => {
      const x = W / 2 + (i - 1.5) * 330;
      ctx.fillStyle = 'rgba(148,163,184,.95)'; ctx.font = `500 16px ${MONO}`; ctx.fillText(k.toUpperCase(), x, by);
      ctx.fillStyle = GOLD; ctx.font = `700 25px ${DISPLAY}`;
      let t = v, f = 25; while (ctx.measureText(t).width > 300 && f > 14) { f--; ctx.font = `700 ${f}px ${DISPLAY}`; }
      ctx.fillText(t, x, by + 34);
    });
    // selo
    const sx = 150, sy = 172, sr = 60;
    const sg = ctx.createRadialGradient(sx, sy, 8, sx, sy, sr); sg.addColorStop(0, '#fde68a'); sg.addColorStop(1, '#b45309');
    ctx.fillStyle = sg; ctx.beginPath(); for (let i = 0; i < 48; i++) { const a = i / 48 * 6.283, rr = sr + (i % 2 ? -6 : 4); ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0b1226'; ctx.beginPath(); ctx.arc(sx, sy, sr - 16, 0, 7); ctx.fill();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, sr - 22, 0, 7); ctx.stroke();
    ctx.save(); ctx.translate(sx - 12 * 1.5, sy - 12 * 1.5 - 4); ctx.scale(1.5, 1.5); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#fde68a'; ctx.stroke(new Path2D(EC.ICONS.rocket)); ctx.restore();
    ctx.fillStyle = '#0b1226'; ctx.font = `700 12px ${MONO}`;
    ctx.save(); ctx.fillStyle = '#fef3c7'; ctx.font = `700 13px ${MONO}`; ringText(ctx, '★ MISSION COMPLETE ★', sx, sy + 5, sr - 2, -1.9, 3.8); ctx.restore();
    // rodapé
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 220, H - 152); ctx.lineTo(W / 2 + 220, H - 152); ctx.stroke();
    ctx.fillStyle = '#e2e8f0'; ctx.font = `italic 600 24px ${BODY}`; ctx.fillText(EC.t('cert.sign'), W / 2, H - 118);
    ctx.fillStyle = GOLD; ctx.font = `600 20px ${DISPLAY}`; ctx.fillText('“' + EC.t('cert.motto') + '”', W / 2, H - 84);
    ctx.fillStyle = 'rgba(148,163,184,.9)'; ctx.font = `400 15px ${MONO}`; ctx.textAlign = 'left';
    ctx.fillText(EC.t('cert.serial') + ' ' + serial(), 86, H - 70);
    ctx.textAlign = 'right';
    ctx.fillText(EC.t('wm.text') + ' · ' + EC.t('ai.nav') + ' (Claude, Anthropic)', W - 86, H - 70);
    ctx.textAlign = 'center';
  }
  function dataURL(type, q) { const c = EC.$('#certCanvas'); draw(c); return c.toDataURL(type, q); }
  function download(url, name) { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  function fileName(ext) { return 'certificado-ecos-do-cosmos-' + (EC.state.name || 'explorador').trim().toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.' + ext; }
  /* PDF mínimo (1 página A4 paisagem) com a imagem JPEG do certificado */
  function pdfBlob() {
    const jpg = atob(dataURL('image/jpeg', .93).split(',')[1]), n = jpg.length, bytes = new Uint8Array(n);
    for (let i = 0; i < n; i++) bytes[i] = jpg.charCodeAt(i);
    const pw = 842, ph = Math.round(842 * H / W), enc = new TextEncoder(), parts = [], offs = [];
    let len = 0; const push = d => { const u = typeof d === 'string' ? enc.encode(d) : d; parts.push(u); len += u.length; };
    push('%PDF-1.4\n');
    const obj = (i, body) => { offs[i] = len; push(`${i} 0 obj\n${body}\nendobj\n`); };
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
    offs[4] = len; push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${n} >>\nstream\n`); push(bytes); push('\nendstream\nendobj\n');
    const cs = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`; obj(5, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
    obj(6, '<< /Title (Certificate - Echoes of the Cosmos) /Producer (Generated with AI assistance: Claude, Anthropic) >>');
    const xr = len; push('xref\n0 7\n0000000000 65535 f \n'); for (let i = 1; i <= 6; i++) push(String(offs[i]).padStart(10, '0') + ' 00000 n \n');
    push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xr}\n%%EOF`);
    return new Blob(parts, { type: 'application/pdf' });
  }
  return {
    draw, pdfBlob,
    init() {
      const inp = EC.$('#certName'); if (!inp) return;
      let tm; inp.addEventListener('input', () => { EC.state.name = inp.value; EC.store.save(); clearTimeout(tm); tm = setTimeout(() => draw(EC.$('#certCanvas')), 120); });
      EC.$('#certPng').addEventListener('click', () => download(dataURL('image/png'), fileName('png')));
      EC.$('#certPdf').addEventListener('click', () => { const u = URL.createObjectURL(pdfBlob()); download(u, fileName('pdf')); setTimeout(() => URL.revokeObjectURL(u), 4000); });
      EC.$('#certPrint').addEventListener('click', () => {
        const u = dataURL('image/png'), w = window.open('', '_blank'); if (!w) { download(u, fileName('png')); return; }
        w.document.write(`<!doctype html><title>${EC.esc(EC.t('cert.title'))}</title><style>@page{size:A4 landscape;margin:0}body{margin:0;background:#000}img{width:100%;display:block}</style><img src="${u}" onload="setTimeout(function(){print()},200)">`); w.document.close();
      });
      EC.bus.on('lang', () => { if (EC.$('#certModal').classList.contains('open')) draw(EC.$('#certCanvas')); });
    },
    open() {
      if (!EC.allBadges()) return;
      EC.$('#certName').value = EC.state.name || '';
      EC.openOverlay('certModal'); draw(EC.$('#certCanvas'));
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw(EC.$('#certCanvas')));
    }
  };
})();
