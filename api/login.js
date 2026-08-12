// POST /api/login — valida usuario y contraseña contra la base.
//
// La validación pasa SIEMPRE por acá, nunca en el navegador: el código
// del navegador lo puede leer cualquiera, así que una contraseña
// comparada ahí no protege nada.
import bcrypt from 'bcryptjs';
import { db } from './_lib/db.js';
import { crearCookie } from './_lib/sesion.js';

// Freno de intentos por IP. Vive en memoria, así que se reinicia cuando
// la función se apaga y no se comparte entre instancias: no es una
// defensa completa, pero encarece bastante probar contraseñas a lo bruto.
// La defensa principal es bcrypt con coste 12 (~250ms por intento).
const intentos = new Map();
const MAX_INTENTOS = 8;
const VENTANA_MS = 10 * 60 * 1000;

function demasiadosIntentos(ip) {
  const ahora = Date.now();
  const registro = intentos.get(ip);
  if (!registro || ahora - registro.desde > VENTANA_MS) {
    intentos.set(ip, { desde: ahora, cuenta: 1 });
    return false;
  }
  registro.cuenta += 1;
  return registro.cuenta > MAX_INTENTOS;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconocida';
  if (demasiadosIntentos(ip)) {
    return res.status(429).json({ error: 'Demasiados intentos. Esperá unos minutos.' });
  }

  const { usuario, clave } = req.body || {};
  if (typeof usuario !== 'string' || typeof clave !== 'string' || !usuario || !clave) {
    return res.status(400).json({ error: 'Faltan datos.' });
  }

  // Ni el usuario ni la contraseña distinguen mayúsculas de minúsculas:
  // se pasan a minúscula acá y también al crearlas, así siempre coinciden.
  const usuarioNorm = usuario.trim().toLowerCase();
  const claveNorm = clave.toLowerCase();

  try {
    const supabase = db();
    const { data, error } = await supabase
      .from('usuarios')
      .select('usuario, clave_hash')
      .eq('usuario', usuarioNorm)
      .maybeSingle();

    if (error) throw error;

    // Si el usuario no existe igual comparamos contra un hash de mentira.
    // Así responder tarda lo mismo exista o no, y no se puede averiguar
    // qué usuarios son válidos midiendo el tiempo de respuesta.
    const hash = data?.clave_hash || '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
    const ok = await bcrypt.compare(claveNorm, hash);

    // Mensaje único a propósito: no decimos si falló el usuario o la clave.
    if (!data || !ok) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    await supabase
      .from('usuarios')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('usuario', usuarioNorm);

    intentos.delete(ip);
    res.setHeader('Set-Cookie', crearCookie(usuarioNorm));
    return res.status(200).json({ ok: true, usuario: usuarioNorm });
  } catch (e) {
    console.error('Error en login:', e.message);
    return res.status(500).json({ error: 'No se pudo iniciar sesión.' });
  }
}
