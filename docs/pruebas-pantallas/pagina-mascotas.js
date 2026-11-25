/* Arma la página de revisión de las mascotas (fase 4A-3, parte 1) con boceto-mascotas.js tal cual.
   Uso: node docs/pruebas-pantallas/pagina-mascotas.js SALIDA.html */
const fs = require('fs'), path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, 'boceto-mascotas.js'), 'utf8') + '\n' + fs.readFileSync(path.join(__dirname, 'boceto-mascotas-b.js'), 'utf8') + '\n' + fs.readFileSync(path.join(__dirname, 'boceto-mascotas-c.js'), 'utf8') + '\n' + fs.readFileSync(path.join(__dirname, 'boceto-vida.js'), 'utf8') + '\n' + fs.readFileSync(path.join(__dirname, 'boceto-poses.js'), 'utf8');
/* Poli de hoy, tal como está en la app (js/app.js: POLI_SVG) */
const APP = fs.readFileSync(path.join(__dirname, '../../js/app.js'), 'utf8');
const POLI = APP.match(/const POLI_SVG = `([\s\S]*?)`;/)[1].trim();
const out = process.argv[2] || 'mascotas.html';
const html = `<title>Mascotas de Poli</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@400;600;700;800&display=swap">
<style>
/* Columna de lectura; cada mascota en una tarjeta con su escenario grande y la fila de 5 etapas para tocar */
:root{
  --bg:#f4f8ff; --fg:#22304a; --muted:#5d6a86; --card:#ffffff; --line:#dbe4f3; --stage:#e8f3ff; --stage2:#f6efff;
  --accent:#6a49f0; --accentbg:#eee9ff; --ok:#13906b; --okbg:#e3f7ef; --warm:#a86a00; --warmbg:#fff4d6;
  --display:"Baloo 2","Trebuchet MS",system-ui,sans-serif; --body:"Nunito",system-ui,-apple-system,"Segoe UI",sans-serif;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#121a2a; --fg:#e8eefb; --muted:#a3b2cc; --card:#1b2639; --line:#2d3b55; --stage:#22324d; --stage2:#2a2748;
  --accent:#a690ff; --accentbg:#2a2452; --ok:#4fd6a8; --okbg:#173a31; --warm:#ffcc3d; --warmbg:#3a3118; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#121a2a; --fg:#e8eefb; --muted:#a3b2cc; --card:#1b2639; --line:#2d3b55; --stage:#22324d; --stage2:#2a2748;
  --accent:#a690ff; --accentbg:#2a2452; --ok:#4fd6a8; --okbg:#173a31; --warm:#ffcc3d; --warmbg:#3a3118; color-scheme:dark}
body{background:var(--bg);color:var(--fg);font-family:var(--body);font-size:16px;line-height:1.55}
.wrap{max-width:1040px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 56px;display:flex;flex-direction:column;gap:40px}
h1,h2,h3{font-family:var(--display);line-height:1.15;margin:0;text-wrap:balance}
h1{font-size:clamp(2rem,5vw,2.7rem);font-weight:800} h2{font-size:1.5rem;font-weight:800} h3{font-size:1.25rem;font-weight:800}
p{margin:0} header,section{display:flex;flex-direction:column;gap:14px}
.eyebrow{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:800}
.lead{font-size:1.08rem;color:var(--muted);max-width:68ch}
.note{font-size:.92rem;color:var(--muted);max-width:72ch}
ul{margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:6px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:16px}
.pet{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:10px;min-width:0}
.pet .top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}
.pet .top small{color:var(--muted);font-weight:700}
.scene{background:radial-gradient(ellipse at 50% 92%,#ffffff 0 30%,transparent 31%),linear-gradient(#cfe9ff,#eaf6ff);border-radius:16px;display:block;aspect-ratio:96/72;max-height:360px;max-width:100%;cursor:pointer;overflow:hidden}
.scene svg{display:block;width:100%;height:100%;overflow:visible}
.cap{font:800 1.05rem var(--display);text-align:center;min-height:1.4em}
.strip{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.strip button{all:unset;cursor:pointer;background:var(--stage);border-radius:12px;padding:4px 2px 2px;display:flex;flex-direction:column;align-items:center;gap:0;font:700 .74rem var(--body);color:var(--muted);border:2px solid transparent;min-width:0}
.strip button svg{width:100%;height:auto;aspect-ratio:96/72;overflow:visible}
.strip button[aria-pressed="true"]{border-color:var(--accent);background:var(--accentbg);color:var(--fg)}
.strip button:focus-visible,.scene:focus-visible,.btn:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.how{font-size:.92rem;color:var(--muted)}
.how b{color:var(--fg)}
.btn{font:800 .92rem var(--body);border:0;border-radius:99px;padding:8px 16px;background:var(--accent);color:#fff;cursor:pointer}
.btn.ghost{background:var(--accentbg);color:var(--accent)}
#tanda .btn[aria-pressed="false"]{background:var(--accentbg);color:var(--accent)}
#tanda .btn[aria-pressed="true"]{background:var(--accent);color:#fff}
#modo .btn[aria-pressed="false"]{background:var(--accentbg);color:var(--accent)}
#modo .btn[aria-pressed="true"]{background:var(--accent);color:#fff}
.hint{font-size:.85rem;color:var(--muted);text-align:center;min-height:1.3em}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.demo{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:12px;min-width:0}
.hatch{background:linear-gradient(#fff6df,#ffe9f3);border-radius:16px;height:clamp(200px,34vw,300px);max-width:100%;overflow:hidden;cursor:pointer}
.hatch svg{display:block;width:100%;height:100%;overflow:visible}
.tabs{display:flex;flex-wrap:wrap;gap:8px}
.tab{background:#fff;color:#22304a;border-radius:14px;padding:3px 10px 3px 4px;display:flex;align-items:center;gap:4px;font:800 .9rem var(--display);box-shadow:0 2px 0 #b9cde6}
.tab svg{width:56px;height:42px;overflow:visible}
.franja{background:linear-gradient(#fff8ec 0 55%,#e9e2ff 55%);border-radius:16px;padding:10px;display:flex;flex-wrap:wrap;gap:4px 18px;align-items:flex-end;color:#22304a}
.franja svg{height:58px;width:auto;overflow:visible}
.franja svg.poli{height:66px}
.qs{counter-reset:q;display:flex;flex-direction:column;gap:12px;padding:0;list-style:none}
.qs li{counter-increment:q;background:var(--accentbg);border-radius:14px;padding:14px 16px 14px 54px;position:relative}
.qs li::before{content:counter(q);position:absolute;left:14px;top:12px;width:28px;height:28px;border-radius:50%;background:var(--accent);color:var(--bg);font-family:var(--display);font-weight:800;display:grid;place-items:center}
.qs small{display:block;color:var(--muted);margin-top:4px}
.box{border-radius:16px;padding:16px 18px;display:flex;flex-direction:column;gap:8px;background:var(--okbg)}
.box.w{background:var(--warmbg)}
.jump{animation:jump .7s}
@keyframes jump{30%{transform:translateY(-14%) rotate(-6deg)}60%{transform:translateY(0) rotate(5deg)}}
.pop{animation:pop .6s cubic-bezier(.3,1.6,.5,1)}
@keyframes pop{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}
.shake{animation:shake .5s}
@keyframes shake{25%{transform:rotate(-8deg)}50%{transform:rotate(7deg)}75%{transform:rotate(-4deg)}}
@media (prefers-reduced-motion:reduce){.jump,.pop,.shake{animation:none}}
</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" id="defs"></svg>
<div class="wrap">
<header>
  <span class="eyebrow">Entrega 4A · Dibujos · Parte 1 de 5 · 24-11-2026 · elegida: tanda C</span>
  <h1>Las mascotas de Poli</h1>
  <p class="lead"><b>Elegiste la tanda C.</b> Quedan las tres para comparar. La <b>tanda C</b> parte de la A, que es la que más te gustó, con los mismos animales redonditos, y les suma una <b>postura que evoluciona</b>: se paran, levantan los brazos, vuelan. Además, ninguna cabeza es un círculo. La <b>tanda A</b> es la primera y la <b>tanda B</b> cambia la forma completa. Toca una mascota para que salte y toca las etapas para verla crecer.</p>
  <div class="row" id="tanda" role="group" aria-label="Tanda"><button class="btn" data-t="C" aria-pressed="true">Tanda C · elegida ✓</button><button class="btn ghost" data-t="A" aria-pressed="false">Tanda A · la primera</button><button class="btn ghost" data-t="B" aria-pressed="false">Tanda B · cambian de forma</button></div>
  <div class="row" id="modo" role="group" aria-label="Momento"><button class="btn" data-m="vida" aria-pressed="true">Con vida · mapa y premios</button><button class="btn ghost" data-m="quieta" aria-pressed="false">Tranquila · durante una pregunta</button></div>
  <p class="note"><b>Nuevo: vida propia.</b> Con vida, cada mascota se mueve como su animal y suelta partículas de su tema. Al tocarla, mezcla el <b>salto</b> (igual en todas) con su <b>gesto propio</b>: la tortuga se esconde, el búho gira la cabeza, el ciempiés hace la ola, el pulpo suelta tinta de confeti y la chinita vuela. Durante una pregunta solo respira y parpadea.</p>
</header>

<section>
  <h2>Cinco mascotas, cinco etapas</h2>
  <p class="note">Huevo (antes de empezar el capítulo) → cría (termina la lección de inicio) → joven (mitad de las islas) → grande (todas las islas) → brillante (Gran Desafío con 3 estrellas y los temas dominados).</p>
  <div class="grid" id="pets"></div>
</section>

<section>
  <h2>Así nace</h2>
  <div class="demo">
    <p class="note">En la app será la pantalla grande del aviso. Con cada toque el huevo se agrieta, se abre un hoyito por donde mira un ojo y asoma una parte (patitas, antenas, tentáculos, un rizo), después salta la tapa y se asoma la carita, y al final nace. Prueba con cualquiera:</p>
    <div class="row" id="hpick"></div>
    <div class="hatch" id="hatch" role="button" tabindex="0" aria-label="Tocar el huevo"><svg viewBox="-60 -50 120 66" id="hsvg"></svg></div>
    <div class="row"><button class="btn" id="htap">Tocar el huevo</button><button class="btn ghost" id="hreset">Otra vez</button></div>
  </div>
</section>

<section>
  <h2>A su tamaño real en la app</h2>
  <p class="note">Lo más chico donde aparecen: la pestaña del capítulo (arriba del mapa, en Mi avance y en el álbum) y la franja de abajo junto a Poli. Se reconocen igual. El huevo de un capítulo que aún no empieza se ve sombreado, como los premios del mapa.</p>
  <div class="demo">
    <h3>Pestañas de capítulo</h3>
    <div class="tabs" id="tabs"></div>
    <h3>Franja de abajo, junto a Poli</h3>
    <div class="franja" id="franja"></div>
  </div>
</section>

<section>
  <h2>Para que decidas</h2>
  <ol class="qs">
    <li><b>Elegida: tanda C.</b> Cubúho cría ahora está dentro de la mitad de abajo de su huevo, con la pared de atrás y la cáscara de adelante.<small>Se construye así en la fase 4A-4.</small></li>
    <li><b>Tortugono con cresta.</b> En la C, de grande le crecen placas sobre el caparazón con la figura de su etapa (pentágonos y, de brillante, octágonos dorados).<small>Recomiendo dejarla: cambia su silueta sin perder la tortuga.</small></li>
    <li><b>Eclosión en 4 toques</b>: grieta, hoyito con un ojo que mira y una parte que asoma, la tapa que salta con la carita, y nace.<small>Funciona igual con cualquier tanda.</small></li>
    <li><b>Huevos con el color y el dibujo de su mascota</b>, iguales en las tres tandas.<small>Antes de empezar el capítulo se ven sombreados.</small></li>
  </ol>
  <div class="box w"><h3>Lo que viene</h3><ul>
    <li><b>Parte 2:</b> la Llamita de fuego en sus 6 estados.</li>
    <li><b>Parte 3:</b> sobres de cada isla, cajas, cofre y su apertura en 3 toques.</li>
    <li><b>Parte 4:</b> logros con 4 niveles, mochila y aviso de Poli.</li>
    <li><b>Parte 5:</b> lo que traen los sobres: celebraciones, fondos del mapa y stickers.</li>
  </ul></div>
</section>
</div>
<script>
${SRC}
(() => {
  const M = window.BOCETO_MASC;
  document.getElementById('defs').innerHTML = M.DEFS;
  const st = document.createElement('style'); st.textContent = M.CSS + M.VIDA.CSS; document.head.appendChild(st);
  const VB = '-48 -64 96 72';
  let modo = 'vida'; let tanda = 'C'; const T = () => tanda === 'A' ? M : M[tanda];
  const HOW_C = {
    tortugono: 'Su caparazón <b>suma lados</b> (triángulos, cuadrados, pentágonos y hexágono, octágonos dorados). Tiene cabeza con hocico; de grande estira el cuello y le crece una <b>cresta de placas</b> con la figura de su etapa.',
    cubuho: 'El búho <b>cubo</b> de la tanda A: sale con su cascarón, le crecen plumas de <b>prisma</b>, orejas de <b>cono</b> y botones de <b>esfera</b>, y de brillante abre las alas.',
    cienpiecito: 'Anillos con los colores de las lecciones (<b>unidades</b>, <b>decenas</b>, <b>centenas</b>) y cabeza de baldosa. De grande <b>se levanta y saluda</b>; de brillante, Milpiés suma el anillo de los miles.',
    pulpatron: 'El pulpo de la tanda A, con su <b>patrón</b> AB, ABC y uno que crece. De grande <b>levanta dos tentáculos</b> con el patrón y de brillante <b>flota</b>.',
    chinitabla: 'La chinita de la tanda A, con pintas en <b>grupos iguales</b> de 2, 5 y 10 y cabeza de casco. De joven saluda, de grande <b>se para</b> y de brillante <b>vuela</b>.',
  };
  const HOW_B = {
    tortugono: 'Se para y cambia de figura: cabeza, panza y caparazón son <b>triángulo</b>, luego <b>cuadrado</b>, luego <b>pentágono y hexágono</b> y, de brillante, <b>octágono</b>.',
    cubuho: 'Sale del huevo siendo un <b>cubo</b>, le salen alas de <b>prisma</b>, crece hasta ser un <b>prisma alto</b> con orejas de <b>cono</b>, patas de <b>cilindro</b> y botones de <b>esfera</b>, y de brillante abre las alas.',
    cienpiecito: 'Está hecho de <b>bloques de base 10</b>: gatea con <b>unidades</b>, se arquea siendo una <b>decena</b>, se levanta con <b>centenas, decenas y unidades</b> y, de brillante, Milpiés abraza un <b>cubo de mil</b>.',
    pulpatron: 'Gotita con <b>AB</b>, campana con franja <b>AB</b>, pulpo dumbo con un patrón <b>ABC</b> que crece (1, 2, 3 pintas) y, de brillante, flota con tentáculos <b>arcoíris</b>.',
    chinitabla: 'Bolita con pintas de <b>2</b>, caparazón de corazón con <b>5 y 5</b>, se para y abre el caparazón como capa con <b>10 y 10</b> y, de brillante, vuela.',
  };
  const HOW = {
    tortugono: 'Su caparazón <b>suma lados</b>: triángulos, cuadrados, pentágonos con un hexágono y, de brillante, octágonos dorados.',
    cubuho: 'Su cuerpo es un <b>cubo</b>. Al crecer le salen plumas de <b>prisma</b>, orejitas de <b>cono</b> y botones de <b>esfera</b>.',
    cienpiecito: 'Un anillo por cifra con los colores de las lecciones: <b>unidades</b> verdes, <b>decenas</b> naranjas, <b>centenas</b> azules. De brillante se llama <b>Milpiés</b> y suma los miles.',
    pulpatron: 'Sus tentáculos llevan un <b>patrón</b>: AB, luego ABC, luego uno que crece (1, 2, 3 pintas) y, de brillante, un arcoíris.',
    chinitabla: 'Sus pintas van en <b>grupos iguales</b> en cada ala: de 2, de 5 y de 10.',
  };
  const pets = document.getElementById('pets');
  const draw = () => { pets.innerHTML = M.MASC.map(m => \`<article class="pet" data-id="\${m.id}"><div class="top"><h3>\${m.name}</h3><small>Capítulo \${m.ch} · \${m.cap}</small></div>
    <div class="scene" role="button" tabindex="0" aria-label="Tocar a \${m.name}"><svg viewBox="\${VB}"></svg></div><p class="cap"></p><p class="hint"></p>
    <div class="strip">\${M.ETAPAS.map((t, k) => \`<button data-k="\${k}" aria-pressed="false"><svg viewBox="\${VB}">\${T().masc(m.id, k)}</svg>\${t}</button>\`).join('')}</div>
    <p class="how">\${({ A: HOW, B: HOW_B, C: HOW_C })[tanda][m.id]}</p></article>\`).join('');
    pets.querySelectorAll('.pet').forEach(c => show(c, 3)); drawSmall(); if (typeof drawH === 'function') drawH(); };
  const show = (card, k) => {
    const id = card.dataset.id, svg = card.querySelector('.scene svg');
    if (card.motor) { card.motor.parar(); card.motor = null; }
    const conPoses = tanda === 'C' && k > 0 && M.POSES.tiene(id);
    svg.innerHTML = \`<g class="pop">\${k && tanda === 'C' ? M.VIDA.part(id) : ''}<g class="mv">\${conPoses ? '' : T().masc(id, k)}</g></g>\`;
    if (conPoses) { card.motor = M.POSES.poner(svg.querySelector('.mv'), id, k); card.motor.setModo(modo); }
    svg.classList.toggle('vida', modo === 'vida' && tanda === 'C');
    const h = card.querySelector('.hint'); if (h) h.textContent = '';
    card.dataset.k = k;
    card.querySelector('.cap').textContent = M.nombre(id, k) + ' · ' + M.ETAPAS[k];
    card.querySelectorAll('.strip button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.k === k));
  };
  const tocar = card => { const mv = card.querySelector('.scene .mv'), id = card.dataset.id;
    if (card.motor) { const hecho = card.motor.tocar(); const h = card.querySelector('.hint'); if (h) h.textContent = 'Hizo: ' + hecho.replace('gesto', 'su gesto'); return; }
    if (tanda !== 'C' || +card.dataset.k === 0) { jump(card.querySelector('.scene svg')); return; }
    const hecho = M.VIDA.reaccion(mv, id); const h = card.querySelector('.hint'); if (h) h.textContent = 'Hizo: ' + hecho.replace('gesto', 'su gesto'); };
  const jump = el => { el.classList.remove('jump'); void el.getBoundingClientRect(); requestAnimationFrame(() => el.classList.add('jump')); };
  pets.addEventListener('click', e => {
    const b = e.target.closest('.strip button'), card = e.target.closest('.pet');
    if (b) show(card, +b.dataset.k); else if (e.target.closest('.scene')) tocar(card);
  });
  pets.addEventListener('keydown', e => { const s = e.target.closest('.scene'); if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tocar(s.closest('.pet')); } });

  /* nacer */
  let hid = 'pulpatron', hk = 0;
  const hpick = document.getElementById('hpick'), hsvg = document.getElementById('hsvg');
  hpick.innerHTML = M.MASC.map(m => \`<button class="btn ghost" data-id="\${m.id}" aria-pressed="false">\${m.name}</button>\`).join('');
  var drawH = () => {
    hpick.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === hid));
    hsvg.innerHTML = hk < 4 ? \`<g transform="scale(1.15)" class="\${hk ? 'shake' : 'wob'}" style="transform-box:fill-box;transform-origin:50% 100%">\${M.huevo(hid, hk)}</g>\`
      : \`<g class="pop">\${T().masc(hid, 1)}</g><text y="10.5" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="5" fill="#6a49f0">¡Nació \${M.nombre(hid, 1)}!</text>\`;
  };
  const tap = () => { hk = hk >= 4 ? 4 : hk + 1; drawH(); };
  hpick.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { hid = b.dataset.id; hk = 0; drawH(); } });
  document.getElementById('htap').addEventListener('click', tap);
  document.getElementById('hatch').addEventListener('click', tap);
  document.getElementById('hatch').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
  document.getElementById('hreset').addEventListener('click', () => { hk = 0; drawH(); });
  drawH();

  /* tamaño real */
  function drawSmall() {
  const small = (id, k, sombra) => \`<svg viewBox="-40 -60 80 66">\${T().masc(id, k, { sombra })}</svg>\`;
  document.getElementById('tabs').innerHTML = M.MASC.map((m, i) => \`<span class="tab">\${small(m.id, i === 4 ? 0 : [1, 2, 3, 4][i], i === 4)}\${m.ch} · \${i === 4 ? 'aún no empieza' : M.nombre(m.id, [1, 2, 3, 4][i])}</span>\`).join('');
  var poli = ${JSON.stringify(POLI)}.replace('<svg ', '<svg class="poli" ');
  document.getElementById('franja').innerHTML = M.MASC.map((m, i) => \`<span style="display:flex;align-items:flex-end">\${poli}<svg viewBox="-40 -58 80 64">\${T().masc(m.id, [1, 2, 3, 3, 1][i])}</svg></span>\`).join('');
  }
  draw();
  document.getElementById('modo').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; modo = b.dataset.m; pets.querySelectorAll('.pet').forEach(c => c.motor && c.motor.setModo(modo)); document.querySelectorAll('#modo button').forEach(x => x.setAttribute('aria-pressed', x === b)); pets.querySelectorAll('.scene svg').forEach(v => v.classList.toggle('vida', modo === 'vida' && tanda === 'C')); });
  document.getElementById('tanda').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; tanda = b.dataset.t; document.querySelectorAll('#tanda button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
})();
</script>`;
fs.writeFileSync(out, html);
console.log('página escrita en', out);
