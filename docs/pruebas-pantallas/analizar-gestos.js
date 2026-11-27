/* Análisis automático de las acciones y gestos de una mascota con poses (regla técnica 10 de metodo-mascotas.md).
   Con un reloj falso (Playwright clock) recorre, en cada etapa, cada acción del rato, cada gesto al tocar y el salto:
   - sola, sin tocar (mide cuánto dura);
   - con un toque al 25 %, 50 % y 75 % de la acción;
   - con una ráfaga de 5 toques seguidos (cada 120 ms);
   y revisa, al terminar todo:
   - PEGADO: perillas que no volvieron a reposo (manos arriba, «?», hélice, giro…);
   - PARPADEO: una pose de mano que se ve menos de 100 ms entre otras dos (pasa por poses intermedias);
   - SALTO: una perilla visible que cambia de golpe en un cuadro (más de 0,3) justo después de un toque.

   Uso:
     node docs/pruebas-pantallas/analizar-gestos.js MASCOTA [ETAPAS]              → tabla en consola y analisis-MASCOTA.json
     node docs/pruebas-pantallas/analizar-gestos.js MASCOTA tira ETAPA ACCION [MS] [CUADROS] [TOQUE_MS]
        → tira-MASCOTA-ETAPA-ACCION.png: un cuadro cada MS (por defecto 150), y si se da TOQUE_MS, un toque en ese momento.
   ACCION: un nombre de spec.prueba (ola, saluda, quiz…), «gesto1» / «gesto2» (gestos al tocar, en orden) o «salto». */
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const id = args[0] || 'pulpatron';
const modoTira = args[1] === 'tira';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gestos-'));
execFileSync('node', [path.join(__dirname, 'pagina-mascotas.js'), path.join(tmp, 'p.html')]);
fs.writeFileSync(path.join(tmp, 'full.html'), '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>'
  + fs.readFileSync(path.join(tmp, 'p.html'), 'utf8') + '</body></html>');

/* código que corre en la página */
const enPagina = id => {
  /* solo queda la tarjeta de esta mascota (las demás también se animan y harían lento el reloj falso) */
  document.querySelectorAll('.pet').forEach(c => { if (c.dataset.id !== id) { if (c.motor) c.motor.parar(); c.remove(); } });
  window.__A = {
    card: id => document.querySelector(`.pet[data-id="${id}"]`),
    nuevo(id, k) {
      const c = this.card(id); c.querySelector(`.strip button[data-k="${k}"]`).click();
      const m = c.motor; m.proxima = 1e15; m.parpadeo = 1e15; m.cola = []; Object.assign(m.v, m.base);
      m.frames = []; const orig = m.render.bind(m);
      m.render = t => { orig(t); const p = {}; for (const k in m.base) p[k] = m.poseBase[k]; if ('revela' in p) p.pregunta *= 1 - p.revela; /* lo que se ve del «?» */ m.frames.push({ t, p }); };
      return m;
    },
    nombres(id, k) { const m = this.nuevo(id, k), pr = m.spec.prueba; return [...(pr ? Object.keys(pr) : m.spec.acciones.map((_, i) => 'acc' + i)), 'gesto1', 'gesto2', 'salto']; },
    lanzar(m, accion) {
      const ahora = performance.now(); let fin;
      if (accion === 'salto') fin = m.spec.salto(m, 0);
      else if (accion.startsWith('gesto')) { m.nGesto = accion === 'gesto1' ? 0 : 1; fin = m.spec.gesto(m, 0); }
      else if (m.spec.prueba && m.spec.prueba[accion]) fin = m.spec.prueba[accion](m);
      else { const i = +accion.replace('acc', ''); fin = m.spec.acciones[i](m); }
      m.ocupado = fin; return fin - ahora;
    },
    fin(m) { return Math.max(m.ocupado || 0, ...m.cola.map(c => c.t1)); },
    revisar(m, toques) {
      const base = m.base, pegado = [];
      const sel = m.spec.selector || []; /* las que eligen pose no se ven con la mano abajo */
      for (const k in base) { if (sel.includes(k)) continue; const v = m.v[k]; if (typeof v === 'number' && Math.abs(v - base[k]) > .011) pegado.push(`${k}=${+v.toFixed(2)}`); }
      if (m.cola.length) pegado.push(`cola:${m.cola.length}`);
      /* parpadeo de poses de mano: un valor redondeado que dura menos de 100 ms mientras la mano está arriba */
      const parpadeo = [];
      for (const [mano, pose] of [['manoD', 'poseD'], ['manoI', 'poseI']]) {
        if (!(pose in base)) continue;
        let tramo = null; const tramos = [];
        for (const f of m.frames) { if (f.p[mano] < .08) { tramo = null; continue; } const r = Math.round(f.p[pose]);
          if (!tramo || tramo.r !== r) { tramo = { r, t0: f.t, t1: f.t }; tramos.push(tramo); } else tramo.t1 = f.t; }
        for (let i = 1; i < tramos.length - 1; i++) if (tramos[i].t1 - tramos[i].t0 < 100) parpadeo.push(`${pose}:${tramos[i - 1].r}→${tramos[i].r}→${tramos[i + 1].r}`);
      }
      /* saltos bruscos justo después de un toque (en los 3 cuadros siguientes) */
      const VIS = ['manoD', 'manoI', 'junta', 'abre', 'helice', 'posa', 'esconde', 'nube', 'pregunta', 'sx', 'sy', 'aprieta', 'alza', 'curl', 'cuello', 'asoma', 'alaD', 'alaI'];
      const salto = [];
      for (const tq of toques) { const i0 = m.frames.findIndex(f => f.t >= tq);
        for (let i = Math.max(1, i0); i < Math.min(m.frames.length, i0 + 3); i++) for (const k of VIS) if (k in base) {
          const a = m.frames[i - 1].p[k], b = m.frames[i].p[k]; if (Math.abs(b - a) > (/^ala/.test(k) ? 8 : .3)) salto.push(`${k}:${a.toFixed(2)}→${b.toFixed(2)}`); }
        const a = m.frames[Math.max(0, i0 - 1)], b = m.frames[Math.min(m.frames.length - 1, i0 + 2)];
        if (a && b && 'y' in base && Math.abs(b.p.y - a.p.y) > 4) salto.push(`y:${a.p.y.toFixed(1)}→${b.p.y.toFixed(1)}`); }
      return { pegado, parpadeo: [...new Set(parpadeo)], salto: [...new Set(salto)] };
    },
  };
};

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['Pixel 7'], deviceScaleFactor: modoTira ? 2 : 1 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.install();
  await p.goto('file://' + path.join(tmp, 'full.html'));
  await p.clock.runFor(400);
  await p.evaluate(enPagina, id);
  const correr = ms => p.clock.runFor(Math.max(1, Math.round(ms)));

  if (modoTira) {
    const [, , kTxt = '3', accion = 'gesto1', msTxt = '150', nTxt = '16', toqueTxt] = args;
    const k = +kTxt, ms = +msTxt, toque = toqueTxt === undefined ? null : +toqueTxt;
    await p.evaluate(([id, k]) => { window.__m = __A.nuevo(id, k); }, [id, k]);
    await correr(700); /* que termine la entrada (pop) de la tarjeta */
    const card = await p.$(`.pet[data-id="${id}"]`), sc = await card.$('.scene'); await sc.scrollIntoViewIfNeeded();
    const dur = await p.evaluate(a => __A.lanzar(__m, a), accion);
    const n = nTxt === 'auto' ? Math.ceil((dur + 400) / ms) + 1 : +nTxt;
    const fotos = []; let t = 0, tocado = false;
    for (let i = 0; i < n; i++) {
      const f = path.join(tmp, `t${i}.png`); await sc.screenshot({ path: f }); fotos.push({ f, t });
      let paso = ms;
      if (toque !== null && !tocado && t + ms > toque) { await correr(toque - t); await p.evaluate(() => __m.tocar()); tocado = true; paso = ms - (toque - t); }
      await correr(paso); t += ms;
    }
    const cols = Math.min(8, n), img = fotos.map(x => 'data:image/png;base64,' + fs.readFileSync(x.f).toString('base64'));
    const q = await b.newPage({ viewport: { width: 220 * cols, height: 180 } });
    await q.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${cols},220px);background:#fff">${img.map((s, i) =>
      `<div style="position:relative;border:1px solid #eee"><img src="${s}" style="width:220px;height:176px;object-fit:contain"><b style="position:absolute;left:5px;top:3px;font:700 12px sans-serif;color:${toque !== null && fotos[i].t >= toque ? '#c33' : '#456'}">${fotos[i].t} ms</b></div>`).join('')}</body>`);
    const salida = `tira-${id}-${k}-${accion}${toque !== null ? '-toque' + toque : ''}.png`;
    await q.waitForTimeout(100); await q.screenshot({ path: salida, fullPage: true });
    console.log(JSON.stringify({ salida, duracion_ms: Math.round(dur), cuadros: n, errores: errs }));
    await b.close(); fs.rmSync(tmp, { recursive: true, force: true }); return;
  }

  const etapas = (args[1] || '1,2,3,4').split(',').map(Number);
  const res = [];
  for (const k of etapas) {
    const nombres = await p.evaluate(([id, k]) => __A.nombres(id, k), [id, k]);
    for (const accion of nombres) {
      const escenarios = [['sola'], ['toque 25%', .25], ['toque 50%', .5], ['toque 75%', .75], ['5 toques', .3, 5]];
      const fila = { etapa: k, accion, problemas: [] };
      for (const [nom, frac, rafaga = 1] of escenarios) {
        const dur = await p.evaluate(([id, k, a]) => { window.__m = __A.nuevo(id, k); return __A.lanzar(__m, a); }, [id, k, accion]);
        if (nom === 'sola') fila.dura_ms = Math.round(dur);
        const toques = [];
        if (frac !== undefined) {
          await correr(dur * frac);
          for (let r = 0; r < rafaga; r++) { { const [hizo, tq] = await p.evaluate(() => [__m.tocar(), performance.now()]); if (!/espera/.test(hizo)) toques.push(tq); } /* los toques guardados no cuentan para SALTO */ if (r < rafaga - 1) await correr(120); }
        }
        /* esperar a que termine todo, también el toque guardado que arranca después del gesto */
        for (let vuelta = 0; vuelta < 8; vuelta++) { const resto = await p.evaluate(() => __A.fin(__m) - performance.now()); await correr(Math.max(0, resto) + 900);
          if (await p.evaluate(() => !__m.pendiente && !__m.cola.length)) break; }
        const r = await p.evaluate(tq => __A.revisar(__m, tq), toques);
        for (const [tipo, lista] of Object.entries(r)) if (lista.length) fila.problemas.push(`${nom} · ${tipo}: ${lista.join(', ')}`);
      }
      res.push(fila);
      console.log(`e${k} ${accion.padEnd(8)} ${String(fila.dura_ms).padStart(5)} ms  ${fila.problemas.length ? '✗ ' + fila.problemas.join(' | ') : '✓'}`);
    }
  }
  fs.writeFileSync(`analisis-${id}.json`, JSON.stringify({ id, res, errores: errs }, null, 1));
  const malos = res.filter(r => r.problemas.length).length;
  console.log(`\n${res.length} acciones revisadas en ${etapas.length} etapas · con problemas: ${malos} · errores de página: ${errs.length}`);
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
})();
