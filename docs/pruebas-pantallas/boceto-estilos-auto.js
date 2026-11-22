/* Boceto: el mismo autito en 3 estilos sacados de la referencia privada (repositorio poli-referencias, análisis de Tuts+).
   No se carga en la app. Uso en Node: require('./boceto-estilos-auto.js').autos → { contorno, gel, plano } (i = color).
   - contorno: el ejemplo del 22-11-2026 (contorno grueso ciruela, sombra recortada, brillos marcados).
   - gel: «gomita» brillante (ref. 07): degradado de volumen, contorno del mismo color más oscuro, brillos curvos,
     ojos grandes con dos brillos, sombra difusa en el suelo.
   - plano: frutas planas (ref. 10): sin contorno, color plano, mitad de abajo más oscura, caritas de puntitos. */
(function (root) {
  const COL = [ // claro, base, oscuro, contorno
    ['#ffc4cf', '#ff7a90', '#e04764', '#a82444'], ['#c4f5e4', '#5fd6b0', '#2fae86', '#1d7a5c'], ['#fff1b0', '#ffcf3d', '#f0a500', '#b27600'],
    ['#e2d6ff', '#a88cff', '#7a5ce0', '#4f36a8'], ['#cde9ff', '#62b6ff', '#2f86e0', '#1d5aa8']];
  const BODY = 'M14 60Q12 45 27 42L38 40Q44 17 66 15Q88 14 95 38L102 40Q113 43 111 58Q111 69 100 69L23 69Q14 69 14 60Z';
  const WF = 'M68 21.5Q83 21.5 88.5 38L68 38Z', WB = 'M45 38Q48 23 62 21.5L62 38Z';
  function gel(i = 0) {
    const [l, b, d, o] = COL[i % 5], id = 'g' + i;
    return `<defs>
      <radialGradient id="${id}b" cx=".38" cy=".22" r=".95"><stop offset="0" stop-color="${l}"/><stop offset=".45" stop-color="${b}"/><stop offset="1" stop-color="${d}"/></radialGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9fd4ff"/></linearGradient>
      <radialGradient id="${id}r" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#6a5a80"/><stop offset="1" stop-color="#2a2238"/></radialGradient>
      <radialGradient id="${id}e" cx=".5" cy=".75" r=".7"><stop offset="0" stop-color="#7a4a6e"/><stop offset=".6" stop-color="#3a1f3a"/><stop offset="1" stop-color="#241326"/></radialGradient>
      <radialGradient id="${id}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3a2a5a" stop-opacity=".32"/><stop offset="1" stop-color="#3a2a5a" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}k" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff5c8a" stop-opacity=".7"/><stop offset="1" stop-color="#ff5c8a" stop-opacity="0"/></radialGradient></defs>`
      + `<ellipse cx="62" cy="81" rx="56" ry="8" fill="url(#${id}s)"/>`
      + `<path d="M66 15V8" stroke="${o}" stroke-width="2.2" stroke-linecap="round"/><path d="M66 9C63.6 5.4 59.4 7 61.6 10.6L66 14.6L70.4 10.6C72.6 7 68.4 5.4 66 9Z" fill="#ff7aa8" stroke="#c23c6e" stroke-width="1.4"/><ellipse cx="63.4" cy="8.6" rx="1.2" ry=".8" fill="#fff"/>`
      + `<path d="${BODY}" fill="url(#${id}b)" stroke="${o}" stroke-width="2" stroke-linejoin="round"/>`
      + `<path d="${WB}" fill="url(#${id}w)" stroke="${o}" stroke-width="1.6" stroke-linejoin="round"/><path d="${WF}" fill="url(#${id}w)" stroke="${o}" stroke-width="1.6" stroke-linejoin="round"/>`
      + `<path d="M49 34L55 25.5M53 35L57 29.5M72 33L77 25.5" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>`
      // brillos de gel: arco grande arriba, línea en el costado y puntito
      + `<path d="M42 30Q48 18 62 17" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".85"/><path d="M20 49Q26 44.5 35 44" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/><circle cx="17.5" cy="53" r="1.4" fill="#fff" opacity=".8"/>`
      + `<path d="M18 63Q40 66.5 100 64" fill="none" stroke="${d}" stroke-width="2" stroke-linecap="round" opacity=".5"/>`
      + `<rect x="104" y="46" width="6" height="8" rx="3" fill="#fff6b8" stroke="${o}" stroke-width="1.4"/><circle cx="106.5" cy="48.5" r="1" fill="#fff"/>`
      + [34, 91].map(x => `<circle cx="${x}" cy="68" r="12.5" fill="url(#${id}r)" stroke="#20182e" stroke-width="1.4"/><circle cx="${x}" cy="68" r="5.4" fill="#e6e2f5" stroke="#9a92b8" stroke-width="1"/><path d="M${x - 8} ${62}Q${x - 5} ${58.5} ${x} ${58}" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".55"/>`).join('')
      // cara: ojos grandes con iris oscuro degradado, dos brillos, pestañita; boca abierta con lengua; mejillas difusas
      + [70, 89].map(x => `<ellipse cx="${x}" cy="47" rx="5.2" ry="6.2" fill="url(#${id}e)"/><circle cx="${x + 1.6}" cy="44.6" r="2.2" fill="#fff"/><circle cx="${x - 1.8}" cy="49.6" r="1" fill="#fff"/>`).join('')
      + `<path d="M76.6 52.6Q79.5 57.2 82.4 52.6Z" fill="#7a2a44"/><path d="M77.8 54.6Q79.5 56.4 81.2 54.6" fill="#ff8fab"/>`
      + `<ellipse cx="62.5" cy="54" rx="5" ry="3.2" fill="url(#${id}k)"/><ellipse cx="96.5" cy="54" rx="5" ry="3.2" fill="url(#${id}k)"/>`;
  }
  function plano(i = 0) {
    const [l, b, d] = COL[i % 5], id = 'p' + i;
    return `<defs><clipPath id="${id}c"><path d="${BODY}"/></clipPath></defs>`
      + `<ellipse cx="62" cy="80" rx="46" ry="4.5" fill="#3a2a5a" opacity=".1"/>`
      + `<path d="${BODY}" fill="${b}"/><g clip-path="url(#${id}c)"><rect x="0" y="56" width="120" height="20" fill="${d}"/></g>`
      + `<path d="${WB}" fill="#e6f4ff"/><path d="${WF}" fill="#e6f4ff"/><path d="M62 21.5V38M68 21.5V38" stroke="${b}" stroke-width="0"/>`
      + `<path d="M44 26Q50 18 60 17" fill="none" stroke="${l}" stroke-width="3.4" stroke-linecap="round"/>`
      + `<rect x="104" y="46" width="6" height="8" rx="3" fill="#fff6b8"/>`
      + [34, 91].map(x => `<circle cx="${x}" cy="68" r="12" fill="#4a3d5e"/><circle cx="${x}" cy="68" r="5" fill="#d9d4ea"/>`).join('')
      + `<circle cx="72" cy="48" r="2.4" fill="#2b2238"/><circle cx="87" cy="48" r="2.4" fill="#2b2238"/><path d="M77.4 51.2Q79.5 53.6 81.6 51.2" fill="none" stroke="#2b2238" stroke-width="1.5" stroke-linecap="round"/>`
      + `<ellipse cx="67.5" cy="52" rx="3" ry="1.8" fill="#ff8fab" opacity=".8"/><ellipse cx="91.5" cy="52" rx="3" ry="1.8" fill="#ff8fab" opacity=".8"/>`;
  }
  let contorno = null;
  try { contorno = (typeof window !== 'undefined' ? window : require('./boceto-kawaii.js')).BOCETO_KW.car; } catch (e) { }
  root.autos = { gel, plano, contorno: (i = 0, fino = true) => contorno ? contorno(i, fino) : '' };
})(typeof window !== 'undefined' ? window : module.exports);
