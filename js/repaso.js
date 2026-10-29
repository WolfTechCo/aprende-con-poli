'use strict';
/* =========================================================
   Repaso del día y panel de apoderado
   - Cada respuesta se guarda por tema en save.stats (aciertos a la primera de las últimas 20).
   - El apoderado elige qué temas entran al repaso: save.repasoOff guarda los desmarcados,
     así un tema recién aprendido entra marcado solo.
   ========================================================= */
const TOPICS = [
  { id: 'poli', ch: 1, name: 'Polígonos', learned: () => !!prog('intro').lesson, gen: () => makeQuestion(pick(CH[1].types, 1)[0]) },
  { id: 'fig3d', ch: 2, name: 'Figuras 2D y 3D', learned: () => !!prog('intro3d').lesson, gen: () => makeQuestion(pick(CH[2].types, 1)[0]) },
  { id: 'udc', ch: 3, gen: () => NQ.blocks(pick(['mat', 'loose', 'canje'], 1)[0]) },
  { id: 'valor', ch: 3, gen: () => pick([NQ.value, NQ.place, NQ.which, NQ.sum, NQ.missing], 1)[0]() },
  { id: 'nota', ch: 3, gen: () => pick([() => NQ.nota(rnd(0, 3)), NQ.notaRev], 1)[0]() },
  { id: 'tabla', ch: 3, gen: () => NQ.table() },
  { id: 'secu', ch: 3, gen: () => pick([NQ.next, () => NQ.rule()], 1)[0]() },
].map(T => T.ch === 3 ? { ...T, name: FIG[T.id].title, learned: () => !!prog(T.id).lesson } : T);
const TOP = Object.fromEntries(TOPICS.map(T => [T.id, T]));

/* tema de cada tipo de pregunta del Gran Desafío */
const N_TOPIC = { blocks: 'udc', value: 'valor', place: 'valor', which: 'valor', sum: 'valor', missing: 'valor', nota: 'nota', notaDesafio: 'nota', notaRev: 'nota', next: 'secu', rule: 'secu', table: 'tabla' };
const topicOf = t => t.startsWith('n:') ? N_TOPIC[t.slice(2)] : CH[1].types.includes(t) ? 'poli' : 'fig3d';

function track(topic, ok) {
  if (!TOP[topic]) return;
  const st = (save.stats ||= {})[topic] ||= { n: 0, h: '' };
  st.n++; st.h = (st.h + (ok ? '1' : '0')).slice(-20); st.last = Date.now();
  persist();
}
const pctOf = st => st && st.h.length ? Math.round(100 * [...st.h].filter(c => c === '1').length / st.h.length) : null;
/* "para reforzar": con al menos 5 respuestas y menos de 70 % a la primera */
const weak = T => { const st = save.stats?.[T.id]; return !!st && st.h.length >= 5 && pctOf(st) < 70; };
const repasoTopics = () => TOPICS.filter(T => T.learned() && !(save.repasoOff || []).includes(T.id));

/* ---------- Repaso del día ---------- */
function viewRepaso() {
  const learned = TOPICS.filter(T => T.learned()), list = repasoTopics();
  if (!list.length) {
    frame(`<div class="stepbody"><div class="col"><h2>Repaso del día</h2><span class="sub">${learned.length ? 'No hay temas elegidos para repasar.' : 'Primero aprende algún tema en el mapa.'}</span></div></div>`);
    setAction('Volver al mapa', () => go('map'), true, 'green');
    poli.say(learned.length ? 'Pídele a tu apoderado que elija temas para repasar.' : `Primero aprende algo en el mapa, ${save.name}. ¡Después repasamos!`);
    return;
  }
  // 5 preguntas: los temas "para reforzar" y los que no practica hace una semana salen más seguido
  const W = T => 1 + (weak(T) ? 2 : 0) + (Date.now() - (save.stats?.[T.id]?.last || 0) > 7 * 864e5 ? 1 : 0);
  const chosen = [];
  for (let i = 0; i < 5; i++) {
    const pool = list.length > 1 ? list.filter(T => T !== chosen[i - 1]) : list;
    let r = Math.random() * pool.reduce((a, T) => a + W(T), 0);
    chosen.push(pool.find(T => (r -= W(T)) < 0) || pool[0]);
  }
  const qs = chosen.map(T => freshQ(T.gen)), res = [];
  let qi = 0;
  const show = () => {
    const q = qs[qi];
    const el = frame(`${progressBar(qs.length, qi, res)}<div class="reptag"><span>${chosen[qi].name}</span></div><div class="stepbody"></div>`);
    choice($('.stepbody', el), {
      prompt: q.prompt, shape: q.shape || '', opts: q.opts, cls: q.cls || '',
      onRight: first => { res[qi] = first; track(chosen[qi].id, first); const say = q.opts.find(o => o.ok).say || ''; setTimeout(() => { qi++; qi < qs.length ? show() : finish(); }, Math.min(4200, 1300 + say.length * 40)); },
    });
    poli.say(q.voice || q.prompt);
  };
  const finish = () => {
    const good = res.filter(Boolean).length;
    sfx.win(); confetti(120);
    frame(`<div class="stepbody"><div class="col trophy"><h2>¡Repaso listo!</h2><div class="star-big">${starSvg(true, 160)}</div><span class="sub">${good} de ${qs.length} a la primera</span></div></div>`);
    setAction('Volver al mapa', () => go('map'), true, 'green');
    poli.cheer(good === qs.length ? `¡Perfecto, ${save.name}! Lo recuerdas todo.` : `¡Muy bien, ${save.name}! Repasar un poquito cada día te hace más fuerte.`);
  };
  show();
}

/* ---------- Panel de apoderado ---------- */
const dayStart = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const ago = t => { if (!t) return 'nunca'; const d = Math.round((dayStart(Date.now()) - dayStart(t)) / 864e5); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`; };
function viewParent() {
  // entrada: una multiplicación que una niña de 2° básico aún no sabe (protege de la niña, no de un adulto)
  if (!cur.ok) {
    const a = rnd(6, 9), b = rnd(6, 9);
    frame(`<div class="stepbody"><div class="col pgate"><h2>Solo para adultos</h2><span class="sub">¿Cuánto es ${a} × ${b}?</span>
      <div class="field"><input id="pg" type="text" inputmode="numeric" maxlength="3" autocomplete="off" placeholder="Respuesta"><button class="btn gold" id="pgo">Entrar</button></div></div></div>`);
    const tryIt = () => {
      if (+$('#pg').value.trim() === a * b) return go('parent', { ok: true });
      sfx.bad(); poli.oops('Esa no es. Esta parte es para adultos.'); setTimeout(() => cur.name === 'parent' && go('album'), 1400);
    };
    $('#pgo').onclick = tryIt;
    $('#pg').onkeydown = e => { if (e.key === 'Enter') tryIt(); };
    poli.say('Esta parte es para adultos.', false);
    return;
  }
  const rows = ch => TOPICS.filter(T => T.ch === ch).map(T => {
    const st = save.stats?.[T.id], p = pctOf(st), L = T.learned(), on = L && !(save.repasoOff || []).includes(T.id);
    return `<label class="prow ${L ? '' : 'off'}"><input type="checkbox" data-t="${T.id}" ${on ? 'checked' : ''} ${L ? '' : 'disabled'}>
      <span class="pname">${T.name}${weak(T) ? '<em class="pstar">⭐ Para reforzar</em>' : ''}</span>
      <span class="pdata">${!L ? 'Aún no lo aprende' : st ? `<b class="${p >= 70 ? 'okp' : 'lowp'}">${p} %</b> a la primera · ${st.n} ${st.n === 1 ? 'respuesta' : 'respuestas'} · ${ago(st.last)}` : 'Sin práctica aún'}</span></label>`;
  }).join('');
  const el = frame(`<div class="pwrap"><p class="pintro">Marca los temas que <b>${save.name || 'la niña'}</b> practicará en el <b>Repaso del día</b>. El porcentaje considera sus últimas 20 respuestas; los temas con menos de 70 % aparecen como <em class="pstar">⭐ Para reforzar</em>.</p>
    ${Object.keys(CH).map(ch => `<h3 class="sec">Capítulo ${CH[ch].label}</h3><div class="plist">${rows(+ch)}</div>`).join('')}</div>`, 'fill');
  $$('input[data-t]', el).forEach(cb => cb.onchange = () => {
    const off = new Set(save.repasoOff || []);
    cb.checked ? off.delete(cb.dataset.t) : off.add(cb.dataset.t);
    save.repasoOff = [...off]; persist(); sfx.pop();
  });
  poli.say('Aquí ves cómo le va en cada tema y eliges qué repasa.', false);
}
