// POST /api/logout — cierra la sesión borrando la cookie.
import { borrarCookie } from './_lib/sesion.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  res.setHeader('Set-Cookie', borrarCookie());
  return res.status(200).json({ ok: true });
}
