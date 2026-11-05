'use strict';
/* =========================================================
   Guardarropa de Poli: cada medalla desbloquea un accesorio que Poli se puede poner.
   - El accesorio elegido se guarda por perfil en save.acc (solo ids de ACCS).
   - Para agregar uno: una línea en ACCS (svg en el mismo sistema de coordenadas de POLI_SVG, 120 × 140).
     layer 'back' = detrás del cuerpo (capa); 'front' = sobre la cabeza y la cara.
   - Se desbloquean con las medallas de js/medallas.js (campo medal).
   ========================================================= */
const ACCS = [
  { id: 'lazo', ico: '🎀', name: 'Lazo', medal: 'paso', layer: 'front',
    svg: `<g transform="translate(94 40)"><polygon points="0,0 -15,-10 -15,10" fill="#ff6bb0" stroke="#e0529a" stroke-width="2.6" stroke-linejoin="round"/><polygon points="0,0 15,-10 15,10" fill="#ff6bb0" stroke="#e0529a" stroke-width="2.6" stroke-linejoin="round"/><circle r="4.5" fill="#e0529a"/></g>` },
  { id: 'gafas', ico: '🕶️', name: 'Gafas cool', medal: 'r3', layer: 'front',
    svg: `<rect x="30" y="61" width="28" height="22" rx="9" fill="#2b2d6e" stroke="#fff" stroke-width="2"/><rect x="62" y="61" width="28" height="22" rx="9" fill="#2b2d6e" stroke="#fff" stroke-width="2"/><rect x="56" y="68" width="8" height="4" fill="#2b2d6e"/><path d="M36 67l8-2M68 67l8-2" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>` },
  { id: 'capa', ico: '🦸', name: 'Capa de heroína', medal: 'r7', layer: 'back',
    svg: `<path d="M26 66Q8 116 20 138L100 138Q112 116 94 66Z" fill="#ff6b6b" stroke="#d94646" stroke-width="3" stroke-linejoin="round"/><path d="M26 66Q60 78 94 66" fill="none" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>` },
  { id: 'gorro', ico: '🥳', name: 'Gorro de fiesta', medal: 'a50', layer: 'front',
    svg: `<polygon points="60,0 41,42 79,42" fill="#4ea8ff" stroke="#2f7fd1" stroke-width="3" stroke-linejoin="round"/><path d="M50 24L70 24M45 34L75 34" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><circle cx="60" cy="3" r="5.5" fill="#ffd166" stroke="#e09a00" stroke-width="2.4"/>` },
  { id: 'corona', ico: '👑', name: 'Corona', medal: 'e20', layer: 'front',
    svg: `<path d="M38 44L36 16L49 28L60 8L71 28L84 16L82 44Z" fill="#ffd166" stroke="#e09a00" stroke-width="3" stroke-linejoin="round"/><circle cx="60" cy="30" r="4" fill="#ff6b6b"/><circle cx="46" cy="38" r="3" fill="#4ea8ff"/><circle cx="74" cy="38" r="3" fill="#4ea8ff"/>` },
  { id: 'aureola', ico: '😇', name: 'Aureola de estrella', medal: 'e50', layer: 'front',
    svg: `<ellipse cx="60" cy="12" rx="24" ry="6.5" fill="none" stroke="#ffd166" stroke-width="5"/><ellipse cx="60" cy="12" rx="24" ry="6.5" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>` },
  { id: 'mago', ico: '🧙', name: 'Sombrero de mago', medal: 'mente', layer: 'front',
    svg: `<polygon points="60,-4 38,44 82,44" fill="#6a49f0" stroke="#4b2fc4" stroke-width="3" stroke-linejoin="round"/><ellipse cx="60" cy="44" rx="30" ry="6" fill="#6a49f0" stroke="#4b2fc4" stroke-width="3"/><path d="M60 14l3 6 6 .8-4.4 4.1 1.1 6L60 28l-5.7 3 1.1-6L51 20.8l6-.8z" fill="#ffd166"/>` },
];
const ACC = Object.fromEntries(ACCS.map(a => [a.id, a]));
const accOpen = a => medalsEarned().includes(a.medal);
const medalName = id => MEDALS.find(m => m.id === id)?.name || '';

/* Poli con su accesorio: se arma sobre POLI_SVG sin tocarlo */
function poliSvg(acc) {
  const a = ACC[acc]; if (!a) return POLI_SVG;
  return a.layer === 'back' ? POLI_SVG.replace('</defs>', `</defs>${a.svg}`) : POLI_SVG.replace(/<\/g>\s*<\/svg>$/, `${a.svg}</g></svg>`);
}
let wearing = null;
function refreshPoli() {
  const id = ACC[save.acc] ? save.acc : '';
  if (id === wearing) return; // sin cambios: no se toca a Poli (para no cortar su animación)
  wearing = id; $('#poli').innerHTML = poliSvg(id);
}

/* sección de Mi avance */
function closetHtml() {
  return `<h3 class="sec">Guardarropa de Poli</h3>
    <p class="pintro">👗 Cada medalla desbloquea un accesorio. ¡Elige cuál se pone Poli!</p>
    <div class="closet" id="closet"><button class="acc ${save.acc ? '' : 'on'}" data-a="" aria-pressed="${!save.acc}"><span aria-hidden="true">🙂</span><b>Poli normal</b></button>${ACCS.map(a => accOpen(a)
      ? `<button class="acc ${save.acc === a.id ? 'on' : ''}" data-a="${a.id}" aria-pressed="${save.acc === a.id}"><span aria-hidden="true">${a.ico}</span><b>${a.name}</b></button>`
      : `<div class="acc lock"><span aria-hidden="true">🔒</span><b>${a.name}</b><small>Medalla ${medalName(a.medal)}</small></div>`).join('')}</div>`;
}
function wireCloset(el) {
  $$('#closet [data-a]', el).forEach(b => b.onclick = () => {
    save.acc = b.dataset.a; persist(); refreshPoli(); sfx.ok();
    $$('#closet [data-a]', el).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    poli.cheer(save.acc ? `¡Me encanta! ¡Gracias, ${save.name}!` : 'Poli normal, ¡siempre contenta!');
  });
}
refreshPoli();
