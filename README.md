# OZZY Sushi 🍣

Landing page oficial de **OZZY Sushi** (Ituzaingó 791, Córdoba). Sitio estático:
HTML + CSS + JS plano, sin build, sin base de datos, sin backend.

## Estructura

```
.
├── index.html         # Toda la página
├── css/style.css      # Reset, @keyframes y estados hover/focus
├── js/main.js         # Reveal al scrollear (respeta prefers-reduced-motion)
├── assets/img/        # Logo y fotos reales (.webp) + favicons
└── README.md
```

Los estilos de composición viven inline en `index.html` a propósito: una sola
fuente de verdad por bloque, sin cascada que pelear. `css/style.css` guarda solo
lo que un atributo `style` no puede expresar (hover, focus, keyframes, reset).

## Ver en local

```bash
python3 -m http.server 5500   # luego abrir http://localhost:5500
```

## Deploy

100% estático: Vercel / Netlify / Cloudflare Pages lo detectan sin configuración.
Build Command y Output Directory quedan en blanco.

## Decisiones de diseño (auditoría anti "AI slop")

- **Tipografía:** Bricolage Grotesque (títulos) + Newsreader (cuerpo). Nada de Inter,
  Poppins ni serif itálica de acento.
- **Color:** papel crema cálido, tinta casi negra y un único acento naranja tomado
  del logo. Sin lavanda, sin gradientes, sin glows, sin dark mode permanente.
- **Contraste:** todo el texto pasa WCAG AA sobre su fondo.
- **Layout:** un único primitivo repetido (fila con regla + precio con puntos guía).
  Hero asimétrico, sin badge sobre el H1, sin cards de ícono-arriba, sin stat
  banners, sin secuencias 1-2-3, sin bordes de color decorativos, sin glassmorphism.
- **Íconos:** sprite SVG propio, cero emojis.
- **Movimiento:** un solo elemento animado (la cinta superior) y reveal suave que se
  desactiva con `prefers-reduced-motion`.
- **WhatsApp:** siempre verde, nunca naranja.
