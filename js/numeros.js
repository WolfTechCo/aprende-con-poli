'use strict';
/* =========================================================
   Capítulo 3: Números — unidad, decena y centena, valor posicional,
   tabla del 1000 y secuencias numéricas.
   Sigue el método Singapur: concreto (bloques) → pictórico (tablas y dibujos) → abstracto (dígitos).
   Usa las ayudas de js/app.js (frame, poli, choice, runSteps, award…).
   ========================================================= */

/* color fijo por posición: así la niña asocia "azul = centenas" en todas las actividades */
const PV = {
  c: { one: 'centena', pl: 'centenas', ab: 'C', c: '#4ea8ff', d: '#2a7fd6', l: '#dcecff' },
  d: { one: 'decena', pl: 'decenas', ab: 'D', c: '#ff8a3d', d: '#e0651a', l: '#ffe3d0' },
  u: { one: 'unidad', pl: 'unidades', ab: 'U', c: '#22c58b', d: '#169a6a', l: '#d2f7e8' },
};
const PVK = ['c', 'd', 'u'];
const PV_VAL = { c: 100, d: 10, u: 1 };
/* notación con letras: 3C + 4D + 2U */
const notaHtml = (terms, inline) => `<span class="nota ${inline ? 'in' : ''}">${terms.map(([k, c]) => `<b style="--c:${PV[k].d}">${c}${PV[k].ab}</b>`).join('<i>+</i>')}</span>`;
const notaVoice = terms => terms.map(([k, c]) => `${c} ${c === 1 ? PV[k].one : PV[k].pl}`).join(' más ');
const DIG9 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const n3 = ([c, d, u]) => c * 100 + d * 10 + u;
const digitsOf = n => [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
const rev = n => +String(n).split('').reverse().join('');
const swapDU = n => { const [c, d, u] = digitsOf(n); return c * 100 + u * 10 + d; };
const pvWord = (k, n) => `${n} ${n === 1 ? PV[k].one : PV[k].pl}`;
/* "2 centenas, 3 decenas y 4 unidades" (sin centenas si el número es de 2 cifras) */
const pvSay = n => { const D = digitsOf(n), from = n >= 100 ? 0 : n >= 10 ? 1 : 2; return listY(PVK.slice(from).map((k, i) => pvWord(k, D[from + i]))); };
const pvParts = n => { const D = digitsOf(n), from = n >= 100 ? 0 : 1; return PVK.slice(from).map((k, i) => `<b style="color:${PV[k].d}">${pvWord(k, D[from + i])}</b>`).join(' + '); };

/* ---------- bloques base 10 (material concreto) ---------- */
function bUnit(x, y, s, P = PV.u) {
  return `<rect x="${x + s * .08}" y="${y + s * .08}" width="${s}" height="${s}" rx="${s * .16}" fill="${P.d}"/><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * .16}" fill="${P.c}" stroke="${P.d}" stroke-width="${s * .08}"/>`;
}
function bRod(x, y, w, P = PV.d) {
  let h = `<rect x="${x + w * .08}" y="${y + w * .08}" width="${w}" height="${w * 10}" rx="${w * .16}" fill="${P.d}"/><rect x="${x}" y="${y}" width="${w}" height="${w * 10}" rx="${w * .16}" fill="${P.c}" stroke="${P.d}" stroke-width="${w * .08}"/>`;
  for (let i = 1; i < 10; i++) h += `<path d="M${x} ${y + i * w}h${w}" stroke="${P.d}" stroke-width="${w * .06}"/>`;
  return h;
}
function bFlat(x, y, s, P = PV.c) {
  const c = s / 10; let g = '';
  for (let i = 1; i < 10; i++) g += `M${x + i * c} ${y}v${s}M${x} ${y + i * c}h${s}`;
  return `<rect x="${x + s * .03}" y="${y + s * .03}" width="${s}" height="${s}" rx="${s * .04}" fill="${P.d}"/><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * .04}" fill="${P.c}" stroke="${P.d}" stroke-width="${s * .025}"/><path d="${g}" stroke="${P.d}" stroke-width="${s * .01}" opacity=".8"/>`;
}
/* bloques de una columna de la tabla posicional (caja de 100×100) */
function colSvg(k, n) {
  let h = '';
  if (k === 'c') { const S = 29, G = 4.5; for (let i = 0; i < n; i++) h += bFlat(2 + (i % 3) * (S + G), 2 + Math.floor(i / 3) * (S + G), S); }
  if (k === 'd') { const W = 8, G = 2, x0 = (100 - n * W - (n - 1) * G) / 2; for (let i = 0; i < n; i++) h += bRod(x0 + i * (W + G), 9, W); }
  if (k === 'u') {
    const S = 14, G = 4.4, rows = Math.ceil(n / 5), y0 = (100 - rows * S - (rows - 1) * G - (n > 10 ? 5 : 0)) / 2;
    for (let i = 0; i < n; i++) h += bUnit(4 + (i % 5) * (S + G), y0 + Math.floor(i / 5) * (S + G) + (i >= 10 ? 5 : 0), S);
  }
  return `<svg viewBox="0 0 100 100">${h}</svg>`;
}
/* tabla de valor posicional con bloques: [centenas, decenas, unidades] */
const matHtml = (D, { nums = true, ctl = false } = {}) => `<div class="pvmat">${PVK.map((k, i) => `<div class="pvcol" data-k="${k}" style="--c:${PV[k].c};--d:${PV[k].d};--l:${PV[k].l}">
  <div class="pvh">${cap(PV[k].pl)}</div><div class="pvb">${colSvg(k, D[i])}</div>${nums ? `<div class="pvn">${D[i]}</div>` : ''}
  ${ctl ? `<div class="pvctl"><button class="pm minus" data-op="-1" aria-label="Quitar">−</button><button class="pm" data-op="1" aria-label="Agregar">+</button></div>` : ''}</div>`).join('')}</div>`;
/* bloques sueltos y desordenados */
function looseHtml([c, d, u]) {
  const g = [
    c && `<span class="grp">${`<svg class="lf" viewBox="0 0 32 32">${bFlat(.5, .5, 30)}</svg>`.repeat(c)}</span>`,
    d && `<span class="grp">${`<svg class="lr" viewBox="0 0 10 82">${bRod(.5, .5, 8)}</svg>`.repeat(d)}</span>`,
    u && `<span class="grp u">${`<svg class="lu" viewBox="0 0 16 16">${bUnit(.5, .5, 14)}</svg>`.repeat(u)}</span>`,
  ];
  return `<div class="loose">${shuffle(g.filter(Boolean)).join('')}</div>`;
}
/* número grande; cada dígito con el color de su lugar (col) o todo del mismo color */
function numHtml(n, { hl = -1, col = true, btn = false, cls = '' } = {}) {
  const s = String(n), ks = s.length <= 3 ? PVK.slice(3 - s.length) : null, tag = btn ? 'button' : 'i';
  return `<span class="bignum ${cls}">${[...s].map((ch, i) => `<${tag} class="dg ${i === hl ? 'hl' : ''}" data-i="${i}" style="--c:${col && ks ? PV[ks[i]].c : '#2b2d6e'}">${ch}</${tag}>`).join('')}</span>`;
}
/* suma por columnas (300 + 40 + 5 = 345); hide = fila oculta, total null = total oculto, ghost = filas por descubrir */
function msumHtml(rows, { total = null, hide = -1, ghost = false } = {}) {
  const cells = (v, cl) => [...String(v).padStart(3, ' ')].map((ch, i) => `<span class="cell ${cl}" style="color:${PV[PVK[i]].c}">${ch.trim()}</span>`).join('');
  let h = `<span></span>${PVK.map(k => `<b class="h" style="--c:${PV[k].c}">${PV[k].ab}</b>`).join('')}`;
  rows.forEach((v, i) => { const cl = `r${i} ${ghost ? 'gh' : ''}`; h += `<span class="op ${cl}">${i ? '+' : ''}</span>` + (i === hide ? `<span class="q">?</span>` : cells(v, cl)); });
  h += `<i class="ln"></i><span></span>` + (total == null ? `<span class="q">?</span>` : cells(total, `rt ${ghost ? 'gh' : ''}`));
  return `<div class="msum">${h}</div>`;
}

/* ---------- tabla del 1000 (de 10 en 10) ---------- */
const TV = Array.from({ length: 100 }, (_, i) => (i + 1) * 10);
const tRow = v => Math.floor((v - 10) / 100), tCol = v => (v - 10) % 100 / 10;
const tableHtml = (cls = () => '', show = () => true) => `<div class="ntable">${TV.map(v => `<button class="ncell ${cls(v)}" data-v="${v}">${show(v) ? v : ''}</button>`).join('')}</div>`;

/* ---------- secuencias ---------- */
const stepTxt = s => s > 0 ? `+${s}` : `−${-s}`;
const ruleTxt = s => `${s > 0 ? 'Sumar' : 'Restar'} ${Math.abs(s)}`;
function makeSeq(step, level = 0, len = 5) {
  const a = Math.abs(step);
  let s = a === 2 ? 2 * rnd(level ? 40 : 1, level ? 300 : 20)
    : a === 5 ? 5 * rnd(level ? 20 : 1, level ? 150 : 12)
      : a === 10 ? (level ? rnd(1, 8) * 100 + rnd(6, 8) * 10 + (level > 1 ? rnd(1, 9) : 0) : rnd(1, 8) * 10)
        : level ? rnd(1, 4) * 100 + rnd(1, 9) * 10 + rnd(1, 9) : rnd(1, 4) * 100;
  s = Math.max(0, Math.min(s, 1000 - a * (len - 1)));
  const v = Array.from({ length: len }, (_, i) => s + i * a);
  return step < 0 ? v.reverse() : v;
}
const hopSvg = '<svg viewBox="0 0 40 18"><path d="M3 16Q20 -6 37 16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 5"/><path d="M31 12l6 4.5-7 1.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const seqHtml = (vals, { miss = [], hops = null } = {}) => `<div class="seq">${vals.map((v, i) =>
  `${i && hops ? `<span class="hop" style="animation-delay:${i * .35}s"><em>${hops === '?' ? '?' : stepTxt(v - vals[i - 1])}</em>${hopSvg}</span>` : ''}<span class="stone ${miss.includes(i) ? 'miss' : ''}">${miss.includes(i) ? '?' : v}</span>`).join('')}</div>`;

/* ---------- opciones ---------- */
function numChoices(right, cands, say, hint) {
  const w = [];
  for (const v of [...shuffle(cands), right + 10, right - 10, right + 100, right + 1]) if (v !== right && v >= 0 && v <= 1000 && !w.includes(v) && w.length < 2) w.push(v);
  return shuffle([right, ...w]).map(v => ({ html: v, ok: v === right, say, hint }));
}
/* preguntas ya vistas en esta sesión: cada vez que entre, los ejercicios son distintos */
const NSEEN = new Set();
function freshQ(gen) {
  let q;
  for (let t = 0; t < 30; t++) {
    q = gen();
    const key = q.prompt + '|' + (q.shape || '') + '|' + q.opts.find(o => o.ok).html;
    if (!NSEEN.has(key)) { NSEEN.add(key); break; }
  }
  return q;
}
const missOpts = (vals, i, step, say) => { const v = vals[i]; return numChoices(v, [v + 1, v - 1, v + 10, v - 10, v + 100, v - 100].filter(x => !vals.includes(x)), say || `¡Sí! Es ${v}.`, 'Mira de cuánto en cuánto cambian los números.'); };

/* ---------- preguntas (juegos y Gran Desafío) ---------- */
const NQ = {
  /* bloques → número */
  blocks(mode = pick(['mat', 'loose'], 1)[0]) {
    let [c, d, u] = pick(DIG9, 3);
    if (mode === 'canje') { c = rnd(1, 5); d = rnd(1, 7); u = rnd(11, 15); }
    const n = c * 100 + d * 10 + u;
    return {
      prompt: '¿Qué número forman los bloques?',
      voice: mode === 'canje' ? '¿Qué número forman? ¡Ojo: hay más de 9 unidades!' : mode === 'loose' ? '¿Qué número forman? ¡Ojo, están desordenados!' : '¿Qué número forman los bloques?',
      shape: `<div class="nshape">${mode === 'loose' ? looseHtml([c, d, u]) : matHtml([c, d, u], { nums: false })}</div>`,
      opts: numChoices(n, mode === 'canje' ? [c * 100 + d * 10 + u % 10, rev(n)] : [rev(n), swapDU(n), u * 100 + d * 10 + c],
        mode === 'canje' ? `¡Sí! ${u} unidades son 1 decena y ${u - 10} unidades. Es ${n}.` : `¡Sí! ${pvSay(n)}: ${n}.`,
        mode === 'canje' ? '10 unidades forman 1 decena. ¡Cuenta otra vez!' : 'Cuenta las placas, las barras y los cubitos.'),
    };
  },
  /* ¿cuánto vale el dígito? */
  value() {
    const D = pick(DIG9, 3), n = n3(D), i = rnd(0, 2), dig = D[i], val = dig * [100, 10, 1][i];
    return {
      prompt: `¿Cuánto vale el ${dig} en este número?`, shape: `<div class="nshape">${numHtml(n, { hl: i, col: false })}</div>`,
      opts: shuffle([dig * 100, dig * 10, dig]).map(v => ({ html: v, ok: v === val, say: `¡Sí! El ${dig} está en las ${PV[PVK[i]].pl}, así que vale ${val}.`, hint: 'Fíjate en su lugar: ¿unidades, decenas o centenas?' })),
    };
  },
  /* ¿en qué lugar está? */
  place() {
    const D = pick(DIG9, 3), n = n3(D), i = rnd(0, 2), dig = D[i];
    return {
      prompt: `¿En qué lugar está el ${dig}?`, shape: `<div class="nshape">${numHtml(n, { hl: i, col: false })}</div>`, cls: 'txt',
      opts: PVK.map((k, j) => ({ html: cap(PV[k].pl), ok: j === i, say: `¡Sí! El ${dig} está en las ${PV[k].pl}.`, hint: 'Recuerda: de derecha a izquierda van unidades, decenas y centenas.' })),
    };
  },
  /* ¿qué número tiene 6 decenas? */
  which() {
    const D = pick(DIG9, 3), t = D[0], pos = rnd(0, 2);
    const mk = p => { const o = shuffle(D.slice(1)), a = []; let j = 0; for (let q = 0; q < 3; q++) a.push(q === p ? t : o[j++]); return n3(a); };
    return {
      prompt: `¿Qué número tiene ${pvWord(PVK[pos], t)}?`,
      opts: shuffle([0, 1, 2].map(p => ({ html: mk(p), ok: p === pos, say: `¡Sí! Ahí el ${t} está en las ${PV[PVK[pos]].pl}.`, hint: `Busca el ${t} en el lugar de las ${PV[PVK[pos]].pl}.` }))),
    };
  },
  /* suma por columnas → total */
  sum(zero = Math.random() < .35) {
    const D = pick(DIG9, 3); if (zero) D[rnd(1, 2)] = 0;
    const n = n3(D);
    let rows = [D[0] * 100, D[1] * 10, D[2]].filter(Boolean);
    if (Math.random() < .4) rows = shuffle(rows);
    return {
      prompt: '¿Cuánto da la suma?', shape: `<div class="nshape">${msumHtml(rows)}</div>`,
      opts: numChoices(n, [rev(n), swapDU(n), D[0] * 10 + (D[1] || D[2]), D[2] * 100 + D[1] * 10 + D[0]].filter(v => v !== n),
        `¡Sí! ${rows.join(' + ')} = ${n}.`, 'Junta las centenas, las decenas y las unidades, cada una en su lugar.'),
    };
  },
  /* suma por columnas → fila que falta */
  missing() {
    const D = pick(DIG9, 3), n = n3(D), i = rnd(0, 2), rows = [D[0] * 100, D[1] * 10, D[2]], v = rows[i];
    return {
      prompt: '¿Qué número falta?', shape: `<div class="nshape">${msumHtml(rows, { hide: i, total: n })}</div>`,
      opts: shuffle([D[i] * 100, D[i] * 10, D[i]]).map(x => ({ html: x, ok: x === v, say: `¡Sí! ${rows.join(' + ')} = ${n}.`, hint: `Mira el ${D[i]} en el ${n}: ¿en qué lugar está?` })),
    };
  },
  /* ¿qué número sigue? */
  next() {
    const step = pick([2, 5, 10, 10, 100, -10], 1)[0], vals = makeSeq(step, rnd(0, 1)), i = vals.length - 1;
    return { prompt: '¿Qué número sigue?', shape: `<div class="nshape">${seqHtml(vals, { miss: [i] })}</div>`, opts: missOpts(vals, i, step, `¡Sí! La regla es ${ruleTxt(step).toLowerCase()}: sigue el ${vals[i]}.`) };
  },
  /* ¿cuál es la regla? */
  rule(level = rnd(0, 1)) {
    const RULES = [2, 5, 10, 100, -2, -5, -10, -100], step = pick(RULES, 1)[0], vals = makeSeq(step, level);
    const wrong = [...pick(RULES.filter(s => s !== step && Math.sign(s) === Math.sign(step)), 1), -step];
    return {
      prompt: '¿Cuál es la regla?', shape: `<div class="nshape">${seqHtml(vals, { hops: '?' })}</div>`, cls: 'txt',
      opts: shuffle([step, ...wrong]).map(s => ({ html: ruleTxt(s), ok: s === step, say: `¡Sí! Cada número ${step > 0 ? 'suma' : 'resta'} ${Math.abs(step)}.`,
        hint: Math.sign(s) !== Math.sign(step) ? (step > 0 ? 'Mira: los números van creciendo.' : 'Mira: los números van bajando.') : 'Mira cuánto cambia de un número al siguiente.' })),
    };
  },
  /* notación → número: 3C + 4D + 2U = 342 (nivel 0: en orden · 1: desordenado · 2: falta un lugar · 3: más de 9 unidades) */
  nota(level = rnd(0, 2), help = true) {
    let D = pick(DIG9, 3);
    if (level === 3) D = [rnd(1, 7), rnd(1, 7), rnd(11, 15)];
    let terms = PVK.map((k, i) => [k, D[i]]);
    if (level === 2) terms.splice(rnd(1, 2), 1);
    if (level === 1 || (level >= 2 && Math.random() < .5)) { const t0 = terms; do terms = shuffle(t0); while (terms.every((t, i) => t === t0[i])); }
    const n = terms.reduce((a, [k, c]) => a + c * PV_VAL[k], 0);
    const written = +terms.map(t => t[1]).join(''); // error típico: leer los números en el orden escrito
    const cands = level === 3 ? [D[0] * 100 + D[1] * 10 + D[2] % 10, written] : level === 2 ? [written, rev(n), swapDU(n)] : [written, rev(n), swapDU(n)];
    return {
      prompt: '¿Qué número es?', voice: `¿Qué número es ${notaVoice(terms)}?`,
      shape: `<div class="nshape">${notaHtml(terms)}${help ? `<button class="btn ghost sm helpbtn">💡 Ayuda</button><template>${termsHtml(terms, true, false)}</template>` : ''}</div>`,
      opts: numChoices(n, cands.filter(v => v !== n && v <= 1000),
        `¡Sí! ${terms.map(([k, c]) => c * PV_VAL[k]).join(' + ')} = ${n}.`,
        (level === 3 ? '10 unidades forman 1 decena. ¡Cuenta otra vez!' : 'Fíjate en la letra: C vale 100, D vale 10 y U vale 1.') + (help ? ' Si quieres, toca Ayuda.' : '')),
    };
  },
  /* en el Gran Desafío no hay botón de ayuda */
  notaDesafio() { return NQ.nota(rnd(0, 2), false); },
  /* número → notación */
  notaRev() {
    const D = pick(DIG9, 3), n = n3(D);
    const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    const opts = [perms[0], ...pick(perms.slice(1), 2)].map(pm => PVK.map((k, i) => [k, D[pm[i]]]));
    return {
      prompt: `¿Cuál es el ${n}?`, shape: `<div class="nshape">${numHtml(n, { col: false })}</div>`, cls: 'txt',
      opts: shuffle(opts.map((t, i) => ({ html: notaHtml(t, true), ok: i === 0, say: `¡Sí! ${n} = ${notaVoice(t)}.`, hint: `Mira el ${n}: ¿cuántas centenas tiene? ¿y decenas?` }))),
    };
  },
  /* trozo de la tabla del 1000 con un número perdido */
  table() {
    const vert = Math.random() < .5;
    const s = vert ? rnd(0, 6) * 100 + rnd(1, 10) * 10 : rnd(0, 9) * 100 + rnd(1, 7) * 10;
    const vals = [0, 1, 2, 3].map(i => s + i * (vert ? 100 : 10)), m = rnd(1, 3), v = vals[m];
    return {
      prompt: '¿Qué número falta en la tabla?',
      shape: `<div class="nshape"><div class="tsnip ${vert ? 'vert' : ''}">${vals.map((x, i) => `<span class="ncell ${i === m ? 'ask' : ''}">${i === m ? '?' : x}</span>`).join('')}</div></div>`,
      opts: numChoices(v, [v + 1, v - 1, v + 10, v - 10, v + 100, v - 100].filter(x => !vals.includes(x)), `¡Sí! ${vert ? 'Hacia abajo se suma 100' : 'Hacia el lado se suma 10'}.`, vert ? 'En la tabla, hacia abajo se suma 100.' : 'En la tabla, hacia el lado se suma 10.'),
    };
  },
};

/* =========================================================
   Islas del capítulo
   ========================================================= */
const NUMS = [
  { id: 'udc', title: 'Unidad, decena y centena', short: 'U, D y C', isle: 'las unidades, decenas y centenas', c: '#ff8a3d', d: '#e0651a', l: '#ffdcc4',
    chips: ['1 unidad = 1', '1 decena = 10', '1 centena = 100'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'Agrupa de 10 en 10' }, { k: 'g1', t: 'Construye', sub: 'Arma números con bloques' }, { k: 'g2', t: '¿Qué número es?', sub: 'Cuenta los bloques' }] },
  { id: 'valor', title: 'Valor posicional', short: 'Valor posicional', isle: 'el valor posicional', c: '#4ea8ff', d: '#2a7fd6', l: '#cfe6ff',
    chips: ['C · D · U', '345 = 300 + 40 + 5'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'El lugar cambia el valor' }, { k: 'g1', t: '¿Cuánto vale?', sub: 'El valor de cada dígito' }, { k: 'g2', t: 'Suma por columnas', sub: 'Separa y junta números' }] },
  { id: 'nota', title: 'Sumas de C, D y U', short: 'C + D + U', isle: 'las sumas de centenas, decenas y unidades', c: '#2ec4b6', d: '#1f9e92', l: '#c3f1ec',
    chips: ['C = 100', 'D = 10', 'U = 1', '1C + 1D + 1U = 111'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'De letras a números' }, { k: 'g1', t: '¿Qué número es?', sub: 'Transforma la suma en un número' }, { k: 'g2', t: '¿Cuál es?', sub: 'Del número a la suma' }] },
  { id: 'tabla', title: 'Tabla del 1000', short: 'Tabla del 1000', isle: 'la tabla del 1000', c: '#9b6bff', d: '#7447e0', l: '#e0d3ff',
    chips: ['De 10 en 10', 'De 100 en 100', 'Hasta 1000'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'Cuenta hasta 1000' }, { k: 'g1', t: 'Completa la tabla', sub: 'Encuentra los números perdidos' }, { k: 'g2', t: 'Encuentra el número', sub: 'Usa las pistas de la tabla' }] },
  { id: 'secu', title: 'Secuencias numéricas', short: 'Secuencias', isle: 'las secuencias numéricas', c: '#ff7eb6', d: '#e0529a', l: '#ffd3e8',
    chips: ['+2 · +5 · +10 · +100', '−10 · −100'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'Descubre la regla' }, { k: 'g1', t: 'El tren de números', sub: 'Completa los vagones' }, { k: 'g2', t: '¿Cuál es la regla?', sub: '¿Suma o resta? ¿Cuánto?' }] },
].map(T => ({ ...T, kind: 'num', name: T.title }));
NUMS.forEach(T => { FIG[T.id] = T; });
ACTS.num = ['lesson', 'g1', 'g2'];
CH[3] = {
  nodes: ['intro123', ...NUMS.map(T => T.id), 'challengeNum'], intro: 'intro123', chal: 'challengeNum', figs: NUMS, label: '3 · Números',
  introLabel: 'Agrupar', sticker: ['Agrupadora', 'Contar en grupos'], chalTitle: 'Gran Desafío de Números', champ: 'una campeona de los números',
  hello: n => `¡Bienvenida al capítulo de los números, ${n}! Toca la isla verde.`,
  types: ['n:blocks', 'n:value', 'n:notaDesafio', 'n:sum', 'n:missing', 'n:next', 'n:rule', 'n:table'],
};

function numIcon(id, white) {
  const W = white ? { c: '#ffffff', d: 'rgba(43,45,110,.35)' } : null, ink = '#2b2d6e';
  const art = {
    udc: () => bFlat(4, 28, 50, W || PV.c) + bRod(62, 14, 7.2, W || PV.d) + bUnit(78, 52, 13, W || PV.u) + bUnit(78, 71, 13, W || PV.u),
    valor: () => PVK.map((k, i) => `<rect x="${5 + i * 31}" y="18" width="28" height="64" rx="8" fill="${white ? '#fff' : PV[k].l}" stroke="${white ? 'none' : PV[k].c}" stroke-width="3"/>
      <path d="M${5 + i * 31} 34V26a8 8 0 018-8h12a8 8 0 018 8v8z" fill="${white ? 'rgba(43,45,110,.18)' : PV[k].c}"/>
      <text x="${19 + i * 31}" y="31" text-anchor="middle" font-size="12" fill="${white ? ink : '#fff'}">${PV[k].ab}</text>
      <text x="${19 + i * 31}" y="70" text-anchor="middle" font-size="30" fill="${white ? ink : PV[k].d}">${[3, 4, 5][i]}</text>`).join(''),
    nota: () => PVK.map((k, i) => `<rect x="${3 + i * 33}" y="16" width="28" height="30" rx="8" fill="${white ? '#fff' : PV[k].l}" ${white ? '' : `stroke="${PV[k].c}" stroke-width="3"`}/>
      <text x="${17 + i * 33}" y="39" text-anchor="middle" font-size="20" fill="${white ? ink : PV[k].d}">1${PV[k].ab}</text>`).join('')
      + [0, 1].map(i => `<text x="${33.5 + i * 33}" y="38" text-anchor="middle" font-size="14" fill="${white ? '#fff' : ink}">+</text>`).join('')
      + `<rect x="18" y="58" width="64" height="30" rx="10" fill="${white ? '#fff' : '#ffc233'}"/><text x="50" y="81" text-anchor="middle" font-size="22" fill="${ink}">111</text>`,
    tabla: () => [10, 20, 30, 110, 120, 130, 210, 220, 230].map((v, i) => `<rect x="${5 + (i % 3) * 31}" y="${5 + Math.floor(i / 3) * 31}" width="28" height="28" rx="6" fill="${white ? '#fff' : i === 4 ? '#ffc233' : '#efeaff'}" ${white ? '' : 'stroke="#9b6bff" stroke-width="2"'}/>
      <text x="${19 + (i % 3) * 31}" y="${24 + Math.floor(i / 3) * 31}" text-anchor="middle" font-size="${v > 99 ? 11 : 13}" fill="${ink}">${v}</text>`).join(''),
    secu: () => [2, 4, 6].map((v, i) => `<circle cx="${16 + i * 34}" cy="68" r="14" fill="#fff" ${white ? '' : 'stroke="#e0529a" stroke-width="3"'}/><text x="${16 + i * 34}" y="75" text-anchor="middle" font-size="20" fill="${ink}">${v}</text>`).join('')
      + [0, 1].map(i => `<path d="M${22 + i * 34} 50Q${33 + i * 34} 30 ${44 + i * 34} 50" fill="none" stroke="${white ? '#fff' : '#7c5cff'}" stroke-width="4" stroke-linecap="round"/><text x="${33 + i * 34}" y="30" text-anchor="middle" font-size="15" fill="${white ? '#fff' : '#7c5cff'}">+2</text>`).join(''),
  };
  return `<svg viewBox="0 0 100 100"><g font-family="Baloo 2,Arial" font-weight="800">${art[id]()}</g></svg>`;
}

/* ---------- isla (hub) ---------- */
function islandNum(F) {
  save.ch = 3; persist();
  const p = prog(F.id);
  const ico = {
    lesson: `<svg viewBox="0 0 24 24"><path d="M3 6l9-3 9 3v11l-9 3-9-3z" fill="${F.c}"/><path d="M12 3v17" stroke="#fff" stroke-width="2"/></svg>`,
    g1: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2" fill="${PV.c.c}"/><rect x="13" y="3" width="3" height="18" rx="1" fill="${PV.d.c}"/><rect x="18" y="16" width="4" height="4" rx="1" fill="${PV.u.c}"/><rect x="3" y="13" width="8" height="8" rx="2" fill="${PV.c.c}"/></svg>`,
    g2: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="${F.c}"/><text x="12" y="17" text-anchor="middle" font-family="Baloo 2,Arial" font-weight="800" font-size="15" fill="#fff">?</text></svg>`,
  };
  const el = frame(`<div class="hub" style="--d:${F.d}">
    <div class="hero">${numIcon(F.id)}<h2 class="${F.title.length > 12 ? 'long' : ''}">${F.title}</h2>
      <div class="chips">${F.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div></div>
    <div class="cards">${F.acts.map(a => `<button class="card ${p[a.k] ? 'done' : ''}" data-k="${a.k}" style="--d:${F.d};--l:${F.l}">
      <span class="ico">${ico[a.k]}</span><span><b>${a.t}</b><small>${a.sub}</small></span><span class="st">${starSvg(p[a.k])}</span></button>`).join('')}</div></div>`);
  $$('.card', el).forEach(b => b.onclick = () => b.dataset.k === 'lesson' ? go('lesson', { id: F.id }) : go('game', { id: F.id, k: b.dataset.k }));
  poli.say(figStars(F.id) === 3 ? `¡Dominaste ${F.isle}! Ganaste su sticker.` : `Esta es la isla de ${F.isle}. ¿Qué quieres hacer primero?`);
}

/* ---------- motor de juegos ---------- */
function viewGame() { const F = FIG[cur.id]; NUMGAME[F.id][cur.k](F); }
const progressBar = (n, i, res = []) => `<div class="progress">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? (res[k] === false ? 'meh' : 'ok') : k === i ? 'now' : ''}"></i>`).join('')}</div>`;
function gameDone(F, k, msg) {
  const fresh = award(k, F.id);
  sfx.win(); confetti(120);
  frame(`<div class="stepbody"><div class="col trophy"><h2>¡Juego completo!</h2><div class="star-big">${starSvg(true, 160)}</div><span class="sub">${msg}</span></div></div>`).style.setProperty('--d', F.d);
  setAction('¡Listo!', () => go('island', { id: F.id }), true, 'green');
  poli.cheer(`¡Muy bien, ${save.name}! ${fresh ? 'Ganaste una estrella.' : '¡Lo lograste otra vez!'}`);
}
/* serie de preguntas con barra de avance; la explicación se escucha completa antes de pasar */
function quizGame(F, k, gens, msg) {
  const qs = gens.map(g => freshQ(g)), res = [];
  let qi = 0;
  const show = () => {
    const q = qs[qi];
    const el = frame(`${progressBar(qs.length, qi, res)}<div class="stepbody"></div>`);
    choice($('.stepbody', el), {
      prompt: q.prompt, shape: q.shape || '', opts: q.opts, cls: q.cls || '',
      onRight: first => { res[qi] = first; const say = q.opts.find(o => o.ok).say || ''; setTimeout(() => { qi++; qi < qs.length ? show() : gameDone(F, k, msg); }, Math.min(4200, 1300 + say.length * 40)); },
    });
    poli.say(q.voice || q.prompt);
  };
  show();
}

/* =========================================================
   Inicio del capítulo: ¿cómo contamos? (agrupar de 10 en 10)
   ========================================================= */
const candyFrameX = k => 6 + k * 113;
const candyEnd = i => [candyFrameX(Math.floor(i / 10)) + 14 + (i % 5) * 20, 88 + Math.floor(i % 10 / 5) * 22];
function candySvg(n, grouped) {
  const cols = 17, slots = pick(Array.from({ length: cols * 6 }, (_, i) => i), n);
  const G = Math.ceil(n / 10), full = Math.floor(n / 10);
  const frames = Array.from({ length: G }, (_, k) => `<rect x="${candyFrameX(k)}" y="74" width="108" height="50" rx="10" fill="#fff" stroke="${k < full ? PV.d.c : PV.u.c}" stroke-width="3"/>
    <text x="${candyFrameX(k) + 54}" y="152" text-anchor="middle" font-family="Baloo 2,Arial" font-weight="800" font-size="22" fill="${k < full ? PV.d.d : PV.u.d}">${k < full ? '10' : `${n % 10} ${n % 10 === 1 ? 'suelto' : 'sueltos'}`}</text>`).join('');
  return `<svg viewBox="0 0 460 180" class="grp">${grouped ? frames : `<g class="fade" id="frames">${frames}</g>`}${slots.map((s, i) => {
    const [x, y] = grouped ? candyEnd(i) : [16 + (s % cols) * 25.5 + rnd(-4, 4), 18 + Math.floor(s / cols) * 30 + rnd(-4, 4)];
    return `<g class="cdy" style="transform:translate(${x}px,${y}px);transition-delay:${i * 18}ms"><circle r="9" fill="${COLORS[i % 6]}"/><circle cx="-3" cy="-3" r="3" fill="#fff" opacity=".6"/></g>`;
  }).join('')}</svg>`;
}
function lessonIntroNum() {
  const n = rnd(2, 3) * 10 + rnd(1, 9), full = Math.floor(n / 10);
  runSteps([
    { gate: true, say: `¡Hola, ${save.name}! ¿Cuántos caramelos hay? Contarlos de uno en uno es lento. ¡Toca el botón para agruparlos de 10 en 10!`,
      render: (b, c) => {
        b.innerHTML = `<div class="col">${candySvg(n, false)}<button class="btn gold" id="grpBtn">Agrupar de 10 en 10</button></div>`;
        $('#grpBtn', b).onclick = () => {
          sfx.pop(); $('#grpBtn', b).remove();
          $$('.cdy', b).forEach((g, i) => { const [x, y] = candyEnd(i); g.style.transform = `translate(${x}px,${y}px)`; });
          setTimeout(() => {
            if (!b.isConnected) return;
            $('#frames', b).classList.add('on'); sfx.ok();
            poli.cheer(`¡Mira! ${full} grupos de 10 y ${n % 10} sueltos. ¡Así es mucho más fácil contar!`); c.unlock();
          }, 1400);
        };
      } },
    { gate: true, say: 'Cuenta los grupos de 10 y después los sueltos. ¿Cuántos caramelos hay?',
      render: (b, c) => choice(b, { prompt: '¿Cuántos caramelos hay?', shape: `<div class="nshape">${candySvg(n, true)}</div>`,
        opts: numChoices(n, [rev(n), n + 10, n - 10], `¡Sí! ${full} grupos de 10 y ${n % 10} sueltos: ${n}.`, 'Cuenta los grupos: diez, veinte… y después suma los sueltos.'), onRight: () => c.unlock() }) },
    { say: 'Un grupo de 10 se llama decena. Cada uno suelto es una unidad. ¡Con 10 unidades formamos 1 decena!',
      render: b => b.innerHTML = `<div class="duo">
        <div class="panel"><span class="tagx" style="background:${PV.u.c}">1</span><svg viewBox="0 0 100 100">${bUnit(34, 34, 30)}</svg><p>1 <b style="color:${PV.u.d}">unidad</b></p></div>
        <div class="panel"><span class="tagx" style="background:${PV.d.c}">10</span><svg viewBox="0 0 100 100">${bRod(45, 4, 9)}</svg><p>1 <b style="color:${PV.d.d}">decena</b> = 10 unidades</p></div></div>` },
    doneStep('intro123', '¡Muy bien!', 'Se abre la isla de las unidades, decenas y centenas', `¡Genial, ${save.name}! Ya sabes agrupar de 10 en 10.`),
  ], () => go('map'), '#1b9f72');
}

/* =========================================================
   Isla 1: unidad, decena y centena
   ========================================================= */
/* toca 10 cubitos (o 10 barras) y se juntan en 1 decena (o 1 centena) */
function stepJoin(b, ctx, k) {
  const isU = k === 'u', S = 20;
  const start = i => isU ? [38 + (i % 5) * 48, 70 + Math.floor(i / 5) * 62] : [4 + i * 29.6, 24];
  const end = i => isU ? [140, 10 + i * 20] : [50 + i * 20, 24];
  const word = isU ? 'unidades' : 'decenas';
  const end1 = isU ? '¡10 unidades se juntan y forman 1 decena!' : '¡10 decenas se juntan y forman 1 centena: 100!';
  b.innerHTML = `<div class="count3d"><svg viewBox="0 0 300 236" class="join">
      ${Array.from({ length: 10 }, (_, i) => `<g class="jp" data-i="${i}" style="transform:translate(${start(i)[0]}px,${start(i)[1]}px)">${isU ? bUnit(0, 0, S) : bRod(0, 0, S)}
        <text class="jn" x="${S / 2}" y="${isU ? S / 2 + 5.5 : -6}" text-anchor="middle" font-family="Baloo 2,Arial" font-weight="800" font-size="${isU ? 15 : 13}" fill="${isU ? '#fff' : PV.d.d}"></text>
        <rect x="-8" y="-8" width="${S + 16}" height="${isU ? S + 16 : S * 10 + 16}" fill="transparent"/></g>`).join('')}
      <g class="fade" id="whole">${isU ? bRod(140, 10, 20) : bFlat(50, 24, 200)}</g></svg>
    <div class="side-panel"><div class="counter"><b class="cn">0</b> ${word}</div>
      <p class="explain">${isU ? 'Toca cada cubito para contarlo.' : 'Toca cada barra: cada una vale 10.'}</p></div></div>`;
  let count = 0;
  $$('.jp', b).forEach(g => g.onclick = () => {
    if (g.dataset.done || count >= 10) return;
    g.dataset.done = 1; count++;
    $('.jn', g).textContent = isU ? count : count * 10;
    sfx.tap(count); speak(isU ? NUM[count] : String(count * 10));
    $('.cn', b).textContent = count;
    if (count < 10) return;
    setTimeout(() => {
      if (!b.isConnected) return;
      $$('.jp', b).forEach((p, i) => { p.style.transform = `translate(${end(i)[0]}px,${end(i)[1]}px)`; $('.jn', p).style.opacity = 0; });
      setTimeout(() => {
        if (!b.isConnected) return;
        $('#whole', b).classList.add('on');
        const cnt = $('.counter', b); cnt.classList.add('full'); cnt.innerHTML = isU ? '10 unidades = 1 decena' : '10 decenas = 1 centena';
        $('.explain', b).textContent = end1; sfx.ok(); poli.cheer(end1); ctx.unlock();
      }, 1100);
    }, 450);
  });
}
function lessonUDC(F) {
  const D = pick(DIG9, 3), n = n3(D), q = pick(DIG9, 3), qn = n3(q);
  runSteps([
    { gate: true, say: 'Toca cada cubito para contarlo. Cada cubito es una unidad. ¿Qué pasa cuando llegamos a 10?', render: (b, c) => stepJoin(b, c, 'u') },
    { gate: true, say: 'Ahora toca cada barra. Cada barra es una decena y vale 10. ¡Contemos de 10 en 10!', render: (b, c) => stepJoin(b, c, 'd') },
    { say: 'Recuerda: una unidad vale 1, una decena vale 10 y una centena vale 100.',
      render: b => b.innerHTML = `<div class="duo">
        <div class="panel"><span class="tagx" style="background:${PV.u.c}">1</span><svg viewBox="0 0 100 100">${bUnit(34, 34, 30)}</svg><p>1 <b style="color:${PV.u.d}">unidad</b></p></div>
        <div class="panel"><span class="tagx" style="background:${PV.d.c}">10</span><svg viewBox="0 0 100 100">${bRod(45, 4, 9)}</svg><p>1 <b style="color:${PV.d.d}">decena</b> = 10 unidades</p></div>
        <div class="panel"><span class="tagx" style="background:${PV.c.c}">100</span><svg viewBox="0 0 100 100">${bFlat(6, 6, 86)}</svg><p>1 <b style="color:${PV.c.d}">centena</b> = 10 decenas</p></div></div>` },
    { say: `Mira el número ${n}. Tiene ${pvSay(n)}. Cada dígito nos dice cuántos bloques hay en su lugar.`,
      render: b => b.innerHTML = `<div class="vsplit">${matHtml(D)}<div class="nshape">${numHtml(n)}<p class="eq">${n} = ${pvParts(n)}</p></div></div>` },
    { gate: true, say: `¿Cuántas decenas tiene el número ${qn}?`,
      render: (b, c) => choice(b, { prompt: `¿Cuántas decenas tiene el ${qn}?`, shape: `<div class="nshape">${numHtml(qn)}</div>`,
        opts: shuffle(q).map(v => ({ html: v, ok: v === q[1], say: `¡Sí! ${qn} tiene ${pvSay(qn)}.`, hint: 'Las decenas son el dígito del medio.' })), onRight: () => c.unlock() }) },
    doneStep(F.id, '¡Lección completa!', '1 unidad · 1 decena = 10 · 1 centena = 100', `¡Lo lograste, ${save.name}! Ya conoces las unidades, decenas y centenas.`),
  ], () => go('island', { id: F.id }), F.d);
}
/* Construye: arma el número con bloques usando + y − (con canje: 10 bloques se cambian por 1 del siguiente lugar) */
function gameBuild(F) {
  const T = [rnd(2, 9) * 10 + rnd(1, 9), n3(pick(DIG9, 3)), rnd(1, 9) * 100 + rnd(1, 9), rnd(1, 9) * 100 + rnd(1, 9) * 10];
  let r = 0, cnt, busy;
  const val = () => n3(cnt);
  const round = () => {
    const t = T[r]; cnt = [0, 0, 0]; busy = false;
    const el = frame(`${progressBar(T.length, r)}<div class="nbuild"><div class="ntarget"><span class="lbl">Arma el</span>${numHtml(t, { col: r === 0, cls: 'sm' })}</div>
      <div id="mat" class="matbox"></div><div class="have">Tienes: <b id="have">0</b></div></div>`);
    const draw = () => {
      $('#mat', el).innerHTML = matHtml(cnt, { ctl: true });
      $('#have', el).textContent = val();
      $$('.pm', el).forEach(btn => btn.onclick = () => press(PVK.indexOf(btn.closest('.pvcol').dataset.k), +btn.dataset.op));
    };
    const press = (i, op) => {
      if (busy) return;
      if (op < 0) { if (!cnt[i]) { sfx.bad(); return; } cnt[i]--; sfx.tap(cnt[i]); draw(); return check(); }
      if (cnt[i] < 9) { cnt[i]++; sfx.tap(cnt[i]); draw(); return check(); }
      if (i === 0 || cnt[i - 1] === 9) { sfx.bad(); poli.oops('¡Ya no caben más bloques ahí!'); return; }
      // canje: 10 de un lugar se cambian por 1 del lugar de la izquierda
      busy = true; cnt[i] = 10; sfx.tap(10); draw();
      poli.say(`¡10 ${PV[PVK[i]].pl}! Las cambiamos por 1 ${PV[PVK[i - 1]].one}.`);
      setTimeout(() => { if (!el.isConnected) return; cnt[i] = 0; cnt[i - 1]++; busy = false; sfx.ok(); draw(); check(); }, 1700);
    };
    const check = () => {
      if (val() !== t) return;
      busy = true; sfx.ok(); confetti(50);
      $$('.pvcol', el).forEach(c => c.classList.add('okc'));
      poli.cheer(`¡Sí! ${t} tiene ${pvSay(t)}.`);
      setTimeout(() => { if (!el.isConnected) return; r++; r < T.length ? round() : gameDone(F, 'g1', '¡Armaste todos los números!'); }, 3000);
    };
    draw();
    poli.say(r === 0 ? `Arma el número ${t} con los bloques. Usa los botones más y menos.` : `Ahora arma el ${t}.`);
  };
  round();
}

/* =========================================================
   Isla 2: valor posicional
   ========================================================= */
function lessonValor(F) {
  const D = pick(DIG9, 3), n = n3(D), rows = [D[0] * 100, D[1] * 10, D[2]];
  const z = [rnd(1, 9), 0, rnd(1, 9)], zn = n3(z), same = rnd(2, 9) * 111, sd = same % 10;
  runSteps([
    { say: `Esta es la tabla de valor posicional. Cada dígito vive en su casa: centenas, decenas o unidades. El ${n} tiene ${pvSay(n)}.`,
      render: b => b.innerHTML = `<div class="vsplit">${matHtml(D)}${numHtml(n)}</div>` },
    { gate: true, say: `Toca cada dígito del ${n} para separarlo en su valor.`,
      render: (b, c) => {
        b.innerHTML = `<div class="vsplit"><div class="nshape">${numHtml(n, { btn: true })}<span class="hint3d">Toca cada dígito</span></div>${msumHtml(rows, { total: n, ghost: true })}</div>`;
        const got = new Set();
        $$('button.dg', b).forEach(btn => btn.onclick = () => {
          const i = +btn.dataset.i; if (got.has(i)) return;
          got.add(i); btn.classList.add('done'); sfx.tap(got.size);
          $$(`.r${i}`, b).forEach(x => x.classList.remove('gh'));
          speak(`${D[i]} ${D[i] === 1 ? PV[PVK[i]].one : PV[PVK[i]].pl} ${D[i] === 1 ? 'vale' : 'valen'} ${rows[i]}`);
          if (got.size < 3) return;
          setTimeout(() => {
            if (!b.isConnected) return;
            $$('.rt', b).forEach(x => x.classList.remove('gh'));
            sfx.ok(); poli.cheer(`¡${n} es ${rows.join(' más ')}! Así se separa un número.`); c.unlock();
          }, 1500);
        });
      } },
    { say: `Mira el ${same}: tiene tres ${NUM[sd]}s, ¡pero cada uno vale distinto! ${sd * 100}, ${sd * 10} y ${sd}. El lugar cambia el valor.`,
      render: b => b.innerHTML = `<div class="vsplit">${numHtml(same)}${msumHtml([sd * 100, sd * 10, sd], { total: same })}</div>` },
    { say: `En el ${zn} hay un cero. El cero guarda el lugar de las decenas. ¡Sin él, sería ${z[0] * 10 + z[2]}!`,
      render: b => b.innerHTML = `<div class="vsplit"><div class="nshape">${numHtml(zn)}<p class="eq">El <b style="color:${PV.d.d}">0</b> guarda el lugar de las decenas.<br>Sin él, sería ${z[0] * 10 + z[2]}.</p></div>${msumHtml([z[0] * 100, z[2]], { total: zn })}</div>` },
    { gate: true, say: () => '¿Cuánto vale el dígito que salta?', render: (b, c) => choice(b, { ...freshQ(NQ.value), onRight: () => c.unlock() }) },
    doneStep(F.id, '¡Lección completa!', `${n} = ${rows.join(' + ')}`, `¡Lo lograste, ${save.name}! Ya sabes que el lugar de cada dígito cambia su valor.`),
  ], () => go('island', { id: F.id }), F.d);
}

/* =========================================================
   Isla 3: sumas de C, D y U (notación → número)
   ========================================================= */
/* cada término se transforma en su valor: 2C → 200, 3D → 30, 4U → 4; al final aparece el número */
/* open: valores a la vista · total: muestra el resultado (la ayuda de los juegos lo deja en "?") */
function termsHtml(terms, open, total = open) {
  return `<div class="nterms">${terms.map(([k, c], i) => `${i ? '<span class="nplus">+</span>' : ''}<div class="nt" style="--c:${PV[k].d};--l:${PV[k].l}">
    <button class="ntb ${open ? 'done' : ''}" data-i="${i}">${c}${PV[k].ab}</button><span class="ntw">${c} ${c === 1 ? PV[k].one : PV[k].pl}</span>
    <span class="ntv ${open ? 'on' : ''}">${c * PV_VAL[k]}</span></div>`).join('')}
    <div class="nt"><span class="ntb ghost">0</span><span class="ntw ghost">.</span><span class="ntres ${open ? 'on' : ''} ${total ? '' : 'ask'}">= ${total ? terms.reduce((a, [k, c]) => a + c * PV_VAL[k], 0) : '?'}</span></div></div>`;
}
function lessonNota(F) {
  const D = pick(DIG9, 3), t1 = PVK.map((k, i) => [k, D[i]]), n1 = n3(D);
  const D2 = pick(DIG9, 3), t2 = shuffle(PVK.map((k, i) => [k, D2[i]])), n2 = n3(D2);
  const z = [rnd(1, 9), rnd(1, 9)], t3 = [['c', z[0]], ['u', z[1]]], n3z = z[0] * 100 + z[1];
  runSteps([
    { say: 'En matemáticas usamos letras para escribir más corto: C es centena y vale 100, D es decena y vale 10, U es unidad y vale 1.',
      render: b => b.innerHTML = `<div class="duo">
        <div class="panel"><span class="tagx" style="background:${PV.c.c}">C</span><svg viewBox="0 0 100 100">${bFlat(6, 6, 86)}</svg><p>1C = 1 centena = <b style="color:${PV.c.d}">100</b></p></div>
        <div class="panel"><span class="tagx" style="background:${PV.d.c}">D</span><svg viewBox="0 0 100 100">${bRod(45, 4, 9)}</svg><p>1D = 1 decena = <b style="color:${PV.d.d}">10</b></p></div>
        <div class="panel"><span class="tagx" style="background:${PV.u.c}">U</span><svg viewBox="0 0 100 100">${bUnit(34, 34, 30)}</svg><p>1U = 1 unidad = <b style="color:${PV.u.d}">1</b></p></div></div>` },
    { gate: true, say: `Mira esta suma: ${notaVoice(t1)}. Toca cada parte para transformarla en su valor.`,
      render: (b, c) => {
        b.innerHTML = `<div class="col">${termsHtml(t1)}<span class="hint3d">Toca cada parte</span></div>`;
        const got = new Set();
        $$('.ntb', b).forEach(btn => btn.onclick = () => {
          const i = +btn.dataset.i; if (got.has(i)) return;
          got.add(i); btn.classList.add('done'); sfx.tap(got.size);
          const [k, cc] = t1[i]; btn.parentNode.querySelector('.ntv').classList.add('on');
          speak(`${cc} ${cc === 1 ? PV[k].one : PV[k].pl} ${cc === 1 ? 'es' : 'son'} ${cc * PV_VAL[k]}`);
          if (got.size < t1.length) return;
          setTimeout(() => {
            if (!b.isConnected) return;
            $('.ntres', b).classList.add('on'); sfx.ok();
            poli.cheer(`¡${t1.map(([k, cc]) => cc * PV_VAL[k]).join(' más ')} es ${n1}!`); c.unlock();
          }, 1400);
        });
      } },
    { say: `Las partes pueden venir desordenadas. ¡No importa! Cada letra dice su lugar: ${notaVoice(t2)} es ${n2}.`,
      render: b => b.innerHTML = `<div class="col">${termsHtml(t2, true)}<p class="eq">¡El orden no importa! La letra dice el lugar.</p></div>` },
    { say: `Aquí no hay decenas. Escribimos un cero en su lugar: ${notaVoice(t3)} es ${n3z}.`,
      render: b => b.innerHTML = `<div class="col">${termsHtml(t3, true)}<p class="eq">No hay <b style="color:${PV.d.d}">D</b>: el <b style="color:${PV.d.d}">0</b> guarda el lugar de las decenas.</p></div>` },
    { gate: true, say: () => '¿Qué número es?', render: (b, c) => choice(b, { ...freshQ(() => NQ.nota(1)), onRight: () => c.unlock() }) },
    doneStep(F.id, '¡Lección completa!', `${notaVoice(t1).replace(/ más /g, ' + ')} = ${n1}`, `¡Lo lograste, ${save.name}! Ya sabes transformar centenas, decenas y unidades en un número.`),
  ], () => go('island', { id: F.id }), F.d);
}

/* =========================================================
   Isla 4: tabla del 1000
   ========================================================= */
function lessonTabla(F) {
  const hr = rnd(1, 8), hc = rnd(1, 8), s0 = rnd(1, 10) * 10; // fila y columna resaltadas, inicio del conteo de 100 en 100
  runSteps([
    { say: 'Esta es la tabla del mil. Contamos de 10 en 10, desde 10 hasta 1000.',
      render: b => {
        b.innerHTML = `<div class="tlayout">${tableHtml(() => 'blank', () => false)}</div>`;
        const cells = $$('.ncell', b);
        cells.forEach((c, i) => setTimeout(() => { if (b.isConnected) { c.textContent = TV[i]; c.classList.remove('blank'); c.classList.add('lit'); } }, 300 + i * 30));
      } },
    { say: 'Hacia el lado, cada número suma 10: avanza una decena. Hacia abajo, cada número suma 100: avanza una centena.',
      render: b => b.innerHTML = `<div class="tlayout">${tableHtml(v => tRow(v) === hr ? 'rowhl' : tCol(v) === hc ? 'colhl' : '')}
        <div class="side-panel"><span class="chip" style="background:${PV.d.l};color:${PV.d.d}">→ Hacia el lado: +10</span><span class="chip" style="background:${PV.c.l};color:${PV.c.d}">↓ Hacia abajo: +100</span></div></div>` },
    { gate: true, say: `Ahora cuenta de 100 en 100 desde el ${s0}. Toca el ${s0}, el ${s0 + 100}, el ${s0 + 200}… ¡hasta llegar al ${s0 + 900}!`,
      render: (b, c) => {
        b.innerHTML = `<div class="tlayout">${tableHtml()}<div class="side-panel"><div class="counter"><b class="cn">0</b> de 10</div></div></div>`;
        let next = s0, k = 0;
        $$('.ncell', b).forEach(cell => cell.onclick = () => {
          const v = +cell.dataset.v; if (k >= 10 || v < next && (v - s0) % 100 === 0) return;
          if (v !== next) { sfx.bad(); poli.oops(k ? `Busca el ${next}. Está justo debajo del ${next - 100}.` : `Busca el ${next}. Está en la primera fila.`); return; }
          cell.classList.add('found'); k++; sfx.tap(k); speak(String(v)); $('.cn', b).textContent = k;
          next += 100;
          if (k === 10) { $('.counter', b).classList.add('full'); sfx.ok(); poli.cheer(`¡Contaste de 100 en 100 desde el ${s0} hasta el ${s0 + 900}!`); c.unlock(); }
        });
      } },
    { say: 'Si juntamos 10 centenas tenemos 1000: ¡mil! Es el último número de la tabla.',
      render: b => b.innerHTML = `<div class="col"><svg viewBox="0 0 330 140" class="grp">${Array.from({ length: 10 }, (_, i) => bFlat(6 + (i % 5) * 64, 6 + Math.floor(i / 5) * 66, 58)).join('')}</svg>
        <p class="eq"><b style="color:${PV.c.d}">10 centenas</b> = 1000 (mil)</p></div>` },
    doneStep(F.id, '¡Lección completa!', 'De 10 en 10 y de 100 en 100 hasta 1000', `¡Lo lograste, ${save.name}! Ya conoces la tabla del 1000.`),
  ], () => go('island', { id: F.id }), F.d);
}
/* Completa la tabla: casilleros perdidos, uno a la vez */
function gameTableFill(F) {
  const hidden = [];
  for (const v of shuffle(TV)) if (hidden.length < 6 && !hidden.some(h => Math.abs(tRow(h) - tRow(v)) + Math.abs(tCol(h) - tCol(v)) < 3)) hidden.push(v);
  hidden.sort((a, b) => a - b);
  let r = 0;
  const el = frame(`<div class="pbox">${progressBar(hidden.length, 0)}</div><div class="tlayout">${tableHtml(v => hidden.includes(v) ? 'blank' : '', v => !hidden.includes(v))}<div id="qBox" class="tq"></div></div>`);
  const ask = () => {
    const v = hidden[r], cell = $(`.ncell[data-v="${v}"]`, el);
    $('.pbox', el).innerHTML = progressBar(hidden.length, r);
    cell.classList.remove('blank'); cell.classList.add('ask'); cell.textContent = '?';
    choice($('#qBox', el), {
      prompt: '¿Qué número va en el casillero amarillo?',
      opts: numChoices(v, [v + 10, v - 10, v + 100, v - 100, v + 1], `¡Sí! Es ${v}.`, 'Mira el número de su izquierda y súmale 10. O el de arriba, y súmale 100.'),
      onRight: () => {
        cell.classList.remove('ask'); cell.classList.add('found'); cell.textContent = v; r++;
        setTimeout(() => { if (el.isConnected) r < hidden.length ? ask() : gameDone(F, 'g1', '¡Completaste la tabla del 1000!'); }, 1200);
      },
    });
    poli.say(r === 0 ? 'Se perdieron algunos números de la tabla. ¿Qué número va en el casillero amarillo?' : '¿Y en este casillero?');
  };
  ask();
}
/* Encuentra el número: solo se ven la primera columna y la primera fila */
function gameTableFind(F) {
  const targets = pick(TV.filter(v => tRow(v) > 0 && tCol(v) > 0), 5);
  let r = 0;
  const round = () => {
    const t = targets[r], anchor = v => tRow(v) === 0 || tCol(v) === 0;
    const el = frame(`${progressBar(targets.length, r)}<div class="hunt-title"><span class="tag">Toca el <b>${t}</b></span></div>
      <div class="tlayout">${tableHtml(v => anchor(v) ? 'anchor' : 'blank', anchor)}</div>`);
    poli.say(r === 0 ? `Los números de la tabla se escondieron. Usa las pistas de la orilla para encontrar el ${t}.` : `Ahora encuentra el ${t}.`);
    let done = false;
    $$('.ncell', el).forEach(cell => cell.onclick = () => {
      const v = +cell.dataset.v; if (done || anchor(v)) return;
      if (v === t) {
        done = true; cell.textContent = v; cell.classList.remove('blank', 'peek'); cell.classList.add('found'); sfx.ok();
        poli.cheer(`¡Sí! Ese es el ${t}.`);
        setTimeout(() => { if (!el.isConnected) return; r++; r < targets.length ? round() : gameDone(F, 'g2', '¡Encontraste todos los números!'); }, 1600);
        return;
      }
      cell.textContent = v; cell.classList.remove('blank'); cell.classList.add('peek'); sfx.bad();
      poli.oops(tRow(v) !== tRow(t) ? `Ese es el ${v}. El ${t} está en la fila que empieza con ${tRow(t) * 100 + 10}.` : v < t ? `Ese es el ${v}. Avanza hacia la derecha: suma 10.` : `Ese es el ${v}. El ${t} está más a la izquierda.`);
    });
  };
  round();
}

/* =========================================================
   Isla 5: secuencias numéricas
   ========================================================= */
function lessonSecu(F) {
  const ruleChip = s => `<span class="chip">Regla: ${ruleTxt(s).toLowerCase()}</span>`;
  const up = pick([2, 5, 10, 100], 1)[0], down = pick([-2, -5, -10, -100], 1)[0], vu = makeSeq(up), vd = makeSeq(down);
  runSteps([
    { say: `Una secuencia numérica es una fila de números que sigue una regla. Aquí la regla es sumar ${up}: ${vu.join(', ')}.`,
      render: b => b.innerHTML = `<div class="col">${seqHtml(vu, { hops: true })}${ruleChip(up)}</div>` },
    { say: `Las secuencias también pueden ir hacia atrás. Aquí la regla es restar ${-down}: ${vd.join(', ')}.`,
      render: b => b.innerHTML = `<div class="col">${seqHtml(vd, { hops: true })}${ruleChip(down)}</div>` },
    { gate: true, say: 'Para encontrar el número que falta, primero descubre la regla. ¿Qué número sigue?',
      render: (b, c) => choice(b, { ...freshQ(() => NQ.next()), onRight: () => c.unlock() }) },
    { gate: true, say: '¿Cuál es la regla de esta secuencia?',
      render: (b, c) => choice(b, { ...freshQ(() => NQ.rule(0)), onRight: () => c.unlock() }) },
    doneStep(F.id, '¡Lección completa!', 'Descubre la regla y encuentra el que sigue', `¡Lo lograste, ${save.name}! Ya sabes descubrir la regla de una secuencia.`),
  ], () => go('island', { id: F.id }), F.d);
}
const LOCO = `<svg viewBox="0 0 100 82" class="loco"><circle cx="20" cy="10" r="6" fill="#fff" opacity=".85"/><circle cx="10" cy="4" r="4" fill="#fff" opacity=".6"/>
  <rect x="15" y="16" width="12" height="20" rx="2" fill="#3b3f6b"/><rect x="8" y="32" width="58" height="30" rx="12" fill="#ff6b6b"/><rect x="56" y="12" width="36" height="50" rx="6" fill="#7c5cff"/>
  <rect x="52" y="6" width="44" height="9" rx="4" fill="#5a3fe0"/><rect x="64" y="20" width="20" height="15" rx="3" fill="#cfe6ff"/><path d="M0 62L8 46V62Z" fill="#ffc233"/>
  ${[24, 50, 78].map(x => `<circle cx="${x}" cy="66" r="10" fill="#3b3f6b" stroke="#9aa5c7" stroke-width="3"/>`).join('')}</svg>`;
const trainHtml = (vals, miss, got, now) => `<div class="train">${LOCO}${vals.map((v, i) => {
  const m = miss.includes(i) && !got.has(i);
  return `<span class="wagon ${m ? (i === now ? 'now' : 'miss') : got.has(i) ? 'got' : ''}" style="--wc:${COLORS[i % 6]}"><span>${m ? '?' : v}</span></span>`;
}).join('')}</div>`;
/* El tren: cada tren sigue una regla; completa los vagones con "?" */
function gameTrain(F) {
  // [regla, nivel, vagones perdidos]: 3 trenes fáciles y 3 más difíciles, con reglas distintas cada vez
  const plan = [...pick([2, 5, 10, -10], 3).map(s => [s, 0, 1]), ...pick([[10, 1], [100, 1], [-100, 0], [2, 1], [5, 1], [-10, 1]], 3).map(([s, l]) => [s, l, 2])];
  let r = 0;
  const round = () => {
    const [step, lvl, nm] = plan[r], vals = makeSeq(step, lvl), miss = pick([1, 2, 3, 4], nm).sort((a, b) => a - b), got = new Set();
    const el = frame(`${progressBar(plan.length, r)}<div class="ngame"><div id="trainBox"></div><div id="qBox"></div></div>`);
    let mi = 0;
    const ask = () => {
      const i = miss[mi], last = mi === miss.length - 1;
      $('#trainBox', el).innerHTML = trainHtml(vals, miss, got, i);
      choice($('#qBox', el), {
        prompt: '¿Qué número va en el vagón amarillo?',
        opts: missOpts(vals, i, step, last ? `¡Sí! Es ${vals[i]}. La regla es ${ruleTxt(step).toLowerCase()}.` : `¡Sí! Es ${vals[i]}.`),
        onRight: () => {
          got.add(i); mi++;
          $('#trainBox', el).innerHTML = trainHtml(vals, miss, got, -1);
          if (!last) { setTimeout(() => el.isConnected && ask(), 1000); return; }
          $('#trainBox', el).insertAdjacentHTML('beforeend', `<span class="chip rulechip">Regla: ${ruleTxt(step).toLowerCase()}</span>`);
          setTimeout(() => { if (!el.isConnected) return; r++; r < plan.length ? round() : gameDone(F, 'g1', '¡Completaste todos los trenes!'); }, 2800);
        },
      });
    };
    ask();
    poli.say(r === 0 ? 'Cada tren sigue una regla. Descúbrela y encuentra el número del vagón amarillo.' : nm > 1 ? 'Este tren perdió dos números. ¿Cuál va en el vagón amarillo?' : '¿Qué número va en el vagón amarillo?');
  };
  round();
}

/* botón 💡 Ayuda de las sumas C + D + U: transforma cada parte en su valor, pero el total lo descubre ella */
document.addEventListener('click', e => {
  const b = e.target.closest('.helpbtn'); if (!b) return;
  const box = b.parentNode; sfx.pop();
  box.innerHTML = box.querySelector('template').innerHTML;
  const vals = $$('.ntv', box).map(v => v.textContent);
  poli.say(`Mira cuánto vale cada parte: ${vals.join(', ')}. ¡Júntalas y elige el número!`);
});

/* ---------- lecciones y juegos de cada isla ---------- */
const NUMLESSON = { udc: lessonUDC, valor: lessonValor, nota: lessonNota, tabla: lessonTabla, secu: lessonSecu };
const NUMGAME = {
  udc: { g1: gameBuild, g2: F => quizGame(F, 'g2', [() => NQ.blocks('mat'), () => NQ.blocks('mat'), () => NQ.blocks('loose'), () => NQ.blocks('loose'), () => NQ.blocks('canje')], '¡Descubriste todos los números!') },
  valor: {
    g1: F => quizGame(F, 'g1', [NQ.value, NQ.place, NQ.which, NQ.value, NQ.place, NQ.which], '¡Ya sabes cuánto vale cada dígito!'),
    g2: F => quizGame(F, 'g2', [() => NQ.sum(false), NQ.missing, () => NQ.sum(true), NQ.missing, () => NQ.sum(false)], '¡Separaste y juntaste todos los números!'),
  },
  nota: {
    g1: F => quizGame(F, 'g1', [() => NQ.nota(0), () => NQ.nota(1), () => NQ.nota(2), () => NQ.nota(1), () => NQ.nota(2), () => NQ.nota(3)], '¡Transformaste todas las sumas en números!'),
    g2: F => quizGame(F, 'g2', [NQ.notaRev, NQ.notaRev, () => NQ.nota(2), NQ.notaRev, () => NQ.nota(3)], '¡Ya sabes escribir números con C, D y U!'),
  },
  tabla: { g1: gameTableFill, g2: gameTableFind },
  secu: { g1: gameTrain, g2: F => quizGame(F, 'g2', [() => NQ.rule(0), () => NQ.rule(0), () => NQ.rule(1), () => NQ.rule(1), () => NQ.rule(1)], '¡Descubriste todas las reglas!') },
};
