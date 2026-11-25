/* Lámina de poses fijas de una mascota, en una sola pasada (revisión antes de mostrar a la dueña).
   Hace todo lo que antes se hacía con scripts sueltos: arma la página, abre un teléfono (Pixel 7),
   fija cada pose pedida, la captura, junta todo en UNA imagen, mide cuadros por segundo y prueba
   un toque de dedo. Así se mira una sola imagen por ronda.

   Uso:
     node docs/pruebas-pantallas/lamina-poses.js MASCOTA [ETAPAS] [POSES_JSON] [SALIDA.png]
   Ejemplos:
     node docs/pruebas-pantallas/lamina-poses.js cubuho
     node docs/pruebas-pantallas/lamina-poses.js cubuho 1,4 '[{},{"teta":90},{"teta":180},{"alaD":38}]'
   - MASCOTA: tortugono | cubuho | cienpiecito | pulpatron | chinitabla
   - ETAPAS: lista 0..4 (0 huevo, 1 cría, 2 joven, 3 adulta, 4 brillante; por defecto 1,2,3,4). Sin poses fijas, cada etapa se captura en reposo.
   - POSES_JSON: lista de objetos con perillas del motor (las de su *_BASE en boceto-poses.js).
   Salida: una fila por etapa, una columna por pose; en consola, cuadros por segundo y si el toque hizo algo. */
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');

const [id = 'cubuho', etapasTxt = '1,2,3,4', posesTxt = '[{}]', salida = `lamina-${id}.png`] = process.argv.slice(2);
const etapas = etapasTxt.split(',').map(Number), poses = JSON.parse(posesTxt);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lamina-'));
execFileSync('node', [path.join(__dirname, 'pagina-mascotas.js'), path.join(tmp, 'p.html')]);
fs.writeFileSync(path.join(tmp, 'full.html'), '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>'
  + fs.readFileSync(path.join(tmp, 'p.html'), 'utf8') + '</body></html>');

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['Pixel 7'], deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(tmp, 'full.html')); await p.waitForTimeout(300);
  const card = await p.$(`.pet[data-id="${id}"]`); if (!card) throw new Error('No existe la mascota ' + id);
  const sc = await card.$('.scene'); await sc.scrollIntoViewIfNeeded();
  const etapa = k => card.$(`.strip button[data-k="${k}"]`);
  const fija = v => p.evaluate(([id, v]) => { const m = document.querySelector(`.pet[data-id="${id}"]`).motor; if (!m) return false;
    m.proxima = 1e15; m.parpadeo = 1e15; m.ocupado = 0; m.cola = []; m.modo = 'quieta'; Object.assign(m.v, m.base, v); return true; }, [id, v]);
  const fotos = [];
  for (const k of etapas) {
    await (await etapa(k)).tap(); await p.waitForTimeout(150);
    for (const v of poses) { const hay = await fija(v); await p.waitForTimeout(90); const f = path.join(tmp, `f-${k}-${fotos.length}.png`);
      await sc.screenshot({ path: f }); fotos.push({ k, f, hay }); }
  }
  /* cuadros por segundo en la etapa más grande, con vida */
  await (await etapa(etapas[etapas.length - 1])).tap(); await p.waitForTimeout(300);
  const fps = await p.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = t => { n++; t - t0 < 2000 ? requestAnimationFrame(f) : r(Math.round(n / 2)); }; requestAnimationFrame(f); }));
  /* toque de dedo: ¿cambia el dibujo? */
  const antes = await card.$eval('.scene', e => e.innerHTML.length + ':' + e.innerHTML.slice(0, 4000));
  await sc.tap(); await p.waitForTimeout(450);
  const despues = await card.$eval('.scene', e => e.innerHTML.length + ':' + e.innerHTML.slice(0, 4000));
  /* juntar en una imagen: filas = etapas, columnas = poses */
  const cols = poses.length, img = fotos.map(x => 'data:image/png;base64,' + fs.readFileSync(x.f).toString('base64'));
  const q = await b.newPage({ viewport: { width: 300 * cols, height: 240 * etapas.length } });
  await q.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${cols},300px);background:#fff">${img.map((s, i) =>
    `<div style="position:relative"><img src="${s}" style="width:300px;height:240px;object-fit:contain"><b style="position:absolute;left:6px;top:4px;font:700 12px sans-serif;color:#456">e${fotos[i].k} ${JSON.stringify(poses[i % cols]).replace(/"/g, '')}</b></div>`).join('')}</body>`);
  await q.waitForTimeout(200); await q.screenshot({ path: salida, fullPage: true });
  console.log(JSON.stringify({ salida, motor: fotos.every(x => x.hay) ? 'con poses' : 'SIN motor de poses (solo dibujo)', fps, toque: antes !== despues ? 'responde' : 'NO responde', errores: errs }));
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
})();
