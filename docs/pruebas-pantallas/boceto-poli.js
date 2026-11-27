/* Poli nuevo (adelantado de la entrega 4B, 27-11-2026): propuestas para la dueña, parada 1 (lámina quieta).
   Se carga después de boceto-mascotas.js (usa sus piezas Gel). No se carga en la app.
   Tres propuestas, cada una con Poli niña ('a'), niño ('o') y por defecto (''), según save.g:
   - A «Poli gatito»: evolución del Poli de hoy (orejas de triángulo, cuerpo de una pieza), en Gel 3D.
   - B «Poli gomita»: un polígono vivo (cuerpo de hexágono redondeado) que puede cambiar de forma.
   - C «Poli con capucha»: niña o niño chibi con capucha de gatito (la capucha es el Poli de siempre).
   Marco: pies en y = 0, Poli mide ≈ 66 de alto; caja de dibujo -40 -76 80 80.
   pose: { ai, ad: giro de los brazos (grados, 0 = abajo; positivo = hacia arriba por fuera), y: salto, rot: ladeo,
           boca: 'gato'|'abierta'|'o'|'sonrisa', ojos: 'abiertos'|'felices'|'arriba', forma: 6|4|3 (solo B) } */
(function (root) {
  const M = root.BOCETO_MASC, { PAL } = M, { P, C, E, gel, arc, piso, starD, f1 } = M.H;
  /* colores propios de Poli: cuerpo lila de siempre, pelo uva, capucha y piel (C) */
  const PP = {
    poli: ['#efe6ff', '#a98cff', '#7c5cff', '#4f36c8'], uva: ['#a98ae8', '#5a34b8', '#3f1f8f', '#25105c'],
    rosa: PAL.rosa, menta: PAL.menta, oro: PAL.oro, piel: ['#fff1e4', '#ffd7b5', '#f0ad80', '#b8714a'], cafe: PAL.cafe,
  };
  const DEFS = '<defs>' + Object.entries(PP).map(([k, [l, b, d]]) => `<radialGradient id="kp-${k}" cx=".35" cy=".28" r=".92"><stop offset="0" stop-color="${l}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${d}"/></radialGradient>`).join('') + '</defs>';
  const g = (shape, p, w = 1.3) => shape(`fill="url(#kp-${p})" stroke="${PP[p][3]}" stroke-width="${w}" stroke-linejoin="round"`);
  const tubo = (d, p, w) => `<path d="${d}" fill="none" stroke="${PP[p][3]}" stroke-width="${w + 2.4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${PP[p][2]}" stroke-width="${w}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${PP[p][1]}" stroke-width="${f1(w * .55)}" stroke-linecap="round" transform="translate(-.5 -.6)"/>`;
  /* polígono de esquinas redondas (gomita) */
  const rpoly = (cx, cy, r, n, rad) => { const a0 = Math.PI / 2 + Math.PI / n, pts = [...Array(n)].map((_, i) => [cx + r * Math.cos(a0 + i * 2 * Math.PI / n), cy + r * Math.sin(a0 + i * 2 * Math.PI / n)]);
    let d = ''; pts.forEach((p, i) => { const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], u = (q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
      const l = Math.hypot(a[0] - p[0], a[1] - p[1]), t = Math.min(.45, rad / l), s = u(a, t), e = u(b, t);
      d += (i ? 'L' : 'M') + f1(s[0]) + ' ' + f1(s[1]) + 'Q' + f1(p[0]) + ' ' + f1(p[1]) + ' ' + f1(e[0]) + ' ' + f1(e[1]); }); return d + 'Z'; };

  /* cara de Poli: ojos grandes con dos brillos (o felices ^^), boca y mejillas */
  const cara = (x, y, s, { ojos = 'abiertos', boca = 'gato', pest = false, sep = 3.5, mira = 0 } = {}) => {
    let h = `<g transform="translate(${x} ${y}) scale(${s})">`;
    [-sep, sep].forEach((ex, i) => {
      if (ojos === 'felices') h += `<path d="M${ex - 2.2} .2Q${ex} -2.8 ${ex + 2.2} .2" fill="none" stroke="#3a1f3a" stroke-width="1.1" stroke-linecap="round"/>`;
      else { const my = ojos === 'arriba' ? -.7 : 0, mx = mira;
        h += `<ellipse cx="${ex}" cy="-.8" rx="2.4" ry="2.85" fill="url(#km-ojo)"/><circle cx="${f1(ex + .8 + mx)}" cy="${f1(-1.95 + my)}" r="1.05" fill="#fff"/><circle cx="${f1(ex - .7 + mx)}" cy="${f1(.45 + my)}" r=".45" fill="#fff"/>`;
        if (pest) { const o = i ? 1 : -1; h += `<path d="M${f1(ex + o * 2.1)} -2.4l${o * 1.1} -.9M${f1(ex + o * 2.4)} -1.3l${o * 1.2} -.3" stroke="#3a1f3a" stroke-width=".55" stroke-linecap="round"/>`; } }
    });
    h += { gato: `<path d="M-1.6 2.2Q-.8 3.2 0 2.3Q.8 3.2 1.6 2.2" fill="none" stroke="#5a2a44" stroke-width=".8" stroke-linecap="round"/>`,
      sonrisa: `<path d="M-1.3 2.2Q0 3.5 1.3 2.2" fill="none" stroke="#5a2a44" stroke-width=".8" stroke-linecap="round"/>`,
      abierta: `<path d="M-1.6 2Q0 4.9 1.6 2Z" fill="#7a2a44"/><path d="M-.8 3.3Q0 4.2 .8 3.3" fill="#ff8fab"/>`,
      o: `<ellipse cx="0" cy="2.8" rx=".8" ry="1" fill="#7a2a44"/>` }[boca];
    h += `<ellipse cx="${-sep - 2.5}" cy="2.2" rx="2.2" ry="1.4" fill="url(#km-mej)"/><ellipse cx="${sep + 2.5}" cy="2.2" rx="2.2" ry="1.4" fill="url(#km-mej)"/></g>`;
    return h;
  };
  /* brazo que gira desde el hombro (x, y); lado -1 izquierda, 1 derecha */
  const brazo = (x, y, lado, ang, p, largo = 11, ancho = 4.6) => `<g transform="translate(${x} ${y}) rotate(${f1(-lado * ang)})">${g(E(0, f1(largo * .5), ancho, f1(largo * .55)), p, 1.1)}<path d="M${f1(-ancho * .35)} ${f1(largo * .25)}Q${f1(-ancho * .45)} ${f1(largo * .5)} ${f1(-ancho * .2)} ${f1(largo * .7)}" fill="none" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".7"/></g>`;
  const estrella = (x, y, r) => `<path d="${starD(r, x, y)}" fill="url(#kp-oro)" stroke="${PP.oro[3]}" stroke-width=".7" stroke-linejoin="round"/><circle cx="${f1(x - r * .25)}" cy="${f1(y - r * .3)}" r="${f1(r * .16)}" fill="#fff" opacity=".9"/>`;
  const POSE = { ai: 8, ad: 8, y: 0, rot: 0, boca: 'gato', ojos: 'abiertos', mira: 0, forma: 6 };

  /* ---------- A · Poli gatito ---------- */
  const gatito = (v, pose) => {
    const q = { ...POSE, ...pose }; let h = piso(19);
    let b = '';
    /* cola de gato que sube por detrás, con la punta clara */
    b += tubo('M13 -8Q26 -9 25 -22Q24.5 -30 19 -31', 'poli', 4.2);
    /* pelo de atrás (niña): dos colitas a los lados, con colet de estrella */
    if (v === 'a') [-1, 1].forEach(s => { b += g(P(`M${s * 18} -47Q${s * 27} -49 ${s * 30} -41Q${s * 33} -31 ${s * 30} -21Q${s * 29} -18 ${s * 27.4} -20.4Q${s * 28} -30 ${s * 24} -37Q${s * 21} -41 ${s * 18} -41Z`), 'uva', 1.1)
      + arc(`M${s * 26} -45Q${s * 29.6} -40 ${s * 30} -33`, .8, .6) + `<circle cx="${s * 21.6}" cy="-45" r="2.5" fill="url(#kp-menta)" stroke="${PP.menta[3]}" stroke-width=".7"/>`; });
    /* orejas de triángulo (polígono) con su interior rosado */
    [-1, 1].forEach(s => { b += g(P(`M${s * 20} -42L${s * 17} -64Q${s * 16.4} -66.5 ${s * 14.5} -65L${s * 4} -53Z`), 'poli', 1.3) + `<path d="M${s * 16.6} -46L${s * 15.4} -59.5L${s * 8.4} -52Z" fill="#ffb3d9" stroke-linejoin="round" stroke="#ff9cc9" stroke-width=".6"/>`; });
    /* pies */
    b += g(E(-8, -2.6, 6, 3.6), 'poli', 1.2) + g(E(8, -2.6, 6, 3.6), 'poli', 1.2);
    /* cuerpo de una pieza (cabeza y cuerpo), panza clara y brillos */
    b += g(P('M0 -58C15 -58 24 -48 24 -32C24 -14 15 -4 0 -4C-15 -4 -24 -14 -24 -32C-24 -48 -15 -58 0 -58Z'), 'poli', 1.5);
    b += `<ellipse cx="0" cy="-15" rx="12.5" ry="9.5" fill="#f4eeff" opacity=".85"/>`;
    b += arc('M-17 -45Q-14 -52 -7 -54.5', 2, .8) + `<circle cx="-18.6" cy="-40" r="1.1" fill="#fff" opacity=".85"/>`;
    /* pelo de adelante: flequillo (niña), mechón (niño) o estrella (por defecto) */
    if (v === 'a') b += g(P('M-15 -50Q-12 -58 0 -58.6Q12 -58 15 -50Q11 -52.5 8 -48.5Q5.5 -53 1.2 -50Q-2.6 -54 -6.2 -49Q-9.6 -53 -15 -50Z'), 'uva', 1.1) + arc('M-7 -55.6Q-2 -57 3 -56.4', .8, .7);
    else if (v === 'o') b += g(P('M-12 -51Q-9 -58.5 1 -58.8Q7 -63 12 -66Q11.5 -60 8.5 -57.6Q13 -56 14 -50Q10 -52.4 6.6 -49.6Q3.4 -53.4 -.4 -50.2Q-4.6 -53.6 -12 -51Z'), 'uva', 1.1) + arc('M2.6 -58.6Q6.6 -61 9.6 -63.4', .8, .7);
    else b += estrella(0, -61, 4.8);
    b += cara(0, -31, 2.25, { ojos: q.ojos, boca: q.boca, pest: v === 'a', mira: q.mira });
    /* brazos (encima del cuerpo) */
    b += brazo(-20.5, -27, -1, q.ai, 'poli') + brazo(20.5, -27, 1, q.ad, 'poli');
    return h + `<g transform="translate(0 ${-q.y}) rotate(${q.rot} 0 -4)">${b}</g>`;
  };

  /* ---------- B · Poli gomita (polígono vivo) ---------- */
  const gomita = (v, pose) => {
    const q = { ...POSE, ...pose }, n = q.forma, cy = -30, r = n === 3 ? 33 : n === 4 ? 28.5 : 27;
    const yc = n === 3 ? -26 : cy; let b = '';
    /* antena con estrella (todas) */
    const top = n === 3 ? yc - r + 4 : n === 4 ? yc - r * .7 : yc - r * .866;
    b += tubo(`M0 ${f1(top + 2)}Q-1.5 ${f1(top - 5)} 1.5 ${f1(top - 9)}`, 'poli', 2.2) + estrella(1.8, f1(top - 11.5), v === '' ? 5 : 3.6);
    if (v === 'a') [-1, 1].forEach(s => { b += g(C(s * 16, f1(top + 3), 6.4), 'uva', 1.1) + arc(`M${s * 16 - 3.4} ${f1(top + 1)}Q${s * 16 - 1} ${f1(top - 2.6)} ${s * 16 + 2} ${f1(top - 1.4)}`, .8, .7)
      + `<circle cx="${s * 12}" cy="${f1(top + 7)}" r="1.9" fill="url(#kp-menta)" stroke="${PP.menta[3]}" stroke-width=".6"/>`; });
    b += g(E(-9, -2.6, 6, 3.6), 'poli', 1.2) + g(E(9, -2.6, 6, 3.6), 'poli', 1.2);
    b += g(P(rpoly(0, yc, r, n, n === 3 ? 9 : 8)), 'poli', 1.5);
    b += `<ellipse cx="0" cy="${n === 3 ? -14 : -17}" rx="${n === 3 ? 13 : 12}" ry="8" fill="#f4eeff" opacity=".8"/>`;
    b += arc(n === 3 ? 'M-10 -41Q-8 -46 -5 -49' : `M-17 ${cy - 13}Q-13 ${cy - 19} -6 ${cy - 21}`, 2, .8);
    if (v === 'a') b += g(P(`M-13 ${f1(top + 9)}Q-6 ${f1(top + 3)} 0 ${f1(top + 3.4)}Q7 ${f1(top + 3)} 13 ${f1(top + 9)}Q8 ${f1(top + 7.6)} 4.6 ${f1(top + 10.6)}Q1.6 ${f1(top + 7)} -2 ${f1(top + 10.2)}Q-6 ${f1(top + 7.2)} -13 ${f1(top + 9)}Z`), 'uva', 1);
    if (v === 'o') b += g(P(`M-10 ${f1(top + 8.6)}Q-6 ${f1(top + 2.6)} 2 ${f1(top + 2.4)}Q8 ${f1(top - 1)} 12 ${f1(top - 4)}Q11.4 ${f1(top + 2)} 9 ${f1(top + 4)}Q12 ${f1(top + 6)} 12.6 ${f1(top + 9.4)}Q8.6 ${f1(top + 7.2)} 5 ${f1(top + 9.8)}Q2 ${f1(top + 6.6)} -1.6 ${f1(top + 9.6)}Q-5 ${f1(top + 6.8)} -10 ${f1(top + 8.6)}Z`), 'uva', 1);
    b += cara(0, n === 3 ? -25 : -31, 2.2, { ojos: q.ojos, boca: q.boca === 'gato' ? 'sonrisa' : q.boca, pest: v === 'a', mira: q.mira });
    const hx = n === 3 ? 15 : 22.5;
    b += brazo(-hx, -24, -1, q.ai, 'poli', 10, 4.2) + brazo(hx, -24, 1, q.ad, 'poli', 10, 4.2);
    return piso(19) + `<g transform="translate(0 ${-q.y}) rotate(${q.rot} 0 -4)">${b}</g>`;
  };

  /* ---------- C · Poli con capucha de gatito (niña o niño chibi) ---------- */
  const capucha = (v, pose) => {
    const q = { ...POSE, ...pose }; let b = '';
    /* trenzas (niña) que salen por debajo de la capucha */
    if (v === 'a') [-1, 1].forEach(s => { b += g(P(`M${s * 13} -32Q${s * 19} -26 ${s * 18} -15Q${s * 17.6} -11 ${s * 15} -11.6Q${s * 15.6} -20 ${s * 11} -27Z`), 'cafe', 1) + `<circle cx="${s * 16.4}" cy="-11" r="2" fill="url(#kp-menta)" stroke="${PP.menta[3]}" stroke-width=".6"/>`; });
    /* pies (zapatillas) y cuerpo con polerón */
    b += g(E(-6.5, -2.4, 5.2, 3.2), 'uva', 1.1) + g(E(6.5, -2.4, 5.2, 3.2), 'uva', 1.1);
    b += g(P('M-12 -24Q-14 -8 -11 -4H11Q14 -8 12 -24Z'), 'poli', 1.3) + `<rect x="-6" y="-14" width="12" height="5" rx="2.4" fill="#f4eeff" opacity=".8"/>`;
    /* orejas de la capucha y capucha */
    [-1, 1].forEach(s => { b += g(P(`M${s * 19} -50L${s * 18} -70Q${s * 17.6} -72.4 ${s * 15.6} -71L${s * 6} -60Z`), 'poli', 1.3) + `<path d="M${s * 16.4} -53L${s * 16} -65.6L${s * 9.6} -59Z" fill="#ffb3d9"/>`; });
    b += g(C(0, -43, 23), 'poli', 1.5);
    /* cara (piel) dentro de la capucha, con pelo */
    b += g(E(0, -40, 16.5, 15.5), 'piel', 1.1);
    if (v === 'a') b += g(P('M-16 -42Q-15 -55 0 -55.6Q15 -55 16 -42Q12 -47 8 -44.6Q5 -49 0 -46Q-5 -49 -8 -44.6Q-12 -47 -16 -42Z'), 'cafe', 1);
    else if (v === 'o') b += g(P('M-16 -43Q-14 -55.6 0 -55.8Q14 -55.6 16 -43Q13 -48.4 9 -46Q8 -50.4 3.6 -48Q1 -52 -3 -47.6Q-7 -50.6 -9.4 -46Q-13 -48.4 -16 -43Z'), 'cafe', 1);
    else b += estrella(0, -61.5, 4.2);
    b += arc('M-17 -55Q-12 -62 -4 -64', 2, .8);
    b += cara(0, -37.5, 1.85, { ojos: q.ojos, boca: q.boca === 'gato' ? 'sonrisa' : q.boca, pest: v === 'a', mira: q.mira, sep: 3.6 });
    b += brazo(-12.5, -22, -1, q.ai, 'poli', 10, 3.8) + brazo(12.5, -22, 1, q.ad, 'poli', 10, 3.8);
    return piso(17) + `<g transform="translate(0 ${-q.y}) rotate(${q.rot} 0 -4)">${b}</g>`;
  };

  const OPCIONES = {
    A: { nombre: 'A · Poli gatito', dibujo: gatito, idea: 'El Poli de siempre, en Gel: orejas de triángulo, cola y cuerpo de una pieza' },
    B: { nombre: 'B · Poli gomita', dibujo: gomita, idea: 'Un polígono vivo que cambia de forma (hexágono, cuadrado, triángulo)' },
    C: { nombre: 'C · Poli con capucha', dibujo: capucha, idea: 'Niña o niño chibi con capucha de gatito' },
  };
  /* poses de la lámina */
  const POSES = {
    reposo: {},
    saluda: { ad: 150, boca: 'abierta', rot: -3 },
    celebra: { ai: 140, ad: 140, y: 7, ojos: 'felices', boca: 'abierta' },
    piensa: { ad: -72, ai: 10, ojos: 'arriba', boca: 'o', rot: 5, mira: .5 },
  };
  const svg = (op, v, pose, extra = '') => `<svg viewBox="-40 -80 80 84" aria-hidden="true">${M.DEFS}${DEFS}${OPCIONES[op].dibujo(v, pose)}${extra}</svg>`;
  root.BOCETO_POLI = { OPCIONES, POSES, svg, DEFS };
})(typeof window !== 'undefined' ? window : module.exports);
