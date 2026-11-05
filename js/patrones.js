'use strict';
/* =========================================================
   Capítulo 4: Patrones — colores, figuras y patrones que crecen.
   Se enchufa al mismo motor del capítulo 3 (islas tipo 'num', NQ, NUMLESSON, NUMGAME, quizGame, runSteps),
   así que no cambia nada de lo anterior. Los ejercicios son al azar (freshQ) y no se repiten en la sesión.
   Para sumar otra isla: agregarla a PATS, a CH[4].nodes, y definir su lección (NUMLESSON), juegos (NUMGAME),
   ícono (PICON) y preguntas (NQ.xx_*, con su tema en N_TOPIC).
   ========================================================= */

/* ---------- fichas: círculos de colores y figuras ---------- */
const PCOL = [['rojo', '#ff6b6b', '#d94646'], ['azul', '#4ea8ff', '#2a7fd6'], ['amarillo', '#ffc233', '#e09a00'], ['verde', '#22c58b', '#169a6a'], ['morado', '#9b6bff', '#7447e0'], ['naranja', '#ff8a3d', '#e0651a']];
const PSHP = ['círculo', 'cuadrado', 'triángulo', 'estrella', 'rombo'];
const tokKey = t => t.k + t.i;
const tokName = t => t.k === 'c' ? PCOL[t.i][0] : PSHP[t.i];
function tokSvg(t, px = 44) {
  const col = t.k === 'c' ? PCOL[t.i] : ['', '#9b6bff', '#7447e0'], f = `fill="${col[1]}" stroke="${col[2]}" stroke-width="3" stroke-linejoin="round"`;
  const shape = t.k === 'c' ? `<circle cx="20" cy="20" r="15" ${f}/>` : [
    `<circle cx="20" cy="20" r="15" ${f}/>`, `<rect x="6" y="6" width="28" height="28" rx="4" ${f}/>`, `<polygon points="20,5 35,34 5,34" ${f}/>`,
    `<polygon points="${starPts(20, 21, 17)}" ${f}/>`, `<polygon points="20,4 36,20 20,36 4,20" ${f}/>`][t.i];
  return `<svg viewBox="0 0 40 40" width="${px}" height="${px}" class="pt" aria-hidden="true">${shape}</svg>`;
}
const patHtml = (toks, hole = -1, tail = false) => `<div class="pat">${toks.map((t, i) => i === hole ? '<span class="ptq">?</span>' : tokSvg(t)).join('')}${tail ? '<span class="ptq">?</span>' : ''}</div>`;
const patSmall = toks => `<span class="pat sm">${toks.map(t => tokSvg(t, 34)).join('')}</span>`;

/* una "unidad" que se repite: AB, AAB, ABB, ABC, AABB… */
function patUnit(kind) {
  const form = pick(['AB', 'AB', 'ABB', 'AAB', 'ABC', 'AABB'], 1)[0], letters = [...new Set(form)];
  const ids = pick(Array.from({ length: kind === 'c' ? PCOL.length : PSHP.length }, (_, i) => i), letters.length), map = {};
  letters.forEach((ch, j) => map[ch] = { k: kind, i: ids[j] });
  return [...form].map(ch => map[ch]);
}
const unitSay = u => listY(u.map(tokName));
const foreign = (unit, kind, n) => pick(Array.from({ length: kind === 'c' ? PCOL.length : PSHP.length }, (_, i) => ({ k: kind, i })).filter(t => !unit.some(x => tokKey(x) === tokKey(t))), n);
/* tres opciones de ficha: la correcta y dos más (una del mismo patrón si hay, otra de afuera) */
function tokOpts(right, unit, kind, say, hint) {
  const same = shuffle(unit.filter(t => tokKey(t) !== tokKey(right))), wrong = [...same.slice(0, 1), ...foreign(unit, kind, 2)].slice(0, 2);
  return shuffle([right, ...wrong]).map(t => ({ html: tokSvg(t, 56), ok: tokKey(t) === tokKey(right), say, hint }));
}

/* ---------- preguntas de colores y de figuras ---------- */
function patQ(kind, type) {
  const unit = patUnit(kind), u = unit.length, what = kind === 'c' ? 'color' : 'figura', hint = `Mira qué se repite: ${unitSay(unit)}.`;
  const say = t => `¡Sí! El patrón es ${unitSay(unit)} y se repite. Aquí va ${kind === 'c' ? 'el' : (t.i === 3 ? 'la' : 'el')} ${tokName(t)}.`;
  if (type === 'next') {
    const L = u * 2 + (u === 2 ? 1 : rnd(1, u - 1)), seq = Array.from({ length: L }, (_, i) => unit[i % u]), ans = unit[L % u];
    return { prompt: `¿Qué ${what} sigue?`, shape: `<div class="nshape">${patHtml(seq, -1, true)}</div>`, opts: tokOpts(ans, unit, kind, say(ans), hint) };
  }
  if (type === 'miss') {
    const L = u * 3, i = rnd(u, 2 * u - 1), seq = Array.from({ length: L }, (_, k) => unit[k % u]), ans = seq[i];
    return { prompt: `¿Qué ${what} falta?`, shape: `<div class="nshape">${patHtml(seq, i)}</div>`, opts: tokOpts(ans, unit, kind, say(ans), hint) };
  }
  // core: qué parte se repite (las opciones equivocadas llevan una ficha de afuera, así nunca son otra forma de decir lo mismo)
  const seq = Array.from({ length: u * 3 }, (_, k) => unit[k % u]), wrongs = [], tries = shuffle(unit.flatMap((_, p) => foreign(unit, kind, 3).map(f => [p, f])));
  for (const [p, f] of tries) { if (wrongs.length < 2 && !wrongs.some(w => w.p === p && tokKey(w.f) === tokKey(f))) wrongs.push({ p, f }); }
  const opts = shuffle([{ toks: unit, ok: true }, ...wrongs.map(w => ({ toks: unit.map((t, i) => i === w.p ? w.f : t), ok: false }))]);
  return { prompt: '¿Qué parte se repite?', shape: `<div class="nshape">${patHtml(seq)}</div>`, cls: 'txt',
    opts: opts.map(o => ({ html: patSmall(o.toks), ok: o.ok, say: `¡Sí! Se repite ${unitSay(unit)}.`, hint: 'Busca la parte que aparece una y otra vez, desde el principio.' })) };
}

/* ---------- patrones que crecen: torres de cubos ---------- */
function towerSvg(vals, hole = -1, tail = false) {
  const n = vals.length + (tail ? 1 : 0), W = 38, C = 15, H = 11 * C + 10, svg = [];
  const show = vals.map((v, i) => i === hole ? null : v);
  for (let i = 0; i < n; i++) {
    const x = 6 + i * W, v = show[i];
    if (v) for (let k = 0; k < v; k++) svg.push(`<rect x="${x}" y="${H - 6 - (k + 1) * C}" width="${W - 10}" height="${C - 2}" rx="3" fill="#4ea8ff" stroke="#2a7fd6" stroke-width="2"/>`);
    else svg.push(`<rect x="${x}" y="${H - 6 - 4 * C}" width="${W - 10}" height="${4 * C - 2}" rx="5" fill="none" stroke="#9b6bff" stroke-width="3" stroke-dasharray="6 5"/><text x="${x + (W - 10) / 2}" y="${H - 6 - 2 * C + 6}" text-anchor="middle" font-size="22" font-weight="800" fill="#7447e0">?</text>`);
  }
  return `<svg viewBox="0 0 ${n * W + 6} ${H}" class="towers" style="width:min(${n * 44}px,86vw)">${svg.join('')}</svg>`;
}
const smallChoices = (right, say, hint) => {
  const w = pick([right + 1, right - 1, right + 2, right - 2].filter(v => v > 0 && v !== right), 2);
  return shuffle([right, ...w]).map(v => ({ html: v, ok: v === right, say, hint }));
};
function growQ(type) {
  const s0 = rnd(1, 2), d = rnd(1, 2), cnt = type === 'next' ? 4 : 5, vals = Array.from({ length: cnt }, (_, i) => s0 + d * i), more = `${d} ${d === 1 ? 'cubo' : 'cubos'} más`;
  const hint = 'Mira cuántos cubos más tiene cada torre que la anterior.';
  if (type === 'next') {
    const ans = s0 + d * cnt;
    return { prompt: '¿Cuántos cubos tendrá la torre que sigue?', shape: `<div class="nshape">${towerSvg(vals, -1, true)}</div>`, opts: smallChoices(ans, `¡Sí! Cada torre tiene ${more}. La que sigue tiene ${ans}.`, hint) };
  }
  const i = rnd(1, cnt - 2), ans = vals[i];
  return { prompt: '¿Cuántos cubos tiene la torre que falta?', shape: `<div class="nshape">${towerSvg(vals, i)}</div>`, opts: smallChoices(ans, `¡Sí! Cada torre tiene ${more}. A esta le tocan ${ans}.`, hint) };
}

/* preguntas del Gran Desafío y de los juegos (se registran en NQ y su tema en N_TOPIC) */
Object.assign(NQ, {
  pc_next: () => patQ('c', 'next'), pc_miss: () => patQ('c', 'miss'), pc_core: () => patQ('c', 'core'),
  pf_next: () => patQ('f', 'next'), pf_miss: () => patQ('f', 'miss'), pf_core: () => patQ('f', 'core'),
  pg_next: () => growQ('next'), pg_miss: () => growQ('miss'),
});
Object.assign(N_TOPIC, { pc_next: 'pcolor', pc_miss: 'pcolor', pc_core: 'pcolor', pf_next: 'pfigura', pf_miss: 'pfigura', pf_core: 'pfigura', pg_next: 'pcrece', pg_miss: 'pcrece' });

/* ---------- islas del capítulo ---------- */
const PATS = [
  { id: 'pcolor', title: 'Patrones de colores', short: 'Colores', isle: 'los patrones de colores', c: '#ff6b6b', d: '#d94646', l: '#ffd6d6',
    chips: ['Rojo, azul, rojo, azul…', 'Se repite'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'Descubre qué se repite' }, { k: 'g1', t: '¿Qué color sigue?', sub: 'Continúa el patrón' }, { k: 'g2', t: 'Completa el patrón', sub: 'Encuentra la parte que falta' }] },
  { id: 'pfigura', title: 'Patrones de figuras', short: 'Figuras', isle: 'los patrones de figuras', c: '#9b6bff', d: '#7447e0', l: '#e0d3ff',
    chips: ['Círculo, cuadrado…', 'Se repite'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'Las figuras también se repiten' }, { k: 'g1', t: '¿Qué figura sigue?', sub: 'Continúa el patrón' }, { k: 'g2', t: 'Completa el patrón', sub: 'Encuentra la parte que falta' }] },
  { id: 'pcrece', title: 'Patrones que crecen', short: 'Que crecen', isle: 'los patrones que crecen', c: '#22c58b', d: '#169a6a', l: '#d2f7e8',
    chips: ['1, 2, 3 cubos…', 'Cada vez más'],
    acts: [{ k: 'lesson', t: 'Aprende', sub: 'Torres que van creciendo' }, { k: 'g1', t: '¿Cuántos cubos siguen?', sub: 'Mira cuánto crece' }, { k: 'g2', t: 'La torre que falta', sub: 'Encuentra el número' }] },
].map(T => ({ ...T, kind: 'num', name: T.title, ch: 4 }));
PATS.forEach(T => { FIG[T.id] = T; });
CH[4] = {
  nodes: ['intro4', ...PATS.map(T => T.id), 'challengePat'], intro: 'intro4', chal: 'challengePat', figs: PATS, label: '4 · Patrones',
  introLabel: 'Patrones', sticker: () => ['Detective', 'Descubrir patrones'], chalTitle: 'Gran Desafío de Patrones', champ: () => gx('una campeona', 'un campeón') + ' de los patrones',
  hello: n => `¡${gx('Bienvenida', 'Bienvenido')} al capítulo de los patrones, ${n}! Toca la isla verde.`,
  types: ['n:pc_next', 'n:pf_next', 'n:pc_miss', 'n:pf_miss', 'n:pc_core', 'n:pf_core', 'n:pg_next', 'n:pg_miss'],
};

/* íconos (en el mapa, en la isla y en el álbum) */
const PICON = {
  pcolor: white => [0, 1, 0, 1].map((k, i) => `<circle cx="${17 + i * 22}" cy="50" r="10" fill="${white ? '#fff' : PCOL[k][1]}" ${white ? '' : `stroke="${PCOL[k][2]}" stroke-width="3"`}/>`).join(''),
  pfigura: white => { const f = white ? 'fill="#fff"' : 'fill="#9b6bff" stroke="#7447e0" stroke-width="3" stroke-linejoin="round"'; return `<circle cx="20" cy="50" r="11" ${f}/><polygon points="50,38 62,62 38,62" ${f}/><circle cx="80" cy="50" r="11" ${f}/>`; },
  pcrece: white => [1, 2, 3].map((n, i) => Array.from({ length: n }, (_, k) => `<rect x="${12 + i * 27}" y="${70 - k * 17}" width="22" height="15" rx="3" fill="${white ? '#fff' : '#22c58b'}" ${white ? '' : 'stroke="#169a6a" stroke-width="2.5"'}/>`).join('')).join(''),
};
const _numIcon = numIcon;
numIcon = (id, white) => PICON[id] ? `<svg viewBox="0 0 100 100">${PICON[id](white)}</svg>` : _numIcon(id, white);

/* ---------- lecciones ---------- */
const EX = { c: [{ k: 'c', i: 0 }, { k: 'c', i: 1 }], f: [{ k: 'f', i: 0 }, { k: 'f', i: 2 }] };
const exSeq = (u, n = 6) => Array.from({ length: n }, (_, i) => u[i % u.length]);
const askStep = (say, gen) => ({ gate: true, say, render: (b, c) => { const q = freshQ(gen); choice(b, { prompt: q.prompt, shape: q.shape || '', opts: q.opts, cls: q.cls || '', onRight: () => c.unlock() }); } });
function lessonIntroPat() {
  runSteps([
    { say: `¡Hola, ${save.name}! Mira esta fila: rojo, azul, rojo, azul… ¡Se repite una y otra vez! Eso se llama patrón.`,
      render: b => b.innerHTML = `<div class="col">${patHtml(exSeq(EX.c, 6))}<h2>Un patrón es algo que se repite</h2><span class="sub">Una y otra vez, siempre igual</span></div>` },
    askStep('Ahora tú. ¿Qué viene después? Fíjate en lo que se repite.', NQ.pc_next),
    { say: 'Los patrones están en todas partes: en las rayas de una polera, en los azulejos, en la música y hasta en los días de la semana.',
      render: b => b.innerHTML = `<div class="col"><div class="emo">🦓 🧱 🎵 📅</div><h2>¡Hay patrones por todos lados!</h2><span class="sub">Tú también puedes inventar uno</span></div>` },
    doneStep('intro4', '¡Muy bien!', 'Se abre la isla de los patrones de colores', `¡Genial, ${save.name}! Ya sabes qué es un patrón.`),
  ], () => go('map'), '#1b9f72');
}
NUMLESSON.pcolor = F => runSteps([
  { say: 'Los colores pueden hacer patrones. Mira: rojo, rojo, azul… y otra vez rojo, rojo, azul.', render: b => b.innerHTML = `<div class="col">${patHtml(exSeq([EX.c[0], EX.c[0], EX.c[1]], 6))}<h2>Rojo, rojo, azul</h2><span class="sub">Esa parte se repite</span></div>` },
  askStep('¿Qué color viene ahora?', NQ.pc_next),
  askStep('Ahora busca la parte que se repite.', NQ.pc_core),
  doneStep(F.id, '¡Lección completa!', 'Los colores también hacen patrones', `¡Lo lograste, ${save.name}! Ya sabes seguir patrones de colores.`),
], () => go('island', { id: F.id }), F.d);
NUMLESSON.pfigura = F => runSteps([
  { say: 'Las figuras también hacen patrones. Mira: círculo, triángulo, círculo, triángulo…', render: b => b.innerHTML = `<div class="col">${patHtml(exSeq(EX.f, 6))}<h2>Círculo, triángulo</h2><span class="sub">Se repiten una y otra vez</span></div>` },
  askStep('¿Qué figura viene ahora?', NQ.pf_next),
  askStep('Ahora completa el patrón. ¿Qué figura falta?', NQ.pf_miss),
  doneStep(F.id, '¡Lección completa!', 'Las figuras también hacen patrones', `¡Muy bien, ${save.name}! Ya sabes seguir patrones de figuras.`),
], () => go('island', { id: F.id }), F.d);
NUMLESSON.pcrece = F => runSteps([
  { say: 'Hay patrones que crecen. Esta torre tiene 1 cubo, la siguiente 2 y la siguiente 3. ¡Cada una tiene un cubo más!', render: b => b.innerHTML = `<div class="col">${towerSvg([1, 2, 3])}<h2>1, 2, 3… ¡un cubo más cada vez!</h2><span class="sub">Así crece este patrón</span></div>` },
  askStep('¿Cuántos cubos tendrá la torre que sigue?', NQ.pg_next),
  askStep('Ahora encuentra la torre que falta.', NQ.pg_miss),
  doneStep(F.id, '¡Lección completa!', 'Los patrones también pueden crecer', `¡Excelente, ${save.name}! Ya sabes seguir patrones que crecen.`),
], () => go('island', { id: F.id }), F.d);

/* ---------- juegos ---------- */
NUMGAME.pcolor = {
  g1: F => quizGame(F, 'g1', [NQ.pc_next, NQ.pc_next, NQ.pc_next, NQ.pc_next, NQ.pc_next], '¡Seguiste todos los patrones de colores!'),
  g2: F => quizGame(F, 'g2', [NQ.pc_miss, NQ.pc_core, NQ.pc_miss, NQ.pc_core, NQ.pc_miss], '¡Completaste todos los patrones!'),
};
NUMGAME.pfigura = {
  g1: F => quizGame(F, 'g1', [NQ.pf_next, NQ.pf_next, NQ.pf_next, NQ.pf_next, NQ.pf_next], '¡Seguiste todos los patrones de figuras!'),
  g2: F => quizGame(F, 'g2', [NQ.pf_miss, NQ.pf_core, NQ.pf_miss, NQ.pf_core, NQ.pf_miss], '¡Completaste todos los patrones!'),
};
NUMGAME.pcrece = {
  g1: F => quizGame(F, 'g1', [NQ.pg_next, NQ.pg_next, NQ.pg_next, NQ.pg_next, NQ.pg_next], '¡Seguiste todas las torres!'),
  g2: F => quizGame(F, 'g2', [NQ.pg_miss, NQ.pg_miss, NQ.pg_miss, NQ.pg_miss, NQ.pg_miss], '¡Encontraste todas las torres que faltaban!'),
};

/* ---------- Repaso y Mi avance: los temas del capítulo ---------- */
for (const T of PATS) {
  const topic = { id: T.id, ch: 4, name: T.title, learned: () => !!prog(T.id).lesson,
    gen: () => ({ pcolor: () => pick([NQ.pc_next, NQ.pc_miss, NQ.pc_core], 1)[0](), pfigura: () => pick([NQ.pf_next, NQ.pf_miss, NQ.pf_core], 1)[0](), pcrece: () => pick([NQ.pg_next, NQ.pg_miss], 1)[0]() })[T.id]() };
  TOPICS.push(topic); TOP[T.id] = topic;
}
