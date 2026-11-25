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
  const cubuhoPose = k => {
    const id = 'kb' + (++nB), SC = M.C.SCALE[k], body = k === 4 ? 'oro' : 'lila', BC = PAL[body], L = PAL.lila, cria = k === 1;
    const W = cria ? 13 : 16, TOP = cria ? -31 : -33, BOT = cria ? -4 : -1, SPLIT = cria ? -7.4 : -9.2, D = 2 * W;
    const PX = (cria ? 8.5 : 9) / D, PY = -7 / D; /* proyección del fondo: hacia la derecha y hacia arriba, como el cubo de siempre */
    const HH = SPLIT - TOP, ER = cria ? 6.6 : 7.4, FV = 12; /* alto de la cabeza; radio de los discos; altura de los ojos en la cara */
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
    const caraFrente = gel(C(W - 7, FV, ER), 'crema', 1) + gel(C(W + 7, FV, ER), 'crema', 1) + ojo(W - 7, 0) + ojo(W + 7, 1)
      + `<ellipse cx="${W - 12.4}" cy="${FV + 7.2}" rx="2.6" ry="1.5" fill="url(#km-mej)"/><ellipse cx="${W + 12.4}" cy="${FV + 7.2}" rx="2.6" ry="1.5" fill="url(#km-mej)"/>`
      + gel(P(`M${W - 2.4} ${FV + 6.4}Q${W} ${FV + 5.2} ${W + 2.4} ${FV + 6.4}L${W + .4} ${FV + 9.8}Q${W} ${FV + 10.4} ${W - .4} ${FV + 9.8}Z`), 'naranja', .8);
    const caraAtras = `<ellipse cx="${W}" cy="${FV + 1}" rx="${W - 4}" ry="${n3(HH / 2 - 2)}" fill="${BC[0]}" opacity=".5"/>`
      + [-1, 0, 1].map(j => [-6, 0, 6].map(x => `<path d="M${W + x - 2.2} ${FV - 3 + j * 4.4}L${W + x} ${FV - 1.2 + j * 4.4}L${W + x + 2.2} ${FV - 3 + j * 4.4}" fill="none" stroke="${BC[2]}" stroke-width=".95" stroke-linecap="round" stroke-linejoin="round"/>`).join('')).join('');
    const caraLado = `<path d="M${W - 5} ${n3(HH * .45)}L${W} ${n3(HH * .45 + 2.4)}L${W + 5} ${n3(HH * .45)}M${W - 5} ${n3(HH * .45 + 4.4)}L${W} ${n3(HH * .45 + 6.8)}L${W + 5} ${n3(HH * .45 + 4.4)}" fill="none" stroke="${BC[3]}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>`;
    const cuerpoCara = (f) => {
      const w = Math.hypot(...f.u), h = Math.hypot(...f.v), top = f.n === 'ar';
      const fill = top ? `fill="${BC[0]}"` : `fill="url(#km-${body})"`;
      const dentro = f.n === 'fr' ? caraFrente : f.n === 'at' ? caraAtras : top ? `<path d="M${n3(w * .2)} ${n3(h * .82)}H${n3(w * .8)}" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>` : caraLado;
      return `<g id="${id}-c${f.n}"><rect x="-.3" y="-.3" width="${n3(w + .6)}" height="${n3(h + .6)}" ${fill}/>`
        + (top ? '' : `<rect id="${id}-s${f.n}" width="${n3(w)}" height="${n3(h)}" fill="#2a1640" opacity="0"/>${arc(`M4 ${n3(h * .55)}Q3.6 4 9 3.4`, 1.6, .7)}`)
        + `<rect width="${n3(w)}" height="${n3(h)}" fill="none" stroke="${BC[3]}" stroke-width=".7" opacity=".4"/>` + dentro + '</g>';
    };
    const OREJAS = [[-9.5, 6], [9.5, 6]]; /* sobre la tapa, cerca del frente */
    const oreja = (i) => k >= 3
      ? `<g id="${id}-e${i}"><g id="${id}-ei${i}">${cono(k)}</g></g>`
      : k === 2 ? `<g id="${id}-e${i}"><g id="${id}-ei${i}">${gel(C(0, -1.6, 3.2), body, 1)}</g></g>` : '';
    const ala = () => `${gel(P('M0 -4Q-9 -2 -8.6 8Q-8 13 -3.6 12Q0 8 0 4Z'), body, 1.1)}${k >= 2 ? [[-7.4, 4.6, 14, 4.6], [-6.2, 7.6, 8, 4.8], [-4.4, 9.8, 0, 4.4]].map(([x, y, r, l]) => pluma(x, y, r, l, k === 4 ? 'rosa' : 'lila')).join('') : ''}`;
    /* cuerpo (capa de abajo), quieto: costado, tapa (se ve en las esquinas cuando la cabeza gira) y frente */
    const cuerpo = () => {
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
    const patas = () => [-7, 7].map((x, i) => `<g id="${id}-pi${i}">${k >= 3 ? gel(R(x - 3.2, -3, 6.4, 4.4, 2), 'naranja', .9) + `<ellipse cx="${x}" cy="-3" rx="3.2" ry="1.1" fill="${PAL.naranja[0]}"/>` : gel(E(x, .3, 4.2, 2.2), 'naranja', .9) + arc(`M${x - 2.4} -.4Q${x - 1} -1.2 ${x + .6} -1`, .8, .7)}</g>`).join('');
    const cabeza = () => `<g id="${id}-cab"><clipPath id="${id}-hc"><path id="${id}-hcp"/></clipPath><path id="${id}-hs" fill="url(#km-${body})"/>`
      + `<g clip-path="url(#${id}-hc)">${CARAS.map(cuerpoCara).join('')}</g><path id="${id}-hs2" fill="none" stroke="${BC[3]}" stroke-width="1.4" stroke-linejoin="round"/>${[0, 1].map(oreja).join('')}`
      + (cria ? `<g id="${id}-ri"><path d="M-2 -0.4Q-4 -6 .6 -6.4Q3.6 -6.4 2.6 -3.4" fill="none" stroke="${L[2]}" stroke-width="2" stroke-linecap="round"/></g>` : '')
      + (k === 4 ? `<g id="${id}-co">${corona(0, 0, 1.05)}</g>` : '') + '</g>';
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
      g += `<g id="${id}-a0"><g transform="translate(${-W + 2.4} ${SPLIT + .6}) scale(.8)">${ala()}</g></g>`; /* ala lejana: detrás del cuerpo, asoma un pedazo */
      g += cuerpo();
      g += `<g id="${id}-a1"><g transform="translate(${n3(W + 7.4)} ${n3(SPLIT - 4.4)}) skewY(-38) scale(.6 .82)">${ala()}</g></g>`; /* ala cercana: sobre el costado, nace bajo la cabeza */
      g += patas() + cabeza();
      return `<g transform="scale(${SC})">${pre}<g id="${id}-sh">${piso(26, 2)}</g><g id="${id}-all">${g}</g></g>`;
    };
    const refs = el => { const q = s => el.querySelector('#' + id + '-' + s);
      return { sh: q('sh'), all: q('all'), cab: q('cab'), hcp: q('hcp'), hs: q('hs'), hs2: q('hs2'), caras: CARAS.map(f => ({ f, g: q('c' + f.n), s: q('s' + f.n) })), o: [q('o0'), q('o1')], e: [q('e0'), q('e1')], ei: [q('ei0'), q('ei1')], ri: q('ri'), co: q('co'),
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
      const hd = redondo(casco(hp), 3.8); r.hcp.setAttribute('d', hd); r.hs.setAttribute('d', hd); r.hs2.setAttribute('d', hd);
      /* orejas, rizo y corona: puntos sobre la tapa que giran con la cabeza */
      const sobre = (x, z) => { const [rx, rz] = rot(x, z, c, s); return proj(rx, TOP, rz); };
      OREJAS.forEach(([x, z], i) => { if (!r.e[i]) return; const [px, py] = sobre(x, z); r.e[i].setAttribute('transform', `translate(${n3(px)} ${n3(py + .6)})`); });
      if (r.ri) { const [px, py] = sobre(1, 6); r.ri.setAttribute('transform', `translate(${n3(px)} ${n3(py)})`); }
      if (r.co) { const [px, py] = sobre(0, W); r.co.setAttribute('transform', `translate(${n3(px)} ${n3(py - 2)})`); }
      } /* fin de lo que solo cambia al girar */
      /* tirón de orejas (siempre se puede mover, aunque la cabeza no gire) */
      OREJAS.forEach((_, i) => { if (r.ei[i]) sa(r.ei[i], 'transform', k >= 3 ? conoT(i ? 1 : -1, p.orejas) : `translate(0 ${n3(-Math.abs(p.orejas) * 1.2)})`); });
      sa(r.cab, 'transform', `translate(${n3(p.cabX)} ${n3(p.cabY)}) rotate(${n3(p.ladeo)} 0 ${SPLIT})`);
      r.o.forEach((o, i) => sa(o, 'transform', `scale(1 ${n3(Math.max(.08, p.ojos * (i === 0 ? p.guino : 1)))})`));
      const fl = p.aleteo * Math.sin((p.t || 0) * 34) * 22, resp = (p.vivo || 0) * Math.sin((p.t || 0) * 2 * Math.PI / 3.6) * 2.5; /* las dos alas juntas */
      const ang = p.alaI + p.alaD + p.esponja * 12 + Math.max(0, fl) + resp;
      sa(r.a[0], 'transform', `rotate(${n3(ang * .8)} ${-W + 2.4} ${n3(SPLIT - 2.6)})`);
      sa(r.a[1], 'transform', `rotate(${n3(-ang)} ${n3(W + 7.4)} ${n3(SPLIT - 6)})`);
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

  /* ---------- 2b · Cubúho «original» (el diseño de antes del 3D, que gustaba más), con vida propia ----------
     Para comparar con el 3D. Mismo dibujo de la tanda C (cubo de una pieza, alas a los costados, orejas de cono), con:
     alas que se mueven juntas, orejas que dan tirones, cabeceo y ladeo de la cara, guiño, esponjarse, pasitos,
     ojos que miran de reojo y, al tocarlo, ojos que dan la vuelta (la otra opción que dio la dueña). */
  const cubuhoOrig = k => {
    const id = 'ko' + (++nB), SC = M.C.SCALE[k], body = k === 4 ? 'oro' : 'lila', BC = PAL[body];
    const FC = [0, -21];
    const ojo = (x, i) => `<g transform="translate(${x} -21.06)"><g id="${id}-o${i}"><ellipse rx="${n3(2.3 * 1.32)}" ry="${n3(2.7 * 1.32)}" fill="url(#km-ojo)"/><circle cx="${n3(.8 * 1.32)}" cy="${n3(-1.1 * 1.32)}" r="${n3(1.32)}" fill="#fff"/><circle cx="${n3(-.7 * 1.32)}" cy="${n3(1.2 * 1.32)}" r=".6" fill="#fff"/></g></g>`;
    const ala = () => `${gel(P('M0 -4Q-9 -2 -8.6 8Q-8 13 -3.6 12Q0 8 0 4Z'), body, 1.1)}${k >= 2 ? [[-7.4, 4.6, 14, 4.6], [-6.2, 7.6, 8, 4.8], [-4.4, 9.8, 0, 4.4]].map(([x, y, r, l]) => pluma(x, y, r, l, k === 4 ? 'rosa' : 'lila')).join('') : ''}`;
    const build = () => {
      const pre = k === 4 ? aura(-22, 38) + chispas([[-26, -36, 3], [31, -28, 2.6], [-22, -8, 2.2]]) : '';
      let g = '';
      if (k === 4) [[-13, -16, 1], [21, -18, -1]].forEach(([x, y, sg], i) => { g += `<g id="${id}-f${i}" transform="translate(${x} ${y})">${[70, 100, 130, 160].map((r, j) => `<g transform="rotate(${sg * r})">${pluma(0, 0, 0, 14 - j * 1.2, j % 2 ? 'lila' : 'rosa', 4)}</g>`).join('')}</g>`; });
      g += flat(P('M15 -31L23 -37Q25 -38.4 25 -36L25 -9Q25 -7 23.4 -6L15 -1Z'), BC[2], BC[3], 1.2);
      g += flat(P('M-13 -32L-6 -38.6Q-5 -39.6 -3.4 -39.6L21.6 -39.6Q24.6 -39.6 22.4 -37.4L16.4 -32Z'), BC[0], BC[3], 1.2);
      g += gel(R(-16, -33, 32, 32, 6.5), body, 1.4);
      g += arc('M-12.4 -24Q-12.6 -29.4 -7 -29.6', 1.8, .8) + `<path d="M-4 -37.4H16" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`;
      g += flat(E(0, -7.5, 10, 5.6), BC[0], BC[2], .9) + [[-5, -9], [0, -10], [5, -9], [-2.5, -5.6], [2.5, -5.6]].map(([x, y]) => `<path d="M${x - 1.5} ${y - .8}L${x} ${y + .6}L${x + 1.5} ${y - .8}" fill="none" stroke="${BC[2]}" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
      if (k >= 3) g += [-4.5, 0, 4.5].map(x => gel(C(x, -3.4, 1.5), k === 4 ? 'rosa' : 'amarillo', .5) + dot(x - .5, -3.9, .45)).join('');
      g += `<g id="${id}-a0"><g transform="translate(-15.5 -18) scale(-1 1)">${ala()}</g></g><g id="${id}-a1"><g transform="translate(21 -18)">${ala()}</g></g>`;
      g += `<g id="${id}-fa">${gel(C(-7, -21, 7.4), 'crema', 1)}${gel(C(7, -21, 7.4), 'crema', 1)}${ojo(-7, 0)}${ojo(7, 1)}`
        + `<ellipse cx="-12.4" cy="-13.6" rx="2.6" ry="1.5" fill="url(#km-mej)"/><ellipse cx="12.4" cy="-13.6" rx="2.6" ry="1.5" fill="url(#km-mej)"/>`
        + gel(P('M-2.4 -14.4Q0 -15.6 2.4 -14.4L.4 -11Q0 -10.4 -.4 -11Z'), 'naranja', .8) + '</g>';
      if (k === 2) g += `<g transform="translate(-9 -38.4)"><g id="${id}-ei0">${gel(C(0, 0, 3.2), body, 1)}</g></g><g transform="translate(18 -40.4)"><g id="${id}-ei1">${gel(C(0, 0, 3.2), body, 1)}</g></g>`;
      if (k >= 3) g += `<g transform="translate(-8.6 -38.2)"><g id="${id}-ei0">${cono(k)}</g></g><g transform="translate(19 -40)"><g id="${id}-ei1">${cono(k)}</g></g>`;
      if (k === 4) g += corona(5.6, -41.6, 1.05);
      g += [-7, 7].map((x, i) => `<g id="${id}-pi${i}">${k >= 3 ? gel(R(x - 3.2, -3, 6.4, 4.4, 2), 'naranja', .9) + `<ellipse cx="${x}" cy="-3" rx="3.2" ry="1.1" fill="${PAL.naranja[0]}"/>` : gel(E(x, .3, 4.2, 2.2), 'naranja', .9) + arc(`M${x - 2.4} -.4Q${x - 1} -1.2 ${x + .6} -1`, .8, .7)}</g>`).join('');
      return `<g transform="scale(${SC})">${pre}<g id="${id}-sh">${piso(26, 2)}</g><g id="${id}-all">${g}</g></g>`;
    };
    const refs = el => { const q = s => el.querySelector('#' + id + '-' + s); return { sh: q('sh'), all: q('all'), fa: q('fa'), o: [q('o0'), q('o1')], ei: [q('ei0'), q('ei1')], a: [q('a0'), q('a1')], pi: [q('pi0'), q('pi1')], f: [q('f0'), q('f1')] }; };
    const update = (r, p) => {
      sa(r.fa, 'transform', `translate(${n3(p.cabX)} ${n3(p.cabY)}) rotate(${n3(p.ladeo * 1.4)} ${FC[0]} ${FC[1]})`);
      r.o.forEach((o, i) => sa(o, 'transform', `translate(${n3(p.miraX)} 0) rotate(${n3(p.giroOjos)}) scale(1 ${n3(Math.max(.08, p.ojos * (i === 0 ? p.guino : 1)))})`));
      r.ei.forEach((e, i) => e && sa(e, 'transform', k >= 3 ? conoT(i ? 1 : -1, p.orejas) : `translate(0 ${n3(-Math.abs(p.orejas) * 1.2)})`));
      const fl = p.aleteo * Math.sin((p.t || 0) * 34) * 22, resp = (p.vivo || 0) * Math.sin((p.t || 0) * 2 * Math.PI / 3.6) * 2.5;
      const ang = p.alaI + p.alaD + p.esponja * 12 + Math.max(0, fl) + resp; /* las dos alas juntas */
      sa(r.a[0], 'transform', `rotate(${n3(ang)} -15.5 -22)`);
      sa(r.a[1], 'transform', `rotate(${n3(-ang)} 21 -22)`);
      r.f.forEach((f, i) => f && sa(f, 'transform', `translate(${i ? 21 : -13} ${i ? -18 : -16}) rotate(${n3((i ? -1 : 1) * (Math.sin((p.t || 0) * 1.6) * 3 * (p.vivo || 0) + fl * .6))})`));
      r.pi.forEach((f, i) => sa(f, 'transform', `translate(0 ${n3(-Math.max(0, Math.sin((p.t || 0) * 9 + i * Math.PI)) * 1.6 * p.pasito)})`));
      const pu = 1 + p.esponja * .05;
      sa(r.all, 'transform', `translate(0 ${n3(p.y)}) scale(${n3(p.sx * pu)} ${n3(p.sy * pu)})`);
      sa(r.sh, 'transform', `scale(${n3(1 - Math.min(.4, -p.y / 40))} 1)`);
    };
    return { build, refs, update };
  };
  const O_SPEC = {
    fondo: B_SPEC.fondo,
    acciones: [
      m => { const g = lado(); return m.hacer([[0, { miraX: 1.6 * g }, 300], [1100, { miraX: -1.6 * g }, 400], [2000, { miraX: 0 }, 300]]); }, /* mira de reojo */
      B_SPEC.acciones[2], B_SPEC.acciones[3], B_SPEC.acciones[4], B_SPEC.acciones[5], B_SPEC.acciones[6], B_SPEC.acciones[7],
    ],
    gesto: (m, d) => m.hacer([ /* los ojos dan la vuelta, con la cara que acompaña */
      [d, { sy: .93, sx: 1.04 }, 160], [d + 160, { sy: 1, sx: 1 }, 220],
      [d + 140, { giroOjos: 360, ladeo: 6 }, 1100, 'suave'], [d + 1240, { giroOjos: 0 }, 1], [d + 1240, { ladeo: 0 }, 300],
      [d + 1300, { ojos: 0 }, 80], [d + 1390, { ojos: 1 }, 110], [d + 1300, { esponja: 1, orejas: .8 }, 160], [d + 1480, { esponja: 0, orejas: 0 }, 300, 'rebote']]),
    salto: B_SPEC.salto,
  };

  const ANIM = { tortugono: k => ({ draw: tortugonoPose(k), base: T_BASE, spec: T_SPEC }), cubuho: (k, v) => v === 'original' && k > 1 ? { draw: cubuhoOrig(k), base: B_BASE, spec: O_SPEC } : { draw: cubuhoPose(k), base: B_BASE, spec: k === 1 ? B1_SPEC : B_SPEC } };
  /* poner(el, id, k): arranca el motor de esa mascota dentro de el (un <g>); devuelve el motor o null si no tiene poses */
  const poner = (el, id, k, variante) => { if (!ANIM[id] || !k) return null; const a = ANIM[id](k, variante); return new Motor(el, a.draw, a.base, a.spec); };
  M.POSES = { Motor, poner, tiene: id => !!ANIM[id], EASE };
})(typeof window !== 'undefined' ? window : global);
