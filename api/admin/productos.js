// /api/admin/productos — alta, edición y baja de productos.
// Todo acá exige sesión válida.
//
//   GET     → carta completa, incluidos los ocultos (para el panel)
//   POST    → crea un producto
//   PATCH   → edita un producto  (?id=123)
//   DELETE  → borra un producto  (?id=123)
import { db } from '../_lib/db.js';
import { exigirSesion } from '../_lib/sesion.js';

const LARGO_MAX = { nombre: 120, aclaracion: 60, descripcion: 400, precio: 40 };

/** Limpia y valida lo que llega del panel. */
function limpiarCampos(cuerpo, { exigirNombre }) {
  const limpio = {};

  for (const campo of ['nombre', 'aclaracion', 'descripcion', 'precio']) {
    if (!(campo in cuerpo)) continue;
    const valor = cuerpo[campo];
    if (valor === null || valor === '') {
      limpio[campo] = null;
      continue;
    }
    if (typeof valor !== 'string') return { error: `El campo ${campo} tiene que ser texto.` };
    const recortado = valor.trim();
    if (recortado.length > LARGO_MAX[campo]) {
      return { error: `El campo ${campo} no puede pasar de ${LARGO_MAX[campo]} caracteres.` };
    }
    limpio[campo] = recortado;
  }

  if ('categoria_id' in cuerpo) {
    const id = Number(cuerpo.categoria_id);
    if (!Number.isInteger(id) || id <= 0) return { error: 'Categoría inválida.' };
    limpio.categoria_id = id;
  }
  if ('orden' in cuerpo) {
    const n = Number(cuerpo.orden);
    if (!Number.isFinite(n)) return { error: 'Orden inválido.' };
    limpio.orden = Math.trunc(n);
  }
  if ('visible' in cuerpo) {
    limpio.visible = Boolean(cuerpo.visible);
  }

  if (exigirNombre && !limpio.nombre) return { error: 'El nombre no puede quedar vacío.' };
  if (!exigirNombre && 'nombre' in limpio && !limpio.nombre) {
    return { error: 'El nombre no puede quedar vacío.' };
  }

  return { limpio };
}

export default async function handler(req, res) {
  if (exigirSesion(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');

  const supabase = db();
  const id = req.query?.id ? Number(req.query.id) : null;

  try {
    if (req.method === 'GET') {
      const [categorias, productos] = await Promise.all([
        supabase.from('categorias').select('*').order('orden'),
        supabase.from('productos').select('*').order('orden'),
      ]);
      if (categorias.error) throw categorias.error;
      if (productos.error) throw productos.error;
      return res.status(200).json({ categorias: categorias.data, productos: productos.data });
    }

    if (req.method === 'POST') {
      const { limpio, error } = limpiarCampos(req.body || {}, { exigirNombre: true });
      if (error) return res.status(400).json({ error });
      if (!limpio.categoria_id) return res.status(400).json({ error: 'Falta la categoría.' });

      // Si no mandan orden, lo ponemos último dentro de su categoría.
      if (limpio.orden === undefined) {
        const { data } = await supabase
          .from('productos')
          .select('orden')
          .eq('categoria_id', limpio.categoria_id)
          .order('orden', { ascending: false })
          .limit(1);
        limpio.orden = (data?.[0]?.orden ?? 0) + 1;
      }

      const { data, error: errIns } = await supabase
        .from('productos').insert(limpio).select().single();
      if (errIns) throw errIns;
      return res.status(201).json({ producto: data });
    }

    if (req.method === 'PATCH') {
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'Falta el id.' });
      const { limpio, error } = limpiarCampos(req.body || {}, { exigirNombre: false });
      if (error) return res.status(400).json({ error });
      if (!Object.keys(limpio).length) return res.status(400).json({ error: 'No hay nada para cambiar.' });

      limpio.editado_en = new Date().toISOString();
      const { data, error: errUpd } = await supabase
        .from('productos').update(limpio).eq('id', id).select().single();
      if (errUpd) throw errUpd;
      if (!data) return res.status(404).json({ error: 'No existe ese producto.' });
      return res.status(200).json({ producto: data });
    }

    if (req.method === 'DELETE') {
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'Falta el id.' });
      const { error: errDel } = await supabase.from('productos').delete().eq('id', id);
      if (errDel) throw errDel;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    console.error('Error en productos:', e.message);
    return res.status(500).json({ error: 'No se pudo completar la operación.' });
  }
}
