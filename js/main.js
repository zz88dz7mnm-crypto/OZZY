// OZZY Sushi — reveal al scrollear, sin dependencias.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduce || !('IntersectionObserver' in window) || !nodes.length) return;
  function show(el, delay) {
    if (el.dataset.revealed === '1') return;
    el.dataset.revealed = '1';
    setTimeout(function () { el.style.opacity = '1'; el.style.transform = 'none'; }, delay || 0);
  }
  function showIfNear() {
    var h = window.innerHeight || 800;
    nodes.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < h * 1.05 && r.bottom > -h * 0.2) show(el);
    });
  }
  nodes.forEach(function (el) {
    el.style.opacity = '0';
    // data-reveal="left" entra deslizándose desde el costado; el resto sube.
    // El recorrido es un % del propio ancho: con pocos px el movimiento
    // pasa desapercibido en una foto grande como la del roll.
    var fromLeft = el.getAttribute('data-reveal') === 'left';
    el.style.transform = fromLeft ? 'translateX(-78%)' : 'translateY(20px)';
    el.style.transition = fromLeft
      ? 'opacity .75s ease-out, transform 1.05s cubic-bezier(.16,.84,.28,1)'
      : 'opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)';
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e, i) { if (e.isIntersecting) { show(e.target, i * 70); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  nodes.forEach(function (el) { io.observe(el); });
  // Un respiro antes de arrancar: si empieza en el primer frame, la
  // animación termina antes de que el ojo llegue a la foto.
  setTimeout(showIfNear, 260);
  window.addEventListener('scroll', showIfNear, { passive: true });
  setTimeout(showIfNear, 600);
  setTimeout(function () { nodes.forEach(function (el) { show(el); }); }, 2500);
})();
