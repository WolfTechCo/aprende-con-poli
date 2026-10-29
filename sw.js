'use strict';
/* Service worker: guarda los archivos de la app para que funcione sin internet.
   - Solo guarda y entrega archivos de la propia app (nada de otros sitios).
   - Al publicar una versión nueva: subir VERSION aquí y el ?v= en index.html (deben coincidir).
     El navegador detecta el cambio, guarda la versión nueva y borra la anterior.
   - El progreso (localStorage) NO se toca: está en otro lugar del dispositivo. */
const VERSION = 'v19';
const CACHE = 'poli-' + VERSION;
const FILES = [
  './', './index.html', './manifest.webmanifest',
  `./css/style.css?v=${VERSION.slice(1)}`, `./js/app.js?v=${VERSION.slice(1)}`, `./js/numeros.js?v=${VERSION.slice(1)}`, `./js/repaso.js?v=${VERSION.slice(1)}`,
  './fonts/baloo2-latin.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  // cache: 'reload' evita copiar archivos viejos que el navegador tenga guardados
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('poli-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // otros sitios: no se tocan
  // abrir la app (también sin internet): siempre la página guardada
  if (req.mode === 'navigate') { e.respondWith(caches.match('./index.html').then(r => r || fetch(req))); return; }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
