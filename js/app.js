'use strict';
/* =========================================================
   Mundo de Formas y Números — app para 2° básico
   Capítulo 1: polígonos · Capítulo 2: figuras 2D y 3D · Capítulo 3: números (js/numeros.js)
   Sin dependencias: HTML + CSS + JS puro (SVG, Canvas 3D, WebAudio, SpeechSynthesis)
   ========================================================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NUM = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const ps = pts => pts.map(p => p.join(',')).join(' ');

/* ---------- guardado ---------- */
const KEY = 'poligonos-magicos-v1';
const SAVEVER = 1;
const NEWSAVE = () => ({ ver: SAVEVER, name: '', g: '', fx: true, voice: true, prog: {}, challenge: 0, challenge3d: 0, challengeNum: 0, ch: 1, stats: {}, repasoOff: [] });
/* el nombre se muestra dentro de la página: solo letras, números y espacios */
const cleanName = s => String(s || '').replace(/[^\p{L}\p{N} .-]/gu, '').trim().slice(0, 14);
/* traspaso del progreso entre versiones del guardado: si algún día se renombra, une o elimina
   una isla, se agrega aquí un paso { de: n, paso: s => {...} } que convierte el progreso antiguo */
const MIGRATIONS = [{ de: 0, paso: s => s }]; // 0 → 1: guardados anteriores al número de versión, sin cambios
function migrate(s) { s.ver ||= 0; for (const m of MIGRATIONS) if (s.ver === m.de) { m.paso(s); s.ver = m.de + 1; } return s; }
/* perfiles: cada niño o niña tiene su propio progreso.
   Se guarda { profiles: {id: progreso}, order: [ids], cur: id }; save es el progreso del perfil que está jugando */
const MAXPROFILES = 6;
let root = { profiles: {}, order: [], cur: null };
const newPid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
try {
  const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
  if (raw && raw.profiles && Array.isArray(raw.order)) root = { profiles: raw.profiles, order: raw.order.filter(id => raw.profiles[id]), cur: raw.cur };
  else if (raw && (raw.name || raw.prog)) { const id = newPid(); root = { profiles: { [id]: raw }, order: [id], cur: id }; } // progreso de antes de los perfiles
} catch (e) { }
function loadProfile(id) {
  const raw = root.profiles[id] || {}, s = Object.assign(NEWSAVE(), raw);
  if (!('ver' in raw)) s.ver = 0;
  s.name = cleanName(s.name);
  return migrate(s);
}
if (!root.profiles[root.cur]) root.cur = root.order[0] || null;
let save = root.cur ? loadProfile(root.cur) : NEWSAVE();
/* g: 'a' niña · 'o' niño (vacío: aún no se pregunta). gx('campeona', 'campeón') elige la palabra según el perfil */
const gx = (a, o) => save.g === 'o' ? o : a;
let demoMode = false; // recorrido con mapa de muestra: no se guarda nada
const persist = () => { if (demoMode) return; if (root.cur) root.profiles[root.cur] = save; try { localStorage.setItem(KEY, JSON.stringify({ ver: 2, ...root })); } catch (e) { } };
persist();
function switchProfile(id) { persist(); root.cur = id; save = loadProfile(id); persist(); }
function addProfile(name, g) { const id = newPid(); root.profiles[id] = { ...NEWSAVE(), name, g }; root.order.push(id); switchProfile(id); }
function deleteProfile(id) {
  delete root.profiles[id]; root.order = root.order.filter(x => x !== id);
  if (root.cur === id) { root.cur = root.order[0] || null; save = root.cur ? loadProfile(root.cur) : NEWSAVE(); }
  persist();
}
const profileStars = id => { const keep = save; save = id === root.cur ? save : loadProfile(id); const n = totalStars(); save = keep; return n; };
const prog = id => (save.prog[id] ||= {});

/* objetos ya mostrados en esta sesión, para no repetirlos entre lección y caza */
const seen = {};
function pickFresh(pool, n, key) {
  const s = (seen[key] ||= new Set());
  let out = shuffle(pool.filter(o => !s.has(o.id))).slice(0, n);
  if (out.length < n) { s.clear(); out = [...out, ...shuffle(pool.filter(o => !out.includes(o))).slice(0, n - out.length)]; }
  out.forEach(o => s.add(o.id));
  return out;
}

/* ---------- figuras 2D (capítulo 1) ---------- */
const reg = (n, start, r = 80, cx = 100, cy = 100) => Array.from({ length: n }, (_, i) => {
  const a = (start + 360 / n * i) * Math.PI / 180;
  return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
});
const starPts = (cx, cy, R, r = R * .45) => ps(Array.from({ length: 10 }, (_, i) => { const a = (-90 + i * 36) * Math.PI / 180, q = i % 2 ? r : R; return [+(cx + q * Math.cos(a)).toFixed(1), +(cy + q * Math.sin(a)).toFixed(1)]; }));
const SHAPES = [
  { id: 'tri', art: 'el', name: 'triángulo', n: 3, c: '#ff6b6b', d: '#d94646', l: '#ffd6d6', pts: [[100, 22], [172, 150], [28, 150]],
    fact: 'Tri quiere decir tres. ¡Es el polígono con menos lados que existe!' },
  { id: 'sq', art: 'el', name: 'cuadrado', n: 4, c: '#ffb703', d: '#d98f00', l: '#ffeab0', pts: reg(4, 45, 80),
    fact: 'Sus cuatro lados miden exactamente lo mismo. ¡Son todos iguales!' },
  { id: 'rect', art: 'el', name: 'rectángulo', n: 4, c: '#2ec4b6', d: '#1f9e92', l: '#c3f1ec', pts: [[26, 58], [174, 58], [174, 142], [26, 142]],
    fact: 'Tiene cuatro lados: dos largos y dos cortos. ¡Los que se miran de frente son iguales!' },
  { id: 'pent', art: 'el', name: 'pentágono', n: 5, c: '#4ea8ff', d: '#2a7fd6', l: '#cfe6ff', pts: reg(5, -90, 82),
    fact: 'Penta quiere decir cinco. ¡Cinco lados y cinco vértices!' },
  { id: 'hex', art: 'el', name: 'hexágono', n: 6, c: '#9b6bff', d: '#7447e0', l: '#e0d3ff', pts: reg(6, 0, 84),
    fact: 'Hexa quiere decir seis. ¡Las abejas hacen sus panales con hexágonos!' },
  { id: 'oct', art: 'el', name: 'octágono', n: 8, c: '#ff7eb6', d: '#e0529a', l: '#ffd3e8', pts: reg(8, 22.5, 82),
    fact: 'Octo quiere decir ocho, como los ocho brazos de un pulpo.' },
].map(s => ({ ...s, kind: '2d' }));
const SH = Object.fromEntries(SHAPES.map(s => [s.id, s]));
const POLYNAMES = { 3: 'triángulo', 4: 'cuadrilátero', 5: 'pentágono', 6: 'hexágono', 7: 'heptágono', 8: 'octágono', 9: 'eneágono', 10: 'decágono' };
const NAME2D = { tri: 'triángulo', sq: 'cuadrado', rect: 'rectángulo', circ: 'círculo' };

/* ---------- cuerpos 3D (capítulo 2) ---------- */
const SOLIDS = [
  { id: 'cubo', art: 'el', name: 'cubo', c: '#ffb703', d: '#d98f00', l: '#ffeab0', print: 'sq', base: 'una de sus caras', rolls: false,
    fact: 'Las 6 caras del cubo son cuadrados del mismo tamaño. ¡Por eso un dado puede caer de cualquier lado!' },
  { id: 'caja', art: 'el', name: 'prisma rectangular', pl: 'los prismas rectangulares', c: '#2ec4b6', d: '#1f9e92', l: '#c3f1ec', print: 'rect', base: 'su cara más grande', rolls: false,
    fact: 'También se llama paralelepípedo. Tiene 6 caras: 2 cuadrados, uno en cada punta, y 4 rectángulos iguales alrededor.' },
  { id: 'prisma3', art: 'el', name: 'prisma triangular', pl: 'los prismas triangulares', c: '#ff6b6b', d: '#d94646', l: '#ffd6d6', print: 'rect', base: 'uno de sus lados largos', rolls: false,
    fact: 'Tiene 5 caras: 2 triángulos, uno en cada punta, unidos por 3 rectángulos. ¡Como una carpa!' },
  { id: 'piramide', art: 'la', name: 'pirámide de base cuadrada', pl: 'las pirámides de base cuadrada', c: '#ff8a3d', d: '#e0651a', l: '#ffdcc4', print: 'sq', base: 'su base', rolls: false,
    fact: 'Tiene 5 caras: abajo, 1 cuadrado que es su base, y sobre él 4 triángulos que se juntan en una punta.' },
  { id: 'piramide3', art: 'la', name: 'pirámide de base triangular', pl: 'las pirámides de base triangular', c: '#34c3e0', d: '#1d9cb8', l: '#c9f1fa', print: 'tri', base: 'su base', rolls: false,
    fact: 'Tiene 4 caras y todas son triángulos, ¡hasta su base! Es la pirámide con menos caras que existe.' },
  { id: 'esfera', art: 'la', name: 'esfera', c: '#4ea8ff', d: '#2a7fd6', l: '#cfe6ff', print: null, rolls: true,
    fact: 'La esfera es toda curva, como una pelota: no tiene caras planas, ni aristas, ni vértices. ¡Por eso rueda hacia todos lados!' },
  { id: 'cilindro', art: 'el', name: 'cilindro', c: '#9b6bff', d: '#7447e0', l: '#e0d3ff', print: 'circ', base: 'su base', rolls: true,
    fact: 'Tiene 2 caras planas con forma de círculo, arriba y abajo, unidas por una parte curva. Acostado, ¡puede rodar!' },
  { id: 'cono', art: 'el', name: 'cono', c: '#ff7eb6', d: '#e0529a', l: '#ffd3e8', print: 'circ', base: 'su base', rolls: true,
    fact: 'Tiene 1 cara plana con forma de círculo y una parte curva que termina en una punta: su vértice.' },
].map(s => ({ ...s, kind: '3d' }));
const SB = Object.fromEntries(SOLIDS.map(s => [s.id, s]));
const FIG = { ...SH, ...SB };
const ACTS = { '2d': ['lesson', 'build', 'hunt'], '3d': ['lesson', 'paint', 'hunt'] };
const figStars = id => ACTS[FIG[id].kind].filter(k => prog(id)[k]).length;
const del = F => F.art === 'el' ? `del ${F.name}` : `de la ${F.name}`;
const plural = F => F.pl || `${F.art === 'la' ? 'las' : 'los'} ${F.name}s`;

/* capítulos: el 3 (números) se agrega desde js/numeros.js */
const CH = {
  1: { nodes: ['intro', 'tri', 'sq', 'rect', 'pent', 'hex', 'oct', 'challenge', 'taller'], intro: 'intro', chal: 'challenge', figs: SHAPES, label: '1 · Polígonos',
    introLabel: 'Inicio', sticker: () => [gx('Exploradora', 'Explorador'), 'Qué es un polígono'], chalTitle: 'Gran Desafío', champ: () => gx('una campeona', 'un campeón') + ' de las formas',
    hello: n => `¡Hola, ${n}! Toca la isla verde para empezar.`, types: ['sides', 'sides', 'vert', 'vert', 'name', 'name', 'notpoly', 'poly'] },
  2: { nodes: ['intro3d', ...SOLIDS.map(s => s.id), 'challenge3d'], intro: 'intro3d', chal: 'challenge3d', figs: SOLIDS, label: '2 · <span class="lg">Figuras </span>2D y 3D',
    introLabel: '¿2D o 3D?', sticker: () => ['Ojo 3D', '2D y 3D'], chalTitle: 'Gran Desafío 3D', champ: () => gx('una campeona', 'un campeón') + ' de las formas',
    hello: n => `¡${gx('Bienvenida', 'Bienvenido')} al capítulo de figuras 2D y 3D, ${n}! Toca la isla verde.`, types: ['is3d', 'name3d', 'print', 'rolls', 'count3d', 'count3d', 'count3d', 'name3d'] },
};
const chStars = ch => { const C = CH[ch]; return C.figs.reduce((a, F) => a + figStars(F.id), 0) + (prog(C.intro).lesson ? 1 : 0) + (save[C.chal] || 0); };
const totalStars = () => Object.keys(CH).reduce((a, ch) => a + chStars(ch), 0);
const maxStars = () => Object.values(CH).reduce((a, C) => a + C.figs.length * 3 + 1 + 3, 0);

const polySvg = (S, { cls = '', fill, stroke, sw = 6, extra = '' } = {}) =>
  `<svg viewBox="0 0 200 200" class="${cls}"><polygon points="${ps(S.pts)}" pathLength="1" fill="${fill || S.c}" stroke="${stroke || S.d}" stroke-width="${sw}" stroke-linejoin="round"/>${extra}</svg>`;

/* ---------- iconos svg ---------- */
const starSvg = (on, size) => `<svg viewBox="0 0 24 24" ${size ? `width="${size}" height="${size}"` : ''}><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill="${on ? '#ffc233' : '#d7dcef'}" stroke="${on ? '#e09a00' : '#bcc3df'}" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const lockSvg = `<svg class="lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="#6c7aa5"/><path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="#6c7aa5" stroke-width="2.6" stroke-linecap="round"/></svg>`;
const starsRow = (n, total = 3) => Array.from({ length: total }, (_, i) => starSvg(i < n)).join('');
const trophyPath = 'M7 3h10v5a5 5 0 01-10 0zM7 5H3v2a4 4 0 004 4M17 5h4v2a4 4 0 01-4 4M12 13v4M8 21h8M9 17h6v4H9z';

/* ---------- ayudas de dibujo 3D en SVG (objetos e íconos) ---------- */
const OL = 'stroke="#2b2d6e" stroke-opacity=".3" stroke-width="2" stroke-linejoin="round"';
const ob = (x, y, w, h, o, cf, ct, cs) => `<g ${OL}><polygon points="${x},${y} ${x + w},${y} ${x + w + o},${y - o} ${x + o},${y - o}" fill="${ct}"/><polygon points="${x + w},${y} ${x + w + o},${y - o} ${x + w + o},${y + h - o} ${x + w},${y + h}" fill="${cs}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cf}"/></g>`;
const cyl = (cx, t, b, rx, ry, c, ct) => `<g ${OL}><path d="M${cx - rx} ${t}V${b}A${rx} ${ry} 0 0 0 ${cx + rx} ${b}V${t}Z" fill="${c}"/><ellipse cx="${cx}" cy="${t}" rx="${rx}" ry="${ry}" fill="${ct}"/></g>`;
const con = (cx, ay, by, rx, ry, c) => `<path d="M${cx} ${ay}L${cx + rx} ${by}A${rx} ${ry} 0 0 1 ${cx - rx} ${by}Z" fill="${c}" ${OL}/>`;
let gid = 0;
const sph = (cx, cy, r, c, d) => { const id = 'sg' + (gid++); return `<defs><radialGradient id="${id}" cx=".36" cy=".32" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".25" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`; };
const HID = 'fill="none" stroke="#2b2d6e" stroke-opacity=".35" stroke-width="2" stroke-dasharray="4 4"';
/* pirámide de base cuadrada (con aristas ocultas punteadas) */
const pyr = (c1, c2) => `<path d="M12 80L54 66L88 76M50 10L54 66" ${HID}/><g ${OL}><polygon points="50,10 12,80 52,92" fill="${c1}"/><polygon points="50,10 52,92 88,76" fill="${c2}"/></g>`;
/* pirámide de base triangular */
const tetra = (c1, c2) => `<path d="M12 82L88 70" ${HID}/><g ${OL}><polygon points="50,10 12,82 58,92" fill="${c1}"/><polygon points="50,10 58,92 88,70" fill="${c2}"/></g>`;
/* prisma triangular acostado */
const prism3 = (c, l, d) => `<g ${OL}><polygon points="10,84 30,50 68,30 48,64" fill="${l}"/><polygon points="30,50 50,84 88,64 68,30" fill="${d}"/><polygon points="10,84 50,84 30,50" fill="${c}"/></g>`;
function solidArt(id, c, l, d) {
  return {
    cubo: () => ob(20, 38, 44, 44, 18, c, l, d), caja: () => ob(8, 48, 62, 30, 20, c, l, d), prisma3: () => prism3(c, l, d),
    piramide: () => pyr(l, c), piramide3: () => tetra(l, c), esfera: () => sph(50, 52, 38, c, d),
    cilindro: () => cyl(50, 24, 80, 30, 10, c, l), cono: () => con(50, 10, 80, 32, 10, c) + `<path d="M18 80A32 10 0 0 1 82 80" fill="none" stroke="${l}" stroke-width="2" opacity=".7"/>`,
  }[id]();
}
const solidSvg = (F, white) => `<svg viewBox="0 0 100 100">${white ? solidArt(F.id, '#ffffffee', '#ffffff', '#ffffffb0') : solidArt(F.id, F.c, F.l, F.d)}</svg>`;
const figSvg = (F, white) => F.kind === 'num' ? numIcon(F.id, white) : F.kind === '3d' ? solidSvg(F, white) :polySvg(F, white ? { fill: '#fff', stroke: '#fff', sw: 4 } : { sw: 7 });

/* ---------- objetos de la vida real (2D) ---------- */
const rs = (n, s, r, cx = 50, cy = 50) => ps(reg(n, s, r, cx, cy));
const OBJ = [
  // triángulo
  { id: 'pizza', n: 'la pizza', shape: 'tri', svg: `<path d="M10 26Q50 6 90 26L50 94Z" fill="#ffd166" stroke="#e8a33d" stroke-width="4" stroke-linejoin="round"/><path d="M12 28Q50 10 88 28" fill="none" stroke="#c97b2a" stroke-width="7" stroke-linecap="round"/><circle cx="40" cy="42" r="6" fill="#e63946"/><circle cx="60" cy="46" r="6" fill="#e63946"/><circle cx="50" cy="66" r="5" fill="#e63946"/>` },
  { id: 'ceda', n: 'la señal ceda el paso', shape: 'tri', svg: `<path d="M50 90L8 18H92Z" fill="#fff" stroke="#e63946" stroke-width="10" stroke-linejoin="round"/>` },
  { id: 'banderin', n: 'el banderín', shape: 'tri', svg: `<line x1="14" y1="8" x2="14" y2="94" stroke="#8d5a2b" stroke-width="5" stroke-linecap="round"/><path d="M14 16L92 46L14 76Z" fill="#ff6b6b" stroke="#d94646" stroke-width="4" stroke-linejoin="round"/><circle cx="34" cy="46" r="5" fill="#fff"/>` },
  { id: 'escuadra', n: 'la escuadra', shape: 'tri', svg: `<path d="M14 88V12L88 88Z" fill="#8bd3ff" fill-opacity=".85" stroke="#2a7fd6" stroke-width="4" stroke-linejoin="round"/><path d="M28 76V46L58 76Z" fill="#e6f6ff" stroke="#2a7fd6" stroke-width="3" stroke-linejoin="round"/><path d="M14 30h7M14 48h7M14 66h7" stroke="#2a7fd6" stroke-width="3"/>` },
  { id: 'musical', n: 'el triángulo musical', shape: 'tri', svg: `<path d="M44 14L88 86H12L38 44" fill="none" stroke="#9aa5c7" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M48 12q-4-8 4-8" fill="none" stroke="#ff6b6b" stroke-width="3"/><line x1="66" y1="30" x2="84" y2="58" stroke="#8d5a2b" stroke-width="4" stroke-linecap="round"/>` },
  { id: 'sandwich', n: 'el sándwich', shape: 'tri', svg: `<path d="M10 84L50 14L90 84Z" fill="#f3d9a4" stroke="#c98b4d" stroke-width="5" stroke-linejoin="round"/><path d="M24 76L50 30L76 76Z" fill="#fff6e0"/><path d="M32 70h36" stroke="#7bc96f" stroke-width="5" stroke-linecap="round"/><path d="M38 60h24" stroke="#ff6b6b" stroke-width="5" stroke-linecap="round"/>` },
  { id: 'carpa', n: 'la carpa', shape: 'tri', svg: `<path d="M50 12L90 86H10Z" fill="#2ec4b6" stroke="#1f9e92" stroke-width="4" stroke-linejoin="round"/><path d="M50 40L66 86H34Z" fill="#1f6f68"/><path d="M50 12V40" stroke="#1f9e92" stroke-width="3"/>` },
  // cuadrado
  { id: 'ventana', n: 'la ventana', shape: 'sq', svg: `<rect x="14" y="14" width="72" height="72" rx="4" fill="#8bd3ff" stroke="#a0693b" stroke-width="8"/><path d="M50 14V86M14 50H86" stroke="#a0693b" stroke-width="6"/><path d="M24 40L40 24" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>` },
  { id: 'cojin', n: 'el cojín', shape: 'sq', svg: `<rect x="14" y="14" width="72" height="72" rx="12" fill="#ff9ecb" stroke="#e0529a" stroke-width="4"/><circle cx="50" cy="50" r="5" fill="#e0529a"/><path d="M50 50L22 22M50 50L78 22M50 50L22 78M50 50L78 78" stroke="#e0529a" stroke-width="2.5" opacity=".55"/>` },
  { id: 'ajedrez', n: 'el tablero de ajedrez', shape: 'sq', svg: `<rect x="12" y="12" width="76" height="76" rx="3" fill="#fff" stroke="#6b4a2a" stroke-width="6"/>${[0, 1, 2, 3].flatMap(r => [0, 1, 2, 3].map(c => (r + c) % 2 ? `<rect x="${14 + c * 18}" y="${14 + r * 18}" width="18" height="18" fill="#2b2d6e"/>` : '')).join('')}` },
  { id: 'postit', n: 'la nota adhesiva', shape: 'sq', svg: `<rect x="14" y="14" width="72" height="72" fill="#fff27a" stroke="#e8c700" stroke-width="3"/><path d="M14 14h72v14H14z" fill="#ffe94d"/><path d="M26 46h48M26 58h40M26 70h30" stroke="#c9a800" stroke-width="3" stroke-linecap="round"/>` },
  { id: 'galletasq', n: 'la galleta salada', shape: 'sq', svg: `<rect x="14" y="14" width="72" height="72" rx="5" fill="#f1c27d" stroke="#c98b4d" stroke-width="4"/>${[32, 50, 68].flatMap(x => [32, 50, 68].map(y => `<circle cx="${x}" cy="${y}" r="3" fill="#c98b4d"/>`)).join('')}` },
  { id: 'azulejo', n: 'el azulejo', shape: 'sq', svg: `<rect x="12" y="12" width="76" height="76" fill="#fff" stroke="#4ea8ff" stroke-width="5"/><path d="M50 18L82 50L50 82L18 50Z" fill="#4ea8ff"/><circle cx="50" cy="50" r="10" fill="#ffd166"/>` },
  // rectángulo
  { id: 'puerta', n: 'la puerta', shape: 'rect', svg: `<rect x="26" y="8" width="48" height="86" rx="3" fill="#c98b4d" stroke="#8d5a2b" stroke-width="5"/><rect x="34" y="18" width="14" height="30" fill="#b3763a"/><rect x="52" y="18" width="14" height="30" fill="#b3763a"/><circle cx="64" cy="66" r="4.5" fill="#ffd166"/>` },
  { id: 'libro', n: 'el libro', shape: 'rect', svg: `<rect x="20" y="10" width="60" height="82" rx="4" fill="#4ea8ff" stroke="#2a7fd6" stroke-width="4"/><rect x="20" y="10" width="10" height="82" fill="#2a7fd6"/><rect x="40" y="24" width="30" height="12" rx="3" fill="#fff" opacity=".9"/><circle cx="55" cy="62" r="9" fill="#ffd166"/>` },
  { id: 'celular', n: 'el celular', shape: 'rect', svg: `<rect x="28" y="6" width="44" height="88" rx="8" fill="#3b3f6b"/><rect x="33" y="16" width="34" height="62" rx="2" fill="#8bd3ff"/><circle cx="50" cy="86" r="3.5" fill="#fff"/><circle cx="50" cy="45" r="9" fill="#ffd166"/>` },
  { id: 'bandera', n: 'la bandera de Chile', shape: 'rect', svg: `<rect x="8" y="22" width="84" height="56" fill="#fff" stroke="#c7c9f0" stroke-width="2"/><rect x="8" y="50" width="84" height="28" fill="#e63946"/><rect x="8" y="22" width="28" height="28" fill="#1d4fd8"/><polygon points="${starPts(22, 36.5, 9)}" fill="#fff"/>` },
  { id: 'billete', n: 'el billete', shape: 'rect', svg: `<rect x="6" y="26" width="88" height="48" rx="4" fill="#9be7b5" stroke="#22c58b" stroke-width="4"/><circle cx="50" cy="50" r="14" fill="#d9f7e4" stroke="#22c58b" stroke-width="3"/><text x="50" y="58" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="20" fill="#169a6a">$</text><path d="M14 34h10M76 66h10" stroke="#169a6a" stroke-width="3"/>` },
  { id: 'pizarra', n: 'la pizarra', shape: 'rect', svg: `<rect x="8" y="16" width="84" height="58" rx="3" fill="#2f6b4f" stroke="#a0693b" stroke-width="6"/><path d="M20 36q8-8 16 0t16 0M20 54h30" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 76L22 92M70 76L78 92" stroke="#a0693b" stroke-width="5" stroke-linecap="round"/>` },
  { id: 'chocolate', n: 'la barra de chocolate', shape: 'rect', svg: `<rect x="18" y="8" width="64" height="84" rx="4" fill="#7b4a2a" stroke="#5a3418" stroke-width="4"/>${[0, 1].flatMap(c => [0, 1, 2, 3].map(r => `<rect x="${24 + c * 28}" y="${14 + r * 19.5}" width="24" height="15" rx="2" fill="#94603a"/>`)).join('')}` },
  // pentágono
  { id: 'casita', n: 'la casita', shape: 'pent', svg: `<path d="M50 8L92 40V92H8V40Z" fill="#ffb4a2" stroke="#e5707e" stroke-width="4" stroke-linejoin="round"/><rect x="40" y="58" width="20" height="34" fill="#8d5a2b"/><rect x="16" y="48" width="16" height="16" fill="#8bd3ff" stroke="#fff" stroke-width="2"/><rect x="68" y="48" width="16" height="16" fill="#8bd3ff" stroke="#fff" stroke-width="2"/>` },
  { id: 'home', n: 'la base de béisbol', shape: 'pent', svg: `<path d="M14 22H86V58L50 90L14 58Z" fill="#fff" stroke="#9aa5c7" stroke-width="5" stroke-linejoin="round"/><path d="M24 30H76" stroke="#e8ebff" stroke-width="5" stroke-linecap="round"/>` },
  { id: 'balon', n: 'el parche del balón', shape: 'pent', svg: `<polygon points="${rs(5, -90, 40)}" fill="#2b2d6e" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><polygon points="${rs(5, -90, 14)}" fill="#fff" opacity=".18"/>` },
  { id: 'pajarera', n: 'la pajarera', shape: 'pent', svg: `<path d="M50 10L88 38V90H12V38Z" fill="#7bc96f" stroke="#4f9a44" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="52" r="11" fill="#2b2d6e"/><path d="M42 74h16" stroke="#8d5a2b" stroke-width="5" stroke-linecap="round"/>` },
  { id: 'gema', n: 'la gema', shape: 'pent', svg: `<polygon points="30,16 70,16 90,40 50,90 10,40" fill="#9be7ff" stroke="#2a7fd6" stroke-width="4" stroke-linejoin="round"/><path d="M10 40H90M30 16L40 40L50 90L60 40L70 16" stroke="#2a7fd6" stroke-width="2" fill="none" opacity=".6"/>` },
  { id: 'escudo', n: 'el escudo', shape: 'pent', svg: `<polygon points="14,14 86,14 86,52 50,90 14,52" fill="#ff6b6b" stroke="#d94646" stroke-width="5" stroke-linejoin="round"/><polygon points="${starPts(50, 44, 17)}" fill="#ffd166"/>` },
  // hexágono
  { id: 'panal', n: 'el panal de abejas', shape: 'hex', svg: `<polygon points="${rs(6, 0, 44)}" fill="#ffc233" stroke="#e29a00" stroke-width="5" stroke-linejoin="round"/><polygon points="${rs(6, 0, 28)}" fill="#ffe27a" stroke="#e29a00" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="50" r="6" fill="#e29a00" opacity=".5"/>` },
  { id: 'tuerca', n: 'la tuerca', shape: 'hex', svg: `<polygon points="${rs(6, 0, 44)}" fill="#aab4cf" stroke="#6c7aa5" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="50" r="17" fill="#e8ecf8" stroke="#6c7aa5" stroke-width="5"/>` },
  { id: 'lapiz', n: 'el lápiz de punta', shape: 'hex', svg: `<polygon points="${rs(6, 0, 44)}" fill="#ffc247" stroke="#d98f00" stroke-width="5" stroke-linejoin="round"/><polygon points="${rs(6, 0, 20)}" fill="#f1d3a1"/><circle cx="50" cy="50" r="7" fill="#3b3f6b"/>` },
  { id: 'baldosa', n: 'la baldosa', shape: 'hex', svg: `<polygon points="${rs(6, 30, 44)}" fill="#ffb4a2" stroke="#e5707e" stroke-width="5" stroke-linejoin="round"/><polygon points="${rs(6, 30, 30)}" fill="none" stroke="#fff" stroke-width="4"/><polygon points="${rs(6, 30, 13)}" fill="#e5707e"/>` },
  { id: 'posavasos', n: 'el posavasos', shape: 'hex', svg: `<polygon points="${rs(6, 0, 44)}" fill="#c98b4d" stroke="#8d5a2b" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="50" r="24" fill="none" stroke="#e9b872" stroke-width="5"/><circle cx="50" cy="50" r="12" fill="none" stroke="#e9b872" stroke-width="3"/>` },
  { id: 'dulces', n: 'la caja de dulces', shape: 'hex', svg: `<polygon points="${rs(6, 30, 44)}" fill="#ff9ecb" stroke="#e0529a" stroke-width="5" stroke-linejoin="round"/><path d="M50 6V94M12 50H88" stroke="#ffd166" stroke-width="7"/><circle cx="50" cy="50" r="8" fill="#ffd166"/>` },
  // octágono
  { id: 'pare', n: 'la señal Pare', shape: 'oct', svg: `<polygon points="${rs(8, 22.5, 46)}" fill="#e63946" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><text x="50" y="58" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="21" fill="#fff">PARE</text>` },
  { id: 'paraguas', n: 'el paraguas visto desde arriba', shape: 'oct', svg: `${reg(8, 22.5, 44, 50, 50).map((p, i, a) => `<polygon points="50,50 ${p.join(',')} ${a[(i + 1) % 8].join(',')}" fill="${i % 2 ? '#ffd166' : '#ff7eb6'}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`).join('')}<circle cx="50" cy="50" r="4" fill="#2b2d6e"/>` },
  { id: 'plato', n: 'el plato octogonal', shape: 'oct', svg: `<polygon points="${rs(8, 22.5, 45)}" fill="#8bd3ff" stroke="#4ea8ff" stroke-width="5" stroke-linejoin="round"/><polygon points="${rs(8, 22.5, 28)}" fill="#e6f6ff" stroke="#4ea8ff" stroke-width="3" stroke-linejoin="round"/>` },
  { id: 'relojoct', n: 'el reloj de pared', shape: 'oct', svg: `<polygon points="${rs(8, 22.5, 45)}" fill="#ffd166" stroke="#e09a00" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="50" r="28" fill="#fff"/><path d="M50 30V50L62 58" stroke="#2b2d6e" stroke-width="5" stroke-linecap="round" fill="none"/>` },
  { id: 'mesa', n: 'la mesa vista desde arriba', shape: 'oct', svg: `<polygon points="${rs(8, 22.5, 45)}" fill="#c98b4d" stroke="#8d5a2b" stroke-width="5" stroke-linejoin="round"/><polygon points="${rs(8, 22.5, 32)}" fill="none" stroke="#8d5a2b" stroke-width="3" opacity=".4"/><circle cx="50" cy="50" r="9" fill="#7bc96f"/>` },
  { id: 'ventanaoct', n: 'la ventana del barco', shape: 'oct', svg: `<polygon points="${rs(8, 22.5, 45)}" fill="#6c7aa5" stroke="#3b3f6b" stroke-width="4" stroke-linejoin="round"/><polygon points="${rs(8, 22.5, 33)}" fill="#8bd3ff"/><path d="M36 40L46 30" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` },
  // no son polígonos (distractores)
  { id: 'reloj', n: 'el reloj', shape: 'circ', svg: `<circle cx="50" cy="50" r="42" fill="#fff" stroke="#2b2d6e" stroke-width="6"/><path d="M50 22V50L68 60" stroke="#2b2d6e" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="50" cy="50" r="4" fill="#ff6b6b"/>` },
  { id: 'pelota', n: 'la pelota', shape: 'circ', svg: `<circle cx="50" cy="50" r="42" fill="#ff6b6b" stroke="#d94646" stroke-width="4"/><path d="M12 38Q50 62 88 38M12 62Q50 38 88 62" stroke="#fff" stroke-width="5" fill="none" opacity=".85"/>` },
  { id: 'galleta', n: 'la galleta', shape: 'circ', svg: `<circle cx="50" cy="50" r="42" fill="#e9b872" stroke="#c98b4d" stroke-width="5"/><circle cx="36" cy="38" r="5" fill="#6b4a2a"/><circle cx="62" cy="44" r="5" fill="#6b4a2a"/><circle cx="46" cy="66" r="5" fill="#6b4a2a"/><circle cx="68" cy="68" r="4" fill="#6b4a2a"/>` },
  { id: 'moneda', n: 'la moneda', shape: 'circ', svg: `<circle cx="50" cy="50" r="42" fill="#ffd166" stroke="#e09a00" stroke-width="5"/><circle cx="50" cy="50" r="30" fill="none" stroke="#e09a00" stroke-width="3"/><text x="50" y="60" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="28" fill="#e09a00">$</text>` },
  { id: 'corazon', n: 'el corazón', shape: 'curva', svg: `<path d="M50 88C8 58 14 18 38 18C46 18 50 26 50 26C50 26 54 18 62 18C86 18 92 58 50 88Z" fill="#ff7eb6" stroke="#e0529a" stroke-width="5" stroke-linejoin="round"/>` },
  { id: 'luna', n: 'la luna', shape: 'curva', svg: `<path d="M62 8A42 42 0 1062 92A32 32 0 0162 8Z" fill="#ffe27a" stroke="#e09a00" stroke-width="5" stroke-linejoin="round"/>` },
];

/* ---------- objetos de la vida real (3D) ---------- */
const OBJ3 = [
  // cubo
  { id: 'dado', n: 'el dado', shape: 'cubo', svg: () => ob(18, 36, 48, 48, 16, '#fff', '#eef0ff', '#d5daf5') + [[30, 48], [54, 48], [42, 60], [30, 72], [54, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="#2b2d6e"/>`).join('') + `<ellipse cx="50" cy="28" rx="5" ry="3" fill="#e63946"/>` },
  { id: 'rubik', n: 'el cubo mágico', shape: 'cubo', svg: () => ob(18, 36, 48, 48, 16, '#ff6b6b', '#ffd166', '#2ec4b6') + `<path d="M34 36V84M50 36V84M18 52H66M18 68H66" stroke="#2b2d6e" stroke-width="2.5"/><path d="M23.3 30.7H71.3M28.7 25.3H76.7M66 52L82 36M66 68L82 52" stroke="#2b2d6e" stroke-width="2" opacity=".6"/>` },
  { id: 'regalo', n: 'la caja de regalo', shape: 'cubo', svg: () => ob(18, 38, 46, 46, 16, '#ff7eb6', '#ffb3d6', '#e0529a') + `<rect x="38" y="38" width="6" height="46" fill="#ffd166"/><path d="M26 30H72" stroke="#ffd166" stroke-width="5" transform="skewX(-45) translate(30 0)"/><ellipse cx="44" cy="26" rx="9" ry="5" fill="#ffd166" transform="rotate(-20 44 26)"/><ellipse cx="58" cy="26" rx="9" ry="5" fill="#ffd166" transform="rotate(20 58 26)"/>` },
  { id: 'hielo', n: 'el cubo de hielo', shape: 'cubo', svg: () => ob(18, 38, 46, 46, 16, '#bfe9ff', '#e6f8ff', '#9bd9f7') + `<path d="M26 48L34 44M26 58L40 50" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` },
  { id: 'bloque', n: 'el bloque de juguete', shape: 'cubo', svg: () => ob(18, 38, 46, 46, 16, '#ffc247', '#ffe08a', '#e0a530') + `<text x="41" y="74" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="32" fill="#e63946">A</text>` },
  // paralelepípedo
  { id: 'zapatos', n: 'la caja de zapatos', shape: 'caja', svg: () => ob(8, 48, 64, 32, 20, '#c98b4d', '#e0a86b', '#a0693b') + `<path d="M8 56H72L92 36" stroke="#8d5a2b" stroke-width="2.5" fill="none"/>` },
  { id: 'ladrillo', n: 'el ladrillo', shape: 'caja', svg: () => ob(10, 52, 62, 26, 18, '#e5707e', '#f19aa4', '#c4505e') + `<path d="M14 58h10M40 70h12M58 60h8" stroke="#c4505e" stroke-width="3" stroke-linecap="round"/>` },
  { id: 'leche', n: 'la caja de leche', shape: 'caja', svg: () => ob(28, 30, 36, 60, 14, '#fff', '#e8ecf8', '#c7d0ea') + `<rect x="28" y="52" width="36" height="20" fill="#4ea8ff"/><text x="46" y="66" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="10" fill="#fff">LECHE</text>` },
  { id: 'goma', n: 'la goma de borrar', shape: 'caja', svg: () => ob(14, 52, 56, 24, 16, '#ff9ecb', '#ffc4e0', '#e0529a') + `<rect x="44" y="52" width="26" height="24" fill="#4ea8ff"/><polygon points="44,52 70,52 86,36 60,36" fill="#7cbcff"/>` },
  { id: 'cereal', n: 'la caja de cereal', shape: 'caja', svg: () => ob(26, 24, 40, 64, 14, '#ffb703', '#ffd166', '#d98f00') + `<circle cx="46" cy="62" r="11" fill="#fff"/><circle cx="42" cy="60" r="3" fill="#e9b872"/><circle cx="50" cy="63" r="3" fill="#e9b872"/><rect x="32" y="32" width="28" height="9" rx="3" fill="#e63946"/>` },
  // esfera
  { id: 'playa', n: 'la pelota de playa', shape: 'esfera', svg: () => sph(50, 50, 40, '#ff6b6b', '#c43c3c') + `<path d="M50 10Q30 50 50 90" stroke="#fff" stroke-width="8" fill="none" opacity=".9"/><path d="M50 10Q72 50 50 90" stroke="#ffd166" stroke-width="8" fill="none"/><circle cx="50" cy="12" r="5" fill="#fff"/>` },
  { id: 'naranja', n: 'la naranja', shape: 'esfera', svg: () => sph(50, 54, 38, '#ff9f1c', '#d9700a') + `<path d="M50 16q10-10 20-4q-10 6-20 4z" fill="#4f9a44"/><circle cx="50" cy="17" r="3" fill="#8d5a2b"/>` },
  { id: 'globo', n: 'el globo terráqueo', shape: 'esfera', svg: () => `<path d="M20 50A30 30 0 0 0 80 50" fill="none" stroke="#a0693b" stroke-width="5" transform="translate(0 6)"/><rect x="46" y="84" width="8" height="8" fill="#a0693b"/><rect x="32" y="90" width="36" height="6" rx="3" fill="#8d5a2b"/>` + sph(50, 48, 32, '#4ea8ff', '#1f6fc4') + `<path d="M34 36q8-6 14 2t-4 12q-10 2-10-14zM58 52q10-4 12 6t-10 10q-6-8-2-16z" fill="#7bc96f"/>` },
  { id: 'canica', n: 'la canica', shape: 'esfera', svg: () => sph(50, 52, 30, '#2ec4b6', '#167d74') + `<path d="M34 56q10-14 26-6t8 14" fill="none" stroke="#ffd166" stroke-width="5" stroke-linecap="round"/>` },
  { id: 'boliche', n: 'la bola de boliche', shape: 'esfera', svg: () => sph(50, 52, 40, '#7c5cff', '#3b2a9a') + `<circle cx="42" cy="38" r="5" fill="#2b2d6e"/><circle cx="56" cy="36" r="5" fill="#2b2d6e"/><circle cx="50" cy="52" r="6" fill="#2b2d6e"/>` },
  // cilindro
  { id: 'lata', n: 'la lata', shape: 'cilindro', svg: () => cyl(50, 20, 84, 26, 9, '#e63946', '#d0d6e8') + `<rect x="24" y="42" width="52" height="18" fill="#fff" opacity=".9"/><ellipse cx="50" cy="20" rx="8" ry="3" fill="#9aa5c7"/>` },
  { id: 'vela', n: 'la vela', shape: 'cilindro', svg: () => cyl(50, 36, 90, 17, 6, '#fff3c4', '#ffe9a0') + `<path d="M50 34V26" stroke="#2b2d6e" stroke-width="2.5"/><path d="M50 8q8 10 0 18q-8-8 0-18z" fill="#ff9f1c"/><path d="M50 15q3 5 0 9q-3-4 0-9z" fill="#ffe066"/>` },
  { id: 'tambor', n: 'el tambor', shape: 'cilindro', svg: () => cyl(50, 34, 80, 36, 12, '#ff6b6b', '#fff7e6') + `<path d="M14 40L26 76L38 44L50 80L62 44L74 76L86 40" stroke="#ffd166" stroke-width="3" fill="none"/><path d="M30 6L46 30M72 8L56 30" stroke="#a0693b" stroke-width="5" stroke-linecap="round"/>` },
  { id: 'rollo', n: 'el rollo de papel', shape: 'cilindro', svg: () => cyl(50, 22, 84, 26, 9, '#fff', '#f1f3fb') + `<ellipse cx="50" cy="22" rx="9" ry="3.5" fill="#c7cbe0"/><path d="M76 50V92" stroke="#e8ebff" stroke-width="3"/>` },
  { id: 'pila', n: 'la pila', shape: 'cilindro', svg: () => cyl(50, 14, 88, 17, 6, '#2b2d6e', '#c7cbe0') + `<path d="M33 14V36A17 6 0 0 0 67 36V14" fill="#ffc233"/><text x="50" y="66" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="20" fill="#fff">+</text><ellipse cx="50" cy="10" rx="6" ry="2.5" fill="#9aa5c7"/>` },
  // cono
  { id: 'helado', n: 'el cono de helado', shape: 'cono', svg: () => `<path d="M28 42L50 94L72 42Z" fill="#e9b872" ${OL}/><path d="M34 48L62 72M44 44L66 60M38 60L60 46M44 74L66 50" stroke="#c98b4d" stroke-width="2"/><circle cx="50" cy="34" r="22" fill="#ff9ecb"/><circle cx="50" cy="12" r="5" fill="#e63946"/>` },
  { id: 'gorro', n: 'el gorro de cumpleaños', shape: 'cono', svg: () => con(50, 12, 82, 28, 8, '#9b6bff') + `<circle cx="44" cy="44" r="4" fill="#ffd166"/><circle cx="58" cy="60" r="4" fill="#ffd166"/><circle cx="40" cy="70" r="4" fill="#ff7eb6"/><circle cx="50" cy="10" r="7" fill="#ff7eb6"/>` },
  { id: 'transito', n: 'el cono de tránsito', shape: 'cono', svg: () => `<rect x="14" y="80" width="72" height="10" rx="3" fill="#e0651a"/>` + con(50, 8, 82, 26, 7, '#ff8a3d') + `<path d="M40 34H60M34 54H66" stroke="#fff" stroke-width="7"/>` },
  { id: 'bruja', n: 'el sombrero de bruja', shape: 'cono', svg: () => `<ellipse cx="50" cy="76" rx="44" ry="11" fill="#3b2a9a"/>` + con(50, 6, 74, 24, 7, '#5a3fe0') + `<path d="M27 66A24 7 0 0 0 73 66" stroke="#ffd166" stroke-width="6" fill="none"/>` },
  // prisma triangular
  { id: 'chocobarra', n: 'la barra de chocolate triangular', shape: 'prisma3', svg: () => prism3('#c98b4d', '#e0a86b', '#a0693b') + `<path d="M24 77L44 67M38 70L58 60M52 63L72 53" stroke="#fff" stroke-width="2" opacity=".5"/><text x="30" y="78" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="9" fill="#fff">CHOC</text>` },
  { id: 'carpa3', n: 'la carpa de camping', shape: 'prisma3', svg: () => prism3('#7bc96f', '#a6e09b', '#4f9a44') + `<polygon points="30,84 40,84 30,62" fill="#2f6b4f"/><path d="M30 50V44" stroke="#8d5a2b" stroke-width="3"/>` },
  { id: 'queso', n: 'el trozo de queso', shape: 'prisma3', svg: () => prism3('#ffd166', '#ffe49a', '#e8b23a') + `<circle cx="28" cy="72" r="4" fill="#e8b23a"/><circle cx="62" cy="58" r="5" fill="#d9a12e"/><circle cx="72" cy="46" r="3" fill="#d9a12e"/>` },
  { id: 'prismaluz', n: 'el prisma de cristal', shape: 'prisma3', svg: () => `<path d="M2 40L28 66" stroke="#fff" stroke-width="3"/><path d="M58 70L96 78M58 72L96 86M58 74L96 94" stroke-width="3" stroke="#ff6b6b"/><path d="M58 72L96 86" stroke="#ffd166" stroke-width="3"/><path d="M58 74L96 94" stroke="#4ea8ff" stroke-width="3"/>` + prism3('#c3f1ec', '#e6fbf8', '#8fdcd3') },
  // pirámide de base cuadrada
  { id: 'egipto', n: 'la pirámide de Egipto', shape: 'piramide', svg: () => `<rect x="4" y="86" width="92" height="8" rx="4" fill="#f3d9a4"/>` + pyr('#ffd166', '#e8b23a') + `<path d="M31 45L51 51M22 62L52 72M72 40L52 52M80 58L52 72" stroke="#c99a2e" stroke-width="2"/>` },
  { id: 'cristal', n: 'el pisapapeles de cristal', shape: 'piramide', svg: () => pyr('#c3f1ec', '#8fdcd3') + `<path d="M50 10L52 92" stroke="#fff" stroke-width="3"/><polygon points="${starPts(24, 26, 8)}" fill="#ffd166"/>` },
  { id: 'torre', n: 'el techo de la torre', shape: 'piramide', svg: () => `<rect x="24" y="58" width="40" height="38" fill="#e8ecf8" stroke="#9aa5c7" stroke-width="2"/><rect x="38" y="70" width="12" height="16" rx="6" fill="#8bd3ff"/><g transform="translate(14 0) scale(.72 .7)">${pyr('#ff7eb6', '#e0529a')}</g>` },
  // pirámide de base triangular
  { id: 'dado4', n: 'el dado de cuatro caras', shape: 'piramide3', svg: () => tetra('#ff9ecb', '#e0529a') + `<text x="38" y="70" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="18" fill="#fff">4</text>` },
  { id: 'te', n: 'la bolsita de té', shape: 'piramide3', svg: () => `<path d="M50 10Q60 2 70 6" fill="none" stroke="#9aa5c7" stroke-width="2"/><rect x="68" y="2" width="14" height="10" rx="2" fill="#7bc96f"/>` + tetra('#f3e3c3', '#dcc69c') + `<circle cx="36" cy="66" r="3" fill="#7bc96f"/><circle cx="46" cy="76" r="3" fill="#4f9a44"/>` },
  { id: 'chocopir', n: 'el bombón de pirámide', shape: 'piramide3', svg: () => tetra('#94603a', '#6b4224') + `<path d="M50 10L34 87" stroke="#b07a4d" stroke-width="3"/>` },
  { id: 'adorno', n: 'el adorno de cristal', shape: 'piramide3', svg: () => `<path d="M50 10V2" stroke="#ffd166" stroke-width="3"/>` + tetra('#c9f1fa', '#8fdcef') + `<polygon points="${starPts(76, 24, 7)}" fill="#ffd166"/>` },
].map(o => ({ ...o, svg: o.svg() }));
const OBJS = Object.fromEntries([...OBJ, ...OBJ3].map(o => [o.id, o]));
const objSvg = o => `<svg viewBox="0 0 100 100">${o.svg}</svg>`;

/* figuras que NO son polígonos */
const NONPOLY = {
  circle: { hint: 'Esa es redonda, tiene una línea curva. Los polígonos tienen lados rectos.', svg: c => `<circle cx="100" cy="100" r="74" fill="${c}" stroke="#2b2d6e" stroke-opacity=".25" stroke-width="6"/>` },
  ellipse: { hint: 'Esa es curva, como un huevo. Los polígonos tienen lados rectos.', svg: c => `<ellipse cx="100" cy="100" rx="84" ry="54" fill="${c}" stroke="#2b2d6e" stroke-opacity=".25" stroke-width="6"/>` },
  blob: { hint: 'Esa tiene curvas por todos lados. Los polígonos tienen lados rectos.', svg: c => `<path d="M40 110C20 60 80 30 120 50C170 60 180 120 140 150C100 180 50 160 40 110Z" fill="${c}" stroke="#2b2d6e" stroke-opacity=".25" stroke-width="6"/>` },
  heart: { hint: 'Esa tiene curvas. Los polígonos tienen lados rectos.', svg: c => `<path d="M100 165C20 110 30 40 78 40C95 40 100 55 100 55C100 55 105 40 122 40C170 40 180 110 100 165Z" fill="${c}" stroke="#2b2d6e" stroke-opacity=".25" stroke-width="6" stroke-linejoin="round"/>` },
  open: { hint: 'Esa figura está abierta, no se cierra. Los polígonos son figuras cerradas.', svg: c => `<path d="M40 160V50H160V125" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 160V50H160V125" fill="none" stroke="#2b2d6e" stroke-opacity=".2" stroke-width="3" stroke-linecap="round"/>` },
};
const NPKEYS = Object.keys(NONPOLY);
const COLORS = ['#ff6b6b', '#ffb703', '#2ec4b6', '#4ea8ff', '#9b6bff', '#ff7eb6'];

/* =========================================================
   Motor 3D: cuerpos que se pueden girar con el dedo
   ========================================================= */
const MESH = (() => {
  const m = {}, N = 36;
  const box = (w, h, d, sh) => {
    const v = [[-w, -h, -d], [w, -h, -d], [w, h, -d], [-w, h, -d], [-w, -h, d], [w, -h, d], [w, h, d], [-w, h, d]];
    const F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5], [3, 2, 6, 7], [0, 1, 5, 4]];
    return { v, f: F.map((f, g) => ({ v: f, g })), groups: sh.map(s => ({ flat: true, shape: s })) };
  };
  const ring = (r, y) => Array.from({ length: N }, (_, i) => { const a = i / N * Math.PI * 2; return [r * Math.cos(a), y, r * Math.sin(a)]; });
  const idx = (k = 0) => Array.from({ length: N }, (_, i) => i + k);
  m.cubo = box(1, 1, 1, Array(6).fill('sq'));
  // prisma rectangular: 2 cuadrados en las puntas y 4 rectángulos iguales alrededor
  m.caja = box(1.45, .72, .72, ['rect', 'rect', 'sq', 'sq', 'rect', 'rect']);
  m.caja.compText = '2 cuadrados en las puntas y 4 rectángulos alrededor';
  m.cubo.compText = 'todas son cuadrados iguales';
  m.piramide = { v: [[-1, -.8, -1], [1, -.8, -1], [1, -.8, 1], [-1, -.8, 1], [0, 1.25, 0]],
    f: [{ v: [0, 1, 2, 3], g: 0 }, { v: [0, 1, 4], g: 1 }, { v: [1, 2, 4], g: 2 }, { v: [2, 3, 4], g: 3 }, { v: [3, 0, 4], g: 4 }],
    groups: [{ flat: true, shape: 'sq' }, ...[1, 2, 3, 4].map(() => ({ flat: true, shape: 'tri' }))] };
  {
    const b = [90, 210, 330].map(a => [1.2 * Math.cos(a * Math.PI / 180), -.75, 1.2 * Math.sin(a * Math.PI / 180)]);
    m.piramide3 = { v: [...b, [0, 1.25, 0]], f: [{ v: [0, 1, 2], g: 0 }, { v: [0, 1, 3], g: 1 }, { v: [1, 2, 3], g: 2 }, { v: [2, 0, 3], g: 3 }],
      groups: [0, 1, 2, 3].map(() => ({ flat: true, shape: 'tri' })) };
  }
  {
    const T = [[.95, 0], [-.7, 1], [-.7, -1]], v = [...T.map(([y, z]) => [-1.3, y, z]), ...T.map(([y, z]) => [1.3, y, z])];
    m.prisma3 = { v, f: [{ v: [0, 1, 2], g: 0 }, { v: [3, 4, 5], g: 1 }, { v: [0, 1, 4, 3], g: 2 }, { v: [1, 2, 5, 4], g: 3 }, { v: [2, 0, 3, 5], g: 4 }],
      groups: [{ flat: true, shape: 'tri' }, { flat: true, shape: 'tri' }, ...[2, 3, 4].map(() => ({ flat: true, shape: 'rect' }))] };
  }
  {
    const f = [{ v: idx(), g: 0 }, { v: idx(N), g: 1 }];
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; f.push({ v: [i, j, j + N, i + N], g: 2 }); }
    m.cilindro = { v: [...ring(.95, 1), ...ring(.95, -1)], f, groups: [{ flat: true, shape: 'circ' }, { flat: true, shape: 'circ' }, { flat: false }] };
  }
  {
    const f = [{ v: idx(), g: 0 }];
    for (let i = 0; i < N; i++) f.push({ v: [i, (i + 1) % N, N], g: 1 });
    m.cono = { v: [...ring(1.05, -.9), [0, 1.3, 0]], f, groups: [{ flat: true, shape: 'circ' }, { flat: false }] };
  }
  {
    const v = [], f = [], LA = 14, LO = 26, r = 1.15;
    for (let a = 0; a <= LA; a++) { const th = a / LA * Math.PI; for (let o = 0; o < LO; o++) { const ph = o / LO * Math.PI * 2; v.push([r * Math.sin(th) * Math.cos(ph), r * Math.cos(th), r * Math.sin(th) * Math.sin(ph)]); } }
    for (let a = 0; a < LA; a++) for (let o = 0; o < LO; o++) {
      const o2 = (o + 1) % LO, i1 = a * LO + o, i2 = a * LO + o2, i3 = (a + 1) * LO + o2, i4 = (a + 1) * LO + o;
      f.push({ v: a === 0 ? [i1, i3, i4] : a === LA - 1 ? [i1, i2, i3] : [i1, i2, i3, i4], g: 0 });
    }
    m.esfera = { v, f, groups: [{ flat: false }] };
  }
  /* topología: aristas = donde se juntan dos caras distintas; vértices = donde se juntan 3 o más caras */
  for (const id in m) {
    const M = m[id], seg = new Map(), vg = M.v.map(() => new Set());
    M.vf = M.v.map(() => []);
    M.f.forEach((f, fi) => f.v.forEach((a, k) => {
      const b = f.v[(k + 1) % f.v.length], key = Math.min(a, b) + '-' + Math.max(a, b);
      if (!seg.has(key)) seg.set(key, { a, b, f: [] });
      seg.get(key).f.push(fi); vg[a].add(f.g); M.vf[a].push(fi);
    }));
    const ar = new Map();
    for (const s of seg.values()) {
      if (s.f.length !== 2) continue;
      const g1 = M.f[s.f[0]].g, g2 = M.f[s.f[1]].g; if (g1 === g2) continue;
      const k = Math.min(g1, g2) + '-' + Math.max(g1, g2);
      if (!ar.has(k)) ar.set(k, []); ar.get(k).push(s);
    }
    M.edges = [...ar.values()];
    M.verts = M.v.map((_, i) => i).filter(i => vg[i].size >= 3);
  }
  m.cono.verts = [m.cono.v.length - 1]; // la punta del cono también es un vértice
  return m;
})();
const SHAPE_PL = { tri: ['triángulo', 'triángulos'], sq: ['cuadrado', 'cuadrados'], rect: ['rectángulo', 'rectángulos'], circ: ['círculo', 'círculos'] };
const listY = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1] : a[0] || '';
/* conteos de un cuerpo, para que isla, lección, pintar y desafío digan siempre lo mismo */
function stats(id) {
  const M = MESH[id], flat = M.groups.filter(g => g.flat), curved = M.groups.length - flat.length;
  const cnt = {}; flat.forEach(g => cnt[g.shape] = (cnt[g.shape] || 0) + 1);
  const parts = Object.keys(cnt).map(k => `${cnt[k]} ${SHAPE_PL[k][cnt[k] > 1 ? 1 : 0]}`);
  const all = Object.keys(cnt).length === 1 && flat.length > 1 ? `todas son ${SHAPE_PL[Object.keys(cnt)[0]][1]}` : listY(parts);
  return { caras: flat.length, curved, aristas: M.edges.length, vertices: M.verts.length, comp: M.compText || all, list: listY(parts), cnt, poly: !curved };
}
const caraTxt = n => `${n} ${n === 1 ? 'cara' : 'caras'}`;
function facesSentence(B) {
  const s = stats(B.id);
  if (s.poly) return `${caraTxt(s.caras)}: ${s.comp}`;
  if (!s.caras) return 'no tiene caras planas, es toda curva';
  return `${s.caras} ${s.caras === 1 ? 'cara plana' : 'caras planas'} (${s.list}) y 1 parte curva`;
}
function chipsFor(B) {
  const s = stats(B.id), v = n => `${n} ${n === 1 ? 'vértice' : 'vértices'}`, a = n => `${n} ${n === 1 ? 'arista' : 'aristas'}`;
  return s.poly ? [caraTxt(s.caras), a(s.aristas), v(s.vertices)]
    : [s.caras ? `${s.caras} ${s.caras === 1 ? 'cara plana' : 'caras planas'} + curva` : 'Toda curva', a(s.aristas), v(s.vertices)];
}
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const LIGHT = (() => { const v = [-.45, .65, .75], m = Math.hypot(...v); return v.map(x => x / m); })();
/* color fijo para cada tipo de cara: así la niña asocia "rojo = triángulo" en todas las actividades */
const FACECOL = { tri: '#ff6b6b', sq: '#ffc233', rect: '#2ec4b6', circ: '#9b6bff', curva: '#4ea8ff' };
const faceKey = G => G.flat ? G.shape : 'curva';

/* hl: { faces: Map grupo→número, edges: Map arista→número, verts: Map vértice→número } */
function view3D(cv, id, { interactive = false, painted = null, blank = false, hl = null, onTap = null } = {}) {
  const M = MESH[id], base = hexRgb(blank ? '#eef0f8' : FIG[id].c), ctx = cv.getContext('2d');
  let yaw = .7 + Math.random() * .4, pitch = .42, drag = null, idle = 999, faces = [], vis = [], W = 0, H = 0, dpr = 1;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  if (interactive) {
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 7) drag.moved = true;
      yaw = drag.yaw + dx * .012; pitch = Math.max(-1.2, Math.min(1.2, drag.pitch + dy * .012)); idle = 0;
    });
    cv.addEventListener('pointerup', e => {
      if (!drag) return;
      const d = drag; drag = null; idle = 0;
      if (!d.moved && onTap) { const r = cv.getBoundingClientRect(); onTap(hit((e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr)); }
    });
    cv.addEventListener('pointercancel', () => { drag = null; });
  }
  function hit(x, y) {
    for (let i = faces.length - 1; i >= 0; i--) {
      const p = faces[i].p; let ins = false;
      for (let a = 0, b = p.length - 1; a < p.length; b = a++)
        if ((p[a][1] > y) !== (p[b][1] > y) && x < (p[b][0] - p[a][0]) * (y - p[a][1]) / (p[b][1] - p[a][1]) + p[a][0]) ins = !ins;
      if (ins) return faces[i].g;
    }
    return null;
  }
  const badge = (x, y, txt, col) => {
    const r = 11 * dpr;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.lineWidth = 2.5 * dpr; ctx.strokeStyle = col; ctx.setLineDash([]); ctx.stroke();
    ctx.fillStyle = '#2b2d6e'; ctx.font = `800 ${13 * dpr}px "Baloo 2",Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(txt, x, y + dpr);
  };
  function draw() {
    dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (w !== W || h !== H) { W = cv.width = w; H = cv.height = h; }
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), D = 8, sc = Math.min(W, H) * .25, ox = W / 2, oy = H / 2 - sc * .05;
    const R = M.v.map(([x, y, z]) => {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp, s = D / (D - z2);
      return { q: [x1, y2, z2], s: [ox + x1 * s * sc, oy - y2 * s * sc] };
    });
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(43,45,110,.13)'; ctx.beginPath(); ctx.ellipse(ox, oy + sc * 1.5, sc * 1.05, sc * .2, 0, 0, Math.PI * 2); ctx.fill();
    faces = []; vis = M.f.map(() => false);
    M.f.forEach((f, fi) => {
      const P = f.v.map(i => R[i]);
      const ctr = [0, 1, 2].map(k => P.reduce((a, p) => a + p.q[k], 0) / P.length);
      let n = cross(sub(P[1].q, P[0].q), sub(P[2].q, P[0].q));
      if (dot(n, ctr) < 0) n = n.map(v => -v);
      const m = Math.hypot(...n); if (m < 1e-9) return; n = n.map(v => v / m);
      if (dot(n, [-ctr[0], -ctr[1], D - ctr[2]]) <= 0) return;
      vis[fi] = true;
      const lum = .5 + .5 * Math.max(0, dot(n, LIGHT));
      const col = painted && painted.get(f.g);
      const rgb = (col ? hexRgb(col) : base).map(v => Math.round(v * lum + 255 * (1 - lum) * .12));
      faces.push({ p: P.map(p => p.s), z: ctr[2], g: f.g, rgb, flat: M.groups[f.g].flat });
    });
    faces.sort((a, b) => a.z - b.z);
    ctx.lineJoin = 'round';
    for (const F of faces) {
      ctx.beginPath(); F.p.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
      const fs = `rgb(${F.rgb})`; ctx.fillStyle = fs; ctx.fill();
      if (F.flat) { ctx.strokeStyle = 'rgba(43,45,110,.5)'; ctx.lineWidth = 2.5 * dpr; } else { ctx.strokeStyle = fs; ctx.lineWidth = 1.2 * dpr; }
      ctx.stroke();
    }
    if (!hl) return;
    /* números sobre las caras */
    if (hl.faces) hl.faces.forEach((num, g) => {
      const fs = faces.filter(F => F.g === g); if (!fs.length) return;
      const pts = fs.flatMap(F => F.p);
      badge(pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length, num, '#2b2d6e');
    });
    /* aristas: las ocultas van punteadas */
    if (hl.edges) hl.edges.forEach((num, ei) => {
      const segs = M.edges[ei];
      segs.forEach(s => {
        const seen = s.f.some(fi => vis[fi]);
        ctx.setLineDash(seen ? [] : [6 * dpr, 6 * dpr]); ctx.globalAlpha = seen ? 1 : .55;
        ctx.strokeStyle = '#ff3d7f'; ctx.lineWidth = 6 * dpr; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(...R[s.a].s); ctx.lineTo(...R[s.b].s); ctx.stroke();
      });
      ctx.globalAlpha = 1; ctx.setLineDash([]);
      const s = segs[segs.length >> 1], mx = (R[s.a].s[0] + R[s.b].s[0]) / 2, my = (R[s.a].s[1] + R[s.b].s[1]) / 2;
      if (s.f.some(fi => vis[fi])) badge(mx, my, num, '#ff3d7f');
    });
    /* vértices */
    if (hl.verts) hl.verts.forEach((num, vi) => {
      const seen = M.vf[vi].some(fi => vis[fi]), [x, y] = R[vi].s;
      ctx.globalAlpha = seen ? 1 : .45;
      ctx.beginPath(); ctx.arc(x, y, 9 * dpr, 0, Math.PI * 2); ctx.fillStyle = '#ffd166'; ctx.fill();
      ctx.lineWidth = 3 * dpr; ctx.strokeStyle = '#2b2d6e'; ctx.stroke();
      ctx.globalAlpha = 1;
      if (seen) badge(x + 16 * dpr, y - 16 * dpr, num, '#e09a00');
    });
  }
  (function loop() {
    if (!cv.isConnected) return;
    if (!drag && ++idle > 90) yaw += .009;
    draw(); requestAnimationFrame(loop);
  })();
  return { visibleGroups: () => new Set(faces.map(F => F.g)) };
}
const mount3D = root => $$('canvas[data-mesh]', root).forEach(c => { if (!c.dataset.on) { c.dataset.on = 1; view3D(c, c.dataset.mesh, { interactive: c.classList.contains('grab') }); } });
const c3 = (id, cls = '') => `<canvas class="c3d ${cls}" data-mesh="${id}"></canvas>`;

/* =========================================================
   Audio y voz
   ========================================================= */
let AC;
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f, t0, dur, type = 'triangle', vol = .16) {
  const c = ac(); if (!c || !save.fx) return;
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05);
}
const sfx = {
  pop() { tone(620, 0, .1) },
  tap(n = 0) { tone(420 + n * 55, 0, .16) },
  ok() { [523, 659, 784].forEach((f, i) => tone(f, i * .09, .25)) },
  bad() { tone(230, 0, .16, 'sawtooth', .06); tone(185, .12, .2, 'sawtooth', .06) },
  win() { [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, i * .1, .32)) },
  star() { [880, 1175, 1568].forEach((f, i) => tone(f, i * .08, .3, 'sine', .14)) },
};

let voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  for (const p of ['es-cl', 'es-419', 'es-us', 'es-mx', 'es-ar', 'es-co', 'es-es']) {
    const v = vs.find(v => v.lang.replace('_', '-').toLowerCase() === p); if (v) { voice = v; return; }
  }
  voice = vs.find(v => v.lang.toLowerCase().startsWith('es')) || null;
}
if ('speechSynthesis' in window) { speechSynthesis.onvoiceschanged = pickVoice; pickVoice(); }
function speak(text) {
  if (!save.voice || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice ? voice.lang : 'es-ES'; if (voice) u.voice = voice;
    u.rate = 1.12; u.pitch = 1.15;
    const el = $('#poli'); el.classList.add('talk');
    u.onend = u.onerror = () => el.classList.remove('talk');
    speechSynthesis.speak(u);
    setTimeout(() => el.classList.remove('talk'), Math.min(9000, 600 + text.length * 60));
  } catch (e) { }
}

/* =========================================================
   Poli, la mascota
   ========================================================= */
const POLI_SVG = `
<svg viewBox="0 0 120 140" aria-hidden="true">
 <defs>
  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a98bff"/><stop offset="1" stop-color="#7c5cff"/></linearGradient>
 </defs>
 <ellipse cx="42" cy="132" rx="15" ry="7" fill="#5a3fe0"/><ellipse cx="78" cy="132" rx="15" ry="7" fill="#5a3fe0"/>
 <g class="armL"><ellipse cx="17" cy="100" rx="9" ry="15" fill="#8d6dff" transform="rotate(18 17 100)"/></g>
 <g class="armR"><ellipse cx="103" cy="100" rx="9" ry="15" fill="#8d6dff" transform="rotate(-18 103 100)"/></g>
 <g class="body">
  <polygon points="22,56 28,16 52,40" fill="#8d6dff" stroke="#6a49f0" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="98,56 92,16 68,40" fill="#8d6dff" stroke="#6a49f0" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="30,48 33,27 45,40" fill="#ffb3d9"/><polygon points="90,48 87,27 75,40" fill="#ffb3d9"/>
  <ellipse cx="60" cy="86" rx="44" ry="46" fill="url(#pg)" stroke="#6a49f0" stroke-width="3"/>
  <ellipse cx="60" cy="102" rx="27" ry="26" fill="#d8ccff"/>
  <g class="eyes">
   <ellipse cx="44" cy="72" rx="11" ry="12.5" fill="#fff"/><ellipse cx="76" cy="72" rx="11" ry="12.5" fill="#fff"/>
   <circle cx="46" cy="74" r="6.4" fill="#2b2d6e"/><circle cx="74" cy="74" r="6.4" fill="#2b2d6e"/>
   <circle cx="48.4" cy="71.4" r="2.4" fill="#fff"/><circle cx="76.4" cy="71.4" r="2.4" fill="#fff"/>
  </g>
  <circle cx="30" cy="88" r="6.5" fill="#ff8fc0" opacity=".75"/><circle cx="90" cy="88" r="6.5" fill="#ff8fc0" opacity=".75"/>
  <g class="mouth"><path d="M50 88Q60 102 70 88Q60 93 50 88Z" fill="#7a2a55" stroke="#2b2d6e" stroke-width="2.6" stroke-linejoin="round"/></g>
  <polygon points="60,38 40,28 40,48" fill="#ff6bb0" stroke="#e0529a" stroke-width="2.6" stroke-linejoin="round" transform="translate(-2 -6) rotate(-8 60 38)"/>
  <polygon points="60,38 80,28 80,48" fill="#ff6bb0" stroke="#e0529a" stroke-width="2.6" stroke-linejoin="round" transform="translate(2 -6) rotate(8 60 38)"/>
  <circle cx="60" cy="33" r="6" fill="#ffd166" stroke="#e09a00" stroke-width="2.4"/>
 </g>
</svg>`;
let lastSay = '';
/* pasa a lo siguiente recién cuando Poli terminó de hablar (o, con el sonido apagado, cuando hubo tiempo de leer),
   para no cortar explicaciones como "¡Sí! 12 + 2 = 14". Tocar la pantalla salta la espera.
   node: si deja de estar en pantalla (Volver), no hace nada */
function afterSay(fn, node) {
  const t0 = Date.now(), read = Math.min(5000, 900 + lastSay.length * 35);
  const voiceOn = () => save.voice && 'speechSynthesis' in window && speechSynthesis.getVoices().length > 0;
  const talking = () => speechSynthesis.speaking || speechSynthesis.pending;
  let quietSince = 0, gone = false;
  const go2 = () => { if (gone) return; gone = true; removeEventListener('pointerdown', skip, true); if (!node || node.isConnected) fn(); };
  const skip = e => { if (Date.now() - t0 > 350 && !e.target.closest('#bar,#dock')) { e.stopPropagation(); go2(); } };
  addEventListener('pointerdown', skip, true);
  const tick = () => {
    if (gone) return;
    if (node && !node.isConnected) { gone = true; removeEventListener('pointerdown', skip, true); return; }
    const t = Date.now() - t0;
    if (voiceOn() && talking()) quietSince = 0; else quietSince ||= Date.now();
    // con voz: espera a que termine + 0,3 s; sin voz: el tiempo de leer el mensaje
    const done = voiceOn() && t > 500 ? quietSince && Date.now() - quietSince > 300 && t > 900 : t > read;
    if (done || t > 15000) go2(); else setTimeout(tick, 120);
  };
  setTimeout(tick, 300);
}
const poli = {
  say(t, talk = true) {
    lastSay = t; $('#bubbleText').textContent = t;
    const b = $('#bubble'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    if (talk) speak(t);
  },
  anim(cls) { const p = $('#poli'); p.classList.remove('cheer', 'oops'); void p.offsetWidth; p.classList.add(cls); setTimeout(() => p.classList.remove(cls), 900); },
  cheer(t) { this.anim('cheer'); if (t) this.say(t); },
  oops(t) { this.anim('oops'); if (t) this.say(t); },
};

function confetti(count = 110) {
  const cv = $('#confetti'), cx = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;
  const parts = Array.from({ length: count }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 240, y: innerHeight * .62, vx: (Math.random() - .5) * 15, vy: -Math.random() * 17 - 6,
    r: Math.random() * 6, vr: (Math.random() - .5) * .3, s: 8 + Math.random() * 12, n: 3 + (Math.random() * 6 | 0), c: COLORS[Math.random() * 6 | 0]
  }));
  let f = 0;
  (function tick() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => {
      p.vy += .45; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.beginPath();
      for (let i = 0; i < p.n; i++) { const a = i / p.n * Math.PI * 2; cx.lineTo(Math.cos(a) * p.s, Math.sin(a) * p.s); }
      cx.closePath(); cx.fill(); cx.restore();
    });
    if (++f < 140) requestAnimationFrame(tick); else cx.clearRect(0, 0, cv.width, cv.height);
  })();
}

/* =========================================================
   Navegación y marco
   ========================================================= */
let cur = { name: 'welcome' };
const scr = () => $('#screen');
const isIntro = id => Object.values(CH).some(C => C.intro === id);

function go(name, params = {}) { sfx.pop(); cur = { name, ...params }; render(); }
const backTarget = () => ({ island: ['map'], lesson: isIntro(cur.id) ? ['map'] : ['island', { id: cur.id }], build: ['island', { id: cur.id }], paint: ['island', { id: cur.id }], hunt: ['island', { id: cur.id }], game: ['island', { id: cur.id }], challenge: ['map'], album: ['map'], workshop: ['map'], repaso: ['map'], parent: ['map'], avance: ['map'], news: cur.from === 'parent' ? ['parent', { ok: true }] : [cur.from || 'welcome'] }[cur.name]);
function setAction(label, fn, enabled = true, cls = '') {
  const b = $('#action');
  if (!label) { b.hidden = true; return; }
  b.hidden = false; b.className = 'btn ' + cls; b.textContent = label; b.disabled = !enabled;
  b.onclick = () => { sfx.pop(); fn(); };
}
const enableAction = () => { $('#action').disabled = false; };
function refreshStars(bump) {
  const p = $('#starsPill');
  p.hidden = cur.name === 'welcome';
  p.innerHTML = `${starSvg(true)}<span>${totalStars()}</span>`;
  if (bump) { p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
}
function award(kind, id) {
  const p = prog(id);
  if (p[kind]) return false;
  p[kind] = true; persist(); sfx.star(); refreshStars(true); return true;
}

function titleFor() {
  const F = FIG[cur.id];
  if (F && F.kind === 'num') return cur.name === 'lesson' ? `Aprende: ${F.short}` : cur.name === 'game' ? F.acts.find(a => a.k === cur.k).t : F.title;
  switch (cur.name) {
    case 'island': return `Isla ${del(F)}`;
    case 'lesson': return { intro: '¿Qué es un polígono?', intro3d: '¿2D o 3D?', intro123: '¿Cómo contamos?' }[cur.id] || `Aprende: ${F.name}`;
    case 'build': return `Construye ${F.art} ${F.name}`;
    case 'paint': return 'Pinta sus caras';
    case 'hunt': return 'Caza en la vida real';
    case 'challenge': return (CH[cur.ch] || CH[1]).chalTitle;
    case 'map': return 'Mapa de aventuras';
    case 'album': return 'Mi álbum';
    case 'workshop': return 'Taller libre';
    case 'repaso': return 'Repaso del día';
    case 'parent': return 'Ajustes';
    case 'avance': return `Avance de ${save.name}`;
    case 'news': return 'Novedades';
    default: return 'Aprende con Poli';
  }
}
function render() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  stepBack = null;
  $('#btnBack').hidden = !backTarget();
  $('#barSlot').innerHTML = ''; $('#barSlot2').innerHTML = '';
  $$('#app > .modal').forEach(m => m.remove());
  $('#app').classList.toggle('is-home', cur.name === 'welcome');
  $('#title').textContent = titleFor();
  setAction(null);
  refreshStars();
  scr().innerHTML = '';
  ({ welcome: viewWelcome, map: viewMap, island: viewIsland, lesson: viewLesson, build: viewBuild, paint: viewPaint, hunt: viewHunt, game: viewGame, challenge: viewChallenge, album: viewAlbum, workshop: viewWorkshop, repaso: viewRepaso, parent: viewParent, avance: viewAvance, news: viewNews })[cur.name]();
}

/* =========================================================
   Pantallas
   ========================================================= */
function frame(html, cls = '') { scr().innerHTML = `<div class="screen ${cls}">${html}</div>`; const el = scr().firstElementChild; mount3D(el); return el; }

/* ---------- Bienvenida ---------- */
function viewWelcome() {
  /* Poli grande saludando, rodeado de lo que se aprende en la app */
  const orb = (cls, svg) => `<span class="orb ${cls}"><svg viewBox="0 0 100 100">${svg}</svg></span>`;
  const hero = `<div class="hero" aria-hidden="true"><div class="halo"></div><div class="ring"></div>
    ${orb('o1', `<polygon points="50,10 92,84 8,84" fill="#ff6b6b" stroke="#d94646" stroke-width="7" stroke-linejoin="round"/>`)}
    ${orb('o2', ob(14, 34, 50, 50, 20, '#ffb703', '#ffd166', '#d98f00'))}
    ${orb('o3', `<text x="50" y="68" text-anchor="middle" font-family="Baloo 2,Arial" font-weight="800" font-size="46" stroke="#fff" stroke-width="9" paint-order="stroke" stroke-linejoin="round"><tspan fill="${PV.c.c}">1</tspan><tspan fill="${PV.d.c}">2</tspan><tspan fill="${PV.u.c}">3</tspan></text>`)}
    ${orb('o4', `<polygon points="${rs(5, -90, 40)}" fill="#2ec4b6" stroke="#1f9e92" stroke-width="7" stroke-linejoin="round"/>`)}
    ${orb('o5', `<path d="M50 6l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3z" fill="#ffc233" stroke="#e09a00" stroke-width="5" stroke-linejoin="round"/>`)}
    ${orb('o6', `<text x="50" y="74" text-anchor="middle" font-family="Baloo 2,Arial" font-weight="800" font-size="76" fill="#9b6bff" stroke="#fff" stroke-width="8" paint-order="stroke">+</text>`)}
    <div class="pbig">${POLI_SVG}</div><div class="pshadow"></div></div>`;
  frame(`<div class="home">${hero}<div class="txt">
    <h2>Aprende<br>con <span>Poli</span></h2>
    <span class="tagline">Matemáticas · 2° básico</span>
    <span class="subline">Mundo de Formas y Números</span>
    ${root.order.length ? `<p class="who">¿Quién va a jugar?</p><div class="whowrap who"><button class="warr off" data-d="-1" aria-label="Anteriores">‹</button><div class="whorow">${root.order.map(id => { const nm = root.profiles[id].name || '?';
      return `<button class="kid" data-id="${id}" style="--k:${COLORS[[...nm].reduce((a, c) => a + c.codePointAt(0), 0) % COLORS.length]}"><span class="av">${nm[0].toUpperCase()}</span><b>${nm}</b><small>★ ${profileStars(id)}</small></button>`; }).join('')}
      ${root.order.length < MAXPROFILES ? '<button class="kid add" id="bAdd"><span class="av">+</span><b>Agregar</b><small>niño o niña</small></button>' : ''}</div><button class="warr off" data-d="1" aria-label="Siguientes">›</button></div>` : '<p>¡Aprende jugando, a tu ritmo y con Poli!</p>'}
    <div class="field" ${root.order.length ? 'hidden' : ''}><input id="nm" maxlength="14" placeholder="¿Cómo te llamas?" autocomplete="off"><button class="btn gold" id="go">¡Empezar!</button></div></div></div>`, 'welcome');
  // Recorrido: botón con texto en la esquina de arriba (en la portada está libre)
  $('#barSlot').innerHTML = '<button class="tourpill" id="bTour">🧭 Recorrido</button>';
  $('#bTour').onclick = () => { sfx.pop(); startMapTour(() => go('welcome')); };
  // Novedades: botón redondo arriba, al lado del volumen
  $('#barSlot2').innerHTML = '<button class="round" id="bNews" aria-label="Novedades" title="Novedades"><svg viewBox="0 0 24 24"><path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" fill="#ffc233" stroke="#e09a00" stroke-width="1.4" stroke-linejoin="round"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z" fill="#ff7eb6"/><path d="M5 15.5l.6 1.4 1.4.6-1.4.6L5 19.5l-.6-1.4-1.4-.6 1.4-.6z" fill="#4ea8ff"/></svg></button>';
  // si hay más niños de los que caben, flechas para moverse (también se desliza con el dedo)
  const row = $('.whorow');
  if (row) {
    const [l, r] = $$('.warr');
    const arrows = () => {
      if (!row.isConnected) return removeEventListener('resize', arrows);
      const more = row.scrollWidth > row.clientWidth + 2;
      l.classList.toggle("off", !more || row.scrollLeft < 10); r.classList.toggle("off", !more || row.scrollLeft + row.clientWidth > row.scrollWidth - 10);
    };
    [l, r].forEach(b => b.onclick = () => { sfx.pop(); row.scrollBy({ left: +b.dataset.d * (row.clientWidth * .8), behavior: 'smooth' }); });
    row.addEventListener('scroll', arrows); addEventListener('resize', arrows); arrows(); setTimeout(arrows, 300);
  }
  const start = () => {
    const nm = cleanName($('#nm').value);
    if (!nm) { sfx.bad(); poli.oops('Escribe tu nombre para empezar.'); $('#nm').focus(); return; }
    if (root.order.some(id => root.profiles[id].name.toLowerCase() === nm.toLowerCase())) { sfx.bad(); poli.oops(`Ya hay alguien que se llama ${nm}. Toca su tarjeta o escribe otro nombre.`); return; }
    ac(); askGender(nm, g => { addProfile(nm, g); go('map'); });
  };
  /* pregunta una sola vez: al crear el perfil o la primera vez que entra un perfil antiguo */
  const askGender = (nm, done) => {
    const f = $('.welcome .field'); f.hidden = false;
    f.innerHTML = `<p class="gq">¿${nm} es niña o niño?</p><div class="gbtns"><button class="btn gold" data-g="a">👧 Niña</button><button class="btn" data-g="o">👦 Niño</button></div>`;
    $$('.who', document).forEach(w => w.hidden = true);
    $$('[data-g]', f).forEach(b => b.onclick = () => { sfx.pop(); done(b.dataset.g); });
    poli.say(`¿${nm} es niña o niño?`, false);
  };
  $('#go').onclick = start;
  $('#nm').onkeydown = e => { if (e.key === 'Enter') start(); };
  $$('.kid[data-id]').forEach(b => b.onclick = () => {
    ac(); switchProfile(b.dataset.id);
    if (save.g) return go('map');
    askGender(save.name, g => { save.g = g; persist(); go('map'); });
  });
  if ($('#bAdd')) $('#bAdd').onclick = () => { sfx.pop(); $('.welcome .field').hidden = false; $('#nm').focus(); poli.say('¡Hola! Escribe tu nombre y comencemos.', false); };
  $('#bNews').onclick = () => go('news', { from: 'welcome' });
  maybeShowNews();
  poli.say(root.order.length ? '¡Hola! Soy Poli. ¿Quién va a jugar hoy? Toca tu nombre.' : '¡Hola! Soy Poli y vamos a aprender jugando. Escribe tu nombre y comencemos.', false);
}

/* ---------- Mapa ---------- */
/* celular (vertical u horizontal): el mapa pasa a ser un camino hacia abajo con scroll */
const isVertical = () => innerWidth < 640 || innerHeight < 500;
function nodeState(ch, vert) {
  const C = CH[ch], len = C.nodes.length;
  let currentFound = false;
  return C.nodes.map((id, i) => {
    const x = vert ? (i % 2 ? 70 : 30) : 7 + i * 86 / (len - 1), y = vert ? (i + .5) / len * 100 : i % 2 ? 70 : 32;
    const isChal = id === C.chal;
    if (id === 'taller') return { id, x, y, locked: false, current: false, isChal: false, free: true }; // Taller: siempre abierto, sin estrellas
    const locked = i === 0 ? false : isChal ? !C.figs.every(F => prog(F.id).lesson) : !prog(C.nodes[i - 1]).lesson && !Object.keys(prog(id)).length; // una isla ya jugada no se vuelve a cerrar
    const complete = isIntro(id) ? !!prog(id).lesson : isChal ? save[id] > 0 : figStars(id) === 3;
    const current = !locked && !currentFound && !complete; if (current) currentFound = true;
    return { id, x, y, locked, current, isChal };
  });
}
const MENU_ITEMS = `
            <button data-go="repaso"><span class="mi"><svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 109 9" fill="none" stroke="#5a3a00" stroke-width="2.6" stroke-linecap="round"/><path d="M21 4v5h-5" fill="none" stroke="#5a3a00" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7.5V12l3 2" fill="none" stroke="#5a3a00" stroke-width="2.4" stroke-linecap="round"/></svg></span><span><b>Repaso</b><small>5 preguntas para practicar</small></span></button>
            <button data-go="album"><span class="mi"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3" fill="#ff7eb6" stroke="#7c5cff" stroke-width="2"/><path d="M8 8h8M8 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></span><span><b>Álbum</b><small>Tus stickers y estrellas</small></span></button>
            <button data-go="avance"><span class="mi"><svg viewBox="0 0 24 24"><rect x="3" y="13" width="4" height="8" rx="1.5" fill="#ff8a3d"/><rect x="10" y="8" width="4" height="13" rx="1.5" fill="#4ea8ff"/><rect x="17" y="3" width="4" height="18" rx="1.5" fill="#22c58b"/></svg></span><span><b>Mi avance</b><small>Cómo vas en cada tema</small></span></button>
            <button data-go="parent"><span class="mi"><svg viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" fill="none" stroke="#7c5cff" stroke-width="2.4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="#7c5cff" stroke-width="2.4" stroke-linecap="round"/></svg></span><span><b>Ajustes</b><small>Para adultos 🔒</small></span></button>`;
const setMenu = open => { const m = $('#menu'); if (!m) return; m.hidden = !open; $('#bMenu').setAttribute('aria-expanded', open); };
addEventListener('click', e => { if (!e.target.closest('#menu,#bMenu')) setMenu(false); });
function viewMap() {
  if (!root.cur) return go('welcome');
  const ch = CH[save.ch] ? +save.ch : 1, vert = isVertical();
  const ns = nodeState(ch, vert);
  let d = `M ${ns[0].x} ${ns[0].y}`;
  for (let i = 1; i < ns.length; i++) { const a = ns[i - 1], b = ns[i], mx = (a.x + b.x) / 2; d += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`; }
  const nodeHtml = ns.map(n => {
    let c, dk, icon, label, stars;
    if (isIntro(n.id)) { c = '#34d399'; dk = '#1b9f72'; icon = `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill="#fff"/></svg>`; label = CH[ch].introLabel; stars = starsRow(prog(n.id).lesson ? 1 : 0, 1); }
    else if (n.free) { c = '#9b6bff'; dk = '#7447e0'; icon = `<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16z" fill="#fff" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`; label = 'Taller libre'; stars = '<small class="nfree">¡Dibuja!</small>'; }
    else if (n.isChal) { c = '#ffc233'; dk = '#e09a00'; icon = `<svg viewBox="0 0 24 24"><path d="${trophyPath}" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`; label = 'Gran Desafío'; stars = starsRow(save[n.id] || 0); }
    else { const F = FIG[n.id]; c = F.c; dk = F.d; icon = figSvg(F, true); label = F.short || cap(F.name); stars = starsRow(figStars(F.id)); }
    return `<button class="node ${n.locked ? 'locked' : ''} ${n.current ? 'current' : ''}" data-id="${n.id}" style="left:${n.x}%;top:${n.y}%;--c:${c};--d:${dk}">
      <span class="bub">${icon}${n.locked ? lockSvg : ''}</span><span class="ribbon">${label}</span><span class="nst">${stars}</span></button>`;
  }).join('');
  const el = frame(`<div class="mapwrap ${vert ? 'vert' : ''}">
      <div class="maptop">
        <div class="chapters">${Object.keys(CH).map(Number).map(k => `<button class="chap ${k === ch ? 'on' : ''}" data-ch="${k}">${CH[k].label}</button>`).join('')}</div>
        <div class="mapbar">
          <div class="mbtns">
            <button class="btn gold sm" data-go="repaso"><svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 109 9" fill="none" stroke="#5a3a00" stroke-width="2.6" stroke-linecap="round"/><path d="M21 4v5h-5" fill="none" stroke="#5a3a00" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7.5V12l3 2" fill="none" stroke="#5a3a00" stroke-width="2.4" stroke-linecap="round"/></svg>Repaso</button>
            <button class="btn ghost sm" data-go="album"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3" fill="#ff7eb6" stroke="#7c5cff" stroke-width="2"/><path d="M8 8h8M8 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>Álbum</button>
            <button class="btn ghost sm" data-go="avance"><svg viewBox="0 0 24 24"><rect x="3" y="13" width="4" height="8" rx="1.5" fill="#ff8a3d"/><rect x="10" y="8" width="4" height="13" rx="1.5" fill="#4ea8ff"/><rect x="17" y="3" width="4" height="18" rx="1.5" fill="#22c58b"/></svg>Mi avance</button>
            <button class="btn ghost sm" data-go="parent"><svg viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" fill="none" stroke="#7c5cff" stroke-width="2.4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="#7c5cff" stroke-width="2.4" stroke-linecap="round"/></svg>Ajustes</button>
          </div>
        </div>
      </div>
      <div class="mapscroll"><div class="map ${!vert && ns.length > 8 ? 'dense' : ''}" ${vert ? `style="height:${ns.length * 132}px"` : ''}>
        <svg class="path" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${d}"/></svg>${nodeHtml}</div></div></div>`, 'fill');
  if (vert) $('.node.current', el)?.scrollIntoView({ block: 'center' });
  $$('.chap', el).forEach(b => b.onclick = () => { save.ch = +b.dataset.ch; persist(); go('map'); });
  $$('.node', el).forEach(b => b.onclick = () => {
    const id = b.dataset.id, n = ns.find(x => x.id === id);
    if (n.locked) { sfx.bad(); poli.oops(n.isChal ? 'Para el Gran Desafío, primero aprende todas las figuras de este capítulo.' : 'Esa isla todavía está cerrada. ¡Termina la anterior!'); return; }
    if (n.free) return go('workshop');
    isIntro(id) ? go('lesson', { id }) : n.isChal ? go('challenge', { ch }) : go('island', { id });
  });
  /* Repaso, Álbum, Mi avance y Ajustes: botones a la vista en pantallas anchas; en celular, en el Menú */
  $$('[data-go]', el).forEach(b => b.onclick = () => go(b.dataset.go));
  /* en celular, el botón Más va en la barra de arriba, al lado del título */
  $('#barSlot').innerHTML = `<button class="round more" id="bMenu" aria-expanded="false" aria-label="Más opciones"><svg viewBox="0 0 24 24" class="dots4"><circle cx="7" cy="7" r="3.6" fill="#ff6b6b"/><circle cx="17" cy="7" r="3.6" fill="#4ea8ff"/><circle cx="7" cy="17" r="3.6" fill="#22c58b"/><circle cx="17" cy="17" r="3.6" fill="#9b6bff"/></svg></button>
    <div class="menu" id="menu" hidden>${MENU_ITEMS}</div>`;
  $$('#barSlot [data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
  $('#bMenu').onclick = e => { e.stopPropagation(); sfx.pop(); setMenu(!!$('#menu').hidden); };
  const cu = ns.find(n => n.current);
  poli.say(!cu ? `¡Increíble, ${save.name}! Completaste todo este capítulo.`
    : isIntro(cu.id) ? CH[ch].hello(save.name)
      : `Muy bien, ${save.name}. Sigamos con la isla que está saltando.`);
  if (!demoMode && !tourOn && tourSeen(TOURKEY) < TOURVER) setTimeout(() => cur.name === 'map' && !tourOn && startMapTour(() => go('map')), 500);
}

/* ---------- Isla (hub) ---------- */
function viewIsland() {
  const F = FIG[cur.id], p = prog(F.id), is3 = F.kind === '3d';
  if (F.kind === 'num') return islandNum(F);
  save.ch = is3 ? 2 : 1; persist();
  const card = (k, t, sub, icon) => `<button class="card ${p[k] ? 'done' : ''}" data-k="${k}" style="--d:${F.d};--l:${F.l}">
     <span class="ico">${icon}</span><span><b>${t}</b><small>${sub}</small></span><span class="st">${starSvg(p[k])}</span></button>`;
  const icoLesson = `<svg viewBox="0 0 24 24"><path d="M3 6l9-3 9 3v11l-9 3-9-3z" fill="${F.c}"/><path d="M12 3v17" stroke="#fff" stroke-width="2"/></svg>`;
  const icoBuild = `<svg viewBox="0 0 24 24"><polyline points="5,18 12,5 19,18" fill="none" stroke="${F.d}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1 4"/><circle cx="5" cy="18" r="2.8" fill="${F.c}"/><circle cx="12" cy="5" r="2.8" fill="${F.c}"/><circle cx="19" cy="18" r="2.8" fill="${F.c}"/></svg>`;
  const icoPaint = `<svg viewBox="0 0 24 24"><path d="M5 19c0-3 2-4 4-4s3 2 2 3-6 3-6 1z" fill="${F.c}"/><path d="M10 14L19 5l1.5 1.5-9 9z" fill="${F.d}"/></svg>`;
  const icoHunt = `<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" fill="#fff" stroke="${F.d}" stroke-width="2.6"/><path d="M15 15l6 6" stroke="${F.d}" stroke-width="3.4" stroke-linecap="round"/></svg>`;
  const hero = is3 ? c3(F.id, 'grab big3d') : polySvg(F, { sw: 5 });
  const chips = is3 ? chipsFor(F) : [`${F.n} lados`, `${F.n} vértices`];
  const el = frame(`<div class="hub" style="--d:${F.d}">
    <div class="hero">${hero}<h2 class="${F.name.length > 12 ? 'long' : ''}">${cap(F.name)}</h2>
      <div class="chips">${chips.map(c => `<span class="chip">${c}</span>`).join('')}</div></div>
    <div class="cards">${card('lesson', 'Aprende', is3 ? 'Sus caras, aristas y vértices' : 'Conoce sus lados y vértices', icoLesson)}${is3 ? card('paint', 'Pinta', 'Pinta cada una de sus caras', icoPaint) : card('build', 'Construye', 'Une los puntos y créalo', icoBuild)}${card('hunt', 'Caza', 'Encuéntralo en la vida real', icoHunt)}</div></div>`);
  $$('.card', el).forEach(b => b.onclick = () => go(b.dataset.k, { id: F.id }));
  poli.say(figStars(F.id) === 3 ? `¡Dominaste ${F.art} ${F.name}! Ganaste su sticker.` : `Esta es la isla ${del(F)}.${is3 ? ` ¡Puedes ${F.art === 'la' ? 'girarla' : 'girarlo'} con el dedo!` : ''} ¿Qué quieres hacer primero?`);
}

/* ---------- Motor de pasos para lecciones ---------- */
/* "Volver" dentro de una lección: va al paso anterior (desde el primero, sale a la isla) */
let stepBack = null;
function runSteps(steps, onFinish, accent) {
  let i = 0;
  const passed = new Set(); // pasos con pregunta ya respondida: al volver no hay que responderlos otra vez
  const show = () => {
    stepBack = i > 0 ? () => { i--; show(); } : null;
    const s = steps[i];
    const el = frame(`<div class="dots">${steps.map((_, k) => `<i class="${k < i ? 'past' : k === i ? 'on' : ''}"></i>`).join('')}</div><div class="stepbody"></div>`);
    if (accent) el.style.setProperty('--d', accent);
    const last = i === steps.length - 1;
    setAction(last ? '¡Listo!' : 'Siguiente ➜', next, !s.gate || passed.has(i), last ? 'green' : '');
    const body = $('.stepbody', el), at = i;
    s.render(body, { unlock() { passed.add(at); enableAction(); } });
    mount3D(body);
    const t = typeof s.say === 'function' ? s.say() : s.say; if (t) poli.say(t);
  };
  const next = () => { if (i < steps.length - 1) { i++; show(); } else onFinish(); };
  show();
}

/* contar lados o vértices tocando */
function stepCount(body, ctx, S, kind) {
  const n = S.n, isSide = kind === 'side';
  const items = S.pts.map((p, i) => ({ a: p, b: S.pts[(i + 1) % n] }));
  const poly = `<polygon points="${ps(S.pts)}" fill="${S.l}" stroke="${S.c}" stroke-width="4" stroke-linejoin="round"/>`;
  const hits = items.map((it, i) => isSide
    ? `<g class="hit" data-i="${i}"><line class="vis" x1="${it.a[0]}" y1="${it.a[1]}" x2="${it.b[0]}" y2="${it.b[1]}" stroke="${S.c}" stroke-width="9" stroke-linecap="round" opacity=".001"/><line x1="${it.a[0]}" y1="${it.a[1]}" x2="${it.b[0]}" y2="${it.b[1]}" stroke="transparent" stroke-width="30" stroke-linecap="round"/></g>`
    : `<g class="hit" data-i="${i}"><circle class="vis" cx="${it.a[0]}" cy="${it.a[1]}" r="10" fill="#fff" stroke="${S.d}" stroke-width="4"/><circle cx="${it.a[0]}" cy="${it.a[1]}" r="24" fill="transparent"/></g>`).join('');
  body.innerHTML = `<div class="col"><svg viewBox="-20 -20 240 240" class="big" id="cs">${poly}${hits}<g id="badges"></g></svg>
    <div class="counter" id="cnt"><b id="cn">0</b> de ${n}</div></div>`;
  const got = new Set(); let order = 0;
  $$('.hit', body).forEach(g => g.onclick = () => {
    const i = +g.dataset.i; if (got.has(i)) return;
    got.add(i); order++; sfx.tap(order); speak(NUM[order]);
    const it = items[i], vis = $('.vis', g);
    let mx, my;
    if (isSide) { vis.setAttribute('opacity', 1); vis.setAttribute('stroke', S.d); mx = (it.a[0] + it.b[0]) / 2; my = (it.a[1] + it.b[1]) / 2; }
    else { vis.setAttribute('fill', S.c); vis.setAttribute('stroke', S.d); mx = it.a[0]; my = it.a[1]; }
    const dx = mx - 100, dy = my - 100, len = Math.hypot(dx, dy) || 1, off = isSide ? 20 : 24;
    const bx = mx + dx / len * off, by = my + dy / len * off;
    $('#badges').insertAdjacentHTML('beforeend', `<g class="badge" style="transform-box:fill-box;transform-origin:center"><circle cx="${bx}" cy="${by}" r="14" fill="#fff" stroke="${S.d}" stroke-width="3.5"/><text x="${bx}" y="${by + 6.5}" text-anchor="middle" font-family="Baloo 2,Arial" font-weight="800" font-size="19" fill="${S.d}">${order}</text></g>`);
    $('#cn').textContent = order;
    if (got.size === n) {
      $('#cnt').classList.add('full');
      setTimeout(() => { sfx.ok(); poli.cheer(`¡${cap(NUM[n])} ${isSide ? 'lados' : 'vértices'}! ${isSide ? 'Cada línea recta es un lado' : 'Cada esquina es un vértice'}.`); ctx.unlock(); }, 600);
    }
  });
}

/* elegir entre opciones */
function choice(body, { prompt, shape = '', opts, onRight, cls = '' }) {
  body.innerHTML = `<div class="qwrap"><h2 class="q">${prompt}</h2>${shape}<div class="opts">${opts.map((o, i) => `<button class="opt ${cls}" data-i="${i}">${o.html}</button>`).join('')}</div></div>`;
  mount3D(body);
  let missed = false, solved = false;
  $$('.opt', body).forEach(b => b.onclick = () => {
    if (solved || b.classList.contains('wrong')) return;
    const o = opts[+b.dataset.i];
    if (o.ok) { solved = true; b.classList.add('right'); sfx.ok(); poli.cheer(o.say || '¡Muy bien!'); onRight(!missed); }
    else { missed = true; b.classList.add('wrong'); sfx.bad(); poli.oops(o.hint || 'Casi. ¡Inténtalo otra vez!'); }
  });
}
const optSvg = inner => `<svg viewBox="0 0 200 200">${inner}</svg>`;
const polyOpt = (S, c) => optSvg(`<polygon points="${ps(S.pts)}" fill="${c || S.c}" stroke="#2b2d6e" stroke-opacity=".25" stroke-width="6" stroke-linejoin="round"/>`);
const flatOpt = (k, c) => k === 'circ' ? optSvg(NONPOLY.circle.svg(c)) : polyOpt(SH[k], c);
const objCards = (objs, cls = 'obj') => objs.map((o, i) => `<button class="${cls}" style="animation-delay:${i * .1}s" data-id="${o.id}">${objSvg(o)}<span>${cap(o.n)}</span></button>`).join('');
function bindObjNames(root) { $$('.obj', root).forEach(x => x.onclick = () => { sfx.tap(2); speak(cap(OBJS[x.dataset.id].n)); }); }

/* ---------- Lecciones ---------- */
function viewLesson() {
  if (cur.id === 'intro') return lessonIntro();
  if (cur.id === 'intro3d') return lessonIntro3D();
  if (cur.id === 'intro123') return lessonIntroNum();
  const F = FIG[cur.id];
  return F.kind === 'num' ? NUMLESSON[F.id](F) : F.kind === '3d' ? lessonSolid(F) : lessonShape(F);
}
function doneStep(id, title, sub, say) {
  return { say, render: b => { b.innerHTML = `<div class="col trophy"><h2>${title}</h2><div class="star-big">${starSvg(true, 180)}</div><span class="sub">${sub}</span></div>`; if (award('lesson', id)) { confetti(); sfx.win(); } } };
}
function lessonShape(S) {
  const nm = `${S.art} ${S.name}`;
  const objs = pickFresh(OBJ.filter(o => o.shape === S.id), 3, S.id);
  runSteps([
    { say: `¡Hola, ${save.name}! Hoy vamos a conocer ${nm}.`, render: b => b.innerHTML = `<div class="col">${polySvg(S, { cls: 'big draw', sw: 6 })}<h2>${cap(nm)}</h2><span class="sub">Un polígono de ${S.n} lados</span></div>` },
    { gate: true, say: `Toca cada lado ${del(S)} para contarlos. Los lados son las líneas rectas.`, render: (b, c) => stepCount(b, c, S, 'side') },
    { gate: true, say: 'Ahora toca cada vértice. Los vértices son las esquinas.', render: (b, c) => stepCount(b, c, S, 'vertex') },
    { say: S.fact, render: b => b.innerHTML = `<div class="fact-wrap">${polySvg(S, { sw: 5 })}<div class="fact"><span class="fx">Dato curioso</span>${S.fact}</div></div>` },
    { say: `Mira dónde encontramos ${nm}. Toca cada uno para escuchar su nombre.`, render: b => { b.innerHTML = `<div class="col"><h2>¿Dónde lo encontramos?</h2><div class="objs">${objCards(objs)}</div></div>`; bindObjNames(b); } },
    doneStep(S.id, '¡Lección completa!', `${cap(nm)} · ${S.n} lados · ${S.n} vértices`, `¡Lo lograste, ${save.name}! Ahora ya conoces ${nm}.`),
  ], () => go('island', { id: S.id }), S.d);
}
/* ícono pequeño de cada tipo de cara (con su color fijo) */
const trayIcon = k => `<svg viewBox="0 0 40 40" class="ti">${{
  tri: `<polygon points="20,5 36,34 4,34" fill="${FACECOL.tri}"/>`, sq: `<rect x="7" y="7" width="26" height="26" fill="${FACECOL.sq}"/>`,
  rect: `<rect x="3" y="11" width="34" height="18" fill="${FACECOL.rect}"/>`, circ: `<circle cx="20" cy="20" r="15" fill="${FACECOL.circ}"/>`,
  curva: `<path d="M3 26C10 8 18 8 20 20S30 32 37 14V34H3Z" fill="${FACECOL.curva}"/>`,
}[k]}</svg>`;

/* paso que cuenta caras, aristas o vértices marcándolos uno a uno sobre la figura 3D */
function countStep(B, kind) {
  const M = MESH[B.id], s = stats(B.id), nm = `${B.art} ${B.name}`;
  const n = { caras: s.caras, aristas: s.aristas, vertices: s.vertices }[kind];
  const word = { caras: n === 1 ? 'cara' : 'caras', aristas: n === 1 ? 'arista' : 'aristas', vertices: n === 1 ? 'vértice' : 'vértices' }[kind];
  const intro = {
    caras: 'Las caras son las partes planas. ¡Mira cómo las contamos!',
    aristas: 'Las aristas son las líneas donde se juntan dos caras. ¡Contemos!',
    vertices: 'Los vértices son las puntas, donde se juntan las aristas. ¡Contemos!',
  }[kind];
  const end = kind === 'caras' ? `¡${cap(nm)} tiene ${facesSentence(B)}!`
    : n ? `¡${cap(nm)} tiene ${n} ${word}!${kind === 'aristas' && !s.poly ? ' Sus aristas son curvas.' : ''}`
      : `¡${cap(nm)} no tiene ${word}${kind === 'vertices' ? ': no tiene ninguna punta' : ''}!`;
  return {
    gate: n > 0, say: n ? intro : end,
    render: (b, ctx) => {
      b.innerHTML = `<div class="count3d"><canvas class="c3d grab big3d"></canvas>
        <div class="side-panel"><div class="counter"><b class="cn">0</b> ${word}</div><div class="tray"></div>
        <p class="explain">${n ? intro : end}</p><button class="btn ghost sm again" hidden>Contar otra vez</button></div></div>`;
      const cv = $('canvas', b), hl = { faces: new Map(), edges: new Map(), verts: new Map() }, painted = new Map();
      cv.dataset.on = 1;
      view3D(cv, B.id, { interactive: true, blank: kind === 'caras', painted, hl });
      if (!n) { if (kind === 'caras' && s.curved) painted.set(M.groups.length - 1, FACECOL.curva); return; }
      const run = async () => {
        hl.faces.clear(); hl.edges.clear(); hl.verts.clear(); painted.clear();
        $('.tray', b).innerHTML = ''; $('.counter', b).classList.remove('full'); $('.again', b).hidden = true;
        await sleep(1600);
        const TYPE_ORDER = ['sq', 'tri', 'rect', 'circ', 'curva'];
        const items = kind === 'caras' ? M.groups.map((G, g) => g).sort((a, b) => TYPE_ORDER.indexOf(faceKey(M.groups[a])) - TYPE_ORDER.indexOf(faceKey(M.groups[b]))) : kind === 'aristas' ? M.edges.map((_, i) => i) : M.verts;
        let k = 0;
        for (const it of items) {
          if (!cv.isConnected) return;
          if (kind === 'caras') {
            const G = M.groups[it]; painted.set(it, FACECOL[faceKey(G)]);
            if (!G.flat) { $('.tray', b).insertAdjacentHTML('beforeend', `<span class="tplus">+</span>${trayIcon('curva')}`); continue; }
            hl.faces.set(it, ++k); $('.tray', b).insertAdjacentHTML('beforeend', trayIcon(G.shape));
          } else if (kind === 'aristas') hl.edges.set(it, ++k);
          else hl.verts.set(it, ++k);
          $('.cn', b).textContent = k; sfx.tap(k);
          await sleep(n > 8 ? 330 : 450);
        }
        if (!cv.isConnected) return;
        $('.counter', b).classList.add('full'); $('.explain', b).textContent = end; $('.again', b).hidden = false;
        sfx.ok(); poli.cheer(end); ctx.unlock();
      };
      $('.again', b).onclick = () => { sfx.pop(); run(); };
      run();
    },
  };
}

function lessonSolid(B) {
  const nm = `${B.art} ${B.name}`, s = stats(B.id);
  const objs = pickFresh(OBJ3.filter(o => o.shape === B.id), 3, B.id);
  const q = B.print
    ? (b, c) => {
      const ks = shuffle([B.print, ...pick(['sq', 'rect', 'tri', 'circ'].filter(k => k !== B.print), 2)]), cols = shuffle(COLORS);
      choice(b, {
        prompt: `Si apoyas ${nm} sobre ${B.base} en plastilina, ¿qué huella deja?`, shape: c3(B.id, 'qc3'),
        opts: ks.map((k, i) => ({ html: flatOpt(k, cols[i]), ok: k === B.print, say: `¡Sí! Deja la huella de un ${NAME2D[k]}.`, hint: 'Mira bien la cara de abajo. ¡Inténtalo otra vez!' })),
        onRight: () => c.unlock(),
      });
    }
    : (b, c) => choice(b, {
      prompt: `¿${cap(nm)} puede rodar?`, shape: c3(B.id, 'qc3'), cls: 'txt',
      opts: [{ html: 'Sí, rueda', ok: true, say: '¡Sí! Rueda hacia todos lados, porque es curva.' }, { html: 'No rueda', ok: false, hint: 'Piensa en una pelota… ¿qué pasa si la empujas?' }],
      onRight: () => c.unlock(),
    });
  const chips = chipsFor(B);
  runSteps([
    { say: `${B.art === 'la' ? 'Esta' : 'Este'} es ${nm}. ${B.fact}`,
      render: b => b.innerHTML = `<div class="col">${c3(B.id, 'grab big3d')}<h2>${cap(nm)}</h2><div class="chips">${chips.map(c => `<span class="chip">${c}</span>`).join('')}</div></div>` },
    ...(s.caras || s.aristas || s.vertices ? [countStep(B, 'caras'), countStep(B, 'aristas'), countStep(B, 'vertices')] : []),
    { gate: true, say: B.print ? `Si apoyas ${nm} sobre ${B.base} en plastilina, ¿qué huella deja?` : `¿${cap(nm)} puede rodar?`, render: q },
    { say: `Mira dónde encontramos ${nm}. Toca cada uno para escuchar su nombre.`, render: b => { b.innerHTML = `<div class="col"><h2>¿Dónde lo encontramos?</h2><div class="objs">${objCards(objs)}</div></div>`; bindObjNames(b); } },
    doneStep(B.id, '¡Lección completa!', `${cap(nm)} · ${chips.join(' · ')}`, `¡Lo lograste, ${save.name}! ${cap(nm)} tiene ${facesSentence(B)}.`),
  ], () => go('island', { id: B.id }), B.d);
}

function lessonIntro() {
  const mkQ = askPoly => (b, c) => {
    const polyS = pick(SHAPES, askPoly ? 1 : 2), np = pick(NPKEYS, askPoly ? 2 : 1), cols = shuffle(COLORS);
    const opts = shuffle([
      ...polyS.map((S, i) => ({ html: polyOpt(S, cols[i]), ok: askPoly, say: `¡Sí! ${cap(S.art)} ${S.name} es un polígono.`, hint: 'Ese sí es un polígono: es cerrado y tiene lados rectos. ¡Busca otro!' })),
      ...np.map((k, i) => ({ html: optSvg(NONPOLY[k].svg(cols[i + 3])), ok: !askPoly, say: '¡Correcto! Esa no es un polígono.', hint: NONPOLY[k].hint })),
    ]);
    choice(b, { prompt: askPoly ? '¿Cuál es un polígono?' : '¿Cuál NO es un polígono?', opts, onRight: () => c.unlock() });
  };
  runSteps([
    { say: `¡Hola, ${save.name}! Un polígono es una figura cerrada, con lados rectos. Las líneas se llaman lados y las esquinas se llaman vértices.`,
      render: b => {
        const S = SH.pent;
        b.innerHTML = `<div class="fact-wrap"><svg viewBox="-30 -20 260 240" class="big" style="--board:min(42vh,380px)">
          <polygon points="${ps(S.pts)}" fill="${S.l}" stroke="${S.c}" stroke-width="6" stroke-linejoin="round"/>
          ${S.pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="${S.d}" stroke="#fff" stroke-width="3"/>`).join('')}
          <g font-family="Baloo 2,Arial" font-weight="800" font-size="16">
           <rect x="-28" y="86" width="56" height="26" rx="13" fill="#fff"/><text x="0" y="105" text-anchor="middle" fill="${S.d}">lado</text>
           <rect x="76" y="-18" width="78" height="26" rx="13" fill="#ffc233"/><text x="115" y="1" text-anchor="middle" fill="#5a3a00">vértice</text>
          </g></svg>
          <div class="fact"><span class="fx">Un polígono es…</span><ul class="rules">
            <li>🔒 una figura <b>cerrada</b></li><li>📏 con lados <b>rectos</b></li><li>📍 con <b>vértices</b> (esquinas)</li></ul></div></div>`;
      } },
    { gate: true, say: 'Ahora tú. Toca el polígono.', render: mkQ(true) },
    { gate: true, say: 'Otra más. ¿Cuál NO es un polígono?', render: mkQ(false) },
    { gate: true, say: 'Última. Toca el polígono.', render: mkQ(true) },
    doneStep('intro', '¡Muy bien!', 'Se abre la isla del triángulo', `¡Genial, ${save.name}! Ya sabes qué es un polígono. Ahora conoceremos a los más famosos.`),
  ], () => go('map'), '#1b9f72');
}

/* pregunta 2D vs 3D */
function q2d3d(want3d) {
  const cols = shuffle(COLORS);
  const flats = pick(['tri', 'sq', 'rect', 'pent', 'hex', 'circ'], want3d ? 2 : 1);
  const solids = pick(SOLIDS, want3d ? 1 : 2);
  return {
    prompt: want3d ? '¿Cuál es una figura 3D?' : '¿Cuál es una figura 2D?', shape: '',
    opts: shuffle([
      ...flats.map((k, i) => ({ html: flatOpt(k, cols[i]), ok: !want3d, say: `¡Sí! El ${NAME2D[k] || SH[k].name} es plano: es 2D.`, hint: 'Esa es plana, como un dibujo en un papel. Es 2D.' })),
      ...solids.map(B => ({ html: c3(B.id), ok: want3d, say: `¡Sí! ${cap(B.art)} ${B.name} tiene volumen: es 3D.`, hint: `Esa tiene volumen, la puedes tomar con la mano. Es 3D.` })),
    ]),
  };
}
function lessonIntro3D() {
  const mkQ = want3d => (b, c) => { const q = q2d3d(want3d); choice(b, { ...q, onRight: () => c.unlock() }); };
  runSteps([
    { say: `¡Hola, ${save.name}! Las figuras 2D son planas, como un dibujo en un papel. Las figuras 3D tienen volumen: las puedes tomar con tus manos.`,
      render: b => b.innerHTML = `<div class="duo">
        <div class="panel"><span class="tagx" style="background:#ff6b6b">2D</span>${polySvg(SH.sq, { sw: 6 })}<p>Es <b>plana</b>, como un dibujo en un papel.</p></div>
        <div class="panel"><span class="tagx" style="background:#7c5cff">3D</span>${c3('cubo', 'grab')}<p>Tiene <b>volumen</b>, ¡la puedes tomar!</p></div></div>` },
    { say: 'El cuadrado es plano, pero el cubo tiene caras con forma de cuadrado. ¡Las figuras 3D tienen figuras 2D en sus caras!',
      render: b => b.innerHTML = `<div class="duo">
        <div class="panel">${polySvg(SH.sq, { sw: 6 })}<p>Cuadrado · 2D</p></div>
        <div class="panel">${c3('cubo', 'grab')}<p>Cubo · 3D</p></div>
        <div class="panel">${optSvg(NONPOLY.circle.svg('#9b6bff'))}<p>Círculo · 2D</p></div>
        <div class="panel">${c3('cilindro', 'grab')}<p>Cilindro · 3D</p></div></div>` },
    { gate: true, say: '¿Cuál es una figura 3D? ¡Tócala!', render: mkQ(true) },
    { gate: true, say: 'Ahora, ¿cuál es una figura 2D?', render: mkQ(false) },
    { gate: true, say: 'Una más. ¿Cuál es 3D?', render: mkQ(true) },
    doneStep('intro3d', '¡Muy bien!', 'Ya sabes distinguir 2D y 3D', `¡Genial, ${save.name}! Ahora vamos a conocer los cuerpos 3D.`),
  ], () => go('map'), '#1b9f72');
}

/* ---------- Construye (2D) ---------- */
function viewBuild() {
  const S = SH[cur.id], n = S.n;
  const draw = first => {
    const ang = first ? 0 : (Math.random() * 360 | 0) * Math.PI / 180;
    const cs = Math.cos(ang), sn = Math.sin(ang);
    const P = S.pts.map(([x, y]) => { const dx = x - 100, dy = y - 100; return [200 + (dx * cs - dy * sn) * 1.7, 200 + (dx * sn + dy * cs) * 1.7].map(v => Math.max(48, Math.min(352, v))); });
    const el = frame(`<div class="board-wrap">
      <svg class="board" viewBox="0 0 400 400"><g id="fill"></g><g id="segs"></g><g id="dots">${P.map((p, i) => `<g class="dot" data-i="${i}"><circle class="r" cx="${p[0]}" cy="${p[1]}" r="24" fill="#fff" stroke="${S.c}" stroke-width="6"/><text x="${p[0]}" y="${p[1] + 9}" text-anchor="middle" font-family="Baloo 2,Arial" font-weight="800" font-size="26" fill="${S.d}">${i + 1}</text></g>`).join('')}</g></svg>
      <div class="side-panel" style="--d:${S.d}"><div class="counter" id="cnt"><b id="cn">0</b> de ${n} lados</div><div class="res" id="res"></div></div></div>`);
    let step = 0;
    const dots = $$('.dot', el), segs = $('#segs', el);
    const mark = () => dots.forEach((d, i) => d.classList.toggle('next', i === (step % n) && step <= n));
    mark();
    poli.say(`Toca los puntos en orden, del uno al ${NUM[n]}. Al final, vuelve al uno para cerrar la figura.`);
    dots.forEach(d => d.onclick = () => {
      const i = +d.dataset.i; if (step > n) return;
      const want = step % n;
      if (i !== want) { sfx.bad(); d.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], { duration: 300 }); poli.oops(`Casi. Ahora toca el número ${want + 1}.`); return; }
      if (step > 0) {
        const a = P[(step - 1) % n], b = P[i];
        segs.insertAdjacentHTML('beforeend', `<line class="seg" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${S.c}"/>`);
        $('#cn').textContent = step;
      }
      sfx.tap(step); step++;
      d.querySelector('circle').setAttribute('fill', S.c); d.querySelector('text').setAttribute('fill', '#fff');
      if (step === n) poli.say('¡Casi! Ahora vuelve al número uno para cerrar la figura.');
      if (step === n + 1) finish(); else mark();
    });
    const finish = async () => {
      dots.forEach(d => d.classList.remove('next'));
      await sleep(350);
      $('#fill', el).innerHTML = `<polygon points="${ps(P)}" fill="${S.c}" fill-opacity=".85" stroke="${S.d}" stroke-width="6" stroke-linejoin="round" style="animation:pop .6s;transform-origin:200px 200px"/>`;
      $('#cnt').classList.add('full');
      $('#res').innerHTML = `<div class="big-name">¡${cap(S.name)}!</div><span class="chip">${n} lados</span><span class="chip">${n} vértices</span>`;
      sfx.win(); confetti(70);
      award('build', S.id);
      poli.cheer(`¡Lo construiste! ${cap(S.art)} ${S.name} tiene ${n} lados y ${n} vértices.`);
      setAction('Otra vez', () => draw(false), true, 'ghost');
      const b2 = document.createElement('button'); b2.className = 'btn green'; b2.textContent = '¡Listo!'; b2.style.marginTop = '8px';
      b2.onclick = () => go('island', { id: S.id });
      $('.side-panel', el).appendChild(b2);
    };
  };
  draw(true);
}

/* ---------- Pinta las caras (3D) ---------- */
function viewPaint() {
  const B = SB[cur.id], M = MESH[B.id], total = M.groups.length, painted = new Map(), s = stats(B.id), nm = `${B.art} ${B.name}`;
  const word = s.poly ? 'caras' : 'partes';
  const el = frame(`<div class="board-wrap"><canvas class="c3d board3d" id="pc"></canvas>
    <div class="side-panel" style="--d:${B.d}"><div class="counter" id="cnt"><b id="cn">0</b> de ${total} ${word}</div>
    <div class="tray" id="tray"></div><span class="hint3d">Arrastra para girar · Toca para pintar</span><div class="res" id="res"></div></div></div>`);
  let hinted = false, cheered = false;
  const cv = $('#pc', el);
  const api = view3D(cv, B.id, {
    interactive: true, blank: true, painted, onTap: g => {
      if (g == null || painted.has(g)) return;
      const G = M.groups[g], k = faceKey(G);
      painted.set(g, FACECOL[k]); sfx.tap(painted.size);
      $('#tray').insertAdjacentHTML('beforeend', trayIcon(k));
      $('#cn').textContent = painted.size;
      if (painted.size === total) return finish();
      // sin voz en cada toque: solo una pista si ya no quedan caras a la vista, y un ánimo a la mitad
      setTimeout(() => {
        if (!cv.isConnected || hinted) return;
        if ([...api.visibleGroups()].every(x => painted.has(x))) { hinted = true; poli.say('¡Gira la figura con el dedo para encontrar las que faltan!'); }
      }, 250);
      if (!cheered && total > 3 && painted.size === Math.ceil(total / 2)) { cheered = true; poli.cheer(pick(['¡Vas muy bien!', '¡Ya vas en la mitad!', '¡Sigue así!'], 1)[0]); }
    },
  });
  const finish = () => {
    // la bandeja se ordena por tipo de cara para ver el resumen
    const order = ['sq', 'tri', 'rect', 'circ', 'curva'], keys = M.groups.map(faceKey).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    $('#tray').innerHTML = keys.map(trayIcon).join('');
    $('#cnt').classList.add('full');
    $('#res').innerHTML = `<div class="big-name">¡${cap(B.name)}!</div><span class="chip">${cap(facesSentence(B))}</span>`;
    sfx.win(); confetti(80); award('paint', B.id);
    poli.cheer(`¡Pintaste todas! ${cap(nm)} tiene ${facesSentence(B)}.`);
    setAction('¡Listo!', () => go('island', { id: B.id }), true, 'green');
  };
  poli.say(`Pinta todas las ${word} ${del(B)}. Cada tipo de cara tiene su color. ¡No olvides las de atrás!`);
}

/* ---------- Caza en la vida real ---------- */
function viewHunt() {
  const F = FIG[cur.id], is3 = F.kind === '3d';
  const pool = (is3 ? OBJ3 : OBJ).filter(o => o.shape === F.id);
  // una sola ronda: a veces pocos objetos correctos, a veces varios
  const good = pickFresh(pool, Math.min(pool.length, 2 + (Math.random() * 3 | 0)), F.id), TOTAL = 8;
  let others;
  // las dos pirámides se ven muy parecidas en dibujo: no se usan como distractoras entre sí
  const twin = { piramide: 'piramide3', piramide3: 'piramide' }[F.id];
  if (is3) others = pick(OBJ3.filter(o => o.shape !== F.id && o.shape !== twin), TOTAL - good.length);
  else {
    const circ = pick(OBJ.filter(o => o.shape === 'circ' || o.shape === 'curva'), 2);
    others = [...circ, ...pick(OBJ.filter(o => SH[o.shape] && o.shape !== F.id), TOTAL - good.length - circ.length)];
  }
  const cards = shuffle([...good, ...others]);
  let found = 0, missed = false;
  const el = frame(`<div class="hunt-title" style="--d:${F.d}">${figSvg(F)}<span class="tag">Encuentra ${plural(F)}: ${good.length}</span></div>
    <div class="hgrid g8">${objCards(cards, 'hcard')}</div>`);
  poli.say(`Hay ${NUM[good.length]} objetos con forma de ${F.name}. ¡Encuéntralos!`);
  $$('.hcard', el).forEach(c => c.onclick = () => {
    if (c.classList.contains('right')) return;
    const o = OBJS[c.dataset.id];
    if (o.shape === F.id) {
      c.classList.add('right'); found++; sfx.ok();
      const left = good.length - found;
      if (!left) {
        track(is3 ? 'fig3d' : 'poli', !missed);
        setTimeout(() => { confetti(); sfx.win(); award('hunt', F.id); poli.cheer(`¡Los encontraste todos, ${save.name}!`); setAction('¡Listo!', () => go('island', { id: F.id }), true, 'green'); }, 400);
      } else if (left === 1) poli.cheer('¡Falta uno!');
    } else {
      missed = true; c.classList.remove('wrong'); void c.offsetWidth; c.classList.add('wrong'); sfx.bad();
      const why = o.shape === 'circ' ? `${cap(o.n)} es redondo.` : o.shape === 'curva' ? `${cap(o.n)} tiene curvas.` : `${cap(o.n)} tiene forma de ${FIG[o.shape].name}.`;
      poli.oops(why);
    }
  });
}

/* ---------- Gran Desafío ---------- */
function makeQuestion(type) {
  if (type.startsWith('n:')) return freshQ(() => NQ[type.slice(2)]());
  const cols = shuffle(COLORS);
  const S = pick(SHAPES, 1)[0];
  if (type === 'sides' || type === 'vert') {
    const word = type === 'sides' ? 'lados' : 'vértices';
    const wrong = pick([3, 4, 5, 6, 7, 8].filter(x => x !== S.n), 2);
    return { prompt: `¿Cuántos ${word} tiene?`, shape: polySvg(S, { cls: 'qshape' }),
      opts: shuffle([S.n, ...wrong].map(v => ({ html: v, ok: v === S.n, say: `¡Sí! Tiene ${NUM[S.n]} ${word}.`, hint: `Cuenta otra vez ${type === 'sides' ? 'las líneas rectas' : 'las esquinas'}.` }))) };
  }
  if (type === 'name') {
    const wrong = pick(SHAPES.filter(s => s.id !== S.id), 2);
    return { prompt: '¿Cómo se llama esta figura?', shape: polySvg(S, { cls: 'qshape' }), cls: 'txt',
      opts: shuffle([S, ...wrong].map(s => ({ html: cap(s.name), ok: s.id === S.id, say: `¡Correcto! Es ${S.art} ${S.name}.`, hint: 'Mira cuántos lados tiene y piensa otra vez.' }))) };
  }
  if (type === 'notpoly') {
    const k = pick(NPKEYS, 1)[0], ps2 = pick(SHAPES, 2);
    return { prompt: '¿Cuál NO es un polígono?',
      opts: shuffle([...ps2.map((s, i) => ({ html: polyOpt(s, cols[i]), ok: false, hint: 'Ese sí es un polígono. ¡Busca otro!' })), { html: optSvg(NONPOLY[k].svg(cols[3])), ok: true, say: '¡Correcto!' }]) };
  }
  if (type === 'poly') {
    const ks = pick(NPKEYS, 2);
    return { prompt: '¿Cuál es un polígono?',
      opts: shuffle([{ html: polyOpt(S, cols[0]), ok: true, say: `¡Sí! ${cap(S.art)} ${S.name} es un polígono.` }, ...ks.map((k, i) => ({ html: optSvg(NONPOLY[k].svg(cols[i + 1])), ok: false, hint: NONPOLY[k].hint }))]) };
  }
  /* preguntas 3D */
  const B = pick(SOLIDS, 1)[0];
  if (type === 'is3d' || type === 'is2d') return q2d3d(type === 'is3d');
  if (type === 'name3d') {
    const wrong = pick(SOLIDS.filter(s => s.id !== B.id), 2);
    return { prompt: '¿Cómo se llama este cuerpo?', shape: c3(B.id, 'qc3'), cls: 'txt',
      opts: shuffle([B, ...wrong].map(s => ({ html: cap(s.name), ok: s.id === B.id, say: `¡Correcto! Es ${B.art} ${B.name}.`, hint: 'Míralo bien: ¿tiene puntas? ¿es curvo?' }))) };
  }
  if (type === 'print') {
    const P = pick(SOLIDS.filter(s => s.print), 1)[0];
    const ks = shuffle([P.print, ...pick(['sq', 'rect', 'tri', 'circ'].filter(k => k !== P.print), 2)]);
    return { prompt: `¿Qué huella deja ${P.art} ${P.name} ${P.art === 'la' ? 'apoyada' : 'apoyado'} sobre ${P.base}?`, shape: c3(P.id, 'qc3'),
      opts: ks.map((k, i) => ({ html: flatOpt(k, cols[i]), ok: k === P.print, say: `¡Sí! La huella es un ${NAME2D[k]}.`, hint: 'Piensa en su cara de abajo.' })) };
  }
  if (type === 'rolls') {
    const yes = pick(SOLIDS.filter(s => s.id === 'esfera' || s.id === 'cilindro'), 1)[0], no = pick(SOLIDS.filter(s => !s.rolls), 2);
    return { prompt: '¿Cuál puede rodar?',
      opts: shuffle([{ html: c3(yes.id), ok: true, say: `¡Sí! ${cap(yes.art)} ${yes.name} rueda porque tiene una parte curva.` }, ...no.map(s => ({ html: c3(s.id), ok: false, hint: `${cap(s.art)} ${s.name} solo tiene caras planas, no rueda.` }))]) };
  }
  if (type === 'count3d') {
    const P = pick(SOLIDS.filter(s => stats(s.id).poly), 1)[0], st = stats(P.id);
    const [k, word, hint] = pick([['caras', 'caras', 'Cuenta las partes planas.'], ['aristas', 'aristas', 'Cuenta las líneas donde se juntan dos caras.'], ['vertices', 'vértices', 'Cuenta las puntas.']], 1)[0];
    const n = st[k], wrong = pick([-3, -2, -1, 1, 2, 3].map(d => n + d).filter(v => v > 0), 2);
    return { prompt: `¿${k === 'vertices' ? 'Cuántos' : 'Cuántas'} ${word} tiene ${P.art} ${P.name}?`, shape: c3(P.id, 'qc3 grab'),
      opts: shuffle([n, ...wrong].map(v => ({ html: v, ok: v === n, say: `¡Sí! Tiene ${n} ${word}.`, hint: `${hint} ¡Puedes ${P.art === 'la' ? 'girarla' : 'girarlo'}!` }))) };
  }
}
function viewChallenge() {
  const ch = CH[cur.ch] ? cur.ch : 1, key = CH[ch].chal;
  const ts = shuffle(CH[ch].types), qs = ts.map(makeQuestion);
  const res = []; let qi = 0;
  const show = () => {
    const q = qs[qi];
    const el = frame(`<div class="progress">${qs.map((_, i) => `<i class="${i < qi ? (res[i] ? 'ok' : 'meh') : i === qi ? 'now' : ''}"></i>`).join('')}</div><div class="stepbody"></div>`);
    choice($('.stepbody', el), { prompt: q.prompt, shape: q.shape || '', opts: q.opts, cls: q.cls || '', onRight: first => { res[qi] = first; track(topicOf(ts[qi]), first); afterSay(() => { qi++; qi < qs.length ? show() : finish(); }, el); } });
    poli.say(q.voice || q.prompt);
  };
  const finish = () => {
    const good = res.filter(Boolean).length, stars = good >= 7 ? 3 : good >= 5 ? 2 : 1;
    if (stars > (save[key] || 0)) { save[key] = stars; persist(); refreshStars(true); }
    sfx.win(); confetti(160);
    frame(`<div class="stepbody"><div class="col trophy"><h2>¡Terminaste el desafío!</h2><div style="display:flex;gap:6px">${[0, 1, 2].map(i => `<div class="star-big" style="animation-delay:${.2 + i * .25}s">${starSvg(i < stars, 110)}</div>`).join('')}</div><span class="sub">${good} de ${qs.length} a la primera</span></div></div>`);
    setAction('Volver al mapa', () => go('map'), true, 'green');
    poli.cheer(stars === 3 ? `¡Perfecto, ${save.name}! Eres ${CH[ch].champ()}.` : `¡Buen trabajo, ${save.name}! Puedes volver a jugar para ganar más estrellas.`);
  };
  show();
}

/* ---------- Álbum ---------- */
function viewAlbum() {
  const total = totalStars(), max = maxStars();
  const rank = total >= max ? `¡${gx('Reina', 'Rey')} de las formas y los números!` : total >= 40 ? gx('Maestra', 'Maestro') : total >= 15 ? gx('Exploradora', 'Explorador') : 'Aprendiz';
  const stk = (on, art, name, sub) => `<div class="stk ${on ? 'on' : 'off'}">${art}<b>${name}</b><small>${sub}</small></div>`;
  const starIco = c => `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill="${c}" stroke="#1b9f72" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  const trophy = `<svg viewBox="0 0 24 24"><path d="${trophyPath}" fill="#ffc233" stroke="#e09a00" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  const section = ch => {
    const C = CH[ch];
    return `<h3 class="sec">Capítulo ${C.label}</h3>` + [
      stk(prog(C.intro).lesson, starIco('#34d399'), ...C.sticker()),
      ...C.figs.map(F => { const on = figStars(F.id) === 3; return stk(on, figSvg(F), F.short || cap(F.name), on ? '¡Completo!' : '3 estrellas'); }),
      stk((save[C.chal] || 0) >= 3, trophy, gx('Campeona', 'Campeón'), 'Desafío perfecto'),
    ].join('');
  };
  const el = frame(`<p class="rank"><span>${save.name ? save.name + ' · ' : ''}${rank} · ${total}/${max} ★</span></p><div class="album">${Object.keys(CH).map(section).join('')}</div>`);
  poli.say(`¡Mira tu álbum, ${save.name}! Completa las tres estrellas de cada isla para ganar sus stickers.`);
}

/* ---------- Taller libre ---------- */
function viewWorkshop() {
  const N = 6, GAP = 64, OFF = 40;
  const grid = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) grid.push([OFF + c * GAP, OFF + r * GAP]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const segInt = (a, b, c, d) => { const d1 = cross(a, b, c), d2 = cross(a, b, d), d3 = cross(c, d, a), d4 = cross(c, d, b); return d1 * d2 < 0 && d3 * d4 < 0; };
  let pts = [], closed = false;
  const el = frame(`<div class="board-wrap"><svg class="board" viewBox="0 0 400 400">
      <g id="fill"></g><g id="segs"></g>
      ${grid.map(([x, y], i) => `<g class="dot" data-i="${i}"><circle class="r" cx="${x}" cy="${y}" r="9" fill="#cfd5f5"/><circle cx="${x}" cy="${y}" r="28" fill="transparent"/></g>`).join('')}
    </svg>
    <div class="side-panel" style="--d:#5a3fe0"><div class="counter" id="cnt"><b id="cn">0</b> lados</div><div class="res" id="res"></div>
      <button class="btn ghost sm" id="clr">Borrar</button></div></div>`);
  const redraw = () => {
    const col = '#7c5cff';
    $('#segs', el).innerHTML = pts.map((p, i) => i === 0 ? '' : `<line x1="${pts[i - 1][0]}" y1="${pts[i - 1][1]}" x2="${p[0]}" y2="${p[1]}" stroke="${col}" stroke-width="9" stroke-linecap="round"/>`).join('') +
      (closed ? `<line x1="${pts[pts.length - 1][0]}" y1="${pts[pts.length - 1][1]}" x2="${pts[0][0]}" y2="${pts[0][1]}" stroke="${col}" stroke-width="9" stroke-linecap="round"/>` : '');
    $('#fill', el).innerHTML = closed ? `<polygon points="${ps(pts)}" fill="${col}" fill-opacity=".3"/>` : '';
    $$('.dot', el).forEach((d, i) => { const on = pts.some(p => p[0] === grid[i][0] && p[1] === grid[i][1]); const c = d.querySelector('.r'); c.setAttribute('fill', on ? col : '#cfd5f5'); c.setAttribute('r', on ? 14 : 9); });
    $('#cn').textContent = closed ? pts.length : Math.max(0, pts.length - 1);
  };
  const reset = () => { pts = []; closed = false; $('#res').innerHTML = ''; $('#cnt').classList.remove('full'); redraw(); };
  const validate = () => {
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[(i + n - 1) % n], b = pts[i], c = pts[(i + 1) % n];
      if (cross(a, b, c) === 0) return 'Hay tres puntos en línea recta. ¡Mueve alguno para hacer una esquina!';
    }
    for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (segInt(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return 'Tus líneas se cruzan. Un polígono no se cruza a sí mismo. ¡Inténtalo otra vez!';
    }
    return '';
  };
  $$('.dot', el).forEach((d, i) => d.onclick = () => {
    if (closed) return;
    const p = grid[i];
    if (pts.length >= 3 && p[0] === pts[0][0] && p[1] === pts[0][1]) {
      const err = validate();
      if (err) { sfx.bad(); poli.oops(err); reset(); return; }
      closed = true; redraw(); sfx.win(); confetti(70); $('#cnt').classList.add('full');
      const n = pts.length; let name = POLYNAMES[n] || `polígono de ${n} lados`;
      const dt = (a, b, c) => (b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1]);
      if (n === 4 && [0, 1, 2, 3].every(k => dt(pts[k], pts[(k + 1) % 4], pts[(k + 2) % 4]) === 0)) {
        const l = k => Math.hypot(pts[(k + 1) % 4][0] - pts[k][0], pts[(k + 1) % 4][1] - pts[k][1]);
        name = Math.abs(l(0) - l(1)) < 1 ? 'cuadrado' : 'rectángulo';
      }
      $('#res').innerHTML = `<div class="big-name">¡${cap(name)}!</div><span class="chip">${n} lados</span><span class="chip">${n} vértices</span>`;
      poli.cheer(`¡Creaste un ${name}! Tiene ${n} lados y ${n} vértices.`);
      return;
    }
    if (pts.some(q => q[0] === p[0] && q[1] === p[1])) { sfx.bad(); return; }
    if (pts.length >= 10) { poli.oops('¡Qué polígono tan grande! Toca el primer punto para cerrarlo.'); return; }
    pts.push(p); sfx.tap(pts.length); redraw();
    if (pts.length === 3) poli.say('Ya puedes cerrar la figura tocando el primer punto, ¡o seguir agregando más!');
  });
  $('#clr').onclick = () => { sfx.pop(); reset(); };
  poli.say('Toca los puntos para dibujar tu propio polígono. Para cerrarlo, vuelve a tocar el primer punto. ¡Yo te digo cómo se llama!');
}

/* =========================================================
   Arranque
   ========================================================= */
function initBg() {
  let h = '<div class="sun"></div>';
  for (let i = 0; i < 5; i++) h += `<div class="cloud" style="top:${6 + i * 14}%;animation-duration:${60 + i * 22}s;animation-delay:-${i * 19}s;transform:scale(${.8 + (i % 3) * .3})"></div>`;
  for (let i = 0; i < 12; i++) {
    const n = 3 + (i % 6), sz = 26 + (i * 17) % 50;
    h += `<svg class="poly" viewBox="0 0 100 100" style="left:${(i * 83) % 96}%;top:${(i * 37 + 10) % 78}%;width:${sz}px;animation-duration:${6 + (i % 5) * 2}s;animation-delay:-${i}s"><polygon points="${rs(n, -90, 44)}" fill="${COLORS[i % 6]}"/></svg>`;
  }
  $('#bg').innerHTML = h;
}
function updateVoiceIcon() {
  const on = save.voice || save.fx;
  $('#btnVoice').setAttribute('aria-label', on ? 'Silenciar' : 'Activar sonido');
  $('#icoVoice').innerHTML = on
    ? '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'
    : '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>';
}
$('#poli').innerHTML = POLI_SVG;
$('#btnBack').onclick = () => { if (stepBack) { sfx.pop(); stepBack(); return; } const t = backTarget(); if (t) go(t[0], t[1] || {}); };
$('#btnVoice').onclick = () => { const on = !(save.voice || save.fx); save.voice = save.fx = on; persist(); updateVoiceIcon(); if (!on) speechSynthesis?.cancel?.(); else sfx.pop(); };
$('#replay').onclick = () => { sfx.pop(); if (lastSay) { const v = save.voice; save.voice = true; speak(lastSay); save.voice = v; } };
/* al girar el celular, el mapa se rearma (solo si cambia de vertical a horizontal) */
let lastVert = isVertical(), rsT;
addEventListener('resize', () => {
  clearTimeout(rsT);
  rsT = setTimeout(() => { const v = isVertical(); if (v !== lastVert) { lastVert = v; if (cur.name === 'map') viewMap(); } }, 250);
});
(() => {
  const SEL = '.round[aria-label],.warr[aria-label],#replay';
  let timer = 0, fired = false, tip = null;
  const hide = () => { clearTimeout(timer); if (tip) { tip.remove(); tip = null; } };
  addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    const b = e.target.closest(SEL); if (!b) return;
    fired = false; hide();
    timer = setTimeout(() => {
      fired = true;
      const r = b.getBoundingClientRect(), label = b.getAttribute('aria-label');
      tip = document.createElement('div'); tip.className = 'ptip'; tip.textContent = label; document.body.appendChild(tip);
      const below = r.bottom + 60 < innerHeight;
      tip.style.left = Math.min(innerWidth - 8 - tip.offsetWidth, Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2)) + 'px';
      tip.style.top = (below ? r.bottom + 10 : r.top - 10 - tip.offsetHeight) + 'px';
      if (navigator.vibrate) navigator.vibrate(12);
      speak(label);
    }, 500);
  }, true);
  addEventListener('pointerup', () => { clearTimeout(timer); if (tip) setTimeout(hide, 1100); }, true);
  addEventListener('pointercancel', hide, true);
  addEventListener('click', e => { if (fired && e.target.closest(SEL)) { e.stopPropagation(); e.preventDefault(); fired = false; } }, true);
  addEventListener('contextmenu', e => { if (e.target.closest(SEL)) e.preventDefault(); });
})();

/* arranca cuando ya cargaron todos los scripts (js/numeros.js agrega el capítulo 3) */
const boot = () => {
  initBg(); updateVoiceIcon(); render();
  // modo sin internet (solo cuando la app está publicada, no al abrir el archivo directo)
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => { });
};
/* instalar la app: el navegador avisa cuando se puede (Chrome / Android) */
let installPrompt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });
document.readyState === 'loading' ? addEventListener('DOMContentLoaded', boot) : boot();
