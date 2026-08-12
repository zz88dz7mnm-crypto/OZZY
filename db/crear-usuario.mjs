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
if (clave.length < 6) {
  console.error('La contraseña tiene que tener al menos 6 caracteres.');
  process.exit(1);
}
if (clave.length < 12) {
  console.warn('AVISO: la contraseña es corta. Con este panel se puede cambiar toda la carta.');
}

// El login no distingue mayúsculas de minúsculas, así que guardamos
// usuario y contraseña siempre en minúscula, igual que al validar.
const usuarioNorm = usuario.trim().toLowerCase();
const claveNorm = clave.toLowerCase();

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

// coste 12: tarda ~250ms a propósito, para que probar contraseñas a lo bruto sea lento
const clave_hash = await bcrypt.hash(claveNorm, 12);

const { error } = await db
  .from('usuarios')
  .upsert({ usuario: usuarioNorm, clave_hash }, { onConflict: 'usuario' });

if (error) {
  console.error('No se pudo guardar el usuario:', error.message);
  process.exit(1);
}

console.log(`Listo. Usuario "${usuarioNorm}" creado o actualizado.`);
console.log('Se entra sin distinguir mayúsculas de minúsculas.');
console.log('La contraseña quedó guardada hasheada, no en texto plano.');
