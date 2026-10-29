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
  const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const el = frame(`<div class="pwrap"><p class="pintro">Marca los temas que <b>${save.name || 'la niña'}</b> practicará en el <b>Repaso del día</b>. El porcentaje considera sus últimas 20 respuestas; los temas con menos de 70 % aparecen como <em class="pstar">⭐ Para reforzar</em>.</p>
    ${Object.keys(CH).map(ch => `<h3 class="sec">Capítulo ${CH[ch].label}</h3><div class="plist">${rows(+ch)}</div>`).join('')}
    <h3 class="sec">Respaldo del progreso</h3>
    <div class="pbox"><p>Guarda un archivo con su progreso (estrellas, aciertos y temas elegidos). Sirve para pasarlo a otro dispositivo o recuperarlo si se borran los datos del navegador.</p>
      <div class="pbtns"><button class="btn sm green" id="bSave">Guardar respaldo</button><button class="btn sm ghost" id="bLoad">Cargar respaldo</button>
      <input type="file" id="fLoad" accept=".json,application/json" hidden></div></div>
    <h3 class="sec">Instalar la app</h3>
    <div class="pbox">${installed ? '<p><b>✓ La app ya está instalada en este dispositivo.</b> Funciona sin internet.</p>'
      : `<p>Al instalarla queda con su ícono en la pantalla de inicio y funciona sin internet. También se puede seguir usando desde el link.</p>
        ${installPrompt ? '<div class="pbtns"><button class="btn sm gold" id="bInst">Instalar app</button></div>' : ''}
        <ul class="psteps"><li><b>Android (Chrome):</b> menú ⋮ → <i>Instalar app</i> o <i>Agregar a la pantalla principal</i>.</li>
        <li><b>iPad o iPhone (Safari):</b> botón Compartir → <i>Agregar a inicio</i>. En Apple la app instalada guarda su progreso aparte de Safari: usa el respaldo para pasarlo.</li></ul>`}</div>
  </div>`, 'fill');
  $$('input[data-t]', el).forEach(cb => cb.onchange = () => {
    const off = new Set(save.repasoOff || []);
    cb.checked ? off.delete(cb.dataset.t) : off.add(cb.dataset.t);
    save.repasoOff = [...off]; persist(); sfx.pop();
  });
  $('#bSave', el).onclick = () => { sfx.pop(); downloadBackup(); poli.say('Listo. Guarda el archivo en un lugar seguro.', false); };
  $('#bLoad', el).onclick = () => $('#fLoad', el).click();
  $('#fLoad', el).onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    let data;
    try { if (f.size > 200000) throw 0; data = restoreFrom(JSON.parse(await f.text())); }
    catch (err) { sfx.bad(); poli.oops('Ese archivo no es un respaldo de la app.'); return; }
    if (!confirm(`Esto reemplaza el progreso actual${save.name ? ` de ${save.name}` : ''} por el del respaldo${data.name ? ` de ${data.name}` : ''}. ¿Continuar?`)) return;
    save = data; persist(); sfx.win();
    go('parent', { ok: true }); poli.cheer('¡Progreso cargado!');
  };
  if ($('#bInst', el)) $('#bInst', el).onclick = async () => { installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; go('parent', { ok: true }); };
  poli.say('Aquí ves cómo le va en cada tema y eliges qué repasa.', false);
}

/* ---------- respaldo del progreso ---------- */
function downloadBackup() {
  const day = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify({ app: 'aprende-con-poli', fecha: day, save }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); // nombre del archivo sin tildes ni símbolos (algunos navegadores lo rechazan)
  const who = (save.name || 'respaldo').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'respaldo';
  a.download = `poli-progreso-${who}-${day}.json`;
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
/* el archivo viene de afuera: se copia solo lo conocido y con el tipo correcto */
function restoreFrom(obj) {
  const src = obj && obj.app === 'aprende-con-poli' && obj.save;
  if (!src || typeof src !== 'object') throw new Error('no es un respaldo');
  const out = NEWSAVE(), id = /^[\w-]{1,20}$/;
  out.ver = Number.isInteger(src.ver) && src.ver >= 0 && src.ver <= SAVEVER ? src.ver : 0;
  out.name = cleanName(src.name);
  for (const k of ['fx', 'voice']) if (typeof src[k] === 'boolean') out[k] = src[k];
  for (const k of ['challenge', 'challenge3d', 'challengeNum']) if (Number.isFinite(src[k])) out[k] = Math.max(0, Math.min(3, Math.round(src[k])));
  if (CH[src.ch]) out.ch = +src.ch;
  if (src.prog && typeof src.prog === 'object') for (const [k, v] of Object.entries(src.prog))
    if (id.test(k) && v && typeof v === 'object') { out.prog[k] = {}; for (const [a, b] of Object.entries(v)) if (id.test(a) && b === true) out.prog[k][a] = true; }
  if (src.stats && typeof src.stats === 'object') for (const [k, v] of Object.entries(src.stats))
    if (TOP[k] && v && /^[01]{0,20}$/.test(v.h) && Number.isFinite(v.n)) out.stats[k] = { n: Math.max(0, Math.round(v.n)), h: v.h, last: Number.isFinite(v.last) ? v.last : 0 };
  if (Array.isArray(src.repasoOff)) out.repasoOff = src.repasoOff.filter(k => TOP[k]);
  return migrate(out);
}
