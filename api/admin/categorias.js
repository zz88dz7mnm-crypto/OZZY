// /api/admin/categorias — edición de las categorías de la carta.
//
//   PATCH  → edita una categoría (?id=1): nombre, subtítulo,
//            precio del grupo, orden y si se muestra o no.
//
// No hay alta ni baja a propósito: cada tipo de categoría tiene su
// propia maquetación en la página, así que crear una nueva desde el
// panel dejaría un bloque sin diseño. Si hace falta sumar una,
// se agrega junto con su diseño.
import { db } from '../_lib/db.js';
import { exigirSesion } from '../_lib/sesion.js';

const LARGO_MAX = { nombre: 80, subtitulo: 200, precio_grupo: 40 };

export default async function handler(req, res) {
  if (exigirSesion(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const id = Number(req.query?.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Falta el id.' });

  const cuerpo = req.body || {};
  const limpio = {};

  for (const campo of ['nombre', 'subtitulo', 'precio_grupo']) {
    if (!(campo in cuerpo)) continue;
    const valor = cuerpo[campo];
    if (valor === null || valor === '') { limpio[campo] = null; continue; }
    if (typeof valor !== 'string') return res.status(400).json({ error: `El campo ${campo} tiene que ser texto.` });
    const recortado = valor.trim();
    if (recortado.length > LARGO_MAX[campo]) {
      return res.status(400).json({ error: `El campo ${campo} no puede pasar de ${LARGO_MAX[campo]} caracteres.` });
    }
    limpio[campo] = recortado;
  }
  if ('orden' in cuerpo) {
    const n = Number(cuerpo.orden);
    if (!Number.isFinite(n)) return res.status(400).json({ error: 'Orden inválido.' });
    limpio.orden = Math.trunc(n);
  }
  if ('visible' in cuerpo) limpio.visible = Boolean(cuerpo.visible);

  if ('nombre' in limpio && !limpio.nombre) {
    return res.status(400).json({ error: 'El nombre de la categoría no puede quedar vacío.' });
  }
  if (!Object.keys(limpio).length) return res.status(400).json({ error: 'No hay nada para cambiar.' });

  try {
    const { data, error } = await db()
      .from('categorias').update(limpio).eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'No existe esa categoría.' });
    return res.status(200).json({ categoria: data });
  } catch (e) {
    console.error('Error en categorías:', e.message);
    return res.status(500).json({ error: 'No se pudo guardar la categoría.' });
  }
}
