/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Desafio da Missão: quiz de 10 perguntas */
window.EC = window.EC || {}; EC.ui = EC.ui || {};
EC.ui.quiz = (function () {
  let i = 0, score = 0, answered = false, done = false;
  function view() {
    const box = EC.$('#quiz'); if (!box) return;
    const Q = EC.T().quiz, total = Q.length;
    if (done) {
      const msg = score === total ? 'perfect' : score >= 7 ? 'good' : 'try';
      box.innerHTML = `<div class="q-end"><p class="label">${EC.t('quiz.result')}</p><div class="q-big display">${score}<small>/${total}</small></div><p>${EC.t('quiz.r.' + msg)}</p><p class="label">${EC.t('quiz.best', { n: EC.state.quizBest, total })}</p><button class="btn primary" id="qAgain">${EC.icon('replay')}<span>${EC.t('quiz.again')}</span></button></div>`;
      EC.$('#qAgain').onclick = () => { i = 0; score = 0; done = false; answered = false; view(); };
      return;
    }
    const q = Q[i];
    box.innerHTML = `<div class="q-head"><span class="label">${EC.t('quiz.q', { n: i + 1, total })}</span><span class="label">${EC.t('quiz.score')}: ${score}</span></div>
      <div class="progress"><i style="width:${i / total * 100}%"></i></div>
      <h3 class="q-title">${EC.esc(q.q)}</h3>
      <div class="q-opts">${q.o.map((o, k) => `<button type="button" class="q-opt" data-k="${k}">${EC.esc(o)}</button>`).join('')}</div>
      <div class="q-fb" id="qFb" aria-live="polite"></div>`;
    answered = false;
    EC.$$('.q-opt', box).forEach(b => b.onclick = () => answer(+b.dataset.k));
  }
  function answer(k) {
    if (answered) return; answered = true;
    const Q = EC.T().quiz, q = Q[i], ok = k === EC.QUIZ_ANSWERS[i];
    if (ok) { score++; EC.state.xp += EC.XP.quizOk; EC.store.save(); if (EC.audio) EC.audio.chime(); } else if (EC.audio) EC.audio.blip();
    EC.$$('.q-opt').forEach((b, n) => { b.disabled = true; if (n === EC.QUIZ_ANSWERS[i]) b.classList.add('ok'); else if (n === k) b.classList.add('bad'); });
    const last = i === Q.length - 1;
    EC.$('#qFb').innerHTML = `<p><b class="${ok ? 'good' : 'bad'}">${ok ? EC.t('quiz.right') : EC.t('quiz.wrong')}</b> ${EC.esc(q.e)}</p><button class="btn primary" id="qNext"><span>${last ? EC.t('quiz.finish') : EC.t('quiz.next')}</span>${EC.icon('next')}</button>`;
    EC.$('#qNext').onclick = () => {
      if (last) { done = true; if (score > EC.state.quizBest) EC.state.quizBest = score; EC.store.save(); EC.evalBadges(); } else i++;
      view();
    };
    EC.bus.emit('progress');
  }
  return { render: view };
})();
