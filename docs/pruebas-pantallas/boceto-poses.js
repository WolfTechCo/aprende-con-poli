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
  const { P, R, E, gel, arc, dot, piso, poly, corona, aura, chispas, f1 } = M.H;
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
      this.cola = []; this.modo = 'vida'; this.ocupado = 0; this.proxima = 0; this.ultima = -1; this.parpadeo = 0; this.turno = 0;
      this.reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.paso = this.paso.bind(this); this.t0 = performance.now(); this.vivo = true;
      if (el.style) el.style.pointerEvents = 'none';
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
      if (t - (this.ult || 0) > 30) { this.ult = t; this.render(t); }
      requestAnimationFrame(this.paso);
    }
    render(t) {
      const pose = {};
      Object.keys(this.base).forEach(k => { pose[k] = this.valor(k, t); });
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
      this.el.innerHTML = this.draw(pose);
    }
    /* al tocar: salto, gesto o los dos (para no repetir) */
    tocar() {
      if (this.reducido) return '';
      this.cola = []; Object.assign(this.v, this.base);
      const plan = [['salto'], ['gesto'], ['salto', 'gesto'], ['gesto'], ['salto']][this.turno++ % 5];
      let fin = performance.now();
      plan.forEach((p, i) => { const d = fin - performance.now(); fin = this.spec[p](this, Math.max(0, d) + (i ? 120 : 0)); });
      this.ocupado = fin; this.proxima = fin + 1200;
      return plan.join(' + ');
    }
    setModo(m) { this.modo = m; if (m !== 'vida') { this.cola = this.cola.filter(c => c.k === 'ojos'); Object.assign(this.v, this.base); } }
    parar() { this.vivo = false; }
  }

  /* ---------- 1 · Tortugono con poses ---------- */
  let clipN = 0;
  const T_BASE = { cuello: 1, cabRot: 0, cabY: 0, boca: 0, ojos: 1, patas: 0, andar: 0, capRot: 0, sx: 1, sy: 1, y: 0, mira: 0 };
  /* cara con párpados (ojos: 1 abiertos … 0 cerrados) y boca que se abre (bostezo) */
  const caraT = (x, y, s, p, grande) => {
    let f = `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s)})">`;
    const o = Math.max(.08, p.ojos), mx = p.mira * 1.1;
    [-3.4, 3.4].forEach(e => {
      f += o < .25 ? `<path d="M${e - 2.2} -.5Q${e} 1.3 ${e + 2.2} -.5" fill="none" stroke="#3a1f3a" stroke-width=".95" stroke-linecap="round"/>`
        : `<g transform="translate(${f1(e + mx)} -.8) scale(1 ${f1(o)})"><ellipse rx="2.3" ry="2.7" fill="url(#km-ojo)"/><circle cx=".8" cy="-1.1" r="1" fill="#fff"/><circle cx="-.7" cy="1.2" r=".45" fill="#fff"/></g>`;
    });
    const b = p.boca;
    f += b > .15 ? `<ellipse cx="0" cy="${f1(2.6 + b * .6)}" rx="${f1(1.1 + b * .6)}" ry="${f1(.8 + b * 1.4)}" fill="#7a2a44"/><ellipse cx="0" cy="${f1(3 + b)}" rx="${f1(.7 + b * .3)}" ry="${f1(.4 + b * .5)}" fill="#ff8fab"/>`
      : grande ? `<path d="M-1.4 1.9Q0 4.4 1.4 1.9Z" fill="#7a2a44"/>` : `<path d="M-1.2 2.1Q0 3.4 1.2 2.1" fill="none" stroke="#5a2a44" stroke-width=".9" stroke-linecap="round"/>`;
    f += `<ellipse cx="-5.8" cy="2.1" rx="2.2" ry="1.4" fill="url(#km-mej)"/><ellipse cx="5.8" cy="2.1" rx="2.2" ry="1.4" fill="url(#km-mej)"/></g>`;
    return f;
  };
  const tortugonoPose = k => {
    const cid = 'kt-' + (++clipN), T = TT[k], tile = k === 4 ? 'oro' : 'amarillo', up = k >= 3, hs = [0, 1.22, 1.08, 1, 1][k];
    const HOLE = [15.4, -11.8], O = up ? [27, -27] : [23, -15], B = HOLE, CTRL = up ? [24, -15] : [21, -12.5]; /* cabeza: afuera, en el hoyo y curva del cuello */
    const SC = M.C.SCALE[k];
    return p => {
      const c = Math.max(0, p.cuello), u = Math.min(1, c);
      /* la cabeza sigue una curva desde la abertura hacia afuera (cuello en S que se estira) */
      const qx = (1 - u) * (1 - u) * B[0] + 2 * u * (1 - u) * CTRL[0] + u * u * O[0], qy = (1 - u) * (1 - u) * B[1] + 2 * u * (1 - u) * CTRL[1] + u * u * O[1];
      const hx = qx + (c - u) * 4, hy = qy + p.cabY - (c - u) * 3, s = hs * (.4 + .6 * u); /* se achica al entrar: se aleja hacia adentro del caparazón */
      let s0 = piso(34, -2);
      let g = '';
      if (k >= 2) g += gel(P(`M-25 -8Q${f1(-35 + p.patas * 6)} -8 ${f1(-33 + p.patas * 6)} -2.6Q-29 -1.2 -24 -4Z`), 'menta', 1); /* colita */
      /* patas: caminan en diagonal (la de atrás con la de adelante del otro lado) y se recogen bajo el borde */
      const ph = p.andar ? p.fase : 0;
      g += [-20, -8, 6].map((x, i) => {
        const lift = p.andar * Math.max(0, Math.sin(ph + (i === 1 ? Math.PI : 0))) * 2.6, swing = p.andar * Math.cos(ph + (i === 1 ? Math.PI : 0)) * 1.6;
        const h = (k >= 2 ? 11 : 10) * (1 - p.patas * .75);
        return gel(R(f1(x - 4.2 + swing), f1(-h - lift - p.patas * 2), 8.4, f1(h), 4), 'menta', 1);
      }).join('');
      /* cuello y cabeza: van DETRÁS del caparazón (su borde curvo los tapa al entrar) y se repiten dentro de la abertura */
      let cab = '';
      if (c > .14) cab += tent(`M${HOLE[0] - 2} ${HOLE[1]}Q${f1(lerp(HOLE[0], CTRL[0], u))} ${f1(lerp(HOLE[1], CTRL[1], u))} ${f1(hx - 2 * s)} ${f1(hy + 4 * s)}`, 'menta', f1(7.5 * s));
      if (c > .06) cab += `<g transform="rotate(${f1(p.cabRot)} ${f1(hx)} ${f1(hy + 4)})">${tHead(f1(hx), f1(hy), s)}${caraT(hx + 2.4 * s, hy + .6 * s, .9 * s, p, k >= 3)}${k === 4 ? corona(f1(hx), f1(hy - 8.6 * s), .95 * s, 8) : ''}</g>`;
      g += cab;
      if (up) g += [[-16, -35.4], [-4, -40.6], [8, -35.4]].map(([x, y], i) => `<g transform="rotate(${f1(Math.sin(p.t * 2 + i) * 2 * p.vivo)} ${x} ${y + 5})">${gel(poly(x, y, 5.6, T.n), tile, 1)}</g>`).join('');
      g += gel(P('M-29 -7.5Q-29 -11.5 -25 -11.5L19 -11.5Q23 -11.5 23 -7.5Q23 -3.8 19 -3.8L-25 -3.8Q-29 -3.8 -29 -7.5Z'), k === 4 ? 'oro' : 'vainilla', 1.1);
      g += gel(P('M-26 -10Q-28.5 -37 -3 -38Q22.5 -37 20 -10Q-3 -7 -26 -10Z'), 'verde', 1.4);
      g += T.p.map(([x, y, r]) => gel(poly(x, y, r, T.n), tile, 1)).join('') + (T.c ? gel(poly(T.c[0], T.c[1], T.c[2], T.c[3]), tile, 1.1) : '');
      g += arc('M-21 -17Q-20 -29 -9 -33', 2.2, .75) + dot(-22, -12.5, 1);
      /* la abertura de adelante, oscura por dentro; lo que está dentro de ella se ve por el hoyo */
      g += `<g transform="rotate(-14 ${HOLE[0]} ${HOLE[1]})"><ellipse cx="${HOLE[0]}" cy="${HOLE[1]}" rx="5.4" ry="6.4" fill="#1d4a3c" stroke="${PAL.verde[3]}" stroke-width="1.2"/><ellipse cx="${HOLE[0] + 1}" cy="${HOLE[1] + 1.2}" rx="3.8" ry="4.7" fill="#0f2c24"/></g>`;
      g += `<clipPath id="${cid}"><ellipse cx="${HOLE[0]}" cy="${HOLE[1]}" rx="4.9" ry="5.9" transform="rotate(-14 ${HOLE[0]} ${HOLE[1]})"/></clipPath><g clip-path="url(#${cid})">${cab}</g>`;
      const sombra = `<g transform="translate(0 0) scale(${f1(1 - Math.min(.4, -p.y / 40))} 1)">${s0}</g>`;
      return `<g transform="scale(${SC})">` + (k === 4 ? aura(-20, 42) + chispas([[-30, -44, 3], [36, -12, 2.6], [-34, -18, 2.2]]) : '') + sombra + `<g transform="translate(0 ${f1(p.y)}) scale(${f1(p.sx)} ${f1(p.sy)})"><g transform="rotate(${f1(p.capRot)} -3 -4)">${g}</g></g>` + '</g>';
    };
  };
  const T_SPEC = {
    fondo: (t, modo, p) => {
      const vivo = modo === 'vida' ? 1 : 0;
      p.t = t; p.vivo = vivo; p.fase = t * 7;
      return { sy: Math.sin(t * 2 * Math.PI / 3.2) * .012, sx: -Math.sin(t * 2 * Math.PI / 3.2) * .006, cabY: vivo * Math.sin(t * 2 * Math.PI / 2.3 + 1) * .5, cabRot: vivo * Math.sin(t * 2 * Math.PI / 4.1) * 2 };
    },
    acciones: [
      m => m.hacer([[0, { cuello: 1.12 }, 300], [300, { cabRot: -9 }, 150], [450, { cabRot: 4 }, 150], [600, { cabRot: -8 }, 140], [740, { cabRot: 3 }, 140], [880, { cabRot: 0, cuello: 1 }, 320]]), /* olfatea */
      m => m.hacer([[0, { cabRot: 10, mira: 1 }, 500], [1100, { cabRot: -9, mira: -1 }, 600], [2100, { cabRot: 0, mira: 0 }, 400]]), /* mira a los lados */
      m => m.hacer([[0, { ojos: 0, boca: 1, cuello: 1.08, cabRot: -6 }, 650], [1250, { ojos: 1, boca: 0, cuello: 1, cabRot: 0 }, 450]]), /* bosteza */
      m => m.hacer([[0, { andar: 1 }, 300], [2300, { andar: 0 }, 300]]), /* camina en su lugar */
      m => m.hacer([[0, { cuello: .3, patas: .3 }, 280, 'sale'], [1000, { cuello: 1.12, patas: 0 }, 320, 'rebote'], [1320, { cuello: 1 }, 200]]), /* tímida */
    ],
    gesto: (m, d) => m.hacer([
      [d, { sy: .9, sx: 1.06 }, 120], [d + 120, { sy: 1, sx: 1 }, 160],
      [d + 100, { cuello: 0 }, 260, 'entra'], [d + 220, { patas: 1 }, 260, 'entra'], /* primero la cabeza, después las patas */
      [d + 480, { capRot: -7 }, 110], [d + 590, { capRot: 6 }, 120], [d + 710, { capRot: -3 }, 120], [d + 830, { capRot: 0 }, 140],
      [d + 1250, { cuello: .3 }, 280, 'sale'], [d + 1560, { ojos: 0 }, 70], [d + 1640, { ojos: 1 }, 90], /* asoman los ojitos */
      [d + 2000, { cuello: 1.15, patas: 0 }, 260, 'rebote'], [d + 2260, { cuello: 1 }, 220]]),
    salto: (m, d) => m.hacer([
      [d, { sy: .84, sx: 1.1 }, 130], [d + 130, { y: -15, sy: 1.1, sx: .92, patas: .35 }, 230, 'sale'], [d + 360, { y: 0, patas: 0 }, 200, 'entra'],
      [d + 560, { sy: .88, sx: 1.08 }, 90], [d + 650, { sy: 1, sx: 1 }, 220, 'rebote']]),
  };

  const ANIM = { tortugono: k => ({ draw: tortugonoPose(k), base: T_BASE, spec: T_SPEC }) };
  /* poner(el, id, k): arranca el motor de esa mascota dentro de el (un <g>); devuelve el motor o null si no tiene poses */
  const poner = (el, id, k) => { if (!ANIM[id] || !k) return null; const a = ANIM[id](k); return new Motor(el, a.draw, a.base, a.spec); };
  M.POSES = { Motor, poner, tiene: id => !!ANIM[id], EASE };
})(typeof window !== 'undefined' ? window : global);
