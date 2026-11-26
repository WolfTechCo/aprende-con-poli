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
    lineal: t => t,
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
      /* si lo tocan justo mientras parpadea, los ojos no deben quedar cerrados */
      if ('ojos' in this.v) this.v.ojos = 1; if ('guino' in this.v) this.v.guino = 1;
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
  /* pone un atributo solo si cambió (reescribir sin necesidad hace que la animación se ponga lenta) */
  const sa = (el, k, v) => { if (!el) return; const c = el._c || (el._c = {}); if (c[k] === v) return; c[k] = v; el.setAttribute(k, v); };
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

  /* ---------- 2 · Cubúho con poses: la cabeza gira como una capa de cubo Rubik ----------
     Idea de la dueña (25-11-2026): el búho gira la cabeza entera con el cuerpo quieto (no puede mover los ojos), así que el
     cubo se parte en dos capas y la de ARRIBA (la cabeza) gira de verdad en 3D sobre la de abajo (el cuerpo): mira a la
     izquierda, a la derecha, hacia atrás o da la vuelta completa, mostrando sus costados y su nuca. La cabeza es una caja
     3D (5 caras con su contenido pegado, orejas y corona encima) proyectada igual que el dibujo del cubo de siempre.
     La cría vive dentro de su cascarón: el cascarón la tapa por abajo cuando se agacha (no se sale por el hoyo). */
  let nB = 0;
  const B_BASE = { giroOjos: 0, miraX: 0, teta: 0, cabX: 0, cabY: 0, ladeo: 0, ojos: 1, guino: 1, alaI: 0, alaD: 0, aleteo: 0, orejas: 0, pasito: 0, sube: 0, casRot: 0, esponja: 0, sx: 1, sy: 1, y: 0 };
  /* pluma: hoja redondeada con nervio, mitad clara y mitad en sombra */
  const pluma = (x, y, r, l, col, an = 2.6) => { const c = PAL[col];
    return `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 -.4C${an} .2 ${n3(an * .9)} ${n3(l * .7)} 0 ${l}C${n3(-an * .9)} ${n3(l * .7)} ${-an} .2 0 -.4Z" fill="${c[1]}" stroke="${c[3]}" stroke-width=".55" stroke-linejoin="round"/>`
      + `<path d="M0 -.2C${n3(an * .85)} .3 ${n3(an * .8)} ${n3(l * .7)} 0 ${n3(l - .3)}Z" fill="${c[2]}" opacity=".85"/><path d="M0 .4V${n3(l - 1)}" stroke="${c[3]}" stroke-width=".4" opacity=".6"/>`
      + `<path d="M${n3(-an * .55)} ${n3(l * .2)}Q${n3(-an * .6)} ${n3(l * .5)} ${n3(-an * .3)} ${n3(l * .68)}" fill="none" stroke="#fff" stroke-width=".45" stroke-linecap="round" opacity=".7"/></g>`; };
  /* contorno de una caja proyectada: casco convexo con las esquinas redondeadas (así las caras se ven unidas, como gomita) */
  const casco = pts => {
    const q = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    q.forEach(p => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    q.slice().reverse().forEach(p => { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
    lo.pop(); up.pop(); return lo.concat(up);
  };
  const redondo = (h, r) => { let d = ''; const n = h.length;
    h.forEach((p, i) => { const a = h[(i + n - 1) % n], b = h[(i + 1) % n], la = Math.hypot(a[0] - p[0], a[1] - p[1]) || 1, lb = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1;
      const ta = Math.min(r, la / 2) / la, tb = Math.min(r, lb / 2) / lb;
      d += (i ? 'L' : 'M') + n3(p[0] + (a[0] - p[0]) * ta) + ' ' + n3(p[1] + (a[1] - p[1]) * ta) + 'Q' + n3(p[0]) + ' ' + n3(p[1]) + ' ' + n3(p[0] + (b[0] - p[0]) * tb) + ' ' + n3(p[1] + (b[1] - p[1]) * tb); });
    return d + 'Z'; };
  /* oreja de cono: base plana sobre la cabeza (sin elipse hacia el frente); se inclina con skewX, que no gira la base */
  const cono = k => `${gel(P('M-4.3 1.2Q0 2.2 4.3 1.2L1.3 -6Q0 -8 -1.3 -6Z'), k === 4 ? 'rosa' : 'azul', 1)}${arc('M-1.9 -.4L-.6 -4.6', .8, .8)}`;
  const conoT = (lado, o) => `skewX(${n3(lado * (14 + o * 16))}) scale(1 ${n3(1 - Math.abs(o) * .08)})`;
  /* contorno abierto: el casco convexo sin los bordes que unen puntos «de la unión» (así, quieto, no se ve corte) */
  const abierto = (h, esUnion, r) => {
    const n = h.length, j = h.findIndex((p, i) => esUnion(p) && !esUnion(h[(i + 1) % n])); /* último punto de la unión */
    if (j < 0) return redondo(h, r);
    const out = [h[j]]; for (let k = 1; k <= n; k++) { const p = h[(j + k) % n]; out.push(p); if (esUnion(p)) break; } /* recorre hasta volver a la unión */
    let d = 'M' + n3(out[0][0]) + ' ' + n3(out[0][1]);
    for (let k = 1; k < out.length - 1; k++) { const a = out[k - 1], p = out[k], b = out[k + 1], la = Math.hypot(a[0] - p[0], a[1] - p[1]) || 1, lb = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1;
      const ta = Math.min(r, la / 2) / la, tb = Math.min(r, lb / 2) / lb;
      d += 'L' + n3(p[0] + (a[0] - p[0]) * ta) + ' ' + n3(p[1] + (a[1] - p[1]) * ta) + 'Q' + n3(p[0]) + ' ' + n3(p[1]) + ' ' + n3(p[0] + (b[0] - p[0]) * tb) + ' ' + n3(p[1] + (b[1] - p[1]) * tb); }
    const z = out[out.length - 1]; return d + 'L' + n3(z[0]) + ' ' + n3(z[1]);
  };
  /* punto de una curva cúbica */
  const cub = (a, b, c, d, t) => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
  /* pie de búho: tres deditos redondeados con garritas suaves */
  const pieBuho = (x, k) => { const e = k >= 3 ? 1.12 : 1; return [-1, 0, 1].map(j => `<g transform="translate(${n3(x + j * 2.3 * e)} ${n3(-.2 + Math.abs(j) * -.3)})">${gel(E(0, 0, n3(1.5 * e), n3(2 * e)), 'naranja', .7)}`
    + `<path d="M${n3(-.6 * e)} ${n3(1.7 * e)}Q0 ${n3(2.9 * e)} ${n3(.6 * e)} ${n3(1.7 * e)}" fill="${PAL.naranja[3]}" opacity=".75"/>${dot(n3(-.5 * e), n3(-.8 * e), .35)}</g>`).join(''); };
  const cubuhoPose = k => {
    const id = 'kb' + (++nB), SC = M.C.SCALE[k], body = k === 4 ? 'oro' : 'lila', BC = PAL[body], L = PAL.lila, cria = k === 1;
    const W = cria ? 13 : 16, TOP = cria ? -31 : -35, BOT = cria ? -4 : -1, SPLIT = cria ? -7.4 : -14, D = 2 * W;
    const PX = (cria ? 8.5 : 9) / D, PY = -7 / D; /* proyección del fondo: hacia la derecha y hacia arriba, como el cubo de siempre */
    const HH = SPLIT - TOP, ER = cria ? 6.6 : 7.4, FV = cria ? 12 : 10.4; /* alto de la cabeza; radio de los discos; altura de los ojos en la cara */
    const proj = (x, y, z) => [x + PX * z, y + PY * z];
    const rot = (x, z, c, s) => [x * c + (z - W) * s, W - x * s + (z - W) * c]; /* gira alrededor del eje vertical que pasa por el centro */
    /* caras de la cabeza: origen, eje U (ancho), eje V (alto o fondo), normal (y hacia abajo como en SVG) */
    const CARAS = [
      { n: 'fr', o: [-W, TOP, 0], u: [D, 0, 0], v: [0, HH, 0], nr: [0, 0, -1] },
      { n: 'at', o: [W, TOP, D], u: [-D, 0, 0], v: [0, HH, 0], nr: [0, 0, 1] },
      { n: 'iz', o: [-W, TOP, D], u: [0, 0, -D], v: [0, HH, 0], nr: [-1, 0, 0] },
      { n: 'de', o: [W, TOP, 0], u: [0, 0, D], v: [0, HH, 0], nr: [1, 0, 0] },
      { n: 'ar', o: [-W, TOP, D], u: [D, 0, 0], v: [0, 0, -D], nr: [0, -1, 0] },
    ];
    const ojo = (x, i) => `<g transform="translate(${x} ${FV + .5})"><g id="${id}-o${i}"><ellipse rx="${n3(2.3 * 1.32)}" ry="${n3(2.7 * 1.32)}" fill="url(#km-ojo)"/><circle cx="${n3(.8 * 1.32)}" cy="${n3(-1.1 * 1.32)}" r="${n3(1.32)}" fill="#fff"/><circle cx="${n3(-.7 * 1.32)}" cy="${n3(1.2 * 1.32)}" r=".6" fill="#fff"/></g></g>`;
    /* contenido de cada cara, en coordenadas de la cara (0..ancho, 0..alto) */
    const disco = cria ? '' : `<path d="M${W} ${FV - 6}C${W - 4} ${FV - 9.6} ${W - 15.4} ${FV - 9.2} ${W - 15} ${FV + 1}C${W - 14.2} ${FV + 7.6} ${W - 6} ${FV + 9} ${W} ${FV + 11.4}C${W + 6} ${FV + 9} ${W + 14.2} ${FV + 7.6} ${W + 15} ${FV + 1}C${W + 15.4} ${FV - 9.2} ${W + 4} ${FV - 9.6} ${W} ${FV - 6}Z" fill="${BC[0]}" opacity=".85" stroke="${BC[2]}" stroke-width=".6" stroke-opacity=".45"/>`;
    const cejas = cria ? '' : [-1, 1].map(g => `<path d="M${W + g * 1.6} ${n3(FV - 7.2)}Q${W + g * 7} ${n3(FV - 10.6)} ${W + g * 13.6} ${n3(FV - 8.2)}" fill="none" stroke="${BC[2]}" stroke-width="2.3" stroke-linecap="round"/><path d="M${W + g * 4} ${n3(FV - 9)}Q${W + g * 7.4} ${n3(FV - 10.4)} ${W + g * 10.6} ${n3(FV - 9.6)}" fill="none" stroke="#fff" stroke-width=".7" stroke-linecap="round" opacity=".55"/>`).join('');
    const caraFrente = disco + gel(C(W - 7, FV, ER), 'crema', 1) + gel(C(W + 7, FV, ER), 'crema', 1) + ojo(W - 7, 0) + ojo(W + 7, 1)
      + `<ellipse cx="${W - 12.4}" cy="${FV + 7.2}" rx="2.6" ry="1.5" fill="url(#km-mej)"/><ellipse cx="${W + 12.4}" cy="${FV + 7.2}" rx="2.6" ry="1.5" fill="url(#km-mej)"/>`
      + gel(P(`M${W - 2.4} ${FV + 6.4}Q${W} ${FV + 5.2} ${W + 2.4} ${FV + 6.4}L${W + .4} ${FV + 9.8}Q${W} ${FV + 10.4} ${W - .4} ${FV + 9.8}Z`), 'naranja', .8) + cejas;
    const caraAtras = `<ellipse cx="${W}" cy="${FV + 1}" rx="${W - 4}" ry="${n3(HH / 2 - 2)}" fill="${BC[0]}" opacity=".5"/>`
      + [-1, 0, 1].map(j => [-6, 0, 6].map(x => `<path d="M${W + x - 2.2} ${FV - 3 + j * 4.4}L${W + x} ${FV - 1.2 + j * 4.4}L${W + x + 2.2} ${FV - 3 + j * 4.4}" fill="none" stroke="${BC[2]}" stroke-width=".95" stroke-linecap="round" stroke-linejoin="round"/>`).join('')).join('');
    const caraLado = `<path d="M${W - 5} ${n3(HH * .45)}L${W} ${n3(HH * .45 + 2.4)}L${W + 5} ${n3(HH * .45)}M${W - 5} ${n3(HH * .45 + 4.4)}L${W} ${n3(HH * .45 + 6.8)}L${W + 5} ${n3(HH * .45 + 4.4)}" fill="none" stroke="${BC[3]}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>`;
    const cuerpoCara = (f) => {
      const w = Math.hypot(...f.u), h = Math.hypot(...f.v), top = f.n === 'ar';
      const fill = top ? `fill="${BC[0]}"` : f.n === 'fr' && !cria ? `fill="url(#${id}-gf)"` : `fill="url(#km-${body})"`;
      const dentro = f.n === 'fr' ? caraFrente : f.n === 'at' ? caraAtras : top ? `<path d="M${n3(w * .2)} ${n3(h * .82)}H${n3(w * .8)}" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>` : caraLado;
      return `<g id="${id}-c${f.n}"><rect x="-.3" y="-.3" width="${n3(w + .6)}" height="${n3(h + .6)}" ${fill}/>`
        + (top ? '' : `<rect id="${id}-s${f.n}" width="${n3(w)}" height="${n3(h)}" fill="#2a1640" opacity="0"/>${arc(`M4 ${n3(h * .55)}Q3.6 4 9 3.4`, 1.6, .7)}`)
        + `<rect class="arista" width="${n3(w)}" height="${n3(h)}" fill="none" stroke="${BC[3]}" stroke-width=".7" opacity="${cria ? .4 : 0}"/>` + dentro + '</g>';
    };
    const OREJAS = [[-9.5, 6], [9.5, 6]]; /* sobre la tapa, cerca del frente */
    const oreja = (i) => k >= 3
      ? `<g id="${id}-e${i}"><g id="${id}-ei${i}">${cono(k)}</g></g>`
      : k === 2 ? `<g id="${id}-e${i}"><g id="${id}-ei${i}">${gel(C(0, -1.6, 3.2), body, 1)}</g></g>` : '';
    const ala = () => `${gel(P('M0 -4Q-9 -2 -8.6 8Q-8 13 -3.6 12Q0 8 0 4Z'), body, 1.1)}${k >= 2 ? [[-7.4, 4.6, 14, 4.6], [-6.2, 7.6, 8, 4.8], [-4.4, 9.8, 0, 4.4]].map(([x, y, r, l]) => pluma(x, y, r, l, k === 4 ? 'rosa' : 'lila')).join('') : ''}`;
    /* ala plegada contra el cuerpo: nace en el hombro (0, 0), cae hacia abajo y atrás, plumas con la punta hacia abajo y atrás */
    /* ala pegada al costado: dibujada en el plano del costado (u = hacia atrás, v = hacia abajo), nace en el hombro (0, 0) */
    /* ala vista de tres cuartos: nace en el hombro (0, 0), cubre el costado abultándose hacia afuera y su punta va hacia atrás (abajo a la derecha) */
    /* ala que cuelga desde el hombro (0, 0), pegada al costado; afuera = x positivo */
    /* orilla de abajo con tres puntas redondeadas de pluma (parte del contorno, nada cuelga suelto) */
    const ALA_D = 'M0 0C3.8 -.4 6.4 2.6 6.6 7L6.5 11.2Q6 13.8 4.6 12.4Q3.5 14.6 2.3 12.8Q.9 14.4 .1 12.2L-.4 7.4C-.8 4.4 -.6 1.6 0 0Z';
    const colP = k === 4 ? 'rosa' : 'lila';
    /* 3 filas de plumas de hoja, más largas abajo; cada fila es un grupo que se abre en abanico al levantar el ala */
    /* filas de plumas en escamas sobre el ala (dentro del contorno) */
    const fila = y => `<path d="M-.2 ${y}Q1.4 ${n3(y + 2.6)} 3.1 ${y}Q4.8 ${n3(y + 2.6)} 6.5 ${y}L6.5 ${n3(y - 1)}Q3.2 ${n3(y - 2.2)} -.2 ${n3(y - 1)}Z" fill="${BC[1]}" stroke="${BC[2]}" stroke-width=".55" stroke-linejoin="round" opacity=".95"/>`;
    const alaLado = () => `<path d="${ALA_D}" transform="translate(-1 1.4)" fill="#2a1640" opacity=".2"/>` /* sombra sobre el cuerpo: da volumen */
      + gel(P(ALA_D), body, 1.2) + arc('M.8 1.4Q3.6 .8 5 3.6', 1.1, .75)
      + `<clipPath id="${id}-acl"><path d="${ALA_D}"/></clipPath><g clip-path="url(#${id}-acl)">` + [4.8, 7.6, 10.4].map((y, i) => `<g class="fila" data-i="${i}">${fila(y)}</g>`).join('') + '</g>'
      + (k === 4 ? `<path d="M1.2 12.4Q3.4 13.6 5.4 12.4" fill="none" stroke="${PAL.rosa[1]}" stroke-width="1.1" stroke-linecap="round"/>` : '');
    const alaPlegada = alaLado;
    /* cuerpo (capa de abajo), quieto: costado, tapa (se ve en las esquinas cuando la cabeza gira) y frente */
    const BY = -.4; /* base de la panza */
    const frente = () => { /* contorno del frente de la panza: lados que se abomban y base redonda */
      const L = [[-W, SPLIT], [-W - .6, -11], [-W - .3, -8.4]], R = [[W + .3, -8.4], [W + .6, -11], [W, SPLIT]];
      const c1 = [...Array(9)].map((_, i) => cub([-W - .3, -8.4], [-W - 2.8, -3.4], [-12.6, BY], [-6, BY], i / 8));
      const c2 = [...Array(9)].map((_, i) => cub([6, BY], [12.6, BY], [W + 2.8, -3.4], [W + .3, -8.4], i / 8));
      return [...L, ...c1.slice(1), ...c2, ...R.slice(1)];
    };
    const panza = () => {
      const F = frente(), dF = 'M' + F.map(p => p.map(n3).join(' ')).join('L') + 'Z';
      /* anillos hacia atrás: la base sube y se recoge cuanto más atrás (forma de huevo) */
      const anillo = (fz, sube, recoge) => F.map(([x, y]) => { const t = clamp((y - SPLIT) / (BY - SPLIT), 0, 1); return [x * (1 - recoge * t * t) + PX * D * fz, y + PY * D * fz - sube * t * t]; });
      const S = [...anillo(.45, 1.6, .05), ...anillo(.8, 4.4, .14), ...anillo(1, 6.4, .22)];
      const esUnion = ([x, y]) => Math.abs(y - SPLIT - PY * D * .45) < .01 || Math.abs(y - SPLIT - PY * D * .8) < .01 || Math.abs(y - SPLIT) < .01 || Math.abs(y - (SPLIT + PY * D)) < .01;
      const h = casco([...F, ...S]);
      let o = `<path d="${redondo(h, 1.5)}" fill="${BC[2]}"/>`; /* volumen: el costado en sombra */
      o += `<path d="${dF}" fill="url(#${id}-g)"/>`;
      o += `<path d="${abierto(h, esUnion, 2.4)}" fill="none" stroke="${BC[3]}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>`;
      /* panza clara abajo y banda de plumas en escamas bajo la cara (ahí queda el corte del giro) */
      o += `<clipPath id="${id}-pz"><path d="${dF}"/></clipPath><g clip-path="url(#${id}-pz)">`;
      o += `<ellipse cx="0" cy="-3.6" rx="12.6" ry="6.6" fill="${BC[0]}" opacity=".9"/>` + (k >= 3 ? [[-5, -5.6], [5, -5.6], [-4.4, -2.8], [4.4, -2.8]] : [[-5, -5.6], [0, -6.4], [5, -5.6], [-2.5, -2.8], [2.5, -2.8]]).map(([x, y]) => `<path d="M${x - 1} ${y}L${x} ${y + .9}L${x + 1} ${y}" fill="none" stroke="${BC[2]}" stroke-width=".7" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`).join('');
      [[SPLIT + .4, 0], [SPLIT + 3, 2.2], [SPLIT + 5.6, 0]].forEach(([y, dx]) => { for (let x = -W - 1 + dx; x <= W + 2; x += 4.4) o += `<path d="M${n3(x - 2.4)} ${n3(y)}Q${n3(x)} ${n3(y + 3.8)} ${n3(x + 2.4)} ${n3(y)}Z" fill="${BC[1]}" stroke="${BC[2]}" stroke-width=".6" stroke-linejoin="round"/>`; });
      o += '</g>';
      if (k >= 3) o += [-7.2, -4.8, -2.4].map(y => gel(C(0, y, 1.15), k === 4 ? 'rosa' : 'amarillo', .5) + dot(-.4, n3(y - .4), .38)).join(''); /* botones de esfera, como de chaqueta */
      return o;
    };
    const cuerpo = () => {
      if (!cria) return panza();
      const p = (x, y, z) => proj(x, y, z).map(n3).join(' ');
      const pts = []; [-W, W].forEach(x => [0, D].forEach(z => [SPLIT, BOT].forEach(y => pts.push(proj(x, y, z)))));
      const sil = redondo(casco(pts), 3.6);
      let s = `<clipPath id="${id}-bc"><path d="${sil}"/></clipPath><path d="${sil}" fill="${BC[2]}"/><g clip-path="url(#${id}-bc)">`;
      s += `<path d="M${p(-W, SPLIT, 0)}L${p(-W, SPLIT, D)}L${p(W, SPLIT, D)}L${p(W, SPLIT, 0)}Z" fill="${BC[2]}"/>`;
      s += `<path d="M${p(W, SPLIT, 0)}L${p(W, SPLIT, D)}L${p(W, BOT, D)}L${p(W, BOT, 0)}Z" fill="${BC[2]}" stroke="${BC[3]}" stroke-width=".7" stroke-opacity=".45"/>`;
      s += `<rect x="${-W}" y="${SPLIT}" width="${2 * W}" height="${BOT - SPLIT + 1}" fill="url(#km-${body})"/></g><path d="${sil}" fill="none" stroke="${BC[3]}" stroke-width="1.4" stroke-linejoin="round"/>`;
      if (!cria) s += flat(E(0, n3((SPLIT + BOT) / 2 + .6), 9, n3((BOT - SPLIT) / 2 - .6)), BC[0], BC[2], .9) + [-3.4, 3.4].map(x => `<path d="M${x - 1.4} ${SPLIT + 2.6}L${x} ${SPLIT + 3.8}L${x + 1.4} ${SPLIT + 2.6}" fill="none" stroke="${BC[2]}" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
      if (k >= 3) s += [-4.5, 0, 4.5].map(x => gel(C(x, -3.2, 1.4), k === 4 ? 'rosa' : 'amarillo', .5) + dot(x - .5, -3.7, .4)).join('');
      return s;
    };
    /* patas delante del cuerpo, asomando por debajo (no se pierden al crecer) */
    const patas = () => [-6.6, 6.6].map((x, i) => `<g id="${id}-pi${i}">${pieBuho(x, k)}</g>`).join('');
    const cabeza = () => `<g id="${id}-cab"><clipPath id="${id}-hc"><path id="${id}-hcp"/></clipPath><path id="${id}-hs" fill="url(#km-${body})"/>`
      + `<g clip-path="url(#${id}-hc)">${CARAS.map(cuerpoCara).join('')}</g><path id="${id}-hs2" fill="none" stroke="${BC[3]}" stroke-width="1.4" stroke-linejoin="round"/>`
      + (k === 4 ? `<g id="${id}-co">${corona(0, 0, .86)}</g>` : '') + [0, 1].map(oreja).join('')
      + (cria ? `<g id="${id}-ri"><path d="M-2 -0.4Q-4 -6 .6 -6.4Q3.6 -6.4 2.6 -3.4" fill="none" stroke="${L[2]}" stroke-width="2" stroke-linecap="round"/></g>` : '')
      + '</g>';
    const build = () => {
      const pre = k === 4 ? aura(-22, 38) + chispas([[-26, -36, 3], [31, -28, 2.6], [-22, -8, 2.2]]) : '';
      let g = '';
      if (k === 4) [[-13, -14, 1], [21, -16, -1]].forEach(([x, y, sg], i) => { g += `<g id="${id}-f${i}" transform="translate(${x} ${y})">${[70, 100, 130, 160].map((r, j) => `<g transform="rotate(${sg * r})">${pluma(0, 0, 0, 14 - j * 1.2, j % 2 ? 'lila' : 'rosa', 4)}</g>`).join('')}</g>`; });
      if (cria) {
        const cx = 3, hw = 24, back = [...Array(11)].map((_, i) => [n3(cx - hw + 1.4 + i * 2 * (hw - 1.4) / 10), n3(-18 + (i % 2 ? 3.6 : -1.6))]), front = [...Array(11)].map((_, i) => [n3(cx - hw + i * 2 * hw / 10), n3(-10.6 + (i % 2 ? 3.6 : 0))]);
        const fd = `M${front[0][0]} ${front[0][1]}${front.slice(1).map(([x, y]) => `L${x} ${y}`).join('')}Q${cx + hw + 1} 1.4 ${cx} 1.4Q${cx - hw - 1} 1.4 ${front[0][0]} ${front[0][1]}Z`;
        g += `<defs><radialGradient id="${id}-cas" cx=".35" cy=".2" r=".95"><stop offset="0" stop-color="#f3eeff"/><stop offset=".55" stop-color="#cdbcff"/><stop offset="1" stop-color="#9c84ec"/></radialGradient>`
          + `<clipPath id="${id}-cl"><rect x="-60" y="-120" width="130" height="${120 - 9}"/><path d="${fd}"/></clipPath></defs>`;
        g += `<g id="${id}-cs"><path d="M${cx - hw} -8${back.map(([x, y]) => `L${x} ${y}`).join('')}L${cx + hw} -8Q${cx} -3 ${cx - hw} -8Z" fill="#a993ea" stroke="${L[3]}" stroke-width="1.1" stroke-linejoin="round"/><path d="M${cx - hw + 3} -10Q${cx} -6 ${cx + hw - 3} -10" fill="none" stroke="#8f78d8" stroke-width="2" opacity=".6"/>`;
        g += `<g clip-path="url(#${id}-cl)"><g id="${id}-cu">${cuerpo()}${cabeza()}</g></g>`; /* el cascarón la tapa por abajo */
        g += `<path d="${fd}" fill="url(#${id}-cas)" stroke="${L[3]}" stroke-width="1.2" stroke-linejoin="round"/>`;
        g += [[-9, -4], [12, -5.2]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M-2.4 -.6L0 -2L2.4 -.6V2L0 3.2L-2.4 2Z" fill="${L[0]}" stroke="${L[3]}" stroke-width=".5"/><path d="M-2.4 -.6L0 .8L2.4 -.6M0 .8V3.2" fill="none" stroke="${L[3]}" stroke-width=".5"/></g>`).join('');
        g += arc(`M${cx - hw + 3} -6Q${cx - hw + 5} -1.6 ${cx - hw + 10} -.8`, 1.6, .8) + dot(cx + 3, -3, .8) + '</g>';
        return `<g transform="scale(${SC})">${pre}<g id="${id}-sh">${piso(24, 3)}</g><g id="${id}-all">${g}</g></g>`;
      }
      const [gl, gb, gd] = BC;
      g += `<defs><radialGradient id="${id}-g" gradientUnits="userSpaceOnUse" cx="-7" cy="-27" r="40"><stop offset="0" stop-color="${gl}"/><stop offset=".5" stop-color="${gb}"/><stop offset="1" stop-color="${gd}"/></radialGradient>`
        + `<radialGradient id="${id}-gf" gradientUnits="userSpaceOnUse" cx="${-7 + W}" cy="${-27 - TOP}" r="40"><stop offset="0" stop-color="${gl}"/><stop offset=".5" stop-color="${gb}"/><stop offset="1" stop-color="${gd}"/></radialGradient>`
        + `<clipPath id="${id}-ru"><path d="M-80 -120H90V${n3(SPLIT - 1 - 7.6 - 60 * 7 / 9)}L${n3(W + 9.6)} ${n3(SPLIT - 1 - 7.6)}L${W - .4} ${n3(SPLIT - 1)}H-80Z"/></clipPath></defs>`;
      /* ala lejana: en el costado izquierdo (de espaldas a nosotros), detrás del cuerpo; asoma solo la punta de atrás */
      g += '';
      g += cuerpo();
      /* ala cercana: en el plano del costado derecho, pegada y hacia atrás */
      /* las dos alas delante de los costados: la izquierda enmarca el cuerpo; la derecha (de tres cuartos) va sobre el costado */
      g += `<g id="${id}-a0"><g transform="translate(${-W + .6} ${SPLIT + .6}) scale(-.95 1)"><g id="${id}-ai0">${alaPlegada()}</g></g></g>`;
      g += `<g id="${id}-a1"><g transform="translate(${W + 2.4} ${SPLIT - 1}) skewY(-22) scale(.92 1)"><g id="${id}-ai1">${alaPlegada()}</g></g></g>`;
      g += patas() + cabeza();
      return `<g transform="scale(${SC})">${pre}<g id="${id}-sh">${piso(26, 2)}</g><g id="${id}-all">${g}</g></g>`;
    };
    const refs = el => { const q = s => el.querySelector('#' + id + '-' + s);
      return { sh: q('sh'), all: q('all'), cab: q('cab'), hcp: q('hcp'), hs: q('hs'), hs2: q('hs2'), ai: [q('ai0'), q('ai1')], filas: [q('ai0'), q('ai1')].map(a => a ? [...a.querySelectorAll('.fila')] : []), aristas: [...el.querySelectorAll('#' + id + '-cab .arista')], caras: CARAS.map(f => ({ f, g: q('c' + f.n), s: q('s' + f.n) })), o: [q('o0'), q('o1')], e: [q('e0'), q('e1')], ei: [q('ei0'), q('ei1')], ri: q('ri'), co: q('co'),
        a: [q('a0'), q('a1')], pi: [q('pi0'), q('pi1')], f: [q('f0'), q('f1')], cu: q('cu'), cs: q('cs') }; };
    const update = (r, p) => {
      const th = p.teta * Math.PI / 180, c = Math.cos(th), s = Math.sin(th), clave = n3(p.teta);
      if (r._teta !== clave) { r._teta = clave;
      /* caras de la cabeza: cada una se proyecta con una matriz; se ven solo las que miran hacia nosotros */
      r.caras.forEach(({ f, g, s: sh }) => {
        const [ox, oz] = rot(f.o[0], f.o[2], c, s), dir = v => { const x = v[0] * c + v[2] * s, z = -v[0] * s + v[2] * c; return [x, v[1], z]; };
        const n = dir(f.nr), ve = n[0] * PX + n[1] * PY - n[2];
        if (ve <= .02) { g.setAttribute('display', 'none'); return; }
        g.removeAttribute('display');
        const U = dir(f.u), V = dir(f.v), w = Math.hypot(...f.u), h = Math.hypot(...f.v), [ex, ey] = proj(ox, f.o[1], oz);
        g.setAttribute('transform', `matrix(${n3((U[0] + PX * U[2]) / w)} ${n3((U[1] + PY * U[2]) / w)} ${n3((V[0] + PX * V[2]) / h)} ${n3((V[1] + PY * V[2]) / h)} ${n3(ex)} ${n3(ey)})`);
        if (sh) sh.setAttribute('opacity', n3(clamp((.8 - (-.5 * n[0] - .86 * n[2])) * .3, 0, .42))); /* sombra según hacia dónde mira la cara */
      });
      const hp = []; [-W, W].forEach(x => [0, D].forEach(z => { const [rx, rz] = rot(x, z, c, s); [TOP, SPLIT].forEach(y => hp.push(proj(rx, y, rz))); }));
      const hh = casco(hp), hd = redondo(hh, 3.8); r.hcp.setAttribute('d', hd); r.hs.setAttribute('d', hd);
      const gira = cria ? 1 : clamp(Math.abs(Math.sin(th / 2)) * 6, 0, 1);
      if (!cria && gira < .03) { r.hs2.setAttribute('d', hd); r.hs2.setAttribute('clip-path', `url(#${id}-ru)`); } else { r.hs2.setAttribute('d', hd); r.hs2.removeAttribute('clip-path'); }
      if (!cria) r.aristas.forEach(a => a.setAttribute('opacity', n3(.4 * gira)));
      /* orejas, rizo y corona: puntos sobre la tapa que giran con la cabeza */
      const sobre = (x, z) => { const [rx, rz] = rot(x, z, c, s); return proj(rx, TOP, rz); };
      OREJAS.forEach(([x, z], i) => { if (!r.e[i]) return; const [px, py] = sobre(x, z); r.e[i].setAttribute('transform', `translate(${n3(px)} ${n3(py + .6)})`); });
      if (r.ri) { const [px, py] = sobre(1, 6); r.ri.setAttribute('transform', `translate(${n3(px)} ${n3(py)})`); }
      if (r.co) { const [px, py] = sobre(0, W + 6); r.co.setAttribute('transform', `translate(${n3(px)} ${n3(py - 1.4)})`); }
      } /* fin de lo que solo cambia al girar */
      /* tirón de orejas (siempre se puede mover, aunque la cabeza no gire) */
      OREJAS.forEach((_, i) => { if (r.ei[i]) sa(r.ei[i], 'transform', k >= 3 ? conoT(i ? 1 : -1, p.orejas) : `translate(0 ${n3(-Math.abs(p.orejas) * 1.2)})`); });
      sa(r.cab, 'transform', `translate(${n3(p.cabX)} ${n3(p.cabY)}) rotate(${n3(p.ladeo)} 0 ${SPLIT})`);
      r.o.forEach((o, i) => sa(o, 'transform', `scale(1 ${n3(Math.max(.08, p.ojos * (i === 0 ? p.guino : 1)))})`));
      const fl = p.aleteo * Math.sin((p.t || 0) * 34) * 22, resp = (p.vivo || 0) * Math.sin((p.t || 0) * 2 * Math.PI / 3.6) * 2.5; /* las dos alas juntas */
      const ang = p.alaI + p.alaD + p.esponja * 12 + Math.max(0, fl) + resp;
      if (r.ai[0]) { /* abre: 0 plegada contra el costado … 1 abierta hacia afuera y arriba */
        const abre = clamp((p.alaD + p.alaI) / 38 + p.esponja * .25 + p.aleteo, 0, 1), giro = -abre * (70 + (p.aleteo ? Math.sin((p.t || 0) * 30) * 28 : 0)) - resp * .6;
        /* se levantan desde el hombro, sin despegarse: hasta unos 75° al aletear, poquito al esponjarse */
        const sube = clamp(abre, 0, 1) * (p.aleteo ? 45 + Math.sin((p.t || 0) * 30) * 30 : 55) + resp * .8;
        sa(r.ai[0], 'transform', `rotate(${n3(-Math.min(75, sube))})`);
        sa(r.ai[1], 'transform', `rotate(${n3(-Math.min(75, sube))})`);
        const abanico = clamp(sube / 75, 0, 1);
        r.filas.forEach(fs => fs.forEach((f, i) => sa(f, 'transform', `translate(0 ${n3(abanico * i * 1.2)}) rotate(${n3(abanico * (i - 1) * 7)} 3 ${4.8 + i * 2.8})`)));
      } else {
        sa(r.a[0], 'transform', `rotate(${n3(ang * .8)} ${-W + 2.4} ${n3(SPLIT - 2.6)})`);
        sa(r.a[1], 'transform', `rotate(${n3(-ang)} ${n3(W + 7.4)} ${n3(SPLIT - 6)})`);
      }
      r.f.forEach((f, i) => f && f.setAttribute('transform', `translate(${i ? 21 : -13} ${i ? -16 : -14}) rotate(${n3((i ? -1 : 1) * (Math.sin((p.t || 0) * 1.6) * 3 * (p.vivo || 0) + fl * .6))})`));
      r.pi.forEach((f, i) => f && f.setAttribute('transform', `translate(0 ${n3(-Math.max(0, Math.sin((p.t || 0) * 9 + i * Math.PI)) * 1.6 * p.pasito)})`));
      sa(r.cu, 'transform', `translate(0 ${n3(p.sube)})`);
      sa(r.cs, 'transform', `rotate(${n3(p.casRot)} 3 0)`);
      const pu = 1 + p.esponja * .05;
      r.all.setAttribute('transform', `translate(0 ${n3(p.y)}) scale(${n3(p.sx * pu)} ${n3(p.sy * pu)})`);
      r.sh.setAttribute('transform', `scale(${n3(1 - Math.min(.4, -p.y / 40))} 1)`);
    };
    return { build, refs, update };
  };
  const lado = () => (Math.random() < .5 ? -1 : 1);
  const B_SPEC = {
    fondo: (t, modo, p) => {
      const vivo = modo === 'vida' ? 1 : 0, r = Math.sin(t * 2 * Math.PI / 3.6);
      p.t = t; p.vivo = vivo;
      return { sy: r * .014, sx: -r * .007, ladeo: vivo * Math.sin(t * 2 * Math.PI / 5.1 + .7) * 1.6, cabY: vivo * Math.sin(t * 2 * Math.PI / 2.9) * .4, orejas: vivo * Math.pow(Math.max(0, Math.sin(t * 1.7)), 24) * .9 }; /* tirón de orejas de vez en cuando */
    },
    acciones: [
      m => { const g = lado(); return m.hacer([[0, { teta: 42 * g }, 520], [1300, { teta: 0 }, 560]]); }, /* mira a un lado */
      m => { const g = lado(); return m.hacer([[0, { teta: 180 * g, orejas: .4 }, 900], [1900, { teta: 0, orejas: 0 }, 900]]); }, /* mira hacia atrás */
      m => m.hacer([[0, { cabX: 2.2 }, 150], [190, { cabX: -2.2 }, 210], [440, { cabX: 0, cabY: -1.8 }, 190], [680, { cabY: 1 }, 170], [890, { cabY: 0 }, 200]]), /* cabecea con curiosidad */
      m => { const g = lado(); return m.hacer([[0, { ladeo: 12 * g, orejas: .6 * g }, 380], [1200, { ladeo: 0, orejas: 0 }, 420]]); }, /* ladea la cabeza */
      m => m.hacer([[0, { guino: 0 }, 120, 'entra'], [520, { guino: 1 }, 160, 'sale']]), /* guiña un ojo */
      m => m.hacer([[0, { esponja: 1, aleteo: .25 }, 260, 'sale'], [520, { esponja: 0, aleteo: 0 }, 360, 'rebote']]), /* esponja las plumas */
      m => m.hacer([[0, { alaD: 38 }, 420, 'sale'], [1000, { alaD: 0 }, 380]]), /* estira las alas, las dos a la vez */
      m => m.hacer([[0, { pasito: 1 }, 200], [1500, { pasito: 0 }, 200]]), /* da pasitos */
    ],
    gesto: (m, d) => { const g = lado(); return m.hacer([ /* vuelta completa de la cabeza, con anticipación y llegada suave */
      [d, { sy: .93, sx: 1.04, teta: -14 * g }, 180], [d + 180, { sy: 1, sx: 1 }, 220],
      [d + 180, { teta: 360 * g, orejas: .5 }, 1500, 'suave'], [d + 1700, { teta: 0, orejas: 0 }, 1],
      [d + 1720, { ojos: 0 }, 80], [d + 1810, { ojos: 1 }, 110], [d + 1720, { esponja: 1 }, 160], [d + 1900, { esponja: 0 }, 300, 'rebote']]); },
    salto: (m, d) => m.hacer([
      [d, { sy: .84, sx: 1.1 }, 140], [d + 140, { y: -16, sy: 1.1, sx: .92, aleteo: 1 }, 260, 'sale'], [d + 400, { y: 0, sy: 1.02, sx: .98 }, 230, 'entra'],
      [d + 560, { aleteo: 0 }, 120], [d + 630, { sy: .88, sx: 1.08 }, 100], [d + 730, { sy: 1, sx: 1 }, 260, 'rebote']]),
  };
  /* la cría: dentro de su cascarón se asoma, se esconde y gira la cabeza para mirar */
  const B1_SPEC = {
    fondo: B_SPEC.fondo,
    acciones: [
      B_SPEC.acciones[0], B_SPEC.acciones[1], B_SPEC.acciones[2], B_SPEC.acciones[4],
      m => m.hacer([[0, { sube: -3.5 }, 380, 'sale'], [900, { sube: 0 }, 400]]), /* se asoma más */
      m => m.hacer([[0, { sube: 6, casRot: -3 }, 300], [300, { casRot: 2 }, 200], [500, { casRot: 0 }, 200], [1000, { sube: 0 }, 380, 'rebote']]), /* se esconde a medias */
    ],
    gesto: (m, d) => m.hacer([
      [d, { sube: 22 }, 280, 'entra'], [d + 120, { casRot: -6 }, 140], [d + 260, { casRot: 5 }, 140], [d + 400, { casRot: -3 }, 130], [d + 530, { casRot: 0 }, 150], /* se mete entera y el cascarón tiembla */
      [d + 1000, { sube: 9 }, 260, 'sale'], [d + 1300, { teta: 40 }, 300], [d + 1700, { teta: -40 }, 380], [d + 2100, { teta: 0, sube: -3 }, 300, 'rebote'], [d + 2400, { sube: 0 }, 260]]), /* asoma, mira a los lados y sale */
    salto: (m, d) => m.hacer([[d, { sube: 3 }, 120], [d + 120, { sube: -12 }, 260, 'sale'], [d + 380, { sube: 0 }, 260, 'entra'], [d + 640, { casRot: 3 }, 100], [d + 740, { casRot: 0 }, 200, 'rebote']]),
  };

  /* ---------- 3 · Cienpiecito con poses: una sola columna de anillos que se dobla ----------
     Como un ciempiés o una cuncuna vistos de lado: un par de patas por anillo, pegadas a su anillo y siguiéndolo.
     El cuerpo es UNA columna: cada anillo gira un poco respecto del anterior (como vagones de un tren), así el mismo
     cuerpo puede estar estirado, levantado (adulta), hecho puente (joven), patas arriba (cría) o enrollado en bolita
     (adulta y brillante: la cabeza se mete primero y los anillos la siguen, patas hacia adentro). Al caminar, las patas
     se levantan en una ola que va de la cola a la cabeza y una jorobita recorre el cuerpo.
     Idea propia (capítulo 3): los anillos son cifras con los colores de las lecciones; al contar, cada grupo se separa
     y muestra UNA letra (M C D U, que se lee de la cola a la cabeza) y después su número (por ejemplo 1 2 5 0). */
  let nN = 0;
  const N_ST = {
    1: { r: 8, s: ['pu', 'pu'], hs: 19.4, alza: 0, max: 9, ej: [5] },
    2: { r: 7.6, s: ['pd', 'pu', 'pd', 'pu'], hs: 19.4, alza: 0, max: 99, ej: [7, 25] },
    3: { r: 7.2, s: ['pc', 'pd', 'pu', 'pc', 'pd', 'pu'], hs: 20, alza: 1, max: 999, ej: [48, 125] },
    4: { r: 7, s: ['oro', 'pc', 'pd', 'pu', 'pc', 'pd', 'pu'], hs: 19.4, alza: 1, max: 1000, ej: [250, 750] },
  };
  const LETRA = { pu: 'U', pd: 'D', pc: 'C', oro: 'M', plomo: '' };
  const PUESTO = ['pu', 'pd', 'pc', 'oro'];
  /* un número en anillos: cada cifra con el color de su posición (U, D, C, M) */
  const cifras = n => [...String(n)].map((d, i, a) => { const c = PUESTO[a.length - 1 - i]; return { c, l: LETRA[c], d }; });
  const relleno = (fila, N) => Array(Math.max(0, N - fila.length)).fill({ c: 'plomo', l: '', d: '' }).concat(fila);
  /* disposición de los anillos: 0 reposo, 1 la suma a + b (el plomo lleva el «+»), 2… el resultado «= c», que sale de la
     cabeza y recorre el cuerpo anillo por anillo hasta que el «=» llega a la cola; los anillos que no son del resultado quedan grises */
  const GRIS = { c: 'plomo', l: '', d: '' };
  const disposicion = (Q, a, b) => { const N = Q.s.length, rest = Q.s.map(c => ({ c, l: LETRA[c], d: '' }));
    if (b == null) { const f = relleno(cifras(a), N); return [rest, f]; }
    const bloque = [{ c: 'plomo', l: '=', d: '=' }, ...cifras(a + b)], out = [rest, relleno([...cifras(a), { c: 'plomo', l: '+', d: '+' }, ...cifras(b)], N)];
    /* el «=» sale de la cabeza y avanza con las cifras detrás hasta llegar a la cola */
    for (let s0 = N - 1; s0 >= 0; s0--) out.push(Array(s0).fill(GRIS).concat(bloque).concat(Array(N).fill(GRIS)).slice(0, N));
    return out; };
  /* una suma al azar que quepa en los anillos y no pase el máximo de la etapa */
  const sumaAzar = Q => { const N = Q.s.length, len = n => String(n).length, rnd = n => 1 + Math.floor(Math.random() * n);
    if (N < 3) return [rnd(9)];
    for (let t = 0; t < 200; t++) {
      let a, b; if (Q.max === 1000 && Math.random() < .2) { a = rnd(999); b = 1000 - a; } else { const tope = Math.min(Q.max - 1, Math.pow(10, Math.ceil(Math.random() * 3)) - 1); a = rnd(tope); b = rnd(Q.max - a); }
      if (len(a) + 1 + len(b) <= N && a + b <= Q.max && len(a) + len(b) >= N - 2) return [a, b];
    }
    return Q.ej; };
  const N_BASE = { alza: 0, curl: 0, rot: 0, ola: 0, andar: 0, patalea: 0, estira: 0, gap: 0, cuenta: -9, letras: 0, num: 0, ant: 0, cabRot: 0, mira: 0, ojos: 1, boca: 0,
    saluda: 0, saludaI: 0, cola: 0, vuelta: 0, puente: 0, paso: 0, cnt: 0, sx: 1, sy: 1, y: 0, x: 0 };
  const suaveS = u => u * u * (3 - 2 * u);
  const cienpiecitoPose = k => {
    const id = 'kn' + (++nN), Q = N_ST[k], N = Q.s.length, r = Q.r, hs = Q.hs, SC = M.C.SCALE[k], gold = k === 4;
    const tile = gold ? 'oro' : 'amarillo', fs = hs / 19.5;
    /* grupos de cifras: cada color es una cifra; la letra va en el primer anillo del grupo, en su parte que no tapa el siguiente */
    const grupo = Q.s.map((_, i) => i); /* cada anillo es su propia cifra */
    const ojoS = i => `<g id="${id}-o${i}"><ellipse rx="2.3" ry="2.7" fill="url(#km-ojo)"/><circle cx=".8" cy="-1.1" r="1" fill="#fff"/><circle cx="-.7" cy="1.2" r=".45" fill="#fff"/></g>`;
    const txt = (col, t) => `<text y="${n3(r * .34)}" text-anchor="middle" font-family="Arial Rounded MT Bold,Nunito,Arial,sans-serif" font-weight="900" font-size="${n3(r * 1.0)}" fill="#fff" stroke="${PAL[col][3]}" stroke-width=".9" paint-order="stroke" opacity="0">${t}</text>`;
    const brazo = (nm, col) => `<g id="${id}-${nm}" opacity="0"><path stroke="${PAL[col][3]}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path stroke="${PAL[col][1]}" stroke-width="1.2" fill="none" stroke-linecap="round"/>${gel(E(0, 0, 1.9, 1.4), col, .6)}</g>`;
    const build = () => {
      let g = `<g id="${id}-sh">${piso(30)}</g>`;
      if (gold) g = aura(-22, 46) + chispas([[-30, -30, 3], [30, -42, 2.6], [32, -12, 2.2]]) + g;
      let c = '';
      /* patas de atrás (más oscuras, detrás de todo) */
      c += Q.s.map((col, i) => `<g id="${id}-pf${i}" opacity=".8"><path stroke="${PAL[col][3]}" stroke-width="2.3" fill="none" stroke-linecap="round"/><circle r="1.3" fill="${PAL[col][3]}"/></g>`).join('');
      /* anillos, cada uno con su pata de adelante */
      c += Q.s.map((col, i) => `<g id="${id}-a${i}"><circle r="${n3(r * 1.25)}" fill="url(#km-glow)" opacity="0"/>${gel(C(0, 0, r), col, 1.1)}`
        + arc(`M${n3(-r * .62)} ${n3(-r * .1)}Q${n3(-r * .5)} ${n3(-r * .66)} ${n3(-r * .02)} ${n3(-r * .72)}`, 1.4, .8)
        + txt(col, '') + txt(col, '') + '</g>'
        + `<g id="${id}-pn${i}"><path stroke="${PAL[col][3]}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path stroke="${PAL[col][1]}" stroke-width="1.2" fill="none" stroke-linecap="round"/>${gel(E(0, 0, 1.7, 1.25), col, .6)}</g>`).join('');
      /* bracitos que saludan: van encima de los anillos (si no, el anillo de arriba los tapa) */
      const cz = Q.s[Math.max(0, N - 2)];
      c += brazo('pz', cz) + brazo('pzi', cz);
      c = `<g id="${id}-bd">${c}</g>`;
      /* cabeza de baldosa con antenas que se mueven */
      let h = [0, 1].map(i => `<g id="${id}-an${i}"><path fill="none" stroke="${PAL.naranja[3]}" stroke-width="1.2" stroke-linecap="round"/>${gel(C(0, 0, 2.1), gold ? 'oro' : 'rosa', .7)}</g>`).join('');
      h += gel(R(n3(-hs / 2), n3(-hs * .46), hs, n3(hs * .92), n3(hs * .36)), tile, 1.3) + arc(`M${n3(-hs * .36)} ${n3(-hs * .02)}Q${n3(-hs * .34)} ${n3(-hs * .3)} ${n3(-hs * .06)} ${n3(-hs * .34)}`, 1.6, .8);
      h += `<g transform="translate(.4 ${n3(hs * .06)}) scale(${n3(fs)})">${[-3.4, 3.4].map((e, i) => `<g transform="translate(${e} -.8)">${ojoS(i)}</g>`).join('')}`
        + `<path id="${id}-bc" d="M-1.2 2.1Q0 3.4 1.2 2.1" fill="none" stroke="#5a2a44" stroke-width=".9" stroke-linecap="round"/>`
        + `<g id="${id}-bo" opacity="0"><ellipse cy="3.3" rx="1.8" ry="2.3" fill="#7a2a44"/><ellipse cy="4.2" rx="1" ry=".8" fill="#ff8fab"/></g>`
        + `<ellipse cx="-5.8" cy="2.1" rx="2.2" ry="1.4" fill="url(#km-mej)"/><ellipse cx="5.8" cy="2.1" rx="2.2" ry="1.4" fill="url(#km-mej)"/></g>`;
      if (gold) h += corona(0, n3(-hs * .6), .9, -6);
      c += `<g id="${id}-cab">${h}</g>`;
      return `<g transform="scale(${SC})">${g}<g id="${id}-all">${c}</g></g>`;
    };
    /* cambia el color de un anillo y de sus patas (al contar, los anillos toman el color de su cifra) */
    const pinta = (R, i, col) => { const A = R.a[i], K = PAL[col]; A.c = col;
      A.bola.setAttribute('fill', `url(#km-${col})`); A.bola.setAttribute('stroke', K[3]); A.le.setAttribute('stroke', K[3]); A.dg.setAttribute('stroke', K[3]);
      const n = R.pn[i]; n.p1.setAttribute('stroke', K[3]); n.p2.setAttribute('stroke', K[1]); n.f.setAttribute('fill', `url(#km-${col})`); n.f.setAttribute('stroke', K[3]);
      const f = R.pf[i]; f.p.setAttribute('stroke', K[3]); f.f.setAttribute('fill', K[3]); };
    const refs = el => { const q = s => el.querySelector('#' + id + '-' + s), br = nm => { const b = q(nm); return { g: b, p1: b.children[0], p2: b.children[1], f: b.children[2] }; };
      return { lay: disposicion(Q, ...Q.ej), nueva() { this.lay = disposicion(Q, ...sumaAzar(Q)); }, pinta, pz: br('pz'), pzi: br('pzi'), sh: q('sh'), all: q('all'), bd: q('bd'), cab: q('cab'), bc: q('bc'), bo: q('bo'), o: [0, 1].map(i => q('o' + i)), an: [0, 1].map(i => q('an' + i)),
        a: Q.s.map((_, i) => { const g = q('a' + i), t = g.querySelectorAll('text'); return { g, glow: g.firstChild, bola: g.children[1], le: t[0], dg: t[1], c: Q.s[i] }; }),
        pf: Q.s.map((_, i) => { const g = q('pf' + i); return { g, p: g.firstChild, f: g.lastChild }; }),
        pn: Q.s.map((_, i) => { const g = q('pn' + i); return { g, p1: g.children[0], p2: g.children[1], f: g.children[2] }; }) }; };
    /* columna: desde la cola hacia la cabeza, cada articulación gira un poco (como vagones) */
    const UP = [.4, .36, .2, .04]; /* cómo se reparte la subida de la adulta en las últimas articulaciones */
    const columna = p => {
      const alza = clamp(p.alza, 0, 1.2), pu = clamp(p.puente, 0, 1.2), d = r * (1.12 + p.estira * .32 * (1 - clamp(alza, 0, 1) * .55));
      let th = 0, x = 0, y = 0; const pts = [[0, 0, 0]];
      for (let i = 1; i <= N; i++) {
        let a = 0; const desdeCab = N - i;
        if (desdeCab < 4 && N >= 4) a -= alza * 1.5 * UP[3 - desdeCab];
        if (i === N) a += -.32 * (N < 4 || alza < .5 ? 1 : 0) + p.cabRot * .004;
        /* puente de cuncuna medidora (joven): sube, arriba plano, baja */
        if (N === 4) a += pu * [0, -1.05, 1.05, 1.05, -1.05][i];
        a += p.ola * .1 * Math.sin((p.fase || 0) - i * 1.1);
        th += a;
        const dd = i === N ? r * .45 + hs * .42 + p.gap * r * .75 * Math.pow(Math.cos(th), 2) : d * (1 - pu * .08) + (grupo[i] !== grupo[i - 1] ? p.gap * r * .62 * Math.pow(Math.abs(Math.cos(th)), 2) : 0) + pu * r * .45;
        x += Math.cos(th) * dd; y += Math.sin(th) * dd; pts.push([x, y, th]);
      }
      return pts;
    };
    const update = (R, p) => {
      const pts = columna(p), cab = pts[N], cu = clamp(p.curl, 0, 1);
      /* bolita: la cabeza se mete primero hacia el centro y los anillos la siguen uno a uno (patas hacia adentro) */
      let cuH = 0;
      if (cu > 0) {
        const Rb = Math.max(r * 1.05, N * r * 1.1 / (2 * Math.PI)), ccx = pts[0][0] + (cab[0] - pts[0][0]) * .5, ccy = -Rb - r, span = 2 * Math.PI * .84;
        for (let i = 0; i < N; i++) {
          const ci = suaveS(clamp((cu - (N - 1 - i) / N * .45) / .55, 0, 1));
          const a = Math.PI * .62 + i * span / (N - 1) + (p.rot || 0) * Math.PI / 180, wx = ccx + Math.cos(a) * Rb, wy = ccy + Math.sin(a) * Rb;
          let th0 = pts[i][2], th1 = a + Math.PI / 2; while (th1 - th0 > Math.PI) th1 -= 2 * Math.PI; while (th0 - th1 > Math.PI) th1 += 2 * Math.PI;
          pts[i] = [lerp(pts[i][0], wx, ci), lerp(pts[i][1], wy, ci), lerp(th0, th1, ci)];
        }
        cuH = suaveS(clamp(cu / .55, 0, 1));
        cab[0] = lerp(cab[0], ccx + 1, cuH); cab[1] = lerp(cab[1], ccy + 1.5, cuH);
      }
      /* apoyar en el piso: lo más bajo toca el suelo; centrar a lo ancho */
      let lo = -1e9, hi = 1e9, mnx = 1e9, mxx = -1e9;
      for (let i = 0; i < N; i++) { lo = Math.max(lo, pts[i][1] + r); hi = Math.min(hi, pts[i][1] - r); mnx = Math.min(mnx, pts[i][0] - r); mxx = Math.max(mxx, pts[i][0] + r); }
      lo = Math.max(lo, cab[1] + hs * .46); hi = Math.min(hi, cab[1] - hs * .46); mnx = Math.min(mnx, cab[0] - hs / 2); mxx = Math.max(mxx, cab[0] + hs / 2);
      const ox = -(mnx + mxx) / 2 + p.x, oy = -lo - .6, ph = p.fase || 0, t = p.t || 0;
      for (let i = 0; i < N; i++) {
        const [X, Y, th] = pts[i], T = cu > 0 ? th : i < N - 1 ? (pts[i + 1][2] + th) / 2 : pts[i + 1][2];
        /* jorobita que recorre el cuerpo de la cola a la cabeza; la cola llega después al saltar */
        const hump = p.ola * Math.max(0, Math.sin(ph - i * 1.1)) * 1.8 * (1 - cu), lag = p.cola * (1 - i / N);
        const ax = X + ox, ay = Y + oy - hump + lag, gg = grupo[i];
        const glow = Math.max(0, 1 - Math.abs(p.cuenta - i)), L = R.lay[clamp(Math.round(p.paso), 0, R.lay.length - 1)][i];
        if (R.a[i].c !== L.c) pinta(R, i, L.c);
        sa(R.a[i].g, 'transform', `translate(${n3(ax)} ${n3(ay)}) scale(${n3(1 + glow * .16)})`);
        sa(R.a[i].glow, 'opacity', n3(glow * .9));
        { const vis = clamp(Math.max(p.letras, glow * 1.4), 0, 1) * (1 - cu);
          const dv = k === 1 && p.cnt > .5 && L.d ? String(Math.round(p.cnt)) : L.d;
          if (R.a[i].le._t !== L.l) { R.a[i].le._t = L.l; R.a[i].le.textContent = L.l; }
          if (R.a[i].dg._t !== dv) { R.a[i].dg._t = dv; R.a[i].dg.textContent = dv; }
          sa(R.a[i].le, 'opacity', n3(vis * (1 - p.num))); sa(R.a[i].dg, 'opacity', n3(vis * p.num));
        }
        /* patas: nacen del anillo hacia el lado de la panza; se levantan en ola (o patalean) */
        const tx = Math.cos(T), ty = Math.sin(T), nx = -ty, ny = tx, Lb = r * .62 + 1.2;
        [['pn', .28, 0], ['pf', -.28, Math.PI * .5]].forEach(([w, off, dph]) => {
          const P2 = R[w][i], f = ph - i * .9 + dph, f2 = t * 17 - i * 1.3 + dph, L = Lb * (1 + p.patalea * .6);
          const lift = p.andar * Math.max(0, Math.sin(f)) * 2 + p.patalea * (Math.sin(f2) * .5 + .5) * 3, sw = p.andar * Math.cos(f) * 1.5 + p.patalea * Math.cos(f2) * 1.6;
          const bx = ax + tx * r * off + nx * r * .5, by = ay + ty * r * off + ny * r * .5;
          const ex = bx + nx * (L - lift) + tx * (sw + 1.2), ey = by + ny * (L - lift) + ty * (sw + 1.2);
          const dd = `M${n3(bx)} ${n3(by)}Q${n3((bx + ex) / 2 + tx * 1.2)} ${n3((by + ey) / 2 + ty * 1.2)} ${n3(ex)} ${n3(ey)}`;
          if (w === 'pn') { sa(P2.p1, 'd', dd); sa(P2.p2, 'd', dd); sa(P2.f, 'transform', `translate(${n3(ex + tx * .4)} ${n3(ey)}) rotate(${n3(T * 180 / Math.PI)})`); }
          else { sa(P2.p, 'd', dd); sa(P2.f, 'cx', n3(ex)); sa(P2.f, 'cy', n3(ey)); }
          /* saludo: el par del anillo de abajo de la cabeza sale por los costados y se mueve de lado a lado */
          if (i === N - 2) {
            const der = w === 'pn', sal = k >= 3 ? clamp(der ? p.saluda : p.saludaI, 0, 1) * (1 - cu) : 0, B = der ? R.pz : R.pzi, g = der ? 1 : -1;
            sa(P2.g, 'opacity', n3(der ? 1 - sal : .8 * (1 - sal))); sa(B.g, 'opacity', sal > .01 ? '1' : '0');
            if (sal > .01) {
              const wv = Math.sin(t * 12 + (der ? 0 : 1.6)) * .34 * sal, aa = der ? -.55 + wv : Math.PI + .55 + wv;
              const b2x = ax + g * Math.abs(nx) * r * .8, b2y = ay + ny * r * .3 + 1;
              const sx2 = b2x + Math.cos(aa) * (L + 5), sy2 = b2y + Math.sin(aa) * (L + 5);
              const qx = lerp(bx, b2x - g * 1.5, sal), qy = lerp(by, b2y, sal), zx = lerp(ex, sx2, sal), zy = lerp(ey, sy2, sal);
              const d2 = `M${n3(qx)} ${n3(qy)}Q${n3(lerp((bx + ex) / 2, b2x + g * 5, sal))} ${n3(lerp((by + ey) / 2, b2y + 1.5, sal))} ${n3(zx)} ${n3(zy)}`;
              sa(B.p1, 'd', d2); sa(B.p2, 'd', d2); sa(B.f, 'transform', `translate(${n3(zx)} ${n3(zy)}) rotate(${-60 * g})`);
            }
          }
        });
      }
      /* cabeza: casi siempre derecha; en la bolita se ladea y se achica un poco al centro */
      /* patas arriba (cría): el cuerpo se da vuelta como tortilla sobre su línea de anillos y la cabeza se apoya en el suelo */
      const vu = clamp(p.vuelta, 0, 1), hsc = 1 - cuH * .26, HX = cab[0] + ox + vu * 2, HY0 = cab[1] + oy, HY = lerp(HY0, -hs * .44 - .6, vu);
      const hr = p.cabRot + Math.sin(cuH * Math.PI) * 18 - vu * 168; /* la cabeza se da vuelta con el cuerpo: queda boca arriba */
      sa(R.cab, 'transform', `translate(${n3(HX)} ${n3(HY)}) rotate(${n3(hr)}) scale(${n3(hsc)})`);
      /* antenas: tantean (cada una a su ritmo) */
      R.an.forEach((g, i) => { const s = i ? 1 : -1, w = p.ant * Math.sin(t * 9 + i * 2.1) * .5 + Math.sin(t * 2.2 + i) * .12 * (p.vivo || 0) + p.patalea * Math.sin(t * 13 + i) * .3;
        const bx = s * hs * .2, by = -hs * .46, a = -Math.PI / 2 + s * ((gold ? .85 : .55) + w + vu * .75), Lr = hs * (gold ? .46 : .5);
        const ex = bx + Math.cos(a) * Lr, ey = by + Math.sin(a) * Lr;
        sa(g.firstChild, 'd', `M${n3(bx)} ${n3(by)}Q${n3(bx + s * hs * .06)} ${n3(by - Lr * .6)} ${n3(ex)} ${n3(ey)}`); sa(g.lastChild, 'cx', n3(ex)); sa(g.lastChild, 'cy', n3(ey)); });
      const ojo = Math.max(.08, p.ojos);
      R.o.forEach(o => sa(o, 'transform', `translate(${n3(p.mira * 1.1)} 0) scale(1 ${n3(ojo)})`));
      sa(R.bo, 'opacity', n3(clamp((p.boca - .1) * 1.6, 0, 1))); sa(R.bo, 'transform', `scale(1 ${n3(.4 + .6 * clamp(p.boca, 0, 1))})`);
      sa(R.bc, 'opacity', n3(1 - clamp(p.boca * 2, 0, 1)));
      const cyR = -r - .6, sY = Math.cos(vu * Math.PI);
      sa(R.bd, 'transform', vu ? `translate(0 ${n3(cyR)}) scale(1 ${n3(Math.abs(sY) < .06 ? .06 * Math.sign(sY || 1) : sY)}) translate(0 ${n3(-cyR)})` : '');
      sa(R.all, 'transform', `translate(0 ${n3(p.y)}) scale(${n3(p.sx)} ${n3(p.sy)})`);
      sa(R.sh, 'transform', `scale(${n3((mxx - mnx) / 60 * (1 - Math.min(.4, -p.y / 40)))} 1)`);
    };
    return { build, refs, update };
  };
  /* acciones del rato y gestos al tocar */
  const azar = n => Math.floor(Math.random() * n);
  const nAcc = {
    camina: m => m.hacer([[0, { andar: 1, ola: 1 }, 350], [2600, { andar: 0, ola: 0 }, 350]]),
    tantea: m => m.hacer([[0, { ant: 1, cabRot: 6 }, 250], [700, { cabRot: -4 }, 300], [1600, { ant: 0, cabRot: 0 }, 300]]),
    mira: m => { const g = lado(); return m.hacer([[0, { cabRot: 9 * g, mira: g }, 450], [1100, { cabRot: -8 * g, mira: -g }, 550], [2000, { cabRot: 0, mira: 0 }, 400]]); },
    /* cuenta: se separan los grupos, una luz los recorre de la cola a la cabeza (M C D U) y aparece su número */
    /* cuenta y suma: los anillos toman el color de sus cifras (a + b), muestran sus letras y su número, y se reacomodan en el resultado.
       La cría (2 anillos) cuenta de uno en uno hasta su número. */
    cuenta: m => { const R = m.refs; R.nueva(); const N = R.a.length, cria = N < 3, n = +R.lay[1][N - 1].d;
      /* tiempos acordados con la dueña (26-11, término medio): leer crece con las cifras; el movimiento va al mismo paso por anillo en todas las etapas */
      const cifrasSuma = R.lay[1].filter(x => /\d/.test(x.d)).length, cifrasRes = cria ? 1 : R.lay[R.lay.length - 1].filter(x => /\d/.test(x.d)).length;
      const seq = [[0, { gap: 1 }, 400, 'sale'], [200, { paso: 1 }, 1], [400, { cuenta: 0 }, 1]];
      for (let i = 1; i < N; i++) seq.push([400 + i * 300, { cuenta: i }, 220]); /* lucecita: 0,3 s por anillo */
      let f = 400 + N * 300; seq.push([f, { cuenta: -9, letras: 1 }, 200]); f += 600 + 100 * N; /* letras: 0,6 s + 0,1 s por anillo */
      if (cria) { seq.push([f, { num: 1, cnt: 1 }, 200], [f + 380, { cnt: n }, Math.max(1, n - 1) * 380, 'lineal']); f += 380 + Math.max(0, n - 1) * 380 + 250; } /* cuenta: 0,38 s por número */
      else { seq.push([f, { num: 1 }, 300]); f += 1000 + 200 * cifrasSuma; /* números de la suma: 1 s + 0,2 s por cifra */
        const ult = R.lay.length - 1, pasos = ult - 2;
        seq.push([f, { gap: .3, sy: .9, sx: 1.05 }, 300], [f + 300, { paso: 2 }, 1], [f + 310, { gap: 1, sy: 1, sx: 1 }, 300, 'rebote']); f += 600; /* se juntan */
        if (pasos > 0) seq.push([f, { paso: ult }, pasos * 350, 'lineal']); f += pasos * 350; } /* el resultado avanza: 0,35 s por anillo */
      seq.push([f, { boca: .8 }, 300]); f += 1200 + 150 * cifrasRes; /* resultado quieto: 1,2 s + 0,15 s por cifra */
      seq.push([f, { letras: 0, num: 0, boca: 0 }, 300], [f + 350, { paso: 0, cnt: 0 }, 1], [f + 360, { gap: 0 }, 420, 'rebote']);
      return m.hacer(seq); },
    acordeon: m => m.hacer([[0, { estira: 1 }, 380, 'sale'], [450, { estira: -.45, sy: 1.04 }, 260], [720, { estira: .6, sy: 1 }, 240], [980, { estira: 0 }, 380, 'rebote']]),
    bosteza: m => m.hacer([[0, { ojos: 0, boca: 1, cabRot: -7, estira: .3 }, 700], [1300, { ojos: 1, boca: 0, cabRot: 0, estira: 0 }, 500]]),
    baila: m => m.hacer([[0, { ola: 2.2, andar: .6 }, 300], [300, { cabRot: 8 }, 300], [600, { cabRot: -8 }, 300], [900, { cabRot: 8 }, 300], [1200, { cabRot: -8 }, 300], [1500, { cabRot: 0, ola: 0, andar: 0 }, 350]]),
    saluda: m => { const q = azar(3), o = q === 0 ? { saluda: 1 } : q === 1 ? { saludaI: 1 } : { saluda: 1, saludaI: 1 };
      return m.hacer([[0, { ...o, boca: .6 }, 300, 'sale'], [1500, { saluda: 0, saludaI: 0, boca: 0 }, 300]]); },
  };
  /* la cuenta se intercala con las demás acciones: una de cada tres (la primera es la cuenta) */
  const intercala = lista => lista.map(fn => m => { m.nCuenta = (m.nCuenta || 0) + 1; return m.nCuenta % 3 === 1 ? nAcc.cuenta(m) : fn(m); });
  const nSalto = (m, d) => m.hacer([
    [d, { sy: .86, sx: 1.08 }, 140], [d + 140, { y: -14, sy: 1.08, sx: .94, cola: 5 }, 240, 'sale'], [d + 380, { y: 0, sy: 1, sx: 1 }, 210, 'entra'],
    [d + 470, { cola: -2 }, 160], [d + 590, { sy: .9, sx: 1.06 }, 100], [d + 630, { cola: 0 }, 260, 'rebote'], [d + 690, { sy: 1, sx: 1 }, 260, 'rebote']]);
  const nFondo = (t, modo, p) => {
    const vivo = modo === 'vida' ? 1 : 0, r = Math.sin(t * 2 * Math.PI / 3.2);
    p.t = t; p.vivo = vivo; p.fase = t * 7;
    return { sy: r * .016, sx: -r * .008, cabRot: vivo * Math.sin(t * 2 * Math.PI / 4.1 + .4) * 3 };
  };
  const N_SPEC = {
    /* cría: no le alcanza el cuerpo para hacerse bolita, así que se da vuelta patas arriba, patalea y se ríe */
    1: { fondo: nFondo, salto: nSalto, acciones: intercala([nAcc.camina, nAcc.tantea, nAcc.mira, nAcc.acordeon, nAcc.bosteza, nAcc.baila]),
      gesto: (m, d) => m.hacer([[d, { sy: .85, sx: 1.08 }, 140], [d + 140, { y: -12, vuelta: 1, sy: 1, sx: 1 }, 380, 'sale'], [d + 520, { y: 0 }, 160, 'entra'],
        [d + 560, { patalea: 1, boca: 1 }, 200], [d + 1700, { patalea: 0, boca: 0 }, 200], [d + 1800, { y: -10 }, 200, 'sale'], [d + 1850, { vuelta: 0 }, 380, 'suave'],
        [d + 2000, { y: 0 }, 230, 'entra'], [d + 2230, { sy: .9, sx: 1.06 }, 100], [d + 2330, { sy: 1, sx: 1 }, 260, 'rebote']]) },
    /* joven: hace puente como cuncuna medidora y avanza un pasito */
    2: { fondo: nFondo, salto: nSalto, acciones: intercala([nAcc.camina, nAcc.tantea, nAcc.mira, nAcc.acordeon, nAcc.bosteza, nAcc.baila]),
      gesto: (m, d) => m.hacer([[d, { puente: 1, x: -2 }, 450, 'sale'], [d + 650, { puente: 0, x: 3 }, 380, 'rebote'], [d + 1100, { puente: 1, x: 1 }, 400, 'sale'],
        [d + 1700, { puente: 0, x: 0 }, 420, 'rebote'], [d + 2000, { ant: 1, boca: .6 }, 200], [d + 2600, { ant: 0, boca: 0 }, 250]]) },
    /* adulta y brillante: se hace bolita (la cabeza primero), rueda de ida y vuelta y se desenrolla (la cola primero) */
    3: { fondo: nFondo, salto: nSalto, acciones: intercala([nAcc.camina, nAcc.tantea, nAcc.mira, nAcc.acordeon, nAcc.bosteza, nAcc.baila, nAcc.saluda]),
      gesto: (m, d) => m.hacer([[d, { sy: .92, sx: 1.04, cabRot: 12 }, 180], [d + 160, { curl: 1, alza: 0, sy: 1, sx: 1, cabRot: 0 }, 750, 'suave'],
        [d + 950, { rot: 200, x: 7 }, 650, 'suave'], [d + 1650, { rot: 0, x: 0 }, 650, 'suave'],
        [d + 2350, { curl: 0, alza: m.base.alza }, 650, 'rebote'], [d + 2900, { ant: 1 }, 150], [d + 3400, { ant: 0 }, 250]]) },
  };
  N_SPEC[4] = N_SPEC[3];

  /* ---------- 4 · Pulpatrón con poses: de frente y flotando ----------
     Referencias de la dueña (poli-referencias/referencias/pulpos): UN solo cuerpo; el contorno de la cabeza baja y sigue por
     los brazos sin corte (entre brazo y brazo, solo una curvita); cara baja con frente grande; los brazos de los costados
     son las manos y se enrollan hacia arriba a la altura de la cara; los de abajo son cortos, gordos y con la punta enrollada.
     Flota como el pulpo dumbo (sube y baja suave; la sombra en el suelo crece y se achica). Cada brazo se dobla de la base a
     la punta. Idea propia (capítulo 4): «¿Qué sigue?», las luces de las ventosas forman un patrón de brazo en brazo y la mano
     derecha sostiene el «?» hasta que se enciende. Al tocar: la cría suelta una nube de tinta de confeti y se esconde;
     las demás alternan chorro con tinta y hélice. */
  let nP = 0;
  const P_ST = {
    1: { n: 4, L: 11, fl: 4, luces: 2 },
    2: { n: 6, L: 12, fl: 5.5, luces: 3 },
    3: { n: 8, L: 12, fl: 7, luces: 3 },
    4: { n: 8, L: 12.5, fl: 8, luces: 4 },
  };
  const P_COL = ['#ff4d64', '#ffa23d', '#ffd23c', '#7fd650', '#5fb0ff', '#a98cff', '#ff8cbf'];
  const FIG = {
    o: s => `M${n3(-s)} 0A${n3(s)} ${n3(s)} 0 1 0 ${n3(s)} 0A${n3(s)} ${n3(s)} 0 1 0 ${n3(-s)} 0Z`,
    t: s => `M0 ${n3(-s * 1.2)}L${n3(s * 1.1)} ${n3(s * .8)}L${n3(-s * 1.1)} ${n3(s * .8)}Z`,
    c: s => `M${n3(-s * .9)} ${n3(-s * .9)}H${n3(s * .9)}V${n3(s * .9)}H${n3(-s * .9)}Z`,
    e: s => starD(s * 1.3),
  };
  /* el patrón de cada etapa: cría colores AB, joven colores ABC, grande figuras, brillante patrones que crecen (o cualquiera) */
  const patronPulpo = (k, azar) => {
    const Q = P_ST[k], n = Q.n, mezcla = a => a.slice().sort(() => Math.random() - .5), col = azar ? mezcla(P_COL) : ['#ffd23c', '#5fb0ff', '#7fd650', '#ff4d64'];
    const tipo = k === 1 ? 'AB' : k === 2 ? (azar && Math.random() < .35 ? 'AB' : 'ABC') : k === 3 ? 'fig' : (azar ? ['crece', 'crece', 'ABC', 'fig'][Math.floor(Math.random() * 4)] : 'crece');
    const it = [];
    if (tipo === 'crece') { const c = col[0]; for (let i = 0; i < n; i++) it.push(i < Q.luces ? { c, f: 'o', q: i + 1 } : { c: null }); }
    else if (tipo === 'fig') { const fs = azar ? mezcla(['o', 't', 'c', 'e']).slice(0, Math.random() < .5 ? 2 : 3) : ['o', 't']; for (let i = 0; i < n; i++) it.push({ c: col[i % fs.length], f: fs[i % fs.length], q: Q.luces }); }
    else { const m = tipo === 'AB' ? 2 : 3; for (let i = 0; i < n; i++) it.push({ c: col[i % m], f: 'o', q: Q.luces }); }
    const ult = tipo === 'crece' ? Q.luces - 1 : n - 1; /* el brazo del «?» */
    return { tipo, it, ult };
  };
  const P_BASE = { ojos: 1, mira: 0, boca: 0, y: 0, sx: 1, sy: 1, aprieta: 0, junta: 0, abre: 0, helice: 0, rot: 0, tinta: 0, nube: 0, esconde: 0,
    manoD: 0, manoI: 0, poseD: 0, poseI: 0, onda: 1, olaColor: -9, quiz: 0, pregunta: 0, revela: 0, enciende: 99, posa: 0, paso: 0 };
  const cub3 = (a, b, c, d, t) => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
  /* poses de la mano derecha (la izquierda es su espejo), en coordenadas del cuerpo (abajo al centro = 0 0) */
  const MANO = [
    { t: [27, -27], c1: [25, -1], c2: [33, -16], w: 1 }, /* 0 saluda (se mueve de lado a lado) */
    { t: [13, -30], c1: [25, -2], c2: [29, -26] }, /* 1 se rasca la cabeza pensando */
    { t: [33, 5], c1: [23, -3], c2: [30, 2] }, /* 2 señala hacia el lado */
    { t: [6.5, 5], c1: [24, 3], c2: [16, 10], w: 2 }, /* 3 aplaude adelante, bajo la boca */
    { t: [6, -10], c1: [24, -1], c2: [16, -4] }, /* 4 se tapa los ojos */
    { t: [26, -26], c1: [25, -1], c2: [32, -16] }, /* 5 sostiene el «?» en alto */
  ];
  const ANCHO = 3.4; /* medio ancho de un brazo en su raíz */
  const pulpatronPose = k => {
    const id = 'kp' + (++nP), Q = P_ST[k], N = Q.n, SC = M.C.SCALE[k] * (k >= 3 ? .88 : 1), gold = k === 4, B = PAL.rosa;
    const nb = N - 2, hsp = Math.min(13, 4 + nb * 1.6); /* brazos de abajo y su abertura */
    const xb = j => nb === 1 ? 0 : -hsp + j * (2 * hsp / (nb - 1));
    const RX = 15;
    const luces = i => [...Array(Q.luces)].map((_, j) => `<path id="${id}-l${i}-${j}" stroke="#fff" stroke-width=".55"/>`).join('');
    /* cuerpo de una pieza: cúpula + borde de abajo en curvitas entre los brazos (solo las curvitas llevan contorno) */
    const cuerpo = () => {
      const w = ANCHO, xs = [...Array(nb)].map((_, j) => xb(nb - 1 - j));
      let d = 'M18.6 -2', cr = '';
      let px = 18.6, py = -2;
      xs.forEach((x, j) => { const ex = x + w; if (ex < px - 1.6) { const q = `Q${n3((px + ex) / 2)} ${n3(Math.min(py, 2.5) - 2.4)} ${n3(ex)} 2.5`; d += q; cr += `M${n3(px)} ${n3(py)}` + q; } else d += `L${n3(ex)} 2.5`;
        d += `L${n3(x - w)} 2.5`; px = x - w; py = 2.5; });
      const q = `Q${n3((px - 18.6) / 2)} ${n3(Math.min(py, -2) - 2.4)} -18.6 -2`; d += q; cr += `M${n3(px)} ${n3(py)}` + q;
      d += 'Q-24 -33 0 -35Q24 -33 18.6 -2Z';
      return `<path d="${d}" fill="url(#${id}-gc)"/><path d="M-18.6 -2Q-24 -33 0 -35Q24 -33 18.6 -2" fill="none" stroke="${B[3]}" stroke-width="1.4" stroke-linecap="round"/><path d="${cr}" fill="none" stroke="${B[3]}" stroke-width="1.1" stroke-linecap="round"/>`;
    };
    const brazoSVG = i => `<g id="${id}-b${i}"><path fill="url(#${id}-gb)"/><path fill="none" stroke="${B[3]}" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"/>${luces(i)}</g>`;
    const build = () => {
      let g = `<defs><linearGradient id="${id}-gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${B[0]}"/><stop offset=".45" stop-color="${B[1]}"/><stop offset="1" stop-color="${B[1]}"/></linearGradient>`
        + `<linearGradient id="${id}-gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${B[1]}"/><stop offset="1" stop-color="#f36fa8"/></linearGradient></defs>`;
      g += `<g id="${id}-sh">${piso(20)}</g>`;
      if (gold) g = aura(-28, 44) + chispas([[-30, -44, 3], [30, -48, 2.6], [32, -16, 2.2]]) + g;
      let c = `<g id="${id}-tras"></g>`;
      let m = cuerpo();
      m += `<ellipse cx="7" cy="-26" rx="7" ry="4" fill="#fff" opacity=".22"/>` + [[-9, -25, 2.4], [-3, -29.6, 1.6], [10, -22, 2], [13.6, -15.6, 1.3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${B[0]}" opacity=".9"/>`).join('');
      m += arc('M-14 -14Q-14.6 -25 -6 -29.4', 2.2, .75) + dot(-15, -9, 1);
      /* cara baja, frente grande */
      m += `<g transform="translate(0 -8.5) scale(1.32)">${[-3.9, 3.9].map((x, i) => `<g transform="translate(${x} -.8)"><g id="${id}-o${i}"><ellipse rx="2.3" ry="2.7" fill="url(#km-ojo)"/><circle cx=".8" cy="-1.1" r="1" fill="#fff"/><circle cx="-.7" cy="1.2" r=".45" fill="#fff"/></g></g>`).join('')}`
        + `<path id="${id}-bc" d="M-1.2 2.1Q0 3.4 1.2 2.1" fill="none" stroke="#5a2a44" stroke-width=".9" stroke-linecap="round"/><g id="${id}-bo" opacity="0"><ellipse cy="3.3" rx="1.8" ry="2.3" fill="#7a2a44"/><ellipse cy="4.2" rx="1" ry=".8" fill="#ff8fab"/></g>`
        + `<ellipse cx="-6.4" cy="2.1" rx="2.2" ry="1.4" fill="url(#km-mej)"/><ellipse cx="6.4" cy="2.1" rx="2.2" ry="1.4" fill="url(#km-mej)"/></g>`;
      if (k >= 2) m += `<path d="M-12.6 -18.6Q-10.2 -20.4 -7.8 -18.8M7.8 -18.8Q10.2 -20.4 12.6 -18.6" fill="none" stroke="${B[2]}" stroke-width=".9" stroke-linecap="round" opacity=".5"/>`;
      if (gold) m += corona(0, -34.4, 1.1);
      c += `<g id="${id}-man">${m}</g><g id="${id}-frente">${[...Array(N)].map((_, i) => brazoSVG(i)).join('')}</g>`;
      c += `<g id="${id}-q" opacity="0"><circle r="4.4" fill="#fff" stroke="${B[3]}" stroke-width=".9"/><text y="2.5" text-anchor="middle" font-family="Arial Rounded MT Bold,Nunito,Arial,sans-serif" font-weight="900" font-size="7.2" fill="${B[3]}">?</text></g>`;
      c += `<g id="${id}-nube" opacity="0">${[[-9, -6, 9], [3, -9, 10], [12, -4, 8], [-2, 0, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#b9a6e8" opacity=".85"/>`).join('')}${[[-6, -9, 2.6], [5, -13, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".55"/>`).join('')}</g>`;
      c += `<g id="${id}-tin">${[...Array(14)].map((_, i) => `<circle r="1.5" fill="${P_COL[i % P_COL.length]}"/>`).join('')}</g>`;
      return `<g transform="scale(${SC})">${g}<g id="${id}-all"><g id="${id}-cuerpo">${c}</g></g></g>`;
    };
    const refs = el => { const q = s => el.querySelector('#' + id + '-' + s);
      return { quiz: patronPulpo(k, false), base: patronPulpo(k, false), sh: q('sh'), cuerpo: q('cuerpo'), man: q('man'), tras: q('tras'), frente: q('frente'), qm: q('q'), nube: q('nube'), tin: [...q('tin').children],
        o: [0, 1].map(i => q('o' + i)), bc: q('bc'), bo: q('bo'),
        b: [...Array(N)].map((_, i) => ({ g: q('b' + i), f: q('b' + i).children[0], s: q('b' + i).children[1], l: [...Array(Q.luces)].map((_, j) => q(`l${i}-${j}`)), atras: false })) }; };
    /* forma de un brazo: relleno cerrado y contorno abierto en la raíz (así se une al cuerpo sin corte) */
    const forma = (A, B1, C1, D, w0) => { const L = [], R = [], K = 10;
      for (let s = 0; s <= K; s++) { const t = s / K, p = cub3(A, B1, C1, D, t), p2 = cub3(A, B1, C1, D, Math.min(1, t + .02)), p1 = cub3(A, B1, C1, D, Math.max(0, t - .02));
        let dx = p2[0] - p1[0], dy = p2[1] - p1[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const w = w0 * (1 - t * .45);
        L.push([p[0] - dy * w, p[1] + dx * w]); R.push([p[0] + dy * w, p[1] - dx * w]); }
      const wt = w0 * .55, pts = a => a.map(p => n3(p[0]) + ' ' + n3(p[1])).join('L');
      const linea = 'M' + pts(L) + `A${n3(wt)} ${n3(wt)} 0 0 0 ` + n3(R[K][0]) + ' ' + n3(R[K][1]) + 'L' + pts(R.slice().reverse());
      return [linea + 'Z', linea]; };
    const update = (R, p) => {
      const t = p.t || 0, vivo = p.vivo || 0, hel = clamp(p.helice, 0, 1), qz = R.quiz, ins = R.base;
      const fl = Q.fl * (1 - p.posa) + (vivo ? Math.sin(t * 2 * Math.PI / 3.4) * 1.3 * (1 - p.posa) : 0);
      const baseY = -(Q.L * (1 - p.posa * .2)) - fl - 2 + p.y;
      const resp = Math.sin(t * 2 * Math.PI / 3.4 + .6), ap = p.aprieta;
      sa(R.man, 'transform', `scale(${n3((1 + resp * .02 * vivo) * (1 + ap * .08))} ${n3((1 - resp * .015 * vivo) * (1 - ap * .12))})`);
      sa(R.cuerpo, 'transform', `translate(0 ${n3(baseY)}) scale(${n3(p.sx * (1 - p.esconde * .25))} ${n3(p.sy * (1 - p.esconde * .25))}) translate(0 ${n3(p.esconde * 9)})`);
      const Lb = Q.L;
      for (let i = 0; i < N; i++) {
        const mano = i === 0 || i === N - 1, s = i === 0 ? -1 : 1, j = i - 1, x0 = mano ? s * 15.6 : xb(j), dir = mano ? s : x0 < -.1 ? -1 : x0 > .1 ? 1 : (j % 2 ? 1 : -1);
        /* hélice: los brazos se reparten alrededor del cuerpo y giran; los de atrás pasan detrás y se ven más chicos */
        const ph0 = Math.asin(clamp(x0 / RX, -1, 1)), ph = lerp(ph0, (i / N) * 2 * Math.PI - Math.PI / 2, hel) + p.rot * Math.PI / 180;
        const xr = lerp(x0, RX * .9 * Math.sin(ph), hel), z = lerp(1, Math.cos(ph), hel), sc = .72 + .28 * z, sal = Math.sin(ph) * hel;
        const wv = q => p.onda * Math.sin(t * 2.3 + i * .9 - q) * (1 + vivo * .3); /* la ola nace en la base y llega después a la punta */
        let A0, B1, C1, D;
        if (mano) { A0 = [s * 15.2, -6]; B1 = [s * 23, -2 + wv(0) * .3]; C1 = [s * 30 + wv(.6), -6]; D = [s * 26.5 + wv(1.2) * 1.2, -13 + wv(1.2) * .6]; }
        else { A0 = [xr * .96, -1]; B1 = [xr - dir * .5 + wv(0) * .4, Lb * .9]; C1 = [xr + dir * 7 + wv(.6) * 1.1, Lb * 1.15]; D = [xr + dir * 6.5 + wv(1.2) * 1.5, Lb * .78]; }
        if (p.junta) { const jx = x0 * .3; B1 = [lerp(B1[0], x0 * .6, p.junta), lerp(B1[1], Lb * .8, p.junta)]; C1 = [lerp(C1[0], jx, p.junta), lerp(C1[1], Lb * 1.3, p.junta)]; D = [lerp(D[0], jx * .9, p.junta), lerp(D[1], Lb * 1.6, p.junta)]; if (mano) A0 = [lerp(A0[0], s * 13, p.junta), lerp(A0[1], -1, p.junta)]; }
        if (p.abre) { B1 = [lerp(B1[0], x0 * 1.3 + dir * 4, p.abre), lerp(B1[1], Lb * .5, p.abre)]; C1 = [lerp(C1[0], x0 * 1.4 + dir * 10, p.abre), lerp(C1[1], Lb * .7, p.abre)]; D = [lerp(D[0], x0 * 1.45 + dir * 12, p.abre), lerp(D[1], Lb * 1.05, p.abre)]; }
        if (hel) { A0 = [lerp(A0[0], xr * .9, hel), lerp(A0[1], -1, hel)]; B1 = [lerp(B1[0], xr + sal * 5, hel), lerp(B1[1], Lb * .55, hel)]; C1 = [lerp(C1[0], xr + sal * 11, hel), lerp(C1[1], Lb * .65, hel)]; D = [lerp(D[0], xr + sal * 15, hel), lerp(D[1], Lb * .45, hel)]; }
        if (p.posa && !mano) { D = [lerp(D[0], x0 * 1.5 + dir * 6 + Math.sin(t * 6 + i) * 1.5 * p.paso, p.posa), lerp(D[1], Lb * .98, p.posa)]; C1 = [lerp(C1[0], x0 * 1.3 + dir * 3, p.posa), lerp(C1[1], Lb * .85 - Math.max(0, Math.sin(t * 6 + i)) * 2.5 * p.paso, p.posa)]; }
        if (mano) { const mv = clamp(i ? p.manoD : p.manoI, 0, 1) * (1 - hel) * (1 - p.junta);
          if (mv > 0) { const ps = Math.round(i ? p.poseD : p.poseI), P0 = MANO[ps] || MANO[0], w2 = P0.w === 1 ? Math.sin(t * 11) * 3.5 : P0.w === 2 ? -Math.abs(Math.sin(t * 7)) * 3.5 : 0;
            B1 = [lerp(B1[0], s * P0.c1[0], mv), lerp(B1[1], P0.c1[1], mv)]; C1 = [lerp(C1[0], s * P0.c2[0], mv), lerp(C1[1], P0.c2[1], mv)]; D = [lerp(D[0], s * (P0.t[0] + w2), mv), lerp(D[1], P0.t[1], mv)]; } }
        const b = R.b[i], atras = hel > .05 && z < 0;
        if (b.atras !== atras) { (atras ? R.tras : R.frente).appendChild(b.g); b.atras = atras; }
        const [df, dl] = forma(A0, B1, C1, D, (mano ? ANCHO * .9 : ANCHO) * sc);
        sa(b.f, 'd', df); sa(b.s, 'd', dl);
        /* luces de las ventosas: el patrón del rato (o el de la etapa), la ola de color y el «?» */
        const it = (p.quiz > .5 ? qz : ins).it[i], esQ = p.quiz > .5 && i === qz.ult && p.revela < .5;
        b.l.forEach((L, jj) => { const tt = .3 + jj * (.48 / Math.max(1, Q.luces - 1)), pt = cub3(A0, B1, C1, D, Math.min(.82, tt));
          const vis = it.c && jj < it.q && !esQ && (p.quiz < .5 || i <= p.enciende) ? 1 : 0, ola = Math.max(0, 1 - Math.abs(p.olaColor - i - jj * .3)), r = (1.7 - jj * .12) * sc * (1 + ola * .35);
          const f = it.f || 'o'; if (L._f !== f + r.toFixed(2)) { L._f = f + r.toFixed(2); L.setAttribute('d', FIG[f](r)); }
          sa(L, 'fill', it.c || '#fff'); sa(L, 'opacity', n3(vis ? (.8 + .2 * Math.sin(t * 3 + i + jj) * vivo + ola * .2) : 0)); sa(L, 'transform', `translate(${n3(pt[0])} ${n3(pt[1])})`); });
        if (p.quiz > .5 && i === qz.ult) { const pt = qz.ult === N - 1 ? D : cub3(A0, B1, C1, D, .6); sa(R.qm, 'transform', `translate(${n3(pt[0] + (qz.ult === N - 1 ? 1.5 : 0))} ${n3(pt[1] - (qz.ult === N - 1 ? 5 : -1) - Math.sin(t * 5) * .8)}) scale(${n3(1 - p.revela * .9)})`); }
      }
      sa(R.qm, 'opacity', n3(p.pregunta * (1 - p.revela)));
      const ojo = Math.max(.08, p.ojos);
      R.o.forEach(o => sa(o, 'transform', `translate(${n3(p.mira * 1.1)} 0) scale(1 ${n3(ojo)})`));
      sa(R.bo, 'opacity', n3(clamp((p.boca - .1) * 1.6, 0, 1))); sa(R.bo, 'transform', `scale(1 ${n3(.4 + .6 * clamp(p.boca, 0, 1))})`); sa(R.bc, 'opacity', n3(1 - clamp(p.boca * 2, 0, 1)));
      R.tin.forEach((c, i) => { const a = i / R.tin.length * Math.PI * 2 + .3, d = p.tinta * (14 + (i % 3) * 5); sa(c, 'cx', n3(Math.cos(a) * d)); sa(c, 'cy', n3(4 + Math.sin(a) * d * .8 + p.tinta * 6)); sa(c, 'opacity', n3(p.tinta > 0 && p.tinta < 1 ? 1 - p.tinta * .8 : 0)); });
      sa(R.nube, 'opacity', n3(p.nube)); sa(R.nube, 'transform', `translate(0 ${n3(Q.L * .5)}) scale(${n3(.6 + .4 * p.nube)})`);
      sa(R.sh, 'transform', `scale(${n3((1 - Math.min(.5, (fl - p.y) / 40)) * (1 + hel * .3))} 1)`);
    };
    return { build, refs, update };
  };
  const P_SPEC = {
    fondo: (t, modo, p) => { const vivo = modo === 'vida' ? 1 : 0; p.t = t; p.vivo = vivo; return {}; },
    acciones: [m => m.hacer([[0, { olaColor: 10 }, 1600, 'lineal'], [1700, { olaColor: -9 }, 1]])],
    gesto: (m, d) => m.hacer([[d, { aprieta: 1 }, 200], [d + 200, { tinta: 1, aprieta: 0, junta: 1, y: -11 }, 450, 'sale'], [d + 700, { tinta: 0 }, 1], [d + 700, { junta: 0, abre: 1 }, 350], [d + 900, { y: 0 }, 900, 'suave'], [d + 1700, { abre: 0 }, 400]]),
    salto: (m, d) => m.hacer([[d, { sy: .86, sx: 1.08 }, 140], [d + 140, { y: -12, sy: 1.08, sx: .94 }, 240, 'sale'], [d + 380, { y: 0, sy: 1, sx: 1 }, 260, 'suave']]),
  };

  const ANIM = { tortugono: k => ({ draw: tortugonoPose(k), base: T_BASE, spec: T_SPEC }), cubuho: k => ({ draw: cubuhoPose(k), base: B_BASE, spec: k === 1 ? B1_SPEC : B_SPEC }),
    cienpiecito: k => ({ draw: cienpiecitoPose(k), base: { ...N_BASE, alza: N_ST[k].alza }, spec: N_SPEC[k] }),
    pulpatron: k => ({ draw: pulpatronPose(k), base: P_BASE, spec: P_SPEC }) };
  /* poner(el, id, k): arranca el motor de esa mascota dentro de el (un <g>); devuelve el motor o null si no tiene poses */
  const poner = (el, id, k, variante) => { if (!ANIM[id] || !k) return null; const a = ANIM[id](k, variante); return new Motor(el, a.draw, a.base, a.spec); };
  M.POSES = { Motor, poner, tiene: id => !!ANIM[id], EASE };
})(typeof window !== 'undefined' ? window : global);
