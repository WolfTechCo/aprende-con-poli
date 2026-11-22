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

const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function track(topic, ok) {
  if (!TOP[topic]) return;
  const st = (save.stats ||= {})[topic] ||= { n: 0, h: '' };
  st.n++; st.h = (st.h + (ok ? '1' : '0')).slice(-20); st.last = Date.now();
  const t = save.today && save.today.d === dayKey() ? save.today : (save.today = { d: dayKey(), n: 0, ok: 0 }); // respuestas de hoy (línea de la familia en Mi avance)
  t.n++; if (ok) t.ok++;
  const hoy = dayKey(), days = (save.days ||= []); // días en que practicó (hora local; para el reporte y la racha)
  if (days[days.length - 1] !== hoy) { days.push(hoy); if (days.length > 90) days.shift(); }
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
      onRight: first => { res[qi] = first; track(chosen[qi].id, first); afterSay(() => { qi++; qi < qs.length ? show() : finish(); }, el); },
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

/* ---------- fechas (Rincón de adultos y reporte) ---------- */
const dayStart = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const ago = t => { if (!t) return 'nunca'; const d = Math.round((dayStart(Date.now()) - dayStart(t)) / 864e5); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`; };
/* ---------- Mi avance (entrega 2): sin candado, solo del jugador que está jugando ----------
   Cada tema es un camino de 5 piedras de colores con una estrella que camina hasta donde va; el % va chico.
   Si cuesta, dice «¡Vamos a practicar!» en naranjo (nunca rojo). Arriba, una línea para la familia con lo de hoy.
   Pestañas de capítulos con resumen: así ningún capítulo necesita deslizar. Cambiar los temas del Repaso: Rincón de adultos. */
function levelOf(T) {
  const st = save.stats?.[T.id], p = pctOf(st), n = st ? st.h.length : 0;
  if (!T.learned()) return { k: 'off', word: 'Aún no lo aprendes', emo: '🔒', stones: 0 };
  if (!n) return { k: 'new', word: '¡Listo para empezar!', emo: '🌱', stones: 0 };
  const days = (Date.now() - (st.last || 0)) / 864e5, stones = Math.max(1, Math.round(p / 20));
  if (n < 5) return { k: 'start', word: 'Empezando', emo: '🌱', stones: 1, p };
  if (days > 7) return { k: 'back', word: '¡Hace rato que no!', emo: '👋', stones, p };
  if (p < 70) return { k: 'prac', word: '¡Vamos a practicar!', emo: '💪', stones, p };
  if (p >= 90 && n >= 10) return { k: 'top', word: '¡Lo dominas!', emo: '🏆', stones: 5, p };
  return { k: 'go', word: 'Avanzando', emo: '🚀', stones, p };
}
const TOPIC_SAYS = {
  off: T => `${T.name} viene más adelante en el mapa.`,
  new: T => `Ya aprendiste ${T.name}. ¡Juega para llenar tu camino!`,
  start: T => `¡Buen comienzo en ${T.name}! Cada respuesta te acerca a la meta.`,
  prac: T => `${T.name} cuesta un poquito. ¡Practiquemos juntos en el Repaso!`,
  back: T => `¡Hace rato que no jugamos ${T.name}! ¿Lo repasamos?`,
  go: T => `¡Vas muy bien en ${T.name}! Sigue así.`,
  top: T => `¡Eres ${gx('experta', 'experto')} en ${T.name}!`,
};
/* resumen de un capítulo para su pestaña: cuántas piedras lleva en promedio y si hay algo para practicar */
const chapStones = ch => {
  const all = TOPICS.filter(T => T.ch === ch), L = all.filter(T => T.learned()).map(levelOf);
  if (!L.length) return { k: 'off', s: 0 };
  return { k: L.some(x => x.k === 'prac') ? 'prac' : 'ok', s: Math.round(L.reduce((a, x) => a + x.stones, 0) / all.length) };
};
const stonesHtml = (n, cls = '') => Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'on' : ''}" style="--i:${i}"></i>`).join('');
function viewAvance() {
  const ch = chapOf(), learned = TOPICS.filter(T => T.learned()), weakL = learned.filter(weak);
  const t = save.today && save.today.d === dayKey() ? save.today : null;
  const fam = (t && t.n ? `<b>Hoy:</b> ${t.n} ${t.n === 1 ? 'respuesta' : 'respuestas'} · ${Math.round(100 * t.ok / t.n)} % a la primera` : '<b>Hoy</b> aún no practica')
    + (weakL.length ? ` · <b>Para practicar:</b> ${weakL.map(T => T.name).join(', ')}` : '');
  const card = T => {
    const L = levelOf(T), inRep = T.learned() && !(save.repasoOff || []).includes(T.id);
    return `<button class="tcard ${L.k}" data-t="${T.id}"><span class="temo">${L.emo}</span><span class="tbody"><b>${T.name}</b>
      <span class="road">${stonesHtml(L.stones)}<em style="--to:${L.stones}">${starSvg(true)}</em></span>
      <small><span class="tw">${L.word}</span>${L.p != null ? `<span class="tp">${L.p} %</span>` : ''}${inRep ? '<span class="trep" title="Entra al Repaso del día">🔁</span>' : ''}</small></span></button>`;
  };
  const el = frame(`<div class="tabwrap avwrap">
    <p class="famline">👪 ${fam}</p>
    ${chapTabs(ch, k => { const c = chapStones(k); return { done: c.s === 5, html: c.k === 'off' ? '🔒' : `<span class="mroad">${stonesHtml(c.s)}</span>${c.k === 'prac' ? '<span>💪</span>' : ''}` }; })}
    <div class="tgrid" style="--n:${TOPICS.filter(T => T.ch === ch).length}">${TOPICS.filter(T => T.ch === ch).map(card).join('')}</div>
    <div class="avfoot"><span>🔁 = entra al Repaso del día</span><button class="btn sm ghost" id="bRepSel">🔒 Elegir temas del Repaso</button></div></div>`, 'fill');
  fitChapRow($('.ctabs', el));
  $$('.ctab', el).forEach(b => b.onclick = () => { go('avance', { ch: +b.dataset.ch, again: true }); poli.say(chapName(+b.dataset.ch)); });
  $$('.tcard', el).forEach(b => b.onclick = () => {
    const T = TOP[b.dataset.t], L = levelOf(T); sfx.tap(2);
    $$('.tcard', el).forEach(x => x.classList.toggle('sel', x === b));
    L.k === 'top' ? poli.cheer(TOPIC_SAYS.top(T)) : poli.say(TOPIC_SAYS[L.k](T));
  });
  $('#bRepSel', el).onclick = () => go('adultos', { from: 'avance', sec: 'kids', edit: root.cur });
  if (cur.again) return; // al cambiar de pestaña Poli no repite el saludo
  const last = Math.max(0, ...Object.values(save.stats || {}).map(x => x.last || 0));
  poli.say(!last ? '¡Aquí verás tu camino! Juega una isla y empieza a llenarlo.'
    : Date.now() - last > 7 * 864e5 ? '¡Qué bueno verte de nuevo! Tu camino te estaba esperando.'
      : weakL.length ? '¡Mira tu camino! Hay un tema para practicar un poquito. Toca un tema y te cuento.'
        : '¡Mira cuánto has avanzado! Toca un tema y te cuento.');
}

/* ---------- respaldo del progreso ---------- */
function downloadBackup() {
  const day = new Date().toISOString().slice(0, 10);
  persist();
  const perfiles = root.order.map(id => root.profiles[id]);
  const blob = new Blob([JSON.stringify({ app: 'aprende-con-poli', version: 2, fecha: day, perfiles }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); // nombre del archivo sin tildes ni símbolos (algunos navegadores lo rechazan)
  const who = (root.order.length > 1 ? 'familia' : save.name || 'respaldo').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'respaldo';
  a.download = `poli-progreso-${who}-${day}.json`;
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
/* el archivo viene de afuera: se copia solo lo conocido y con el tipo correcto.
   Acepta respaldos con varios perfiles (versión 2) y los de antes, con uno solo */
function restoreFrom(obj) {
  if (!obj || obj.app !== 'aprende-con-poli') throw new Error('no es un respaldo');
  const list = Array.isArray(obj.perfiles) ? obj.perfiles : [obj.save];
  const out = list.slice(0, MAXPROFILES).map(cleanProfile).filter(p => p.name);
  if (!out.length) throw new Error('respaldo vacío');
  return out.filter((p, i) => out.findIndex(q => q.name.toLowerCase() === p.name.toLowerCase()) === i); // sin nombres repetidos
}
function cleanProfile(src) {
  if (!src || typeof src !== 'object') return {};
  const out = NEWSAVE(), id = /^[\w-]{1,20}$/;
  out.ver = Number.isInteger(src.ver) && src.ver >= 0 && src.ver <= SAVEVER ? src.ver : 0;
  out.name = cleanName(src.name);
  if (src.g === 'a' || src.g === 'o') out.g = src.g;
  for (const k of ['fx', 'voice']) if (typeof src[k] === 'boolean') out[k] = src[k];
  for (const k of Object.values(CH).map(C => C.chal)) if (Number.isFinite(src[k])) out[k] = Math.max(0, Math.min(3, Math.round(src[k])));
  if (CH[src.ch]) out.ch = +src.ch;
  if (src.prog && typeof src.prog === 'object') for (const [k, v] of Object.entries(src.prog))
    if (id.test(k) && v && typeof v === 'object') { out.prog[k] = {}; for (const [a, b] of Object.entries(v)) if (id.test(a) && b === true) out.prog[k][a] = true; }
  if (src.stats && typeof src.stats === 'object') for (const [k, v] of Object.entries(src.stats))
    if (TOP[k] && v && /^[01]{0,20}$/.test(v.h) && Number.isFinite(v.n)) out.stats[k] = { n: Math.max(0, Math.round(v.n)), h: v.h, last: Number.isFinite(v.last) ? v.last : 0 };
  if (Array.isArray(src.days)) out.days = src.days.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-90);
  if (Array.isArray(src.repasoOff)) out.repasoOff = src.repasoOff.filter(k => TOP[k]);
  if (Array.isArray(src.badges)) out.badges = src.badges.filter(b => typeof b === 'string' && /^[\w-]{1,20}$/.test(b)).slice(0, 40);
  if (typeof src.acc === 'string' && /^[a-z]{1,12}$/.test(src.acc)) out.acc = src.acc;
  if (src.today && typeof src.today === 'object' && /^\d{4}-\d{2}-\d{2}$/.test(src.today.d) && Number.isFinite(src.today.n) && Number.isFinite(src.today.ok)) {
    const n = Math.max(0, Math.min(9999, Math.round(src.today.n))); out.today = { d: src.today.d, n, ok: Math.max(0, Math.min(n, Math.round(src.today.ok))) };
  }
  return migrate(out);
}
