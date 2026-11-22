'use strict';
/* =========================================================
   Novedades: lo nuevo de cada versión, contado para quien usa la app (no es un registro técnico:
   ese está en CHANGELOG.md). Al actualizarse, se muestra una vez en la portada.
   Para publicar una versión con novedades: subir APPVER y agregar su entrada arriba de NEWS.
   ========================================================= */
const APPVER = '3.2.0';
const NEWS = [
  { v: '3.2.0', date: '2026-11-22', items: [
    ['🍓', 'Multiplicación más linda', 'Los dibujos del capítulo 5 ahora son tiernos y brillantes, con carita: frutas, dulces, autitos, dinosaurios, patitos y más. Cambian cada vez para que no se repitan.'],
    ['✨', 'Se mueven al contar', 'Las cosas aparecen con un saltito, rebotan al tocarlas y se iluminan una a una al contar.'],
  ] },
  { v: '3.1.0', date: '2026-11-21', items: [
    ['✖️', 'Capítulo 5: Multiplicación', 'Se empieza contando de a grupos y se llega a las tablas del <b>2, 5 y 10</b>, con lección, juegos y un Gran Desafío. También entra al Repaso del día y a Mi avance.'],
    ['🖼️', 'Capítulos con dibujito', 'Cada capítulo tiene su ícono, y si no caben todos la fila se desliza. El capítulo nuevo trae la marca <b>¡Nuevo!</b>'],
    ['🏅', 'Lo ganado se queda', 'Las medallas y el rango que ya ganó no se pierden cuando llegan capítulos nuevos.'],
  ] },
  { v: '3.0.0', date: '2026-11-21', items: [
    ['🏆', 'Mis premios', 'Toca las estrellas del mapa: ahí están los stickers, <b>9 medallas</b>, la <b>ropa de Poli</b> que se gana con ellas y un <b>diploma</b> para imprimir.'],
    ['📈', 'Nuevo Mi avance', 'Un camino de colores por tema, para que el niño o la niña vea cómo va. Arriba, lo que practicó hoy.'],
    ['🔒', 'Rincón de adultos', 'Jugadores, temas del Repaso, avance de todos, respaldo y más, en un solo lugar con candado. Está en la portada y en el «+» del mapa.'],
    ['🏠', 'Más fácil de usar', 'Un solo menú «+» en el mapa, una casita para cambiar de jugador y, si hay un solo jugador, la app abre directo en su mapa.'],
  ] },
  { v: '2.4.0', date: '2026-11-21', items: [
    ['🔁', 'Capítulo 4: Patrones', 'Colores, figuras y torres de cubos que crecen, con lección, juegos y un Gran Desafío. También entra al Repaso del día.'],
    ['⭐', 'Cuéntanos qué te parece', 'En <b>Ajustes</b> puedes dar de 0,5 a 5 estrellas y dejar un comentario. Tú ves todo lo que se comparte y no lleva nombres.'],
    ['👋', 'Poli te saluda', 'Según la hora del día. Y si hace días que no practicas, te invita a repasar 5 minutos.'],
    ['🗣️', 'Mejor voz', 'Poli elige la mejor voz en español que tenga tu equipo.'],
  ] },
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
