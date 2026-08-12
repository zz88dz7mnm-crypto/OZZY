// Dibuja la carta con los datos de la base (/api/carta).
//
// La carta que viene escrita en index.html queda como RESPALDO: si la
// base no contesta, el visitante igual ve la carta (vieja, pero la ve).
// Recién si la respuesta llega bien se reemplaza por la actualizada.
(function () {
  var grid = document.querySelector('[data-carta-grid]');
  if (!grid) return;

  // Escapa el texto antes de meterlo en el HTML. Aunque solo escriba
  // gente del negocio desde el panel, un nombre con < o & rompería la
  // maquetación, y esto cierra la puerta a inyectar HTML.
  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var E = {
    h3: "margin:0 0 6px; font-family:'Bricolage Grotesque',system-ui,sans-serif; font-weight:800; font-size:26px; letter-spacing:-0.02em;",
    precioGrupo: "font-family:'Newsreader',Georgia,serif; font-weight:500; font-style:italic; font-size:19px; letter-spacing:0;",
    sub: "margin:0 0 20px; font-style:italic; color:#4a4238; font-size:17px;",
    ulLista: 'list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:18px;',
    ulGrupo: 'list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:16px;',
    liLista: 'border-top:1px solid #cfc4b1; padding-top:14px;',
    liGrupo: 'border-top:1px solid #cfc4b1; padding-top:13px;',
    fila: 'display:flex; align-items:baseline; gap:8px;',
    nombre: "font-family:'Bricolage Grotesque',system-ui,sans-serif; font-weight:600; font-size:20px;",
    nombreGrupo: "display:block; font-family:'Bricolage Grotesque',system-ui,sans-serif; font-weight:600; font-size:20px;",
    puntos: 'flex:1; border-bottom:1.5px dotted #b3a894; transform:translateY(-4px);',
    precio: "font-family:'Bricolage Grotesque',system-ui,sans-serif; font-weight:800; font-size:21px;",
    desc: 'margin:6px 0 0; font-size:17px; line-height:1.5; color:#413a31; max-width:44ch;',
    descGrupo: 'margin:5px 0 0; font-size:17px; line-height:1.5; color:#413a31;',
    aclaracion: "font-family:'Newsreader',Georgia,serif; font-style:italic; font-weight:400; font-size:18px;",
    // especiales
    espNombre: "font-family:'Bricolage Grotesque',system-ui,sans-serif; font-weight:600; font-size:21px;",
    espPrecio: "font-family:'Bricolage Grotesque',system-ui,sans-serif; font-weight:800; font-size:22px;",
    espDesc: 'margin:6px 0 0; font-size:17px; line-height:1.5; color:#413a31; max-width:46ch;',
    chip: "font-family:'Newsreader',Georgia,serif; font-size:16px; padding:8px 14px; border:2px solid #16130f; border-radius:999px;",
  };

  function nombreConAclaracion(p, estilo) {
    var t = esc(p.nombre);
    if (p.aclaracion) t += ' <span style="' + E.aclaracion + '">' + esc(p.aclaracion) + '</span>';
    return '<span style="' + estilo + '">' + t + '</span>';
  }

  // Producto con su propio precio (Entradas, Gohan, Especiales)
  function itemConPrecio(p, esEspecial) {
    return '<li style="' + E.liLista + '">' +
      '<div style="' + E.fila + '">' +
        nombreConAclaracion(p, esEspecial ? E.espNombre : E.nombre) +
        '<span aria-hidden="true" style="' + E.puntos + '"></span>' +
        (p.precio ? '<span style="' + (esEspecial ? E.espPrecio : E.precio) + '">' + esc(p.precio) + '</span>' : '') +
      '</div>' +
      (p.descripcion ? '<p style="' + (esEspecial ? E.espDesc : E.desc) + '">' + esc(p.descripcion) + '</p>' : '') +
    '</li>';
  }

  // Producto sin precio propio (Rolls simples / premium: el precio va en el título)
  function itemSinPrecio(p) {
    return '<li style="' + E.liGrupo + '">' +
      '<span style="' + E.nombreGrupo + '">' + esc(p.nombre) +
        (p.aclaracion ? ' <span style="' + E.aclaracion + '">' + esc(p.aclaracion) + '</span>' : '') +
      '</span>' +
      (p.descripcion ? '<p style="' + E.descGrupo + '">' + esc(p.descripcion) + '</p>' : '') +
    '</li>';
  }

  function columna(cat) {
    var esGrupo = cat.tipo === 'grupo';
    var titulo = esc(cat.nombre);
    if (esGrupo && cat.precioGrupo) {
      titulo += ' <span style="' + E.precioGrupo + '">' + esc(cat.precioGrupo) + '</span>';
    }
    var div = document.createElement('div');
    div.setAttribute('data-reveal', '');
    div.innerHTML =
      '<h3 style="' + E.h3 + '">' + titulo + '</h3>' +
      (cat.subtitulo ? '<p style="' + E.sub + '">' + esc(cat.subtitulo) + '</p>' : '') +
      '<ul style="' + (esGrupo ? E.ulGrupo : E.ulLista) + '">' +
        cat.productos.map(esGrupo ? itemSinPrecio : function (p) { return itemConPrecio(p, false); }).join('') +
      '</ul>';
    return div;
  }

  function pintar(carta) {
    var columnas = carta.filter(function (c) { return c.tipo === 'lista' || c.tipo === 'grupo'; });
    // Si la base viniera vacía, no borramos la carta de respaldo.
    if (!columnas.length) return;

    grid.textContent = '';
    columnas.forEach(function (c) { grid.appendChild(columna(c)); });

    var esp = carta.find(function (c) { return c.tipo === 'destacado'; });
    if (esp) {
      var t = document.querySelector('[data-esp-titulo]');
      var s = document.querySelector('[data-esp-sub]');
      var l = document.querySelector('[data-esp-lista]');
      if (t) t.textContent = esp.nombre;
      if (s) s.textContent = esp.subtitulo || '';
      if (l) l.innerHTML = esp.productos.map(function (p) { return itemConPrecio(p, true); }).join('');
    }

    var extras = carta.find(function (c) { return c.tipo === 'chips'; });
    var cont = document.querySelector('[data-extras]');
    if (extras && cont) {
      cont.innerHTML = extras.productos.map(function (p) {
        return '<span style="' + E.chip + '">' + esc(p.nombre) + '</span>';
      }).join('');
    }

    // Lo recién dibujado no pasó por el observador de animaciones:
    // se muestra directo para que no quede invisible.
    document.querySelectorAll('#carta [data-reveal]').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.dataset.revealed = '1';
    });
  }

  fetch('/api/carta', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)); })
    .then(function (d) { if (d && Array.isArray(d.carta)) pintar(d.carta); })
    .catch(function (e) {
      // Silencio a propósito: queda la carta de respaldo del HTML.
      console.warn('No se pudo traer la carta actualizada, se muestra la guardada.', e.message);
    });
})();
