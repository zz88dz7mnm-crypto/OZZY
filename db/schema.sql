-- ============================================================
--  OZZY Sushi — base de datos de la carta
--  Pegar y ejecutar TODO este archivo en Supabase:
--     Panel de Supabase → SQL Editor → New query → Run
--  Se puede volver a ejecutar sin romper nada (borra y recrea).
-- ============================================================

drop table if exists productos cascade;
drop table if exists categorias cascade;
drop table if exists usuarios cascade;

-- ------------------------------------------------------------
--  CATEGORÍAS
--  tipo:
--    'lista'     → columna del grid con productos y precio propio
--    'grupo'     → columna del grid con UN precio para todo el grupo
--                  (Rolls simples $6.500 c/u, Rolls premium $7.500 c/u)
--    'destacado' → el bloque grande "Especiales del mostrador"
--    'chips'     → las etiquetas redondeadas (las salsas), sin precio
-- ------------------------------------------------------------
create table categorias (
  id          bigserial primary key,
  nombre      text    not null,
  subtitulo   text,
  precio_grupo text,                 -- solo para tipo 'grupo', ej: '$6.500 c/u'
  tipo        text    not null default 'lista'
              check (tipo in ('lista','grupo','destacado','chips')),
  orden       int     not null default 0,
  visible     boolean not null default true,
  creado_en   timestamptz not null default now()
);

-- ------------------------------------------------------------
--  PRODUCTOS
--  precio se guarda como texto a propósito: la carta usa formatos
--  como '$2.000 c/u' o '$6.500', y así el panel no obliga a nadie
--  a pelearse con separadores de miles.
-- ------------------------------------------------------------
create table productos (
  id           bigserial primary key,
  categoria_id bigint  not null references categorias(id) on delete cascade,
  nombre       text    not null,
  aclaracion   text,                 -- ej: '(roll completo)', va en bastardilla
  descripcion  text,
  precio       text,                 -- vacío en categorías tipo 'grupo'
  orden        int     not null default 0,
  visible      boolean not null default true,
  creado_en    timestamptz not null default now(),
  editado_en   timestamptz not null default now()
);

create index productos_categoria_idx on productos (categoria_id, orden);

-- ------------------------------------------------------------
--  USUARIOS DEL PANEL
--  La contraseña NUNCA se guarda como texto: se guarda hasheada
--  con bcrypt. El hash lo genera el script db/crear-usuario.mjs
-- ------------------------------------------------------------
create table usuarios (
  id          bigserial primary key,
  usuario     text not null unique,
  clave_hash  text not null,
  creado_en   timestamptz not null default now(),
  ultimo_acceso timestamptz
);

-- ------------------------------------------------------------
--  SEGURIDAD (Row Level Security)
--  Se activa RLS y NO se crea ninguna política: así la clave
--  pública (anon) de Supabase no puede leer ni escribir nada,
--  ni siquiera la tabla de usuarios. Todo el acceso pasa por
--  las funciones del servidor, que usan la service_role key.
-- ------------------------------------------------------------
alter table categorias enable row level security;
alter table productos  enable row level security;
alter table usuarios   enable row level security;

-- ============================================================
--  CARTA ACTUAL
-- ============================================================

insert into categorias (id, nombre, subtitulo, precio_grupo, tipo, orden) values
  (1, 'Entradas',      'Para empezar con algo crocante.',                 null,          'lista',     1),
  (2, 'Gohan',         'Bowl de arroz, para comer con palitos o cuchara.', null,          'lista',     2),
  (3, 'Rolls simples', 'Directos y equilibrados.',                        '$6.500 c/u',  'grupo',     3),
  (4, 'Rolls premium', 'Un paso más allá.',                               '$7.500 c/u',  'grupo',     4),
  (5, 'Especiales del mostrador',
      'Lo que hacemos cuando queremos mostrar de qué somos capaces. Preguntá por los temakis del día.',
                                                                          null,          'destacado', 5),
  (6, 'Extras',        null,                                              null,          'chips',     6);

select setval('categorias_id_seq', (select max(id) from categorias));

insert into productos (categoria_id, nombre, aclaracion, descripcion, precio, orden) values
  -- Entradas
  (1, 'Karaage de Langostinos', null, 'Langostinos marinados estilo japonés, dorados y crocantes · 3 unidades.', '$6.500',     1),
  (1, 'Coliflor Crocante',      null, 'Coliflor marinada estilo karaage, dorada y crocante.',                    '$5.000',     2),
  (1, 'Ozzy Pockets',           null, 'Empanaditas de carne o veggies.',                                         '$2.000 c/u', 3),

  -- Gohan
  (2, 'Gohan Ozzy',   null, 'Arroz, salmón, langostinos apanados, palta, kanikama, Phila y verdeo.', '$15.000', 1),
  (2, 'Gohan Básico', null, 'Arroz, pollo crocante, palta, Phila y verdeo.',                          '$13.000', 2),

  -- Rolls simples (precio del grupo)
  (3, 'Langostino Fusion Roll', null, 'Langostino crocante y Phila.',      null, 1),
  (3, 'Veggie Roll',            null, 'Zanahoria frita, repollo y pepino.', null, 2),
  (3, 'Kanikama Roll',          null, 'Kanikama, Phila y palta cremosa.',   null, 3),

  -- Rolls premium (precio del grupo)
  (4, 'SPF Roll',            null,          'Salmón fresco, palta cremosa y Phila.',                    null, 1),
  (4, 'Ebi Philly Roll',     null,          'Langostino marinado, palta cremosa y Phila.',              null, 2),
  (4, 'Veggie Karaage Roll', null,          'Berenjena crocante, palta cremosa y Phila.',               null, 3),
  (4, 'Tamago Roll',         '(egg roll)',  'Lámina de Tamago, salmón fresco, palta cremosa y Phila.',  null, 4),

  -- Especiales del mostrador
  (5, 'Ozzy Dog',         '(roll completo)', 'Salmón o langostinos, palta cremosa y Phila. Dorado y crocante.', '$15.000',    1),
  (5, 'Nigiri Selection', null,              'Selección de nigiris según pesca del día.',                       '$2.000 c/u', 2),

  -- Extras
  (6, 'Pote de salsa de soja',         null, null, null, 1),
  (6, 'Pote de salsa Buenos Aires',    null, null, null, 2),
  (6, 'Pote de salsa Teriyaki',        null, null, null, 3);
