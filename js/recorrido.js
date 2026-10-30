'use strict';
/* =========================================================
   Recorrido con Poli: muestra las partes importantes de la app.
   - Se ilumina una parte y la niña toca la varita ✨ para seguir (lo de abajo no se activa).
   - El recorrido del mapa usa un mapa de muestra que no se guarda ni toca el progreso.
   - TOURVER: si la estructura de la app cambia harto (secciones nuevas, botones que se mueven),
     se sube este número y el recorrido vuelve a aparecer una vez. Lo mismo con TOURVER_AJ para Ajustes.
   ========================================================= */
const TOURVER = 1, TOURVER_AJ = 1;
const TOURKEY = 'poli-recorrido-visto', TOURAJKEY = 'poli-recorrido-ajustes-visto';
const tourSeen = key => { try { return +localStorage.getItem(key) || 0; } catch (e) { return 99; } };
const tourDone = (key, v) => { try { localStorage.setItem(key, v); } catch (e) { } };
let tourOn = false;

/* motor: steps = [{ target: () => elemento | null, say, adult? }] */
function runTour(steps, onEnd) {
  tourOn = true; $('#app').classList.add('touring'); setMenu(false);
  const ov = document.createElement('div');
  ov.className = 'tour';
  ov.innerHTML = `<div class="thole"></div><button class="twand" aria-label="Toca la varita"><span class="tw">🪄</span><small>¡Toca!</small></button>
    <div class="tadult" hidden></div><div class="ttop"><span class="tcount"></span><button class="tskip">Saltar</button></div>`;
  $('#app').appendChild(ov);
  const hole = $('.thole', ov), wand = $('.twand', ov), adult = $('.tadult', ov);
  let i = 0, target = null;
  const place = () => {
    const dock = $('#dock').getBoundingClientRect().top;
    if (target && target.isConnected) {
      const r = target.getBoundingClientRect(), pad = 8;
      Object.assign(hole.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px', opacity: 1 });
      // la varita, al lado de lo iluminado, sin salirse de la pantalla ni tapar la burbuja de Poli
      const w = 74, h = 80;
      let x = r.right + 6, y = r.top + r.height / 2 - h / 2;
      if (x + w > innerWidth - 6) x = r.left - w - 6;
      // lo de arriba (barra, botones): la varita va debajo, centrada
      if (x < 6 || r.top < 90) { x = Math.min(innerWidth - w - 6, Math.max(6, r.left + r.width / 2 - w / 2)); y = r.bottom + 14; }
      if (y + h > dock - 6) y = r.top - h - 10;
      y = Math.max(14, y); // margen para que la varita, al saltar, no se salga por arriba
      Object.assign(wand.style, { left: x + 'px', top: y + 'px' });
    } else {
      Object.assign(hole.style, { left: innerWidth / 2 + 'px', top: innerHeight / 2 + 'px', width: 0, height: 0, opacity: 1 });
      Object.assign(wand.style, { left: innerWidth / 2 - 37 + 'px', top: Math.max(6, dock / 2 - 40) + 'px' });
    }
  };
  const show = async () => {
    const s = steps[i];
    target = s.target ? s.target() : null;
    wand.classList.remove('go');
    if (target) { target.scrollIntoView({ block: 'center', inline: 'nearest' }); await sleep(380); }
    if (!ov.isConnected) return;
    place();
    $('.tcount', ov).textContent = `${i + 1} de ${steps.length}`;
    adult.hidden = !s.adult; adult.textContent = s.adult || '';
    if (s.final) { confetti(110); sfx.win(); poli.cheer(s.say); } else poli.say(s.say);
  };
  const end = () => { if (!ov.isConnected) return; ov.remove(); tourOn = false; $('#app').classList.remove('touring'); removeEventListener('resize', place); onEnd(); };
  wand.onclick = () => {
    sfx.star(); wand.classList.add('go');
    setTimeout(() => { i++; i < steps.length ? show() : end(); }, 260);
  };
  $('.tskip', ov).onclick = () => { sfx.pop(); end(); };
  addEventListener('resize', place);
  show();
}

/* recorrido del mapa, sobre un mapa de muestra (nada de esto se guarda) */
function startMapTour(after) {
  const snap = { save, cur: root.cur, realG: save.g };
  demoMode = true;
  save = Object.assign(NEWSAVE(), { name: snap.save.name || 'Poli', g: snap.realG || '', voice: snap.save.voice, fx: snap.save.fx, ch: 1,
    prog: { intro: { lesson: true }, tri: { lesson: true, build: true, hunt: true }, sq: { lesson: true } } });
  root.cur = root.cur || '__demo';
  go('map');
  const wide = () => getComputedStyle($('.mbtns')).display !== 'none';
  const btn = g => () => wide() ? $(`.mbtns [data-go=${g}]`) : $('#bMenu');
  setTimeout(() => runTour([
    { target: () => $('.chapters'), say: '¡Hola! Aquí eliges qué quieres aprender y jugar hoy. ¡Toca la varita para seguir!' },
    { target: () => $('.node.current'), say: '¡El Gran Desafío te llama! Salta de isla en isla y sigue a la que se mueve… ¡ahí empieza la diversión!' },
    { target: () => $('.node[data-id="tri"]'), say: '¡Junta todas sus estrellas y gana su sticker!' },
    { target: () => $('.node[data-id="challenge"]'), say: 'Al superar todas las islas se abre el Gran Desafío. ¡Si no te sale, inténtalo otra vez!' },
    { target: btn('repaso'), say: '¿Quieres ser todavía más fuerte? 💪 Aquí practicas un poquito de todo lo que aprendiste.' },
    { target: btn('album'), say: 'Aquí guardas tus stickers. ¿Podrás completarlos todos?' },
    { target: btn('avance'), say: `¡Mira todo lo que has avanzado! Aquí ves tus estrellas y en qué eres ${gx('experta', 'experto')}.`,
      adult: 'Para adultos: % de aciertos por tema, qué reforzar y personalizar su Repaso 🔒' },
    { target: btn('parent'), say: 'Esta parte es para tus papás. 🔒', adult: 'Perfiles y respaldo del progreso.' },
    { target: () => $('#btnVoice'), say: '¡Psst! 🤫 Con este parlante decides si Poli habla.' },
    { final: true, say: '¡Listo, ya conoces todo! ✨ En la portada, la estrellita te cuenta las sorpresas nuevas. ¡A jugar!' },
  ], () => {
    demoMode = false; save = snap.save; root.cur = snap.cur;
    tourDone(TOURKEY, TOURVER); after();
  }), 650);
}

/* recorrido de Ajustes (para adultos) */
function startAjustesTour() {
  runTour([
    { target: () => $('#ajKids'), say: 'Aquí agregas niños y niñas, cambias su nombre, indicas niña o niño o borras un perfil.' },
    { target: () => $('#ajNews'), say: 'Aquí está lo nuevo de cada versión de la app.' },
    { target: () => $('#ajBackup'), say: 'Guarda un archivo con el progreso para pasarlo a otro equipo o recuperarlo si se borra.' },
    { target: () => $('#ajInstall'), say: 'Instala la app en el inicio del equipo para usarla sin internet.' },
    { final: true, say: '¡Listo! Puedes repetir este recorrido cuando quieras con el botón de arriba.' },
  ], () => { tourDone(TOURAJKEY, TOURVER_AJ); $('.pwrap')?.scrollTo({ top: 0 }); });
}
