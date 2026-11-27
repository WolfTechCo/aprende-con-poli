/* Poli C (elegida por la dueña el 27-11-2026): niña o niño chibi, kawaii y querible como la Llamita, armado por piezas
   para elegir piel, pelo, peinado, ojos y ropa, y para ASOMARSE (cabeza y manos solas se leen bien).
   Se carga después de boceto-mascotas.js. No se carga en la app.
   Proporciones chibi: cabeza ≈ 55 % del alto; ojos grandes y bajos; cuerpo y brazos cortitos con manitos redondas.
   Marco: pies en y = 0; alto ≈ 70; caja -40 -80 80 84.
   look: { piel: 1..5, pelo: 'negro'|'cafe'|'castano'|'rubio'|'colorin'|'lila', peinado: 'colitas'|'remolino'|'gorro'|'rulos'|'trenzas'|'tomate',
           ojos: 'cafe'|'noche'|'verde'|'azul'|'miel', polera: color de PP, pest: pestañas }
   pose: { ai, ad (brazos: 0 abajo, + hacia arriba por fuera, − cruza al frente), y, rot, cab (ladeo de la cabeza),
           boca: 'sonrisa'|'abierta'|'o'|'gato', ojos: 'abiertos'|'felices'|'arriba'|'guino', mira: −1..1 } */
(function (root) {
  const M = root.BOCETO_MASC, { PAL } = M, { P, C, E, arc, piso, starD, f1 } = M.H;
  const PIEL = { 1: ['#fff6ef', '#ffe2cf', '#f4bf9e', '#c4805c'], 2: ['#fff0e2', '#ffd3ae', '#eca67a', '#b46c42'], 3: ['#f8d8b8', '#e2a774', '#c07c4b', '#8c522e'],
    4: ['#e8bc94', '#ba7c4f', '#935a33', '#5e3519'], 5: ['#cfa07c', '#8e5b3a', '#6a3e23', '#3e2212'] };
  const PELO = { negro: ['#7a7290', '#342e40', '#1e1a26', '#0d0b12'], cafe: ['#b08a70', '#5e3c2a', '#40261a', '#22130b'], castano: ['#e2b282', '#ad6c3e', '#824a25', '#4e2a12'],
    rubio: ['#fff4c4', '#f2c95c', '#d29e2c', '#8c6a10'], colorin: ['#ffc8a8', '#ea7240', '#c24e20', '#7a2a0c'], lila: ['#e6d8ff', '#a17ef0', '#7556d0', '#45309a'] };
  const OJOS = { noche: ['#7a4a6e', '#3a1f3a', '#22121f'], cafe: ['#a8724a', '#5a3218', '#2e180a'], verde: ['#7fc48a', '#2f7a44', '#163d22'], azul: ['#7ab8f0', '#2a64b8', '#123266'], miel: ['#e8b860', '#a8701c', '#5a3808'] };
  const ROPA = { ...PAL, coral: ['#ffd6cc', '#ff8a70', '#e85c44', '#a8382a'], cielo: ['#dff1ff', '#7cc4ff', '#3c92e6', '#1f5ca8'], jean: ['#c6d6f2', '#5f7fc0', '#3f5c9c', '#243a6a'] };
  const n = v => f1(v);
  const gradD = (id, [l, b, d]) => `<radialGradient id="${id}" cx=".35" cy=".28" r=".92"><stop offset="0" stop-color="${l}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${d}"/></radialGradient>`;
  const DEFS = '<defs>' + Object.entries(PIEL).map(([k, v]) => gradD('pc-piel' + k, v)).join('') + Object.entries(PELO).map(([k, v]) => gradD('pc-pelo-' + k, v)).join('')
    + Object.entries(ROPA).map(([k, v]) => gradD('pc-ropa-' + k, v)).join('')
    + Object.entries(OJOS).map(([k, [a, b, c]]) => `<radialGradient id="pc-ojo-${k}" cx=".5" cy=".78" r=".8"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`).join('')
    + '<linearGradient id="pc-ojo-fondo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1022"/><stop offset="1" stop-color="#3a2440"/></linearGradient></defs>';
  const gel = (shape, id, K, w = 1.2) => shape(`fill="url(#${id})" stroke="${K[3]}" stroke-width="${w}" stroke-linejoin="round"`);
  const LOOK = { piel: 2, pelo: 'cafe', peinado: 'remolino', ojos: 'noche', polera: 'menta', pest: false, cabeza: '' };
  const R2 = (x, y, w, h, r) => a => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${a}/>`;
  const POSE = { ai: 8, ad: 8, ci: 6, cd: 6, y: 0, rot: 0, cab: 0, boca: 'sonrisa', ojos: 'abiertos', mira: 0 };
  /* ronda 2 (referencias de la dueña): la cabeza se dibuja igual y se achica como grupo sobre el cuello; cuerpo más alto */
  const ESC = .86, CUELLO = -30;
  /* cabeza: centro (0, -45), radio ≈ 19 */
  const HX = 0, HY = -46, HR = 20;

  /* ojos grandes y bajos, iris de color con pupila y dos brillos; felices = ^^; guiño = uno cerrado */
  const ojos = (L, q) => { let h = ''; const sep = 8, oy = HY + 3.4;
    [-1, 1].forEach(s => { const x = s * sep + q.mira * 1.1, cerrado = q.ojos === 'felices' || (q.ojos === 'guino' && s > 0);
      if (cerrado) { h += `<path d="M${n(x - 4)} ${n(oy + .8)}Q${n(x)} ${n(oy - 3.8)} ${n(x + 4)} ${n(oy + .8)}" fill="none" stroke="#2a1a2a" stroke-width="1.3" stroke-linecap="round"/>`; return; }
      const up = q.ojos === 'arriba' ? -1.2 : 0;
      h += `<ellipse cx="${n(x)}" cy="${n(oy)}" rx="4.5" ry="5.4" fill="url(#pc-ojo-fondo)"/>`
        + `<ellipse cx="${n(x)}" cy="${n(oy + 1 + up * .3)}" rx="3.6" ry="4.1" fill="url(#pc-ojo-${L.ojos})"/>`
        + `<ellipse cx="${n(x)}" cy="${n(oy + 1 + up * .3)}" rx="1.7" ry="2.1" fill="#140a16"/>`
        + `<ellipse cx="${n(x + 1.5)}" cy="${n(oy - 1.9 + up)}" rx="1.8" ry="2" fill="#fff"/><circle cx="${n(x - 1.6)}" cy="${n(oy + 2.5 + up * .4)}" r=".85" fill="#fff"/><circle cx="${n(x + 2.2)}" cy="${n(oy + 1.6)}" r=".4" fill="#fff" opacity=".8"/>`;
      if (L.pest) h += `<path d="M${n(x + s * 3.6)} ${n(oy - 4)}l${n(s * 1.8)} -1.5M${n(x + s * 4.3)} ${n(oy - 2)}l${n(s * 1.9)} -.4" stroke="#2a1a2a" stroke-width=".8" stroke-linecap="round"/>`;
    });
    /* cejitas cortas (expresión) */
    const cj = -1.4; if (q.ojos === 'arriba' || q.boca === 'o') [-1, 1].forEach(s => { h += `<path d="M${n(s * 5.6)} ${n(HY - 4.2 + cj)}Q${n(s * 7.6)} ${n(HY - 5.4 + cj)} ${n(s * 9.4)} ${n(HY - 4.4 + cj)}" fill="none" stroke="rgba(60,30,30,.55)" stroke-width=".9" stroke-linecap="round"/>`; });
    return h; };
  const boca = q => '<g transform="translate(0 1.2)">' + ({ sonrisa: `<path d="M-1.8 ${HY + 10}Q0 ${HY + 11.8} 1.8 ${HY + 10}" fill="none" stroke="#6a2a3a" stroke-width="1" stroke-linecap="round"/>`,
    abierta: `<path d="M-2.3 ${HY + 9.6}Q0 ${HY + 14} 2.3 ${HY + 9.6}Z" fill="#8a2a44" stroke="#6a2a3a" stroke-width=".6" stroke-linejoin="round"/><path d="M-1.2 ${HY + 11.8}Q0 ${HY + 13} 1.2 ${HY + 11.8}" fill="#ff8fab"/>`,
    o: `<ellipse cx="0" cy="${HY + 11}" rx="1.2" ry="1.5" fill="#8a2a44"/>`,
    gato: `<path d="M-2.2 ${HY + 10}Q-1.1 ${HY + 11.4} 0 ${HY + 10.2}Q1.1 ${HY + 11.4} 2.2 ${HY + 10}" fill="none" stroke="#6a2a3a" stroke-width="1" stroke-linecap="round"/>` })[q.boca] + '</g>';
  const mejillas = () => [-1, 1].map(s => `<ellipse cx="${n(s * 12.4)}" cy="${HY + 9.4}" rx="3.8" ry="2.3" fill="url(#km-mej)"/>`).join('');

  /* pelo de atrás (detrás de la cabeza) y de adelante (flequillo), según el peinado */
  const peloAtras = L => { const id = 'pc-pelo-' + L.pelo, K = PELO[L.pelo]; let h = '';
    if (L.peinado === 'colitas') [-1, 1].forEach(s => { h += gel(P(`M${s * 15} ${HY - 10}Q${s * 31} ${HY - 18} ${s * 30} ${HY - 2}Q${s * 29} ${HY + 8} ${s * 22} ${HY + 6}Q${s * 24} ${HY - 2} ${s * 16} ${HY - 2}Z`), id, K, 1.1) + arc(`M${s * 25} ${HY - 13}Q${s * 28.6} ${HY - 9} ${s * 28} ${HY - 3}`, 1, .6); });
    if (L.peinado === 'trenzas') [-1, 1].forEach(s => { h += gel(P(`M${s * 16} ${HY - 2}Q${s * 22} ${HY + 4} ${s * 20} ${HY + 12}Q${s * 18} ${HY + 14} ${s * 16} ${HY + 12}Q${s * 17} ${HY + 4} ${s * 12} ${HY + 2}Z`), id, K, 1)
      + [0, 1, 2].map(j => gel(E(s * (19 - j * .4), HY + 14 + j * 4.2, 2.8, 2.6), id, K, .8)).join(''); });
    if (L.peinado === 'rulos') h += [[-17, -10, 7], [17, -10, 7], [-20, 0, 6], [20, 0, 6], [-12, -19, 7], [12, -19, 7], [0, -22, 7.5]].map(([x, y, r]) => gel(C(x, HY + y, r), id, K, 1)).join('');
    if (L.peinado === 'tomate') h += gel(C(0, HY - 21, 7.5), id, K, 1.1) + arc(`M-4 ${HY - 25}Q-1 ${HY - 28} 3 ${HY - 27}`, 1, .6);
    return h; };
  const peloAdelante = L => { const id = 'pc-pelo-' + L.pelo, K = PELO[L.pelo];
    if (L.peinado === 'gorro') { const G = ROPA.amarillo, gid = 'pc-ropa-amarillo';
      return gel(P(`M${-HR - 1} ${HY - 3}Q${-HR} ${HY - 24} 0 ${HY - 25}Q${HR} ${HY - 24} ${HR + 1} ${HY - 3}Q0 ${HY - 8} ${-HR - 1} ${HY - 3}Z`), gid, G, 1.3)
        + `<path d="M${-HR} ${HY - 4.6}Q0 ${HY - 9.6} ${HR} ${HY - 4.6}" fill="none" stroke="${G[2]}" stroke-width="2.6" stroke-linecap="round"/>`
        + gel(C(0, HY - 26, 3.4), 'pc-ropa-coral', ROPA.coral, .9) + arc(`M-13 ${HY - 13}Q-9 ${HY - 20} -2 ${HY - 21.5}`, 1.6, .7)
        + `<path d="${starD(3, 9, HY - 13)}" fill="#fff" opacity=".9"/>`
        /* mechoncitos que asoman bajo el gorro */
        + [-1, 1].map(s => gel(P(`M${s * 20.6} ${HY - 4.6}Q${s * 21.4} ${HY + 4} ${s * 18.4} ${HY + 6}Q${s * 18.4} ${HY + 1} ${s * 16.2} ${HY - 4}Z`), id, K, .8)).join(''); }
    /* casco de pelo con flequillo en mechones redondos; brillo curvo de anillo */
    let d = `M${-HR - 1} ${HY + 3}Q${-HR - 3.4} ${HY - HR - 3} 0 ${HY - HR - 3.6}Q${HR + 3.4} ${HY - HR - 3} ${HR + 1} ${HY + 3}`;
    d += L.peinado === 'remolino' ? `Q${HR - 2} ${HY - 5} ${HR - 6} ${HY - 6}Q${HR - 7} ${HY - 1.6} ${HR - 10.4} ${HY - 7.6}Q${3} ${HY - 3} ${-1} ${HY - 9}Q${-4} ${HY - 3.6} ${-8.6} ${HY - 8}Q${-11} ${HY - 3} ${-14.6} ${HY - 6.6}Q${-HR + 1} ${HY - 4} ${-HR - 1} ${HY + 3}Z`
      : `Q${HR - 2.4} ${HY - 6} ${HR - 7} ${HY - 6.4}Q${HR - 9} ${HY - 3} ${8} ${HY - 7.6}Q${4} ${HY - 3.2} 0 ${HY - 7.8}Q${-4} ${HY - 3.2} ${-8} ${HY - 7.6}Q${-HR + 9} ${HY - 3} ${-HR + 7} ${HY - 6.4}Q${-HR + 2.4} ${HY - 6} ${-HR - 1} ${HY + 3}Z`;
    let h = gel(P(d), id, K, 1.2) + `<path d="M-13 ${HY - 15}Q-2 ${HY - 21.6} 8 ${HY - 18.4}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".5"/><circle cx="11.6" cy="${HY - 16.4}" r="1" fill="#fff" opacity=".5"/>`;
    h += `<path d="M-5 ${HY - 21}Q-8.6 ${HY - 15} -9.6 ${HY - 9.4}M6 ${HY - 21.4}Q8.4 ${HY - 15.4} 7.6 ${HY - 9.6}M-14 ${HY - 14}Q-16.4 ${HY - 8} -16.6 ${HY - 3}" fill="none" stroke="${K[2]}" stroke-width=".9" stroke-linecap="round" opacity=".75"/>`;
    if (L.peinado === 'remolino') h += gel(P(`M1 ${HY - HR - 3}Q3 ${HY - HR - 11} 9 ${HY - HR - 10}Q5 ${HY - HR - 7} 5 ${HY - HR - 2.8}Z`), id, K, 1);
    if (L.peinado === 'colitas') [-1, 1].forEach(s => { h += `<g transform="translate(${s * 17} ${HY - 9}) rotate(${s * 20})">${gel(P('M0 0L-5.4 -3.6Q-6.6 0 -5.4 3.6Z'), 'pc-ropa-coral', ROPA.coral, .7)}${gel(P('M0 0L5.4 -3.6Q6.6 0 5.4 3.6Z'), 'pc-ropa-coral', ROPA.coral, .7)}${gel(C(0, 0, 1.8), 'pc-ropa-coral', ROPA.coral, .7)}</g>`; });
    if (L.peinado === 'tomate') h += gel(E(0, HY - 16.6, 4, 1.8), 'pc-ropa-coral', ROPA.coral, .7);
    if (L.peinado === 'trenzas') [-1, 1].forEach(s => { h += gel(C(s * 19.2, HY + 26, 1.9), 'pc-ropa-menta', ROPA.menta, .6); });
    return h; };
  /* brazo de dos tramos (ronda 2): manga, codo, antebrazo y manita con pulgar; llega a la cadera.
     ang: giro del hombro (0 abajo, + afuera); codo: giro del antebrazo respecto del brazo (+ afuera) */
  const brazo = (s, ang, codo, L) => { const pid = 'pc-ropa-' + L.polera, PK = ROPA[L.polera], sid = 'pc-piel' + L.piel, SK = PIEL[L.piel];
    return `<g transform="translate(${n(s * 10.2)} -29) rotate(${n(-s * ang)})">${gel(E(0, 3.4, 3.3, 4.5), pid, PK, 1)}`
      + `<g transform="translate(0 6.4) rotate(${n(-s * codo)})">${gel(E(0, 3.2, 2.2, 3.9), sid, SK, .9)}${gel(C(0, 7.6, 3), sid, SK, .9)}`
      + `${gel(E(n(-s * 2.5), 6.6, 1.3, 1.7), sid, SK, .7)}<circle cx="${n(s * .9)}" cy="6.6" r=".8" fill="#fff" opacity=".6"/></g></g>`; };
  const cuerpo = (L, q) => { const pid = 'pc-ropa-' + L.polera, PK = ROPA[L.polera];
    let h = '';
    /* piernas más largas y zapatillas con suela */
    h += [-1, 1].map(s => gel(P(`M${s * 1.8} -14.6H${s * 8.4}V-4.6Q${s * 5.2} -3.8 ${s * 1.8} -4.6Z`), 'pc-ropa-jean', ROPA.jean, 1)).join('');
    h += [-1, 1].map(s => gel(E(s * 5.8, -1.7, 5.8, 1.9), 'pc-ropa-ceniza', ROPA.ceniza, .8) + gel(E(s * 5.6, -3.4, 5.3, 3.3), 'pc-ropa-coral', ROPA.coral, 1)
      + `<path d="M${n(s * 3)} -5.2H${n(s * 7.6)}" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".8"/>`).join('');
    /* polera redondita */
    h += gel(P('M-9 -31Q-12.8 -29.4 -12.8 -22Q-12.8 -14 -10.4 -13.4H10.4Q12.8 -14 12.8 -22Q12.8 -29.4 9 -31Q0 -28.4 -9 -31Z'), pid, PK, 1.2);
    h += arc('M-10 -25Q-9.8 -19 -8.4 -16', 1.3, .6);
    /* un detalle por variante: cuello, rayas o bolsillo */
    if (L.detalle === 'cuello') h += [-1, 1].map(s => `<path d="M0 -29.2Q${s * 2.6} -27 ${s * 6} -27.6Q${s * 7.6} -29.4 ${s * 7} -30.8Q${s * 3.6} -29.6 0 -29.2Z" fill="#fff" stroke="${PK[3]}" stroke-width=".7" stroke-linejoin="round"/>`).join('');
    else h += `<path d="M-5 -30.6Q0 -27.4 5 -30.6" fill="none" stroke="${PK[3]}" stroke-width="1" stroke-linecap="round"/>`;
    if (L.detalle === 'rayas') h += [-24.6, -19.6].map(y => `<path d="M-12.4 ${y}Q0 ${y + 1.6} 12.4 ${y}" fill="none" stroke="#fff" stroke-width="1.8" opacity=".75"/>`).join('');
    if (L.detalle === 'bolsillo') h += `<path d="M-4.4 -20H4.4V-16.4Q0 -14.6 -4.4 -16.4Z" fill="${PK[0]}" stroke="${PK[3]}" stroke-width=".7" stroke-linejoin="round"/>`;
    /* estrellita del pecho (el Poli de siempre) */
    h += `<path d="${starD(2.5, L.detalle === 'bolsillo' ? 0 : 0, L.detalle === 'bolsillo' ? -23.6 : -22)}" fill="url(#km-oro)" stroke="${PAL.oro[3]}" stroke-width=".5" stroke-linejoin="round"/>`;
    return h; };
  /* ropa de cabeza de muestra: animal (dino), espacio (astro), planta (flor) y oficio (chef) */
  const G = (c, w) => [`pc-ropa-${c}`, ROPA[c], w];
  const gorroAtras = L => L.cabeza === 'dino' ? gel(E(0, HY - 1, HR + 5.4, HR + 5), ...G('verde', 1.4))
    + [[-9, -24.4, -24], [0, -27.6, 0], [9, -24.4, 24]].map(([x, y, r]) => `<g transform="translate(${x} ${HY + y}) rotate(${r})">${gel(P('M-3.6 3Q-2 -4.4 0 -6Q2 -4.4 3.6 3Z'), ...G('naranja', 1))}</g>`).join('') : '';
  const gorroAdelante = L => {
    if (L.cabeza === 'dino') return gel(P(`M${-HR - 5} ${HY + 6}Q${-HR - 4} ${HY - HR - 5} 0 ${HY - HR - 5}Q${HR + 4} ${HY - HR - 5} ${HR + 5} ${HY + 6}Q${HR - 2} ${HY - 7} 0 ${HY - 8.4}Q${-HR + 2} ${HY - 7} ${-HR - 5} ${HY + 6}Z`), ...G('verde', 1.4))
      + [-11, -5.5, 0, 5.5, 11].map(x => `<path d="M${x - 2} ${n(HY - 8.2 + Math.abs(x) * .14)}L${x} ${n(HY - 4.8 + Math.abs(x) * .14)}L${x + 2} ${n(HY - 8.2 + Math.abs(x) * .14)}Z" fill="#fff" stroke="#c8d8c0" stroke-width=".4" stroke-linejoin="round"/>`).join('')
      + [-6, 6].map(x => `<circle cx="${x}" cy="${HY - 16.6}" r="2.4" fill="#fff" stroke="${ROPA.verde[3]}" stroke-width=".6"/><circle cx="${x + .5}" cy="${HY - 16.2}" r="1.3" fill="#20301a"/><circle cx="${x + 1}" cy="${HY - 16.9}" r=".45" fill="#fff"/>`).join('')
      + arc(`M-17 ${HY - 8}Q-15 ${HY - 19} -6 ${HY - 23}`, 1.8, .6);
    if (L.cabeza === 'astro') return `<circle cx="0" cy="${HY + 1}" r="${HR + 6.5}" fill="#dff1ff" fill-opacity=".22" stroke="#bfe0ff" stroke-width="2"/>`
      + `<path d="M-17 ${HY - 10}Q-12 ${HY - 21} -1 ${HY - 23.5}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/><circle cx="16" cy="${HY - 14}" r="1.3" fill="#fff" opacity=".8"/>`
      + gel(R2(-10, HY + HR + 3.4, 20, 4.4, 2.2), ...G('ceniza', 1)) + `<path d="M0 ${HY - HR - 6.4}V${HY - HR - 12}" stroke="#9aa0b8" stroke-width="1.2"/>` + gel(C(0, HY - HR - 13.6, 2.2), ...G('rojo', .8));
    if (L.cabeza === 'flor') return gel(E(0, HY - 14, 27, 6), ...G('vainilla', 1.3)) + gel(P(`M-14 ${HY - 15}Q-14 ${HY - 31} 0 ${HY - 31}Q14 ${HY - 31} 14 ${HY - 15}Q0 ${HY - 12} -14 ${HY - 15}Z`), ...G('vainilla', 1.3))
      + `<path d="M-14 ${HY - 17.6}Q0 ${HY - 14.6} 14 ${HY - 17.6}" fill="none" stroke="${ROPA.hoja[2]}" stroke-width="2.6"/>`
      + `<g transform="translate(11 ${HY - 19})">${[0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a})">${gel(E(0, -3.6, 2.6, 3.4), ...G('rosa', .7))}</g>`).join('')}${gel(C(0, 0, 2.2), ...G('amarillo', .7))}</g>`
      + gel(P(`M5 ${HY - 17}Q2 ${HY - 23} 6.4 ${HY - 24.4}Q7 ${HY - 20} 5 ${HY - 17}Z`), ...G('hoja', .7)) + arc(`M-9 ${HY - 24}Q-5 ${HY - 29} 2 ${HY - 29.4}`, 1.4, .6);
    if (L.cabeza === 'chef') return gel(P(`M-12 ${HY - 14}V${HY - 22}Q-19 ${HY - 25} -16 ${HY - 32}Q-13 ${HY - 38} -6 ${HY - 35}Q-2 ${HY - 42} 4 ${HY - 37}Q12 ${HY - 40} 15 ${HY - 32}Q18 ${HY - 25} 12 ${HY - 22}V${HY - 14}Z`), ...G('ceniza', 1.3))
      + `<path d="M-12 ${HY - 17.6}H12" stroke="${ROPA.ceniza[2]}" stroke-width="1"/>` + arc(`M-12 ${HY - 28}Q-11 ${HY - 34} -5 ${HY - 34}`, 1.5, .8);
    return ''; };
  const cabeza = (L, q) => { const sid = 'pc-piel' + L.piel, SK = PIEL[L.piel];
    let h = L.cabeza === 'dino' ? gorroAtras(L) : peloAtras(L);
    /* orejitas */
    h += [-1, 1].map(s => gel(E(s * (HR + .4), HY + 3, 2.8, 3.4), sid, SK, 1)).join('');
    /* cara: un poco más ancha abajo (mejillas), como bollito */
    h += gel(P(`M0 ${HY - HR}C${HR * .62} ${HY - HR} ${HR + .6} ${HY - HR * .56} ${HR + .6} ${HY + 1}C${HR + .6} ${HY + HR * .62} ${HR * .55} ${HY + HR - .6} 0 ${HY + HR - .6}C${-HR * .55} ${HY + HR - .6} ${-HR - .6} ${HY + HR * .62} ${-HR - .6} ${HY + 1}C${-HR - .6} ${HY - HR * .56} ${-HR * .62} ${HY - HR} 0 ${HY - HR}Z`), sid, SK, 1.3);
    h += `<path d="M${-HR + 4} ${HY - 2}Q${-HR + 4.6} ${HY - 9} ${-HR + 9} ${HY - 12}" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>`;
    h += mejillas() + ojos(L, q) + boca(q) + `<ellipse cx="0" cy="${HY + 8.2}" rx="1.1" ry=".75" fill="${SK[2]}" opacity=".55"/>`;
    h += L.cabeza === 'dino' ? '' : peloAdelante(L);
    h += gorroAdelante(L);
    return `<g transform="translate(0 ${CUELLO}) scale(${ESC}) rotate(${n(q.cab)} 0 0) translate(0 ${-(HY + HR)})">${h}</g>`; };
  /* Poli entero */
  const poli = (look = {}, pose = {}) => { const L = { ...LOOK, ...look }, q = { ...POSE, ...pose };
    const delante = q.ai < 0 || q.ad < 0 || q.ci < -60 || q.cd < -60; /* un brazo que cruza al frente (pensar) va sobre el cuerpo */
    const b = brazo(-1, q.ai, q.ci, L) + brazo(1, q.ad, q.cd, L);
    return piso(15) + `<g transform="translate(0 ${-q.y}) rotate(${q.rot} 0 -2)">${cuerpo(L, q)}${delante ? '' : b}${cabeza(L, q)}${delante ? b : ''}</g>`; };
  const VARIANTES = {
    a: { peinado: 'colitas', pelo: 'cafe', polera: 'amarillo', pest: true, piel: 2, ojos: 'noche', detalle: 'cuello' },
    o: { peinado: 'remolino', pelo: 'negro', polera: 'cielo', piel: 3, ojos: 'cafe', detalle: 'rayas' },
    '': { peinado: 'gorro', pelo: 'castano', polera: 'menta', piel: 2, ojos: 'noche', detalle: 'bolsillo' },
  };
  const svg = (look, pose, vb = '-40 -80 80 84', extra = '') => `<svg viewBox="${vb}" aria-hidden="true">${M.DEFS}${DEFS}${poli(look, pose)}${extra}</svg>`;
  root.BOCETO_POLI_C = { poli, svg, VARIANTES, PIEL, PELO, OJOS, ROPA, DEFS, LOOK, POSE };
})(typeof window !== 'undefined' ? window : module.exports);
