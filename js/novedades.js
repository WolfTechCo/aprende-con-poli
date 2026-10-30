'use strict';
/* =========================================================
   Novedades: lo nuevo de cada versión, contado para quien usa la app (no es un registro técnico:
   ese está en CHANGELOG.md). Al actualizarse, se muestra una vez en la portada.
   Para publicar una versión con novedades: subir APPVER y agregar su entrada arriba de NEWS.
   ========================================================= */
const APPVER = '2.3.0';
const NEWS = [
  { v: '2.3.0', date: '2026-10-30', items: [
    ['🧭', 'Recorrido con Poli', 'Poli te muestra todo lo que puedes hacer. Está en la portada cuando quieras.'],
    ['📈', 'Elige qué repasa', 'En <b>Mi avance</b> personalizas el Repaso del día, con candado para adultos.'],
    ['✨', 'Novedades', 'Te contamos lo nuevo de cada versión, como este mensaje.'],
  ] },
  { v: '2.2.0', date: '2026-10-29', items: [
    ['👧', 'Un perfil por hijo o hija', 'Cada uno con sus estrellas y su avance. Poli pregunta <b>¿Quién va a jugar?</b>'],
    ['📈', 'Mi avance', 'Cómo va en cada tema y cuáles conviene reforzar.'],
    ['📱', 'Instálala y úsala sin internet', 'Queda con su ícono y se actualiza sola.'],
    ['🔁', 'Repaso del día', '5 preguntas de lo aprendido, con más de lo que más le cuesta.'],
  ] },
  { v: '1.3.0', date: '2026-10-29', items: [
    ['🔢', 'Capítulo 3: Números', 'Unidad, decena y centena, valor posicional, tabla del 1000 y secuencias.'],
    ['💡', 'Sumas C + D + U con ayuda', 'Si se complica, el botón Ayuda muestra cuánto vale cada parte.'],
  ] },
  { v: '1.1.0', date: '2026-10-28', items: [
    ['🔷', 'Capítulos 1 y 2', 'Polígonos y figuras 2D y 3D, con figuras que se pueden girar y pintar.'],
  ] },
];
const NEWSKEY = 'poli-novedades-visto'; // por dispositivo: la ventana aparece una vez, no una por perfil
const verNum = v => v.split('.').reduce((a, n) => a * 1000 + +n, 0);
const fmtDate = d => { const [y, m, dd] = d.split('-').map(Number); return `${dd} de ${['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][m - 1]} de ${y}`; };
const newsItems = items => `<ul class="nlist">${items.map(([e, t, d]) => `<li><span class="ne">${e}</span><span><b>${t}</b><small>${d}</small></span></li>`).join('')}</ul>`;

/* ventana de novedades (una vez por versión). Quien instala por primera vez no la ve: para esa persona todo es nuevo */
function maybeShowNews() {
  let seen = null;
  try { seen = localStorage.getItem(NEWSKEY); } catch (e) { }
  const remember = () => { try { localStorage.setItem(NEWSKEY, APPVER); } catch (e) { } };
  if (!seen) { if (!root.order.length) return remember(); seen = '2.2.0'; } // ya usaba la app antes de que existieran las novedades
  const fresh = NEWS.filter(n => verNum(n.v) > verNum(seen));
  if (!fresh.length) return remember();
  const ov = document.createElement('div');
  ov.className = 'modal';
  ov.innerHTML = `<div class="mcard" role="dialog" aria-label="Novedades"><div class="mpoli">${POLI_SVG}</div>
    <h2>✨ ¡Aprende con Poli tiene novedades!</h2><div class="mscroll">${newsItems(fresh.flatMap(n => n.items))}</div>
    <button class="btn gold" id="mOk">¡Genial!</button><button class="tinybtn" id="mAll">Ver todas las novedades</button></div>`;
  $('#app').appendChild(ov);
  const close = () => { remember(); ov.remove(); };
  $('#mOk', ov).onclick = () => { sfx.pop(); close(); };
  $('#mAll', ov).onclick = () => { close(); go('news', { from: cur.name }); };
  sfx.star();
}

/* pantalla de historial: lo que importa al usar la app, por fecha */
function viewNews() {
  try { localStorage.setItem(NEWSKEY, APPVER); } catch (e) { }
  frame(`<div class="pwrap">${NEWS.map((n, i) => `<div class="ncard ${i ? '' : 'top'}"><div class="nhead"><span class="ndate">${fmtDate(n.date)}</span>${i ? '' : '<span class="nnew">Lo más nuevo</span>'}</div>${newsItems(n.items)}</div>`).join('')}
    <p class="pnote">Aprende con Poli es gratis, sin publicidad y sin cuentas. Tu progreso se queda en este dispositivo.</p></div>`, 'fill');
  poli.say('Estas son las novedades de Aprende con Poli.', false);
}
