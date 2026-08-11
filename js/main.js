// OZZY Sushi — interacciones
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar: fondo sólido al scrollear ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menú mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    const closeMenu = () => {
      navToggle.classList.remove('is-open');
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  }

  /* ---------- Scroll reveal (con pequeño stagger por tarjeta) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const i = [...entry.target.parentElement.children].indexOf(entry.target);
            entry.target.style.transitionDelay = `${Math.min(i, 5) * 60}ms`;
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
  // Red de seguridad: si por lo que sea el observer no llegó a mostrar algo
  // (scroll saltado, navegador raro, etc.), a los 2.5s se muestra igual.
  // Así el contenido nunca queda invisible de forma permanente.
  window.setTimeout(() => {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }, 2500);

  /* ---------- Scroll-spy: resalta el link activo en el navbar ---------- */
  const sections = document.querySelectorAll('section[id]');
  const spyLinks = document.querySelectorAll('.nav-links a');
  if ('IntersectionObserver' in window && sections.length && spyLinks.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          spyLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '76px'} 0px -60% 0px` }
    );
    sections.forEach((s) => spy.observe(s));
  }
});
