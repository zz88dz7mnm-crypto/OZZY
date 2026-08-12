// Conexión a Supabase para las funciones del servidor.
//
// Usa la service_role key, que saltea las políticas RLS. Por eso este
// archivo SOLO puede usarse del lado del servidor (carpeta /api).
// Si esta clave llegara al navegador, cualquiera tendría acceso total
// a la base: nunca importar esto desde el HTML ni desde js/.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

let cliente = null;

export function db() {
  if (!url || !key) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_KEY');
  }
  if (!cliente) {
    cliente = createClient(url, key, { auth: { persistSession: false } });
  }
  return cliente;
}
