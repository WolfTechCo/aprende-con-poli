/* Revisión de FORMA de una mascota con poses, en movimiento (pedido de la dueña, 27-11-2026).
   analizar-gestos.js mira las perillas (lo pegado, lo que parpadea); este mira el DIBUJO cuadro a cuadro mientras hace
   cada acción y cada gesto, y avisa:
   - LARGO: una pieza alargada (brazo, pata, cuello, antena…) que se estira o se encoge mucho respecto de su reposo;
   - TAMAÑO: una pieza que se ve mucho más grande o más chica que en reposo (en pantalla);
   - FUERA: algo del dibujo que se sale del escenario (se corta);
   - SUELTA: una pieza que en reposo toca el cuerpo y en movimiento queda separada (flota sola).
   Con un reloj falso y azar fijo, así cada acción se repite igual. Al final arma UNA lámina con el cuadro de cada aviso
   y la pieza marcada en rojo, para mirar de una vez.

   Uso: node docs/pruebas-pantallas/revisar-forma.js MASCOTA [ETAPAS] [SALIDA.png]
   Deja forma-MASCOTA.json (todos los avisos) y la lámina (por defecto forma-MASCOTA.png). */
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');

const [id = 'tortugono', etapasTxt = '1,2,3,4', salida = `forma-${id}.png`] = process.argv.slice(2);
const etapas = etapasTxt.split(',').map(Number);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'forma-'));
execFileSync('node', [path.join(__dirname, 'pagina-mascotas.js'), path.join(tmp, 'p.html')]);
fs.writeFileSync(path.join(tmp, 'full.html'), '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>'
  + fs.readFileSync(path.join(tmp, 'p.html'), 'utf8') + '</body></html>');

const LIM = { largoMax: 1.4, largoMin: .65, tamMax: 1.5, tamMin: .6, minimo: 3, suelta: 1.2 };

const enPagina = id => {
  document.querySelectorAll('.pet').forEach(c => { if (c.dataset.id !== id) { if (c.motor) c.motor.parar(); c.remove(); } });
  /* azar repetible: cada acción se ensaya y se vuelve a fotografiar igual */
  let semilla = 1; window.__semilla = s => { semilla = s; }; Math.random = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };
  const GEO = 'path,circle,ellipse,rect,polygon,line,text';
  const opac = el => { let o = 1; for (let e = el; e && e.tagName !== 'svg'; e = e.parentNode) { const a = e.getAttribute && e.getAttribute('opacity'); if (a !== null && a !== undefined) o *= +a;
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= +cs.opacity; } return o; };
  const nombre = (el, i) => { const ids = []; for (let e = el; e && !(e.classList && e.classList.contains('mv')); e = e.parentNode) if (e.id) { ids.push(e.id.replace(/^k[a-z]?\d+-/, '')); break; }
    return `${el.tagName}#${i}${ids.length ? '(' + ids[0] + ')' : ''}${el.getAttribute('class') ? '.' + el.getAttribute('class') : ''}`; };
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
  await p.evaluate(enPagina, id);
  const correr = ms => p.clock.runFor(Math.max(1, Math.round(ms)));
  const avisos = [], altos = [];
  for (const k of etapas) {
    const nombres = await p.evaluate(k => __F.nombres(k), k);
    /* reposo: varias muestras (respira) para tener el rango normal de cada pieza */
    await p.evaluate(k => { __semilla(7); __F.nuevo(k); }, k); await correr(700);
    const rep = []; for (let i = 0; i < 12; i++) { rep.push(await p.evaluate(() => __F.medir())); await correr(160); }
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
  const elegidos = avisos.sort((a, b) => b.valor - a.valor).slice(0, 32);
  for (const a of elegidos) {
    const nombres = await p.evaluate(k => __F.nombres(k), a.etapa); const sem = 11 + nombres.indexOf(a.accion);
    await p.evaluate(([k, s]) => { __semilla(s); __F.nuevo(k); }, [a.etapa, sem]); await correr(700); await p.evaluate(s => __semilla(s), sem);
    await p.evaluate(x => __F.lanzar(x), a.accion);
    for (let t = 0; t < a.t; t += 50) await correr(50);
    await p.evaluate(c => __F.marcar(c), a.caja);
    const f = path.join(tmp, `a${fotos.length}.png`); await sc.screenshot({ path: f }); fotos.push({ f, a });
    await p.evaluate(() => __F.marcar(null));
  }
  if (fotos.length) {
    const cols = Math.min(4, fotos.length), img = fotos.map(x => 'data:image/png;base64,' + fs.readFileSync(x.f).toString('base64'));
    const q = await br.newPage({ viewport: { width: 300 * cols, height: 260 } });
    await q.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${cols},300px);background:#fff;font:700 11px sans-serif">${img.map((s, i) => { const a = fotos[i].a;
      return `<div style="position:relative;border:1px solid #eee"><img src="${s}" style="width:300px;height:225px;object-fit:contain;display:block"><div style="padding:2px 5px;color:#c11">${a.tipo} · e${a.etapa} ${a.accion} ${a.t} ms</div><div style="padding:0 5px 3px;color:#456">${a.pieza}: ${a.txt}</div></div>`; }).join('')}</body>`);
    await q.waitForTimeout(150); await q.screenshot({ path: salida, fullPage: true });
  }
  fs.writeFileSync(`forma-${id}.json`, JSON.stringify({ id, avisos: avisos.map(({ caja, ...r }) => r), errores: errs }, null, 1));
  /* alto: lo más alto en reposo y en movimiento por etapa (el escenario empieza en ${-64}) */
  etapas.forEach(k => { const a = altos.filter(x => x.etapa === k); const t = a.reduce((m, x) => x.tope < m.tope ? x : m, a[0]); console.log(`alto e${k}: reposo ${a[0].reposo} · lo más alto ${t.tope} (${t.accion})`); });
  console.log(`\n${avisos.length} avisos · lámina: ${fotos.length ? salida : '(sin avisos)'} · errores de página: ${errs.length}`);
  await br.close(); fs.rmSync(tmp, { recursive: true, force: true });
})();
