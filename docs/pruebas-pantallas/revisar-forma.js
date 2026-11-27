/* Revisión de FORMA de una mascota con poses, en movimiento (pedido de la dueña, 27-11-2026).
   analizar-gestos.js mira las perillas (lo pegado, lo que parpadea); este mira el DIBUJO cuadro a cuadro mientras hace
   cada acción y cada gesto, y avisa:
   - LARGO: una pieza alargada (brazo, pata, cuello, antena…) que se estira o se encoge mucho respecto de su reposo;
   - TAMAÑO: una pieza que se ve mucho más grande o más chica que en reposo (en pantalla);
   - FUERA: algo del dibujo que se sale del escenario (se corta);
   - SUELTA: una pieza que en reposo toca el cuerpo y en movimiento queda separada (flota sola);
   - TAPA: los ojos o el contenido (números, letras, «?», pintas) quedan cubiertos por otra pieza (patas, brazos,
     pintas sobre la cara…). Lo importante se reconoce solo: ojos (relleno km-ojo), textos y lo que la mascota marque
     con data-imp="contenido". No cuentan los brillos del mismo ojo ni lo casi transparente;
   - CONTRASTE: una pieza casi del mismo color que lo que tiene detrás, de otra parte del cuerpo (pintas negras sobre
     cabeza negra, antena oscura sobre cara oscura), y que tampoco se distingue por su contorno. Compara colores en
     Lab (ΔE) en varios puntos de la pieza; no compara piezas hermanas (pata con pata, tapa con tapa).
   Lo que ya pasa en reposo se avisa una vez (acción «reposo») y no se repite en cada acción.
   Con un reloj falso y azar fijo, así cada acción se repite igual. Al final arma UNA lámina con el cuadro de cada aviso
   y la pieza marcada en rojo, para mirar de una vez.

   Uso: node docs/pruebas-pantallas/revisar-forma.js MASCOTA [ETAPAS] [SALIDA.png]
   FORMA_GRANDE=1: lámina con fotos al doble (para mirar letras y detalles). FORMA_SOLO=TAPA,CONTRASTE: lámina solo con esos tipos. FORMA_PRUEBA=1: autoprueba de TAPA y CONTRASTE.
   Deja forma-MASCOTA.json (todos los avisos) y la lámina (por defecto forma-MASCOTA.png). */
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');

const [id = 'tortugono', etapasTxt = '1,2,3,4', salida = `forma-${id}.png`] = process.argv.slice(2);
const etapas = etapasTxt.split(',').map(Number);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'forma-'));
execFileSync('node', [path.join(__dirname, 'pagina-mascotas.js'), path.join(tmp, 'p.html')]);
fs.writeFileSync(path.join(tmp, 'full.html'), '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>'
  + fs.readFileSync(path.join(tmp, 'p.html'), 'utf8') + '</body></html>');

const LIM = { largoMax: 1.4, largoMin: .65, tamMax: 1.5, tamMin: .6, minimo: 3, suelta: 1.2,
  tapaOjo: .35, tapaCont: .25, /* parte cubierta desde la que avisa */ deltaE: 14, contMin: .6 /* ΔE bajo eso en al menos 60 % de los puntos */ };

const enPagina = ([id, LIM]) => {
  document.querySelectorAll('.pet').forEach(c => { if (c.dataset.id !== id) { if (c.motor) c.motor.parar(); c.remove(); } });
  /* azar repetible: cada acción se ensaya y se vuelve a fotografiar igual */
  let semilla = 1; window.__semilla = s => { semilla = s; }; Math.random = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };
  const GEO = 'path,circle,ellipse,rect,polygon,line,text';
  const opac = el => { let o = 1; for (let e = el; e && e.tagName !== 'svg'; e = e.parentNode) { const a = e.getAttribute && e.getAttribute('opacity'); if (a !== null && a !== undefined) o *= +a;
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= +cs.opacity; } return o; };
  const nombre = (el, i) => { const ids = []; for (let e = el; e && !(e.classList && e.classList.contains('mv')); e = e.parentNode) if (e.id) { ids.push(e.id.replace(/^k[a-z]?\d+-/, '')); break; }
    return `${el.tagName}#${i}${ids.length ? '(' + ids[0] + ')' : ''}${el.getAttribute('class') ? '.' + el.getAttribute('class') : ''}`; };
  /* color de una pieza: su relleno (si es degradado, el promedio de sus paradas visibles) o su trazo si no tiene relleno */
  const rgb = t => { const m = String(t).match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return v.length > 3 && v[3] < .2 ? null : v.slice(0, 3); };
  const deGrad = ref => { const g = document.getElementById(ref); if (!g) return null; const st = [...g.querySelectorAll('stop')].map(x => { const cs = getComputedStyle(x); return +cs.stopOpacity < .3 ? null : rgb(cs.stopColor); }).filter(Boolean);
    return st.length ? [0, 1, 2].map(i => st.reduce((a, c) => a + c[i], 0) / st.length) : null; };
  const pinta = v => { if (!v || v === 'none') return null; const u = v.match(/url\("?#([^")]+)"?\)/); return u ? deGrad(u[1]) : rgb(v); };
  const relleno = el => { const cs = getComputedStyle(el); return +cs.fillOpacity > .3 && pinta(cs.fill); }; /* solo tapa lo que tiene relleno visible (no un marco punteado) */
  const trazo = el => { const cs = getComputedStyle(el); return parseFloat(cs.strokeWidth) >= .5 && +cs.strokeOpacity > .3 ? pinta(cs.stroke) : null; };
  const col = el => { const cs = getComputedStyle(el); return (+cs.fillOpacity > .3 && pinta(cs.fill)) || pinta(cs.stroke); };
  const lab = ([r, g, b]) => { const l = c => (c /= 255, c > .04045 ? Math.pow((c + .055) / 1.055, 2.4) : c / 12.92); const [R, G, B] = [l(r), l(g), l(b)];
    const X = (R * .4124 + G * .3576 + B * .1805) / .95047, Y = R * .2126 + G * .7152 + B * .0722, Z = (R * .0193 + G * .1192 + B * .9505) / 1.08883;
    const fn = t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; return [116 * fn(Y) - 16, 500 * (fn(X) - fn(Y)), 200 * (fn(Y) - fn(Z))]; };
  const dE = (a, b) => { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
  /* para que el navegador diga qué pieza se ve en cada punto, todas deben poder «tocarse» */
  const st = document.createElement('style'); st.textContent = '.pet .scene svg, .pet .scene svg * { pointer-events: auto !important }'; document.head.appendChild(st);
  window.__F = {
    card: () => document.querySelector(`.pet[data-id="${id}"]`),
    nuevo(k) { this.fk = 0; const c = this.card(); c.querySelector(`.strip button[data-k="${k}"]`).click(); const m = c.motor; m.proxima = 1e15; m.parpadeo = 1e15; m.cola = []; Object.assign(m.v, m.base); return (window.__m = m); },
    nombres(k) { const m = this.nuevo(k), pr = m.spec.prueba; return [...(pr ? Object.keys(pr) : m.spec.acciones.map((_, i) => 'acc' + i)), 'gesto1', 'gesto2', 'salto']; },
    lanzar(a) { const m = __m, ahora = performance.now(); let fin;
      if (a === 'salto') fin = m.spec.salto(m, 0); else if (a.startsWith('gesto')) { m.nGesto = a === 'gesto1' ? 0 : 1; fin = m.spec.gesto(m, 0); }
      else if (m.spec.prueba && m.spec.prueba[a]) fin = m.spec.prueba[a](m); else fin = m.spec.acciones[+a.replace('acc', '')](m);
      m.ocupado = fin; return fin - ahora; },
    /* mide cada pieza visible del dibujo, en unidades del escenario */
    medir() {
      const svg = this.card().querySelector('.scene svg'), vb = svg.viewBox.baseVal, sr = svg.getBoundingClientRect(), f = vb.width / sr.width;
      /* cada pieza se reconoce por una marca propia (no por su lugar: hay piezas que se cambian de capa, como los brazos en la hélice) */
      const els = [...svg.querySelectorAll('.mv')[0].querySelectorAll(GEO)], out = [];
      els.forEach(el => { if (el.__fk === undefined) el.__fk = this.fk++; });
      els.sort((a, b) => a.__fk - b.__fk);
      els.forEach((el) => { const i = el.__fk; const o = opac(el); if (o < .08 || /km-piso|km-glow/.test(el.getAttribute('fill') || '') || el.closest('.tw')) { out[i] = null; return; } /* sombra del suelo, aura y destellos: no son piezas */
        let r = el.getBoundingClientRect(); if (!r.width && !r.height) { out[i] = null; return; }
        /* si va dentro de un recorte (clipPath, como el cascarón), solo cuenta lo que se ve */
        const cl = el.closest('[clip-path]'); if (cl) { const ref = (cl.getAttribute('clip-path').match(/#([^)]+)/) || [])[1], cp = ref && document.getElementById(ref);
          if (cp && cp.firstElementChild) { const c = cp.firstElementChild.getBoundingClientRect(); const x0 = Math.max(r.left, c.left), y0 = Math.max(r.top, c.top), x1 = Math.min(r.right, c.right), y1 = Math.min(r.bottom, c.bottom);
            if (x1 <= x0 || y1 <= y0) { out[i] = null; return; } r = { left: x0, top: y0, right: x1, bottom: y1, width: x1 - x0, height: y1 - y0 }; } }
        let len = 0; if (el.tagName === 'path' && el.getTotalLength) { try { len = el.getTotalLength(); /* en pantalla: por la escala del grupo */ const ctm = el.getScreenCTM(); if (ctm) len *= Math.sqrt(Math.abs(ctm.a * ctm.d - ctm.b * ctm.c)) * f; } catch (e) {} }
        out[i] = ({ n: nombre(el, i), x0: (r.left - sr.left) * f + vb.x, y0: (r.top - sr.top) * f + vb.y, x1: (r.right - sr.left) * f + vb.x, y1: (r.bottom - sr.top) * f + vb.y, len, o }); });
      return { piezas: out, vb: [vb.x, vb.y, vb.x + vb.width, vb.y + vb.height] };
    },
    /* TAPA y CONTRASTE: se miran con lo que el navegador pinta en cada punto (elementsFromPoint), de arriba hacia abajo */
    tapa(conContraste) {
      const svg = this.card().querySelector('.scene svg'), vb = svg.viewBox.baseVal, sr = svg.getBoundingClientRect(), f = vb.width / sr.width;
      const raiz = svg.querySelectorAll('.mv')[0], out = [];
      const parte = el => { for (let e = el.parentNode; e && e !== raiz; e = e.parentNode) if (e.id) return e; return raiz; };
      const raizId = p => p.id ? p.id.replace(/^k[a-z]?\d+-/, '').replace(/\d+$/, '') : '';
      const hermanas = (a, b) => a !== raiz && b !== raiz && raizId(a) && raizId(a) === raizId(b) && /\d$/.test(a.id) && /\d$/.test(b.id);
      const ignora = el => !raiz.contains(el) || el.id === 'marca' || el.closest('.tw') || /km-piso|km-glow/.test(el.getAttribute('fill') || '') || el.classList.contains('aura') || opac(el) < .15;
      const brillo = el => { const c = col(el); return c && c[0] > 235 && c[1] > 235 && c[2] > 235 && opac(el) < .75; };
      const tipoImp = el => /km-ojo/.test(el.getAttribute('fill') || '') ? 'ojo' : el.tagName === 'text' || el.closest('[data-imp]') ? 'contenido' : null;
      const puntos = (r, n) => { const P = []; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) P.push([r.left + r.width * (a + .5) / n, r.top + r.height * (b + .5) / n]); return P; };
      const pila = ([x, y]) => document.elementsFromPoint(x, y).filter(e => e instanceof SVGGeometryElement || e.tagName === 'text');
      const caja = r => ({ x0: (r.left - sr.left) * f + vb.x, y0: (r.top - sr.top) * f + vb.y, x1: (r.right - sr.left) * f + vb.x, y1: (r.bottom - sr.top) * f + vb.y });
      const els = [...raiz.querySelectorAll(GEO)];
      els.forEach(el => { if (el.__fk === undefined) el.__fk = this.fk++; });
      for (const el of els) {
        if (ignora(el) || opac(el) < .3) continue;
        const r = el.getBoundingClientRect(); if (r.width * f < 1 || r.height * f < 1) continue; /* ojo cerrado o pieza mínima */
        const imp = tipoImp(el), miParte = parte(el);
        if (imp) { /* TAPA */
          let dentro = 0, tapados = 0; const quien = {};
          for (const pt of puntos(r, 5)) { const st = pila(pt), yo = st.indexOf(el); if (yo < 0) continue; dentro++;
            const encima = st.slice(0, yo).find(e => !ignora(e) && !brillo(e) && (e.tagName === 'text' || relleno(e)) && parte(e) !== miParte && !el.contains(e) && !(imp === 'ojo' && e.closest && miParte.contains(e)));
            if (encima) { tapados++; const n = nombre(encima, encima.__fk); quien[n] = (quien[n] || 0) + 1; } }
          const lim = imp === 'ojo' ? LIM.tapaOjo : LIM.tapaCont;
          if (dentro >= 3 && tapados / dentro > lim) { const q = Object.entries(quien).sort((a, b) => b[1] - a[1])[0][0];
            out.push({ i: el.__fk, n: nombre(el, el.__fk), tipo: 'TAPA', valor: tapados / dentro, txt: `${imp === 'ojo' ? 'ojo' : 'contenido'} tapado ${Math.round(100 * tapados / dentro)} % por ${q}`, caja: caja(r) }); }
        }
        if (!conContraste || opac(el) < .6 || brillo(el)) continue;
        if (!imp && Math.max(r.width, r.height) * f < 2) continue;
        const yoC = col(el); if (!yoC) continue;
        let n = 0, bajos = 0; const quien = {};
        for (const pt of puntos(r, 3)) { const st = pila(pt), yo = st.indexOf(el); if (yo < 0) continue;
          const debajo = st.slice(yo + 1).find(e => !ignora(e) && !el.contains(e) && opac(e) >= .3 && !brillo(e)); if (!debajo) continue;
          const suParte = parte(debajo);
          if (suParte === miParte || suParte.contains(el) && !imp) continue; /* misma parte (sus capas de volumen) */
          if (hermanas(suParte, miParte)) continue; /* pata con pata, tapa con tapa: iguales a propósito */
          const otro = col(debajo); if (!otro) continue; n++;
          const borde = trazo(el); /* con un contorno que sí se distingue, la pieza se ve igual (regla Gel: contorno más oscuro) */
          if (dE(yoC, otro) < LIM.deltaE && (!borde || dE(borde, otro) < LIM.deltaE)) { bajos++; const nn = nombre(debajo, debajo.__fk); quien[nn] = (quien[nn] || 0) + 1; } }
        if (n >= 2 && bajos / n >= LIM.contMin) { const q = Object.entries(quien).sort((a, b) => b[1] - a[1])[0][0];
          out.push({ i: el.__fk, n: nombre(el, el.__fk), tipo: 'CONTRASTE', valor: 1 + bajos / n, txt: `casi del color de ${q} (ΔE < ${LIM.deltaE} en ${bajos} de ${n} puntos)`, caja: caja(r) }); }
      }
      return out;
    },
    marcar(b) { const svg = this.card().querySelector('.scene svg'); let g = svg.querySelector('#marca'); if (g) g.remove(); if (!b) return;
      g = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); g.id = 'marca'; const p = 1.2;
      Object.entries({ x: b.x0 - p, y: b.y0 - p, width: b.x1 - b.x0 + 2 * p, height: b.y1 - b.y0 + 2 * p, rx: 1.5, fill: 'none', stroke: '#e0102a', 'stroke-width': .8, 'stroke-dasharray': '2 1' }).forEach(([k, v]) => g.setAttribute(k, v)); svg.appendChild(g); },
  };
};

const toca = (a, b) => a && b && a.x0 <= b.x1 + LIM.suelta && b.x0 <= a.x1 + LIM.suelta && a.y0 <= b.y1 + LIM.suelta && b.y0 <= a.y1 + LIM.suelta;

(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({ ...devices['Pixel 7'], deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.install(); await p.goto('file://' + path.join(tmp, 'full.html')); await p.clock.runFor(400);
  await p.evaluate(enPagina, [id, LIM]);
  await (await p.$(`.pet[data-id="${id}"] .scene`)).scrollIntoViewIfNeeded(); /* elementsFromPoint solo ve lo que está en pantalla */
  const correr = ms => p.clock.runFor(Math.max(1, Math.round(ms)));
  /* autoprueba (FORMA_PRUEBA=1): tapa un ojo con una mancha verde y encima pone un punto casi del mismo verde; ambos deben avisar */
  if (process.env.FORMA_PRUEBA) {
    await p.evaluate(k => { __semilla(7); __F.nuevo(k); }, etapas[0]); await correr(700);
    const r = await p.evaluate(() => { const svg = __F.card().querySelector('.scene svg'), mv = svg.querySelector('.mv'), ojo = mv.querySelector('[fill*="km-ojo"]'), NS = 'http://www.w3.org/2000/svg';
      __m.parar && __m.parar(); const b = ojo.getBBox(), m = ojo.getCTM(), inv = mv.getCTM().inverse().multiply(m), pt = new DOMPoint(b.x + b.width / 2, b.y + b.height / 2).matrixTransform(inv);
      const g = document.createElementNS(NS, 'g'); g.id = 'kx1-mancha'; const c = document.createElementNS(NS, 'circle'); Object.entries({ cx: pt.x, cy: pt.y, r: 4, fill: '#3a8a3a' }).forEach(([k, v]) => c.setAttribute(k, v)); g.appendChild(c);
      const g2 = document.createElementNS(NS, 'g'); g2.id = 'kx1-punto'; const d = document.createElementNS(NS, 'circle'); Object.entries({ cx: pt.x + 1, cy: pt.y - 1, r: 1.6, fill: '#3f8f3c' }).forEach(([k, v]) => d.setAttribute(k, v)); g2.appendChild(d);
      mv.appendChild(g); mv.appendChild(g2); return __F.tapa(true).map(a => a.tipo + ' ' + a.n + ': ' + a.txt); });
    console.log(r.join('\n') || '(nada)'); const ok = r.some(x => x.startsWith('TAPA')) && r.some(x => x.startsWith('CONTRASTE') && x.includes('punto'));
    console.log(ok ? '✓ autoprueba: TAPA y CONTRASTE avisan' : '✗ autoprueba falló'); await br.close(); process.exit(ok ? 0 : 1);
  }
  const avisos = [], altos = [];
  for (const k of etapas) {
    const nombres = await p.evaluate(k => __F.nombres(k), k);
    /* reposo: varias muestras (respira) para tener el rango normal de cada pieza */
    await p.evaluate(k => { __semilla(7); __F.nuevo(k); }, k); await correr(700);
    const rep = [], enReposo = {}; for (let i = 0; i < 12; i++) { rep.push(await p.evaluate(() => __F.medir()));
      (await p.evaluate(c => __F.tapa(c), i % 3 === 0)).forEach(a => { const key = a.i + a.tipo; if (!enReposo[key] || a.valor > enReposo[key].valor) enReposo[key] = { etapa: k, accion: 'reposo', pieza: a.n, tipo: a.tipo, valor: a.valor, txt: a.txt, t: i * 160, caja: a.caja }; });
      await correr(160); }
    Object.values(enReposo).forEach(a => avisos.push(a));
    console.log(`e${k} reposo     ${Object.keys(enReposo).length ? '⚠ ' + Object.values(enReposo).map(a => `${a.tipo} ${a.pieza} ${a.txt}`).join(' | ') : '✓'}`);
    const vb = rep[0].vb, nP = Math.max(...rep.map(r => r.piezas.length));
    const R = [...Array(nP)].map((_, i) => { const v = rep.map(r => r.piezas[i]).filter(Boolean); if (!v.length) return null;
      const dim = v.map(b => Math.max(b.x1 - b.x0, b.y1 - b.y0)), len = v.map(b => b.len);
      return { n: v[0].n, dMin: Math.min(...dim), dMax: Math.max(...dim), lMin: Math.min(...len), lMax: Math.max(...len), caja: v[0] }; });
    /* con quién se toca cada pieza en reposo (para ver si después se suelta) */
    const vecinos = R.map((a, i) => a ? R.map((b, j) => j !== i && b && toca(a.caja, b.caja) ? j : -1).filter(j => j >= 0) : []);
    for (const accion of nombres) {
      const sem = 11 + nombres.indexOf(accion);
      await p.evaluate(([k, s]) => { __semilla(s); __F.nuevo(k); }, [k, sem]); await correr(700);
      await p.evaluate(s => __semilla(s), sem);
      const dur = await p.evaluate(a => __F.lanzar(a), accion);
      const peor = {}; /* por pieza y tipo: el cuadro más extremo */ let topeAcc = 0;
      for (let t = 0; t <= dur + 300; t += 50) {
        const { piezas } = await p.evaluate(() => __F.medir()); for (let i = 0; i < piezas.length; i++) if (piezas[i] === undefined) piezas[i] = null;
        piezas.forEach((b, i) => { if (!b) return; const r = R[i]; if (b.o > .3) topeAcc = Math.min(topeAcc, b.y0);
          const nota = (tipo, valor, txt) => { const key = i + tipo; if (!peor[key] || valor > peor[key].valor) peor[key] = { etapa: k, accion, pieza: b.n, tipo, valor, txt, t, caja: b }; };
          const fuera = Math.max(vb[0] - b.x0, vb[1] - b.y0, b.x1 - vb[2], b.y1 - vb[3]);
          if (fuera > .5 && b.o > .3) nota('FUERA', fuera, `se sale ${fuera.toFixed(1)} del escenario`);
          if (!r) return; /* pieza que en reposo no se ve (aparece en la acción): solo se mira si se sale */
          const dim = Math.max(b.x1 - b.x0, b.y1 - b.y0);
          if (r.dMax > LIM.minimo) { if (dim > r.dMax * LIM.tamMax) nota('TAMAÑO', dim / r.dMax, `crece ×${(dim / r.dMax).toFixed(2)}`); if (dim < r.dMin * LIM.tamMin) nota('TAMAÑO', r.dMin / dim, `se achica ×${(dim / r.dMin).toFixed(2)}`); }
          if (r.lMax > LIM.minimo && b.len) { if (b.len > r.lMax * LIM.largoMax) nota('LARGO', b.len / r.lMax, `se estira ×${(b.len / r.lMax).toFixed(2)}`); if (b.len < r.lMin * LIM.largoMin) nota('LARGO', r.lMin / b.len, `se encoge ×${(b.len / r.lMin).toFixed(2)}`); }
          if (vecinos[i].length && b.o > .3 && !vecinos[i].some(j => toca(b, piezas[j]))) nota('SUELTA', 1, 'queda separada de lo que tocaba');
        });
        (await p.evaluate(c => __F.tapa(c), t % 200 === 0)).forEach(a => { if (enReposo[a.i + a.tipo]) return; /* ya avisado en reposo */
          const key = a.i + a.tipo; if (!peor[key] || a.valor > peor[key].valor) peor[key] = { etapa: k, accion, pieza: a.n, tipo: a.tipo, valor: a.valor, txt: a.txt, t, caja: a.caja }; });
        await correr(50);
      }
      Object.values(peor).forEach(a => avisos.push(a));
      altos.push({ etapa: k, accion, reposo: +Math.min(...R.filter(Boolean).map(r => r.caja.y0)).toFixed(1), tope: +topeAcc.toFixed(1) });
      const mios = Object.values(peor);
      console.log(`e${k} ${accion.padEnd(10)} ${Math.round(dur)} ms  ${mios.length ? '⚠ ' + mios.map(a => `${a.tipo} ${a.pieza} ${a.txt} (${a.t} ms)`).join(' | ') : '✓'}`);
    }
  }
  /* lámina: una foto por aviso (agrupando la misma pieza y tipo en la misma acción), con la pieza marcada */
  const fotos = [];
  const card = await p.$(`.pet[data-id="${id}"]`), sc = await card.$('.scene'); await sc.scrollIntoViewIfNeeded();
  /* hasta 8 fotos por tipo de aviso (así TAPA y CONTRASTE no quedan fuera por los estirones), 32 en total */
  const solo = process.env.FORMA_SOLO ? process.env.FORMA_SOLO.split(',') : null, cupo = {}, elegidos = [...avisos].filter(a => !solo || solo.includes(a.tipo)).sort((a, b) => b.valor - a.valor).filter(a => (cupo[a.tipo] = (cupo[a.tipo] || 0) + 1) <= 8).slice(0, 32);
  for (const a of elegidos) {
    if (a.accion === 'reposo') { await p.evaluate(k => { __semilla(7); __F.nuevo(k); }, a.etapa); await correr(700); for (let t = 0; t < a.t; t += 160) await correr(160); }
    else { const nombres = await p.evaluate(k => __F.nombres(k), a.etapa); const sem = 11 + nombres.indexOf(a.accion);
      await p.evaluate(([k, s]) => { __semilla(s); __F.nuevo(k); }, [a.etapa, sem]); await correr(700); await p.evaluate(s => __semilla(s), sem);
      await p.evaluate(x => __F.lanzar(x), a.accion);
      for (let t = 0; t < a.t; t += 50) await correr(50); }
    await p.evaluate(c => __F.marcar(c), a.caja);
    const f = path.join(tmp, `a${fotos.length}.png`); await sc.screenshot({ path: f }); fotos.push({ f, a });
    await p.evaluate(() => __F.marcar(null));
  }
  if (fotos.length) {
    const W = process.env.FORMA_GRANDE ? 600 : 300, cols = Math.min(process.env.FORMA_GRANDE ? 2 : 4, fotos.length), img = fotos.map(x => 'data:image/png;base64,' + fs.readFileSync(x.f).toString('base64'));
    const q = await br.newPage({ viewport: { width: W * cols, height: 260 } });
    await q.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${cols},${W}px);background:#fff;font:700 11px sans-serif">${img.map((s, i) => { const a = fotos[i].a;
      return `<div style="position:relative;border:1px solid #eee"><img src="${s}" style="width:${W}px;height:${W * .75}px;object-fit:contain;display:block"><div style="padding:2px 5px;color:#c11">${a.tipo} · e${a.etapa} ${a.accion} ${a.t} ms</div><div style="padding:0 5px 3px;color:#456">${a.pieza}: ${a.txt}</div></div>`; }).join('')}</body>`);
    await q.waitForTimeout(150); await q.screenshot({ path: salida, fullPage: true });
  }
  fs.writeFileSync(`forma-${id}.json`, JSON.stringify({ id, avisos: avisos.map(({ caja, ...r }) => r), errores: errs }, null, 1));
  /* alto: lo más alto en reposo y en movimiento por etapa (el escenario empieza en ${-64}) */
  etapas.forEach(k => { const a = altos.filter(x => x.etapa === k); const t = a.reduce((m, x) => x.tope < m.tope ? x : m, a[0]); console.log(`alto e${k}: reposo ${a[0].reposo} · lo más alto ${t.tope} (${t.accion})`); });
  console.log(`\n${avisos.length} avisos · lámina: ${fotos.length ? salida : '(sin avisos)'} · errores de página: ${errs.length}`);
  await br.close(); fs.rmSync(tmp, { recursive: true, force: true });
})();
