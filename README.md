# OZZY Sushi 🍣

Sitio de **OZZY Sushi** (Ituzaingó 791, Córdoba) con **panel de administración**
para editar la carta sin tocar código.

## Estructura

```
.
├── index.html         # La página pública
├── admin.html         # Panel de administración (se entra por /admin)
├── css/style.css      # Reset, @keyframes y estados hover/focus
├── js/main.js         # Reveal al scrollear + botón flotante de WhatsApp
├── js/carta.js        # Dibuja la carta con los datos de la base
├── api/               # Funciones del servidor (Vercel)
│   ├── carta.js         # GET público: la carta
│   ├── login.js         # POST: validar usuario y contraseña
│   ├── logout.js        # POST: cerrar sesión
│   ├── sesion.js        # GET: ¿la sesión sigue viva?
│   ├── admin/           # Requieren sesión
│   │   ├── productos.js   # alta, edición, baja, orden, visibilidad
│   │   └── categorias.js  # editar categorías
│   └── _lib/            # Conexión a la base y manejo de sesión
├── db/
│   ├── schema.sql       # Tablas + la carta actual
│   └── crear-usuario.mjs# Crea el usuario del panel
├── assets/img/        # Logo, fotos y favicons
├── vercel.json        # URLs limpias y cabeceras de seguridad
└── robots.txt         # Bloquea /admin y /api de los buscadores
```

---

# Puesta en marcha

Hay que hacerlo una sola vez. Son 4 pasos.

## 1. Crear la base en Supabase

1. Entrar a [supabase.com](https://supabase.com) y crear un proyecto.
2. Ir a **SQL Editor → New query**.
3. Pegar **todo** el contenido de `db/schema.sql` y apretar **Run**.

Eso crea las tablas y carga la carta actual (19 productos en 6 categorías).

## 2. Copiar las claves de Supabase

En Supabase: **Project Settings → API**. Anotar:

| Dato | Dónde está |
|---|---|
| Project URL | arriba de todo |
| `service_role` (secret) | en "Project API keys", hay que revelarla |

> ⚠️ La clave `service_role` da acceso total a la base. **Nunca** va en el repo
> ni se comparte por chat: solo se pega en las variables de entorno de Vercel.

## 3. Cargar las variables en Vercel

En Vercel: **Settings → Environment Variables**. Crear estas tres:

| Nombre | Valor |
|---|---|
| `SUPABASE_URL` | el Project URL del paso 2 |
| `SUPABASE_SERVICE_KEY` | la clave `service_role` del paso 2 |
| `SESSION_SECRET` | texto al azar de 40+ caracteres (ver abajo) |

Para generar el `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Marcar las tres para **Production, Preview y Development**, y después
**Redeploy** para que el sitio las tome.

## 4. Crear el usuario del panel

Desde la computadora, parado en la carpeta del proyecto:

```bash
npm install

SUPABASE_URL="https://xxxx.supabase.co" \
SUPABASE_SERVICE_KEY="la-clave-service-role" \
node db/crear-usuario.mjs ozzy "una-contraseña-larga-y-difícil"
```

La contraseña se guarda **hasheada con bcrypt**: en la base queda un texto
ilegible, no la contraseña. Ni yo ni nadie con acceso a la base puede leerla.
Si se pierde, se corre el mismo comando de nuevo y se pisa por una nueva.

**Listo.** El panel queda en `tudominio.com/admin`.

---

# Cómo funciona

## La carta

La carta vive en la base. La página la pide a `/api/carta` y la dibuja.

En `index.html` queda una copia escrita a mano que funciona de **respaldo**: si
la base no contesta, el visitante igual ve la carta en vez de un hueco. Apenas
la base responde, se reemplaza por la versión al día.

Los cambios del panel se ven en la página en **menos de un minuto** (hay un
cacheo corto en el CDN de Vercel para que la página cargue rápido).

## Qué se puede editar

- Nombres, precios y descripciones
- Agregar y borrar productos
- Cambiar el orden (flechas ↑ ↓)
- Ocultar un producto sin borrarlo (útil cuando se corta un insumo)
- El precio único de "Rolls simples" y "Rolls premium"

Las **categorías no se crean ni se borran** desde el panel a propósito: cada tipo
de categoría tiene su propia maquetación en la página, así que una categoría
nueva quedaría sin diseño. Si hace falta sumar una, se agrega junto con su diseño.

## Seguridad

- La contraseña se valida **en el servidor**, nunca en el navegador. Validarla en
  el navegador no sirve: cualquiera abre el código y la lee.
- En la base se guarda **hasheada con bcrypt** (coste 12), nunca en texto plano.
- La sesión es una cookie **firmada** con `SESSION_SECRET`, `HttpOnly` (el
  JavaScript de la página no puede leerla), `Secure` (solo por HTTPS) y
  `SameSite=Strict` (no viaja desde otros sitios). Dura 8 horas.
- La clave `service_role` **solo existe del lado del servidor**. Nunca llega al
  navegador.
- Las tablas tienen RLS activado y sin políticas: la clave pública de Supabase
  no puede leer ni escribir nada, ni siquiera la tabla de usuarios.
- Login con freno de intentos y mensaje único ("usuario o contraseña
  incorrectos"), para no revelar qué usuarios existen.
- `/admin` va con `noindex` y bloqueado en `robots.txt`.

> Que la dirección sea `/admin` y no esté enlazada **no es** la protección: una
> URL sin enlazar igual se encuentra. Lo que protege es todo lo de arriba.

---

## Ver en local

La página sola (sin panel ni base):

```bash
python3 -m http.server 5500   # http://localhost:5500
```

Con las funciones del servidor andando hace falta la CLI de Vercel:

```bash
npm i -g vercel
vercel dev
```

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
- **Movimiento:** la cinta superior, el roll que entra desde la izquierda y un
  reveal suave. Todo se desactiva con `prefers-reduced-motion`.
- **WhatsApp:** siempre verde, nunca naranja.
