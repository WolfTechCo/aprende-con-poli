/* Boceto Gel 3D (estilo elegido por la dueña el 22-11-2026) para las figuras del capítulo 5. No se carga en la app:
   figuras.js lo inyecta para tomar capturas (estilo G) y la página de propuesta lo usa tal cual.
   Receta (referencia privada `poli-referencias`, Tuts+ imagen 07 «gomitas»):
   - volumen con degradado radial (claro arriba a la izquierda, oscuro abajo a la derecha), un degradado por color;
   - contorno fino del mismo color más oscuro (nunca negro);
   - brillos blancos curvos arriba a la izquierda y un puntito;
   - ojos grandes y oscuros con dos brillos (uno grande arriba, uno chico abajo), mejillas difusas y boca chica;
   - sombra difusa en el suelo. Formas redondas, sin puntas.
   Los recipientes usan la misma receta pero sin cara (no se cuentan). Mismas funciones que boceto-kawaii.js. */
(function (root) {
  /* paleta: claro, base, oscuro, contorno */
  const PAL = {
    rojo: ['#ffb8c2', '#ff4d64', '#d42645', '#9c1532'], rosa: ['#ffd6e8', '#ff8cbf', '#e8558f', '#b02a66'],
    naranja: ['#ffdcae', '#ffa23d', '#e8730f', '#a84f05'], amarillo: ['#fff4b0', '#ffd23c', '#f0a800', '#a87200'],
    verde: ['#dcf8b8', '#7fd650', '#45a826', '#2a7414'], menta: ['#cdf6e8', '#5fd6b0', '#2fae86', '#1d7a5c'],
    azul: ['#d2ebff', '#5fb0ff', '#2f7fe0', '#1d55a8'], lila: ['#e9e0ff', '#a98cff', '#7a5ce0', '#4f36a8'],
    cafe: ['#f5d9b8', '#d9a06a', '#a86b38', '#6e4220'], crema: ['#fffcf3', '#f8eed8', '#e0cfaa', '#a08a60'],
    blanco: ['#ffffff', '#f3f5fb', '#d4d9ea', '#8f97b8'], oscuro: ['#8a809e', '#4a4060', '#2a2238', '#1a1426'],
    agua: ['#e2f6ff', '#9fdcff', '#5ab4ea', '#2a7fb8'], hoja: ['#cff4c6', '#72d66c', '#39a83a', '#237a26'],
    salmon: ['#ffd8c4', '#ff9a72', '#ec6a43', '#b0401f'], vainilla: ['#fffbe6', '#ffeeb0', '#f0d070', '#b09030'],
  };
  const DEFS = '<defs>' + Object.entries(PAL).map(([k, [l, b, d]]) => `<radialGradient id="kg-${k}" cx=".35" cy=".28" r=".92"><stop offset="0" stop-color="${l}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${d}"/></radialGradient>`).join('')
    + '<radialGradient id="kg-ojo" cx=".5" cy=".8" r=".75"><stop offset="0" stop-color="#7a4a6e"/><stop offset=".55" stop-color="#3a1f3a"/><stop offset="1" stop-color="#22121f"/></radialGradient>'
    + '<radialGradient id="kg-piso" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3a2a5a" stop-opacity=".3"/><stop offset="1" stop-color="#3a2a5a" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="kg-mej" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff5c8a" stop-opacity=".75"/><stop offset="1" stop-color="#ff5c8a" stop-opacity="0"/></radialGradient></defs>';
  const P = d => a => `<path d="${d}" ${a}/>`, C = (cx, cy, r) => a => `<circle cx="${cx}" cy="${cy}" r="${r}" ${a}/>`, E = (cx, cy, rx, ry) => a => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/>`, R = (x, y, w, h, rx) => a => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${a}/>`;
  const gel = (shape, p, w = 1.2) => shape(`fill="url(#kg-${p})" stroke="${PAL[p][3]}" stroke-width="${w}" stroke-linejoin="round"`);
  const arc = (d, w = 2, o = .85) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
  const dot = (x, y, r = .9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".9"/>`;
  const piso = (y, rx) => `<ellipse cy="${y}" rx="${rx}" ry="${(rx * .3).toFixed(1)}" fill="url(#kg-piso)"/>`;
  /* cara gel: ojos grandes con dos brillos, mejillas difusas, boca chica (s = tamaño, y = altura, sep = separación) */
  const face = (y = 0, s = 1, { sep = 3.4, boca = 'sonrisa' } = {}) => `<g transform="translate(0 ${y}) scale(${s})">`
    + [-sep, sep].map(x => `<ellipse cx="${x}" cy="-.8" rx="2.3" ry="2.7" fill="url(#kg-ojo)"/><circle cx="${x + .8}" cy="-1.9" r="1" fill="#fff"/><circle cx="${x - .7}" cy=".4" r=".45" fill="#fff"/>`).join('')
    + (boca === 'abierta' ? `<path d="M-1.3 1.9Q0 4.2 1.3 1.9Z" fill="#7a2a44"/><path d="M-.7 2.9Q0 3.8 .7 2.9" fill="#ff8fab"/>` : `<path d="M-1.2 2.1Q0 3.4 1.2 2.1" fill="none" stroke="#5a2a44" stroke-width=".9" stroke-linecap="round"/>`)
    + `<ellipse cx="${-sep - 2.4}" cy="2" rx="2.2" ry="1.4" fill="url(#kg-mej)"/><ellipse cx="${sep + 2.4}" cy="2" rx="2.2" ry="1.4" fill="url(#kg-mej)"/></g>`;
  const leaf = (x, y, r = -30, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${gel(P('M0 0Q4.5 -5.5 10 -1Q5 3.5 0 0Z'), 'hoja', .9)}${arc('M2.5 -1.4Q5 -3 7.5 -1.6', .9, .7)}</g>`;
  const VAR = ['rojo', 'azul', 'amarillo', 'menta', 'lila', 'naranja', 'rosa', 'verde'];

  /* ---------- cosas (centradas en 0,0, caben en unos 24 × 24) ---------- */
  const ITEM = {
    fruti: () => piso(11, 8) + gel(P('M0 11C-6 9 -11 2.5 -11 -2.5C-11 -7.5 -7.5 -10 -4 -9.3C-2.4 -9 -1.2 -8.4 0 -8.4C1.2 -8.4 2.4 -9 4 -9.3C7.5 -10 11 -7.5 11 -2.5C11 2.5 6 9 0 11Z'), 'rojo')
      + [[-6, 1], [6, 1], [-2.5, 6.5], [2.5, 6.5], [-7.5, -4], [7.5, -4]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx=".75" ry="1.05" fill="#ffe28a"/>`).join('')
      + leaf(-1, -9, -150, .8) + leaf(1, -9, -30, .8) + leaf(0, -9, -90, .7) + arc('M-8 -4Q-7 -7.5 -3.5 -7.6', 1.8) + face(0, .78),
    manzana: () => piso(11, 9) + gel(P('M0 -6.5C5 -11 11.5 -7 11 0C10.5 7 6 11 2.5 10.5C1 10.3 .6 9.8 0 9.8C-.6 9.8 -1 10.3 -2.5 10.5C-6 11 -10.5 7 -11 0C-11.5 -7 -5 -11 0 -6.5Z'), 'rojo')
      + `<path d="M0 -6.5Q.5 -10 2 -12" stroke="#8a5a2b" stroke-width="1.6" stroke-linecap="round" fill="none"/>` + leaf(1.5, -10.5, -25, .9) + arc('M-8.5 -2Q-7.5 -6.5 -3.5 -7.2', 2) + dot(-8.6, .6) + face(1.8, .82),
    cereza: () => piso(11, 8) + `<path d="M0 -3Q0 -9 4 -12.5" fill="none" stroke="#3f9e4f" stroke-width="1.6" stroke-linecap="round"/>` + leaf(4, -12.5, -10, .8)
      + gel(C(0, 2.5, 8.8), 'rojo') + arc('M-6 -1Q-5 -4.5 -1.5 -5.2', 1.8) + dot(-6.4, 1.6) + face(3.6, .72),
    naranja: () => piso(11, 9) + gel(C(0, 0, 10.8), 'naranja') + leaf(1, -10.5, -40, .85) + [[5, -4], [6.5, 1], [-6, 5], [3, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".55" fill="#ffd2a0" opacity=".8"/>`).join('') + arc('M-7.5 -3Q-6.5 -7 -2.5 -8', 2) + dot(-7.8, -.2) + face(1.2, .82),
    cupcake: () => piso(12, 9) + gel(P('M-8.6 2Q-8.6 1 -7.6 1L7.6 1Q8.6 1 8.6 2L6.8 10.6Q6.6 11.6 5.6 11.6L-5.6 11.6Q-6.6 11.6 -6.8 10.6Z'), 'menta')
      + `<path d="M-4 2L-3.4 11M0 2V11M4 2L3.4 11" stroke="#2fae86" stroke-width=".8" opacity=".7"/>`
      + gel(P('M-10 3Q-12 -2.5 -7 -4.5Q-7 -10 0 -10Q7 -10 7 -4.5Q12 -2.5 10 3Q5 5 0 3.6Q-5 5 -10 3Z'), 'rosa') + gel(C(0, -11, 2.6), 'rojo', 1) + dot(-.8, -11.8, .6)
      + arc('M-7 -3Q-6 -7 -2 -8', 1.6) + face(-1.4, .72),
    dona: () => piso(11, 10) + gel(P('M-10.8 0a10.8 10.8 0 1 0 21.6 0a10.8 10.8 0 1 0 -21.6 0ZM-3.1 0a3.1 3.1 0 1 0 6.2 0a3.1 3.1 0 1 0 -6.2 0Z'), 'cafe')
      + gel(P('M-9 -1.5Q-9.4 -8.8 -1 -9.2Q8.4 -9.4 9 -1Q9.3 2.2 7.3 1.2Q5.8 3.8 4.1 1.6A4.3 4.3 0 1 0 -4.1 1.6Q-6.2 4.1 -7.3 1.6Q-9.4 2.6 -9 -1.5Z'), 'rosa', 1)
      + [[-6, -4.5, '#fff4b0', 20], [-1.5, -7.2, '#a8e6ff', -40], [5, -5.8, '#b8ffb0', 60], [6.6, -1.5, '#ffffff', 10], [-7, -.4, '#d9c4ff', -60]].map(([x, y, c, r]) => `<rect x="${x - 1.3}" y="${y - .55}" width="2.6" height="1.1" rx=".55" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('')
      + arc('M-6.5 -6Q-4.5 -8 -1.5 -8.2', 1.4) + face(6.6, .58),
    macaron: i => { const p = ['rosa', 'menta', 'lila', 'amarillo', 'azul', 'naranja'][i % 6]; return piso(11, 10) + gel(E(0, 4.5, 10.8, 5.4), p) + gel(R(-9.6, -1.5, 19.2, 4, 2), 'vainilla', .9) + gel(E(0, -3.6, 10.8, 6), p) + arc('M-7 -6Q-4 -8.6 1 -8.6', 1.6) + face(-3, .66); },
    helado: i => { const p = ['rosa', 'menta', 'vainilla', 'lila', 'salmon', 'azul'][i % 6]; return gel(P('M-6.4 .5L6.4 .5L.8 14Q0 15.4 -.8 14Z'), 'cafe', 1) + `<path d="M-3.8 2.5L2 11M3.8 2.5L-2 11" stroke="#a86b38" stroke-width=".7" opacity=".8"/>`
      + gel(P('M-8.4 1.6Q-10.4 -2.4 -7.2 -4.6Q-8 -11.6 0 -11.6Q8 -11.6 7.2 -4.6Q10.4 -2.4 8.4 1.6Q4 3.8 0 1.8Q-4 3.8 -8.4 1.6Z'), p) + arc('M-5.5 -6Q-4.5 -9.4 -1 -9.8', 1.6) + face(-3.4, .66); },
    caramelo: i => { const p = VAR[i % 8]; return piso(10, 11) + gel(P('M-7 0L-12.6 -5.4Q-13.4 0 -12.6 5.4Z'), p, 1) + gel(P('M7 0L12.6 -5.4Q13.4 0 12.6 5.4Z'), p, 1) + gel(E(0, 0, 8.2, 7.4), p)
      + `<path d="M-4 -6.2Q.2 0 -4 6.2M2 -7Q6.2 0 2 7" fill="none" stroke="#fff" stroke-width="1.3" opacity=".5"/>` + arc('M-5.5 -3Q-4.5 -5.6 -1.8 -6.2', 1.4) + face(1, .62); },
    sushi: () => piso(10, 11) + gel(R(-11, -2, 22, 11.5, 5.5), 'blanco') + gel(P('M-11.6 -1Q-12 -7.5 -5 -7.8L5 -7.8Q12 -7.5 11.6 -1Q11 1.4 8 1L-8 1Q-11 1.4 -11.6 -1Z'), 'salmon')
      + `<path d="M-6 -6.6L-4 -.4M-1 -7L1 -.6M4 -6.8L6 -.6" stroke="#ffe1d2" stroke-width="1.2" stroke-linecap="round"/>` + gel(R(-2.4, -8, 4.8, 17.6, 1.2), 'oscuro', .8)
      + arc('M-8.5 -4.6Q-7 -6.6 -4 -6.8', 1.3) + `<g transform="translate(5.6 4.6)">${face(0, .5, { sep: 3 })}</g>`,
    pelota: i => { const p = VAR[i % 8]; return piso(11, 9) + gel(C(0, 0, 10.8), p) + `<path d="M-10.4 -2.4Q0 2.6 10.4 -2.4" fill="none" stroke="#fff" stroke-width="2.6" opacity=".9"/>` + gel(P('M5.6 -9L6.6 -6.6L9 -6.4L7.2 -4.8L7.8 -2.4L5.6 -3.6L3.4 -2.4L4 -4.8L2.2 -6.4L4.6 -6.6Z'), 'amarillo', .6) + arc('M-7.5 -4Q-6.5 -7.4 -3 -8.4', 1.8) + face(3.4, .76); },
    patito: () => piso(11, 10) + gel(P('M-11 2Q-11.4 10.2 -2 10.2L6 10.2Q12 9.4 11.4 3Q10.6 -1 4.4 .2Q-4 -1 -11 2Z'), 'amarillo') + gel(C(1, -4.6, 6.8), 'amarillo')
      + gel(P('M6.8 -4.2Q12.4 -4.8 12.4 -2.6Q11.6 -.4 6.6 -1.4Z'), 'naranja', .9) + `<path d="M-8 4.6Q-4 7.6 0 4.6" fill="none" stroke="#e0a800" stroke-width="1.1" stroke-linecap="round"/>`
      + arc('M-3.5 -8.5Q-2 -10.6 1 -10.8', 1.5) + face(-4.8, .6),
    osito: () => piso(11, 9) + gel(C(-7.2, -7.2, 3.7), 'cafe') + gel(C(7.2, -7.2, 3.7), 'cafe') + `<circle cx="-7.2" cy="-7.2" r="1.8" fill="#ffc8b0"/><circle cx="7.2" cy="-7.2" r="1.8" fill="#ffc8b0"/>`
      + gel(C(0, 0, 10), 'cafe') + gel(E(0, 4.2, 4.6, 3.4), 'crema', .8) + `<ellipse cx="0" cy="3" rx="1.5" ry="1.1" fill="#3a1f3a"/>` + arc('M-6.8 -3.6Q-5.6 -6.8 -2.4 -7.6', 1.6) + face(-.6, .76).replace(/<path d="M-1.2 2.1[^>]*>/, ''),
    dino: i => { const p = ['verde', 'menta', 'lila', 'naranja', 'azul', 'rosa'][i % 6]; return piso(11, 11)
      + [[-6, -8.4], [-1, -10.4], [4, -9.6]].map(([x, y]) => gel(P(`M${x - 3} ${y + 3}Q${x} ${y - 4} ${x + 3} ${y + 3}Z`), 'amarillo', .8)).join('')
      + gel(P('M-11.6 6Q-13.6 2 -10 -1Q-9 -8.6 0 -8.8Q10 -9 11 0Q11.6 7.6 6 9.6L-6 9.8Q-10 9.8 -11.6 6Z'), p) + gel(P('M-10.6 4Q-15 4.6 -14.6 1.4Q-14 -.6 -11 .8Z'), p, 1)
      + gel(P('M-4.6 8.3Q-4.2 4.7 1.8 4.5Q7.6 4.5 7.8 8.1Q7.6 9.5 6.6 9.5L-3.6 9.5Q-4.4 9.5 -4.6 8.3Z'), 'vainilla', .7) /* panza chica: parte desde abajo, dentro del cuerpo */ + gel(R(-6.6, 8, 4, 4, 2), p, 1) + gel(R(3.6, 8, 4, 4, 2), p, 1) + arc('M-6 -4Q-4.5 -7.4 -.8 -7.8', 1.6) + face(-1.2, .74, { boca: 'abierta' }); },
    pollito: () => piso(11, 9) + `<path d="M-3 9V12.2M3 9V12.2" stroke="#ff8a3d" stroke-width="1.4" stroke-linecap="round"/>` + gel(C(0, 1, 10.2), 'amarillo')
      + `<path d="M-1.6 -8.8Q0 -14 1.2 -9.2Q3 -13 3.6 -8.6" fill="none" stroke="#f0a800" stroke-width="1.4" stroke-linecap="round"/>` + gel(P('M-9.6 2.4Q-14 0 -12.4 5.4Q-10.4 6.6 -9 4.4Z'), 'amarillo', .9)
      + gel(P('M-1.6 2.6L1.6 2.6L0 4.8Z'), 'naranja', .7) + arc('M-6.8 -3.4Q-5.6 -6.6 -2.4 -7.4', 1.6) + face(-.6, .78).replace(/<path d="M-1.2 2.1[^>]*>/, ''),
    pez: i => { const p = ['naranja', 'azul', 'rosa', 'amarillo', 'menta', 'lila'][i % 6]; return gel(P('M7 0L13.2 -6.2Q12 0 13.2 6.2Z'), p, 1) + gel(E(-1, 0, 9.8, 7.8), p)
      + `<path d="M3 -5.2Q5 0 3 5.2" fill="none" stroke="#fff" stroke-width="1.2" opacity=".55"/>` + arc('M-7.5 -3Q-6 -6 -2.5 -6.4', 1.5) + `<g transform="translate(-3.4 .6)">${face(0, .6)}</g>`; },
    chinita: () => piso(10, 9) + gel(E(0, -6.6, 4.8, 4), 'oscuro') + gel(P('M-10.2 4A10.2 10.2 0 0 1 10.2 4Q10.2 10.2 0 10.2Q-10.2 10.2 -10.2 4Z'), 'rojo')
      + `<path d="M0 -3.6V10" stroke="#9c1532" stroke-width="1"/>` + [[-5.2, 1, 1.9], [5.2, 1, 1.9], [-6.2, 6.6, 1.5], [6.2, 6.6, 1.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3a2f4e"/>`).join('')
      + arc('M-7 0Q-6 -3 -2.8 -3.8', 1.6) + `<g transform="translate(0 -6.6) scale(.55)">${[-3.2, 3.2].map(x => `<ellipse cx="${x}" cy="-.6" rx="2.2" ry="2.6" fill="#fff"/><circle cx="${x + .3}" cy="-.3" r="1.3" fill="#22121f"/><circle cx="${x + .8}" cy="-1" r=".5" fill="#fff"/>`).join('')}<path d="M-1.4 2.2Q0 3.4 1.4 2.2" fill="none" stroke="#fff" stroke-width="1"/></g>`,
    crayon: i => { const p = VAR[i % 8]; return gel(R(-4.4, -9, 8.8, 20, 2.2), p, 1) + gel(R(-4.6, -3, 9.2, 8, 1.6), 'blanco', .8) + `<path d="M-4.6 -1H4.6M-4.6 3H4.6" stroke="${PAL[p][1]}" stroke-width="1"/>`
      + gel(P('M-4.4 -9L0 -16.4L4.4 -9Z'), p, 1) + arc('M-2.2 -6V8', 1.3, .6) + `<g transform="translate(0 1.2)">${face(0, .46, { sep: 3 })}</g>`; },
    auto: i => { const p = ['rojo', 'menta', 'amarillo', 'lila', 'azul'][i % 5]; return piso(9, 12) + gel(P('M-11.6 3.6Q-12 -.6 -8.2 -1.6L-5.4 -2.2Q-3.8 -8.2 2 -8.6Q7.6 -8.8 9.6 -2.4L10.8 -1.8Q13 -.6 12.6 3.4Q12.4 6.6 9.6 6.6L-9.2 6.6Q-11.4 6.6 -11.6 3.6Z'), p)
      + gel(P('M-3.6 -2.2Q-2.6 -6.6 1 -7L1 -2.2Z'), 'agua', .7) + gel(P('M2.8 -7Q6.8 -7 8.2 -2.2L2.8 -2.2Z'), 'agua', .7) + arc('M-5.8 -4.4Q-3.6 -8.6 1.6 -8.9', 1.4)
      + [-6.2, 7.4].map(x => gel(C(x, 6.6, 3.4), 'oscuro', .8) + `<circle cx="${x}" cy="6.6" r="1.4" fill="#e6e2f5"/>`).join('') + `<g transform="translate(5 1.4)">${face(0, .5, { sep: 3 })}</g>`; },
  };
  /* ---------- disposiciones ---------- */
  /* cosas vistas desde arriba: grandes si son pocas (hasta 3 en una fila), un poco menos si van en dos filas */
  const topSc = n => n <= 3 ? 1.5 : 1.28;
  const spots = (n, S = n <= 3 ? 36 : 33) => { const top = n <= 3 ? n : Math.ceil(n / 2), rows = n <= 3 ? [n] : [top, n - top];
    return rows.flatMap((m, r) => Array.from({ length: m }, (_, i) => [(i - (m - 1) / 2) * S, rows.length === 1 ? 0 : r ? 15 : -14])); };
  const row = (n, S) => Array.from({ length: n }, (_, i) => [(i - (n - 1) / 2) * S, 0]);
  const stand = (n, S = 30) => n <= 3 ? row(n, S).map(([x]) => [x, -4]) : [...row(Math.ceil(n / 2), S).map(([x]) => [x, -29]), ...row(n - Math.ceil(n / 2), S).map(([x]) => [x, -4])];
  /* ---------- recipientes gel (sin cara) ---------- */
  const shine = (x, y, w) => arc(`M${x} ${y}Q${x + w * .3} ${y - 6} ${x + w} ${y - 7}`, 3, .7);
  const CONT = {
    pocillo: { lay: spots, back: c => piso(32, 50) + gel(E(0, 0, 54, 33), c || 'rosa', 1.8) + `<ellipse rx="45" ry="25" fill="#fff6fa" opacity=".9"/>` + shine(-40, -10, 20) },
    plato: { lay: spots, back: c => piso(32, 50) + gel(E(0, 0, 54, 33), 'blanco', 1.8) + `<ellipse rx="44" ry="25" fill="none" stroke="${PAL[c || 'azul'][1]}" stroke-width="2.4" stroke-dasharray=".1 6" stroke-linecap="round"/>` + shine(-40, -10, 20) },
    bandeja: { lay: spots, back: c => piso(34, 52) + gel(R(-62, -9, 10, 18, 5), c || 'menta', 1.4) + gel(R(52, -9, 10, 18, 5), c || 'menta', 1.4) + gel(R(-56, -33, 112, 64, 18), c || 'menta', 1.8) + `<rect x="-47" y="-26" width="94" height="50" rx="12" fill="#ffffff" opacity=".5"/>` + shine(-48, -18, 22) },
    caja: { lay: spots, back: c => piso(34, 52) + gel(R(-55, -33, 110, 66, 12), c || 'rosa', 1.8) + `<rect x="-48" y="-27" width="96" height="54" rx="8" fill="#fff6fa" opacity=".95"/>` + Array.from({ length: 8 }, (_, i) => `<circle cx="${-44 + i * 12.5}" cy="-30" r="1.4" fill="#fff"/>`).join('') },
    nido: { lay: spots, back: () => piso(33, 52) + gel(E(0, 0, 55, 33), 'cafe', 1.8) + `<ellipse rx="44" ry="23" fill="#b9814c" opacity=".85"/><path d="M-50 -6Q-25 6 0 -2T50 -6M-46 10Q-20 18 6 12T46 10M-40 -18Q-10 -10 20 -18" fill="none" stroke="#f0c48a" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>` },
    pecera: { lay: spots, back: () => piso(35, 48) + gel(E(0, 0, 55, 34), 'agua', 1.8) + `<path d="M-40 26Q-38 16 -34 26M-30 27Q-27 14 -24 27" fill="none" stroke="#39a83a" stroke-width="2.4" stroke-linecap="round"/><circle cx="38" cy="-20" r="3" fill="#fff" opacity=".8"/><circle cx="44" cy="-12" r="2" fill="#fff" opacity=".8"/>` + shine(-44, -6, 22) },
    hoja: { lay: spots, back: () => piso(33, 52) + gel(P('M-58 4Q-40 -36 4 -32Q48 -30 58 0Q44 32 0 32Q-42 32 -58 4Z'), 'hoja', 1.8) + `<path d="M-50 3Q0 -2 52 0M-22 2L-30 -18M-22 2L-28 20M10 0L4 -22M10 0L6 22" fill="none" stroke="#237a26" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>` + shine(-42, -8, 24) },
    isla: { lay: spots, back: () => piso(34, 54) + gel(E(0, 4, 57, 30), 'cafe', 1.6) + gel(E(0, -2, 55, 27), 'hoja', 1.6) + [[-40, -8, '#fff4b0'], [42, 4, '#ffd6e8'], [30, -16, '#e9e0ff']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${c}" stroke="#fff" stroke-width="1"/>`).join('') + shine(-40, -12, 22) },
    pista: { lay: n => { if (n <= 2) return row(n, 46).map(([x]) => [x, 0]); const t = Math.ceil(n / 2), S = n <= 4 ? 46 : 35; return [...row(t, S).map(([x]) => [x, -15]), ...row(n - t, S).map(([x]) => [x, 16])]; },
      is: n => n <= 4 ? 1.55 : 1.2, back: () => piso(36, 54) + gel(R(-57, -34, 114, 68, 18), 'lila', 1.8) + `<rect x="-50" y="-27" width="100" height="54" rx="12" fill="#f4efff" opacity=".7"/><path d="M-47 2H47" stroke="#fff" stroke-width="3" stroke-dasharray="9 7" stroke-linecap="round"/>` },
    canasto: { is: n => n <= 3 ? 1.35 : 1.22, lay: n => stand(n, n <= 3 ? 33 : 30), back: () => piso(42, 52) + `<path d="M-48 10Q-48 -54 0 -54Q48 -54 48 10" fill="none" stroke="#a86b38" stroke-width="5" stroke-linecap="round"/><path d="M-46 4Q-44 -48 0 -51" fill="none" stroke="#f5d9b8" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`,
      front: () => gel(P('M-54 10L54 10L47 38Q46 42 41 42L-41 42Q-46 42 -47 38Z'), 'cafe', 1.8) + `<path d="M-51 22H51M-49 32H49M-30 10L-27 42M-10 10L-9 42M10 10L9 42M30 10L27 42" stroke="#a86b38" stroke-width="1.4" opacity=".8"/>` + gel(R(-57, 6, 114, 9, 4.5), 'cafe', 1.4) + shine(-50, 22, 18) },
    frasco: { is: n => n <= 3 ? 1.35 : 1.15, lay: n => spots(n, n <= 3 ? 33 : 29).map(([x, y]) => [x, y + 3]), back: () => piso(38, 50) + `<path d="M-50 -26Q-54 -26 -54 -20L-54 30Q-54 36 -48 36L48 36Q54 36 54 30L54 -20Q54 -26 50 -26Z" fill="#eaf8ff" stroke="#5ab4ea" stroke-width="1.8"/>`,
      front: () => `<path d="M-50 -26Q-54 -26 -54 -20L-54 30Q-54 36 -48 36L48 36Q54 36 54 30L54 -20Q54 -26 50 -26Z" fill="#cdeeff" opacity=".2"/>` + arc('M-46 -16V26', 4, .8) + arc('M46 18V26', 3, .6) + gel(R(-44, -36, 88, 12, 5), 'rosa', 1.6) },
    tina: { is: n => n <= 3 ? 1.35 : 1.22, lay: n => stand(n, n <= 3 ? 33 : 30), back: () => piso(46, 56),
      front: () => gel(P('M-56 8L56 8Q56 40 30 40L-30 40Q-56 40 -56 8Z'), 'blanco', 1.8) + `<path d="M-38 40L-42 46M38 40L42 46" stroke="#8f97b8" stroke-width="4" stroke-linecap="round"/>` + gel(R(-56, 4, 112, 8, 4), 'agua', 1.2) + [[-42, 6, 5], [-32, 4, 3.5], [38, 7, 4.5], [48, 4, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#bfe3ff" stroke-width="1"/>`).join('') + shine(-48, 22, 18) },
    juguetes: { is: n => n <= 3 ? 1.35 : 1.22, lay: n => stand(n, n <= 3 ? 33 : 30), back: () => piso(46, 56),
      front: () => gel(R(-56, 8, 112, 34, 10), 'lila', 1.8) + `<text x="0" y="32" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="14" fill="#fff" opacity=".9">★ ★ ★</text>` + gel(R(-58, 5, 116, 8, 4), 'lila', 1.4) + shine(-50, 22, 16) },
    tarro: { is: n => n <= 4 ? 1.55 : 1.3, lay: n => row(n, n > 4 ? 15 : 20).map(([x]) => [x, -14]), back: () => piso(42, 46),
      front: () => gel(P('M-48 2L48 2L44 36Q43.5 40 39 40L-39 40Q-43.5 40 -44 36Z'), 'amarillo', 1.8) + gel(R(-51, -2, 102, 9, 4.5), 'amarillo', 1.4) + [[-26, 22], [0, 26], [26, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="#fff" opacity=".7"/>`).join('') + shine(-42, 24, 16) },
    soporte: { lay: n => row(n, n > 5 ? 16 : 18).map(([x]) => [x, -8]), back: () => piso(42, 56),
      front: () => gel(R(-56, 6, 112, 30, 12), 'rosa', 1.8) + `<path d="M-56 16H56" stroke="#fff" stroke-width="2" opacity=".6"/>` + Array.from({ length: 9 }, (_, i) => `<circle cx="${-48 + i * 12}" cy="28" r="2" fill="#fff" opacity=".8"/>`).join('') + shine(-50, 22, 16) },
  };
  /* tarjetas (opción A): color pastel elegido para que la cosa resalte y no se pierda en el cielo celeste */
  const CARD = { crema: ['#fff6d9', '#f0cf7a'], menta: ['#e2f8ec', '#8fd6ad'], lila: ['#f0e8ff', '#b9a0f0'], durazno: ['#ffeadb', '#f3b88e'], rosa: ['#ffe8f1', '#f2a2c2'] };
  const THEMES = [
    { k: 'fruti', one: 'frutilla', pl: 'frutillas', f: 1, cont: 'pocillo', conts: 'pocillos', card: 'menta', grp: 'Frutas' },
    { k: 'manzana', one: 'manzana', pl: 'manzanas', f: 1, cont: 'canasto', conts: 'canastos', card: 'menta', grp: 'Frutas' },
    { k: 'cereza', one: 'cereza', pl: 'cerezas', f: 1, cont: 'plato', conts: 'platos', card: 'crema', grp: 'Frutas' },
    { k: 'naranja', one: 'naranja', pl: 'naranjas', f: 1, cont: 'pocillo', conts: 'fruteras', card: 'lila', grp: 'Frutas', contColor: 'azul' },
    { k: 'cupcake', one: 'cupcake', pl: 'cupcakes', f: 0, cont: 'bandeja', conts: 'bandejas', card: 'crema', grp: 'Dulces' },
    { k: 'dona', one: 'dona', pl: 'donas', f: 1, cont: 'caja', conts: 'cajas', card: 'lila', grp: 'Dulces' },
    { k: 'macaron', one: 'macarón', pl: 'macarones', f: 0, cont: 'caja', conts: 'cajas', card: 'crema', grp: 'Dulces', contColor: 'menta' },
    { k: 'helado', one: 'helado', pl: 'helados', f: 0, cont: 'soporte', conts: 'soportes', card: 'lila', grp: 'Dulces' },
    { k: 'caramelo', one: 'dulce', pl: 'dulces', f: 0, cont: 'frasco', conts: 'frascos', card: 'crema', grp: 'Dulces' },
    { k: 'sushi', one: 'sushi', pl: 'sushis', f: 0, cont: 'bandeja', conts: 'bandejas', card: 'crema', grp: 'Comidas del mundo', contColor: 'rojo' },
    { k: 'auto', one: 'autito', pl: 'autitos', f: 0, cont: 'pista', conts: 'pistas', card: 'crema', grp: 'Juguetes' },
    { k: 'pelota', one: 'pelota', pl: 'pelotas', f: 1, cont: 'juguetes', conts: 'cajas de juguetes', card: 'crema', grp: 'Juguetes' },
    { k: 'patito', one: 'patito', pl: 'patitos', f: 0, cont: 'tina', conts: 'tinas', card: 'lila', grp: 'Juguetes' },
    { k: 'osito', one: 'osito', pl: 'ositos', f: 0, cont: 'pocillo', conts: 'cojines', card: 'menta', grp: 'Juguetes', contColor: 'lila' },
    { k: 'dino', one: 'dinosaurio', pl: 'dinosaurios', f: 0, cont: 'isla', conts: 'islas', card: 'crema', grp: 'Animalitos' },
    { k: 'pollito', one: 'pollito', pl: 'pollitos', f: 0, cont: 'nido', conts: 'nidos', card: 'lila', grp: 'Animalitos' },
    { k: 'pez', one: 'pez', pl: 'peces', f: 0, cont: 'pecera', conts: 'peceras', card: 'crema', grp: 'Animalitos' },
    { k: 'chinita', one: 'chinita', pl: 'chinitas', f: 1, cont: 'hoja', conts: 'hojas', card: 'crema', grp: 'Animalitos' },
    { k: 'crayon', one: 'crayón', pl: 'crayones', f: 0, cont: 'tarro', conts: 'tarros', card: 'lila', grp: 'Útiles' },
  ];
  const IS = 1.22;
  function group(th, n, st = 'A', i0 = 0) {
    const C = CONT[th.cont], pts = C.lay(n), sc = C.is ? C.is(n) : C.lay === spots ? topSc(n) : IS;
    const items = pts.map(([x, y], i) => `<g class="bf-it" style="--d:${i}" transform="translate(${x} ${y})"><g class="bf-a"><g transform="scale(${sc})">${ITEM[th.k](i + i0)}</g></g></g>`).join('');
    const inner = (C.back ? C.back(th.contColor) : '') + items + (C.front ? C.front(th.contColor) : '');
    const [bg, bd] = CARD[th.card];
    return `<rect x="-62" y="-44" width="124" height="94" rx="20" fill="${bd}" opacity=".55"/><rect x="-62" y="-48" width="124" height="94" rx="20" fill="${bg}" stroke="${bd}" stroke-width="2.4"/>${inner}`;
  }
  const GW = 132, GH = 104;
  function grp(sizes, th, { cols = 3, cls = '', tap = false } = {}) {
    const rows = Math.ceil(sizes.length / cols), top = tap ? -26 : 0, H = rows * GH + 6 - top, W = cols * GW;
    const g = sizes.map((n, i) => { const cx = GW / 2 + (i % cols) * GW, cy = GH / 2 + 3 + Math.floor(i / cols) * GH;
      return `<g class="pl bf-g" data-i="${i}" style="--g:${i}" transform="translate(${cx} ${cy})">${group(th, n, 'A', i)}${tap ? '<text class="plc" y="-52" text-anchor="middle"></text><rect x="-64" y="-50" width="128" height="100" fill="transparent"/>' : ''}</g>`; }).join('');
    return `<svg viewBox="-2 ${top - 2} ${W + 4} ${H + 4}" class="grp mg ${cls}" style="--vw:${W + 4};--vh:${H + 4}">${DEFS}${g}</svg>`;
  }
  /* ---------- bicicletas gel (2 ruedas), sobres, filas ---------- */
  function bikes(k, cols = Math.min(k, 3)) {
    const W = 68, H = 50, BC = ['rosa', 'azul', 'menta', 'amarillo', 'lila', 'naranja'];
    const one = p => `<g class="bf-it" style="--d:0"><g class="bf-a"><g transform="translate(32 42)">${piso(0, 30)}</g>`
      + [13, 51].map(x => gel(C(x, 29, 11), 'oscuro', 1.2) + `<circle cx="${x}" cy="29" r="6.4" fill="#f3f1fb" stroke="#8a809e" stroke-width="1"/>`).join('')
      + `<path d="M13 29L25 13H43L51 29M25 13L32 29H13M32 29L43 13" fill="none" stroke="${PAL[p][3]}" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 29L25 13H43L51 29M25 13L32 29H13M32 29L43 13" fill="none" stroke="${PAL[p][1]}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 12H41" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>`
      + gel(R(19, 6, 12, 5, 2.5), 'lila', 1) + `<path d="M43 13l-2 -7h7" fill="none" stroke="#4a4060" stroke-width="3" stroke-linecap="round"/>` + gel(P('M47 3L59 3L57 12L49 12Z'), 'vainilla', 1) + `<circle cx="51" cy="2.6" r="2.4" fill="#ff8cbf"/><circle cx="55.4" cy="2.2" r="2" fill="#5fb0ff"/>`
      + `<g transform="translate(13 29)">${face(0, .7, { sep: 2.8 })}</g><g transform="translate(51 29)">${face(0, .7, { sep: 2.8 })}</g></g></g>`;
    return `<svg viewBox="0 -2 ${cols * W} ${Math.ceil(k / cols) * H + 4}" class="grp mg bikes" style="--vw:${cols * W};--vh:${Math.ceil(k / cols) * H + 4}">${DEFS}${Array.from({ length: k }, (_, i) => `<g class="bf-g" style="--g:${i}" transform="translate(${(i % cols) * W} ${Math.floor(i / cols) * H})">${one(BC[i % 6])}</g>`).join('')}</svg>`;
  }
  function sobres(k, t, cols = Math.min(k, 3)) {
    const W = 92, h = t === 10 ? 50 : 32, H = h + 14, SC = ['rosa', 'azul', 'lila', 'menta', 'amarillo', 'naranja'];
    const one = (p, i) => `<g class="bf-it" style="--d:0"><g class="bf-a">${gel(R(2, 2, 84, h + 4, 11), p, 1.6)}${arc('M8 8Q14 4.5 24 4.5', 2, .7)}${Array.from({ length: t }, (_, j) => { const x = 10 + (j % 5) * 15.2, y = 7 + Math.floor(j / 5) * 21; return gel(R(x, y, 12, 16, 3), 'blanco', .9) + `<path transform="translate(${x + 6} ${y + 8}) scale(.42)" d="M0 -9L2.6 -3L9 -2.6L4 1.8L5.6 8.4L0 5L-5.6 8.4L-4 1.8L-9 -2.6L-2.6 -3Z" fill="${PAL[['amarillo', 'rosa', 'azul', 'verde', 'lila'][(j + i) % 5]][1]}"/>`; }).join('')}</g></g>`;
    return `<svg viewBox="0 0 ${cols * W} ${Math.ceil(k / cols) * H}" class="grp mg sobres" style="--vw:${cols * W};--vh:${Math.ceil(k / cols) * H}">${DEFS}${Array.from({ length: k }, (_, i) => `<g class="bf-g" style="--g:${i}" transform="translate(${(i % cols) * W} ${Math.floor(i / cols) * H})">${one(SC[i % 6], i)}</g>`).join('')}</svg>`;
  }
  function filas(r, c, { band = false, col = 'rosa' } = {}) {
    const S = 27, P2 = 8, p = PAL[col] ? col : 'rosa';
    const bands = band ? Array.from({ length: r }, (_, i) => gel(R(2, P2 / 2 + i * S + 1, c * S + P2 - 4, S - 2, 13), 'vainilla', 1.2)).join('') : '';
    const dots = Array.from({ length: r * c }, (_, i) => `<g transform="translate(${P2 / 2 + S / 2 + (i % c) * S} ${P2 / 2 + S / 2 + Math.floor(i / c) * S})">${gel(C(0, 0, 10.4), p, 1.2)}${arc('M-6.5 -3Q-5.5 -6 -2.5 -6.8', 1.6)}${face(1, .62)}</g>`).join('');
    return `<svg viewBox="0 0 ${c * S + P2} ${r * S + P2}" class="grp mg arr" style="--c:${c};--r:${r}">${DEFS}${bands}${dots}</svg>`;
  }
  /* ---------- dibujos de los cuentos (gel) ---------- */
  const STORY = {
    pajaro: () => gel(P('M8 24Q4 12 16 9Q30 6 33 18Q35 30 21 32Q11 32 8 24Z'), 'azul') + gel(P('M12 21Q2 13 3 25Q8 29 13 26Z'), 'agua', 1) + gel(P('M27 20Q37 12 37 24Q32 29 27 25Z'), 'agua', 1)
      + gel(P('M18.5 24L21 27L23.5 24Z'), 'amarillo', .8) + `<g transform="translate(21 20)">${face(0, .9)}</g><path d="M17 32V36M25 32V36" stroke="#ff8a3d" stroke-width="1.8" stroke-linecap="round"/>` + arc('M12 15Q14 11 19 10', 1.6),
    calcetin: () => [[6, 'lila'], [21, 'rosa']].map(([x, p]) => gel(P(`M${x} 5Q${x} 3 ${x + 2} 3H${x + 9}Q${x + 11} 3 ${x + 11} 5V23Q${x + 11} 35 ${x} 35Q${x - 5} 35 ${x - 5} 30Q${x - 5} 25 ${x} 25Z`), p) + `<path d="M${x} 8H${x + 11}M${x} 12H${x + 11}" stroke="#fff" stroke-width="1.8" opacity=".8"/><g transform="translate(${x + 3} 27)">${face(0, .6)}</g>`).join(''),
    /* mano: palma redonda con 4 dedos gorditos y pulgar, todos del mismo largo aproximado y redondeados */
    mano: () => gel(P('M10 22Q9 11 11 9.5Q13 8 14.5 10L15 16L15.5 7Q16 4.5 18.3 4.5Q20.6 4.5 20.8 7L21 15L21.5 6Q22 3.4 24.3 3.6Q26.6 3.8 26.6 6.4L26.4 15.5L27.6 8.6Q28.2 6.4 30.2 6.8Q32.2 7.2 32 9.6L31 24Q34 19 36 19.6Q38 20.4 36.6 23.4L31.6 32Q29 37 21.5 37Q12 37 10 29Z'), 'salmon', 1.2)
      + `<path d="M15.2 16V18M21 15V17M26.4 15.5V17.5" stroke="#ec6a43" stroke-width=".8" stroke-linecap="round" opacity=".5"/><g transform="translate(21 27)">${face(0, .85)}</g>` + arc('M12.4 13Q12.6 10.6 14 10.4', 1.3),
    estrella: () => gel(P('M20 3.5Q21 3 22 4.2L25.6 12.6Q26 13.6 27.2 13.7L36 14.6Q37.4 15 36.6 16.4L30 22.4Q29.2 23.2 29.4 24.2L31.4 33Q31.4 34.6 30 34.2L22 29.8Q21 29.3 20 29.8L12 34.2Q10.6 34.6 10.6 33L12.6 24.2Q12.8 23.2 12 22.4L5.4 16.4Q4.6 15 6 14.6L14.8 13.7Q16 13.6 16.4 12.6Z'), 'amarillo', 1.2) + `<g transform="translate(21 21)">${face(0, .9)}</g>` + arc('M15 14Q17 9 19.5 7.4', 1.6),
    caja: () => Array.from({ length: 10 }, (_, i) => gel(R(7 + i * 2.7, 4 + (i % 2) * 2, 2.4, 16, 1), VAR[i % 8], .5)).join('') + gel(R(5, 16, 30, 20, 5), 'amarillo', 1.2) + `<text x="20" y="24.6" font-size="6.6" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">10</text><g transform="translate(20 30)">${face(0, .7)}</g>`,
    canasto: () => [[11, 14], [17, 11], [23, 14], [29, 11], [14, 8], [26, 8]].map(([x, y]) => gel(C(x, y + 4, 5), 'rojo', .9)).join('') + gel(P('M4 18H36L32 36H8Z'), 'cafe', 1.2) + `<path d="M6 24H34M14 18L13 36M26 18L27 36" stroke="#a86b38" stroke-width=".9" opacity=".8"/><text x="20" y="34" font-size="6.6" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">10</text><g transform="translate(20 27)">${face(0, .62)}</g>`,
  };
  const STORY_KEYS = ['pajaro', 'calcetin', 'mano', 'estrella', 'caja', 'canasto'];
  const storyIco = k => `<svg class="bf-st" viewBox="0 0 40 40" width="1.15em" height="1.15em">${DEFS}${STORY[k]()}</svg>`;
  root.BOCETO_GEL = { THEMES, CARD, CONT, ITEM, PAL, grp, group, bikes, sobres, filas, storyIco, STORY_KEYS, DEFS, GW, GH };
})(typeof window !== 'undefined' ? window : module.exports);
