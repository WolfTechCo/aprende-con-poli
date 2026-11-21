'use strict';
/* BOCETO de la entrega 2 (etapa 2). Reemplaza vistas para sacar capturas. No es la construcción final. */

const ICO = {
  home: '<svg viewBox="0 0 24 24"><path d="M3.5 11.2L12 4l8.5 7.2" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v9.5h4.5v-5h3v5H18V10" fill="currentColor"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="#6c7aa5"/><path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="#6c7aa5" stroke-width="2.6" stroke-linecap="round"/></svg>',
  repaso: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 109 9" fill="none" stroke="#5a3a00" stroke-width="2.6" stroke-linecap="round"/><path d="M21 4v5h-5" fill="none" stroke="#5a3a00" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7.5V12l3 2" fill="none" stroke="#5a3a00" stroke-width="2.4" stroke-linecap="round"/></svg>',
  premios: '<svg viewBox="0 0 24 24"><path d="' + trophyPath + '" fill="#ffc233" stroke="#e09a00" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  avance: '<svg viewBox="0 0 24 24"><rect x="3" y="13" width="4" height="8" rx="1.5" fill="#ff8a3d"/><rect x="10" y="8" width="4" height="13" rx="1.5" fill="#4ea8ff"/><rect x="17" y="3" width="4" height="18" rx="1.5" fill="#22c58b"/></svg>',
};

/* ---------- abrir la app: con un solo jugador, directo al mapa ---------- */
if (root.order.length === 1 && root.cur && !location.hash.includes('portada')) cur = { name: 'map' };

/* ---------- barra y vuelta atrás ---------- */
const BACK = () => ({
  island: ['map'], lesson: isIntro(cur.id) ? ['map'] : ['island', { id: cur.id }], build: ['island', { id: cur.id }], paint: ['island', { id: cur.id }], hunt: ['island', { id: cur.id }], game: ['island', { id: cur.id }],
  challenge: ['map'], workshop: ['map'], repaso: ['map'], premios: ['map'], album: ['premios'], medallas: ['premios'], ropa: ['premios'], avance: ['map'],
  adultos: cur.sec && cur.narrow ? ['adultos', { ok: true }] : [cur.from || 'map'], news: ['adultos', { ok: true, sec: 'news' }],
}[cur.name]);
$('#btnBack').onclick = () => { if (stepBack) { sfx.pop(); stepBack(); return; } const t = BACK(); if (t) go(t[0], t[1] || {}); };

function titleFor() {
  const F = FIG[cur.id];
  if (F && F.kind === 'num') return cur.name === 'lesson' ? `Aprende: ${F.short}` : cur.name === 'game' ? F.acts.find(a => a.k === cur.k).t : F.title;
  switch (cur.name) {
    case 'island': return `Isla ${del(F)}`;
    case 'map': return 'Mapa de aventuras';
    case 'premios': return 'Mis premios';
    case 'album': return 'Mis stickers';
    case 'medallas': return 'Mis medallas';
    case 'ropa': return 'Ropa de Poli';
    case 'avance': return 'Mi avance';
    case 'adultos': return 'Rincón de adultos';
    case 'repaso': return 'Repaso del día';
    case 'news': return 'Novedades';
    default: return 'Aprende con Poli';
  }
}
function render() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  stepBack = null;
  $('#btnBack').hidden = !BACK();
  $('#barSlot').innerHTML = ''; $('#barSlot2').innerHTML = '';
  $$('#app > .modal').forEach(m => m.remove());
  $('#app').classList.toggle('is-home', cur.name === 'welcome');
  $('#app').classList.toggle('is-adult', cur.name === 'adultos' || cur.name === 'news');
  $('#title').textContent = titleFor();
  setAction(null);
  refreshStars();
  scr().innerHTML = '';
  ({ welcome: viewWelcome, map: viewMap, island: viewIsland, lesson: viewLesson, build: viewBuild, paint: viewPaint, hunt: viewHunt, game: viewGame, challenge: viewChallenge,
    album: viewAlbum, workshop: viewWorkshop, repaso: viewRepaso, avance: viewAvance2, news: viewNews, premios: viewPremios, medallas: viewMedallas, ropa: viewRopa, adultos: viewAdultos })[cur.name]();
}
/* el contador de estrellas es un botón: lleva a Mis premios */
function refreshStars(bump) {
  const p = $('#starsPill');
  p.hidden = ['welcome', 'adultos', 'news'].includes(cur.name);
  p.innerHTML = `${starSvg(true)}<span>${totalStars()}</span>`;
  p.classList.toggle('tap', cur.name !== 'premios');
  if (bump) { p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
}
(() => { const old = $('#starsPill'), b = document.createElement('button'); b.id = 'starsPill'; b.className = 'pill'; b.hidden = true; b.setAttribute('aria-label', 'Mis premios'); old.replaceWith(b);
  b.onclick = () => { if (cur.name !== 'premios' && !demoMode) go('premios'); }; })();

/* ---------- Portada ---------- */
const kidColor = nm => COLORS[[...nm].reduce((a, c) => a + c.codePointAt(0), 0) % COLORS.length];
const _viewWelcome = viewWelcome;
viewWelcome = function () {
  _viewWelcome();
  $('#bAdd')?.remove(); // crear jugadores: solo en el Rincón de adultos (la primera vez, aquí)
  $('#barSlot').insertAdjacentHTML('beforeend', '<button class="adultpill" id="bAdult">🔒 Adultos</button>');
  $('#bAdult').onclick = () => go('adultos', { from: 'welcome' });
};

/* ---------- Mapa ---------- */
const MENU2 = `
  <button data-go="repaso"><span class="mi">${ICO.repaso}</span><span><b>Repaso</b><small>5 preguntas para practicar</small></span></button>
  <button data-go="premios"><span class="mi">${ICO.premios}</span><span><b>Mis premios</b><small>Stickers, medallas y ropa de Poli</small></span></button>
  <button data-go="avance"><span class="mi">${ICO.avance}</span><span><b>Mi avance</b><small>Cómo vas en cada tema</small></span></button>
  <button data-go="adultos" class="madult"><span class="mi">${ICO.lock}</span><span><b>Adultos</b><small>Jugadores, ajustes y respaldo</small></span></button>`;
const _viewMap = viewMap;
viewMap = function () {
  if (!root.cur) return go('welcome');
  _viewMap();
  $('.mbtns')?.remove(); // un solo menú «+» en todos los tamaños
  $('#btnBack').hidden = true;
  $('#barSlot').innerHTML = `<div class="lbtns"><button class="round" id="bHome" aria-label="Cambiar de jugador">${ICO.home}</button>
    <button class="round more" id="bMenu" aria-expanded="false" aria-label="Más opciones"><svg viewBox="0 0 24 24" class="plus"><defs><linearGradient id="gmas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff0bd"/></linearGradient></defs><path d="M12 6.5v11M6.5 12h11" stroke="#8a4b00" stroke-width="6" stroke-linecap="round"/><path d="M12 6.5v11M6.5 12h11" stroke="url(#gmas)" stroke-width="3.6" stroke-linecap="round"/></svg></button></div>
    <div class="menu" id="menu" hidden>${MENU2}</div>`;
  $$('#barSlot [data-go]').forEach(b => b.onclick = () => go(b.dataset.go, b.dataset.go === 'adultos' ? { from: 'map' } : {}));
  $('#bMenu').onclick = e => { e.stopPropagation(); sfx.pop(); setMenu(!!$('#menu').hidden); };
  $('#bHome').onclick = () => { sfx.pop(); askHome(); };
};
/* casita: aviso suave antes de salir del mapa */
function askHome() {
  const many = root.order.length > 1;
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="mcard soft"><div class="mpoli">${POLI_SVG}</div>
    <h2>${many ? '¿Cambiamos de jugador?' : '¿Volvemos a la portada?'}</h2>
    <p class="msub">${many ? 'Tu avance queda guardado.' : 'Tu avance queda guardado.'}</p>
    <div class="gbtns"><button class="btn gold sm" id="hYes">${many ? '👋 Sí, cambiar' : '🏠 Sí, volver'}</button><button class="btn ghost sm" id="hNo">Seguir jugando</button></div></div>`;
  $('#app').append(m);
  $('#hYes', m).onclick = () => go('welcome');
  $('#hNo', m).onclick = () => { sfx.pop(); m.remove(); };
  m.onclick = e => { if (e.target === m) m.remove(); };
  poli.say(many ? '¿Cambiamos de jugador? Tu avance queda guardado.' : '¿Volvemos a la portada? Tu avance queda guardado.', false);
}

/* ---------- Mis premios ---------- */
const rankOf = () => { const t = totalStars(), m = maxStars(); return t >= m ? gx('Reina', 'Rey') + ' de las formas' : t >= 40 ? gx('Maestra', 'Maestro') : t >= 15 ? gx('Exploradora', 'Explorador') : 'Aprendiz'; };
const stickerCount = () => Object.keys(CH).reduce((a, ch) => { const C = CH[ch]; return a + (prog(C.intro).lesson ? 1 : 0) + C.figs.filter(F => figStars(F.id) === 3).length + ((save[C.chal] || 0) >= 3 ? 1 : 0); }, 0);
const stickerMax = () => Object.values(CH).reduce((a, C) => a + C.figs.length + 2, 0);
function prizeBg() { // fondo con vida: estrellas y formas que flotan detrás de las tarjetas
  let h = '';
  for (let i = 0; i < 16; i++) {
    const k = i % 4, c = COLORS[i % 6], sz = 18 + (i * 13) % 26;
    const shape = k === 0 ? `<polygon points="${starPts(50, 52, 46)}" fill="#ffd54a"/>` : k === 1 ? `<circle cx="50" cy="50" r="40" fill="${c}"/>` : k === 2 ? `<polygon points="${rs(3, -90, 46)}" fill="${c}"/>` : `<polygon points="${dipSpark(50, 50, 46)}" fill="#fff"/>`;
    h += `<svg class="pf" viewBox="0 0 100 100" style="left:${(i * 61) % 96}%;top:${(i * 41 + 7) % 88}%;width:${sz}px;animation-duration:${5 + (i % 5) * 1.6}s;animation-delay:-${i * .7}s">${shape}</svg>`;
  }
  return `<div class="prizebg" aria-hidden="true">${h}</div>`;
}
function viewPremios() {
  const med = medalsEarned().length, acc = ACCS.filter(accOpen).length, { cur: racha } = streakInfo();
  const mini = ['tri', 'sq', 'pent', 'hex'].map(id => `<span>${figSvg(FIG[id])}</span>`).join('');
  const card = (go, cls, art, t, n, sub) => `<button class="prize ${cls}" data-go="${go}"><span class="part">${art}</span><b>${t}</b><span class="pcount">${n}</span>${sub ? `<small>${sub}</small>` : ''}</button>`;
  const el = frame(`${prizeBg()}<div class="prizes">
    <p class="prank"><span>${starSvg(true)} ${totalStars()} de ${maxStars()}</span><b>${rankOf()}</b></p>
    <div class="pgrid">
      ${card('album', 'c1', `<span class="stkmini">${mini}</span>`, 'Mis stickers', `${stickerCount()} de ${stickerMax()}`)}
      ${card('medallas', 'c2', `<span class="medmini">${[...MEDALS.filter(m => medalsEarned().includes(m.id)), ...MEDALS].slice(0, 2).map(m => `<i class="${medalsEarned().includes(m.id) ? 'on' : ''}">${m.ico}</i>`).join('')}</span>`, 'Mis medallas', `${med} de ${MEDALS.length}`, racha >= 2 ? `🔥 ${racha} días seguidos` : '')}
      ${card('ropa', 'c3', `<span class="poliwear">${poliSvg(save.acc)}</span>`, 'Ropa de Poli', `${acc} de ${ACCS.length}`)}
      ${card('diploma', 'c4', '<span class="dipico">🎓</span>', 'Mi diploma', '¡Imprímelo!')}
    </div></div>`, 'fill premios');
  $$('.prize', el).forEach((b, i) => { b.style.animationDelay = `${i * .08}s, ${-i * .9}s`; b.onclick = () => { b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing'); sfx.tap(i); setTimeout(() => b.dataset.go === 'diploma' ? openDiploma() : go(b.dataset.go), 260); }; });
  poli.say(med ? `¡Mira todo lo que has ganado! Toca una tarjeta para verla.` : '¡Aquí se guardan tus premios! Toca una tarjeta para verla.');
}
function viewMedallas() {
  const { cur: racha, best } = streakInfo(), now = medalsEarned();
  const el = frame(`${prizeBg()}<div class="medwrap">
    <p class="streak">🔥 <b>${racha} ${racha === 1 ? 'día' : 'días'} seguidos</b><span>Mejor racha: ${best}</span></p>
    <div class="medgrid">${MEDALS.map((m, i) => `<button class="medal2 ${now.includes(m.id) ? 'on' : ''}" data-i="${i}" style="animation-delay:${i * .05}s"><span>${m.ico}</span><b>${m.name}</b><small>${now.includes(m.id) ? '¡Ganada!' : m.how}</small></button>`).join('')}</div></div>`, 'fill premios');
  $$('.medal2', el).forEach(b => b.onclick = () => { const m = MEDALS[b.dataset.i]; sfx.tap(2); now.includes(m.id) ? poli.cheer(`¡Medalla ${m.name}! Te la ganaste.`) : poli.say(`Para ganarla: ${m.how.toLowerCase()}.`); });
  poli.say(`Tienes ${now.length} de ${MEDALS.length} medallas. Toca una para saber cómo se gana.`);
}
function viewRopa() {
  const el = frame(`${prizeBg()}<div class="ropawrap"><div class="mirror"><div class="mpoli2">${poliSvg(save.acc)}</div><div class="mshadow"></div></div>
    <div class="closet2"><button class="acc2 ${save.acc ? '' : 'on'}" data-a=""><span>🙂</span><b>Poli normal</b></button>${ACCS.map(a => accOpen(a)
      ? `<button class="acc2 ${save.acc === a.id ? 'on' : ''}" data-a="${a.id}"><span>${a.ico}</span><b>${a.name}</b></button>`
      : `<button class="acc2 lock" data-lock="${a.id}"><span>🔒</span><b>${a.name}</b><small>${medalName(a.medal)}</small></button>`).join('')}</div></div>`, 'fill premios');
  $$('[data-a]', el).forEach(b => b.onclick = () => { save.acc = b.dataset.a; persist(); wearing = null; refreshPoli(); go('ropa'); poli.cheer(save.acc ? '¡Me encanta! ¡Gracias!' : 'Poli normal, ¡siempre contenta!'); });
  $$('[data-lock]', el).forEach(b => b.onclick = () => { const a = ACC[b.dataset.lock]; sfx.bad(); poli.say(`Se desbloquea con la medalla ${medalName(a.medal)}.`); });
  poli.say('¿Qué me pongo hoy? Elige mi ropa.');
}

/* ---------- Mi avance (sin candado) ---------- */
const TOPIC_ICO = { poli: 'pent', fig3d: 'cube', udc: 'udc', valor: 'valor', nota: 'nota', tabla: 'tabla', secu: 'secu' };
function levelOf(T) {
  const st = save.stats?.[T.id], p = pctOf(st), n = st ? st.h.length : 0;
  if (!T.learned()) return { k: 'off', word: 'Aún no lo aprendes', emo: '🔒', stones: 0 };
  if (!st || !n) return { k: 'new', word: '¡Listo para empezar!', emo: '🌱', stones: 0 };
  const days = (Date.now() - (st.last || 0)) / 864e5;
  if (n < 5) return { k: 'start', word: 'Empezando', emo: '🌱', stones: 1, p };
  if (p < 70) return { k: 'prac', word: '¡Vamos a practicar!', emo: '💪', stones: Math.max(1, Math.round(p / 20)), p };
  if (days > 7) return { k: 'back', word: '¡Hace rato que no!', emo: '👋', stones: Math.round(p / 20), p };
  if (p >= 90 && n >= 10) return { k: 'top', word: '¡Lo dominas!', emo: '🏆', stones: 5, p };
  return { k: 'go', word: 'Avanzando', emo: '🚀', stones: Math.round(p / 20), p };
}
const SAYS = {
  off: T => `${T.name} viene más adelante en el mapa.`, new: T => `Ya aprendiste ${T.name}. ¡Juega para llenar tu camino!`,
  start: T => `¡Buen comienzo en ${T.name}! Cada respuesta te acerca a la meta.`, prac: T => `${T.name} cuesta un poquito. ¡Practiquemos juntos en el Repaso!`,
  back: T => `¡Hace rato que no jugamos ${T.name}! ¿Lo repasamos?`, go: T => `¡Vas muy bien en ${T.name}! Sigue así.`, top: T => `¡Eres experta en ${T.name}!`,
};
function viewAvance2() {
  const today = dayKey(), learned = TOPICS.filter(T => T.learned()), weakL = learned.filter(weak);
  let n = 0, ok = 0; // respuestas de hoy (boceto: se calcularía con lo guardado por día)
  Object.values(save.stats || {}).forEach(st => { if (st.last && dayKey(new Date(st.last)) === today) { n += 3; ok += [...st.h.slice(-3)].filter(c => c === '1').length; } });
  const fam = n ? `<b>Hoy:</b> ${n} respuestas · ${Math.round(100 * ok / n)} % a la primera${weakL.length ? ` · <b>Para practicar:</b> ${weakL.map(T => T.name).join(', ')}` : ''}` : '<b>Hoy</b> aún no practica.';
  const card = T => {
    const L = levelOf(T), inRep = T.learned() && !(save.repasoOff || []).includes(T.id);
    const stones = Array.from({ length: 5 }, (_, i) => `<i class="${i < L.stones ? 'on' : ''}" style="--i:${i}"></i>`).join('');
    return `<button class="tcard ${L.k}" data-t="${T.id}"><span class="temo">${L.emo}</span><span class="tbody"><b>${T.name}</b>
      <span class="road">${stones}<em style="--to:${L.stones}">${starSvg(true)}</em></span>
      <small><span class="tw">${L.word}</span>${L.p != null ? `<span class="tp">${L.p} %</span>` : ''}${inRep ? '<span class="trep" title="Entra al Repaso">🔁</span>' : ''}</small></span></button>`;
  };
  const el = frame(`<div class="pwrap avwrap">
    <p class="famline">👪 ${fam}</p>
    ${Object.keys(CH).map(ch => `<h3 class="sec">${CH[ch].label.replace(/<[^>]+>/g, '')}</h3><div class="tgrid">${TOPICS.filter(T => T.ch === +ch).map(card).join('')}</div>`).join('')}
    <div class="avfoot"><span>🔁 = entra al Repaso del día</span><button class="btn sm ghost" id="bRepSel">🔒 Elegir temas del Repaso</button></div>
    <p class="pnote">El porcentaje cuenta las últimas 20 respuestas de cada tema, a la primera.</p></div>`, 'fill');
  $$('.tcard', el).forEach(b => b.onclick = () => { const T = TOP[b.dataset.t], L = levelOf(T); sfx.tap(2); $$('.tcard', el).forEach(x => x.classList.toggle('sel', x === b)); (L.k === 'top' ? poli.cheer.bind(poli) : poli.say.bind(poli))(SAYS[L.k](T).replace('experta', gx('experta', 'experto'))); });
  $('#bRepSel', el).onclick = () => go('adultos', { from: 'avance', sec: 'kids', edit: root.cur });
  poli.say(weakL.length ? `¡Mira tu camino, ${save.name}! Vas muy bien. Toca un tema y te cuento.` : `¡Mira tu camino, ${save.name}! Toca un tema y te cuento.`);
}

/* ---------- Rincón de adultos ---------- */
let gatePrev = '';
function viewAdultos() {
  if (!cur.ok) {
    let a, b; do { a = rnd(6, 9); b = rnd(6, 9); } while (a === b || `${a}x${b}` === gatePrev); gatePrev = `${a}x${b}`;
    const el = frame(`<div class="agate"><div class="acard"><span class="alock">${ICO.lock}</span><h2>Solo para adultos</h2>
      <p>Para entrar, resuelve:</p><p class="aq">${a} × ${b} = ?</p>
      <div class="arow"><input id="ag" type="text" inputmode="numeric" maxlength="3" autocomplete="off" aria-label="Respuesta"><button class="btn sm" id="ago">Entrar</button></div>
      <p class="anote" id="amsg"></p></div></div>`, 'fill');
    let tries = 0;
    const tryIt = () => { if (+$('#ag').value.trim() === a * b) return go('adultos', { ...cur, ok: true }); tries++; $('#ag').value = ''; $('#amsg').textContent = tries >= 3 ? 'Esta parte es para adultos.' : 'No es correcto. Intenta otra vez.'; if (tries >= 3) setTimeout(() => go(cur.from || 'map'), 1200); };
    $('#ago').onclick = tryIt; $('#ag').onkeydown = e => { if (e.key === 'Enter') tryIt(); };
    return;
  }
  const narrow = innerWidth < 700;
  const SECS = [['kids', '👪', 'Jugadores', 'Crear, cambiar nombre, temas del Repaso, borrar'], ['news', '🔔', 'Novedades', 'Lo nuevo de la app'], ['backup', '💾', 'Respaldo', 'Guardar o cargar el progreso'],
    ['install', '📲', 'Instalar la app', 'Ícono en la pantalla y sin internet'], ['opinion', '⭐', 'Ayúdanos a mejorar', 'Opinión y reporte anónimo'], ['help', '🧭', 'Recorridos', 'Volver a ver la ayuda de Poli']];
  const sec = cur.sec || (narrow ? '' : 'kids');
  const nav = `<nav class="anav">${SECS.map(([k, e, t, s]) => `<button class="${k === sec ? 'on' : ''}" data-sec="${k}"><span class="ae">${e}</span><span><b>${t}</b>${narrow ? `<small>${s}</small>` : ''}</span>${narrow ? '<span class="chev">›</span>' : ''}</button>`).join('')}</nav>`;
  const kidRow = id => { const p = root.profiles[id], open = cur.edit === id, on = new Set(p.repasoOff || []);
    const keep = save; save = id === root.cur ? save : loadProfile(id); const learned = TOPICS.filter(T => T.learned()); const st = totalStars(); save = keep;
    return `<div class="krow ${open ? 'open' : ''}"><div class="khead"><span class="kav" style="--k:${kidColor(p.name)}">${p.name[0]}</span><b>${p.name}</b><span class="kg">${p.g === 'o' ? '👦 Niño' : '👧 Niña'}</span><span class="kst">★ ${st}</span><button class="btn sm ghost" data-ed="${id}">${open ? 'Listo' : 'Editar'}</button></div>
      ${open ? `<div class="kedit"><label>Nombre <input value="${p.name}" maxlength="14"></label><div class="kseg"><button class="${p.g !== 'o' ? 'on' : ''}">👧 Niña</button><button class="${p.g === 'o' ? 'on' : ''}">👦 Niño</button></div>
        <p class="klbl">Temas del Repaso del día</p><div class="kreps">${TOPICS.map(T => `<label class="${learned.includes(T) ? '' : 'dis'}"><input type="checkbox" ${learned.includes(T) && !on.has(T.id) ? 'checked' : ''} ${learned.includes(T) ? '' : 'disabled'}>${T.name}</label>`).join('')}</div>
        <div class="kfoot"><button class="btn sm danger">🗑️ Borrar a ${p.name}</button></div></div>` : ''}</div>`; };
  const body = {
    kids: `<h3>Jugadores <small>${root.order.length} de ${MAXPROFILES}</small></h3>${root.order.map(kidRow).join('')}<button class="btn sm green addk">+ Nuevo jugador</button>`,
    news: `<h3>Novedades</h3><p>Lo nuevo de cada versión de la app.</p><button class="btn sm ghost">🔔 Ver novedades</button>`,
    backup: `<h3>Respaldo del progreso</h3><p>Guarda un archivo con el progreso de todos los jugadores de este dispositivo. Sirve para pasarlo a otro dispositivo o recuperarlo si se borran los datos del navegador.</p><div class="pbtns"><button class="btn sm green">Guardar respaldo</button><button class="btn sm ghost">Cargar respaldo</button></div>`,
    install: `<h3>Instalar la app</h3><p>Al instalarla queda con su ícono en la pantalla de inicio y funciona sin internet.</p><ul class="psteps"><li><b>Android (Chrome):</b> menú ⋮ → <i>Instalar app</i>.</li><li><b>iPad o iPhone (Safari):</b> Compartir → <i>Agregar a inicio</i>.</li></ul>`,
    opinion: `<h3>Ayúdanos a mejorar</h3><p>¿Qué tanto recomendarías Aprende con Poli? El reporte no lleva nombres y nada se envía solo.</p><div class="rate">${'<span class="rs"><i class="rbg">★</i></span>'.repeat(5)}</div>`,
    help: `<h3>Recorridos</h3><div class="pbtns"><button class="btn sm ghost">🧭 Recorrido del mapa</button><button class="btn sm ghost">🧭 Recorrido de este rincón</button></div>`,
  }[sec] || '';
  const el = frame(`<div class="adult ${narrow ? 'narrow' : ''} ${narrow && sec ? 'detail' : ''}">${narrow && sec ? '' : nav}${sec ? `<section class="apanel">${body}</section>` : ''}</div>`, 'fill');
  cur.narrow = narrow;
  $$('[data-sec]', el).forEach(b => b.onclick = () => go('adultos', { ...cur, sec: b.dataset.sec, edit: null }));
  $$('[data-ed]', el).forEach(b => b.onclick = () => go('adultos', { ...cur, edit: cur.edit === b.dataset.ed ? null : b.dataset.ed }));
  $('#title').textContent = narrow && sec ? SECS.find(s => s[0] === sec)[2] : 'Rincón de adultos';
  $('#btnBack').hidden = false;
}
