// Sesión del panel: cookie firmada, sin librerías externas.
//
// La cookie guarda "usuario.vencimiento.firma". La firma es un HMAC
// hecho con SESSION_SECRET, que solo conoce el servidor: si alguien
// edita la cookie a mano, la firma deja de coincidir y se rechaza.
//
// Es HttpOnly (el JavaScript de la página no puede leerla, así un XSS
// no se roba la sesión), Secure (solo viaja por HTTPS) y SameSite=Strict
// (no se manda desde otros sitios, lo que corta ataques CSRF).
import crypto from 'node:crypto';

const NOMBRE_COOKIE = 'ozzy_sesion';
const DURACION_HORAS = 8;

function secreto() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error('Falta SESSION_SECRET (mínimo 32 caracteres)');
  }
  return s;
}

function firmar(datos) {
  return crypto.createHmac('sha256', secreto()).update(datos).digest('base64url');
}

export function crearCookie(usuario) {
  const vence = Date.now() + DURACION_HORAS * 60 * 60 * 1000;
  const datos = `${Buffer.from(usuario).toString('base64url')}.${vence}`;
  const valor = `${datos}.${firmar(datos)}`;
  const maxAge = DURACION_HORAS * 60 * 60;
  return `${NOMBRE_COOKIE}=${valor}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function borrarCookie() {
  return `${NOMBRE_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function leerCookie(req) {
  const bruto = req.headers.cookie;
  if (!bruto) return null;
  for (const parte of bruto.split(';')) {
    const [k, ...v] = parte.trim().split('=');
    if (k === NOMBRE_COOKIE) return v.join('=');
  }
  return null;
}

/** Devuelve el nombre de usuario si la sesión es válida, o null. */
export function usuarioDeLaSesion(req) {
  const valor = leerCookie(req);
  if (!valor) return null;

  const partes = valor.split('.');
  if (partes.length !== 3) return null;

  const [usuarioB64, vence, firma] = partes;
  const datos = `${usuarioB64}.${vence}`;

  // Comparación en tiempo constante: comparar con === filtra información
  // por el tiempo que tarda y permite adivinar la firma byte a byte.
  const esperada = firmar(datos);
  const a = Buffer.from(firma);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  if (!Number(vence) || Date.now() > Number(vence)) return null;

  return Buffer.from(usuarioB64, 'base64url').toString('utf8');
}

/**
 * Corta el pedido si no hay sesión válida.
 * Devuelve true si ya respondió (o sea, si hay que frenar).
 */
export function exigirSesion(req, res) {
  if (usuarioDeLaSesion(req)) return false;
  res.status(401).json({ error: 'Necesitás iniciar sesión.' });
  return true;
}
