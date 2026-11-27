/* Lámina quieta de Poli C (niña, niño y por defecto), parada 1 del diseño (27-11-2026).
   Filas: (1) los tres y sus poses; (2) Poli que ASOMA (desde el costado, desde abajo, detrás del recuadro) y a tamaño real;
   (3) lo que se elige: piel, pelo, peinado y ojos; (4) ropa de cualquier cosa (animal, espacio, planta, oficio).
   Uso: node docs/pruebas-pantallas/lamina-poli-c.js [SALIDA.png] */
const { chromium } = require('playwright');
global.window = {}; require('./boceto-mascotas.js'); require('./boceto-poli-c.js');
const { svg, poli, VARIANTES: V, PIEL, PELO, OJOS, DEFS } = window.BOCETO_POLI_C, M = window.BOCETO_MASC;
const salida = process.argv[2] || 'lamina-poli-c.png';
const CAB = '-27 -75 54 50'; /* solo la cabeza */
const POSES = { saluda: { ad: 118, cd: 62, boca: 'abierta', cab: -5 }, celebra: { ai: 150, ad: 150, ci: 24, cd: 24, y: 7, ojos: 'felices', boca: 'abierta' },
  piensa: { ad: -40, cd: -140, ojos: 'arriba', boca: 'o', cab: 6, mira: .6 }, señala: { ai: 92, ci: 0, boca: 'abierta', mira: -1, cab: -4 } };
/* escenas para asomarse: un trozo de pantalla de 160 × 120 con un recuadro de pregunta */
const recuadro = (x, y, w, h, t) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#fff" stroke="#d6dcf5" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + h / 2 + 7}" text-anchor="middle" font: font-family="Arial Rounded MT Bold,Nunito,Arial,sans-serif" font-weight="900" font-size="20" fill="#2b2d6e">${t}</text>`;
const globo = (x, y, w, t, cola = 'abajo-der') => `<g><rect x="${x}" y="${y}" width="${w}" height="20" rx="10" fill="#fff" stroke="#c7c9f0" stroke-width="1"/>${cola === 'abajo-der' ? `<path d="M${x + w - 22} ${y + 19}l8 9l2 -9" fill="#fff" stroke="#c7c9f0" stroke-width="1"/><rect x="${x + w - 23}" y="${y + 16}" width="12" height="4" fill="#fff"/>` : `<path d="M${x + 18} ${y + 19}l-2 9l8 -9" fill="#fff" stroke="#c7c9f0" stroke-width="1"/><rect x="${x + 14}" y="${y + 16}" width="12" height="4" fill="#fff"/>`}<text x="${x + w / 2}" y="${y + 14}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="10" fill="#2b2d6e">${t}</text></g>`;
const escena = (inner, id) => `<svg viewBox="0 0 160 120"><defs><clipPath id="${id}"><rect width="160" height="120" rx="8"/></clipPath></defs>${M.DEFS}${DEFS}<g clip-path="url(#${id})"><rect width="160" height="120" fill="url(#cielo)"/>${inner}</g><rect width="160" height="120" rx="8" fill="none" stroke="#9ab" stroke-width="1"/></svg>`;
const P_ = (look, pose, tr) => `<g transform="${tr}">${poli(look, pose).replace(/<ellipse cx="0" cy="0"[^>]*km-piso[^>]*\/>/, '')}</g>`;
const ESC = {
  'Asoma por el costado': escena(recuadro(14, 40, 78, 54, '3 × 4') + P_(V.a, { ai: 92, ci: 0, boca: 'abierta', mira: -1, cab: -8 }, 'translate(168 128) rotate(-24) scale(1.35)') + globo(52, 8, 92, '¿Cuánto es?'), 'e1'),
  'Asoma desde abajo': escena(recuadro(41, 10, 78, 50, '2 × 5') + P_(V.o, { ai: 150, ad: 150, ci: -20, cd: -20, boca: 'abierta', mira: 0 }, 'translate(80 150) scale(1.4)') + globo(4, 70, 58, '¡Tú puedes!'), 'e2'),
  'Detrás del recuadro': escena(P_(V[''], { ai: 0, ad: 0, boca: 'sonrisa', mira: -.6, ojos: 'abiertos' }, 'translate(112 106) scale(1.25)')
    + recuadro(20, 62, 124, 52, '4 + 4 + 4') + `${[100, 124].map(x => `<circle cx="${x}" cy="63" r="5" fill="url(#pc-piel2)" stroke="${PIEL[2][3]}" stroke-width="1"/>`).join('')}` + globo(8, 10, 80, '¡Mira esto!'), 'e3'),
};
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 400 }, deviceScaleFactor: 2 });
  const cel = (t, s, w = 170) => `<div class="c" style="width:${w}px"><div class="s">${s}</div><div class="t">${t}</div></div>`;
  const fila = (titulo, celdas) => `<div class="f"><div class="ft">${titulo}</div><div class="fc">${celdas}</div></div>`;
  const html = `<!doctype html><meta charset=utf8><style>body{margin:0;background:#fff;font:700 13px system-ui,sans-serif;color:#345}
    .f{display:flex;border-bottom:1px solid #e6eaf4}.ft{width:120px;flex:none;background:#f4f6fb;padding:10px;font-size:15px;display:flex;align-items:center}
    .fc{display:flex;flex-wrap:wrap}.c{border-left:1px solid #eef;background:linear-gradient(#e6f3ff,#f7fbff)}.c .s svg{width:100%;height:auto;display:block;overflow:visible}.t{text-align:center;padding:2px 0 6px;font-size:12px}
    .cab{display:flex;padding:8px 4px 0}.cab svg{width:66px!important;height:62px!important;overflow:hidden!important;flex:none}
    .franja{background:#4a9cf0;display:flex;align-items:flex-end;gap:8px;padding:6px 8px;height:100px}.franja svg{width:84px!important;height:88px;overflow:visible;flex:none}.bur{background:#fff;border-radius:14px;padding:6px 10px;font-size:12px;margin-bottom:14px}</style>
    <svg width="0" height="0" style="position:absolute"><defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe9ff"/><stop offset="1" stop-color="#f2f9ff"/></linearGradient></defs></svg>
    ${fila('Niña, niño y por defecto', cel('Niña', svg(V.a, {})) + cel('Niño', svg(V.o, {})) + cel('Por defecto', svg(V[''], {})) + cel('Saluda', svg(V.a, POSES.saluda)) + cel('Celebra', svg(V.o, POSES.celebra)) + cel('Piensa', svg(V[''], POSES.piensa)) + cel('Señala', svg(V.a, POSES.señala)))}
    ${fila('Poli asoma (gana espacio y da énfasis)', Object.entries(ESC).map(([t, s]) => cel(t, s, 300)).join('') + cel('Tamaño real (celular)', `<div class="franja">${svg(V.a, {})}<div class="bur">¿Cuántos hay?</div></div>`, 290))}
    ${fila('Se elige', cel('Piel', `<div class="cab">${[1, 2, 3, 4, 5].map(k => svg({ ...V.o, piel: k }, {}, CAB)).join('')}</div>`, 400)
      + cel('Pelo', `<div class="cab">${Object.keys(PELO).map(k => svg({ ...V.a, pelo: k }, {}, CAB)).join('')}</div>`, 420)
      + cel('Peinado', `<div class="cab">${['colitas', 'remolino', 'gorro', 'rulos', 'trenzas', 'tomate'].map(k => svg({ ...V.o, peinado: k, pelo: k === 'gorro' ? 'castano' : 'cafe' }, {}, CAB)).join('')}</div>`, 420)
      + cel('Ojos', `<div class="cab">${Object.keys(OJOS).map(k => svg({ ...V.o, ojos: k, piel: 2 }, {}, CAB)).join('')}</div>`, 340))}
    ${fila('Ropa de cualquier cosa', cel('Animal: dinosaurio', svg({ ...V.o, cabeza: 'dino', polera: 'verde' }, POSES.celebra)) + cel('Espacio: astronauta', svg({ ...V.a, peinado: 'trenzas', cabeza: 'astro', polera: 'ceniza' }, POSES.saluda))
      + cel('Planta: sombrero con flor', svg({ ...V[''], peinado: 'trenzas', pelo: 'negro', piel: 4, cabeza: 'flor', polera: 'amarillo' }, {})) + cel('Oficio: chef', svg({ ...V.o, peinado: 'rulos', pelo: 'colorin', piel: 1, ojos: 'verde', cabeza: 'chef', polera: 'ceniza' }, POSES.piensa)))}`;
  await p.setContent(html); await p.waitForTimeout(250);
  await p.screenshot({ path: salida, fullPage: true }); await b.close(); console.log(salida);
})();
