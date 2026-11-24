/* Tanda B de las mascotas (pedido de la dueña, 24-11-2026): cada etapa cambia la FORMA del animal, como una evolución
   (Pokémon o Digimon), y el cuerpo y la cabeza toman la forma del tema, como el búho cubo (el favorito). Sin cabezas
   redondas. Usa las piezas Gel de boceto-mascotas.js (BOCETO_MASC.H); se carga después de ese archivo.
   - Tortugono: de pie y de frente; cabeza, panza y caparazón con la figura de la etapa: triángulo → cuadrado → hexágono → octágono.
   - Cubúho: cubo recién salido del huevo → cubo con alas de prisma → prisma alto con orejas de cono y patas de cilindro → alas abiertas.
   - Cienpiecito: hecho de bloques de base 10: unidades que gatean → una decena que se arquea → se levanta (C, D, U) → Milpiés abrazado a un cubo de mil.
   - Pulpatrón: gotita con 2 patitas → campana con franja AB → pulpo «dumbo» con orejitas y espirales que crecen → flota con tentáculos arcoíris.
   - Chinitabla: bolita con pintas de 2 → caparazón de corazón con 5 y 5 → abre el caparazón como capa (10 y 10) → vuela. */
(function (root) {
  const M = root.BOCETO_MASC, { PAL } = M;
  const { P, C, E, R, gel, flat, arc, dot, piso, face, starD, aura, corona, chispas, f1 } = M.H;
  /* polígono regular con esquinas redondeadas (t = cuánto se redondea; sx, sy = estirar) */
  const rpoly = (cx, cy, r, n, { t = .3, sx = 1, sy = 1 } = {}) => {
    const a0 = Math.PI / 2 + Math.PI / n, v = [...Array(n)].map((_, i) => { const a = a0 + i * 2 * Math.PI / n; return [cx + r * sx * Math.cos(a), cy + r * sy * Math.sin(a)]; });
    let d = ''; v.forEach((p, i) => { const pr = v[(i + n - 1) % n], nx = v[(i + 1) % n];
      d += (i ? 'L' : 'M') + f1(p[0] + (pr[0] - p[0]) * t) + ' ' + f1(p[1] + (pr[1] - p[1]) * t) + 'Q' + f1(p[0]) + ' ' + f1(p[1]) + ' ' + f1(p[0] + (nx[0] - p[0]) * t) + ' ' + f1(p[1] + (nx[1] - p[1]) * t); });
    return P(d + 'Z');
  };
  const vert = (cx, cy, r, n, k = 1) => { const a0 = Math.PI / 2 + Math.PI / n; return [...Array(n)].map((_, i) => { const a = a0 + i * 2 * Math.PI / n; return [f1(cx + r * k * Math.cos(a)), f1(cy + r * k * Math.sin(a))]; }); };

  /* ---------- 1 · Tortugono: de pie, la figura de la etapa en cabeza, panza y caparazón ---------- */
  const TB = {
    1: { n: 3, sh: [-12, 15.5], pl: 9.5, hn: 3, hd: [-27, 12.6, .36], arm: 9.6 },
    2: { n: 4, sh: [-16, 17], pl: 10.6, hn: 4, hd: [-33, 12, .42], arm: 12 },
    3: { n: 6, sh: [-19, 21], pl: 13, hn: 5, hd: [-38.5, 12.6, .34], arm: 15 },
    4: { n: 8, sh: [-20, 22.5], pl: 13.6, hn: 6, hd: [-40, 12.6, .32], arm: 15.6 },
  };
  const tortugonoB = k => {
    const T = TB[k], [sy, sr] = T.sh, tile = k === 4 ? 'oro' : 'amarillo';
    let s = piso(sr + 4);
    s += gel(rpoly(0, sy, sr, T.n, { t: .26 }), 'verde', 1.5); /* caparazón (atrás) */
    s += vert(0, sy, sr, T.n, .8).map(([x, y]) => gel(rpoly(x, y, k === 1 ? 2.8 : 3.1, T.n, { t: .2 }), tile, .8)).join('');
    s += arc(`M${f1(-sr * .7)} ${f1(sy + 2)}Q${f1(-sr * .78)} ${f1(sy - sr * .45)} ${f1(-sr * .42)} ${f1(sy - sr * .72)}`, 1.8, .7);
    const lx = sr * .42;
    s += [-1, 1].map(g => gel(E(f1(g * lx), -3.4, k === 1 ? 4.4 : 5.6, k === 1 ? 3.4 : 4), 'menta', 1.1) + `<path d="M${f1(g * lx - 2)} -.6h4" stroke="${PAL.menta[3]}" stroke-width=".7" stroke-linecap="round" opacity=".5"/>`).join('');
    s += [-1, 1].map(g => `<g transform="translate(${f1(g * T.arm)} ${f1(sy - 1)}) rotate(${g * -24})">${gel(E(0, 0, k === 1 ? 3 : 3.8, k === 1 ? 4.6 : 6), 'menta', 1)}</g>`).join('');
    s += gel(rpoly(0, sy + 1.4, T.pl, T.n, { t: .3 }), k === 4 ? 'oro' : 'vainilla', 1.2); /* panza */
    s += gel(rpoly(0, sy + 1.4, T.pl * .55, T.n, { t: .3 }), k === 4 ? 'vainilla' : 'amarillo', .7);
    s += arc(`M${f1(-T.pl * .55)} ${f1(sy - T.pl * .1)}Q${f1(-T.pl * .45)} ${f1(sy - T.pl * .5)} ${f1(-T.pl * .1)} ${f1(sy - T.pl * .55)}`, 1.3, .7);
    const [hy, hr, ht] = T.hd;
    s += gel(rpoly(0, hy, hr, T.hn, { t: ht, sy: T.hn === 3 ? .92 : .86 }), 'menta', 1.4); /* cabeza con la figura */
    s += `<circle cx="${f1(hr * .5)}" cy="${f1(hy - hr * .4)}" r="1.3" fill="${PAL.menta[0]}"/><circle cx="${f1(hr * .7)}" cy="${f1(hy - hr * .14)}" r=".9" fill="${PAL.menta[0]}"/>`;
    s += arc(`M${f1(-hr * .62)} ${f1(hy - hr * .05)}Q${f1(-hr * .55)} ${f1(hy - hr * .5)} ${f1(-hr * .18)} ${f1(hy - hr * .62)}`, 1.6, .8);
    s += face(0, f1(hy + hr * (T.hn === 3 ? .22 : .12)), k === 1 ? 1.02 : 1.08, { boca: k >= 3 ? 'abierta' : 'sonrisa' });
    if (k === 4) s = aura(-24, 42) + s + corona(0, f1(hy - hr * .78), 1.05) + chispas([[-28, -40, 3], [28, -44, 2.6], [30, -12, 2.2]]);
    return s;
  };

  /* ---------- 2 · Cubúho: cubo → cubo con alas → prisma alto → alas abiertas ---------- */
  const boxBody = (w, h, body) => {
    const B = PAL[body], y1 = -1, y0 = y1 - h;
    return flat(P(`M${w - 1} ${y0 + 2}L${w + 7} ${y0 - 5}Q${w + 9} ${y0 - 6.4} ${w + 9} ${y0 - 4}L${w + 9} ${y1 - 7}Q${w + 9} ${y1 - 5} ${w + 7.4} ${y1 - 4}L${w - 1} ${y1}Z`), B[2], B[3], 1.2)
      + flat(P(`M${-w + 3} ${y0 + 1}L${-w + 10} ${y0 - 6.6}Q${-w + 11} ${y0 - 7.6} ${-w + 12.6} ${y0 - 7.6}L${w + 6.6} ${y0 - 7.6}Q${w + 9.6} ${y0 - 7.6} ${w + 7.4} ${y0 - 5.4}L${w + .4} ${y0 + 1}Z`), B[0], B[3], 1.2)
      + gel(R(-w, y0, 2 * w, h, 6.5), body, 1.4)
      + arc(`M${-w + 3.6} ${y0 + 9}Q${-w + 3.4} ${y0 + 3.6} ${-w + 9} ${y0 + 3.4}`, 1.8, .8) + `<path d="M${-w + 12} ${y0 - 5.4}H${w}" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`;
  };
  const owlFace = (y0, er) => gel(C(-7, y0 + 12, er), 'crema', 1) + gel(C(7, y0 + 12, er), 'crema', 1) + face(0, y0 + 13, 1.32, { sep: 5.3, boca: 'nada', mej: false })
    + `<ellipse cx="-12.4" cy="${y0 + 19.4}" rx="2.6" ry="1.5" fill="url(#km-mej)"/><ellipse cx="12.4" cy="${y0 + 19.4}" rx="2.6" ry="1.5" fill="url(#km-mej)"/>`
    + gel(P(`M-2.4 ${y0 + 18.6}Q0 ${y0 + 17.4} 2.4 ${y0 + 18.6}L.4 ${y0 + 22}Q0 ${y0 + 22.6} -.4 ${y0 + 22}Z`), 'naranja', .8);
  const prismFeathers = (pts, col) => pts.map(([x, y, r, l]) => `<g transform="translate(${x} ${y}) rotate(${r})">${flat(R(-2.4, 0, 4.8, l, 1), PAL[col][1], PAL[col][3], .7)}<rect x=".9" y=".4" width="1.4" height="${l - .8}" fill="${PAL[col][2]}"/></g>`).join('');
  const cubuhoB = k => {
    const W = [0, 13, 16, 15, 15][k], H = [0, 27, 32, 41, 41][k], body = k === 4 ? 'oro' : 'lila', B = PAL[body], y0 = -1 - H;
    let s = piso(W + 10, 2);
    if (k >= 3) s += [-7, 7].map(x => gel(R(x - 3.4, -6, 6.8, 6, 2), 'naranja', .9) + `<ellipse cx="${x}" cy="-6" rx="3.4" ry="1.2" fill="${PAL.naranja[0]}"/>`).join(''); /* patas de cilindro */
    else s += gel(E(-6, -1.2, 4, 2.2), 'naranja', .9) + gel(E(6, -1.2, 4, 2.2), 'naranja', .9);
    if (k === 4) { /* alas abiertas en abanico de prismas, detrás del cuerpo */
      s += [70, 100, 130, 160].map((r, i) => `<g transform="translate(${-W + 3} ${y0 + 20}) rotate(${r})">${flat(R(-2.6, 0, 5.2, 17 - i, 1.2), PAL[i % 2 ? 'lila' : 'rosa'][1], PAL[i % 2 ? 'lila' : 'rosa'][3], .7)}</g>`).join('');
      s += [-70, -100, -130, -160].map((r, i) => `<g transform="translate(${W + 6} ${y0 + 18}) rotate(${r})">${flat(R(-2.6, 0, 5.2, 17 - i, 1.2), PAL[i % 2 ? 'lila' : 'rosa'][1], PAL[i % 2 ? 'lila' : 'rosa'][3], .7)}</g>`).join('');
    }
    s += boxBody(W, H, body);
    if (k >= 3) s += flat(E(0, -9, 9.6, 6.4), B[0], B[2], .9) + [-4.4, 0, 4.4].map(x => gel(C(x, -6.6, 1.5), k === 4 ? 'rosa' : 'amarillo', .5) + dot(x - .5, -7.1, .45)).join('');
    else s += flat(E(0, -7.5, W * .62, 5.4), B[0], B[2], .9);
    s += [[-5, y0 + H - 9.6], [0, y0 + H - 10.6], [5, y0 + H - 9.6]].map(([x, y]) => `<path d="M${x - 1.5} ${y - .8}L${x} ${y + .6}L${x + 1.5} ${y - .8}" fill="none" stroke="${B[2]}" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    if (k === 2 || k === 3) { /* alitas plegadas con plumas de prisma */
      s += [-1, 1].map(g => `<g transform="translate(${g < 0 ? -W + .5 : W + 6} ${y0 + 15}) scale(${g} 1)">${gel(P('M0 -3Q-8 -1 -7.6 8Q-7 12 -3 11Q0 7 0 3Z'), body, 1.1)}`
        + [[-6.4, 0], [-6, 3.6], [-4.8, 7.2]].map(([x, y]) => flat(R(x, y, 4.4, 2.6, .6), PAL.azul[1], PAL.azul[3], .6) + `<rect x="${x}" y="${y + 1.8}" width="4.4" height=".8" fill="${PAL.azul[2]}"/>`).join('') + '</g>').join('');
    }
    s += owlFace(y0, k === 1 ? 6.6 : 7.4);
    if (k === 1) s += `<path d="M1 ${y0 - 6.4}Q-1 ${y0 - 12} 3.6 ${y0 - 12.4}Q6.6 ${y0 - 12.4} 5.6 ${y0 - 9.4}" fill="none" stroke="${PAL.lila[2]}" stroke-width="2" stroke-linecap="round"/>`
      + gel(P('M-17 -.4L-17 -8L-13.6 -5L-10 -9L-6.4 -5.4L-2.6 -9.4L1 -5.4L4.8 -9.4L8.4 -5.4L12 -9L15.2 -5.4L17.2 -8L17.2 -.4Q0 2.4 -17 -.4Z'), 'crema', 1); /* cascarón */
    if (k === 2) s += gel(C(-W + 6, y0 - 6, 3), body, 1) + gel(C(W + 3, y0 - 6.4, 3), body, 1);
    if (k >= 3) {
      const cono = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})">${gel(P('M-4.2 1Q0 2.4 4.2 1L1.4 -6.6Q0 -8.6 -1.4 -6.6Z'), k === 4 ? 'rosa' : 'azul', 1)}<ellipse cx="0" cy="1" rx="4.2" ry="1.3" fill="${k === 4 ? PAL.rosa[2] : PAL.azul[2]}"/>${arc('M-1.8 -.6L-.6 -5', .8, .8)}</g>`;
      s += cono(-W + 6.4, y0 - 5.6, -22) + cono(W + 3.6, y0 - 6.6, 22);
    }
    if (k === 4) s = aura(-24, 44) + s + corona(5, y0 - 8.4, 1.05) + chispas([[-30, -12, 3], [32, -34, 2.6], [-26, -48, 2.2]]);
    return s;
  };

  /* ---------- 3 · Cienpiecito: bloques de base 10 (U verde, D naranja, C azul, M dorado) ---------- */
  const blk = (x, y, s, p, rot = 0) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})">${gel(R(-s / 2, -s / 2, s, s, f1(s * .3)), p, s > 9 ? 1.3 : .9)}`
    + `<path d="M${f1(-s * .3)} ${f1(-s * .32)}H${f1(s * .18)}" stroke="#fff" stroke-width="${f1(Math.max(.8, s * .1))}" stroke-linecap="round" opacity=".75"/></g>`;
  const legs = (x, y, s, p, n = 2) => [...Array(n)].map((_, i) => { const dx = n === 1 ? 0 : (i ? 1 : -1) * s * .26; return `<path d="M${f1(x + dx)} ${f1(y + s * .3)}L${f1(x + dx * 1.3)} -1.4" stroke="${PAL[p][3]}" stroke-width="1.3" stroke-linecap="round"/><circle cx="${f1(x + dx * 1.3)}" cy="-1.2" r=".95" fill="${PAL[p][2]}"/>`; }).join('');
  const headBlk = (x, y, s, gold) => {
    let h = [-1, 1].map(g => `<path d="M${f1(x + g * s * .22)} ${f1(y - s * .46)}Q${f1(x + g * s * .3)} ${f1(y - s * .9)} ${f1(x + g * s * .55)} ${f1(y - s * .95)}" fill="none" stroke="${PAL.naranja[3]}" stroke-width="1.2" stroke-linecap="round"/>`
      + gel(R(f1(x + g * s * .58 - 2), f1(y - s * .98 - 2), 4, 4, 1.2), gold ? 'oro' : 'rosa', .7)).join('');
    h += blk(x, y, s, gold ? 'oro' : 'amarillo') + face(f1(x + .4), f1(y + s * .1), s / 13.5, { boca: s > 14 ? 'abierta' : 'sonrisa' });
    return h;
  };
  const cienpiecitoB = k => {
    let s = '';
    if (k === 1) { /* gatea: tres unidades */
      const P1 = [[-15, -5.6], [-8.6, -6.8], [-2.2, -5.8]];
      s += piso(20, -2) + P1.map(([x, y]) => legs(x, y, 6.4, 'pu')).join('') + P1.map(([x, y], i) => blk(x, y, 6.4, 'pu', (i - 1) * 6)).join('') + headBlk(8, -9.6, 13.6);
    }
    if (k === 2) { /* una decena que se arquea como cuncuna */
      const pts = [...Array(10)].map((_, i) => { const t = i / 9; return [f1(-22 + 32 * t), f1(-3.6 - 17 * Math.sin(Math.PI * t))]; });
      s += piso(26, -2) + pts.filter(([, y]) => y > -9).map(([x, y]) => legs(x, y, 5.8, 'pd')).join('')
        + pts.map(([x, y], i) => blk(x, y, 5.8, 'pd', (i - 4.5) * 9)).join('') + headBlk(20, -9.6, 14.4);
    }
    if (k === 3) { /* se levanta: centenas en el suelo, decenas al subir, unidades arriba; con bracitos */
      const B3 = [[-25, -4.4, 'pc'], [-18.4, -4.4, 'pc'], [-11.8, -4.6, 'pc'], [-5.4, -5.4, 'pd'], [.2, -9.4, 'pd'], [3.4, -15.4, 'pd'], [4.8, -21.8, 'pu'], [5.2, -28.2, 'pu']];
      s += piso(26, -6) + B3.slice(0, 4).map(([x, y, c]) => legs(x, y, 7, c)).join('');
      s += [-1, 1].map(g => `<path d="M${f1(5 + g * 3)} -27Q${f1(5 + g * 9)} -26 ${f1(5 + g * 10)} -31" fill="none" stroke="${PAL.pu[3]}" stroke-width="2.4" stroke-linecap="round"/><circle cx="${f1(5 + g * 10)}" cy="-31.4" r="1.6" fill="${PAL.pu[1]}" stroke="${PAL.pu[3]}" stroke-width=".6"/>`).join('');
      s += B3.map(([x, y, c], i) => blk(x, y, 7, c, i > 3 ? -8 : 0)).join('') + headBlk(5.4, -39.4, 16);
    }
    if (k === 4) { /* Milpiés abraza un cubo de mil */
      const cx = 2, top = -30, w = 24;
      const O = PAL.oro, grid = [1, 2].map(i => `<path d="M${f1(cx - w / 2 + i * w / 3)} ${top}V-2M${f1(cx - w / 2)} ${f1(top + i * (w + 4) / 3)}H${f1(cx + w / 2)}" stroke="${O[2]}" stroke-width=".8" opacity=".8"/>`).join('');
      const cube = flat(P(`M${cx + w / 2} ${top}L${cx + w / 2 + 8} ${top - 6.4}V-8.4L${cx + w / 2} -2Z`), O[2], O[3], 1.2)
        + flat(P(`M${cx - w / 2} ${top}L${cx - w / 2 + 8} ${top - 6.4}H${cx + w / 2 + 8}L${cx + w / 2} ${top}Z`), O[0], O[3], 1.2)
        + gel(R(cx - w / 2, top, w, 28, 3.4), 'oro', 1.3) + grid + arc(`M${cx - w / 2 + 3} ${top + 9}Q${cx - w / 2 + 3} ${top + 3} ${cx - w / 2 + 9} ${top + 3}`, 1.8, .85);
      const B4 = [[-28, -4.4, 'pc'], [-21.4, -4.4, 'pc'], [-15, -6.4, 'pd'], [-11.6, -12.6, 'pd'], [-10.8, -19.4, 'pu'], [-9.4, -26, 'pu'], [-5.6, -31.8, 'pu']];
      s += aura(-22, 46) + piso(30, -4) + cube + B4.slice(0, 3).map(([x, y, c]) => legs(x, y, 7, c)).join('')
        + B4.map(([x, y, c], i) => blk(x, y, 7, c, i > 2 ? 10 : 0)).join('') + headBlk(4, -43.6, 16, true)
        + corona(4, -55.6, 1) + chispas([[-30, -30, 3], [32, -36, 2.6], [30, -6, 2.2]]);
    }
    return s;
  };

  /* ---------- 4 · Pulpatrón: gotita → campana → pulpo dumbo con espirales → flota ---------- */
  const tent = (d, body = 'rosa', w = 5) => `<path d="${d}" fill="none" stroke="${PAL[body][3]}" stroke-width="${w + 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="url(#km-${body})" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const pin = (x, y, c, r = 1.6) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${c}" stroke="#fff" stroke-width=".55"/>`;
  const AB = ['#ffd23c', '#5fb0ff'], ABC = ['#ffd23c', '#5fb0ff', '#7fd650'];
  const RAIN = ['#ff4d64', '#ffa23d', '#ffd23c', '#7fd650', '#5fd6b0', '#5fb0ff', '#a98cff', '#ff8cbf'];
  const pulpatronB = k => {
    const B = PAL.rosa; let s = '';
    if (k === 1) { /* gotita con puntita enrollada y dos patitas */
      s += piso(12) + tent('M-4 -8Q-4.6 -2 -7.4 -2', 'rosa', 4.6) + tent('M4 -8Q4.6 -2 7.4 -2', 'rosa', 4.6) + pin(-4.6, -4.4, AB[0], 1.3) + pin(4.6, -4.4, AB[1], 1.3);
      s += gel(P('M0 -28Q3.4 -28 2.4 -24.6Q13 -20 12.4 -11.6Q12 -5.4 0 -5.4Q-12 -5.4 -12.4 -11.6Q-13 -20 -2.6 -24Q-4.6 -26 -2.4 -27.6Q-1.4 -28 0 -28Z'), 'rosa', 1.3);
      s += arc('M-8.6 -12.6Q-8.4 -18.6 -3.4 -21', 1.6, .8) + face(0, -12.4, 1.02, {});
    }
    if (k === 2) { /* campana con franja de patrón AB y 4 tentáculos ondulados */
      [-9, -3, 3, 9].forEach((x, i) => { s += tent(`M${x} -12Q${x - 3} -8 ${x} -5Q${x + 3} -2 ${x + (x < 0 ? -2 : 2)} -1.6`, 'rosa', 4.4); });
      s = piso(16) + s;
      s += gel(P('M-15 -13Q-16.6 -37 0 -38Q16.6 -37 15 -13Q16.4 -9 12.6 -9.4Q9.6 -12 6.4 -9.4Q3.2 -12 0 -9.4Q-3.2 -12 -6.4 -9.4Q-9.6 -12 -12.6 -9.4Q-16.4 -9 -15 -13Z'), 'rosa', 1.4);
      s += [-10.5, -5.2, 0, 5.2, 10.5].map((x, i) => pin(x, -15.4, AB[i % 2], 1.9)).join('');
      s += arc('M-11 -20Q-11.4 -30 -4 -34', 2, .78) + face(0, -24.4, 1.16, { sep: 3.8 });
    }
    if (k === 3) { /* pulpo dumbo: orejitas, tentáculos que terminan en espiral y pintas que crecen 1, 2, 3 */
      const X = [-19, -11.4, -3.8, 3.8, 11.4, 19];
      s += piso(24);
      X.forEach((x, i) => { const g = x < 0 ? -1 : 1, ex = x + g * 4.6;
        s += tent(`M${f1(x * .6)} -14Q${f1(x * .85)} -3 ${f1(ex)} -3.4Q${f1(ex + g * 3.2)} -3.8 ${f1(ex + g * 2)} -6.8`, 'rosa', 4.4);
        s += [...Array(i % 3 + 1)].map((_, j) => pin(x * .7 + g * j * .7, -11.4 + j * 3, ABC[i % 3], 1.45)).join(''); });
      s += [-1, 1].map(g => `<g transform="translate(${g * 15} -32) rotate(${g * 24}) scale(${g} 1)">${gel(P('M0 0Q8 -6 12 -2Q12 4 2 6Z'), 'rosa', 1.1)}${arc('M3 0Q6 -3 9 -2.4', 1, .7)}</g>`).join('');
      s += gel(P('M-16 -14Q-19 -46 0 -48Q19 -46 16 -14Q8 -10.6 0 -12Q-8 -10.6 -16 -14Z'), 'rosa', 1.4);
      s += [[-6, 1], [0, 2], [6, 3]].map(([x, n]) => [...Array(n)].map((_, j) => pin(x, -42.6 + j * 3.2, ABC[(x + 6) / 6], 1.35)).join('')).join('');
      s += arc('M-12.4 -20Q-13 -32 -6.4 -38', 2.2, .78) + face(0, -24, 1.28, { sep: 3.8, boca: 'abierta' });
    }
    if (k === 4) { /* flota con 8 tentáculos arcoíris abiertos como flor */
      s += `<ellipse cx="0" cy="0" rx="14" ry="3" fill="url(#km-piso)"/>`;
      const Y = -8;
      RAIN.forEach((c, i) => { const x1 = f1(-25 + i * 50 / 7), g = x1 < 0 ? -1 : 1, y1 = f1(-7 - Math.abs(x1) / 25 * 9);
        s += tent(`M${f1(x1 * .3)} -22Q${f1(x1 * .75)} ${f1(y1 + 7)} ${x1} ${y1}Q${f1(x1 + g * 3.4)} ${f1(y1 - 2.4)} ${f1(x1 + g * 1.6)} ${f1(y1 - 5)}`, 'rosa', 4.2) + pin(x1 * .62, y1 + 3.6, c, 1.6) + pin(x1 * .86, y1 + 1, c, 1.3); });
      s += [-1, 1].map(g => `<g transform="translate(${g * 15} -40) rotate(${g * 34}) scale(${g} 1)">${gel(P('M0 0Q8 -6 12 -2Q12 4 2 6Z'), 'rosa', 1.1)}</g>`).join('');
      s += gel(P('M-16 -22Q-19 -54 0 -56Q19 -54 16 -22Q8 -18.6 0 -20Q-8 -18.6 -16 -22Z'), 'rosa', 1.4);
      s += [-7.6, -2.6, 2.6, 7.6].map((x, i) => `<path d="${starD(1.9, x, -48 + Math.abs(x) * .35)}" fill="${RAIN[i * 2]}" stroke="#fff" stroke-width=".4"/>`).join('');
      s += arc('M-12.4 -28Q-13 -40 -6.4 -46', 2.2, .78) + face(0, -32, 1.28, { sep: 3.8, boca: 'abierta' });
      s = aura(-30, 42) + s + corona(0, -55.6, 1.05) + chispas([[-30, -48, 3], [30, -50, 2.6], [-28, -4, 2.2]]);
    }
    return s;
  };

  /* ---------- 5 · Chinitabla: bolita → corazón → capa abierta → vuela ---------- */
  const helmet = (y, s = 1) => `<g transform="translate(0 ${y}) scale(${s})">${gel(P('M-9.4 1Q-11 -11 0 -12.4Q11 -11 9.4 1Q0 4.4 -9.4 1Z'), 'oscuro', 1.2)}${arc('M-6.6 -2Q-6.6 -8 -2 -9.6', 1.4, .55)}${face(0, -3.2, 1.02, { sep: 3.8, boca: 'blanca', blancos: true })}</g>`;
  const antenas = (y, s = 1, gold) => [-1, 1].map(g => `<path d="M${f1(g * 3 * s)} ${f1(y - 11 * s)}Q${f1(g * 4 * s)} ${f1(y - 17 * s)} ${f1(g * 7.6 * s)} ${f1(y - 18 * s)}" fill="none" stroke="${PAL.oscuro[2]}" stroke-width="1.2" stroke-linecap="round"/>` + gel(C(f1(g * 8 * s), f1(y - 18.4 * s), 1.8), gold ? 'oro' : 'oscuro', .6)).join('');
  const spot = (x, y, r, gold) => gold ? `<path d="${starD(r * 1.15, x, y)}" fill="url(#km-rojo)" stroke="${PAL.rojo[3]}" stroke-width=".4" stroke-linejoin="round"/>` : gel(C(x, y, r), 'oscuro', .5) + dot(f1(x - r * .32), f1(y - r * .34), f1(r * .3));
  const TEN = [0, 1, 2, 3, 4].flatMap(r => [[-2.4, r * 4.2], [2.4, r * 4.2]]);
  const elytron = (g, col, pts, rS) => { /* media ala con sus pintas; g = -1 izquierda, 1 derecha */
    let e = `<g transform="scale(${g} 1)">${gel(P('M0 0Q-16 1 -16 18Q-15 31 -1 32Q0 16 0 0Z'), col, 1.3)}${pts.map(([x, y]) => spot(-8.6 + x, 7 + y, rS, col === 'oro')).join('')}${arc('M-13 12Q-13.4 5 -8.4 2.6', 1.6, .7)}</g>`;
    return e;
  };
  const chinitablaB = k => {
    let s = '';
    if (k === 1) { /* bolita sentada con pintas de 2 */
      s += piso(14) + [-1, 1].map(g => `<circle cx="${g * 7}" cy="-1.2" r="1.6" fill="${PAL.oscuro[1]}"/>`).join('');
      s += gel(P('M-13 -3Q-15 -24 0 -25Q15 -24 13 -3Q0 1 -13 -3Z'), 'rojo', 1.3) + `<path d="M0 -24.6V-12" stroke="${PAL.rojo[3]}" stroke-width="1.1"/>`;
      s += [[-7.6, -19], [-9.6, -11.6]].map(([x, y]) => spot(x, y, 2.4) + spot(-x, y, 2.4)).join('') + arc('M-11 -9Q-11.6 -17 -7 -21', 1.6, .7);
      s += antenas(-3.6, .8) + helmet(-3.6, .86);
    }
    if (k === 2) { /* caparazón de corazón, 5 y 5 pintas, bracitos que saludan */
      s += piso(20) + [-1, 1].map(g => `<path d="M${g * 7} -5L${g * 9} -1" stroke="${PAL.oscuro[2]}" stroke-width="2" stroke-linecap="round"/><circle cx="${g * 9.2}" cy="-1" r="1.5" fill="${PAL.oscuro[1]}"/>`).join('');
      s += [-1, 1].map(g => `<path d="M${g * 15} -16Q${g * 21} -18 ${g * 22} -25" fill="none" stroke="${PAL.oscuro[2]}" stroke-width="2.2" stroke-linecap="round"/><circle cx="${g * 22.2}" cy="-25.6" r="1.9" fill="${PAL.oscuro[1]}"/>`).join('');
      s += gel(P('M0 -29Q-6 -38 -14 -34Q-21 -30 -18 -18Q-14 -8 0 -3Q14 -8 18 -18Q21 -30 14 -34Q6 -38 0 -29Z'), 'rojo', 1.4) + `<path d="M0 -29V-14" stroke="${PAL.rojo[3]}" stroke-width="1.2"/>`;
      s += [[0, 0], [-4, -4], [4, -4], [-4, 4], [4, 4]].map(([dx, dy]) => spot(-10 + dx, -24 + dy, 1.8) + spot(10 - dx, -24 + dy, 1.8)).join('');
      s += arc('M-16.6 -20Q-18.4 -28 -13.6 -31.6', 1.8, .7) + antenas(-4, .9) + helmet(-4, .92);
    }
    if (k >= 3) { /* se para y abre el caparazón como capa, asomando sus alas (10 y 10 pintas); la brillante vuela */
      const fly = k === 4, oy = fly ? -8 : 0, col = fly ? 'oro' : 'rojo', op = fly ? 34 : 13;
      s += fly ? `<ellipse cx="0" cy="0" rx="12" ry="2.6" fill="url(#km-piso)"/>` : piso(22);
      let b = '';
      if (!fly) b += [-1, 1].map(g => `<path d="M${g * 4.6} -6L${g * 5.4} -1" stroke="${PAL.oscuro[2]}" stroke-width="2.6" stroke-linecap="round"/>` + gel(E(g * 6.2, -1, 2.8, 1.5), 'oscuro', .6)).join('');
      b += [-1, 1].map(g => `<g transform="translate(0 -34) rotate(${g * (fly ? 62 : 38)})" opacity=".85"><path d="M0 0Q${g * 6} -14 ${g * 4} -24Q${g * -3} -14 0 0Z" fill="#eaf7ff" stroke="#9fd0f0" stroke-width=".9"/><path d="M${g * .6} -3Q${g * 3} -12 ${g * 3} -20" stroke="#bfe2f8" stroke-width=".7" fill="none"/></g>`).join('');
      b += gel(E(0, -20, 9, 13), 'oscuro', 1.1);
      b += [-1, 1].map(g => `<g transform="translate(${g * .6} -38) rotate(${g * op})">${elytron(g, col, TEN, 1.45)}</g>`).join('');
      b += [-1, 1].map(g => `<path d="M${g * 8.6} -14Q${g * 14} -14 ${g * 15} -${fly ? 20 : 9}" fill="none" stroke="${PAL.oscuro[2]}" stroke-width="2.4" stroke-linecap="round"/><circle cx="${g * 15.2}" cy="-${fly ? 20.6 : 8.4}" r="1.9" fill="${PAL.oscuro[1]}"/>`).join('');
      b += antenas(-5.6, 1.15, fly) + helmet(-5.6, 1.2);
      if (fly) b += corona(0, -22.6, .95) + [-1, 1].map(g => `<path d="M${g * 4} -4Q${g * 5} 0 ${g * 3.4} 2" fill="none" stroke="${PAL.oscuro[2]}" stroke-width="2.4" stroke-linecap="round"/>`).join('');
      s += `<g transform="translate(0 ${oy})">${b}</g>`;
      if (fly) s = aura(-26, 44) + s + chispas([[-32, -46, 3], [32, -48, 2.6], [-30, -8, 2.2]]);
    }
    return s;
  };

  const DRAW_B = { tortugono: tortugonoB, cubuho: cubuhoB, cienpiecito: cienpiecitoB, pulpatron: pulpatronB, chinitabla: chinitablaB };
  const SCALE_B = [1, .82, .92, 1, 1];
  const mascB = (id, k, { sombra = false } = {}) => {
    const art = k === 0 ? `<g class="wob">${M.huevo(id)}</g>` : `<g class="idle">${DRAW_B[id](k)}</g>`;
    return `<g transform="scale(${k === 0 ? 1.1 : SCALE_B[k]})"${sombra ? ' filter="url(#km-sombra)"' : ''}>${art}</g>`;
  };
  M.B = { DRAW: DRAW_B, SCALE: SCALE_B, masc: mascB,
    H: { rpoly, helmet, antenas, elytron, tent, pin, TEN, boxBody, owlFace, prismFeathers, spot } }; /* H: piezas para la tanda C */
})(typeof window !== 'undefined' ? window : global);
