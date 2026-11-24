/* Vida de las mascotas (entrega 4A, fase 4A-3; pedido de la dueña, 24-11-2026: «a la par de la Llamita»).
   Se carga después de boceto-mascotas.js y -c.js. Tres cosas, solo cuando el escenario tiene la clase .vida
   (mapa, Mis premios, premios, al acertar); durante una pregunta no se pone .vida y solo respiran y parpadean:
   1) movimiento natural de su animal (clases v-* que ya llevan los dibujos: cabeza, patas, cara, alas, anillos,
      antenas, tentáculos, pintas, brazos);
   2) partículas de su tema (part(id));
   3) reacción al tocarla: el SALTO común a todas, mezclado con el GESTO propio de cada una (reaccion()).
      Gestos: Tortugono se esconde en el caparazón y vuelve a asomar; Cubúho gira la cabeza; Cienpiecito hace
      una ola grande; Pulpatrón agita los tentáculos y suelta «tinta» de confeti; Chinitabla vuela un momento. */
(function (root) {
  const M = root.BOCETO_MASC, { PAL } = M;
  const { starD, f1 } = M.H;
  /* partículas: 5 cositas del tema que suben y se desvanecen alrededor de la mascota (marco: suelo en y = 0) */
  const SPOTS = [[-30, -12], [28, -22], [-24, -40], [31, -46], [-4, -54]];
  const polyD = (n, r) => { let d = ''; const a0 = Math.PI / 2 + Math.PI / n; for (let i = 0; i < n; i++) { const a = a0 + i * 2 * Math.PI / n; d += (i ? 'L' : 'M') + f1(r * Math.cos(a)) + ' ' + f1(r * Math.sin(a)); } return d + 'Z'; };
  const ICON = {
    tortugono: i => { const n = [3, 4, 5, 6, 8][i]; return `<path d="${polyD(n, 2.6)}" fill="${i % 2 ? PAL.amarillo[1] : PAL.menta[1]}" stroke="${i % 2 ? PAL.amarillo[3] : PAL.menta[3]}" stroke-width=".5" stroke-linejoin="round"/>`; },
    cubuho: i => i % 2 ? `<circle r="2.2" fill="url(#km-azul)" stroke="${PAL.azul[3]}" stroke-width=".5"/><circle cx="-.7" cy="-.8" r=".6" fill="#fff"/>`
      : `<path d="M-2.4 -.6L0 -2L2.4 -.6V2L0 3.2L-2.4 2Z" fill="${PAL.lila[0]}" stroke="${PAL.lila[3]}" stroke-width=".5"/><path d="M-2.4 -.6L0 .8L2.4 -.6M0 .8V3.2" fill="none" stroke="${PAL.lila[3]}" stroke-width=".5"/>`,
    cienpiecito: i => { const [t, c] = [['1', 'pu'], ['10', 'pd'], ['100', 'pc'], ['1', 'pu'], ['10', 'pd']][i]; return `<text text-anchor="middle" y="2" font-family="Baloo 2,Trebuchet MS,sans-serif" font-weight="800" font-size="5.6" fill="${PAL[c][1]}" stroke="${PAL[c][3]}" stroke-width=".35">${t}</text>`; },
    pulpatron: i => `<circle r="${[1.8, 2.4, 1.6, 2.2, 1.9][i]}" fill="${['#ffd23c', '#5fb0ff', '#7fd650'][i % 3]}" fill-opacity=".35" stroke="${['#f0a800', '#2f7fe0', '#45a826'][i % 3]}" stroke-width=".55"/><circle cx="-.6" cy="-.6" r=".45" fill="#fff"/>`,
    chinitabla: i => [...Array(i % 2 ? 2 : 3)].map((_, j) => `<circle cx="${f1((j - (i % 2 ? .5 : 1)) * 2.6)}" r="1.1" fill="${PAL.oscuro[1]}"/>`).join(''),
  };
  const part = id => `<g class="v-part">${SPOTS.map(([x, y], i) => `<g transform="translate(${x} ${y}) scale(1.5)"><g class="v-p" style="animation-delay:${(i * .75).toFixed(2)}s">${ICON[id](i)}</g></g>`).join('')}</g>`;
  /* tinta de confeti de Pulpatrón (se agrega un momento y se quita sola) */
  const tinta = () => `<g class="r-tinta">${[...Array(12)].map((_, i) => { const a = i / 12 * Math.PI * 2; return `<circle cx="0" cy="-12" r="1.6" fill="${['#ff4d64', '#ffd23c', '#5fb0ff', '#7fd650', '#a98cff', '#ff8cbf'][i % 6]}" style="--dx:${f1(Math.cos(a) * 26)}px;--dy:${f1(Math.sin(a) * 20 - 10)}px"/>`; }).join('')}</g>`;
  const GESTO = { tortugono: ['r-gesto'], cubuho: ['r-gesto'], cienpiecito: ['r-gesto'], pulpatron: ['r-gesto'], chinitabla: ['r-gesto', 'r-vuela'] };
  /* reaccion(el, id): el = <g class="mv"> que envuelve a la mascota. Mezcla el salto y el gesto para no repetir */
  let turno = 0;
  const reaccion = (el, id) => {
    const plan = [['salto'], ['gesto'], ['salto', 'gesto'], ['gesto'], ['salto']][turno++ % 5];
    const quita = () => el.classList.remove('r-salto', 'r-gesto', 'r-vuela');
    quita(); void el.getBoundingClientRect();
    const gesto = () => { quita(); void el.getBoundingClientRect(); el.classList.add(...GESTO[id]);
      if (id === 'pulpatron') { el.insertAdjacentHTML('beforeend', tinta()); setTimeout(() => { const t = el.querySelector('.r-tinta'); if (t) t.remove(); }, 1000); }
      setTimeout(quita, 1300); };
    if (plan[0] === 'salto') { el.classList.add('r-salto'); setTimeout(plan[1] ? gesto : quita, 700); } else gesto();
    return plan.join(' + ');
  };
  const CSS = `.v-part{display:none}.vida .v-part{display:inline}
.vida .v-p{opacity:0;animation:v-flota 3.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes v-flota{0%{opacity:0;transform:translateY(6px) scale(.5)}25%{opacity:.95}75%{opacity:.75}100%{opacity:0;transform:translateY(-12px) scale(1) rotate(40deg)}}
.vida .v-cabeza{animation:v-asoma 6s ease-in-out infinite;transform-box:fill-box;transform-origin:0% 60%}
@keyframes v-asoma{0%,50%,100%{transform:none}57%,65%{transform:translateX(-3.5px) scale(.9)}72%{transform:none}80%{transform:rotate(-8deg)}86%{transform:rotate(5deg)}92%{transform:none}}
.vida .v-pata{animation:v-paso 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}
@keyframes v-paso{0%,100%{transform:none}50%{transform:translateY(-1.4px) rotate(-6deg)}}
.vida .v-cara{animation:v-ladea 5s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 60%}
@keyframes v-ladea{0%,38%,100%{transform:none}48%,60%{transform:rotate(-11deg)}70%,80%{transform:rotate(8deg)}}
.vida .v-ala{animation:v-aletea 4s ease-in-out infinite;transform-box:fill-box;transform-origin:100% 10%}
.vida .v-ala.v-der{transform-origin:0% 10%;animation-name:v-aletea2}
@keyframes v-aletea{0%,68%,100%{transform:none}74%{transform:rotate(16deg)}80%{transform:rotate(-3deg)}86%{transform:rotate(12deg)}}
@keyframes v-aletea2{0%,68%,100%{transform:none}74%{transform:rotate(-16deg)}80%{transform:rotate(3deg)}86%{transform:rotate(-12deg)}}
.vida .v-seg{animation:v-ola 1.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes v-ola{0%,100%{transform:none}50%{transform:translateY(-1.8px)}}
.vida .v-cabezac{animation:v-cabezac 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
@keyframes v-cabezac{0%,100%{transform:none}30%{transform:rotate(-6deg)}60%{transform:rotate(5deg)}}
.vida .v-ant{animation:v-ant 2.2s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
@keyframes v-ant{0%,100%{transform:none}25%{transform:rotate(-7deg)}75%{transform:rotate(7deg)}}
.vida .v-tent{animation:v-ondula 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}
@keyframes v-ondula{0%,100%{transform:rotate(0)}30%{transform:rotate(5deg)}70%{transform:rotate(-5deg)}}
.vida .v-luz{animation:v-luz 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes v-luz{0%,20%,100%{transform:none;filter:none}10%{transform:scale(1.45);filter:brightness(1.35)}}
.vida .v-brazo{animation:v-saluda 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
@keyframes v-saluda{0%,100%{transform:none}25%{transform:rotate(-12deg)}50%{transform:rotate(8deg)}75%{transform:rotate(-6deg)}}
.mv{transform-box:fill-box;transform-origin:50% 100%}
.r-salto{animation:r-salto .7s cubic-bezier(.3,1.4,.5,1)}
@keyframes r-salto{0%{transform:none}15%{transform:scale(1.08,.88)}45%{transform:translateY(-18%) scale(.94,1.06)}75%{transform:translateY(0) scale(1.06,.94)}100%{transform:none}}
.r-gesto .v-cabeza{animation:r-esconde 1.2s ease-in-out!important}
@keyframes r-esconde{0%{transform:none}25%,55%{transform:translateX(-9px) scale(.5)}75%{transform:translateX(1px) scale(1.1)}100%{transform:none}}
.r-gesto .v-cara{animation:r-gira 1.1s ease-in-out!important}
@keyframes r-gira{0%{transform:none}25%{transform:scaleX(.1) rotate(-6deg)}50%{transform:scaleX(-1)}75%{transform:scaleX(.1) rotate(6deg)}100%{transform:none}}
.r-gesto .v-ala{animation:r-aleteo .25s ease-in-out 4!important}
@keyframes r-aleteo{50%{transform:rotate(18deg)}}
.r-gesto .v-ala.v-der{animation-name:r-aleteo2!important}
@keyframes r-aleteo2{50%{transform:rotate(-18deg)}}
.r-gesto .v-seg{animation:r-olagrande .9s ease-in-out!important}
@keyframes r-olagrande{0%,100%{transform:none}40%{transform:translateY(-6px) scale(1.08)}}
.r-gesto .v-cabezac{animation:r-cabezac .9s ease-in-out!important}
@keyframes r-cabezac{30%{transform:translateY(-4px) rotate(-10deg)}60%{transform:rotate(10deg)}}
.r-gesto .v-tent{animation:r-tiembla .18s ease-in-out 5!important}
@keyframes r-tiembla{50%{transform:rotate(9deg)}}
.r-gesto .v-luz{animation:v-luz .45s ease-in-out 3!important}
.r-gesto .v-brazo{animation:r-aleteo .2s ease-in-out 6!important}
.r-vuela{animation:r-vuela 1.3s ease-in-out}
@keyframes r-vuela{0%,100%{transform:none}30%,70%{transform:translateY(-22%) rotate(-4deg)}50%{transform:translateY(-26%) rotate(4deg)}}
.r-tinta circle{animation:r-tinta .95s ease-out forwards}
@keyframes r-tinta{to{transform:translate(var(--dx),var(--dy));opacity:0}}
@media (prefers-reduced-motion:reduce){.vida *,.r-salto,.r-gesto *,.r-vuela{animation:none!important}.vida .v-p{opacity:.8}}`;
  M.VIDA = { part, reaccion, CSS };
})(typeof window !== 'undefined' ? window : global);
