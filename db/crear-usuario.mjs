/**
 * Crea (o actualiza) el usuario del panel de administración.
 *
 * La contraseña NUNCA se guarda como texto: este script genera un hash
 * bcrypt y guarda solo el hash. Ni yo ni nadie con acceso a la base
 * puede leer la contraseña original.
 *
 * Uso:
 *   npm install
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node db/crear-usuario.mjs ozzy "la-contraseña"
 *
 * Los dos valores de Supabase salen de:
 *   Supabase → Project Settings → API
 *     SUPABASE_URL          = Project URL
 *     SUPABASE_SERVICE_KEY  = service_role (secret)
 */
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const [usuario, clave] = process.argv.slice(2);
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!usuario || !clave) {
  console.error('Falta el usuario o la contraseña.\n  node db/crear-usuario.mjs <usuario> "<contraseña>"');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltan las variables SUPABASE_URL y SUPABASE_SERVICE_KEY.');
  process.exit(1);
}
if (clave.length < 10) {
  console.error('La contraseña tiene que tener al menos 10 caracteres.');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

// coste 12: tarda ~250ms a propósito, para que probar contraseñas a lo bruto sea lento
const clave_hash = await bcrypt.hash(clave, 12);

const { error } = await db
  .from('usuarios')
  .upsert({ usuario, clave_hash }, { onConflict: 'usuario' });

if (error) {
  console.error('No se pudo guardar el usuario:', error.message);
  process.exit(1);
}

console.log(`Listo. Usuario "${usuario}" creado o actualizado.`);
console.log('La contraseña quedó guardada hasheada, no en texto plano.');
