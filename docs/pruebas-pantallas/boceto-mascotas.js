/* Boceto de las mascotas de la entrega 4A (fase 4A-3, parte 1), estilo Gel 3D (molde boceto-gel.js).
   No se carga en la app: la página de propuesta y las capturas lo usan tal cual; en la fase 4A-4 se pasa a la app.
   Cada mascota tiene 5 etapas: 0 huevo · 1 cría · 2 joven · 3 grande · 4 brillante. Su evolución cuenta el contenido:
   - Tortugono (polígonos): el caparazón suma lados (triángulos → cuadrados → pentágonos y hexágono → octágonos dorados).
   - Cubúho (figuras 3D): cuerpo de cubo; crecen plumas de prisma, penachos de cono y botones de esfera.
   - Cienpiecito / Milpiés (números): un anillo por cifra con los colores de la app (U verde, D naranjo, C azul, M dorado).
   - Pulpatrón (patrones): tentáculos con un patrón AB → ABC → que crece (1, 2, 3 pintas) → arcoíris.
   - Chinitabla (multiplicación): pintas en grupos iguales: de 2, de 5 y de 10 en cada ala.
   Marco de dibujo: los pies tocan y = 0; la figura grande cabe en unos 80 × 50. */
(function (root) {
  const PAL = {
    rojo: ['#ffb8c2', '#ff4d64', '#d42645', '#9c1532'], rosa: ['#ffd6e8', '#ff8cbf', '#e8558f', '#b02a66'],
    naranja: ['#ffdcae', '#ffa23d', '#e8730f', '#a84f05'], amarillo: ['#fff4b0', '#ffd23c', '#f0a800', '#a87200'],
    verde: ['#dcf8b8', '#7fd650', '#45a826', '#2a7414'], menta: ['#cdf6e8', '#5fd6b0', '#2fae86', '#1d7a5c'],
    azul: ['#d2ebff', '#5fb0ff', '#2f7fe0', '#1d55a8'], lila: ['#e9e0ff', '#a98cff', '#7a5ce0', '#4f36a8'],
    crema: ['#fffcf3', '#f8eed8', '#e0cfaa', '#a08a60'], oscuro: ['#8a809e', '#4a4060', '#2a2238', '#1a1426'],
    vainilla: ['#fffbe6', '#ffeeb0', '#f0d070', '#b09030'], hoja: ['#cff4c6', '#72d66c', '#39a83a', '#237a26'],
    oro: ['#fffbe0', '#ffd84a', '#f2a900', '#b07800'],
    /* colores de posición del capítulo 3 (js/numeros.js: PV) para que Cienpiecito «hable» igual que las lecciones */
    pu: ['#d2f7e8', '#22c58b', '#169a6a', '#0d6e4a'], pd: ['#ffe3d0', '#ff8a3d', '#e0651a', '#a8460a'],
    pc: ['#dcecff', '#4ea8ff', '#2a7fd6', '#1d5aa0'],
  };
  const DEFS = '<defs>' + Object.entries(PAL).map(([k, [l, b, d]]) => `<radialGradient id="km-${k}" cx=".35" cy=".28" r=".92"><stop offset="0" stop-color="${l}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${d}"/></radialGradient>`).join('')
    + '<radialGradient id="km-ojo" cx=".5" cy=".8" r=".75"><stop offset="0" stop-color="#7a4a6e"/><stop offset=".55" stop-color="#3a1f3a"/><stop offset="1" stop-color="#22121f"/></radialGradient>'
    + '<radialGradient id="km-piso" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3a2a5a" stop-opacity=".3"/><stop offset="1" stop-color="#3a2a5a" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="km-mej" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff5c8a" stop-opacity=".75"/><stop offset="1" stop-color="#ff5c8a" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="km-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3a0" stop-opacity=".95"/><stop offset=".55" stop-color="#ffe680" stop-opacity=".45"/><stop offset="1" stop-color="#ffe680" stop-opacity="0"/></radialGradient>'
    + '<filter id="km-sombra"><feColorMatrix type="matrix" values="0 0 0 0 .2  0 0 0 0 .26  0 0 0 0 .45  0 0 0 .55 0"/></filter></defs>';

  /* ---------- piezas Gel (iguales al molde) ---------- */
  const P = d => a => `<path d="${d}" ${a}/>`, C = (cx, cy, r) => a => `<circle cx="${cx}" cy="${cy}" r="${r}" ${a}/>`,
    E = (cx, cy, rx, ry) => a => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/>`, R = (x, y, w, h, rx) => a => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${a}/>`;
  const gel = (shape, p, w = 1.2) => shape(`fill="url(#km-${p})" stroke="${PAL[p][3]}" stroke-width="${w}" stroke-linejoin="round"`);
  const flat = (shape, c, s, w = 1) => shape(`fill="${c}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round"`);
  const arc = (d, w = 2, o = .85) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
  const dot = (x, y, r = .9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".9"/>`;
  const piso = (rx, x = 0) => `<ellipse cx="${x}" cy="0" rx="${rx}" ry="${(rx * .26).toFixed(1)}" fill="url(#km-piso)"/>`;
  const f1 = n => +n.toFixed(2);
  /* ojos que parpadean (clase .ojos) con dos brillos; blancos = con esclerótica para caras oscuras (Chinitabla) */
  const eyes = (sep, blancos) => `<g class="ojos">` + [-sep, sep].map(x => (blancos ? `<ellipse cx="${x}" cy="-.8" rx="3" ry="3.4" fill="#fff"/>` : '')
    + `<ellipse cx="${x}" cy="-.8" rx="2.3" ry="2.7" fill="url(#km-ojo)"/><circle cx="${x + .8}" cy="-1.9" r="1" fill="#fff"/><circle cx="${x - .7}" cy=".4" r=".45" fill="#fff"/>`).join('') + '</g>';
  const BOCA = {
    sonrisa: `<path d="M-1.2 2.1Q0 3.4 1.2 2.1" fill="none" stroke="#5a2a44" stroke-width=".9" stroke-linecap="round"/>`,
    abierta: `<path d="M-1.4 1.9Q0 4.4 1.4 1.9Z" fill="#7a2a44"/><path d="M-.7 3Q0 3.9 .7 3" fill="#ff8fab"/>`,
    gato: `<path d="M-1.6 2Q-.8 3 0 2.1Q.8 3 1.6 2" fill="none" stroke="#5a2a44" stroke-width=".85" stroke-linecap="round"/>`,
    blanca: `<path d="M-1.4 2.1Q0 3.6 1.4 2.1" fill="none" stroke="#ffd6e0" stroke-width="1" stroke-linecap="round"/>`,
    nada: '',
  };
  const face = (x, y, s = 1, { sep = 3.4, boca = 'sonrisa', blancos = false, mej = true } = {}) => `<g transform="translate(${x} ${y}) scale(${s})">${eyes(sep, blancos)}${BOCA[boca]}`
    + (mej ? `<ellipse cx="${-sep - 2.4}" cy="2.1" rx="2.2" ry="1.4" fill="url(#km-mej)"/><ellipse cx="${sep + 2.4}" cy="2.1" rx="2.2" ry="1.4" fill="url(#km-mej)"/>` : '') + '</g>';
  /* polígono regular con un lado abajo; con contorno redondeado se ve «gomita» */
  const poly = (cx, cy, r, n) => { let d = ''; const a0 = Math.PI / 2 + Math.PI / n; for (let i = 0; i < n; i++) { const a = a0 + i * 2 * Math.PI / n; d += (i ? 'L' : 'M') + f1(cx + r * Math.cos(a)) + ' ' + f1(cy + r * Math.sin(a)); } return P(d + 'Z'); };
  const starD = (r, x = 0, y = 0) => { let p = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .5 : r; p += (i ? 'L' : 'M') + f1(x + Math.cos(a) * rr) + ' ' + f1(y + Math.sin(a) * rr); } return p + 'Z'; };
  const heartD = (x, y, s) => `M${x} ${f1(y + 1.6 * s)}C${f1(x - 2.6 * s)} ${f1(y - .2 * s)} ${f1(x - 1.6 * s)} ${f1(y - 2.2 * s)} ${x} ${f1(y - 1 * s)}C${f1(x + 1.6 * s)} ${f1(y - 2.2 * s)} ${f1(x + 2.6 * s)} ${f1(y - .2 * s)} ${x} ${f1(y + 1.6 * s)}Z`;
  /* brillante: aura, corona y destellos que titilan (clase .tw) */
  const aura = (y, r) => `<circle cx="0" cy="${y}" r="${r}" fill="url(#km-glow)" class="aura"/>`;
  const corona = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${gel(P('M-6 0L-7 -7.5L-3.2 -4L0 -9L3.2 -4L7 -7.5L6 0Q0 1.6 -6 0Z'), 'oro', .9)}`
    + `<circle cx="0" cy="-2.4" r="1.3" fill="#ff5c8a"/><circle cx="-7" cy="-7.6" r="1.1" fill="#fff6c8"/><circle cx="7" cy="-7.6" r="1.1" fill="#fff6c8"/><circle cx="0" cy="-9.2" r="1.1" fill="#fff6c8"/>${arc('M-4.4 -1.4Q-2 -.6 1 -1', .8, .8)}</g>`;
  const chispas = pts => pts.map(([x, y, r], i) => `<path class="tw" style="animation-delay:${(i * .45).toFixed(2)}s" d="${starD(r, x, y)}" fill="#ffd23c" stroke="#f0a800" stroke-width=".4"/>`).join('');

  /* ---------- 1 · Tortugono ---------- */
  const TORTU_TILES = {
    1: { n: 3, p: [[-14, -16, 5.6], [-3, -27, 5.6], [8, -16, 5.6]] },
    2: { n: 4, p: [[-16, -16, 4.6], [-9, -27.5, 4.6], [2, -27.5, 4.6], [9, -16, 4.6], [-3.5, -17, 4.6]] },
    3: { n: 5, p: [[-17, -15, 4.4], [-11.5, -28.5, 4.2], [5, -28.5, 4.2], [10.5, -15, 4.4]], c: [-3.2, -20.5, 6.6, 6] },
    4: { n: 8, p: [[-17, -15, 4.4], [-11.5, -28.5, 4.2], [5, -28.5, 4.2], [10.5, -15, 4.4]], c: [-3.2, -20.5, 6.6, 8] },
  };
  const tortugono = k => {
    const hs = [0, 1.28, 1.12, 1, 1][k], T = TORTU_TILES[k], tile = k === 4 ? 'oro' : 'amarillo';
    const hx = 24, hy = -15, hr = 10 * hs;
    let s = piso(34, -2);
    s += gel(P('M-25 -8Q-34 -7 -32 -3Q-29 -1.6 -24 -4Z'), 'menta', 1); /* colita */
    s += [-20, -8, 6].map(x => gel(R(x - 4.2, -10, 8.4, 10, 4), 'menta', 1) + `<path d="M${x - 2.2} -.9h4.4" stroke="${PAL.menta[3]}" stroke-width=".7" stroke-linecap="round" opacity=".5"/>`).join('');
    s += gel(P(`M12 -9Q15 ${hy - 4} ${hx - 2} ${hy - 2}L${hx} -6Q17 -3 12 -5Z`), 'menta', 1); /* cuello */
    s += gel(P('M-29 -7.5Q-29 -11.5 -25 -11.5L19 -11.5Q23 -11.5 23 -7.5Q23 -3.8 19 -3.8L-25 -3.8Q-29 -3.8 -29 -7.5Z'), k === 4 ? 'oro' : 'vainilla', 1.1); /* borde */
    s += gel(P('M-26 -10Q-28.5 -37 -3 -38Q22.5 -37 20 -10Q-3 -7 -26 -10Z'), 'verde', 1.4); /* caparazón */
    s += T.p.map(([x, y, r]) => gel(poly(x, y, r, T.n), tile, 1)).join('');
    if (T.c) s += gel(poly(T.c[0], T.c[1], T.c[2], T.c[3]), tile, 1.1);
    s += arc('M-21 -17Q-20 -29 -9 -33', 2.2, .75) + dot(-22, -12.5, 1);
    s += gel(C(hx, hy, hr), 'menta', 1.3) + arc(`M${f1(hx - hr * .7)} ${f1(hy - hr * .25)}Q${f1(hx - hr * .55)} ${f1(hy - hr * .75)} ${f1(hx - hr * .1)} ${f1(hy - hr * .85)}`, 1.6, .8);
    s += face(hx + .5, hy + 1, .92 * hs, { boca: k >= 3 ? 'abierta' : 'sonrisa' });
    if (k === 4) s = aura(-18, 40) + s + corona(hx, hy - hr - 1.5, 1, 8) + chispas([[-30, -34, 3], [30, -38, 2.6], [-12, -46, 2.2]]);
    return s;
  };

  /* ---------- 2 · Cubúho ---------- */
  const cubuho = k => {
    const L = PAL.lila, body = k === 4 ? 'oro' : 'lila', B = PAL[body];
    let s = piso(26, 2);
    s += gel(E(-7, -1.2, 4.4, 2.4), 'naranja', .9) + gel(E(7, -1.2, 4.4, 2.4), 'naranja', .9); /* patitas */
    /* cubo: cara de lado (oscura), de arriba (clara) y de frente (degradado gel) */
    s += flat(P('M15 -31L23 -37Q25 -38.4 25 -36L25 -9Q25 -7 23.4 -6L15 -1Z'), B[2], B[3], 1.2);
    s += flat(P('M-13 -32L-6 -38.6Q-5 -39.6 -3.4 -39.6L21.6 -39.6Q24.6 -39.6 22.4 -37.4L16.4 -32Z'), B[0], B[3], 1.2);
    s += gel(R(-16, -33, 32, 32, 6.5), body, 1.4);
    s += arc('M-12.4 -24Q-12.6 -29.4 -7 -29.6', 1.8, .8) + `<path d="M-4 -37.4H16" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`;
    /* panza con plumitas en V; en la grande, botones de esfera */
    s += flat(E(0, -7.5, 10, 5.6), B[0], B[2], .9);
    s += [[-5, -9], [0, -10], [5, -9], [-2.5, -5.6], [2.5, -5.6]].map(([x, y]) => `<path d="M${x - 1.5} ${y - .8}L${x} ${y + .6}L${x + 1.5} ${y - .8}" fill="none" stroke="${B[2]}" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    if (k >= 3) s += [-4.5, 0, 4.5].map(x => gel(C(x, -3.4, 1.5), k === 4 ? 'rosa' : 'amarillo', .5) + dot(x - .5, -3.9, .45)).join('');
    /* alas: en la cría lisas; desde joven con plumas de prisma (rectángulos con su lado en sombra) */
    const ala = (sx) => `<g transform="translate(${sx < 0 ? -15.5 : 15.5} -18) scale(${sx} 1)">${gel(P('M0 -4Q-9 -2 -8.6 8Q-8 13 -3.6 12Q0 8 0 4Z'), body, 1.1)}`
      + (k >= 2 ? [[-6.6, 1.2], [-6.2, 5.2], [-4.8, 9]].map(([x, y]) => flat(R(x, y, 4.4, 2.6, .6), k === 4 ? PAL.rosa[1] : PAL.azul[1], k === 4 ? PAL.rosa[3] : PAL.azul[3], .6) + `<rect x="${x}" y="${y + 1.8}" width="4.4" height=".8" fill="${k === 4 ? PAL.rosa[2] : PAL.azul[2]}"/>`).join('') : '') + '</g>';
    s += ala(-1) + `<g transform="translate(5.5 0)">${ala(1)}</g>`;
    /* discos de los ojos y cara (pico en vez de boca) */
    s += gel(C(-7, -21, 7.4), 'crema', 1) + gel(C(7, -21, 7.4), 'crema', 1);
    s += face(0, -20, 1.32, { sep: 5.3, boca: 'nada', mej: false });
    s += `<ellipse cx="-12.4" cy="-13.6" rx="2.6" ry="1.5" fill="url(#km-mej)"/><ellipse cx="12.4" cy="-13.6" rx="2.6" ry="1.5" fill="url(#km-mej)"/>`;
    s += gel(P('M-2.4 -14.4Q0 -15.6 2.4 -14.4L.4 -11Q0 -10.4 -.4 -11Z'), 'naranja', .8);
    /* penachos: cría con un rizo; joven redondos; grande y brillante con conos */
    if (k === 1) s += `<path d="M1 -39.4Q-1 -45 3.6 -45.4Q6.6 -45.4 5.6 -42.4" fill="none" stroke="${L[2]}" stroke-width="2" stroke-linecap="round"/>`;
    if (k === 2) s += gel(C(-9, -38.4, 3.2), body, 1) + gel(C(18, -40.4, 3.2), body, 1);
    if (k >= 3) {
      const cono = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})">${gel(P('M-4.2 1Q0 2.4 4.2 1L1.4 -5.8Q0 -7.8 -1.4 -5.8Z'), k === 4 ? 'rosa' : 'azul', 1)}<ellipse cx="0" cy="1" rx="4" ry="1.3" fill="${k === 4 ? PAL.rosa[2] : PAL.azul[2]}"/>${arc('M-1.8 -.6L-.6 -4.4', .8, .8)}</g>`;
      s += cono(-8.6, -38.6, -24) + cono(19, -40.4, 24);
    }
    if (k === 4) s = aura(-22, 38) + s + corona(5.6, -41.6, 1.05) + chispas([[-26, -36, 3], [31, -28, 2.6], [-22, -8, 2.2]]);
    return s;
  };

  /* ---------- 3 · Cienpiecito (de brillante, Milpiés) ---------- */
  const CIEN = { 1: ['pu', 'pu'], 2: ['pd', 'pd', 'pu', 'pu'], 3: ['pc', 'pc', 'pd', 'pd', 'pu', 'pu'], 4: ['oro', 'pc', 'pc', 'pd', 'pd', 'pu', 'pu'] };
  const cienpiecito = k => {
    const seg = CIEN[k], n = seg.length, r = [0, 8.4, 8, 7.6, 7.2][k], sp = r * 1.2, hr = [0, 11.5, 11, 10.5, 10.5][k];
    const x0 = -((n - 1) * sp + hr + 2) / 2 - 2; /* centra cuerpo + cabeza */
    const pos = seg.map((c, i) => [f1(x0 + i * sp), f1(-r - 2.2 - 2.6 * Math.sin(i * 1.15 + .6)), c]);
    const hx = f1(x0 + n * sp + 2), hy = -hr - 4;
    let s = piso(((n - 1) * sp + hr * 2) / 2 + 6, (x0 + hx) / 2);
    /* patitas: dos por anillo, del color de su cifra; en Milpiés, zapatitos dorados */
    s += pos.map(([x, y, c]) => [-2.6, 2.6].map(dx => `<path d="M${f1(x + dx)} ${f1(y + r * .6)}L${f1(x + dx * 1.2)} -1.2" stroke="${PAL[c][3]}" stroke-width="1.6" stroke-linecap="round"/>`
      + (k === 4 ? gel(E(f1(x + dx * 1.2 + .6), -1, 1.9, 1.2), 'oro', .5) : `<circle cx="${f1(x + dx * 1.2)}" cy="-1.1" r="1.1" fill="${PAL[c][2]}"/>`)).join('')).join('');
    s += pos.map(([x, y, c]) => gel(C(x, y, r), c, 1.1) + arc(`M${f1(x - r * .62)} ${f1(y - r * .1)}Q${f1(x - r * .5)} ${f1(y - r * .66)} ${f1(x - r * .02)} ${f1(y - r * .72)}`, 1.4, .8)
      + (c === 'oro' ? `<path d="${starD(r * .42, x + .4, y + 1)}" fill="#fff6c8" opacity=".9"/>` : '')).join('');
    /* cabeza con antenas de bolitas */
    s += [[-1, -15], [1, 15]].map(([sg, rot]) => `<path d="M${f1(hx + sg * 3.4)} ${f1(hy - hr + 2)}Q${f1(hx + sg * 5)} ${f1(hy - hr - 6)} ${f1(hx + sg * 8)} ${f1(hy - hr - 7)}" fill="none" stroke="${PAL.naranja[3]}" stroke-width="1.2" stroke-linecap="round"/>`
      + gel(C(f1(hx + sg * 8.4), f1(hy - hr - 7.4), 2.2), k === 4 ? 'oro' : 'rosa', .7)).join('');
    s += gel(C(hx, hy, hr), k === 4 ? 'oro' : 'amarillo', 1.3) + arc(`M${f1(hx - hr * .72)} ${f1(hy - hr * .1)}Q${f1(hx - hr * .6)} ${f1(hy - hr * .72)} ${f1(hx - hr * .08)} ${f1(hy - hr * .84)}`, 1.7, .8);
    s += face(hx + .6, hy + 1.2, hr / 10.5, { boca: k >= 3 ? 'abierta' : 'sonrisa' });
    if (k === 4) s = aura(-14, 46) + s + corona(hx - 2, f1(hy - hr - .6), .95, -10) + chispas([[x0 - 4, -26, 2.8], [hx + 14, -10, 2.6], [x0 + 22, -30, 2.2]]);
    return s;
  };

  /* ---------- 4 · Pulpatrón ---------- */
  const RAINBOW = ['#ff4d64', '#ffa23d', '#ffd23c', '#7fd650', '#5fd6b0', '#5fb0ff', '#a98cff', '#ff8cbf'];
  const PULPO = {
    1: { n: 4, w: 21, pat: ['#ffd23c', '#5fb0ff'], dots: () => 2 },
    2: { n: 6, w: 30, pat: ['#ffd23c', '#5fb0ff', '#7fd650'], dots: () => 2 },
    3: { n: 6, w: 34, pat: ['#ffd23c', '#5fb0ff', '#7fd650'], dots: i => i % 3 + 1 },
    4: { n: 8, w: 40, pat: RAINBOW, dots: i => i % 3 + 1 },
  };
  const pulpatron = k => {
    const Q = PULPO[k], body = 'rosa', B = PAL[body];
    let s = piso(Q.w / 2 + 10);
    const tent = [];
    for (let i = 0; i < Q.n; i++) {
      const x = f1(-Q.w / 2 + i * Q.w / (Q.n - 1)), dir = x < -.1 ? -1 : 1, d = `M${x} -18Q${f1(x - dir * .8)} -2.6 ${f1(x + dir * 4)} -2.2Q${f1(x + dir * 7.8)} -2.2 ${f1(x + dir * 6.8)} -6`;
      const col = k === 4 ? RAINBOW[i] : Q.pat[i % Q.pat.length], nd = Q.dots(i);
      const spots = [[x - dir * .2, -12.6], [x + dir * .1, -8.2], [x + dir * 2.4, -3.8]].slice(0, nd);
      tent.push(`<path d="${d}" fill="none" stroke="${B[3]}" stroke-width="7.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#km-${body})" stroke-width="5.2" stroke-linecap="round"/>`
        + spots.map(([sx, sy]) => `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="1.75" fill="${col}" stroke="#fff" stroke-width=".6"/>`).join(''));
    }
    s += tent.join('');
    s += gel(P('M-18.6 -16Q-24 -47 0 -49Q24 -47 18.6 -16Q9 -12.4 0 -14.2Q-9 -12.4 -18.6 -16Z'), body, 1.4);
    s += [[-9, -39, 2.4], [-3, -43.6, 1.6], [10, -38, 2], [13.6, -30.6, 1.3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${B[0]}" opacity=".9"/>`).join('');
    s += arc('M-14 -28Q-14.6 -39 -6 -43.4', 2.2, .75) + dot(-15, -23, 1);
    s += face(0, -25, 1.25, { sep: 3.7, boca: k >= 3 ? 'abierta' : 'sonrisa' });
    if (k >= 2) s += `<path d="M-13.4 -33.6Q-11 -35.4 -8.6 -33.8M8.6 -33.8Q11 -35.4 13.4 -33.6" fill="none" stroke="${B[2]}" stroke-width=".9" stroke-linecap="round" opacity=".55"/>`;
    if (k === 4) s = aura(-26, 40) + s + corona(0, -48.4, 1.1) + chispas([[-28, -40, 3], [28, -44, 2.6], [30, -18, 2.2]]);
    return s;
  };

  /* ---------- 5 · Chinitabla ---------- */
  const CHINI = {
    1: { r: 3, p: [[-12, -29], [-15.6, -19.6]] },
    2: { r: 2.05, p: [[-17.6, -30.4], [-8.8, -30.4], [-13.2, -25.6], [-17.6, -20.8], [-8.8, -20.8]] },
    3: { r: 1.55, p: [-33.4, -29.4, -25.4, -21.4, -17.4].flatMap(y => [[-15.6, y], [-11.4, y]]) },
    4: { r: 2, p: [-33.4, -29.4, -25.4, -21.4, -17.4].flatMap(y => [[-15.6, y], [-11.4, y]]) },
  };
  const chinitabla = k => {
    const D = CHINI[k], shell = k === 4 ? 'oro' : 'rojo', S = PAL[shell];
    let s = piso(28);
    /* patitas (3 por lado) */
    s += [[-15, 1], [-6.5, 1], [6.5, 1], [15, 1]].map(([x]) => `<path d="M${x} -6L${f1(x * 1.15)} -1" stroke="${PAL.oscuro[2]}" stroke-width="2" stroke-linecap="round"/><circle cx="${f1(x * 1.15)}" cy="-1" r="1.4" fill="${PAL.oscuro[1]}"/>`).join('');
    s += gel(P('M-22.6 -6.4Q-27.6 -41 0 -42.6Q27.6 -41 22.6 -6.4Q0 1.6 -22.6 -6.4Z'), shell, 1.4); /* caparazón */
    s += `<path d="M0 -42.4V-17" stroke="${S[3]}" stroke-width="1.3" stroke-linecap="round"/>`;
    const pinta = (x, y) => k === 4 ? `<path d="${starD(D.r, x, y)}" fill="url(#km-rojo)" stroke="${PAL.rojo[3]}" stroke-width=".4" stroke-linejoin="round"/>` : gel(C(x, y, D.r), 'oscuro', .5) + dot(f1(x - D.r * .32), f1(y - D.r * .34), f1(D.r * .3));
    s += D.p.map(([x, y]) => pinta(x, y) + pinta(-x, y)).join('');
    s += arc('M-21.4 -15Q-22.4 -27 -18.4 -33.4', 2, .75) + arc('M-6 -39.6Q-2.6 -41 1 -40.8', 1.4, .7);
    /* antenas y cabeza oscura con ojos blancos */
    s += [-1, 1].map(sg => `<path d="M${sg * 2.6} -18.6Q${sg * 3.4} -24.6 ${sg * 5.6} -27" fill="none" stroke="${PAL.oscuro[2]}" stroke-width="1.3" stroke-linecap="round"/>` + gel(C(sg * 5.9, -27.6, 1.9), k === 4 ? 'oro' : 'oscuro', .6)).join('');
    s += gel(C(0, -10, 9.6), 'oscuro', 1.2) + arc('M-6.6 -12Q-6 -16.6 -2 -17.8', 1.5, .55);
    s += face(0, -9.2, 1.08, { sep: 3.9, boca: k >= 3 ? 'abierta' : 'blanca', blancos: true });
    if (k === 4) s = aura(-22, 38) + s + corona(0, -19.8, .9) + chispas([[-28, -34, 3], [28, -38, 2.6], [-29, -10, 2.2]]);
    return s;
  };

  /* ---------- huevos: cada uno con los colores y el motivo de su mascota ---------- */
  const EGG = {
    tortugono: { c: 'menta', m: () => gel(poly(-4, -14, 3, 3), 'amarillo', .6) + gel(poly(4.6, -8, 2.6, 4), 'amarillo', .6) + gel(poly(2, -22, 2.4, 5), 'amarillo', .6) },
    cubuho: { c: 'lila', m: () => [[-4.5, -15], [4, -9.5], [2.4, -22]].map(([x, y]) => `<g transform="translate(${x} ${y})">${flat(P('M-2.4 -.6L0 -2L2.4 -.6V2L0 3.2L-2.4 2Z'), PAL.lila[0], PAL.lila[3], .5)}<path d="M-2.4 -.6L0 .8L2.4 -.6M0 .8V3.2" fill="none" stroke="${PAL.lila[3]}" stroke-width=".5"/></g>`).join('') },
    cienpiecito: { c: 'vainilla', m: () => [[-5, -14, 'pu'], [0, -10, 'pd'], [5, -14, 'pc'], [-1, -21, 'pu'], [4.4, -5.6, 'pu']].map(([x, y, c]) => gel(C(x, y, 1.9), c, .5)).join('') },
    pulpatron: { c: 'rosa', m: () => [-15, -8].map((y, j) => `<path d="M-9.6 ${y}Q-6 ${y - 2.6} -2.4 ${y}T4.8 ${y}T12 ${y}" fill="none" stroke="${j ? '#5fb0ff' : '#ffd23c'}" stroke-width="1.6" stroke-linecap="round"/>`).join('') },
    chinitabla: { c: 'rojo', m: () => [[-4.6, -17], [-6.6, -11.6], [4.6, -17], [6.6, -11.6]].map(([x, y]) => gel(C(x, y, 1.8), 'oscuro', .4)).join('') + `<path d="M0 -27.6V-4" stroke="${PAL.rojo[3]}" stroke-width=".9" opacity=".6"/>` },
  };
  /* eclosión: 0 entero · 1 grieta · 2 hoyito con un ojo que mira y una parte que asoma · 3 sin tapa, se asoma la carita */
  const PEEK = {
    tortugono: { c: 'menta', out: () => [-1, 1].map(g => gel(E(g * 7.4, -1.6, 3.2, 2.4), 'menta', .9)).join(''), top: () => '' },
    cubuho: { c: 'lila', out: () => '', top: y => `<path d="M.6 ${y - 7.6}Q-1.4 ${y - 12.6} 2.8 ${y - 13}Q5.4 ${y - 13} 4.6 ${y - 10.4}" fill="none" stroke="${PAL.lila[2]}" stroke-width="1.6" stroke-linecap="round"/>` },
    cienpiecito: { c: 'amarillo', out: () => [-1, 1].map(g => `<circle cx="${g * 9.6}" cy="-1.4" r="1.4" fill="${PAL.pu[1]}" stroke="${PAL.pu[3]}" stroke-width=".5"/>`).join(''),
      top: y => [-1, 1].map(g => `<path d="M${g * 2.4} ${y - 7}Q${g * 3.4} ${y - 12} ${g * 5.6} ${y - 12.6}" fill="none" stroke="${PAL.naranja[3]}" stroke-width="1" stroke-linecap="round"/><circle cx="${g * 6}" cy="${y - 12.8}" r="1.5" fill="${PAL.rosa[1]}" stroke="${PAL.rosa[3]}" stroke-width=".5"/>`).join('') },
    pulpatron: { c: 'rosa', out: () => [-1, 1].map(g => `<path d="M${g * 8.6} -3Q${g * 12.6} -1.6 ${g * 12.4} -4.6" fill="none" stroke="${PAL.rosa[3]}" stroke-width="3.6" stroke-linecap="round"/><path d="M${g * 8.6} -3Q${g * 12.6} -1.6 ${g * 12.4} -4.6" fill="none" stroke="${PAL.rosa[1]}" stroke-width="2.2" stroke-linecap="round"/>`).join(''), top: () => '' },
    chinitabla: { c: 'oscuro', blancos: true, out: () => '', top: y => [-1, 1].map(g => `<path d="M${g * 2.4} ${y - 6.6}Q${g * 3.2} ${y - 11} ${g * 5.4} ${y - 11.6}" fill="none" stroke="${PAL.oscuro[2]}" stroke-width="1" stroke-linecap="round"/><circle cx="${g * 5.8}" cy="${y - 11.8}" r="1.4" fill="${PAL.oscuro[1]}"/>`).join('') },
  };
  const ZIG = [[-11.7, -15], [-8.4, -12.4], [-5.4, -16], [-2.2, -12.6], [1, -16.2], [4.2, -12.6], [7.4, -16], [11.7, -14.2]];
  const huevo = (id, grietas = 0) => {
    const e = EGG[id], egg = 'M0 -28Q11 -28 11.6 -12Q12 0 0 0Q-12 0 -11.6 -12Q-11 -28 0 -28Z', K = PAL[e.c][3], pk = PEEK[id];
    const crack = (d) => `<path d="${d}" fill="none" stroke="${K}" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (grietas < 3) {
      const cl = `<clipPath id="km-hc-${id}"><path d="${egg}"/></clipPath>`;
      let s = piso(12) + cl + gel(P(egg), e.c, 1.3) + `<g clip-path="url(#km-hc-${id})">${e.m()}</g>` + arc('M-7 -16Q-6.4 -23.6 -1.6 -25.4', 1.8, .8) + dot(-7.6, -12.4, .9);
      if (grietas >= 1) s += crack('M-6 -18L-3 -15.6L-.4 -18.4L2.2 -15.4L5 -17.6');
      if (grietas >= 2) s += crack('M-9 -10L-6.6 -8.4L-4 -10.6M4 -9.6L6.4 -7.6L9 -9.4')
        + `<path d="M.4 -24.6L3 -26.4L6.6 -24.8L7.6 -21.2L5.2 -18.6L1.6 -19.4L-.4 -22Z" fill="#3a2a4a" stroke="${K}" stroke-width=".8" stroke-linejoin="round"/>`
        + (pk.blancos ? `<ellipse cx="3.8" cy="-22.4" rx="2" ry="2.3" fill="#fff"/>` : '') + `<ellipse cx="3.8" cy="-22.4" rx="1.5" ry="1.8" fill="url(#km-ojo)"/><circle cx="4.4" cy="-23.2" r=".6" fill="#fff"/>`
        + pk.out() + pk.top(-17.6).replace(/^/, '');
      return s;
    }
    /* sin tapa: la carita se asoma entre el cascarón de abajo y la tapa levantada */
    const bottom = 'M' + ZIG.map(([x, y]) => x + ' ' + y).join('L') + 'Q12 0 0 0Q-12 0 -11.7 -15Z';
    const cap = 'M-11.7 -15Q-11 -28 0 -28Q11 -28 11.7 -14.2' + ZIG.slice().reverse().slice(1).map(([x, y]) => 'L' + x + ' ' + y).join('') + 'Z';
    const head = pk.c === 'lila' || pk.c === 'amarillo' ? gel(R(-8.6, -24.6, 17.2, 16, 5), pk.c, 1.1) : gel(P('M-9 -12Q-10 -24 0 -24.6Q10 -24 9 -12Z'), pk.c, 1.1);
    return piso(12) + pk.top(-17.6) + head + face(0, -16.8, .8, { boca: 'abierta', blancos: !!pk.blancos }) + pk.out()
      + `<clipPath id="km-hb-${id}"><path d="${bottom}"/></clipPath><clipPath id="km-ht-${id}"><path d="${cap}"/></clipPath>`
      + gel(P(bottom), e.c, 1.3) + `<g clip-path="url(#km-hb-${id})">${e.m()}</g>` + dot(-7.6, -9.6, .9)
      + `<g transform="translate(-6 -12) rotate(-28 0 -20)">${gel(P(cap), e.c, 1.3)}<g clip-path="url(#km-ht-${id})">${e.m()}</g>${arc('M-7 -18Q-6.4 -23.6 -1.6 -25.4', 1.6, .8)}</g>`;
  };

  const DRAW = { tortugono, cubuho, cienpiecito, pulpatron, chinitabla };
  const MASC = [
    { id: 'tortugono', name: 'Tortugono', ch: 1, cap: 'Polígonos' },
    { id: 'cubuho', name: 'Cubúho', ch: 2, cap: 'Figuras 2D y 3D' },
    { id: 'cienpiecito', name: 'Cienpiecito', big: 'Milpiés', ch: 3, cap: 'Números' },
    { id: 'pulpatron', name: 'Pulpatrón', ch: 4, cap: 'Patrones' },
    { id: 'chinitabla', name: 'Chinitabla', ch: 5, cap: 'Multiplicación' },
  ];
  const ETAPAS = ['Huevo', 'Cría', 'Joven', 'Grande', 'Brillante'];
  const SCALE = [1, .64, .82, 1, 1.04];
  /* masc(id, etapa): el dibujo completo con los pies en y = 0 (envuelto en .idle para respirar) */
  const masc = (id, k, { sombra = false } = {}) => {
    const art = k === 0 ? `<g class="wob">${huevo(id)}</g>` : `<g class="idle">${DRAW[id](k)}</g>`;
    return `<g transform="scale(${k === 0 ? 1.1 : SCALE[k]})"${sombra ? ' filter="url(#km-sombra)"' : ''}>${art}</g>`;
  };
  const nombre = (id, k) => { const m = MASC.find(x => x.id === id); return k === 4 && m.big ? m.big : m.name; };
  const CSS = `.idle{animation:km-br 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
@keyframes km-br{50%{transform:scaleY(.965) scaleX(1.02)}}
.wob{animation:km-wob 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
@keyframes km-wob{0%,70%,100%{transform:rotate(0)}78%{transform:rotate(-6deg)}86%{transform:rotate(5deg)}93%{transform:rotate(-2deg)}}
.ojos{animation:km-blink 4.6s infinite;transform-box:fill-box;transform-origin:50% 55%}
@keyframes km-blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.12)}}
.tw{animation:km-tw 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes km-tw{50%{opacity:.25;transform:scale(.55) rotate(20deg)}}
.aura{animation:km-aura 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes km-aura{50%{opacity:.6;transform:scale(.92)}}
@media (prefers-reduced-motion:reduce){.idle,.wob,.ojos,.tw,.aura{animation:none}}`;
  root.BOCETO_MASC = { PAL, DEFS, CSS, MASC, ETAPAS, SCALE, masc, huevo, nombre, DRAW,
    H: { P, C, E, R, gel, flat, arc, dot, piso, face, poly, starD, heartD, aura, corona, chispas, f1 } }; /* H: piezas para la tanda B */
})(typeof window !== 'undefined' ? window : module.exports);
