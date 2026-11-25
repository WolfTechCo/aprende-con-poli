/* Dibujos con poses (entrega 4A, fase 4A-3; revisión de la dueña del 25-11-2026 e investigación en
   poli-referencias/recompensas/animacion.md). Se carga después de boceto-mascotas.js, -b.js, -c.js y boceto-vida.js.
   En vez de girar partes enteras (rígido), cada dibujo recibe «perillas» (largo del cuello, patas adentro, giro de la
   cabeza…) y un motor las mueve cuadro a cuadro con principios de animación: anticipación, estirar y encoger, partes
   que llegan después y tiempos desfasados. Tiene tres capas de movimiento:
   1) de fondo, continuo (respirar, mecerse);
   2) acciones del rato, al azar cada pocos segundos (olfatear, mirar, bostezar, caminar, esconderse por timidez);
   3) reacción al tocar: el salto común mezclado con el gesto propio.
   En modo «tranquila» (durante una pregunta) solo respira y parpadea. Parte 1: Tortugono. */
(function (root) {
  const M = root.BOCETO_MASC, { PAL } = M;
  const { P, C, R, E, gel, flat, arc, dot, piso, poly, corona, aura, chispas, f1 } = M.H;
  const { tent } = M.B.H;
  const { TT, tHead } = M.C.H;

  /* ---------- curvas de tiempo ---------- */
  const EASE = {
    suave: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    sale: t => 1 - Math.pow(1 - t, 3),
    entra: t => t * t * t,
    rebote: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }, /* se pasa y vuelve */
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- motor ----------
     el: <g> donde se dibuja; draw(pose) devuelve el SVG; base: pose de reposo; spec: { fondo(t, modo), acciones, gesto, salto } */
  let uid = 0;
  class Motor {
    constructor(el, draw, base, spec) {
      this.el = el; this.draw = draw; this.base = { ...base }; this.v = { ...base }; this.spec = spec; this.id = ++uid;
      this.cola = []; this.modo = 'vida'; this.ocupado = 0; this.proxima = performance.now() + 1500; this.ultima = -1; this.parpadeo = 0; this.turno = 0;
      this.reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.paso = this.paso.bind(this); this.t0 = performance.now(); this.vivo = true;
      if (el.style) el.style.pointerEvents = 'none';
      /* dibujo armado una vez (build) y movido cuadro a cuadro (update): suave y sin redibujar */
      if (typeof draw === 'object') { el.innerHTML = draw.build(); this.refs = draw.refs(el); }
      this.render(this.t0); if (!this.reducido) requestAnimationFrame(this.paso);
    }
    /* programa una secuencia: [[ms desde ahora, { perilla: valor }, duración, curva]] */
    hacer(seq) {
      const ahora = performance.now(); let fin = ahora;
      seq.forEach(([d, obj, dur = 250, ease = 'suave']) => Object.entries(obj).forEach(([k, to]) => {
        this.cola.push({ k, to, t0: ahora + d, t1: ahora + d + dur, ease: EASE[ease], from: null }); fin = Math.max(fin, ahora + d + dur);
      }));
      return fin;
    }
    valor(k, t) {
      let v = this.v[k];
      for (const c of this.cola) if (c.k === k && t >= c.t0) {
        if (c.from === null) c.from = v;
        const u = Math.min(1, (t - c.t0) / Math.max(1, c.t1 - c.t0)); v = lerp(c.from, c.to, c.ease(u));
        if (u >= 1) { c.hecho = true; }
      }
      return v;
    }
    paso(t) {
      if (!this.vivo || !this.el.isConnected) { this.vivo = false; return; }
      if (this.refs || t - (this.ult || 0) > 30) { this.ult = t; this.render(t); }
      requestAnimationFrame(this.paso);
    }
    render(t) {
      const pose = {};
      Object.keys(this.base).forEach(k => { pose[k] = this.valor(k, t); });
      this.poseBase = { ...pose };
      /* lo terminado pasa a ser el valor actual */
      this.cola = this.cola.filter(c => { if (c.hecho) { this.v[c.k] = c.to; return false; } return true; });
      const extra = this.spec.fondo ? this.spec.fondo((t - this.t0) / 1000, this.modo, pose) : {};
      Object.entries(extra).forEach(([k, d]) => { pose[k] = (pose[k] ?? 0) + d; });
      /* parpadeo, siempre */
      if (t > this.parpadeo) { this.parpadeo = t + 2600 + Math.random() * 2600; this.hacer([[0, { ojos: 0 }, 70, 'entra'], [110, { ojos: 1 }, 90, 'sale']]); }
      /* acciones del rato */
      if (this.modo === 'vida' && t > this.ocupado && t > this.proxima && this.spec.acciones) {
        let i; do { i = Math.floor(Math.random() * this.spec.acciones.length); } while (i === this.ultima && this.spec.acciones.length > 1);
        this.ultima = i; this.ocupado = this.spec.acciones[i](this); this.proxima = this.ocupado + 1600 + Math.random() * 2400;
      }
      this.pose = pose;
      if (this.refs) this.draw.update(this.refs, pose); else this.el.innerHTML = this.draw(pose);
    }
    /* al tocar: salto, gesto o los dos (para no repetir) */
    tocar() {
      if (this.reducido) return '';
      /* parte desde donde está (sin saltos): lo que iba a medio camino queda como valor actual */
      if (this.poseBase) Object.assign(this.v, this.poseBase);
      this.cola = [];
      const plan = [['salto'], ['gesto'], ['salto', 'gesto'], ['gesto'], ['salto']][this.turno++ % 5];
      let fin = performance.now();
      plan.forEach((p, i) => { const d = fin - performance.now(); fin = this.spec[p](this, Math.max(0, d) + (i ? 120 : 0)); });
      this.ocupado = fin; this.proxima = fin + 1200;
      return plan.join(' + ');
    }
    setModo(m) { this.modo = m; if (m !== 'vida') { this.cola = this.cola.filter(c => c.k === 'ojos'); Object.assign(this.v, this.base); } }
    parar() { this.vivo = false; }
  }

  /* ---------- 1 · Tortugono con poses ----------
     Como en los dibujos animados de tortugas vistas de lado: la cabeza se DESLIZA hacia atrás, por detrás del borde
     delantero del caparazón, que la tapa (no se achica ni hay hoyo fijo). La abertura oscura aparece solo cuando la
     cabeza ya está adentro, y ahí pueden brillar los ojitos. Se arma una vez y en cada cuadro solo se mueven las partes. */
  let nT = 0;
  const T_BASE = { cuello: 1, cabRot: 0, cabY: 0, boca: 0, ojos: 1, patas: 0, andar: 0, capRot: 0, sx: 1, sy: 1, y: 0, mira: 0, asoma: 0 };
  const n3 = v => (Math.round(v * 1000) / 1000).toString();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const tortugonoPose = k => {
    const id = 'kt' + (++nT), T = TT[k], tile = k === 4 ? 'oro' : 'amarillo', up = k >= 3, hs = [0, 1.22, 1.08, 1, 1][k], SC = M.C.SCALE[k];
    const O = up ? [27, -27] : [23, -15], IN = up ? [5, -20] : [4, -18], NB = [8, -12];
    const LX = [-20, -8, 6], LH = k >= 2 ? 11 : 10, NW = 7.5 * hs;
    const fx = O[0] + 2.4 * hs, fy = O[1] + .6 * hs, fs = .9 * hs;
    const cara = `<g transform="translate(${n3(fx)} ${n3(fy)}) scale(${n3(fs)})">`
      + [-3.4, 3.4].map((e, i) => `<g id="${id}-o${i}" transform="translate(${e} -.8)"><ellipse rx="2.3" ry="2.7" fill="url(#km-ojo)"/><circle cx=".8" cy="-1.1" r="1" fill="#fff"/><circle cx="-.7" cy="1.2" r=".45" fill="#fff"/></g>`).join('')
      + (k >= 3 ? `<path id="${id}-bc" d="M-1.4 1.9Q0 4.4 1.4 1.9Z" fill="#7a2a44"/>` : `<path id="${id}-bc" d="M-1.2 2.1Q0 3.4 1.2 2.1" fill="none" stroke="#5a2a44" stroke-width=".9" stroke-linecap="round"/>`)
      + `<g id="${id}-bo" opacity="0"><ellipse cy="3.3" rx="1.8" ry="2.3" fill="#7a2a44"/><ellipse cy="4.2" rx="1" ry=".8" fill="#ff8fab"/></g>`
      + `<ellipse cx="-5.8" cy="2.1" rx="2.2" ry="1.4" fill="url(#km-mej)"/><ellipse cx="5.8" cy="2.1" rx="2.2" ry="1.4" fill="url(#km-mej)"/></g>`;
    const build = () => {
      let g = `<g id="${id}-sh">${piso(34, -2)}</g>`;
      if (k === 4) g = aura(-20, 42) + chispas([[-30, -44, 3], [36, -12, 2.6], [-34, -18, 2.2]]) + g;
      let c = '';
      if (k >= 2) c += `<g id="${id}-co">${gel(P('M-25 -8Q-35 -8 -33 -2.6Q-29 -1.2 -24 -4Z'), 'menta', 1)}</g>`;
      c += LX.map((x, i) => `<g id="${id}-p${i}">${gel(R(x - 4.2, -LH, 8.4, LH, 4), 'menta', 1)}</g>`).join('');
      c += `<path id="${id}-c1" fill="none" stroke="${PAL.menta[3]}" stroke-width="${n3(NW + 2)}" stroke-linecap="round"/><path id="${id}-c2" fill="none" stroke="url(#km-menta)" stroke-width="${n3(NW)}" stroke-linecap="round"/>`;
      c += `<g id="${id}-cab">${tHead(O[0], O[1], hs)}${cara}${k === 4 ? corona(O[0], n3(O[1] - 8.6 * hs), .95 * hs, 8) : ''}</g>`;
      if (up) c += [[-16, -35.4], [-4, -40.6], [8, -35.4]].map(([x, y], i) => `<g id="${id}-cr${i}">${gel(poly(x, y, 5.6, T.n), tile, 1)}</g>`).join('');
      c += gel(P('M-29 -7.5Q-29 -11.5 -25 -11.5L19 -11.5Q23 -11.5 23 -7.5Q23 -3.8 19 -3.8L-25 -3.8Q-29 -3.8 -29 -7.5Z'), k === 4 ? 'oro' : 'vainilla', 1.1);
      c += gel(P('M-26 -10Q-28.5 -37 -3 -38Q22.5 -37 20 -10Q-3 -7 -26 -10Z'), 'verde', 1.4);
      c += T.p.map(([x, y, r]) => gel(poly(x, y, r, T.n), tile, 1)).join('') + (T.c ? gel(poly(T.c[0], T.c[1], T.c[2], T.c[3]), tile, 1.1) : '');
      c += arc('M-21 -17Q-20 -29 -9 -33', 2.2, .75) + dot(-22, -12.5, 1);
      /* abertura: sombra que sigue el borde delantero, solo visible con la cabeza adentro */
      c += `<path id="${id}-ab" d="M20.8 -9.6Q24 -18.4 19.6 -27.4Q8.4 -18.6 20.8 -9.6Z" fill="#123a2e" stroke="${PAL.verde[3]}" stroke-width=".8" opacity="0"/>`;
      c += `<g id="${id}-as" opacity="0">${`<g transform="translate(17.2 -18.6) scale(${n3(fs)})"><g id="${id}-ao"><ellipse rx="2.3" ry="2.7" fill="url(#km-ojo)"/><circle cx=".8" cy="-1.1" r="1" fill="#fff"/><circle cx="-.7" cy="1.2" r=".45" fill="#fff"/></g></g>`}</g>`;
      return `<g transform="scale(${SC})">${g}<g id="${id}-all"><g id="${id}-cap">${c}</g></g></g>`;
    };
    const refs = el => { const q = s => el.querySelector('#' + id + '-' + s); return { sh: q('sh'), all: q('all'), cap: q('cap'), co: q('co'), p: [0, 1, 2].map(i => q('p' + i)), c1: q('c1'), c2: q('c2'), cab: q('cab'), cr: [0, 1, 2].map(i => q('cr' + i)), ab: q('ab'), as: q('as'), ao: q('ao'), o: [0, 1].map(i => q('o' + i)), bc: q('bc'), bo: q('bo') }; };
    const update = (r, p) => {
      const u = clamp(p.cuello, 0, 1.25);
      /* la cabeza se desliza en línea (con un leve arco) entre adentro y afuera */
      const hx = IN[0] + (O[0] - IN[0]) * u, hy = IN[1] + (O[1] - IN[1]) * u - Math.sin(Math.min(1, u) * Math.PI) * 1.5 + p.cabY;
      r.cab.setAttribute('transform', `translate(${n3(hx - O[0])} ${n3(hy - O[1])}) rotate(${n3(p.cabRot)} ${O[0]} ${n3(O[1] + 4)})`);
      const ex = hx - 3 * hs, ey = hy + 4 * hs, d = `M${NB[0]} ${NB[1]}C${n3(NB[0] + Math.max(4, (ex - NB[0]) * .75))} ${n3(NB[1] + 1.5)} ${n3(ex - 1)} ${n3(ey + Math.max(0, (NB[1] - ey) * .5))} ${n3(ex)} ${n3(ey)}`;
      r.c1.setAttribute('d', d); r.c2.setAttribute('d', d);
      const ojo = Math.max(.08, p.ojos);
      r.o.forEach((o, i) => o.setAttribute('transform', `translate(${n3((i ? 3.4 : -3.4) + p.mira * 1.1)} -.8) scale(1 ${n3(ojo)})`));
      r.bo.setAttribute('opacity', n3(clamp((p.boca - .1) * 1.6, 0, 1))); r.bo.setAttribute('transform', `scale(1 ${n3(.4 + .6 * clamp(p.boca, 0, 1))})`);
      r.bc.setAttribute('opacity', n3(1 - clamp(p.boca * 2, 0, 1)));
      const ph = p.fase || 0;
      r.p.forEach((g, i) => { const o = i === 1 ? Math.PI : 0, lift = p.andar * Math.max(0, Math.sin(ph + o)) * 2.6, sw = p.andar * Math.cos(ph + o) * 1.6;
        g.setAttribute('transform', `translate(${n3(sw)} ${n3(-lift - p.patas * 7.5)})`); });
      if (r.co) r.co.setAttribute('transform', `translate(${n3(p.patas * 6)} 0)`);
      r.cr.forEach((g, i) => g && g.setAttribute('transform', `rotate(${n3(Math.sin((p.t || 0) * 2 + i) * 2 * (p.vivo || 0))} ${[-16, -4, 8][i]} ${[-30, -35, -30][i]})`));
      r.ab.setAttribute('opacity', n3(clamp((.6 - p.cuello) / .4, 0, 1)));
      r.as.setAttribute('opacity', n3(clamp(p.asoma, 0, 1))); if (r.ao) r.ao.setAttribute('transform', `scale(1 ${n3(Math.max(.08, p.ojos))})`);
      const meceo = p.andar * Math.sin(ph) * 2.4 + (p.vivo || 0) * Math.sin((p.t || 0) * 2 * Math.PI / 5.3) * .5, bote = -p.andar * Math.abs(Math.sin(ph)) * .6 + p.patas * 3.6;
      r.cap.setAttribute('transform', `translate(0 ${n3(bote)}) rotate(${n3(p.capRot + meceo)} -3 -2)`);
      r.all.setAttribute('transform', `translate(0 ${n3(p.y)}) scale(${n3(p.sx)} ${n3(p.sy)})`);
      r.sh.setAttribute('transform', `scale(${n3(1 - Math.min(.4, -p.y / 40))} 1)`);
    };
    return { build, refs, update };
  };
  const T_SPEC = {
    /* fondo continuo: respira (lento y suave), mece la cabeza; tiempos desfasados para que no lleguen juntos al máximo */
    fondo: (t, modo, p) => {
      const vivo = modo === 'vida' ? 1 : 0, r = Math.sin(t * 2 * Math.PI / 3.4);
      p.t = t; p.vivo = vivo; p.fase = t * 6.5;
      return { sy: r * .014, sx: -r * .007, cabY: vivo * Math.sin(t * 2 * Math.PI / 2.6 + 1.3) * .6, cabRot: vivo * Math.sin(t * 2 * Math.PI / 4.3 + .4) * 2.2 };
    },
    acciones: [
      m => m.hacer([[0, { cuello: 1.12 }, 350], [350, { cabRot: -9 }, 160], [510, { cabRot: 4 }, 160], [670, { cabRot: -8 }, 150], [820, { cabRot: 3 }, 150], [970, { cabRot: 0, cuello: 1 }, 380]]), /* olfatea */
      m => m.hacer([[0, { cabRot: 10, mira: 1 }, 550], [1150, { cabRot: -9, mira: -1 }, 650], [2200, { cabRot: 0, mira: 0 }, 450]]), /* mira a los lados */
      m => m.hacer([[0, { ojos: 0, boca: 1, cuello: 1.08, cabRot: -7 }, 700], [1300, { ojos: 1, boca: 0, cuello: 1, cabRot: 0 }, 500]]), /* bosteza */
      m => m.hacer([[0, { andar: 1 }, 350], [2400, { andar: 0 }, 350]]), /* camina en su lugar */
      m => m.hacer([[0, { cuello: .45, patas: .25 }, 380, 'sale'], [1100, { cuello: 1.1, patas: 0 }, 380, 'rebote'], [1480, { cuello: 1 }, 260]]), /* tímida: se esconde a medias detrás del borde */
    ],
    gesto: (m, d) => m.hacer([
      [d, { sy: .9, sx: 1.06 }, 130], [d + 130, { sy: 1, sx: 1 }, 200],
      [d + 100, { cuello: 0 }, 320, 'entra'], [d + 160, { patas: 1 }, 300, 'entra'], /* la cabeza parte primero y las patas la siguen */
      [d + 100, { capRot: -6 }, 160], [d + 260, { capRot: 5 }, 150], [d + 410, { capRot: -3 }, 140], [d + 550, { capRot: 1.5 }, 130], [d + 680, { capRot: 0 }, 160], /* se mece mientras se esconde y baja */
      [d + 950, { asoma: 1 }, 220], [d + 1400, { ojos: 0 }, 80], [d + 1490, { ojos: 1 }, 100], [d + 1750, { asoma: 0 }, 120], /* asoma un ojo y parpadea */
      [d + 1850, { cuello: 1.18, patas: 0 }, 300, 'rebote'], [d + 2150, { cuello: 1 }, 260]]),
    salto: (m, d) => m.hacer([
      [d, { sy: .84, sx: 1.1 }, 140], [d + 140, { y: -15, sy: 1.1, sx: .92, patas: .35 }, 240, 'sale'], [d + 380, { y: 0, patas: 0, sy: 1.02, sx: .98 }, 210, 'entra'],
      [d + 590, { sy: .88, sx: 1.08 }, 100], [d + 690, { sy: 1, sx: 1 }, 260, 'rebote']]),
  };

  /* ---------- 2 · Cubúho con poses ----------
     El búho no mueve los ojos: gira la CABEZA entera (hasta tres cuartos de vuelta) con el cuerpo quieto, y cabecea de
     lado y arriba-abajo cuando algo le da curiosidad (poli-referencias/recompensas/animacion.md). Como su cabeza y su
     cuerpo son el mismo cubo, el giro se hace con la cara: se corre por el costado del cubo, pasa por la nuca y vuelve
     por el otro lado; el cubo no salta. Plumas nuevas: puntas de prisma triangular (una mitad clara y otra en sombra) en
     capas al borde del ala, para que se lean como plumas. La cría se asoma y se esconde dentro de su cascarón. */
  let nB = 0;
  const B_BASE = { giro: 0, cabX: 0, cabY: 0, cabRot: 0, ojos: 1, guino: 1, alaI: 0, alaD: 0, aleteo: 0, orejas: 0, pasito: 0, sube: 0, casRot: 0, esponja: 0, sx: 1, sy: 1, y: 0 };
  /* pluma: triángulo redondeado que apunta hacia abajo, mitad clara y mitad en sombra (prisma) */
  const pluma = (x, y, r, l, col, an = 2.6) => { const c = PAL[col]; /* hoja redondeada con nervio: mitad clara y mitad en sombra */
    return `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 -.4C${an} .2 ${n3(an * .9)} ${n3(l * .7)} 0 ${l}C${n3(-an * .9)} ${n3(l * .7)} ${-an} .2 0 -.4Z" fill="${c[1]}" stroke="${c[3]}" stroke-width=".55" stroke-linejoin="round"/>`
      + `<path d="M0 -.2C${n3(an * .85)} .3 ${n3(an * .8)} ${n3(l * .7)} 0 ${n3(l - .3)}Z" fill="${c[2]}" opacity=".85"/><path d="M0 .4V${n3(l - 1)}" stroke="${c[3]}" stroke-width=".4" opacity=".6"/>`
      + `<path d="M${n3(-an * .55)} ${n3(l * .2)}Q${n3(-an * .6)} ${n3(l * .5)} ${n3(-an * .3)} ${n3(l * .68)}" fill="none" stroke="#fff" stroke-width=".45" stroke-linecap="round" opacity=".7"/></g>`; };
  const cubuhoPose = k => {
    const id = 'kb' + (++nB), SC = M.C.SCALE[k], body = k === 4 ? 'oro' : 'lila', BC = PAL[body], L = PAL.lila;
    const cria = k === 1, W = cria ? 13 : 16, H = cria ? 27 : 32, OY = cria ? -3 : 0, y0 = -1 - H + OY;
    const FC = [0, y0 + 12], ER = cria ? 6.6 : 7.4, plumaCol = k === 4 ? 'rosa' : 'lila';
    /* silueta del cubo (frente + costado): la cara no se sale de ella al girar */
    const silueta = `<rect x="${-W}" y="${y0}" width="${2 * W}" height="${H}" rx="6.5"/><path d="M${W - 1} ${y0 + 2}L${W + 7} ${y0 - 5}Q${W + 9} ${y0 - 6.4} ${W + 9} ${y0 - 4}L${W + 9} ${y0 + H - 7}Q${W + 9} ${y0 + H - 5} ${W + 7.4} ${y0 + H - 4}L${W - 1} ${y0 + H}Z"/>`;
    const ojo = (x, i) => `<g transform="translate(${x} ${n3(FC[1] + .5)})"><g id="${id}-o${i}"><ellipse rx="${n3(2.3 * 1.32)}" ry="${n3(2.7 * 1.32)}" fill="url(#km-ojo)"/><circle cx="${n3(.8 * 1.32)}" cy="${n3(-1.1 * 1.32)}" r="${n3(1.32)}" fill="#fff"/><circle cx="${n3(-.7 * 1.32)}" cy="${n3(1.2 * 1.32)}" r=".6" fill="#fff"/></g></g>`;
    const cara = gel(C(-7, FC[1], ER), 'crema', 1) + gel(C(7, FC[1], ER), 'crema', 1) + ojo(-7, 0) + ojo(7, 1)
      + `<ellipse cx="-12.4" cy="${FC[1] + 7.4}" rx="2.6" ry="1.5" fill="url(#km-mej)"/><ellipse cx="12.4" cy="${FC[1] + 7.4}" rx="2.6" ry="1.5" fill="url(#km-mej)"/>`
      + gel(P(`M-2.4 ${FC[1] + 6.6}Q0 ${FC[1] + 5.4} 2.4 ${FC[1] + 6.6}L.4 ${FC[1] + 10}Q0 ${FC[1] + 10.6} -.4 ${FC[1] + 10}Z`), 'naranja', .8);
    /* nuca: lo que se ve cuando la cara pasa por atrás */
    const nuca = `<ellipse cx="0" cy="${FC[1] + 1}" rx="${W - 4}" ry="${ER + 2}" fill="${BC[0]}" opacity=".55"/>`
      + [-1, 0, 1].map(j => [-6, 0, 6].map(x => `<path d="M${x - 2} ${FC[1] - 3 + j * 4}L${x} ${FC[1] - 1.4 + j * 4}L${x + 2} ${FC[1] - 3 + j * 4}" fill="none" stroke="${BC[2]}" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/>`).join('')).join('');
    const ala = (lado) => { /* lado -1: izquierda (sobre el frente), 1: derecha (sobre el costado) */
      const pts = [[-7.4, 4.6, 14, 4.6], [-6.2, 7.6, 8, 4.8], [-4.4, 9.8, 0, 4.4]];
      return `${gel(P('M0 -4Q-9 -2 -8.6 8Q-8 13 -3.6 12Q0 8 0 4Z'), body, 1.1)}${k >= 2 ? pts.map(([x, y, r, l]) => pluma(x, y, r, l, plumaCol)).join('') : ''}`;
    };
    const build = () => {
      let pre = k === 4 ? aura(-22, 38) + chispas([[-26, -36, 3], [31, -28, 2.6], [-22, -8, 2.2]]) : '';
      let g = '';
      if (k === 4) [[-13, -16, 1], [21, -18, -1]].forEach(([x, y, sg], i) => { g += `<g id="${id}-f${i}" transform="translate(${x} ${y})">${[70, 100, 130, 160].map((r, j) => `<g transform="rotate(${sg * r})">${pluma(0, 0, 0, 14 - j * 1.2, j % 2 ? 'lila' : 'rosa', 4)}</g>`).join('')}</g>`; });
      if (cria) {
        const cx = 3, hw = 24, back = [...Array(11)].map((_, i) => [n3(cx - hw + 1.4 + i * 2 * (hw - 1.4) / 10), n3(-18 + (i % 2 ? 3.6 : -1.6))]), front = [...Array(11)].map((_, i) => [n3(cx - hw + i * 2 * hw / 10), n3(-10.6 + (i % 2 ? 3.6 : 0))]);
        g += `<defs><radialGradient id="${id}-cas" cx=".35" cy=".2" r=".95"><stop offset="0" stop-color="#f3eeff"/><stop offset=".55" stop-color="#cdbcff"/><stop offset="1" stop-color="#9c84ec"/></radialGradient></defs>`;
        g += `<g id="${id}-cs"><path d="M${cx - hw} -8${back.map(([x, y]) => `L${x} ${y}`).join('')}L${cx + hw} -8Q${cx} -3 ${cx - hw} -8Z" fill="#a993ea" stroke="${L[3]}" stroke-width="1.1" stroke-linejoin="round"/><path d="M${cx - hw + 3} -10Q${cx} -6 ${cx + hw - 3} -10" fill="none" stroke="#8f78d8" stroke-width="2" opacity=".6"/>`;
        g += `<g id="${id}-cu"><g transform="translate(0 ${OY})">${M.B.H.boxBody(13, 27, 'lila')}</g>`;
        g += `<clipPath id="${id}-cl">${silueta}</clipPath><g clip-path="url(#${id}-cl)"><g id="${id}-nu" opacity="0">${nuca}</g><g id="${id}-ca">${cara}</g></g>`;
        g += `<g id="${id}-or0"><path d="M1 ${y0 - 6.4}Q-1 ${y0 - 12} 3.6 ${y0 - 12.4}Q6.6 ${y0 - 12.4} 5.6 ${y0 - 9.4}" fill="none" stroke="${L[2]}" stroke-width="2" stroke-linecap="round"/></g></g>`;
        const fd = `M${front[0][0]} ${front[0][1]}${front.slice(1).map(([x, y]) => `L${x} ${y}`).join('')}Q${cx + hw + 1} 1.4 ${cx} 1.4Q${cx - hw - 1} 1.4 ${front[0][0]} ${front[0][1]}Z`;
        g += `<path d="${fd}" fill="url(#${id}-cas)" stroke="${L[3]}" stroke-width="1.2" stroke-linejoin="round"/>`;
        g += [[-9, -4], [12, -5.2]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M-2.4 -.6L0 -2L2.4 -.6V2L0 3.2L-2.4 2Z" fill="${L[0]}" stroke="${L[3]}" stroke-width=".5"/><path d="M-2.4 -.6L0 .8L2.4 -.6M0 .8V3.2" fill="none" stroke="${L[3]}" stroke-width=".5"/></g>`).join('');
        g += arc(`M${cx - hw + 3} -6Q${cx - hw + 5} -1.6 ${cx - hw + 10} -.8`, 1.6, .8) + dot(cx + 3, -3, .8) + '</g>';
        return `<g transform="scale(${SC})">${pre}<g id="${id}-sh">${piso(24, 3)}</g><g id="${id}-all">${g}</g></g>`;
      }
      g += [-7, 7].map((x, i) => `<g id="${id}-pi${i}">${k >= 3 ? gel(R(x - 3.4, -6, 6.8, 6, 2), 'naranja', .9) + `<ellipse cx="${x}" cy="-6" rx="3.4" ry="1.2" fill="${PAL.naranja[0]}"/>` : gel(E(x, -1.2, 4.4, 2.4), 'naranja', .9)}</g>`).join('');
      g += M.B.H.boxBody(W, H, body);
      g += flat(E(0, -7.5, 10, 5.6), BC[0], BC[2], .9) + [[-5, -9], [0, -10], [5, -9], [-2.5, -5.6], [2.5, -5.6]].map(([x, y]) => `<path d="M${x - 1.5} ${y - .8}L${x} ${y + .6}L${x + 1.5} ${y - .8}" fill="none" stroke="${BC[2]}" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
      if (k >= 3) g += [-4.5, 0, 4.5].map(x => gel(C(x, -3.4, 1.5), k === 4 ? 'rosa' : 'amarillo', .5) + dot(x - .5, -3.9, .45)).join('');
      g += `<g id="${id}-a0"><g transform="translate(-15.5 -18) scale(-1 1)">${ala(-1)}</g></g><g id="${id}-a1"><g transform="translate(21 -18)">${ala(1)}</g></g>`;
      g += `<clipPath id="${id}-cl">${silueta}</clipPath><g clip-path="url(#${id}-cl)"><g id="${id}-nu" opacity="0">${nuca}</g><g id="${id}-ca">${cara}</g></g>`;
      if (k === 2) g += `<g id="${id}-or0">${gel(C(-9, -38.4, 3.2), body, 1)}</g><g id="${id}-or1">${gel(C(18, -40.4, 3.2), body, 1)}</g>`;
      if (k >= 3) {
        const cono = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})">${gel(P('M-4.2 1Q0 2.4 4.2 1L1.4 -5.8Q0 -7.8 -1.4 -5.8Z'), k === 4 ? 'rosa' : 'azul', 1)}<ellipse cx="0" cy="1" rx="4" ry="1.3" fill="${k === 4 ? PAL.rosa[2] : PAL.azul[2]}"/>${arc('M-1.8 -.6L-.6 -4.4', .8, .8)}</g>`;
        g += `<g id="${id}-or0">${cono(-8.6, -38.6, -24)}</g><g id="${id}-or1">${cono(19, -40.4, 24)}</g>`;
      }
      if (k === 4) g += `<g id="${id}-co">${corona(5.6, -41.6, 1.05)}</g>`;
      return `<g transform="scale(${SC})">${pre}<g id="${id}-sh">${piso(26, 2)}</g><g id="${id}-all">${g}</g></g>`;
    };
    const refs = el => { const q = s => el.querySelector('#' + id + '-' + s); return { sh: q('sh'), all: q('all'), ca: q('ca'), nu: q('nu'), o: [q('o0'), q('o1')], a: [q('a0'), q('a1')], or: [q('or0'), q('or1')], pi: [q('pi0'), q('pi1')], f: [q('f0'), q('f1')], cu: q('cu'), cs: q('cs'), co: q('co') }; };
    const update = (r, p) => {
      /* giro de la cabeza: la cara se corre por el costado, pasa por la nuca y vuelve por el otro lado */
      let g = ((p.giro % 1) + 1) % 1, dx = 0, sxx = 1, sk = 0, op = 1, nu = 0;
      if (p.giro > 0 && g < .3) { const t = EASE.suave(g / .3); dx = 19 * t; sxx = 1 - .66 * t; sk = -34 * t; op = t < .78 ? 1 : 1 - (t - .78) / .22; }
      else if (p.giro > 0 && g < .7) { op = 0; nu = Math.sin((g - .3) / .4 * Math.PI); }
      else if (p.giro > 0) { const t = EASE.suave((g - .7) / .3); dx = -19 * (1 - t); sxx = .34 + .66 * t; op = t < .25 ? t / .25 : 1; }
      const cx = FC[0], cy = FC[1];
      r.ca.setAttribute('transform', `translate(${n3(cx + dx + p.cabX)} ${n3(cy + p.cabY)}) rotate(${n3(p.cabRot)}) skewY(${n3(sk)}) scale(${n3(sxx)} 1) translate(${-cx} ${-cy})`);
      r.ca.setAttribute('opacity', n3(op)); r.nu.setAttribute('opacity', n3(nu));
      r.o.forEach((o, i) => o.setAttribute('transform', `scale(1 ${n3(Math.max(.08, p.ojos * (i === 0 ? p.guino : 1)))})`));
      /* alas: aleteo rápido (en el salto o al esponjarse) más el ángulo de cada una */
      const fl = p.aleteo * Math.sin((p.t || 0) * 34) * 22;
      if (r.a[0]) r.a[0].setAttribute('transform', `rotate(${n3(p.alaI + p.esponja * 10 + Math.max(0, fl))} -15.5 -22)`);
      if (r.a[1]) r.a[1].setAttribute('transform', `rotate(${n3(-p.alaD - p.esponja * 10 - Math.max(0, fl))} 21 -22)`);
      r.f.forEach((f, i) => f && f.setAttribute('transform', `translate(${i ? 21 : -13} ${i ? -18 : -16}) rotate(${n3((i ? -1 : 1) * (Math.sin((p.t || 0) * 1.6) * 3 * (p.vivo || 0) + fl * .6))})`));
      const oy = Math.sin(g * 2 * Math.PI) * (p.giro > 0 ? 2.5 : 0);
      r.or.forEach((o, i) => o && o.setAttribute('transform', `translate(${n3(oy + p.cabX * .4)} ${n3(p.cabY * .3 - p.esponja * 1.2)}) rotate(${n3((i ? -1 : 1) * p.orejas * 12 + p.cabRot * .5)} ${i ? 19 : -8.6} ${cria ? y0 - 6 : (i ? -40 : -38)})`));
      r.pi.forEach((f, i) => f && f.setAttribute('transform', `translate(0 ${n3(-Math.max(0, Math.sin((p.t || 0) * 9 + i * Math.PI)) * 1.6 * p.pasito)})`));
      if (r.cu) r.cu.setAttribute('transform', `translate(0 ${n3(p.sube)})`);
      if (r.cs) r.cs.setAttribute('transform', `rotate(${n3(p.casRot)} 3 0)`);
      const pu = 1 + p.esponja * .05;
      r.all.setAttribute('transform', `translate(0 ${n3(p.y)}) scale(${n3(p.sx * pu)} ${n3(p.sy * pu)})`);
      r.sh.setAttribute('transform', `scale(${n3(1 - Math.min(.4, -p.y / 40))} 1)`);
    };
    return { build, refs, update };
  };
  const B_SPEC = {
    fondo: (t, modo, p) => {
      const vivo = modo === 'vida' ? 1 : 0, r = Math.sin(t * 2 * Math.PI / 3.6);
      p.t = t; p.vivo = vivo;
      return { sy: r * .014, sx: -r * .007, cabRot: vivo * Math.sin(t * 2 * Math.PI / 5.1 + .7) * 2.5, cabY: vivo * Math.sin(t * 2 * Math.PI / 2.9) * .5 };
    },
    acciones: [
      m => m.hacer([[0, { cabX: 2.6 }, 160], [200, { cabX: -2.6 }, 220], [460, { cabX: 0, cabY: -1.8 }, 200], [700, { cabY: 1.2 }, 180], [920, { cabY: 0 }, 200]]), /* cabecea con curiosidad */
      m => m.hacer([[0, { cabRot: 14, orejas: .6 }, 380], [1200, { cabRot: -10, orejas: -.4 }, 420], [2200, { cabRot: 0, orejas: 0 }, 380]]), /* ladea la cabeza */
      m => m.hacer([[0, { guino: 0 }, 120, 'entra'], [520, { guino: 1 }, 160, 'sale']]), /* guiña un ojo */
      m => m.hacer([[0, { esponja: 1, aleteo: .25 }, 260, 'sale'], [520, { esponja: 0, aleteo: 0 }, 360, 'rebote']]), /* esponja las plumas */
      m => m.hacer([[0, { alaD: 50 }, 420, 'sale'], [1000, { alaD: 0 }, 380]]), /* estira un ala */
      m => m.hacer([[0, { giro: .22 }, 520], [1100, { giro: 0 }, 520]]), /* mira hacia atrás a medias */
      m => m.hacer([[0, { pasito: 1 }, 200], [1500, { pasito: 0 }, 200]]), /* da pasitos */
    ],
    gesto: (m, d) => m.hacer([
      [d, { sy: .92, sx: 1.05, orejas: .5 }, 140], [d + 140, { sy: 1, sx: 1 }, 200],
      [d + 120, { giro: .999 }, 1500, 'suave'], [d + 1640, { giro: 0, orejas: 0 }, 1], /* da la vuelta completa a la cabeza */
      [d + 1700, { ojos: 0 }, 80], [d + 1790, { ojos: 1 }, 110], [d + 1700, { esponja: 1 }, 160], [d + 1900, { esponja: 0 }, 300, 'rebote']]),
    salto: (m, d) => m.hacer([
      [d, { sy: .84, sx: 1.1 }, 140], [d + 140, { y: -16, sy: 1.1, sx: .92, aleteo: 1 }, 260, 'sale'], [d + 400, { y: 0, sy: 1.02, sx: .98 }, 230, 'entra'],
      [d + 560, { aleteo: 0 }, 120], [d + 630, { sy: .88, sx: 1.08 }, 100], [d + 730, { sy: 1, sx: 1 }, 260, 'rebote']]),
  };
  /* la cría: dentro de su cascarón se asoma y se esconde */
  const B1_SPEC = {
    fondo: B_SPEC.fondo,
    acciones: [
      B_SPEC.acciones[0], B_SPEC.acciones[1], B_SPEC.acciones[2],
      m => m.hacer([[0, { sube: -3.5 }, 380, 'sale'], [900, { sube: 0 }, 400]]), /* se asoma más */
      m => m.hacer([[0, { sube: 6, casRot: -3 }, 300], [300, { casRot: 2 }, 200], [500, { casRot: 0 }, 200], [1000, { sube: 0 }, 380, 'rebote']]), /* se esconde a medias */
    ],
    gesto: (m, d) => m.hacer([
      [d, { sube: 14 }, 260, 'entra'], [d + 120, { casRot: -6 }, 140], [d + 260, { casRot: 5 }, 140], [d + 400, { casRot: -3 }, 130], [d + 530, { casRot: 0 }, 150], /* se mete entero y el cascarón tiembla */
      [d + 1000, { sube: 5 }, 260, 'sale'], [d + 1450, { sube: -4 }, 260, 'rebote'], [d + 1710, { sube: 0 }, 260], [d + 1720, { guino: 0 }, 100], [d + 1950, { guino: 1 }, 140]]),
    salto: (m, d) => m.hacer([[d, { sube: 3 }, 120], [d + 120, { sube: -12 }, 260, 'sale'], [d + 380, { sube: 0 }, 260, 'entra'], [d + 640, { casRot: 3 }, 100], [d + 740, { casRot: 0 }, 200, 'rebote']]),
  };

  const ANIM = { tortugono: k => ({ draw: tortugonoPose(k), base: T_BASE, spec: T_SPEC }), cubuho: k => ({ draw: cubuhoPose(k), base: B_BASE, spec: k === 1 ? B1_SPEC : B_SPEC }) };
  /* poner(el, id, k): arranca el motor de esa mascota dentro de el (un <g>); devuelve el motor o null si no tiene poses */
  const poner = (el, id, k) => { if (!ANIM[id] || !k) return null; const a = ANIM[id](k); return new Motor(el, a.draw, a.base, a.spec); };
  M.POSES = { Motor, poner, tiene: id => !!ANIM[id], EASE };
})(typeof window !== 'undefined' ? window : global);
