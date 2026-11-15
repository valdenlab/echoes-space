/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* ÁUDIO GERADO POR IA: sintetizado em tempo real por código escrito com IA (sem arquivos de áudio gravados). Áudio ambiente sintetizado com WebAudio (sem arquivos) + efeitos de interface */
window.EC = window.EC || {};
EC.audio = (function () {
  let ctx = null, master = null, droneNodes = [], on = false, planet = 'moon';
  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    return true;
  }
  function buildDrone() {
    droneNodes.forEach(n => { try { n.stop(); } catch (e) { } }); droneNodes = [];
    const base = planet === 'mars' ? [48, 48.6, 72] : [55, 55.4, 82.5];
    base.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = i === 2 ? 'triangle' : 'sine'; o.frequency.value = f; g.gain.value = i === 2 ? .025 : .06;
      o.connect(g); g.connect(master); o.start(); droneNodes.push(o);
    });
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const n = ctx.createBufferSource(); n.buffer = buf; n.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = planet === 'mars' ? 700 : 380;
    const ng = ctx.createGain(); ng.gain.value = .03;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .08; lg.gain.value = 200;
    lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    n.connect(f); f.connect(ng); ng.connect(master); n.start(); droneNodes.push(n, lfo);
  }
  function tone(freq, dur, type, vol, when) {
    if (!ctx || !on) return;
    const t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .08, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + .05);
  }
  return {
    get on() { return on; },
    set(v) {
      if (v) {
        if (!ensure()) return false;
        if (ctx.state === 'suspended') ctx.resume();
        if (!droneNodes.length) buildDrone();
        master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(.55, ctx.currentTime + 1.2);
        on = true;
      } else if (ctx) {
        master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + .4); on = false;
      } else on = false;
      return on;
    },
    toggle() { return this.set(!on); },
    tune(p) { planet = p; if (ctx && on) { droneNodes.forEach(n => { try { n.stop(); } catch (e) { } }); droneNodes = []; buildDrone(); } },
    blip() { tone(planet === 'mars' ? 520 : 660, .12, 'square', .03); },
    tick() { tone(1400 + Math.random() * 300, .03, 'square', .012); },
    chime() { [660, 880, 1320].forEach((f, i) => tone(f, .7, 'sine', .07, i * .12)); },
    whoosh() {
      if (!ctx || !on) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(900, t + .6);
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.05, t + .2); g.gain.exponentialRampToValueAtTime(.0001, t + .7);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .8);
    }
  };
})();
