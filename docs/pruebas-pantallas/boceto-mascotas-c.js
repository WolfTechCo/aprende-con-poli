/* Tanda C de las mascotas (pedido de la dueña, 24-11-2026: «creo que ganan los primeros», y una tercera opción).
   Parte de la tanda A (los mismos animales, redonditos, que gustaron) y le suma lo bueno de la B: la POSTURA evoluciona
   (se para, levanta los brazos, vuela) y ninguna cabeza es un círculo. Se carga después de boceto-mascotas.js y -b.js.
   - Tortugono: cabeza de tortuga con hocico; de grande estira el cuello y le crece una cresta de placas con la figura de la etapa.
   - Cubúho: el búho cubo de la A (el favorito), que sale con su cascarón y de brillante abre alas de prisma.
   - Cienpiecito: anillos redondos de la A con cabeza de baldosa; de grande se levanta y saluda.
   - Pulpatrón: el pulpo de la A; de grande levanta dos tentáculos con su patrón y de brillante flota.
   - Chinitabla: la chinita de la A con cabeza de casco; de joven saluda, de grande se para y de brillante vuela. */
(function (root) {
  const M = root.BOCETO_MASC, { PAL } = M;
  const { P, C, E, R, gel, arc, dot, piso, face, poly, aura, corona, chispas, f1 } = M.H;
  const { helmet, antenas, tent, pin, spot } = M.B.H;
  const ABC = ['#ffd23c', '#5fb0ff', '#7fd650'];

  /* ---------- 1 · Tortugono ---------- */
  const TT = {
    1: { n: 3, p: [[-14, -16, 5.6], [-3, -27, 5.6], [8, -16, 5.6]] },
    2: { n: 4, p: [[-16, -16, 4.6], [-9, -27.5, 4.6], [2, -27.5, 4.6], [9, -16, 4.6], [-3.5, -17, 4.6]] },
    3: { n: 5, p: [[-17, -15, 4.4], [-11.5, -28.5, 4.2], [5, -28.5, 4.2], [10.5, -15, 4.4]], c: [-3.2, -20.5, 6.6, 6] },
    4: { n: 8, p: [[-17, -15, 4.4], [-11.5, -28.5, 4.2], [5, -28.5, 4.2], [10.5, -15, 4.4]], c: [-3.2, -20.5, 6.6, 8] },
  };
  /* cabeza de tortuga: más ancha que alta, con hocico hacia adelante (no es un círculo) */
  const tHead = (hx, hy, s) => gel(P(`M${f1(hx - 8 * s)} ${f1(hy + 6 * s)}Q${f1(hx - 10.4 * s)} ${f1(hy - 7 * s)} ${f1(hx)} ${f1(hy - 8.2 * s)}Q${f1(hx + 10.6 * s)} ${f1(hy - 8.6 * s)} ${f1(hx + 11.4 * s)} ${f1(hy + .4 * s)}Q${f1(hx + 11.4 * s)} ${f1(hy + 7 * s)} ${f1(hx + 3 * s)} ${f1(hy + 7.4 * s)}Q${f1(hx - 3 * s)} ${f1(hy + 7.8 * s)} ${f1(hx - 8 * s)} ${f1(hy + 6 * s)}Z`), 'menta', 1.3)
    + arc(`M${f1(hx - 6.4 * s)} ${f1(hy - 1 * s)}Q${f1(hx - 5.6 * s)} ${f1(hy - 5.8 * s)} ${f1(hx - 1 * s)} ${f1(hy - 6.6 * s)}`, 1.5, .8)
    + `<circle cx="${f1(hx + 6 * s)}" cy="${f1(hy - 4.6 * s)}" r="${f1(1.2 * s)}" fill="${PAL.menta[0]}"/><circle cx="${f1(hx + 8.4 * s)}" cy="${f1(hy - 2 * s)}" r="${f1(.8 * s)}" fill="${PAL.menta[0]}"/>`
    + `<circle cx="${f1(hx + 10 * s)}" cy="${f1(hy + 1.6 * s)}" r=".5" fill="${PAL.menta[3]}"/>`;
  const tortugonoC = k => {
    const hs = [0, 1.22, 1.08, 1, 1][k], T = TT[k], tile = k === 4 ? 'oro' : 'amarillo', up = k >= 3;
    const hx = up ? 27 : 23, hy = up ? -27 : -15;
    let s = piso(34, -2);
    if (k >= 2) s += gel(P('M-25 -8Q-35 -8 -33 -2.6Q-29 -1.2 -24 -4Z'), 'menta', 1);
    s += [-20, -8, 6].map(x => gel(R(x - 4.2, k >= 2 ? -11 : -10, 8.4, k >= 2 ? 11 : 10, 4), 'menta', 1)).join('');
    if (up) s += [[-16, -35.4], [-4, -40.6], [8, -35.4]].map(([x, y]) => gel(poly(x, y, 5.6, T.n), tile, 1)).join(''); /* cresta */
    s += up ? tent(`M14 -10Q22 -12 ${hx - 2} ${hy + 5}`, 'menta', 8) : gel(P(`M12 -9Q15 ${hy - 4} ${hx - 2} ${hy - 2}L${hx} -6Q17 -3 12 -5Z`), 'menta', 1);
    s += gel(P('M-29 -7.5Q-29 -11.5 -25 -11.5L19 -11.5Q23 -11.5 23 -7.5Q23 -3.8 19 -3.8L-25 -3.8Q-29 -3.8 -29 -7.5Z'), k === 4 ? 'oro' : 'vainilla', 1.1);
    s += gel(P('M-26 -10Q-28.5 -37 -3 -38Q22.5 -37 20 -10Q-3 -7 -26 -10Z'), 'verde', 1.4);
    s += T.p.map(([x, y, r]) => gel(poly(x, y, r, T.n), tile, 1)).join('') + (T.c ? gel(poly(T.c[0], T.c[1], T.c[2], T.c[3]), tile, 1.1) : '');
    s += arc('M-21 -17Q-20 -29 -9 -33', 2.2, .75) + dot(-22, -12.5, 1);
    s += tHead(hx, hy, hs) + face(f1(hx + 2.4 * hs), f1(hy + .6 * hs), .9 * hs, { boca: k >= 3 ? 'abierta' : 'sonrisa' });
    if (k === 4) s = aura(-20, 42) + s + corona(hx, f1(hy - 8.6), .95, 8) + chispas([[-30, -44, 3], [36, -12, 2.6], [-34, -18, 2.2]]);
    return s;
  };

  /* ---------- 2 · Cubúho: el de la tanda A, con cascarón al nacer y alas abiertas al brillar ---------- */
  const fan = (x, y, sg) => [70, 100, 130, 160].map((r, i) => `<g transform="translate(${x} ${y}) rotate(${sg * r})">${gel(R(-2.6, 0, 5.2, 17 - i * 1.4, 1.4), i % 2 ? 'lila' : 'rosa', .7)}</g>`).join('');
  /* cría: el cubo todavía está DENTRO de la mitad de abajo del huevo (pared de atrás oscura, cáscara de adelante curva) */
  const { boxBody, owlFace } = M.B.H;
  const cascara = (cx, hw, top) => { /* zigzag del borde: puntas arriba y abajo */
    const n = 10, pts = [...Array(n + 1)].map((_, i) => [f1(cx - hw + i * 2 * hw / n), f1(top + (i % 2 ? 3.6 : 0))]);
    return pts;
  };
  const cubuhoCria = () => {
    const cx = 3, hw = 24, L = PAL.lila;
    const back = cascara(cx, hw - 1.4, -18).map(([x, y], i) => [x, y - (i % 2 ? 0 : 1.6)]);
    const front = cascara(cx, hw, -10.6);
    let s = '<defs><radialGradient id="km-cas" cx=".35" cy=".2" r=".95"><stop offset="0" stop-color="#f3eeff"/><stop offset=".55" stop-color="#cdbcff"/><stop offset="1" stop-color="#9c84ec"/></radialGradient></defs>' + piso(24, cx);
    s += `<path d="M${cx - hw} -8${back.map(([x, y]) => `L${x} ${y}`).join('')}L${cx + hw} -8Q${cx} -3 ${cx - hw} -8Z" fill="#a993ea" stroke="${L[3]}" stroke-width="1.1" stroke-linejoin="round"/>`
      + `<path d="M${cx - hw + 3} -10Q${cx} -6 ${cx + hw - 3} -10" fill="none" stroke="#8f78d8" stroke-width="2" opacity=".6"/>`; /* sombra adentro */
    s += `<g transform="translate(0 -3)">${boxBody(13, 27, 'lila')}${owlFace(-28, 6.6)}<path d="M1 -34.4Q-1 -40 3.6 -40.4Q6.6 -40.4 5.6 -37.4" fill="none" stroke="${L[2]}" stroke-width="2" stroke-linecap="round"/></g>`;
    const fd = `M${front[0][0]} ${front[0][1]}${front.slice(1).map(([x, y]) => `L${x} ${y}`).join('')}Q${cx + hw + 1} 1.4 ${cx} 1.4Q${cx - hw - 1} 1.4 ${front[0][0]} ${front[0][1]}Z`;
    s += `<path d="${fd}" fill="url(#km-cas)" stroke="${L[3]}" stroke-width="1.2" stroke-linejoin="round"/>`;
    s += [[-9, -4], [12, -5.2]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M-2.4 -.6L0 -2L2.4 -.6V2L0 3.2L-2.4 2Z" fill="${L[0]}" stroke="${L[3]}" stroke-width=".5"/><path d="M-2.4 -.6L0 .8L2.4 -.6M0 .8V3.2" fill="none" stroke="${L[3]}" stroke-width=".5"/></g>`).join('');
    s += arc(`M${cx - hw + 3} -6Q${cx - hw + 5} -1.6 ${cx - hw + 10} -.8`, 1.6, .8) + dot(cx + 3, -3, .8);
    return s;
  };
  const cubuhoC = k => k === 1 ? cubuhoCria() : k === 4 ? fan(-13, -16, 1) + fan(21, -18, -1) + M.DRAW.cubuho(4) : M.DRAW.cubuho(k);

  /* ---------- 3 · Cienpiecito: anillos redondos y cabeza de baldosa; de grande se levanta ---------- */
  const tileHead = (x, y, s, gold) => [-1, 1].map(g => `<path d="M${f1(x + g * s * .2)} ${f1(y - s * .46)}Q${f1(x + g * s * .28)} ${f1(y - s * .86)} ${f1(x + g * s * .5)} ${f1(y - s * .92)}" fill="none" stroke="${PAL.naranja[3]}" stroke-width="1.2" stroke-linecap="round"/>`
      + gel(C(f1(x + g * s * .53), f1(y - s * .95), 2.1), gold ? 'oro' : 'rosa', .7)).join('')
    + gel(R(f1(x - s / 2), f1(y - s * .46), s, f1(s * .92), f1(s * .36)), gold ? 'oro' : 'amarillo', 1.3)
    + arc(`M${f1(x - s * .36)} ${f1(y - s * .02)}Q${f1(x - s * .34)} ${f1(y - s * .3)} ${f1(x - s * .06)} ${f1(y - s * .34)}`, 1.6, .8)
    + face(f1(x + .4), f1(y + s * .06), s / 19.5, { boca: s > 19.6 ? 'abierta' : 'sonrisa' });
  const CC = {
    1: { r: 8, s: [[-12, -8.4, 'pu'], [-3, -9.6, 'pu']], h: [9.6, -14, 19.4] },
    2: { r: 7.6, s: [[-23, -8, 'pd'], [-14, -9.6, 'pd'], [-5, -8.4, 'pu'], [4, -9.6, 'pu']], h: [16.4, -14, 19.4] },
    3: { r: 7.2, s: [[-27, -7.2, 'pc'], [-19, -7.2, 'pc'], [-11, -7.6, 'pd'], [-4.4, -11.6, 'pd'], [-.4, -18.4, 'pu'], [1.4, -25.8, 'pu']], h: [2.6, -38.4, 20], arms: -26 },
    4: { r: 7, s: [[-29, -7, 'oro'], [-21.4, -7, 'pc'], [-13.8, -7.2, 'pc'], [-6.8, -9.8, 'pd'], [-2.4, -15.6, 'pd'], [0, -22, 'pu'], [1.4, -28.6, 'pu']], h: [2.2, -40.4, 19.4], arms: -28 },
  };
  const cienpiecitoC = k => {
    const Q = CC[k], r = Q.r, [hx, hy, hsz] = Q.h, gold = k === 4;
    let s = piso(k >= 3 ? 26 : 24, k >= 3 ? -10 : -2);
    s += Q.s.filter(([, y]) => y > -9).map(([x, y, c]) => [-2.6, 2.6].map(dx => `<path d="M${f1(x + dx)} ${f1(y + r * .6)}L${f1(x + dx * 1.2)} -1.2" stroke="${PAL[c][3]}" stroke-width="1.6" stroke-linecap="round"/>`
      + (gold ? gel(E(f1(x + dx * 1.2 + .6), -1, 1.9, 1.2), 'oro', .5) : `<circle cx="${f1(x + dx * 1.2)}" cy="-1.1" r="1.1" fill="${PAL[c][2]}"/>`)).join('')).join('');
    s += Q.s.filter(([, y]) => y <= -9).map(([x, y, c]) => [-1, 1].map(g => `<path d="M${f1(x + g * r * .8)} ${f1(y + 1)}l${g * 2.6} 1.6" stroke="${PAL[c][3]}" stroke-width="1.4" stroke-linecap="round"/>`).join('')).join('');
    if (Q.arms) s += [-1, 1].map(g => `<path d="M${f1(1 + g * 5)} ${Q.arms}Q${f1(1 + g * 11)} ${Q.arms + 1} ${f1(1 + g * 12)} ${Q.arms - 5}" fill="none" stroke="${PAL.pu[3]}" stroke-width="2.4" stroke-linecap="round"/><circle cx="${f1(1 + g * 12)}" cy="${Q.arms - 5.6}" r="1.8" fill="${PAL.pu[1]}" stroke="${PAL.pu[3]}" stroke-width=".6"/>`).join('');
    s += Q.s.map(([x, y, c]) => gel(C(x, y, r), c, 1.1) + arc(`M${f1(x - r * .62)} ${f1(y - r * .1)}Q${f1(x - r * .5)} ${f1(y - r * .66)} ${f1(x - r * .02)} ${f1(y - r * .72)}`, 1.4, .8)).join('');
    s += tileHead(hx, hy, hsz, gold);
    if (gold) s = aura(-22, 46) + s + corona(hx, f1(hy - hsz * .6), .9, -6) + chispas([[-30, -24, 3], [26, -40, 2.6], [24, -10, 2.2]]);
    return s;
  };

  /* ---------- 4 · Pulpatrón: el de la A; de grande levanta dos tentáculos con su patrón y de brillante flota ---------- */
  const brazos = (cols, oy = 0) => [-1, 1].map(g => tent(`M${g * 14} ${-24 + oy}Q${g * 25} ${-25 + oy} ${g * 25} ${-36 + oy}Q${g * 25} ${-42 + oy} ${g * 19.6} ${-41 + oy}`, 'rosa', 4.8)
    + [[20.4, -25.6], [24.6, -31], [24, -37]].map(([x, y], i) => pin(g * x, y + oy, cols[(i + (g > 0 ? 1 : 0)) % cols.length], 1.6)).join('')).join('');
  const pulpatronC = k => {
    if (k <= 2) return M.DRAW.pulpatron(k);
    if (k === 3) return brazos(ABC) + M.DRAW.pulpatron(3);
    return `<ellipse cx="0" cy="0" rx="15" ry="3.2" fill="url(#km-piso)"/><g transform="translate(0 -4)">${brazos(['#ff4d64', '#ffa23d', '#ffd23c', '#7fd650', '#5fb0ff', '#a98cff'])}${M.DRAW.pulpatron(4).replace(/<ellipse cx="0" cy="0"[^>]*url\(#km-piso\)[^>]*\/>/, '')}</g>`;
  };

  /* ---------- 5 · Chinitabla: la de la A con cabeza de casco; saluda, se para y vuela ---------- */
  const DOTS = {
    1: { r: 3, p: [[-12, -29], [-15.6, -19.6]] },
    2: { r: 2.05, p: [[-17.6, -30.4], [-8.8, -30.4], [-13.2, -25.6], [-17.6, -20.8], [-8.8, -20.8]] },
    3: { r: 1.55, p: [-33.4, -29.4, -25.4, -21.4, -17.4].flatMap(y => [[-15.6, y], [-11.4, y]]) },
  };
  const chinitablaC = k => {
    if (k === 4) return M.B.DRAW.chinitabla(4);
    const D = DOTS[k], oy = k === 3 ? -6 : 0;
    let s = piso(28), b = '';
    if (k === 3) b += [-1, 1].map(g => `<path d="M${g * 6} -4L${g * 7} 4.6" stroke="${PAL.oscuro[2]}" stroke-width="2.8" stroke-linecap="round"/>` + gel(E(g * 8, 5, 3, 1.6), 'oscuro', .6)).join('');
    else b += [[-15], [-6.5], [6.5], [15]].map(([x]) => `<path d="M${x} -6L${f1(x * 1.15)} -1" stroke="${PAL.oscuro[2]}" stroke-width="2" stroke-linecap="round"/><circle cx="${f1(x * 1.15)}" cy="-1" r="1.4" fill="${PAL.oscuro[1]}"/>`).join('');
    if (k >= 2) b += [-1, 1].map(g => `<path d="M${g * 20} -14Q${g * 27} -15 ${g * 28} -23" fill="none" stroke="${PAL.oscuro[2]}" stroke-width="2.4" stroke-linecap="round"/><circle cx="${g * 28.2}" cy="-23.6" r="2" fill="${PAL.oscuro[1]}"/>`).join('');
    b += gel(P('M-22.6 -6.4Q-27.6 -41 0 -42.6Q27.6 -41 22.6 -6.4Q0 1.6 -22.6 -6.4Z'), 'rojo', 1.4) + `<path d="M0 -42.4V-17" stroke="${PAL.rojo[3]}" stroke-width="1.3" stroke-linecap="round"/>`;
    b += D.p.map(([x, y]) => spot(x, y, D.r) + spot(-x, y, D.r)).join('');
    b += arc('M-21.4 -15Q-22.4 -27 -18.4 -33.4', 2, .75) + arc('M-6 -39.6Q-2.6 -41 1 -40.8', 1.4, .7);
    b += antenas(-3, 1.1) + helmet(-3, 1.16);
    return s + `<g transform="translate(0 ${oy})">${b}</g>`;
  };

  const DRAW_C = { tortugono: tortugonoC, cubuho: cubuhoC, cienpiecito: cienpiecitoC, pulpatron: pulpatronC, chinitabla: chinitablaC };
  const SCALE_C = [1, .66, .84, 1, 1.02];
  const mascC = (id, k, { sombra = false } = {}) => {
    const art = k === 0 ? `<g class="wob">${M.huevo(id)}</g>` : `<g class="idle">${DRAW_C[id](k)}</g>`;
    return `<g transform="scale(${k === 0 ? 1.1 : SCALE_C[k]})"${sombra ? ' filter="url(#km-sombra)"' : ''}>${art}</g>`;
  };
  M.C = { DRAW: DRAW_C, SCALE: SCALE_C, masc: mascC };
})(typeof window !== 'undefined' ? window : global);
