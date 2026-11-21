'use strict';
/* =========================================================
   Capítulo 5: Multiplicación — sumas que se repiten, ¿es multiplicación?, la tabla del 2 y las tablas del 5 y del 10.
   Sigue el orden del texto de 2° básico (Lección «Multiplicación», editorial SM) como referencia de método, con
   ejercicios, textos y dibujos propios: contar de a grupos → suma de iguales → «veces» → el signo «·» (se lee «por»).
   Se enchufa al mismo motor de los capítulos 3 y 4 (islas tipo 'num', NQ, NUMLESSON, NUMGAME, quizGame, runSteps).
   Reglas para que siempre haya UNA sola respuesta correcta:
   - En los dibujos, el primer número dice las veces (grupos o filas) y el segundo cuánto hay en cada uno: 3 · 2 = 3 veces 2.
   - Nunca se ofrece la multiplicación «dada vuelta» (2 · 3 en vez de 3 · 2) como respuesta incorrecta.
   - En las tablas se pregunta por el resultado (el orden no lo cambia: se descubre en la isla 2).
   - Todos los números llegan hasta 100.
   Para sumar otra isla: agregarla a MULS, a CH[5].nodes, y definir su lección (NUMLESSON), juegos (NUMGAME),
   ícono (MICON) y preguntas (NQ.xx, con su tema en N_TOPIC).
   ========================================================= */

/* el signo de la multiplicación: el punto, como en los libros del colegio (Poli dice «por») */
const ex = (a, b) => `${a}<i class="por">·</i>${b}`;
const exV = (a, b) => `${a} por ${b}`;
const sumH = (n, g) => Array(g).fill(n).join(' + ');
const vez = (g, n) => `${g} ${g === 1 ? 'vez' : 'veces'} ${n}`;

/* ---------- dibujos propios ---------- */
/* cosas que se agrupan (cada una con su recipiente) */
const MTH = [
  { k: 'sopa', one: 'sopaipilla', pl: 'sopaipillas', f: 1, cont: 'plato', conts: 'platos' },
  { k: 'fruti', one: 'frutilla', pl: 'frutillas', f: 1, cont: 'plato', conts: 'platos' },
  { k: 'galle', one: 'galleta', pl: 'galletas', f: 1, cont: 'plato', conts: 'platos' },
  { k: 'huevo', one: 'huevo', pl: 'huevos', f: 0, cont: 'nido', conts: 'nidos' },
];
const itemSvg = (k, x, y) => ({
  sopa: `<g transform="translate(${x} ${y})"><circle r="9.5" fill="#f2b14c" stroke="#c9822a" stroke-width="2"/><circle r="4.5" fill="#f9d58d"/><circle cx="-4" cy="-1" r="1.2" fill="#c9822a"/><circle cx="3" cy="3" r="1.2" fill="#c9822a"/></g>`,
  fruti: `<g transform="translate(${x} ${y})"><path d="M-8.5 -3Q0 15 8.5 -3Q4 -9.5 0 -6Q-4 -9.5 -8.5 -3z" fill="#ff4d5e" stroke="#d62f42" stroke-width="1.6"/><path d="M-5 -6.5L0 -11L5 -6.5L0 -4.5z" fill="#22c58b"/><circle cx="-3" cy="0" r="1" fill="#ffe08a"/><circle cx="3" cy="1" r="1" fill="#ffe08a"/><circle cx="0" cy="5" r="1" fill="#ffe08a"/></g>`,
  galle: `<g transform="translate(${x} ${y})"><circle r="9.5" fill="#d49a5a" stroke="#a86b2e" stroke-width="2"/><circle cx="-3.5" cy="-2.5" r="1.8" fill="#5b3418"/><circle cx="3" cy="-3" r="1.5" fill="#5b3418"/><circle cx="1" cy="3.5" r="1.8" fill="#5b3418"/></g>`,
  huevo: `<g transform="translate(${x} ${y})"><ellipse rx="7.5" ry="9.5" fill="#fffaf0" stroke="#d9c39a" stroke-width="2"/><ellipse cx="-2.5" cy="-3.5" rx="2" ry="3" fill="#fff" opacity=".9"/></g>`,
})[k];
const contSvg = cont => cont === 'nido'
  ? '<ellipse rx="46" ry="27" fill="#c98a4b" stroke="#8a5a2b" stroke-width="3"/><path d="M-38 -6Q-20 4 0 -2T38 -6M-36 8Q-16 16 4 10T36 8" fill="none" stroke="#8a5a2b" stroke-width="2.4" stroke-linecap="round"/><ellipse rx="34" ry="17" fill="#e0a868" opacity=".55"/>'
  : '<ellipse rx="46" ry="28" fill="#fff" stroke="#9fc3ff" stroke-width="3.5"/><ellipse rx="34" ry="19" fill="none" stroke="#dce9ff" stroke-width="2.5"/>';
/* posiciones de n cosas (1 a 6) dentro de un recipiente */
const mSpots = n => { const top = n <= 3 ? n : Math.ceil(n / 2), rows = n <= 3 ? [n] : [top, n - top], S = 21;
  return rows.flatMap((m, r) => Array.from({ length: m }, (_, i) => [(i - (m - 1) / 2) * S, rows.length === 1 ? 0 : r ? 10 : -9])); };
const GW = 104, GH = 72;
/* sizes: cuántas cosas en cada recipiente (iguales o no). cols: recipientes por fila. tap: para tocarlos en la lección */
function grpSvg(sizes, th, { cols = Math.min(sizes.length, 5), cls = '', tap = false } = {}) {
  const rows = Math.ceil(sizes.length / cols);
  const g = sizes.map((n, i) => { const cx = GW / 2 + (i % cols) * GW, cy = GH / 2 + 4 + Math.floor(i / cols) * GH;
    return `<g class="pl" data-i="${i}" transform="translate(${cx} ${cy})">${contSvg(th.cont)}${mSpots(n).map(([x, y]) => itemSvg(th.k, x, y)).join('')}${tap ? '<text class="plc" y="-33" text-anchor="middle"></text><rect x="-52" y="-36" width="104" height="72" fill="transparent"/>' : ''}</g>`; }).join('');
  return `<svg viewBox="0 ${tap ? -26 : 0} ${cols * GW} ${rows * GH + 8 + (tap ? 26 : 0)}" class="grp mg ${cls}">${g}</svg>`;
}
/* filas de puntos (arreglos): r filas de c */
function arrSvg(r, c, { band = false, col = '#ff8a3d', dk = '#e0651a' } = {}) {
  const S = 26, P = 8;
  const bands = band ? Array.from({ length: r }, (_, i) => `<rect x="2" y="${P / 2 + i * S + 1}" width="${c * S + P - 4}" height="${S - 2}" rx="12" fill="#fff3c4" stroke="#ffd36b" stroke-width="1.6"/>`).join('') : '';
  const dots = Array.from({ length: r * c }, (_, i) => `<circle cx="${P / 2 + S / 2 + (i % c) * S}" cy="${P / 2 + S / 2 + Math.floor(i / c) * S}" r="9.5" fill="${col}" stroke="${dk}" stroke-width="2"/>`).join('');
  return `<svg viewBox="0 0 ${c * S + P} ${r * S + P}" class="grp mg arr" style="--c:${c};--r:${r}">${bands}${dots}</svg>`;
}
/* bicicletas: cada una con 2 ruedas */
function bikeSvg(k) {
  const cols = Math.min(k, 5), W = 64, H = 44;
  const one = (x, y, c) => `<g transform="translate(${x} ${y})" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="13" cy="28" r="10.5" fill="#fff" stroke="#2b2d6e" stroke-width="3.2"/><circle cx="47" cy="28" r="10.5" fill="#fff" stroke="#2b2d6e" stroke-width="3.2"/>
    <path d="M13 28L24 13H41L47 28M24 13L30 28H13M30 28L41 13" fill="none" stroke="${c}" stroke-width="3.6"/><path d="M20 9h8M41 13l-2 -6h6" fill="none" stroke="#2b2d6e" stroke-width="3"/></g>`;
  return `<svg viewBox="0 0 ${cols * W} ${Math.ceil(k / cols) * H}" class="grp mg bikes">${Array.from({ length: k }, (_, i) => one((i % cols) * W, Math.floor(i / cols) * H, COLORS[i % 6])).join('')}</svg>`;
}
/* sobres de láminas: t = 5 (una fila) o 10 (dos filas de 5, como la decena) */
function sobreSvg(k, t, cols = Math.min(k, 5)) {
  const W = 86, h = t === 10 ? 46 : 28, H = h + 10;
  const one = (x, y, c) => `<g transform="translate(${x} ${y})"><rect x="2" y="2" width="78" height="${h}" rx="9" fill="${c}" opacity=".22"/><rect x="2" y="2" width="78" height="${h}" rx="9" fill="none" stroke="${c}" stroke-width="2.6"/>
    ${Array.from({ length: t }, (_, i) => `<rect x="${8 + (i % 5) * 14.5}" y="${7 + Math.floor(i / 5) * 18}" width="11" height="14" rx="2.5" fill="#ffc233" stroke="#e09a00" stroke-width="1.6"/>`).join('')}</g>`;
  return `<svg viewBox="0 0 ${cols * W} ${Math.ceil(k / cols) * H}" class="grp mg sobres">${Array.from({ length: k }, (_, i) => one((i % cols) * W, Math.floor(i / cols) * H, COLORS[(i + 3) % 6])).join('')}</svg>`;
}
/* «parte y suma»: t · k = t · a + t · b */
const partHtml = (t, k, a, { miss = false, sums = false } = {}) => `<div class="ptree"><b>${ex(t, k)}</b><span class="parr">↓</span>
  <span class="prow">${ex(t, a)} <i>+</i> ${ex(t, miss ? '<span class="mq">?</span>' : k - a)}</span>${sums ? `<span class="parr">↓</span><span class="prow">${t * a} <i>+</i> ${t * (k - a)} <i>=</i> <span class="mq">?</span></span>` : ''}</div>`;
const bigQ = (html, sub = '') => `<div class="nshape"><div class="mbig">${html}</div>${sub ? `<span class="mcap">${sub}</span>` : ''}</div>`;
const capOf = txt => `<span class="mcap">${txt}</span>`;

/* ---------- opciones ---------- */
function mOpts(right, cands, say, hint) {
  const w = [];
  for (const v of [...shuffle(cands), right + 1, right - 1, right + 2, right + 3]) if (v !== right && v > 0 && v <= 100 && !w.includes(v) && w.length < 2) w.push(v);
  return shuffle([right, ...w]).map(v => ({ html: v, ok: v === right, say, hint }));
}
const prodOpts = (g, n, say, hint) => mOpts(g * n, [g * n + n, g * n - n, g + n, g * n + g, g * n - g], say, hint);
const unequal = (g, n) => { // g grupos casi iguales, uno distinto (siempre se nota)
  const s = Array(g).fill(n), i = rnd(0, g - 1); s[i] = n + (n > 2 && Math.random() < .5 ? -rnd(1, n - 1) : rnd(1, 2)); return s; };

/* ---------- preguntas (juegos, Repaso y Gran Desafío) ---------- */
function msQ(type) {
  const th = pick(MTH, 1)[0], g = rnd(2, 5), n = rnd(2, 5), cols = g === 4 ? 2 : Math.min(g, 5), pic = grpSvg(Array(g).fill(n), th, { cols });
  const say = `¡Sí! Son ${vez(g, n)}: ${exV(g, n)} es ${g * n}.`, hint = `Cuenta los ${th.conts}: son las veces. Después mira cuántas cosas hay en cada uno.`;
  if (type === 'sum') {
    const wrong = [[g + 1, n], [g - 1, n], [g, n + 1], [g, n - 1]].filter(([a, b]) => a >= 2 && b >= 1 && !(a === g && b === n));
    return { prompt: '¿Qué suma muestra el dibujo?', voice: '¿Qué suma muestra el dibujo?', cls: 'txt msum2', shape: `<div class="nshape">${pic}</div>`,
      opts: shuffle([{ html: sumH(n, g), ok: true, say: `¡Sí! ${g} ${th.conts} con ${n}: ${sumH(n, g).replace(/\+/g, 'más')}.` },
        ...pick(wrong, 2).map(([a, b]) => ({ html: sumH(b, a), ok: false, hint: `Mira: hay ${g} ${th.conts} y en cada uno hay ${n}.` }))]) };
  }
  if (type === 'mul') {
    const wrong = [[g + 1, n], [g - 1, n], [g, n + 1], [g, n - 1]].filter(([a, b]) => a >= 1 && b >= 1 && !(a === g && b === n) && !(a === n && b === g));
    return { prompt: '¿Qué multiplicación muestra?', voice: '¿Qué multiplicación muestra el dibujo?', cls: 'txt', shape: `<div class="nshape">${pic}</div>`,
      opts: shuffle([{ html: ex(g, n), ok: true, say }, ...pick(wrong, 2).map(([a, b]) => ({ html: ex(a, b), ok: false, hint: `Primero van las veces: cuántos ${th.conts} hay. Después, cuánto hay en cada uno.` }))]) };
  }
  if (type === 'tot') return { prompt: `${th.f ? '¿Cuántas' : '¿Cuántos'} ${th.pl} hay?`,
    shape: `<div class="nshape">${pic}${capOf(`${vez(g, n)}`)}</div>`, opts: prodOpts(g, n, say, `Cuenta de ${n} en ${n}.`) };
  // pic: ¿qué dibujo muestra g · n? (los incorrectos nunca son el dibujo dado vuelta)
  const g2 = rnd(2, 4), n2 = rnd(2, 4), mk = (a, b) => grpSvg(Array(a).fill(b), th, { cols: a <= 2 ? a : 2, cls: 'mgo' });
  const wrong = pick([[g2 + 1, n2], [g2 - 1, n2], [g2, n2 + 1], [g2, n2 - 1]].filter(([a, b]) => a >= 1 && b >= 1 && a <= 5 && b <= 5 && !(a === n2 && b === g2)), 2);
  return { prompt: `¿Qué dibujo muestra ${ex(g2, n2)}?`, voice: `¿Qué dibujo muestra ${exV(g2, n2)}?`,
    opts: shuffle([{ html: mk(g2, n2), ok: true, say: `¡Sí! ${g2} ${th.conts} con ${n2} cada uno.` }, ...wrong.map(([a, b]) => ({ html: mk(a, b), ok: false, hint: `Busca ${g2} ${th.conts} y ${n2} en cada uno.` }))]) };
}
function meQ(type) {
  const th = pick(MTH, 1)[0];
  if (type === 'not' || type === 'yes') {
    const mk = s => grpSvg(s, th, { cols: s.length <= 2 ? s.length : 2, cls: 'mgo' });
    const eq = () => Array(rnd(2, 4)).fill(rnd(2, 4)), uq = () => unequal(rnd(2, 4), rnd(2, 4));
    const odd = type === 'not' ? uq() : eq(), seen = new Set([odd.join()]), rest = [];
    while (rest.length < 2) { const s = type === 'not' ? eq() : uq(); if (!seen.has(s.join())) { seen.add(s.join()); rest.push(s); } } // tres dibujos distintos
    return { prompt: type === 'not' ? '¿Cuál NO es multiplicación?' : '¿Cuál sí es multiplicación?',
      opts: shuffle([{ html: mk(odd), ok: true, say: type === 'not' ? '¡Sí! Ahí los grupos no tienen lo mismo.' : '¡Sí! Todos los grupos tienen lo mismo.' },
        ...rest.map(s => ({ html: mk(s), ok: false, hint: type === 'not' ? 'Ahí todos los grupos tienen lo mismo: sí es multiplicación.' : 'Mira bien: ahí un grupo tiene distinto.' }))]) };
  }
  const r = rnd(2, 5), c = rnd(2, 6);
  if (type === 'arr') {
    const wrong = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]].filter(([a, b]) => a >= 1 && b >= 1 && !(a === r && b === c) && !(a === c && b === r));
    return { prompt: '¿Qué multiplicación muestran las filas?', cls: 'txt', shape: `<div class="nshape">${arrSvg(r, c, { band: true })}</div>`,
      opts: shuffle([{ html: ex(r, c), ok: true, say: `¡Sí! ${r} filas de ${c}: ${exV(r, c)} es ${r * c}.` }, ...pick(wrong, 2).map(([a, b]) => ({ html: ex(a, b), ok: false, hint: 'Cuenta las filas primero. Después, cuántos puntos tiene cada fila.' }))]) };
  }
  // turn: el mismo arreglo girado
  const c2 = c === r ? c + 1 : c;
  return { prompt: '¿Cuántos puntos hay en cada uno?', shape: `<div class="nshape mturn">${arrSvg(r, c2, {})}<span class="mrot">↻</span>${arrSvg(c2, r, { col: '#4ea8ff', dk: '#2a7fd6' })}</div>`,
    opts: mOpts(r * c2, [r * c2 + r, r * c2 - c2, r + c2, r * c2 + 1], `¡Sí! ${exV(r, c2)} y ${exV(c2, r)} dan ${r * c2}. ¡Al girar da lo mismo!`, 'Es el mismo grupo de puntos, solo que girado. Cuenta uno de los dos.') };
}
function partQ(t, mode) {
  const k = rnd(3, 10), a = pick([...new Set([5, 2, 1, Math.floor(k / 2)])].filter(x => x > 0 && x < k), 1)[0], b = k - a;
  const say = `¡Sí! ${exV(t, k)} es ${exV(t, a)} más ${exV(t, b)}: ${t * a} más ${t * b}, ${t * k}.`;
  if (mode === 'miss') return { prompt: '¿Qué número falta?', voice: `Partimos ${exV(t, k)}. ¿Qué número falta?`, shape: `<div class="nshape">${partHtml(t, k, a, { miss: true })}</div>`,
    opts: mOpts(b, [b + 1, b - 1, k, a, b + 2], `¡Sí! ${k} es ${a} más ${b}.`, `Piensa: ${a} más cuánto da ${k}.`) };
  return { prompt: 'Parte y suma', voice: `Partimos ${exV(t, k)} en dos. ¿Cuánto es?`, shape: `<div class="nshape">${partHtml(t, k, a, { sums: true })}</div>`,
    opts: mOpts(t * k, [t * k + t, t * k - t, t * a, t * b, t * k + 1], say, `Suma ${t * a} más ${t * b}.`) };
}
function resQ(t) {
  const k = rnd(1, 10);
  return { prompt: '¿Cuánto es?', voice: `¿Cuánto es ${exV(t, k)}?`, shape: bigQ(`${ex(t, k)} <i>=</i> <span class="mq">?</span>`),
    opts: mOpts(t * k, [t * k + t, t * k - t, t + k, t * (k + 1), t * k + 1], `¡Sí! ${exV(t, k)} es ${t * k}.`, `Cuenta de ${t} en ${t}, ${k} ${k === 1 ? 'vez' : 'veces'}.`) };
}
function seqQ(t) {
  const s0 = rnd(1, 5), vals = Array.from({ length: 5 }, (_, i) => t * (s0 + i)), i = rnd(1, 4);
  return { prompt: '¿Qué número falta?', voice: `Contamos de ${t} en ${t}. ¿Qué número falta?`, shape: `<div class="nshape">${seqHtml(vals, { miss: [i], hops: true })}</div>`,
    opts: mOpts(vals[i], [vals[i] + 1, vals[i] - 1, vals[i] + t, vals[i] - t, vals[i] + 10], `¡Sí! De ${t} en ${t}: ${vals[i]}.`, `Mira: cada número tiene ${t} más que el anterior.`) };
}
function bikeQ() {
  const k = rnd(2, 10);
  return { prompt: '¿Cuántas ruedas hay?', shape: `<div class="nshape">${bikeSvg(k)}${capOf(`${k} bicicletas`)}</div>`,
    opts: mOpts(2 * k, [2 * k + 2, 2 * k - 2, k, 2 * k + 1], `¡Sí! ${vez(k, 2)} son ${2 * k} ruedas.`, 'Cada bicicleta tiene 2 ruedas. Cuenta de 2 en 2.') };
}
function sobreQ() {
  const t = pick([5, 10], 1)[0], k = rnd(2, t === 5 ? 8 : 6);
  return { prompt: '¿Cuántas láminas hay?', shape: `<div class="nshape">${sobreSvg(k, t)}${capOf(`${k} sobres de ${t}`)}</div>`,
    opts: mOpts(t * k, [t * k + t, t * k - t, t + k, t * k + 1], `¡Sí! ${vez(k, t)} son ${t * k}.`, `Cuenta de ${t} en ${t}: un sobre, otro sobre…`) };
}
function endQ() {
  const t = pick([5, 10], 1)[0], right = t * rnd(1, 10);
  const pool = Array.from({ length: 96 }, (_, i) => i + 3).filter(v => v % t && Math.abs(v - right) <= 12);
  const wrong = pick(pool, 2);
  return { prompt: `¿Cuál es de la tabla del ${t}?`, voice: `¿Cuál número es de la tabla del ${t}?`,
    shape: bigQ(`${t}, ${2 * t}, ${3 * t}<i>…</i>`, t === 5 ? 'Terminan en 5 o en 0' : 'Siempre terminan en 0'),
    opts: shuffle([right, ...wrong]).map(v => ({ html: v, ok: v === right, say: `¡Sí! ${right} es de la tabla del ${t}.`, hint: t === 5 ? 'La tabla del 5 termina en 5 o en 0.' : 'La tabla del 10 siempre termina en 0.' })) };
}
/* cuentos de multiplicar: el dibujo muestra los grupos */
const STORIES = [
  { t: 2, ico: '🐦', a: 'Cada pájaro tiene 2 alas.', q: k => `¿Cuántas alas tienen ${k} pájaros?` },
  { t: 2, ico: '🧦', a: 'Un par de calcetines son 2.', q: k => `¿Cuántos calcetines hay en ${k} pares?` },
  { t: 5, ico: '🖐️', a: 'Una mano tiene 5 dedos.', q: k => `¿Cuántos dedos hay en ${k} manos?` },
  { t: 5, ico: '⭐', a: 'Cada estrella tiene 5 puntas.', q: k => `¿Cuántas puntas tienen ${k} estrellas?` },
  { t: 10, ico: '📦', a: 'Cada caja trae 10 lápices.', q: k => `¿Cuántos lápices hay en ${k} cajas?` },
  { t: 10, ico: '🧺', a: 'Cada canasto tiene 10 manzanas.', q: k => `¿Cuántas manzanas hay en ${k} canastos?` },
];
function storyQ() {
  const S = pick(STORIES, 1)[0], k = rnd(2, 9), t = S.t;
  return { prompt: 'Cuento de multiplicar', voice: `${S.a} ${S.q(k)}`,
    shape: `<div class="nshape"><p class="mstory">${S.a} <b>${S.q(k)}</b></p><div class="memo">${Array(k).fill(`<span>${S.ico}</span>`).join('')}</div></div>`,
    opts: mOpts(t * k, [t * k + t, t * k - t, t + k, t * k + 1], `¡Sí! ${vez(k, t)} son ${t * k}.`, `Piensa: ${vez(k, t)}. Cuenta de ${t} en ${t}.`) };
}
Object.assign(NQ, {
  ms_sum: () => msQ('sum'), ms_mul: () => msQ('mul'), ms_tot: () => msQ('tot'), ms_pic: () => msQ('pic'),
  me_not: () => meQ('not'), me_yes: () => meQ('yes'), me_arr: () => meQ('arr'), me_turn: () => meQ('turn'),
  m2_bike: bikeQ, m2_res: () => resQ(2), m2_part: () => partQ(2, pick(['miss', 'sum'], 1)[0]), m2_seq: () => seqQ(2),
  m5_bar: sobreQ, m5_res: () => resQ(pick([5, 10], 1)[0]), m5_end: endQ, m5_seq: () => seqQ(pick([5, 10], 1)[0]), m5_part: () => partQ(pick([5, 10], 1)[0], pick(['miss', 'sum'], 1)[0]), m5_prob: storyQ,
});
Object.assign(N_TOPIC, { ms_sum: 'msuma', ms_mul: 'msuma', ms_tot: 'msuma', ms_pic: 'msuma', me_not: 'mesmul', me_yes: 'mesmul', me_arr: 'mesmul', me_turn: 'mesmul',
  m2_bike: 'mtabla2', m2_res: 'mtabla2', m2_part: 'mtabla2', m2_seq: 'mtabla2', m5_bar: 'mtabla510', m5_res: 'mtabla510', m5_end: 'mtabla510', m5_seq: 'mtabla510', m5_part: 'mtabla510', m5_prob: 'mtabla510' });

/* ---------- islas del capítulo ---------- */
const MULS = [
  { id: 'msuma', title: 'Sumas que se repiten', short: 'Sumas iguales', isle: 'las sumas que se repiten', c: '#ff8a3d', d: '#e0651a', l: '#ffdcc4',
    chips: ['2 + 2 + 2', '3 veces 2'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'De la suma a la multiplicación' }, { k: 'g1', t: 'Suma y por', sub: 'Elige la suma y la multiplicación' }, { k: 'g2', t: '¿Cuál es el dibujo?', sub: 'Encuentra el dibujo que calza' }] },
  { id: 'mesmul', title: '¿Es multiplicación?', short: '¿Es multiplicación?', isle: 'los grupos y las filas', c: '#4ea8ff', d: '#2a7fd6', l: '#cfe6ff',
    chips: ['Grupos iguales', 'Filas'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'Grupos iguales y filas' }, { k: 'g1', t: 'Detective de grupos', sub: 'Descubre cuál sí y cuál no' }, { k: 'g2', t: 'Gira la fila', sub: 'Filas que dan lo mismo' }] },
  { id: 'mtabla2', title: 'La tabla del 2', short: 'Tabla del 2', isle: 'la tabla del 2', c: '#2ec4b6', d: '#1f9e92', l: '#c3f1ec',
    chips: ['2, 4, 6…', 'Parte y suma'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'Ruedas de 2 en 2' }, { k: 'g1', t: 'Ruedas y más ruedas', sub: 'Cuenta de 2 en 2' }, { k: 'g2', t: 'Parte y suma', sub: 'Parte el número y suma' }] },
  { id: 'mtabla510', title: 'Las tablas del 5 y del 10', short: 'Tablas 5 y 10', isle: 'las tablas del 5 y del 10', c: '#9b6bff', d: '#7447e0', l: '#e0d3ff',
    chips: ['5, 10, 15…', '10, 20, 30…'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'Sobres de 5 y de 10' }, { k: 'g1', t: 'Sobres de láminas', sub: 'Cuenta de 5 en 5 y de 10 en 10' }, { k: 'g2', t: 'Cuentos de multiplicar', sub: 'Problemas para resolver' }] },
].map(T => ({ ...T, kind: 'num', name: T.title, ch: 5 }));
/* íconos de la tarjeta del juego 1 de cada isla */
const MICO = {
  msuma: '<svg viewBox="0 0 24 24"><ellipse cx="7" cy="12" rx="5.5" ry="3.6" fill="#fff" stroke="#9fc3ff" stroke-width="1.4"/><ellipse cx="17" cy="12" rx="5.5" ry="3.6" fill="#fff" stroke="#9fc3ff" stroke-width="1.4"/><circle cx="5.3" cy="12" r="1.6" fill="#f2b14c"/><circle cx="8.7" cy="12" r="1.6" fill="#f2b14c"/><circle cx="15.3" cy="12" r="1.6" fill="#f2b14c"/><circle cx="18.7" cy="12" r="1.6" fill="#f2b14c"/></svg>',
  mesmul: '<svg viewBox="0 0 24 24">' + [0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<circle cx="${4.5 + c * 5}" cy="${7 + r * 5}" r="1.9" fill="#4ea8ff"/>`).join('')).join('') + '</svg>',
  mtabla2: '<svg viewBox="0 0 24 24"><circle cx="6" cy="15" r="4.2" fill="none" stroke="#2b2d6e" stroke-width="1.8"/><circle cx="18" cy="15" r="4.2" fill="none" stroke="#2b2d6e" stroke-width="1.8"/><path d="M6 15l4.5-6h6L18 15M10.5 9l2.5 6H6" fill="none" stroke="#2ec4b6" stroke-width="2" stroke-linejoin="round"/></svg>',
  mtabla510: '<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="3" fill="#e0d3ff" stroke="#9b6bff" stroke-width="1.5"/>' + Array.from({ length: 10 }, (_, i) => `<rect x="${4 + (i % 5) * 3.4}" y="${8 + Math.floor(i / 5) * 4.4}" width="2.6" height="3.4" rx=".6" fill="#ffc233"/>`).join('') + '</svg>',
};
MULS.forEach(T => { FIG[T.id] = T; T.ico = { g1: MICO[T.id] }; });
/* dibujo de cada isla (mapa, isla y stickers); white = blanco sobre el color de la burbuja del mapa */
const MICON = {
  msuma: w => [[25, 34], [75, 34], [50, 74]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="23" ry="15" fill="${w ? '#fff' : '#fff'}" ${w ? '' : 'stroke="#9fc3ff" stroke-width="3"'}/>` + [-7, 7].map(d => `<circle cx="${x + d}" cy="${y}" r="5.5" fill="${w ? 'rgba(43,45,110,.35)' : '#f2b14c'}" ${w ? '' : 'stroke="#c9822a" stroke-width="1.5"'}/>`).join('')).join(''),
  mesmul: w => Array.from({ length: 12 }, (_, i) => `<circle cx="${17 + (i % 4) * 22}" cy="${28 + Math.floor(i / 4) * 22}" r="8.5" fill="${w ? '#fff' : '#4ea8ff'}" ${w ? '' : 'stroke="#2a7fd6" stroke-width="2.5"'}/>`).join(''),
  mtabla2: w => `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="62" r="17" fill="none" stroke="${w ? '#fff' : '#2b2d6e'}" stroke-width="6"/><circle cx="76" cy="62" r="17" fill="none" stroke="${w ? '#fff' : '#2b2d6e'}" stroke-width="6"/><path d="M24 62L42 36H68L76 62M42 36L52 62H24M52 62L68 36" fill="none" stroke="${w ? '#fff' : '#2ec4b6'}" stroke-width="7"/><path d="M34 28h14" stroke="${w ? '#fff' : '#2b2d6e'}" stroke-width="6"/></g>`,
  mtabla510: w => `<rect x="6" y="20" width="88" height="60" rx="12" fill="${w ? 'rgba(255,255,255,.25)' : '#e0d3ff'}" stroke="${w ? '#fff' : '#9b6bff'}" stroke-width="4"/>` + Array.from({ length: 10 }, (_, i) => `<rect x="${14 + (i % 5) * 15.5}" y="${28 + Math.floor(i / 5) * 24}" width="12" height="19" rx="3" fill="${w ? '#fff' : '#ffc233'}" ${w ? '' : 'stroke="#e09a00" stroke-width="1.8"'}/>`).join(''),
};
const _numIconMul = numIcon;
numIcon = (id, white) => MICON[id] ? `<svg viewBox="0 0 100 100">${MICON[id](white)}</svg>` : _numIconMul(id, white);
CH[5] = {
  nodes: ['intro5', ...MULS.map(T => T.id), 'challengeMul'], intro: 'intro5', chal: 'challengeMul', figs: MULS, label: '<span class="cn">5 · </span>Multiplicación', nm: 'Multiplicación',
  ico: '<svg viewBox="0 0 24 24"><rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#ff8a3d"/>' + Array.from({ length: 6 }, (_, i) => `<circle cx="${7 + (i % 3) * 5}" cy="${9.5 + Math.floor(i / 3) * 5}" r="1.9" fill="#fff"/>`).join('') + '</svg>',
  introLabel: 'Multiplicar', sticker: () => [gx('Multiplicadora', 'Multiplicador'), 'Qué es multiplicar'], chalTitle: 'Gran Desafío de Multiplicación', champ: () => gx('una campeona', 'un campeón') + ' de la multiplicación',
  hello: n => `¡${gx('Bienvenida', 'Bienvenido')} al capítulo de la multiplicación, ${n}! Toca la isla verde.`,
  types: ['n:ms_mul', 'n:ms_sum', 'n:me_not', 'n:m2_res', 'n:m2_part', 'n:m5_res', 'n:m5_prob', 'n:m5_prob'],
};

/* ---------- lección de inicio: ¿qué es multiplicar? ---------- */
const mBig = (html, sub) => `<div class="col"><div class="mbig">${html}</div>${sub ? `<span class="sub">${sub}</span>` : ''}</div>`;
/* tocar cada recipiente para contar de n en n */
function stepTapGroups(b, ctx, g, n, th, done) {
  b.innerHTML = `<div class="col">${grpSvg(Array(g).fill(n), th, { tap: true, cls: 'tapg' })}<div class="counter"><b class="cnt">0</b> ${th.pl}</div></div>`;
  let k = 0;
  $$('.pl', b).forEach(p => p.onclick = () => {
    if (p.dataset.done) return;
    p.dataset.done = 1; p.classList.add('on'); k++;
    $('.plc', p).textContent = k * n; $('.cnt', b).textContent = k * n;
    sfx.tap(k); speak(String(k * n));
    if (k === g) setTimeout(() => { if (!b.isConnected) return; $('.counter', b).classList.add('full'); sfx.ok(); poli.cheer(done); ctx.unlock(); }, 500);
  });
}
function lessonIntroMul() {
  const th = MTH[0];
  runSteps([
    { gate: true, say: `¡Hola, ${save.name}! Hay 3 platos con 2 sopaipillas cada uno. Toca cada plato para contar de 2 en 2.`,
      render: (b, c) => stepTapGroups(b, c, 3, 2, th, '¡Contaste de 2 en 2: 2, 4, 6! Hay 6 sopaipillas.') },
    { say: 'Lo que contaste es una suma de números iguales: 2 más 2 más 2 es 6.', render: b => b.innerHTML = `<div class="col">${grpSvg([2, 2, 2], th)}<div class="mbig">2 + 2 + 2 <i>=</i> 6</div></div>` },
    { say: 'Cuando repites lo mismo, se dice veces. 3 veces 2 son 6.', render: b => b.innerHTML = mBig('<span class="mv">3</span> veces <span class="mn">2</span> son 6', '3 platos · 2 en cada uno') },
    { say: 'Y se escribe con un punto: 3 por 2 es igual a 6. ¡El punto se lee por! Eso es multiplicar.', render: b => b.innerHTML = mBig(`<span class="mv">3</span><i class="por">·</i><span class="mn">2</span> <i>=</i> 6`, 'Se lee «3 por 2»') },
    askStep('Ahora tú. Busca el dibujo que muestra 2 por 4.', () => { let q; do q = NQ.ms_pic(); while (!q.voice.endsWith(`${exV(2, 4)}?`)); return q; }),
    doneStep('intro5', '¡Muy bien!', 'Se abre la isla de las sumas que se repiten', `¡Genial, ${save.name}! Ya sabes qué es multiplicar.`),
  ], () => go('map'), '#1b9f72');
}

/* ---------- lecciones de las islas ---------- */
NUMLESSON.msuma = F => {
  const th = pick(MTH, 1)[0], g = pick([3, 4], 1)[0], n = pick([2, 3, 5], 1)[0];
  runSteps([
    { say: `Hay ${g} ${th.conts} con ${n} ${th.pl} cada uno. Sumamos ${Array(g).fill(n).join(' más ')}: ¡${g * n}!`,
      render: b => b.innerHTML = `<div class="col">${grpSvg(Array(g).fill(n), th, { cols: g === 4 ? 2 : g })}<div class="mbig">${sumH(n, g)} <i>=</i> ${g * n}</div></div>` },
    { say: `Son ${vez(g, n)}. Se escribe ${exV(g, n)} igual a ${g * n}. El primer número dice cuántas veces; el segundo, cuánto hay en cada ${th.cont}.`,
      render: b => b.innerHTML = mBig(`<span class="mv">${g}</span><i class="por">·</i><span class="mn">${n}</span> <i>=</i> ${g * n}`, `<span class="mv">${g} veces</span> <span class="mn">${n}</span>`) },
    askStep('Ahora tú. ¿Qué suma muestra el dibujo?', NQ.ms_sum),
    askStep('¿Y qué multiplicación es?', NQ.ms_mul),
    doneStep(F.id, '¡Lección completa!', 'Sumar iguales es multiplicar', `¡Lo lograste, ${save.name}! Ya sabes pasar de la suma a la multiplicación.`),
  ], () => go('island', { id: F.id }), F.d);
};
NUMLESSON.mesmul = F => {
  const th = pick(MTH, 1)[0];
  runSteps([
    { say: 'Para multiplicar, todos los grupos deben tener lo mismo. Aquí sí: 3, 3 y 3. Aquí no: 3, 1 y 4.',
      render: b => b.innerHTML = `<div class="duo mduo"><div class="panel"><span class="tagx" style="background:var(--good)">✓ Sí</span>${grpSvg([3, 3, 3], th, { cols: 3 })}<p>3, 3 y 3</p></div>
        <div class="panel"><span class="tagx" style="background:#ff8a3d">✗ No</span>${grpSvg([3, 1, 4], th, { cols: 3 })}<p>3, 1 y 4</p></div></div>` },
    askStep('Ahora tú. ¿Cuál NO es multiplicación?', NQ.me_not),
    { say: 'Las cosas también se ordenan en filas. Aquí hay 3 filas de 5: 3 por 5 es 15.', render: b => b.innerHTML = `<div class="col">${arrSvg(3, 5, { band: true })}<div class="mbig">${ex(3, 5)} <i>=</i> 15</div></div>` },
    { say: 'Si giras las filas, quedan 5 filas de 3. ¡Y siguen siendo 15! 3 por 5 y 5 por 3 dan lo mismo.',
      render: b => b.innerHTML = `<div class="col"><div class="nshape mturn">${arrSvg(3, 5)}<span class="mrot">↻</span>${arrSvg(5, 3, { col: '#4ea8ff', dk: '#2a7fd6' })}</div><div class="mbig">${ex(3, 5)} <i>=</i> ${ex(5, 3)} <i>=</i> 15</div></div>` },
    askStep('¿Qué multiplicación muestran estas filas?', NQ.me_arr),
    doneStep(F.id, '¡Lección completa!', 'Grupos iguales y filas', `¡Excelente, ${save.name}! Ya sabes cuándo hay multiplicación.`),
  ], () => go('island', { id: F.id }), F.d);
};
NUMLESSON.mtabla2 = F => runSteps([
  { say: 'Cada bicicleta tiene 2 ruedas. 1 bicicleta, 2 ruedas. 2 bicicletas, 4 ruedas. 3 bicicletas, 6 ruedas. ¡Contamos de 2 en 2!',
    render: b => b.innerHTML = `<div class="trio">${[1, 2, 3].map(k => `<div class="panel">${bikeSvg(k)}<p><b>${2 * k}</b> ruedas</p></div>`).join('')}</div>` },
  { say: 'Esta es la tabla del 2: 2, 4, 6, 8, 10… Se escribe 2 por 1, 2 por 2, 2 por 3. Como viste en las filas, el orden no cambia el resultado.',
    render: b => b.innerHTML = `<div class="ttab">${Array.from({ length: 10 }, (_, i) => `<span>${ex(2, i + 1)} <i>=</i> <b>${2 * (i + 1)}</b></span>`).join('')}</div>` },
  { say: '¿No recuerdas 2 por 4? Parte el 4 en 3 y 1. 2 por 3 es 6 y 2 por 1 es 2. Suma 6 más 2: ¡8! Esto se llama parte y suma.',
    render: b => b.innerHTML = `<div class="col">${partHtml(2, 4, 3).replace('</div>', '<span class="parr">↓</span><span class="prow">6 <i>+</i> 2 <i>=</i> <b>8</b></span></div>')}</div>` },
  { say: 'Los números que multiplicas se llaman factores. El resultado se llama producto.',
    render: b => b.innerHTML = `<div class="col"><div class="mbig fp"><span><span class="mv">2</span><small>factor</small></span><i class="por">·</i><span><span class="mn">4</span><small>factor</small></span><i>=</i><span><b>8</b><small>producto</small></span></div></div>` },
  askStep('Ahora tú. ¿Cuántas ruedas hay?', NQ.m2_bike),
  askStep('Ahora parte y suma.', () => partQ(2, 'sum')),
  doneStep(F.id, '¡Lección completa!', 'La tabla del 2: 2, 4, 6, 8…', `¡Muy bien, ${save.name}! Ya sabes la tabla del 2.`),
], () => go('island', { id: F.id }), F.d);
NUMLESSON.mtabla510 = F => runSteps([
  { say: 'Mira estos sobres de láminas. Uno trae 5 láminas y el otro trae 10.',
    render: b => b.innerHTML = `<div class="duo mduo"><div class="panel">${sobreSvg(1, 5)}<p><b>5</b> láminas</p></div><div class="panel">${sobreSvg(1, 10)}<p><b>10</b> láminas</p></div></div>` },
  { say: 'Con sobres de 5 contamos de 5 en 5: 5, 10, 15. 3 por 5 es 15.', render: b => b.innerHTML = `<div class="col">${sobreSvg(3, 5)}${seqHtml([5, 10, 15], { hops: true })}</div>` },
  { say: 'Con sobres de 10 contamos de 10 en 10: 10, 20, 30. ¡Como las decenas!', render: b => b.innerHTML = `<div class="col">${sobreSvg(3, 10)}${seqHtml([10, 20, 30], { hops: true })}</div>` },
  { say: 'Mira cómo terminan: la tabla del 5 termina en 5 o en 0. La del 10 siempre termina en 0. ¡Y la del 10 es el doble de la del 5!',
    render: b => b.innerHTML = `<div class="ttab t2">${Array.from({ length: 5 }, (_, i) => `<span>${ex(5, i + 1)} <i>=</i> <b>${5 * (i + 1)}</b></span><span>${ex(10, i + 1)} <i>=</i> <b>${10 * (i + 1)}</b></span>`).join('')}</div>` },
  askStep('Ahora tú. ¿Cuántas láminas hay?', NQ.m5_bar),
  askStep('¿Cuál número es de la tabla?', NQ.m5_end),
  doneStep(F.id, '¡Lección completa!', 'Las tablas del 5 y del 10', `¡Excelente, ${save.name}! Ya sabes las tablas del 5 y del 10.`),
], () => go('island', { id: F.id }), F.d);

/* ---------- juegos ---------- */
NUMGAME.msuma = {
  g1: F => quizGame(F, 'g1', [NQ.ms_sum, NQ.ms_mul, NQ.ms_sum, NQ.ms_mul, NQ.ms_tot], '¡Pasaste todas las sumas a multiplicación!'),
  g2: F => quizGame(F, 'g2', [NQ.ms_pic, NQ.ms_pic, NQ.ms_tot, NQ.ms_pic, NQ.ms_pic], '¡Encontraste todos los dibujos!'),
};
NUMGAME.mesmul = {
  g1: F => quizGame(F, 'g1', [NQ.me_not, NQ.me_yes, NQ.me_not, NQ.me_yes, NQ.me_not], '¡Eres un detective de grupos!'),
  g2: F => quizGame(F, 'g2', [NQ.me_arr, NQ.me_turn, NQ.me_arr, NQ.me_turn, NQ.me_arr], '¡Giraste todas las filas!'),
};
NUMGAME.mtabla2 = {
  g1: F => quizGame(F, 'g1', [NQ.m2_bike, NQ.m2_bike, NQ.m2_res, NQ.m2_bike, NQ.m2_seq], '¡Contaste todas las ruedas!'),
  g2: F => quizGame(F, 'g2', [NQ.m2_part, NQ.m2_part, NQ.m2_res, NQ.m2_part, NQ.m2_res], '¡Partiste y sumaste todo!'),
};
NUMGAME.mtabla510 = {
  g1: F => quizGame(F, 'g1', [NQ.m5_bar, NQ.m5_bar, NQ.m5_seq, NQ.m5_part, NQ.m5_res], '¡Contaste todas las láminas!'),
  g2: F => quizGame(F, 'g2', [NQ.m5_prob, NQ.m5_prob, NQ.m5_end, NQ.m5_prob, NQ.m5_prob], '¡Resolviste todos los cuentos!'),
};

/* ---------- Repaso y Mi avance: los temas del capítulo ---------- */
const MGEN = {
  msuma: [NQ.ms_sum, NQ.ms_mul, NQ.ms_tot, NQ.ms_pic], mesmul: [NQ.me_not, NQ.me_yes, NQ.me_arr, NQ.me_turn],
  mtabla2: [NQ.m2_bike, NQ.m2_res, NQ.m2_part, NQ.m2_seq], mtabla510: [NQ.m5_bar, NQ.m5_res, NQ.m5_end, NQ.m5_seq, NQ.m5_part, NQ.m5_prob],
};
for (const T of MULS) {
  const topic = { id: T.id, ch: 5, name: T.title, learned: () => !!prog(T.id).lesson, gen: () => pick(MGEN[T.id], 1)[0]() };
  TOPICS.push(topic); TOP[T.id] = topic;
}
