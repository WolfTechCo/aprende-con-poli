'use strict';
/* =========================================================
   Diploma de Poli (Mi avance → "Diploma"): una hoja para imprimir o guardar como PDF.
   Se arma con lo ya guardado (estrellas, medallas, racha); el nombre ya viene limpio (cleanName)
   y se inserta como texto, nunca como HTML. Al imprimir solo sale el diploma (ver @media print).
   ========================================================= */
function openDiploma() {
  closeDiploma();
  const medals = typeof medalsEarned === 'function' ? medalsEarned().length : 0, best = typeof streakInfo === 'function' ? streakInfo().best : 0;
  const ov = document.createElement('div');
  ov.className = 'dip-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Diploma');
  ov.innerHTML = `<div class="dcard">
      <div class="dstars" aria-hidden="true">★ ★ ★</div>
      <div class="dsmall">Diploma de ${gx('campeona', 'campeón')}</div>
      <div class="dsmall">Poli felicita a</div>
      <h2 class="dname"></h2>
      <div class="dsmall">por aprender jugando con formas y números</div>
      <div class="dstats"><span>⭐ ${totalStars()} de ${maxStars()} estrellas</span><span>🏅 ${medals} ${medals === 1 ? 'medalla' : 'medallas'}</span>${best ? `<span>🔥 mejor racha: ${best} ${best === 1 ? 'día' : 'días'}</span>` : ''}</div>
      <div class="ddate"></div>
      <div class="dsign">Poli 🦄</div>
    </div>
    <div class="dip-btns"><button class="btn sm gold" id="dipPrint">🖨️ Imprimir o guardar PDF</button><button class="btn sm ghost" id="dipClose">Cerrar</button></div>`;
  $('.dname', ov).textContent = save.name;
  $('.ddate', ov).textContent = typeof fmtDate === 'function' ? fmtDate(dayKey()) : dayKey();
  document.body.append(ov);
  $('#dipPrint', ov).onclick = () => { sfx.pop(); window.print(); };
  $('#dipClose', ov).onclick = closeDiploma;
  ov.onclick = e => { if (e.target === ov) closeDiploma(); };
  document.addEventListener('keydown', dipKey);
  sfx.win(); confetti(80);
  poli.cheer(`¡Mira, ${save.name}! Es tu diploma. ¡Te lo ganaste!`);
}
const dipKey = e => { if (e.key === 'Escape') closeDiploma(); };
function closeDiploma() { document.removeEventListener('keydown', dipKey); $('.dip-ov')?.remove(); }
