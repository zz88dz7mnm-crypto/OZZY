// GET /api/carta — la carta completa, pública (la usa la página).
// Devuelve solo lo visible y ya ordenado, para que el navegador no
// tenga que filtrar ni ordenar nada.
import { db } from './_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const supabase = db();

    const [categorias, productos] = await Promise.all([
      supabase.from('categorias').select('*').eq('visible', true).order('orden'),
      supabase.from('productos').select('*').eq('visible', true).order('orden'),
    ]);

    if (categorias.error) throw categorias.error;
    if (productos.error) throw productos.error;

    const carta = categorias.data.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      subtitulo: c.subtitulo,
      precioGrupo: c.precio_grupo,
      tipo: c.tipo,
      productos: productos.data
        .filter((p) => p.categoria_id === c.id)
        .map((p) => ({
          id: p.id,
          nombre: p.nombre,
          aclaracion: p.aclaracion,
          descripcion: p.descripcion,
          precio: p.precio,
        })),
    }));

    // Cacheo corto en el CDN de Vercel: la carta se sirve al instante y,
    // apenas se edita algo, como mucho tarda un minuto en actualizarse.
    // stale-while-revalidate: mientras refresca sigue sirviendo la vieja,
    // así nadie ve la página sin carta.
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600');
    return res.status(200).json({ carta });
  } catch (e) {
    console.error('Error leyendo la carta:', e.message);
    return res.status(500).json({ error: 'No se pudo leer la carta.' });
  }
}
