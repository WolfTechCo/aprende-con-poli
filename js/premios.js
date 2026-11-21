'use strict';
/* =========================================================
   Mis premios (entrega 2): se llega tocando las estrellas del mapa o desde el menú «+».
   - Inicio: 4 tarjetas animadas (Mis stickers, Mis medallas, Ropa de Poli, Mi diploma) sobre un fondo con formas que se mueven.
     Más adelante este inicio se cambiará por el «Cuarto de Poli»: las pantallas de detalle quedan aparte para poder cambiar solo el inicio.
   - Detalles: Mis stickers (con pestañas de capítulos), Mis medallas y Ropa de Poli. Volver: detalle → Mis premios → mapa.
   - Poli no repite el nombre aquí (se acaba de decir en el mapa); solo lo dice el diploma, que celebra.
   ========================================================= */
const kidColor = nm => COLORS[[...(nm || '?')].reduce((a, c) => a + c.codePointAt(0), 0) % COLORS.length];
const rankOf = () => { const t = totalStars(), m = maxStars(); return t >= m ? gx('Reina', 'Rey') + ' de las formas' : t >= 40 ? gx('Maestra', 'Maestro') : t >= 15 ? gx('Exploradora', 'Explorador') : 'Aprendiz'; };

/* stickers de un capítulo: inicio, uno por isla con 3 estrellas y el del desafío perfecto */
const STAR_ICO = c => `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill="${c}" stroke="#1b9f72" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const TROPHY_ICO = () => `<svg viewBox="0 0 24 24"><path d="${trophyPath}" fill="#ffc233" stroke="#e09a00" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
const stickersOf = ch => {
  const C = CH[ch], [sn, ss] = C.sticker();
  return [
    { on: !!prog(C.intro).lesson, art: STAR_ICO('#34d399'), name: sn, sub: ss },
    ...C.figs.map(F => { const on = figStars(F.id) === 3; return { on, art: figSvg(F), name: F.short || cap(F.name), sub: on ? '¡Completo!' : '3 estrellas' }; }),
    { on: (save[C.chal] || 0) >= 3, art: TROPHY_ICO(), name: gx('Campeona', 'Campeón'), sub: 'Desafío perfecto' }];
};
const stickerCount = () => Object.keys(CH).reduce((a, ch) => a + stickersOf(ch).filter(s => s.on).length, 0);
const stickerMax = () => Object.keys(CH).reduce((a, ch) => a + stickersOf(ch).length, 0);

/* pestañas de capítulos con un resumen adentro (Mis stickers y Mi avance). Iguales a las del mapa;
   abren en el capítulo que está jugando. sum(k) → { done, html } */
const chapOf = () => CH[cur.ch] ? +cur.ch : CH[save.ch] ? +save.ch : 1;
function chapTabs(sel, sum) {
  return `<div class="ctabs" role="tablist">${Object.keys(CH).map(Number).map(k => { const s = sum(k);
    return `<button role="tab" aria-selected="${k === sel}" class="ctab ${k === sel ? 'on' : ''} ${s.done ? 'done' : ''}" data-ch="${k}"><span class="ct">${CH[k].label}</span><span class="cs">${s.html}</span></button>`; }).join('')}</div>`;
}

/* fondo con vida: estrellas y formas que flotan detrás de las tarjetas */
function prizeBg() {
  let h = '';
  for (let i = 0; i < 18; i++) {
    const k = i % 4, c = COLORS[i % 6], sz = 18 + (i * 13) % 28;
    const shape = k === 0 ? `<polygon points="${starPts(50, 52, 46)}" fill="#ffd54a"/>` : k === 1 ? `<circle cx="50" cy="50" r="40" fill="${c}"/>`
      : k === 2 ? `<polygon points="${rs(3, -90, 46)}" fill="${c}"/>` : `<polygon points="${dipSpark(50, 50, 46)}" fill="#fff"/>`;
    h += `<svg class="pf" viewBox="0 0 100 100" style="left:${(i * 61) % 96}%;top:${(i * 41 + 7) % 88}%;width:${sz}px;animation-duration:${5 + (i % 5) * 1.6}s;animation-delay:-${i * .7}s">${shape}</svg>`;
  }
  return `<div class="prizebg" aria-hidden="true">${h}</div>`;
}
const boing = b => { b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing'); };

/* ---------- inicio de Mis premios ---------- */
function viewPremios() {
  const got = medalsEarned(), acc = ACCS.filter(accOpen).length, { cur: racha } = streakInfo(), stk = stickerCount();
  const mini = ['tri', 'sq', 'pent', 'hex'].map(id => `<span>${figSvg(FIG[id])}</span>`).join('');
  const meds = [...MEDALS.filter(m => got.includes(m.id)), ...MEDALS.filter(m => !got.includes(m.id))].slice(0, 2);
  const card = (to, cls, art, t, n, sub = '') => `<button class="prize ${cls}" data-go="${to}"><span class="part">${art}</span><b>${t}</b><span class="pcount">${n}</span>${sub ? `<small>${sub}</small>` : ''}</button>`;
  const el = frame(`${prizeBg()}<div class="prizes">
    <p class="prank"><span>${starSvg(true)} ${totalStars()} de ${maxStars()}</span><b>${rankOf()}</b></p>
    <div class="pgrid">
      ${card('album', 'c1', `<span class="stkmini">${mini}</span>`, 'Mis stickers', `${stk} de ${stickerMax()}`)}
      ${card('medallas', 'c2', `<span class="medmini">${meds.map(m => `<i class="${got.includes(m.id) ? 'on' : ''}">${m.ico}</i>`).join('')}</span>`, 'Mis medallas', `${got.length} de ${MEDALS.length}`, racha >= 2 ? `🔥 ${racha} días seguidos` : '')}
      ${card('ropa', 'c3', `<span class="poliwear">${poliSvg(save.acc)}</span>`, 'Ropa de Poli', `${acc} de ${ACCS.length}`)}
      ${card('diploma', 'c4', '<span class="dipico">🎓</span>', 'Mi diploma', '¡Imprímelo!')}
    </div></div>`, 'fill premios');
  $$('.prize', el).forEach((b, i) => {
    b.style.animationDelay = `${i * .08}s, ${-i * 1.1}s`; b.style.animationDuration = `.5s, ${3.6 + i * .5}s`; // cada tarjeta flota a su ritmo
    b.onclick = () => { boing(b); sfx.tap(i); setTimeout(() => b.dataset.go === 'diploma' ? openDiploma() : go(b.dataset.go), 260); };
  });
  poli.say(totalStars() || got.length ? '¡Mira todo lo que has ganado! Toca una tarjeta para verla.' : '¡Aquí se guardan tus premios! Toca una tarjeta para verla.');
}

/* ---------- Mis stickers (por capítulo) ---------- */
function viewAlbum() {
  const ch = chapOf(), list = stickersOf(ch), n = list.filter(s => s.on).length;
  const el = frame(`<div class="tabwrap">${chapTabs(ch, k => { const l = stickersOf(k), m = l.filter(s => s.on).length; return { done: m === l.length, html: m === l.length ? '✓ ¡Completo!' : `${m} de ${l.length}` }; })}
    <div class="stkgrid">${list.map((s, i) => `<div class="stk ${s.on ? 'on' : 'off'}" style="animation-delay:${i * .05}s">${s.art}<b>${s.name}</b><small>${s.sub}</small></div>`).join('')}</div></div>`, 'fill');
  $$('.ctab', el).forEach(b => b.onclick = () => go('album', { ch: +b.dataset.ch }));
  poli.say(n === list.length ? '¡Completaste todos los stickers de este capítulo!' : 'Completa las tres estrellas de cada isla para ganar su sticker.');
}

/* ---------- Mis medallas ---------- */
function viewMedallas() {
  const { cur: racha, best } = streakInfo(), now = medalsEarned();
  const el = frame(`${prizeBg()}<div class="medwrap">
    <p class="streak">🔥 <b>${racha} ${racha === 1 ? 'día seguido' : 'días seguidos'}</b><span>Mejor racha: ${best}</span></p>
    <div class="medgrid">${MEDALS.map((m, i) => `<button class="medal2 ${now.includes(m.id) ? 'on' : ''}" data-i="${i}" style="animation-delay:${i * .05}s, ${-i * .4}s"><span>${m.ico}</span><b>${m.name}</b><small>${now.includes(m.id) ? '¡Ganada!' : m.how}</small></button>`).join('')}</div></div>`, 'fill premios');
  $$('.medal2', el).forEach(b => b.onclick = () => {
    const m = MEDALS[b.dataset.i]; boing(b);
    if (now.includes(m.id)) { sfx.ok(); poli.cheer(`¡Medalla ${m.name}! Te la ganaste.`); } else { sfx.tap(2); poli.say(`Para ganarla: ${m.how.toLowerCase()}.`); }
  });
  poli.say(`Tienes ${now.length} de ${MEDALS.length} medallas. Toca una para saber cómo se gana.`);
}

/* ---------- Ropa de Poli ---------- */
function viewRopa() {
  const item = a => accOpen(a)
    ? `<button class="acc2 ${save.acc === a.id ? 'on' : ''}" data-a="${a.id}" aria-pressed="${save.acc === a.id}"><span>${a.ico}</span><b>${a.name}</b></button>`
    : `<button class="acc2 lock" data-lock="${a.id}"><span>🔒</span><b>${a.name}</b><small>${medalName(a.medal)}</small></button>`;
  const el = frame(`${prizeBg()}<div class="ropawrap"><div class="mirror"><div class="mpoli2">${poliSvg(save.acc)}</div><div class="mshadow"></div></div>
    <div class="closet2"><button class="acc2 ${save.acc ? '' : 'on'}" data-a="" aria-pressed="${!save.acc}"><span>🙂</span><b>Poli normal</b></button>${ACCS.map(item).join('')}</div></div>`, 'fill premios');
  $$('[data-a]', el).forEach(b => b.onclick = () => {
    save.acc = b.dataset.a; persist(); refreshPoli(); sfx.ok(); boing(b);
    $('.mpoli2', el).innerHTML = poliSvg(save.acc); boing($('.mirror', el));
    $$('[data-a]', el).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    poli.cheer(save.acc ? '¡Me encanta! ¡Gracias!' : 'Poli normal, ¡siempre contenta!');
  });
  $$('[data-lock]', el).forEach(b => b.onclick = () => { const a = ACC[b.dataset.lock]; sfx.bad(); boing(b); poli.say(`Se desbloquea con la medalla ${medalName(a.medal)}.`); });
  poli.say('¿Qué me pongo hoy? Elige mi ropa.');
}
