'use strict';
/* =========================================================
   Rincón de adultos (entrega 2): un solo lugar para todo lo de los adultos.
   - Se entra con un candado: una multiplicación de las tablas del 6 al 9, distinta cada vez y sin repetir la anterior;
     3 intentos y vuelve a donde estaba. Protege de la niña o el niño, no de un adulto.
   - Sobrio y sin Poli: los avisos van escritos en la pantalla (#aMsg).
   - Tablet y PC: lista de secciones a la izquierda y el detalle a la derecha. Celular: lista → sección (‹ vuelve a la lista).
   - Secciones: Jugadores (crear, nombre, niña/niño, temas del Repaso, borrar) · Avance de todos · Novedades · Respaldo ·
     Instalar · Ayúdanos a mejorar · Recorridos.
   - cur: { ok, sec, edit (id del jugador abierto), add (formulario de jugador nuevo), from (a dónde vuelve) }
   ========================================================= */
const ASECS = [
  ['kids', '👪', 'Jugadores', 'Crear, nombre, temas del Repaso, borrar'],
  ['all', '📊', 'Avance de todos', 'Cómo va cada niño o niña'],
  ['news', '🔔', 'Novedades', 'Lo nuevo de la app'],
  ['backup', '💾', 'Respaldo', 'Guardar o cargar el progreso'],
  ['install', '📲', 'Instalar la app', 'Ícono en la pantalla y sin internet'],
  ['opinion', '⭐', 'Ayúdanos a mejorar', 'Opinión y reporte anónimo'],
  ['help', '🧭', 'Recorridos', 'Volver a ver la ayuda de Poli'],
];
const aNarrow = () => innerWidth < 700;
/* ‹ en el Rincón: en celular, desde una sección vuelve a la lista; si no, a donde estaba (sin jugadores, a la portada) */
function adultBack() {
  if (cur.ok && cur.sec && aNarrow()) return ['adultos', { ok: true, from: cur.from }];
  const to = cur.from || 'map';
  return !root.cur && to !== 'welcome' ? ['welcome'] : [to];
}
/* trabajar con el progreso de cualquier jugador (no solo el que está jugando) */
function withProfile(id, fn) {
  if (id === root.cur) { const r = fn(save); persist(); return r; }
  const keep = save; save = loadProfile(id);
  try { const r = fn(save); root.profiles[id] = save; return r; } finally { save = keep; persist(); }
}
const peek = (id, fn) => { const keep = save; save = id === root.cur ? save : loadProfile(id); try { return fn(save); } finally { save = keep; } };
const nameTaken = (nm, except) => root.order.some(id => id !== except && root.profiles[id].name.toLowerCase() === nm.toLowerCase());
const aEsc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const aGo = (p = {}) => { const { from } = cur; go('adultos', { ok: true, from, ...p }); };
function aMsg(t, bad) { const m = $('#aMsg'); if (!m) return; m.textContent = t; m.className = 'amsg ' + (bad ? 'bad' : 'ok'); m.hidden = false; clearTimeout(aMsg.t); aMsg.t = setTimeout(() => { m.hidden = true; }, 4000); }
/* confirmación dentro de la app (sin confirm() del navegador) */
function aConfirm(text, yes, fn) {
  const m = document.createElement('div'); m.className = 'modal aconf';
  m.innerHTML = `<div class="acard" role="alertdialog" aria-label="Confirmar"><p>${text}</p><div class="agrow"><button class="btn sm danger" id="cYes">${yes}</button><button class="btn sm ghost" id="cNo">Cancelar</button></div></div>`;
  $('#app').append(m);
  $('#cNo', m).onclick = () => { sfx.pop(); m.remove(); };
  m.onclick = e => { if (e.target === m) m.remove(); };
  $('#cYes', m).onclick = () => { m.remove(); fn(); };
}

/* ---------- candado ---------- */
let gatePrev = '';
function adultGate() {
  let a, b; do { a = rnd(6, 9); b = rnd(6, 9); } while (`${a}x${b}` === gatePrev || `${b}x${a}` === gatePrev); gatePrev = `${a}x${b}`;
  frame(`<div class="agate"><div class="acard"><span class="alock">${ICO.lock}</span><h2>Solo para adultos</h2>
    <p>Para entrar, resuelve:</p><p class="aq">${a} × ${b} = ?</p>
    <div class="agrow"><input id="ag" type="text" inputmode="numeric" maxlength="3" autocomplete="off" aria-label="Respuesta"><button class="btn sm" id="ago">Entrar</button></div>
    <p class="anote" id="amsg" aria-live="polite"></p></div></div>`, 'fill');
  let tries = 0;
  const tryIt = () => {
    if (+$('#ag').value.trim() === a * b) { sfx.ok(); return go('adultos', { ...cur, ok: true }); }
    sfx.bad(); tries++; $('#ag').value = '';
    $('#amsg').textContent = tries >= 3 ? 'Esta parte es para adultos.' : 'No es correcto. Intenta otra vez.';
    if (tries >= 3) { $('#ago').disabled = true; setTimeout(() => { if (cur.name === 'adultos' && !cur.ok) { const t = adultBack(); go(t[0], t[1] || {}); } }, 1300); }
  };
  $('#ago').onclick = tryIt;
  $('#ag').onkeydown = e => { if (e.key === 'Enter') tryIt(); };
  setTimeout(() => $('#ag')?.focus(), 50);
}

/* ---------- secciones ---------- */
function kidRow(id) {
  const p = root.profiles[id], open = cur.edit === id, nm = aEsc(p.name);
  const { st, learned, off } = peek(id, s => ({ st: totalStars(), learned: TOPICS.filter(T => T.learned()), off: new Set(s.repasoOff || []) }));
  return `<div class="krow ${open ? 'open' : ''}" data-id="${id}"><div class="khead"><span class="kav" style="--k:${kidColor(p.name)}">${nm[0] || '?'}</span><b>${nm}${id === root.cur ? ' <em>jugando</em>' : ''}</b>
      <span class="kg">${p.g === 'o' ? '👦 Niño' : p.g === 'a' ? '👧 Niña' : ''}</span><span class="kst">★ ${st}</span><button class="btn sm ghost" data-ed="${id}">${open ? 'Listo' : 'Editar'}</button></div>
    ${open ? `<div class="kedit">
      <div class="krowf"><label>Nombre <input class="kname" value="${nm}" maxlength="14" autocomplete="off"></label><button class="btn sm ghost" data-ren>Cambiar</button></div>
      <div class="kseg" role="group" aria-label="Niña o niño"><button data-g="a" class="${p.g === 'a' ? 'on' : ''}">👧 Niña</button><button data-g="o" class="${p.g === 'o' ? 'on' : ''}">👦 Niño</button></div>
      <p class="klbl">Temas del Repaso del día <small>(solo los ya aprendidos)</small></p>
      <div class="kreps">${TOPICS.map(T => { const L = learned.includes(T); return `<label class="${L ? '' : 'dis'}"><input type="checkbox" data-t="${T.id}" ${L && !off.has(T.id) ? 'checked' : ''} ${L ? '' : 'disabled'}>${T.name}</label>`; }).join('')}</div>
      <div class="kfoot"><button class="btn sm danger" data-del>🗑️ Borrar a ${nm}</button></div></div>` : ''}</div>`;
}
const SECBODY = {
  kids: () => `<h3>Jugadores <small>${root.order.length} de ${MAXPROFILES}</small></h3>
    ${root.order.length ? '' : '<p>Aún no hay jugadores. Crea el primero.</p>'}${root.order.map(kidRow).join('')}
    ${cur.add ? `<div class="krow open knew"><div class="kedit"><div class="krowf"><label>Nombre <input class="kname" id="nName" maxlength="14" autocomplete="off" placeholder="Nombre"></label></div>
      <div class="kseg" role="group" aria-label="Niña o niño"><button data-ng="a">👧 Niña</button><button data-ng="o">👦 Niño</button></div>
      <div class="kfoot"><button class="btn sm ghost" id="nCancel">Cancelar</button><button class="btn sm green" id="nOk">Crear jugador</button></div></div></div>`
      : root.order.length < MAXPROFILES ? '<button class="btn sm green addk" id="bNew">+ Nuevo jugador</button>' : '<p class="anote">Máximo 6 jugadores en este dispositivo.</p>'}`,
  all: () => `<h3>Avance de todos</h3>${root.order.length ? root.order.map(id => peek(id, s => {
    const sts = Object.values(s.stats || {}), last = Math.max(0, ...sts.map(x => x.last || 0)), t = s.today && s.today.d === dayKey() ? s.today : null;
    const rows = TOPICS.filter(T => T.learned()).map(T => { const st = s.stats?.[T.id], p = pctOf(st);
      return `<div class="arow2"><span>${T.name}</span>${st ? `<span class="abar"><i style="width:${Math.max(4, p)}%;background:${p >= 70 ? 'var(--good)' : '#ff8a3d'}"></i></span><b>${p} %</b><small>${st.n} resp. · ${ago(st.last)}</small>` : '<small class="anone">sin práctica aún</small>'}</div>`; }).join('');
    return `<div class="allkid"><div class="khead"><span class="kav" style="--k:${kidColor(s.name)}">${aEsc(s.name)[0]}</span><b>${aEsc(s.name)}</b><span class="kst">★ ${totalStars()} de ${maxStars()}</span></div>
      <p class="asum2">Último uso: <b>${ago(last)}</b> · Hoy: <b>${t ? `${t.n} respuestas, ${Math.round(100 * t.ok / t.n)} % a la primera` : 'sin práctica'}</b> · Racha: <b>${streakInfo().cur} ${streakInfo().cur === 1 ? 'día' : 'días'}</b> · Medallas: <b>${medalsEarned().length} de ${MEDALS.length}</b></p>
      ${rows || '<p class="anote">Aún no aprende ningún tema.</p>'}</div>`;
  })).join('') + '<p class="anote">El porcentaje considera las últimas 20 respuestas de cada tema, a la primera (juegos, Repaso y desafíos). Bajo 70 % sale en naranjo: el Repaso del día le da más preguntas de ese tema.</p>' : '<p>Aún no hay jugadores.</p>'}`,
  news: () => `<h3>Novedades</h3><div class="splitrow"><p>Lo nuevo de cada versión de la app.</p><button class="btn sm ghost" id="bNewsA">🔔 Ver novedades</button></div>`,
  backup: () => `<h3>Respaldo del progreso</h3><p>Guarda un archivo con el progreso de todos los jugadores de este dispositivo. Sirve para pasarlo a otro dispositivo o recuperarlo si se borran los datos del navegador.</p>
    <div class="pbtns"><button class="btn sm green" id="bSave" ${root.order.length ? '' : 'disabled'}>Guardar respaldo</button><button class="btn sm ghost" id="bLoad">Cargar respaldo</button><input type="file" id="fLoad" accept=".json,application/json" hidden></div>`,
  install: () => { const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    return `<h3>Instalar la app</h3>${installed ? '<p><b>✓ La app ya está instalada en este dispositivo.</b> Funciona sin internet.</p>'
      : `<div class="splitrow"><p>Al instalarla queda con su ícono en la pantalla de inicio y funciona sin internet. También se puede seguir usando desde el link.</p>${installPrompt ? '<button class="btn sm gold" id="bInst">Instalar app</button>' : ''}</div>
        <ul class="psteps"><li><b>Android (Chrome):</b> menú ⋮ → <i>Instalar app</i> o <i>Agregar a la pantalla principal</i>.</li>
        <li><b>iPad o iPhone (Safari):</b> botón Compartir → <i>Agregar a inicio</i>. En Apple la app instalada guarda su progreso aparte de Safari: usa el respaldo para pasarlo.</li></ul>`}`; },
  opinion: () => `<h3>Ayúdanos a mejorar</h3><p>¿Te gusta Aprende con Poli? Cuéntanos qué tanto la recomendarías. El reporte <b>no lleva nombres</b> y nada se envía solo: tú decides si lo compartes.</p>
    <div class="rate" id="rate" role="slider" tabindex="0" aria-label="Recomendación de 0,5 a 5 estrellas" aria-valuemin="0.5" aria-valuemax="5" aria-valuenow="0">${[1, 2, 3, 4, 5].map(i => `<span class="rs" data-i="${i}"><i class="rbg">★</i><i class="rfg">★</i></span>`).join('')}<b id="rval"></b></div>
    <textarea id="fbText" maxlength="300" rows="2" placeholder="¿Quieres contarnos algo más? (opcional)" aria-label="Comentario opcional"></textarea>
    <p class="fbhint">Esto es lo que se compartiría:</p><textarea id="fbRep" readonly rows="6" aria-label="Reporte que se compartiría"></textarea>
    <div class="pbtns">${FEEDBACK_MAIL ? '<button class="btn sm gold" id="bFbMail">Enviar por correo</button>' : ''}<button class="btn sm green" id="bFbCopy">Copiar reporte</button><button class="btn sm ghost" id="bFbFile">Guardar archivo</button></div>`,
  help: () => `<h3>Recorridos</h3><div class="splitrow"><p>Poli muestra las partes del mapa: capítulos, islas, el menú «+» y las estrellas.</p><button class="btn sm ghost" id="bTourMap" ${root.cur ? '' : 'disabled'}>🧭 Ver recorrido</button></div>`,
};

function viewAdultos() {
  if (!cur.ok) return adultGate();
  const narrow = aNarrow(), sec = ASECS.some(s => s[0] === cur.sec) ? cur.sec : narrow ? '' : 'kids';
  const nav = `<nav class="anav">${ASECS.map(([k, e, t, s]) => `<button class="${k === sec ? 'on' : ''}" data-sec="${k}"><span class="ae">${e}</span><span class="at"><b>${t}</b>${narrow ? `<small>${s}</small>` : ''}</span>${narrow ? '<span class="chev">›</span>' : ''}</button>`).join('')}</nav>`;
  const el = frame(`<div class="adult ${narrow ? 'narrow' : ''} ${narrow && sec ? 'detail' : ''}">${narrow && sec ? '' : nav}${sec ? `<section class="apanel" id="ap-${sec}">${SECBODY[sec]()}</section>` : ''}</div>
    <p class="amsg" id="aMsg" role="status" hidden></p>`, 'fill');
  if (narrow && sec) $('#title').textContent = ASECS.find(s => s[0] === sec)[2];
  $('#btnBack').hidden = false;
  $$('[data-sec]', el).forEach(b => b.onclick = () => aGo({ sec: b.dataset.sec }));
  // la campana de novedades también está aquí (como en la portada)
  $('#barSlot2').innerHTML = '';
  ({ kids: wireKids, news: () => { $('#bNewsA').onclick = () => go('news', { from: 'adultos', afrom: cur.from }); }, backup: wireBackup, opinion: wireOpinion,
    install: () => { if ($('#bInst')) $('#bInst').onclick = async () => { installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; aGo({ sec: 'install' }); }; },
    help: () => { if ($('#bTourMap')) $('#bTourMap').onclick = () => { sfx.pop(); startMapTour(() => go('map')); }; } }[sec] || (() => { }))(el);
  if (cur.msg) aMsg(cur.msg), delete cur.msg;
  if (cur.edit) setTimeout(() => $(`.krow[data-id="${cur.edit}"]`)?.scrollIntoView({ block: 'nearest' }), 30);
}

function wireKids(el) {
  $$('[data-ed]', el).forEach(b => b.onclick = () => aGo({ sec: 'kids', edit: cur.edit === b.dataset.ed ? null : b.dataset.ed }));
  const row = $('.krow.open[data-id]', el);
  if (row) {
    const id = row.dataset.id;
    $('[data-ren]', row).onclick = () => {
      const nm = cleanName($('.kname', row).value);
      if (!nm) return sfx.bad(), aMsg('Escribe un nombre.', true);
      if (nameTaken(nm, id)) return sfx.bad(), aMsg('Ya hay otro jugador con ese nombre.', true);
      withProfile(id, s => { s.name = nm; }); sfx.ok(); aGo({ sec: 'kids', edit: id, msg: `Listo, ahora se llama ${nm}.` });
    };
    $('.kname', row).onkeydown = e => { if (e.key === 'Enter') $('[data-ren]', row).click(); };
    $$('[data-g]', row).forEach(b => b.onclick = () => { withProfile(id, s => { s.g = b.dataset.g; }); sfx.pop(); aGo({ sec: 'kids', edit: id }); });
    $$('input[data-t]', row).forEach(cb => cb.onchange = () => {
      withProfile(id, s => { const off = new Set(s.repasoOff || []); cb.checked ? off.delete(cb.dataset.t) : off.add(cb.dataset.t); s.repasoOff = [...off]; }); sfx.pop();
    });
    $('[data-del]', row).onclick = () => aConfirm(`¿Borrar a <b>${aEsc(root.profiles[id].name)}</b> y todo su progreso? Solo se puede recuperar con un respaldo.`, '🗑️ Sí, borrar', () => {
      const nm = root.profiles[id].name, was = id === root.cur; deleteProfile(id); sfx.pop();
      aGo({ sec: 'kids', msg: `Se borró a ${nm}.`, ...(was ? { from: 'welcome' } : {}) }); // si era quien jugaba, al salir va a la portada
    });
  }
  if ($('#bNew', el)) $('#bNew', el).onclick = () => aGo({ sec: 'kids', add: true });
  if (cur.add) {
    let g = '';
    $$('[data-ng]', el).forEach(b => b.onclick = () => { g = b.dataset.ng; sfx.pop(); $$('[data-ng]', el).forEach(x => x.classList.toggle('on', x === b)); });
    $('#nCancel', el).onclick = () => aGo({ sec: 'kids' });
    const make = () => {
      const nm = cleanName($('#nName', el).value);
      if (!nm) return sfx.bad(), aMsg('Escribe el nombre del jugador.', true);
      if (nameTaken(nm)) return sfx.bad(), aMsg('Ya hay un jugador con ese nombre.', true);
      if (!g) return sfx.bad(), aMsg('Elige si es niña o niño.', true);
      const id = newPid(); root.profiles[id] = { ...NEWSAVE(), name: nm, g }; root.order.push(id);
      if (!root.cur) { root.cur = id; save = loadProfile(id); }
      persist(); sfx.win(); aGo({ sec: 'kids', msg: `¡Listo! ${nm} ya puede jugar: toca su tarjeta en la portada.` });
    };
    $('#nOk', el).onclick = make;
    $('#nName', el).onkeydown = e => { if (e.key === 'Enter') make(); };
    setTimeout(() => $('#nName', el)?.focus(), 50);
  }
}
function wireBackup(el) {
  $('#bSave', el).onclick = () => { sfx.pop(); downloadBackup(); aMsg('Listo. Guarda el archivo en un lugar seguro.'); };
  $('#bLoad', el).onclick = () => $('#fLoad', el).click();
  $('#fLoad', el).onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    let data;
    try { if (f.size > 200000) throw 0; data = restoreFrom(JSON.parse(await f.text())); }
    catch (err) { sfx.bad(); aMsg('Ese archivo no es un respaldo de la app.', true); return; }
    const names = list => aEsc(list.join(', ') || 'nadie');
    aConfirm(`Esto reemplaza los jugadores de este dispositivo (${names(root.order.map(id => root.profiles[id].name))}) por los del respaldo (${names(data.map(d => d.name))}). ¿Continuar?`, 'Sí, cargar', () => {
      const profiles = {}, order = [];
      for (const d of data) { const id = newPid() + order.length; profiles[id] = d; order.push(id); }
      root = { profiles, order, cur: order[0] }; save = loadProfile(order[0]); persist(); sfx.win();
      aGo({ sec: 'backup', msg: '¡Progreso cargado!' });
    });
  };
}
function wireOpinion(el) {
  setupFeedback(el);
  $('#bFbCopy', el).addEventListener('click', () => aMsg('Listo, se copió el reporte. Ya puedes pegarlo donde quieras.'));
  $('#bFbFile', el).addEventListener('click', () => aMsg('Listo, se guardó el archivo del reporte.'));
}
