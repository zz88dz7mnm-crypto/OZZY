// GET /api/sesion — dice si la cookie actual sigue siendo válida.
// El panel lo usa al abrir, para mostrar el login o la carta.
import { usuarioDeLaSesion } from './_lib/sesion.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const usuario = usuarioDeLaSesion(req);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ activa: Boolean(usuario), usuario: usuario || null });
}
