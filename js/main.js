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
    var fromLeft = el.getAttribute('data-reveal') === 'left';
    el.style.transform = fromLeft ? 'translateX(-64px)' : 'translateY(20px)';
    el.style.transition = fromLeft
      ? 'opacity .7s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1)'
      : 'opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)';
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e, i) { if (e.isIntersecting) { show(e.target, i * 70); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  nodes.forEach(function (el) { io.observe(el); });
  requestAnimationFrame(showIfNear);
  window.addEventListener('scroll', showIfNear, { passive: true });
  setTimeout(showIfNear, 600);
  setTimeout(function () { nodes.forEach(function (el) { show(el); }); }, 2500);
})();
