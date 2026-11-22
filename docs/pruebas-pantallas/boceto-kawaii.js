/* Boceto kawaii de la fase 2 de la entrega 3.1 (figuras del capítulo 5). No se carga en la app: figuras.js lo inyecta
   para tomar capturas y la página de propuesta lo usa tal cual.
   Receta de relieve («3D falso», ver investigación en PLAN.md): sombra suave abajo, base de color con borde de un tono
   más oscuro (no negro), un degradado que oscurece el borde de abajo, brillo blanco arriba a la izquierda y carita chica.
   Las caritas son simples y del mismo tamaño en todo el grupo, para no distraer al contar. */
(function (root) {
  const INK = '#3a2d5c';
  /* degradado de volumen (uno solo, igual en todos los dibujos: ids repetidos con la misma definición no chocan) */
  const DEFS = `<defs><radialGradient id="kw-sh" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#2a1650" stop-opacity=".06"/><stop offset="1" stop-color="#2a1650" stop-opacity=".26"/></radialGradient></defs>`;
  const vol = (shape, c, d, w = 1.5) => shape(`fill="${c}" stroke="${d}" stroke-width="${w}" stroke-linejoin="round"`) + shape('fill="url(#kw-sh)"');
  const hl = (x, y, rx, ry, r = -30, o = .8) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="#fff" opacity="${o}"/>`;
  const shadow = (y, rx) => `<ellipse cy="${y}" rx="${rx}" ry="${(rx * .3).toFixed(1)}" fill="#2a1650" opacity=".14"/>`;
  /* carita: ojos con brillo, mejillas y boca; s = tamaño, y = altura */
  const face = (y = 0, s = 1, mouth = 'smile') => `<g transform="translate(0 ${y}) scale(${s})"><ellipse cx="-3.2" cy="-.6" rx="1.35" ry="1.6" fill="${INK}"/><ellipse cx="3.2" cy="-.6" rx="1.35" ry="1.6" fill="${INK}"/><circle cx="-2.75" cy="-1.2" r=".55" fill="#fff"/><circle cx="3.65" cy="-1.2" r=".55" fill="#fff"/>`
    + (mouth === 'o' ? `<ellipse cx="0" cy="2" rx="1" ry="1.2" fill="${INK}"/>` : `<path d="M-1.6 1.5Q0 3.1 1.6 1.5" fill="none" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>`)
    + `<ellipse cx="-5.3" cy="1.4" rx="1.6" ry="1" fill="#ff7aa2" opacity=".55"/><ellipse cx="5.3" cy="1.4" rx="1.6" ry="1" fill="#ff7aa2" opacity=".55"/></g>`;
  const P = d => a => `<path d="${d}" ${a}/>`, C = (cx, cy, r) => a => `<circle cx="${cx}" cy="${cy}" r="${r}" ${a}/>`, E = (cx, cy, rx, ry) => a => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/>`, R = (x, y, w, h, rx) => a => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${a}/>`;
  const leaf = (x, y, r = -30, c = '#5ad67d', d = '#2f9e57') => `<g transform="translate(${x} ${y}) rotate(${r})">${vol(P('M0 0Q4 -5 9 -1Q4 3 0 0Z'), c, d, 1.1)}</g>`;

  /* ---------- cosas (centradas en 0,0; caben en unos 24 × 24) ---------- */
  const ITEM = {
    fruti: () => shadow(11, 8) + vol(P('M-10 -3Q-11 -10 -3 -9Q0 -8 0 -8Q0 -8 3 -9Q11 -10 10 -3Q9 6 0 11Q-9 6 -10 -3Z'), '#ff5a6e', '#d8344c') + [[-5, 3], [5, 3], [0, 7], [-7, -3], [7, -3]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx=".7" ry="1" fill="#ffe28a"/>`).join('') + vol(P('M-7 -9L-3 -12L0 -9L3 -12L7 -9L3 -7L0 -8L-3 -7Z'), '#5ad67d', '#2f9e57', 1) + hl(-5.5, -4.5, 2.4, 1.4) + face(.5, .85),
    manzana: () => shadow(11, 9) + vol(P('M0 -6Q6 -11 10.5 -4Q13 4 6 10Q3 12 0 10Q-3 12 -6 10Q-13 4 -10.5 -4Q-6 -11 0 -6Z'), '#ff4d5e', '#cf2e45') + `<path d="M0 -6Q1 -10 2 -12" stroke="#8a5a2b" stroke-width="1.6" stroke-linecap="round" fill="none"/>` + leaf(2, -10, -20) + hl(-5.5, -3.5, 2.6, 1.5) + face(1.5),
    cereza: () => shadow(11, 8) + `<path d="M0 -1Q0 -8 4 -12" fill="none" stroke="#3f9e4f" stroke-width="1.6" stroke-linecap="round"/>` + leaf(4, -12, -10) + vol(C(0, 3, 8.6), '#ff3d68', '#c9244e') + hl(-3.6, -.6, 2.4, 1.3) + face(4, .72),
    cupcake: () => shadow(12, 9) + vol(P('M-8.5 2L8.5 2L6.5 11.5L-6.5 11.5Z'), '#5ec8f2', '#2f98c4') + `<path d="M-4 2.5L-3.4 11M0 2.5V11M4 2.5L3.4 11" stroke="#2f98c4" stroke-width=".9"/>` + vol(P('M-10 3Q-12 -3 -6.5 -4.5Q-6 -10 0 -9.5Q6 -10 6.5 -4.5Q12 -3 10 3Z'), '#ffb3cf', '#e6789f') + vol(C(0, -10.5, 2.6), '#ff3d68', '#c9244e', 1) + hl(-5, -4, 2.4, 1.2) + face(-1.2, .75),
    dona: () => shadow(11, 10) + vol(P('M-10.5 0a10.5 10.5 0 1 0 21 0a10.5 10.5 0 1 0 -21 0ZM-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z'), '#f2b866', '#c98a3a') + `<path d="M-8.6 -1.5Q-9 -8.4 -1 -8.8Q8 -9 8.6 -1Q9 2 7 1Q5.5 3.5 4 1.6A4.2 4.2 0 1 0 -4 1.6Q-6 4 -7 1.5Q-9 2.5 -8.6 -1.5Z" fill="#ff8fbf" stroke="#e0609a" stroke-width="1"/>` + [[-6, -4, '#ffe28a', 20], [-1, -7, '#7fe0ff', -40], [5, -5.5, '#9dff9a', 60], [6.5, -1, '#fff', 10], [-6.5, 0, '#c9a6ff', -60]].map(([x, y, c, r]) => `<rect x="${x - 1.3}" y="${y - .5}" width="2.6" height="1" rx=".5" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('') + hl(-4, -6, 2, 1) + face(6.6, .6),
    caramelo: (i) => { const c = ['#ff7ab8', '#7fd0ff', '#b48bff', '#ffcf4d', '#6fe0a8', '#ff9f5a'][i % 6]; return shadow(10, 11) + vol(P('M-7 0L-12.5 -5.5L-12.5 5.5Z'), c, '#00000033', 1) + vol(P('M7 0L12.5 -5.5L12.5 5.5Z'), c, '#00000033', 1) + vol(E(0, 0, 8, 7.2), c, '#00000040') + `<path d="M-4 -6Q0 0 -4 6M2 -7Q6 0 2 7" fill="none" stroke="#fff" stroke-width="1.4" opacity=".55"/>` + hl(-3.5, -3.5, 2, 1.1) + face(1, .62); },
    helado: (i) => { const c = ['#ffb3cf', '#9ae6c3', '#ffe08a', '#c9b3ff', '#ffc09a', '#a8dcff'][i % 6]; return vol(P('M-6 1L6 1L0 14Z'), '#f2b866', '#c98a3a') + `<path d="M-3.5 3L2 11M3.5 3L-2 11" stroke="#c98a3a" stroke-width=".8"/>` + vol(P('M-8 2Q-10 -2 -7 -4Q-8 -11 0 -11Q8 -11 7 -4Q10 -2 8 2Q4 4 0 2Q-4 4 -8 2Z'), c, '#00000030') + hl(-3.5, -7, 2.2, 1.2) + face(-3.4, .7); },
    pelota: (i) => { const c = ['#ff5a6e', '#4ea8ff', '#ffc233', '#5ad67d', '#b48bff', '#ff8a3d'][i % 6]; return shadow(11, 9) + vol(C(0, 0, 10.5), c, '#00000038') + `<path d="M-10 -2Q0 3 10 -2" fill="none" stroke="#fff" stroke-width="2.6" opacity=".9"/><circle cx="6" cy="-6" r="1.8" fill="#fff" opacity=".9"/>` + hl(-5, -5, 2.6, 1.4) + face(3.2, .8); },
    patito: () => shadow(11, 10) + vol(P('M-11 2Q-11 10 -2 10L6 10Q12 9 11 3Q10 -1 4 0Q-4 -1 -11 2Z'), '#ffd23f', '#e0a800') + vol(C(1, -4.5, 6.6), '#ffd23f', '#e0a800') + vol(P('M7 -4Q12 -4.5 12 -2.5Q11 -.5 6.5 -1.5Z'), '#ff8a3d', '#e0651a', 1) + `<path d="M-8 4Q-4 7 0 4" fill="none" stroke="#e0a800" stroke-width="1.2" stroke-linecap="round"/>` + hl(-2.5, -8, 2, 1.1) + face(-4.5, .62),
    osito: () => shadow(11, 9) + vol(C(-7, -7, 3.6), '#c98a5a', '#9a6236') + vol(C(7, -7, 3.6), '#c98a5a', '#9a6236') + `<circle cx="-7" cy="-7" r="1.7" fill="#ffc0a8"/><circle cx="7" cy="-7" r="1.7" fill="#ffc0a8"/>` + vol(C(0, 0, 9.8), '#d9a06a', '#9a6236') + `<ellipse cx="0" cy="4" rx="4.2" ry="3.2" fill="#f5d6b2"/><ellipse cx="0" cy="2.6" rx="1.4" ry="1" fill="${INK}"/>` + hl(-4.5, -4.5, 2.2, 1.2) + face(-.5, .75),
    pollito: () => shadow(11, 9) + `<path d="M-3 9V12M3 9V12" stroke="#ff8a3d" stroke-width="1.4" stroke-linecap="round"/>` + vol(C(0, 1, 10), '#ffe066', '#e0b400') + vol(P('M-2 -9Q0 -14 1 -9Q3 -13 3.4 -8.5'), 'none', '#e0b400', 1.2) + vol(P('M-1.6 2.4L1.6 2.4L0 4.6Z'), '#ff8a3d', '#e0651a', .8) + vol(P('M-10 2Q-14 0 -12 5Q-10 6 -9 4Z'), '#ffd23f', '#e0b400', 1) + hl(-4.5, -4, 2.4, 1.3) + face(-.6, .8, 'none').replace(/<path[^>]*>/, ''),
    pez: (i) => { const c = ['#ff8a3d', '#4ea8ff', '#ff6ba8', '#ffc233', '#6fe0a8', '#b48bff'][i % 6]; return vol(P('M7 0L13 -6Q12 0 13 6Z'), c, '#00000030', 1.2) + vol(E(-1, 0, 9.5, 7.5), c, '#00000038') + `<path d="M3 -5Q5 0 3 5" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/>` + hl(-5, -3.5, 2.2, 1.2) + `<g transform="translate(-3 .5)">${face(0, .62)}</g>`; },
    mariquita: () => shadow(10, 9) + vol(E(0, -6.5, 4.6, 3.8), '#4a3a6e', '#2b2050') + vol(P('M-10 4A10 10 0 0 1 10 4Q10 10 0 10Q-10 10 -10 4Z'), '#ff4d5e', '#cf2e45') + `<path d="M0 -4V10" stroke="#cf2e45" stroke-width="1"/>` + [[-5, 1, 1.8], [5, 1, 1.8], [-6, 6.5, 1.4], [6, 6.5, 1.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#4a3a6e"/>`).join('') + hl(-5, -1.5, 2.2, 1.1) + `<g transform="translate(0 -6.5) scale(.5)"><ellipse cx="-3.2" cy="-.6" rx="1.5" ry="1.8" fill="#fff"/><ellipse cx="3.2" cy="-.6" rx="1.5" ry="1.8" fill="#fff"/><circle cx="-3" cy="-.4" r=".9" fill="${INK}"/><circle cx="3.4" cy="-.4" r=".9" fill="${INK}"/><path d="M-1.6 1.8Q0 3.2 1.6 1.8" fill="none" stroke="#fff" stroke-width="1"/></g>`,
    empa: () => shadow(9, 11) + vol(P('M-12 5A12 12 0 0 1 12 5Q12 7.5 9 7.5L-9 7.5Q-12 7.5 -12 5Z'), '#f6b955', '#c9822a') + [-150, -125, -100, -75, -50, -25].map(a => { const r = a * Math.PI / 180, x = Math.cos(r) * 11.2, y = 5 + Math.sin(r) * 11.2; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="#e9a443" stroke="#c9822a" stroke-width=".5"/>`; }).join('') + hl(-5, -1, 2.4, 1.2) + face(2.4, .72),
    sopa: () => shadow(11, 10) + vol(C(0, 0, 10.8), '#f2a93b', '#c97b1a') + `<circle r="7" fill="#f7c36a" opacity=".7"/>` + hl(-5, -5, 2.4, 1.3) + face(.6, .8),
    lapiz: (i) => { const c = ['#ff5a6e', '#ffb703', '#5ad67d', '#4ea8ff', '#b48bff', '#ff8a3d'][i % 6]; return vol(R(-4.6, -12, 9.2, 21, 2.4), c, '#00000038', 1.2) + vol(R(-4.6, -17, 9.2, 5.6, 2.4), '#ffaacb', '#e0779f', 1.1) + `<rect x="-4.6" y="-12.4" width="9.2" height="1.6" fill="#d9dcf5"/>` + vol(P('M-4.6 8.6L0 16.5L4.6 8.6Z'), '#f9dcb0', '#c99a5a', 1.1) + `<path d="M-1.6 13.6L0 16.5L1.6 13.6Z" fill="${INK}"/>` + hl(-2.2, -6, 1, 3, 0, .7) + face(-1.5, .6); },
  };
  /* ---------- recipientes (también kawaii: redondos, con relieve y colores alegres; sin cara, para no contarlos) ---------- */
  const spots = (n, S = 29) => { const top = n <= 3 ? n : Math.ceil(n / 2), rows = n <= 3 ? [n] : [top, n - top];
    return rows.flatMap((m, r) => Array.from({ length: m }, (_, i) => [(i - (m - 1) / 2) * S, rows.length === 1 ? 0 : r ? 14 : -13])); };
  const stand = n => n <= 3 ? row(n, 30).map(([x]) => [x, -4]) : [...row(Math.ceil(n / 2), 30).map(([x]) => [x, -29]), ...row(n - Math.ceil(n / 2), 30).map(([x]) => [x, -4])];
  const row = (n, S) => Array.from({ length: n }, (_, i) => [(i - (n - 1) / 2) * S, 0]);
  const CONT = {
    pocillo: { lay: spots, back: c => shadow(31, 46) + vol(E(0, 0, 54, 33), c || '#ffb3cf', '#e0789f', 2.4) + `<ellipse rx="45" ry="25" fill="#fff4f8"/>` + hl(-32, -18, 9, 3, -14, .7) },
    plato: { lay: spots, back: c => shadow(31, 48) + vol(E(0, 0, 54, 33), '#ffffff', c || '#8cc6ff', 3) + `<ellipse rx="42" ry="24" fill="none" stroke="${c || '#8cc6ff'}" stroke-width="1.6" stroke-dasharray="1 6" stroke-linecap="round" opacity=".9"/>` },
    bandeja: { lay: spots, back: c => shadow(33, 50) + vol(R(-56, -33, 112, 64, 18), c || '#9fe3c7', '#4fb58d', 2.4) + `<rect x="-47" y="-26" width="94" height="50" rx="12" fill="#ffffff" opacity=".55"/><rect x="-62" y="-8" width="9" height="16" rx="4.5" fill="${c || '#9fe3c7'}" stroke="#4fb58d" stroke-width="2"/><rect x="53" y="-8" width="9" height="16" rx="4.5" fill="${c || '#9fe3c7'}" stroke="#4fb58d" stroke-width="2"/>` },
    caja: { lay: spots, back: () => shadow(33, 50) + vol(R(-55, -33, 110, 66, 12), '#ffd1e3', '#e0789f', 2.4) + `<rect x="-48" y="-27" width="96" height="54" rx="8" fill="#fff4f8"/>` + Array.from({ length: 8 }, (_, i) => `<circle cx="${-44 + i * 12.5}" cy="-30" r="1.6" fill="#fff"/>`).join('') },
    nido: { lay: spots, back: () => shadow(32, 50) + vol(E(0, 0, 55, 33), '#d9a06a', '#9a6236', 2.4) + `<ellipse rx="44" ry="23" fill="#b9814c"/><path d="M-50 -6Q-25 6 0 -2T50 -6M-46 10Q-20 18 6 12T46 10M-40 -18Q-10 -10 20 -18" fill="none" stroke="#f0c48a" stroke-width="2" stroke-linecap="round" opacity=".8"/>` },
    pecera: { lay: spots, back: () => shadow(34, 46) + vol(E(0, 0, 55, 34), '#cdeeff', '#6fb8e8', 2.6) + `<path d="M-50 -10Q0 -2 50 -10" fill="none" stroke="#9ad6ff" stroke-width="2"/><circle cx="38" cy="-20" r="3" fill="#fff" opacity=".8"/><circle cx="44" cy="-12" r="2" fill="#fff" opacity=".8"/><path d="M-40 26Q-38 16 -34 26M-30 27Q-27 14 -24 27" fill="none" stroke="#5ad67d" stroke-width="2.4" stroke-linecap="round"/>` + hl(-36, -18, 8, 3, -20, .6) },
    hoja: { lay: spots, back: () => shadow(32, 50) + vol(P('M-58 4Q-40 -36 4 -32Q48 -30 58 0Q44 32 0 32Q-42 32 -58 4Z'), '#8be08f', '#3fae55', 2.4) + `<path d="M-50 3Q0 -2 52 0M-22 2L-30 -18M-22 2L-28 20M10 0L4 -22M10 0L6 22" fill="none" stroke="#3fae55" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>` },
    canasto: { lay: stand, back: () => shadow(42, 50) + `<path d="M-48 10Q-48 -54 0 -54Q48 -54 48 10" fill="none" stroke="#b9814c" stroke-width="5" stroke-linecap="round"/>`,
      front: () => vol(P('M-54 10L54 10L47 38Q46 42 41 42L-41 42Q-46 42 -47 38Z'), '#e6b27a', '#9a6236', 2.4) + `<path d="M-51 22H51M-49 32H49M-30 10L-27 42M-10 10L-9 42M10 10L9 42M30 10L27 42" stroke="#b9814c" stroke-width="1.6"/>` + vol(R(-57, 6, 114, 9, 4.5), '#d9a06a', '#9a6236', 2) },
    frasco: { lay: n => spots(n, 27).map(([x, y]) => [x, y + 3]), back: () => shadow(36, 48) + `<path d="M-50 -26Q-54 -26 -54 -20L-54 30Q-54 36 -48 36L48 36Q54 36 54 30L54 -20Q54 -26 50 -26Z" fill="#e6f6ff" stroke="#8cc6ff" stroke-width="2.4"/>`,
      front: () => `<path d="M-50 -26Q-54 -26 -54 -20L-54 30Q-54 36 -48 36L48 36Q54 36 54 30L54 -20Q54 -26 50 -26Z" fill="#cdeeff" opacity=".22"/><path d="M-46 -16V26" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>` + vol(R(-44, -36, 88, 12, 5), '#ff8fbf', '#e0609a', 2) + `<path d="M-38 -30H38" stroke="#fff" stroke-width="1.6" stroke-dasharray="2 4" stroke-linecap="round"/>` },
    tina: { lay: stand, back: () => shadow(44, 52),
      front: () => vol(P('M-56 8L56 8Q56 40 30 40L-30 40Q-56 40 -56 8Z'), '#ffffff', '#8cc6ff', 2.6) + `<path d="M-38 40L-42 46M38 40L42 46" stroke="#8cc6ff" stroke-width="4" stroke-linecap="round"/>` + vol(R(-56, 4, 112, 8, 4), '#bfe6ff', '#8cc6ff', 1.6) + [[-42, 6, 5], [-32, 4, 3.5], [38, 7, 4.5], [48, 4, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#bfe3ff" stroke-width="1"/>`).join('') },
    juguetes: { lay: stand, back: () => shadow(44, 52),
      front: () => vol(R(-56, 8, 112, 34, 10), '#c9a6ff', '#7d55d6', 2.4) + `<text x="0" y="32" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="14" fill="#fff" opacity=".9">★ ★ ★</text>` + vol(R(-58, 5, 116, 8, 4), '#b48bff', '#7d55d6', 1.6) },
    estuche: { lay: n => row(n, n > 5 ? 15 : 18).map(([x]) => [x, -10]), back: c => shadow(36, 52) + vol(R(-56, -4, 112, 40, 14), c || '#7fd0ff', '#3a9ad6', 2.4),
      front: c => vol(R(-56, 6, 112, 30, 14), c || '#7fd0ff', '#3a9ad6', 2.4) + `<path d="M-46 12H46" stroke="#ffd23f" stroke-width="2.6" stroke-dasharray="3 2"/><circle cx="49" cy="12" r="3.6" fill="#ffd23f" stroke="#e0a800" stroke-width="1"/>` + hl(-38, 20, 7, 2.2, 0, .5) },
    soporte: { lay: n => row(n, n > 5 ? 16 : 18).map(([x]) => [x, -8]), back: () => shadow(36, 52),
      front: () => vol(R(-56, 6, 112, 30, 12), '#ff9fc6', '#e0609a', 2.4) + `<path d="M-56 16H56" stroke="#fff" stroke-width="2" opacity=".6"/>` + Array.from({ length: 9 }, (_, i) => `<circle cx="${-48 + i * 12}" cy="28" r="2" fill="#fff" opacity=".8"/>`).join('') },
  };
  /* tarjetas (estilo A): color pastel elegido para que la cosa resalte y la tarjeta no se pierda en el cielo celeste de la app */
  const CARD = { crema: ['#fff6d9', '#f0cf7a'], menta: ['#e2f8ec', '#8fd6ad'], lila: ['#f0e8ff', '#b9a0f0'], durazno: ['#ffeadb', '#f3b88e'], rosa: ['#ffe8f1', '#f2a2c2'] };
  /* temas: cosa + recipiente + tarjeta (mismos campos que MTH de la app) */
  const THEMES = [
    { k: 'fruti', one: 'frutilla', pl: 'frutillas', f: 1, cont: 'pocillo', conts: 'pocillos', card: 'menta', grp: 'Frutas' },
    { k: 'manzana', one: 'manzana', pl: 'manzanas', f: 1, cont: 'canasto', conts: 'canastos', card: 'menta', grp: 'Frutas' },
    { k: 'cereza', one: 'cereza', pl: 'cerezas', f: 1, cont: 'plato', conts: 'platos', card: 'crema', grp: 'Frutas' },
    { k: 'cupcake', one: 'cupcake', pl: 'cupcakes', f: 0, cont: 'bandeja', conts: 'bandejas', card: 'crema', grp: 'Dulces' },
    { k: 'dona', one: 'dona', pl: 'donas', f: 1, cont: 'caja', conts: 'cajas', card: 'lila', grp: 'Dulces' },
    { k: 'caramelo', one: 'dulce', pl: 'dulces', f: 0, cont: 'frasco', conts: 'frascos', card: 'crema', grp: 'Dulces' },
    { k: 'helado', one: 'helado', pl: 'helados', f: 0, cont: 'soporte', conts: 'soportes', card: 'lila', grp: 'Dulces' },
    { k: 'pelota', one: 'pelota', pl: 'pelotas', f: 1, cont: 'juguetes', conts: 'cajas de juguetes', card: 'crema', grp: 'Juguetes' },
    { k: 'patito', one: 'patito', pl: 'patitos', f: 0, cont: 'tina', conts: 'tinas', card: 'lila', grp: 'Juguetes' },
    { k: 'osito', one: 'osito', pl: 'ositos', f: 0, cont: 'pocillo', conts: 'cojines', card: 'menta', grp: 'Juguetes', contColor: '#c9b3ff' },
    { k: 'pollito', one: 'pollito', pl: 'pollitos', f: 0, cont: 'nido', conts: 'nidos', card: 'lila', grp: 'Animalitos' },
    { k: 'pez', one: 'pez', pl: 'peces', f: 0, cont: 'pecera', conts: 'peceras', card: 'crema', grp: 'Animalitos' },
    { k: 'mariquita', one: 'chinita', pl: 'chinitas', f: 1, cont: 'hoja', conts: 'hojas', card: 'crema', grp: 'Animalitos' },
    { k: 'empa', one: 'empanada', pl: 'empanadas', f: 1, cont: 'bandeja', conts: 'bandejas', card: 'lila', grp: 'De Chile', contColor: '#ffd1a8' },
    { k: 'sopa', one: 'sopaipilla', pl: 'sopaipillas', f: 1, cont: 'plato', conts: 'platos', card: 'lila', grp: 'De Chile' },
    { k: 'lapiz', one: 'lápiz', pl: 'lápices', f: 0, cont: 'estuche', conts: 'estuches', card: 'crema', grp: 'Útiles' },
  ];
  const IS = 1.22; // tamaño de cada cosa dentro de su recipiente
  function group(th, n, st = 'A', i0 = 0) {
    const C = CONT[th.cont], pts = C.lay(n);
    const items = pts.map(([x, y], i) => `<g class="bf-it" style="--d:${i}" transform="translate(${x} ${y})"><g class="bf-a"><g transform="scale(${IS})">${ITEM[th.k](i + i0)}</g></g></g>`).join('');
    const inner = (C.back ? C.back(th.contColor) : '') + items + (C.front ? C.front(th.contColor) : '');
    if (st !== 'A') return inner;
    const [bg, bd] = CARD[th.card];
    return `<rect x="-62" y="-44" width="124" height="94" rx="20" fill="${bd}" opacity=".55"/><rect x="-62" y="-48" width="124" height="94" rx="20" fill="${bg}" stroke="${bd}" stroke-width="2.4"/>${inner}`;
  }
  const GW = 132, GH = 104;
  /* reemplazo de grpSvg (mismos parámetros y medidas --vw/--vh que la app) */
  function grp(sizes, th, { cols = 3, cls = '', tap = false } = {}, st = 'A') {
    const rows = Math.ceil(sizes.length / cols), top = tap ? -26 : 0, H = rows * GH + 6 - top, W = cols * GW;
    const g = sizes.map((n, i) => { const cx = GW / 2 + (i % cols) * GW, cy = GH / 2 + 3 + Math.floor(i / cols) * GH;
      return `<g class="pl bf-g" data-i="${i}" style="--g:${i}" transform="translate(${cx} ${cy})">${group(th, n, st, i)}${tap ? '<text class="plc" y="-52" text-anchor="middle"></text><rect x="-64" y="-50" width="128" height="100" fill="transparent"/>' : ''}</g>`; }).join('');
    return `<svg viewBox="-2 ${top - 2} ${W + 4} ${H + 4}" class="grp mg ${cls}" style="--vw:${W + 4};--vh:${H + 4}">${DEFS}${g}</svg>`;
  }

  /* ---------- bicicletas kawaii (2 ruedas) y alternativas para la tabla del 2 ---------- */
  const BIKE_C = ['#ff7ab8', '#4ea8ff', '#5ad67d', '#ffb703', '#b48bff', '#ff8a3d'];
  const wheel = (x, y) => vol(C(x, y, 11), '#fff', INK, 3) + `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="#d9dcf5" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2.6" fill="${INK}"/>`;
  const bikeOne = (c, i) => `<g class="bf-it" style="--d:${i}"><g class="bf-a">${shadow(41, 30).replace('<ellipse', '<ellipse cx="32"')}${wheel(13, 29)}${wheel(51, 29)}<path d="M13 29L25 13H43L51 29M25 13L32 29H13M32 29L43 13" fill="none" stroke="${c}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>${vol(R(19, 6, 12, 5, 2.5), '#7a5cc4', INK, 1)}<path d="M43 13l-2 -7h7" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>${vol(P('M47 4L58 4L56 12L49 12Z'), '#ffe08a', '#e0a800', 1.2)}<circle cx="51" cy="3" r="2.4" fill="#ff7ab8"/><circle cx="55" cy="2.6" r="2" fill="#7fd0ff"/><g transform="translate(13 29) scale(.55)">${face(0, 1)}</g><g transform="translate(51 29) scale(.55)">${face(0, 1)}</g></g></g>`;
  function bikes(k, cols = Math.min(k, 3)) {
    const W = 68, H = 48;
    return `<svg viewBox="0 -2 ${cols * W} ${Math.ceil(k / cols) * H + 4}" class="grp mg bikes" style="--vw:${cols * W};--vh:${Math.ceil(k / cols) * H + 4}">${DEFS}${Array.from({ length: k }, (_, i) => `<g class="bf-g" style="--g:${i}" transform="translate(${(i % cols) * W} ${Math.floor(i / cols) * H})">${bikeOne(BIKE_C[i % 6], 0)}</g>`).join('')}</svg>`;
  }
  /* sobres de láminas kawaii (5 o 10 láminas con estrellitas) */
  function sobres(k, t, cols = Math.min(k, 3)) {
    const W = 92, h = t === 10 ? 50 : 32, H = h + 14, COL = ['#ffb3cf', '#a8dcff', '#c9b3ff', '#9ae6c3', '#ffe08a', '#ffc09a'];
    const one = (c, i) => `<g class="bf-it" style="--d:0"><g class="bf-a">${vol(R(2, 2, 84, h + 4, 11), c, '#00000030', 2)}${hl(14, 8, 6, 1.8, 0, .6)}${Array.from({ length: t }, (_, j) => { const x = 10 + (j % 5) * 15.2, y = 7 + Math.floor(j / 5) * 21; return vol(R(x, y, 12, 16, 3), '#ffffff', '#c7a6ff', 1.2) + `<path transform="translate(${x + 6} ${y + 8}) scale(.42)" d="M0 -9L2.6 -3L9 -2.6L4 1.8L5.6 8.4L0 5L-5.6 8.4L-4 1.8L-9 -2.6L-2.6 -3Z" fill="${['#ffc233', '#ff7ab8', '#4ea8ff', '#5ad67d', '#b48bff'][(j + i) % 5]}"/>`; }).join('')}</g></g>`;
    return `<svg viewBox="0 0 ${cols * W} ${Math.ceil(k / cols) * H}" class="grp mg sobres" style="--vw:${cols * W};--vh:${Math.ceil(k / cols) * H}">${DEFS}${Array.from({ length: k }, (_, i) => `<g class="bf-g" style="--g:${i}" transform="translate(${(i % cols) * W} ${Math.floor(i / cols) * H})">${one(COL[i % 6], i)}</g>`).join('')}</svg>`;
  }
  /* filas (arreglos): dulces redondos en filas, en vez de puntos */
  function filas(r, c, { band = false, col = '#ff7ab8', dk = '#e0609a' } = {}) {
    const S = 27, P2 = 8;
    const bands = band ? Array.from({ length: r }, (_, i) => vol(R(2, P2 / 2 + i * S + 1, c * S + P2 - 4, S - 2, 13), '#fff3c4', '#ffd36b', 1.6)).join('') : '';
    const dots = Array.from({ length: r * c }, (_, i) => `<g transform="translate(${P2 / 2 + S / 2 + (i % c) * S} ${P2 / 2 + S / 2 + Math.floor(i / c) * S})">${vol(C(0, 0, 10), col, dk, 1.8)}${hl(-3.5, -3.5, 2.4, 1.3)}${face(1, .62)}</g>`).join('');
    return `<svg viewBox="0 0 ${c * S + P2} ${r * S + P2}" class="grp mg arr" style="--c:${c};--r:${r}">${DEFS}${bands}${dots}</svg>`;
  }
  /* ---------- dibujos de los cuentos (kawaii) ---------- */
  const STORY = {
    pajaro: () => vol(P('M8 24Q4 12 16 9Q30 6 33 18Q35 30 21 32Q11 32 8 24Z'), '#7fd0ff', '#3a9ad6') + vol(P('M12 21Q2 13 3 25Q8 29 13 26Z'), '#bfe8ff', '#3a9ad6', 1.2) + vol(P('M27 20Q37 12 37 24Q32 29 27 25Z'), '#bfe8ff', '#3a9ad6', 1.2) + vol(P('M18.5 23L21 26L23.5 23Z'), '#ffb703', '#e09a00', .8) + `<g transform="translate(21 19)">${face(0, .9)}</g><path d="M17 32V36M25 32V36" stroke="#ff8a3d" stroke-width="1.8" stroke-linecap="round"/>` + hl(14, 13, 3, 1.5),
    calcetin: () => [[5, '#c9a6ff', '#7d55d6'], [20, '#ffb3cf', '#e0609a']].map(([x, c, d]) => vol(P(`M${x} 5H${x + 11}V23Q${x + 11} 35 ${x} 35Q${x - 5} 35 ${x - 5} 30Q${x - 5} 25 ${x} 25Z`), c, d) + `<path d="M${x} 10H${x + 11}M${x} 14H${x + 11}" stroke="#fff" stroke-width="2"/><g transform="translate(${x + 4} 26) scale(.6)">${face(0, 1)}</g>`).join(''),
    mano: () => vol(P('M11 36V20Q11 17 13.5 17Q16 17 16 20V9Q16 6 18.5 6Q21 6 21 9V7Q21 4 23.5 4Q26 4 26 7V10Q26 7 28.5 7Q31 7 31 10V26Q31 36 21 36Z'), '#ffd2b0', '#e09a7a') + vol(P('M11 22Q5 16 4.5 20Q4 24 11 30'), '#ffd2b0', '#e09a7a') + `<g transform="translate(21 27)">${face(0, .85)}</g>` + hl(14, 12, 1.2, 3, 0, .7),
    estrella: () => vol(P('M20 3L25 14L37 15L28 23L31 35L20 29L9 35L12 23L3 15L15 14Z'), '#ffd23f', '#e0a800', 1.8) + `<g transform="translate(20 21)">${face(0, .9)}</g>` + hl(15, 13, 2.4, 1.2),
    caja: () => Array.from({ length: 10 }, (_, i) => vol(R(7 + i * 2.7, 4 + (i % 2) * 2, 2.4, 16, 1), ['#ff5a6e', '#ffb703', '#5ad67d', '#4ea8ff', '#b48bff'][i % 5], '#00000030', .5)).join('') + vol(R(5, 16, 30, 20, 5), '#ffd23f', '#e0a800', 1.6) + `<text x="20" y="25" font-size="7" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">10</text><g transform="translate(20 30)">${face(0, .7)}</g>`,
    canasto: () => [[11, 14], [17, 11], [23, 14], [29, 11], [14, 8], [26, 8]].map(([x, y]) => vol(C(x, y + 4, 5), '#ff4d5e', '#cf2e45', 1)).join('') + vol(P('M4 18H36L32 36H8Z'), '#e6b27a', '#9a6236', 1.6) + `<path d="M6 24H34M14 18L13 36M26 18L27 36" stroke="#b9814c" stroke-width="1"/><text x="20" y="34" font-size="7" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">10</text><g transform="translate(20 27)">${face(0, .65)}</g>`,
  };
  const STORY_KEYS = ['pajaro', 'calcetin', 'mano', 'estrella', 'caja', 'canasto'];
  const storyIco = k => `<svg class="bf-st" viewBox="0 0 40 40" width="1.15em" height="1.15em">${DEFS}${STORY[k]()}</svg>`;
  root.BOCETO_KW = { THEMES, CARD, CONT, ITEM, grp, group, bikes, sobres, filas, storyIco, STORY_KEYS, DEFS, GW, GH };
})(typeof window !== 'undefined' ? window : module.exports);
