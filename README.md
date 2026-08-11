# OZZY Sushi 🔥

Landing page oficial de **OZZY Sushi** (Córdoba, Argentina) — sushi moderno, street & fusión.
Sitio estático (HTML + CSS + JS, sin build ni base de datos) que centraliza todo lo que hoy
está disperso en el link de Instagram: la carta, los precios, el Take Away, PedidosYa y el
pedido directo por WhatsApp.

## Estructura

```
.
├── index.html        # Toda la página (una sola landing)
├── css/style.css      # Estilos (diseño, animaciones, responsive)
├── js/main.js          # Interacciones (menú tabs, scroll reveal, navbar)
└── README.md
```

No hay proceso de build: es HTML/CSS/JS plano, así que se puede abrir `index.html`
directo en el navegador o servirlo con cualquier servidor estático.

## Ver el sitio en local

```bash
# Opción simple, con Python
python3 -m http.server 5500
# luego abrir http://localhost:5500
```

## Deploy en Vercel (zero-config)

Al ser un sitio 100% estático, Vercel lo detecta automáticamente — no hace falta
`vercel.json` ni comando de build.

1. Entrar a [vercel.com](https://vercel.com) e iniciar sesión con la cuenta de GitHub.
2. **Add New → Project**.
3. Elegir el repo `zz88dz7mnm-crypto/ozzy` e importarlo.
4. Framework Preset: **Other** (o "Static"). Build Command y Output Directory: dejar
   en blanco (no aplica).
5. **Deploy**.

A partir de ahí, **cada push a la rama `main` dispara un deploy automático** en
Vercel — no hay que hacer nada más para que la página en producción se actualice.

## Estado del proyecto

Sitio en construcción activa, commit a commit:

- [x] Estructura base + SEO/meta tags
- [x] Diseño (hero, navbar, sistema de colores/tipografía)
- [x] Carta completa con precios
- [x] Pedí (WhatsApp / Take Away / PedidosYa) + Ubicación
- [ ] Animaciones e interacciones
- [ ] Responsive final + pulido
