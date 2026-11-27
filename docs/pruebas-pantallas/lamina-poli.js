/* Lámina quieta del Poli nuevo (parada 1): una fila por propuesta (A, B, C); columnas: niña, niño y por defecto en
   reposo, tres poses (saluda, celebra, piensa) y «tamaño real» (los tres en la franja de abajo, al ancho que usa la app
   en un celular: 84 px). Uso: node docs/pruebas-pantallas/lamina-poli.js [OPCIONES] [SALIDA.png]   (por defecto A,B,C) */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [opsTxt = 'A,B,C', salida = 'lamina-poli.png'] = process.argv.slice(2);
const ops = opsTxt.split(',');
const js = ['boceto-mascotas.js', 'boceto-poli.js'].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 400 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.setContent(`<!doctype html><meta charset=utf8><style>
    body{margin:0;background:#fff;font:700 13px system-ui,sans-serif;color:#345}
    .g{display:grid;grid-template-columns:110px repeat(6,170px) 250px;gap:0}
    .c{height:190px;border:1px solid #eef;display:flex;align-items:center;justify-content:center;position:relative;background:linear-gradient(#e6f3ff,#f7fbff)}
    .c svg{width:150px;height:158px;overflow:visible}
    .t{font-size:12px;padding:6px;text-align:center;background:#f4f6fb}
    .op{display:flex;flex-direction:column;justify-content:center;padding:6px;background:#f4f6fb;font-size:15px}
    .op small{font-weight:500;font-size:11px;color:#567;margin-top:4px}
    .franja{height:190px;display:flex;flex-direction:column;justify-content:space-around;background:#4a9cf0;padding:2px 6px}
    .fila{display:flex;align-items:flex-end;gap:6px}.fila svg{width:84px;height:88px;flex:none;overflow:visible}
    .bur{background:#fff;border-radius:14px;padding:6px 8px;font-size:11px;font-weight:600;color:#234;margin-bottom:10px}
  </style><div class="g" id="g"></div><script>${js}</script>`);
  await p.evaluate(ops => {
    const { OPCIONES, POSES, svg } = window.BOCETO_POLI, G = document.getElementById('g');
    const cols = [['Niña', 'a', 'reposo'], ['Niño', 'o', 'reposo'], ['Por defecto', '', 'reposo'], ['Saluda (niña)', 'a', 'saluda'], ['Celebra (niño)', 'o', 'celebra'], ['Piensa (por defecto)', '', 'piensa']];
    G.innerHTML = '<div class="t"></div>' + cols.map(c => `<div class="t">${c[0]}</div>`).join('') + '<div class="t">Tamaño real en la franja (celular): niña y niño</div>'
      + ops.map(op => `<div class="op">${OPCIONES[op].nombre}<small>${OPCIONES[op].idea}</small></div>`
        + cols.map(([, v, ps]) => { let pose = POSES[ps]; if (op === 'B' && ps === 'celebra') pose = { ...pose, forma: 4 }; if (op === 'B' && ps === 'piensa') pose = { ...pose, forma: 3 };
          return `<div class="c">${svg(op, v, pose)}</div>`; }).join('')
        + `<div class="franja">${['a', 'o', ''].map((v, i) => i < 2 ? `<div class="fila">${svg(op, v, {})}<div class="bur">${['¿Cuántos hay en total?', '¡Muy bien!'][i]}</div></div>` : '').join('')}</div>`).join('');
  }, ops);
  await p.waitForTimeout(200);
  await (await p.$('#g')).screenshot({ path: salida });
  console.log(JSON.stringify({ salida, errores: errs }));
  await b.close();
})();
