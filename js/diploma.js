'use strict';
/* =========================================================
   Diploma de Poli (Mis premios → "Mi diploma"): una hoja para imprimir o guardar como PDF.
   - Es un documento APARTE dentro de un iframe (srcdoc): así los estilos de la app no lo tocan y la vista previa
     es exactamente lo que sale en el papel. Todo se mide en "u" (≈ 1 % del ancho de la hoja), por eso se ve igual
     en pantalla, en A4 y en carta.
   - Se arma con lo ya guardado (estrellas, medallas, racha, accesorio de Poli). Los textos pasan por dipEsc.
   - Sigue la CSP: srcdoc hereda la de la app (solo 'self'); la letra viene de fonts/.
   - Para cambiar el diseño: DIP_CSS (estilos), dipDeco (adornos), dipSeal (sello) y dipDoc (contenido).
   ========================================================= */
const dipEsc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Poli (con su accesorio) para la hoja; su degradado lleva otro id para no chocar con el de la pantalla */
const diplomaPoli = () => (typeof poliSvg === 'function' ? poliSvg(save.acc) : POLI_SVG).replace(/id="pg"/, 'id="pgd"').replace(/url\(#pg\)/g, 'url(#pgd)');

const dipBurst = (cx, cy, R, r, n) => ps(Array.from({ length: n * 2 }, (_, i) => { const a = (i * Math.PI) / n - Math.PI / 2, q = i % 2 ? r : R; return [+(cx + q * Math.cos(a)).toFixed(1), +(cy + q * Math.sin(a)).toFixed(1)]; }));
const dipSpark = (cx, cy, s) => `${cx},${cy - s} ${cx + s * .25},${cy - s * .25} ${cx + s},${cy} ${cx + s * .25},${cy + s * .25} ${cx},${cy + s} ${cx - s * .25},${cy + s * .25} ${cx - s},${cy} ${cx - s * .25},${cy - s * .25}`;

/* confeti de fondo (formas del mundo de Poli), grande y suave para que no tape los textos */
function dipDeco() {
  const C = ['#ff6b6b', '#4ea8ff', '#ffc233', '#22c58b', '#9b6bff', '#ff8a3d'], out = [];
  const spots = [[5, 12], [14, 6], [26, 12], [40, 5], [56, 10], [70, 5], [84, 11], [94, 20], [4, 30], [96, 38], [3, 48], [97, 56], [6, 66], [94, 70], [18, 72], [30, 68], [46, 73], [62, 70], [76, 73], [10, 50], [90, 48], [50, 66], [22, 22], [78, 24]];
  spots.forEach(([x, y], i) => {
    const c = C[i % C.length], k = i % 5, s = 3 + (i % 3) * 1.1, cx = x, cy = y * .77;
    out.push(k === 0 ? `<polygon points="${starPts(cx, cy, s * 1.5)}" fill="${c}"/>`
      : k === 1 ? `<circle cx="${cx}" cy="${cy}" r="${s * .8}" fill="${c}"/>`
        : k === 2 ? `<polygon points="${cx},${cy - s} ${cx + s},${cy + s * .8} ${cx - s},${cy + s * .8}" fill="${c}" transform="rotate(${i * 25} ${cx} ${cy})"/>`
          : k === 3 ? `<rect x="${cx - s * .75}" y="${cy - s * .75}" width="${s * 1.5}" height="${s * 1.5}" rx=".6" fill="${c}" transform="rotate(${i * 17} ${cx} ${cy})"/>`
            : `<polygon points="${dipSpark(cx, cy, s * 1.5)}" fill="${c}"/>`);
  });
  return `<svg class="deco" viewBox="0 0 100 77" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${out.join('')}</svg>`;
}

/* sello dorado con cinta */
const dipSeal = () => `<svg class="seal" viewBox="0 0 100 124" aria-hidden="true">
  <polygon points="34,78 20,122 40,112 50,124 56,86" fill="#e8434b" stroke="#b92d35" stroke-width="2.5" stroke-linejoin="round"/>
  <polygon points="66,78 80,122 60,112 50,124 44,86" fill="#ff6b6b" stroke="#b92d35" stroke-width="2.5" stroke-linejoin="round"/>
  <polygon points="${dipBurst(50, 50, 49, 42, 18)}" fill="#f5a500" stroke="#c98200" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="35" fill="#ffd166" stroke="#fff3c4" stroke-width="3"/>
  <circle cx="50" cy="50" r="29" fill="none" stroke="#c98200" stroke-width="1.6" stroke-dasharray="3 3"/>
  <polygon points="${starPts(50, 36, 12)}" fill="#fff" stroke="#c98200" stroke-width="1.6" stroke-linejoin="round"/>
  <text x="50" y="64" text-anchor="middle" font-family="Baloo 2,Arial" font-weight="800" font-size="17" fill="#8a4b00">¡BRAVO!</text></svg>`;

const DIP_CSS = `
@font-face{font-family:"Baloo 2";font-weight:400 800;src:url(fonts/baloo2-latin.woff2) format("woff2")}
@page{size:landscape;margin:0}
*{box-sizing:border-box;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
:root{--u:min(1vw,1.3vh);--rb:linear-gradient(90deg,#ff6b6b,#ff8a3d,#ffc233,#22c58b,#4ea8ff,#9b6bff)}
html,body{height:100%;background:#fff;font-family:"Baloo 2","Trebuchet MS",Arial,sans-serif;color:#2b2d6e;overflow:hidden}
.card{position:absolute;inset:1.2vmin;border:calc(var(--u)*1.1) double #e09a00;border-radius:calc(var(--u)*2.4);background:radial-gradient(circle,rgba(255,200,60,.22) 12%,transparent 13%) 0 0/calc(var(--u)*3.2) calc(var(--u)*3.2),radial-gradient(circle at 50% 42%,#fffef7 0,#fff4cf 65%,#ffe49a 100%);overflow:hidden;display:grid;place-items:center}
.card:before,.card:after{content:"";position:absolute;left:0;right:0;height:calc(var(--u)*1.6);background:var(--rb)}.card:before{top:0}.card:after{bottom:0}
.deco{position:absolute;inset:0;width:100%;height:100%;opacity:.4}
.in{position:relative;width:calc(var(--u)*92);height:calc(var(--u)*66);display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center}
.ttl{color:#e8434b;font-weight:800;font-size:calc(var(--u)*6.4);line-height:1;white-space:nowrap;-webkit-text-stroke:calc(var(--u)*.7) #fff;paint-order:stroke fill;text-shadow:0 calc(var(--u)*.7) 0 #b92d35}
.ttl i{font-style:normal;color:#ffc233;-webkit-text-stroke:calc(var(--u)*.5) #fff;text-shadow:0 calc(var(--u)*.6) 0 #e09a00;margin:0 calc(var(--u)*2)}
.mid{width:100%;display:grid;grid-template-columns:25% 1fr 22%;align-items:center}
.poli{height:calc(var(--u)*23)}.poli svg{height:100%;width:auto;display:block;margin:auto;overflow:visible;filter:drop-shadow(0 calc(var(--u)*.6) 0 rgba(91,61,240,.2))}
.sm{font-weight:700;font-size:calc(var(--u)*2.7);color:#5a5d9a;line-height:1.2}
.name{font-weight:800;line-height:1.05;color:#5b3df0;text-shadow:0 calc(var(--u)*.55) 0 #ffd166;white-space:nowrap;margin:calc(var(--u)*.5) 0}
.cup{font-size:calc(var(--u)*16);line-height:1;filter:drop-shadow(0 calc(var(--u)*.6) 0 rgba(224,154,0,.35))}
.chips{display:flex;gap:calc(var(--u)*1.2) calc(var(--u)*1.8);justify-content:center;flex-wrap:nowrap}
.chips b{background:#fff;border:calc(var(--u)*.4) solid #ffc233;border-radius:99px;padding:calc(var(--u)*.3) calc(var(--u)*1.8);font-size:calc(var(--u)*2.4);font-weight:800;white-space:nowrap;box-shadow:0 calc(var(--u)*.4) 0 #ffe08a}
.meds{display:flex;gap:calc(var(--u)*1.3);justify-content:center}
.md{width:calc(var(--u)*7);height:calc(var(--u)*7);border-radius:50%;display:grid;place-items:center;font-size:calc(var(--u)*4.2);background:#e9e9f2;border:calc(var(--u)*.4) solid #d3d3e6;filter:grayscale(1);opacity:.4}
.md.on{background:#fff3b8;border-color:#f5a500;filter:none;opacity:1;box-shadow:0 calc(var(--u)*.45) 0 #e09a00}
.goal{font-weight:800;font-size:calc(var(--u)*2.3);color:#7447e0;padding-right:calc(var(--u)*13)}
.foot{width:100%;padding-right:calc(var(--u)*17);display:flex;justify-content:space-between;align-items:flex-end;font-weight:700;font-size:calc(var(--u)*2.4);color:#5a5d9a}
.seal{position:absolute;right:calc(var(--u)*-1);bottom:calc(var(--u)*-1.8);width:calc(var(--u)*15);height:auto;filter:drop-shadow(0 calc(var(--u)*.5) 0 rgba(0,0,0,.18))}
`;

function dipDoc() {
  const got = MEDALS.filter(m => m.ok()), nextM = MEDALS.find(m => !m.ok()), best = typeof streakInfo === 'function' ? streakInfo().best : 0;
  const date = typeof fmtDate === 'function' ? fmtDate(dayKey()) : dayKey();
  const nameSize = Math.min(11, 46 / (0.58 * Math.max(1, save.name.length))).toFixed(1);
  const goal = nextM ? `🎯 Próxima meta: <b>${dipEsc(nextM.name)}</b> · ${dipEsc(nextM.how)}` : '🌟 ¡Ganaste todas las medallas!';
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Diploma de ${dipEsc(save.name)}</title><style>${DIP_CSS}</style></head><body>
  <div class="card">${dipDeco()}<div class="in">
    <div class="ttl"><i>★</i>¡Diploma de ${gx('campeona', 'campeón')}!<i>★</i></div>
    <div class="mid"><div class="poli">${diplomaPoli()}</div>
      <div><div class="sm">Poli felicita a</div><div class="name" style="font-size:calc(var(--u)*${nameSize})">${dipEsc(save.name)}</div><div class="sm">por aprender jugando con formas y números</div></div>
      <div class="cup">🏆</div></div>
    <div class="chips"><b>⭐ ${totalStars()} de ${maxStars()} estrellas</b><b>🏅 ${got.length} de ${MEDALS.length} medallas</b>${best ? `<b>🔥 mejor racha: ${best} ${best === 1 ? 'día' : 'días'}</b>` : ''}</div>
    <div class="meds">${MEDALS.map(m => `<span class="md ${got.includes(m) ? 'on' : ''}">${m.ico}</span>`).join('')}</div>
    <div class="goal">${goal}</div>
    <div class="foot"><span>${dipEsc(date)}</span></div>
    ${dipSeal()}
  </div></div></body></html>`;
}

function openDiploma() {
  closeDiploma();
  const ov = document.createElement('div');
  ov.className = 'dip-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Diploma');
  ov.innerHTML = `<div class="dwrap"><iframe class="dframe" title="Diploma" scrolling="no"></iframe></div>
    <div class="dip-btns"><button class="btn sm gold" id="dipPrint">🖨️ Imprimir o guardar PDF</button><button class="btn sm ghost" id="dipClose">Cerrar</button></div>`;
  const fr = $('.dframe', ov);
  fr.srcdoc = dipDoc();
  document.body.append(ov);
  $('#dipPrint', ov).onclick = () => { sfx.pop(); try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { window.print(); } };
  $('#dipClose', ov).onclick = closeDiploma;
  ov.onclick = e => { if (e.target === ov) closeDiploma(); };
  document.addEventListener('keydown', dipKey);
  sfx.win(); confetti(80);
  poli.cheer(`¡Mira, ${save.name}! Es tu diploma. ¡Te lo ganaste!`);
}
const dipKey = e => { if (e.key === 'Escape') closeDiploma(); };
function closeDiploma() { document.removeEventListener('keydown', dipKey); $('.dip-ov')?.remove(); }
