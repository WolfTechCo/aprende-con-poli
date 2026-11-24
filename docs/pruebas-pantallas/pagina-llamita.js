/* Arma la página de revisión de la Llamita (fase 4A-3, parte 2) con boceto-mascotas.js y boceto-llamita.js tal cual.
   Uso: node docs/pruebas-pantallas/pagina-llamita.js SALIDA.html */
const fs = require('fs'), path = require('path');
const SRC = ['boceto-mascotas.js', 'boceto-llamita.js'].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const out = process.argv[2] || 'llamita.html';
const html = `<title>La Llamita de Poli</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@400;600;700;800&display=swap">
<style>
/* Columna de lectura; escenario grande con la Llamita y fila de estados para tocar, luego tamaño real y decisiones */
:root{
  --bg:#fff8f2; --fg:#2e2230; --muted:#6e5f72; --card:#ffffff; --line:#f0e0d6; --stage:#fff0e4;
  --accent:#e8551a; --accentbg:#ffe8da; --ok:#13906b; --okbg:#e3f7ef; --warmbg:#fff4d6;
  --display:"Baloo 2","Trebuchet MS",system-ui,sans-serif; --body:"Nunito",system-ui,-apple-system,"Segoe UI",sans-serif;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#1c1418; --fg:#f6ece6; --muted:#c3b0b4; --card:#271c22; --line:#3d2c33; --stage:#33232a;
  --accent:#ff8a4d; --accentbg:#43271f; --ok:#4fd6a8; --okbg:#173a31; --warmbg:#3a3118; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#1c1418; --fg:#f6ece6; --muted:#c3b0b4; --card:#271c22; --line:#3d2c33; --stage:#33232a;
  --accent:#ff8a4d; --accentbg:#43271f; --ok:#4fd6a8; --okbg:#173a31; --warmbg:#3a3118; color-scheme:dark}
body{background:var(--bg);color:var(--fg);font-family:var(--body);font-size:16px;line-height:1.55}
.wrap{max-width:1000px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 56px;display:flex;flex-direction:column;gap:40px}
h1,h2,h3{font-family:var(--display);line-height:1.15;margin:0;text-wrap:balance}
h1{font-size:clamp(2rem,5vw,2.7rem);font-weight:800} h2{font-size:1.5rem;font-weight:800} h3{font-size:1.2rem;font-weight:800}
p{margin:0} header,section{display:flex;flex-direction:column;gap:14px}
.eyebrow{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:800}
.lead{font-size:1.08rem;color:var(--muted);max-width:68ch}
.note{font-size:.92rem;color:var(--muted);max-width:72ch}
ul{margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:6px}
.demo{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:12px;min-width:0}
.scene{position:relative;background:radial-gradient(ellipse at 50% 96%,#ffffff 0 26%,transparent 27%),linear-gradient(#2b2a5e,#5b4a8a 60%,#8a6aa8);border-radius:16px;height:clamp(240px,44vw,380px);max-width:100%;overflow:hidden;cursor:pointer}
.scene.dia{background:radial-gradient(ellipse at 50% 96%,#ffffff 0 26%,transparent 27%),linear-gradient(#bfe4ff,#e8f6ff)}
.scene svg{display:block;width:100%;height:100%;overflow:visible}
.scene .dias{position:absolute;left:12px;top:10px;background:#fff;color:#2e2230;border-radius:99px;padding:2px 12px;font:800 1rem var(--display);box-shadow:0 3px 0 #e0c8b8}
.cap{font:800 1.1rem var(--display);text-align:center}
.cap small{display:block;font:600 .9rem var(--body);color:var(--muted)}
.strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:6px}
.strip button{all:unset;cursor:pointer;background:var(--stage);border-radius:12px;padding:4px 2px 4px;display:flex;flex-direction:column;align-items:center;font:700 .76rem var(--body);color:var(--muted);border:2px solid transparent;text-align:center;line-height:1.2;min-width:0}
.strip button svg{width:100%;height:auto;aspect-ratio:68/76;max-height:110px}
.strip button[aria-pressed="true"]{border-color:var(--accent);background:var(--accentbg);color:var(--fg)}
.strip button.extra{border-style:dashed;border-color:var(--line)}
.strip button.extra[aria-pressed="true"]{border-color:var(--accent)}
.strip button:focus-visible,.scene:focus-visible,.btn:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.btn{font:800 .92rem var(--body);border:0;border-radius:99px;padding:8px 16px;background:var(--accent);color:#fff;cursor:pointer}
.btn.ghost{background:var(--accentbg);color:var(--accent)}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.road{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;align-items:end}
.road div{display:flex;flex-direction:column;align-items:center;gap:2px;font:800 .9rem var(--display);text-align:center}
.road div small{font:600 .74rem var(--body);color:var(--muted)}
.road svg{width:100%;height:auto;aspect-ratio:68/76}
@media (max-width:560px){.road{grid-template-columns:repeat(3,1fr)}}
.bar{background:linear-gradient(#bfe6ff,#e8f6ff);border-radius:16px;padding:10px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;color:#2e2230}
.chip{background:#fff;border-radius:99px;padding:2px 12px 2px 4px;display:flex;align-items:center;gap:2px;font:800 1rem var(--display);box-shadow:0 3px 0 #c9d8ea}
.chip svg{width:34px;height:38px;overflow:visible}
.qs{counter-reset:q;display:flex;flex-direction:column;gap:12px;padding:0;list-style:none}
.qs li{counter-increment:q;background:var(--accentbg);border-radius:14px;padding:14px 16px 14px 54px;position:relative}
.qs li::before{content:counter(q);position:absolute;left:14px;top:12px;width:28px;height:28px;border-radius:50%;background:var(--accent);color:var(--bg);font-family:var(--display);font-weight:800;display:grid;place-items:center}
.qs small{display:block;color:var(--muted);margin-top:4px}
.box{border-radius:16px;padding:16px 18px;display:flex;flex-direction:column;gap:8px;background:var(--warmbg)}
.pop{animation:pop .6s cubic-bezier(.3,1.6,.5,1);transform-box:fill-box;transform-origin:50% 100%}
@keyframes pop{0%{transform:scale(.4)}100%{transform:scale(1)}}
.boing{animation:boing .7s;transform-box:fill-box;transform-origin:50% 100%}
@keyframes boing{25%{transform:scaleY(1.25) scaleX(.85)}50%{transform:scaleY(.85) scaleX(1.12)}75%{transform:scaleY(1.06)}}
.burst circle{animation:burst .9s ease-out forwards}
@keyframes burst{to{transform:translate(var(--dx),var(--dy));opacity:0}}
@media (prefers-reduced-motion:reduce){.pop,.boing,.burst circle{animation:none}}
</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" id="defs"></svg>
<div class="wrap">
<header>
  <span class="eyebrow">Entrega 4A · Dibujos · Parte 2 de 5 · 24-11-2026</span>
  <h1>La Llamita de Poli</h1>
  <p class="lead">La Llamita de la racha en estilo Gel. Crece con el récord de días seguidos y, como las mascotas de la tanda C, también cambia de silueta: gana puntas, bracitos y su leña. Si la racha se corta, se duerme como brasa y despierta al volver. Tócala para que salte.</p>
</header>

<section>
  <div class="demo">
    <div class="scene" id="scene" role="button" tabindex="0" aria-label="Tocar a la Llamita"><span class="dias" id="dias"></span><svg viewBox="-60 -72 120 84" id="ssvg"></svg></div>
    <p class="cap" id="cap"></p>
    <div class="strip" id="strip"></div>
    <div class="row"><button class="btn" id="wake">Despertar la brasa</button><span class="note">Muestra cómo la brasa dormida se enciende cuando el niño vuelve a practicar.</span></div>
  </div>
</section>

<section>
  <h2>Así crece con la racha</h2>
  <p class="note">Crece con el <b>récord</b>, que nunca baja. Cada vez que cambia trae un cofre dorado (3, 7, 14 y 30 días, y después cada 30).</p>
  <div class="road" id="road"></div>
</section>

<section>
  <h2>A su tamaño real en la app</h2>
  <p class="note">Junto a los días de racha, en el mapa y en Mis premios. Se reconoce aunque sea chica; la brasa se ve tranquila, sin rojo ni tristeza.</p>
  <div class="bar" id="bar"></div>
</section>

<section>
  <h2>Para que decidas</h2>
  <ol class="qs">
    <li><b>Llama azul a los 14 días.</b> El fuego azul es el más caliente; así el niño ve que «subió de nivel» aunque la forma se parezca a la fogata.<small>Recomiendo dejarla azul. La otra opción es morada o rosada, que también se ve especial.</small></li>
    <li><b>La brasa sobre un montoncito de ceniza</b>, con ojos cerrados, «z» y un humito suave. Brilla tibia, para que se note que solo duerme.<small>Recomiendo dejarla así: no muestra nada apagado ni triste.</small></li>
    <li><b>Dos estados extra para el Rincón de adultos:</b> de vacaciones (fuera de la temporada de estudio o en pausa) con sombrero y lentes, y en temporada de estudio con mochila, libro y lápiz.<small>Recomiendo sumarlos: explican sin palabras por qué la racha no avanza.</small></li>
  </ol>
  <div class="box"><h3>Lo que viene</h3><ul>
    <li><b>Parte 3:</b> sobres de cada isla, cajas, cofre dorado y su apertura en 3 toques.</li>
    <li><b>Parte 4:</b> logros con 4 niveles, mochila y aviso de Poli.</li>
    <li><b>Parte 5:</b> lo que traen los sobres: celebraciones, fondos del mapa y stickers.</li>
  </ul></div>
</section>
</div>
<script>
${SRC}
(() => {
  const M = window.BOCETO_MASC, L = M.LL;
  document.getElementById('defs').innerHTML = M.DEFS + L.DEFS;
  const st = document.createElement('style'); st.textContent = M.CSS + L.CSS; document.head.appendChild(st);
  const DIAS = { chispa: '1 día', llamita: '3 días', fogata: '7 días', azul: '14 días', dorada: '30 días', brasa: 'Récord: 9 días', vacaciones: 'De vacaciones', estudio: 'Faltan 5 días para tu prueba' };
  const scene = document.getElementById('scene'), ssvg = document.getElementById('ssvg'), strip = document.getElementById('strip');
  let cur = 'fogata';
  strip.innerHTML = L.ETAPAS.map(e => \`<button data-id="\${e.id}" class="\${e.extra ? 'extra' : ''}" aria-pressed="false"><svg viewBox="-34 -70 68 76">\${L.llamita(e.id)}</svg>\${e.t}</button>\`).join('');
  const show = id => {
    cur = id; const e = L.ETAPAS.find(x => x.id === id);
    ssvg.innerHTML = \`<g class="pop">\${L.llamita(id)}</g>\`;
    scene.classList.toggle('dia', id === 'vacaciones' || id === 'estudio');
    document.getElementById('dias').textContent = DIAS[id];
    document.getElementById('cap').innerHTML = e.t + '<small>' + e.d + '</small>';
    strip.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === id));
  };
  const burst = () => { const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'burst');
    g.innerHTML = [...Array(10)].map((_, i) => { const a = i / 10 * Math.PI * 2; return \`<circle cx="0" cy="-26" r="1.4" fill="\${i % 2 ? '#ffd23c' : '#ff8a3d'}" style="--dx:\${(Math.cos(a) * 22).toFixed(1)}px;--dy:\${(Math.sin(a) * 18 - 8).toFixed(1)}px"/>\`; }).join('');
    ssvg.appendChild(g); setTimeout(() => g.remove(), 1000); };
  const tap = () => { const g = ssvg.firstElementChild; if (!g) return; g.classList.remove('pop', 'boing'); void g.getBBox(); g.classList.add('boing'); if (cur !== 'brasa') burst(); };
  strip.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.id); });
  scene.addEventListener('click', tap);
  scene.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
  document.getElementById('wake').addEventListener('click', () => { show('brasa'); setTimeout(() => { burst(); show('chispa'); document.getElementById('dias').textContent = '¡Volviste! 1 día · récord 9'; }, 1200); });
  show(cur);
  document.getElementById('road').innerHTML = L.ETAPAS.filter(e => !e.extra).map(e => \`<div><svg viewBox="-34 -70 68 76">\${L.llamita(e.id)}</svg>\${e.t}<small>\${e.d}</small></div>\`).join('');
  document.getElementById('bar').innerHTML = [['chispa', '2'], ['llamita', '4'], ['fogata', '9'], ['azul', '16'], ['dorada', '31'], ['brasa', '0']].map(([id, n]) =>
    \`<span class="chip"><svg viewBox="-34 -70 68 76">\${L.llamita(id)}</svg>\${id === 'brasa' ? 'zzz' : n + ' días'}</span>\`).join('');
})();
</script>`;
fs.writeFileSync(out, html);
console.log('página escrita en', out);
