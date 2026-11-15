// Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md 
// Valida paridade de chaves entre PT/EN/ES e a cobertura dos 17 artefatos. Uso: node tools/check_i18n.js
const fs = require('fs'), path = require('path');
global.window = {}; global.EC = undefined;
const root = path.join(__dirname, '..');
const load = f => { const s = fs.readFileSync(path.join(root, f), 'utf8'); new Function('window', 'EC', s.replace(/window\.EC\s*=\s*window\.EC\s*\|\|\s*\{\};?/g, ''))(global.window, global.window.EC); };
global.window.EC = {}; ['js/data/artifacts.js', 'js/i18n/art.pt.js', 'js/i18n/art.en.js', 'js/i18n/art.es.js', 'js/i18n/ui.pt.js', 'js/i18n/ui.en.js', 'js/i18n/ui.es.js'].forEach(f => { const s = fs.readFileSync(path.join(root, f), 'utf8'); new Function('window', 'EC', s.replace(/window\.EC\s*=\s*window\.EC\s*\|\|\s*\{\};?/g, ''))(global.window, global.window.EC); });
const EC = global.window.EC; let bad = 0; const err = m => { console.log('ERRO:', m); bad++; };
const keys = l => Object.keys(EC.TEXT[l].ui).sort();
['en', 'es'].forEach(l => { const a = keys('pt'), b = keys(l); a.filter(k => !b.includes(k)).forEach(k => err(`${l}: falta ${k}`)); b.filter(k => !a.includes(k)).forEach(k => err(`${l}: sobra ${k}`)); });
const F = ['sub', 'site', 'launch', 'landing', 'dur', 'mass', 'crew', 'instr', 'ach', 'tl', 'endLabel', 'log', 'fun'];
['pt', 'en', 'es'].forEach(l => EC.ARTIFACTS.forEach(a => { const t = EC.TEXT[l].art[a.id]; if (!t) return err(`${l}: artefato ${a.id} ausente`); F.forEach(f => { if (!t[f] || (Array.isArray(t[f]) && !t[f].length)) err(`${l}/${a.id}: campo ${f}`); }); if (a.lrv && !(t.lrv && t.lrv.mass)) err(`${l}/${a.id}: lrv`); }));
['pt', 'en', 'es'].forEach(l => { if (EC.TEXT[l].quiz.length !== EC.QUIZ_ANSWERS.length) err(`${l}: quiz`); EC.BADGES; Object.keys(EC.TEXT.pt.badges).forEach(k => { if (!EC.TEXT[l].badges[k]) err(`${l}: insígnia ${k}`); }); });
// chaves usadas no HTML/JS existem?
const used = new Set(); const grab = f => { const s = fs.readFileSync(f, 'utf8'); (s.match(/(?:data-i18n="|aria-label:|placeholder:|EC\.t\(')([\w.]+)/g) || []).forEach(m => used.add(m.replace(/.*[":(']/, ''))); (s.match(/data-i18n-attr="[^"]+"/g) || []).forEach(m => m.slice(16, -1).split(';').forEach(p => used.add(p.split(':')[1]))); };
grab(path.join(root, 'index.html')); (function walk(d) { fs.readdirSync(d).forEach(n => { const p = path.join(d, n); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith('.js') && !p.includes('i18n')) grab(p); }); })(path.join(root, 'js'));
const skip = /^(planet|f|type|hero|arc\.sub|quiz\.r|dir|status)\.$/;
used.forEach(k => { if (k && !EC.TEXT.pt.ui[k] && !/\.$/.test(k)) err('chave usada sem tradução: ' + k); });
console.log(bad ? `${bad} problema(s)` : `OK: ${keys('pt').length} chaves de interface × 3 idiomas, ${EC.ARTIFACTS.length} artefatos × 3 idiomas, ${EC.QUIZ_ANSWERS.length} perguntas`);
process.exit(bad ? 1 : 0);
