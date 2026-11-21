# API de la academia virtual

Express + Prisma + PostgreSQL. Guarda estudiantes, el catálogo de actividades, el progreso/XP y las **insignias**.

## Puesta en marcha
```bash
npm install
cp .env.example .env              # ajusta la clave si hace falta
docker compose up -d              # PostgreSQL (omítelo si ya tienes uno instalado)
npx prisma migrate dev --name init
npm run db:seed                   # carga las 12 actividades y las 10 insignias
npm run dev                       # http://localhost:3000
npm test                          # pruebas (necesitan la base levantada y con seed)
```
Si ya habías hecho la migración `init` de la versión anterior, ejecuta `npx prisma migrate dev --name insignias` y luego `npm run db:seed`.

## Ver la base en DataGrip
Nueva conexión → Data Source → PostgreSQL → Host `localhost`, Port `5432`, Database `academia`, User `postgres`, Password la de tu `.env` → **Test Connection**. (Alternativa: `npm run db:studio`.)

## Cómo funcionan las insignias
Cada vez que un estudiante termina una actividad, su XP se suma y la API revisa el catálogo:
- Insignia con `materia = null` → se gana con el **XP total**.
- Insignia con una materia → se gana con el **XP acumulado en esa materia**.

Las insignias nuevas vienen en la respuesta de `POST /progreso` (`insigniasNuevas`) para mostrar un aviso tipo "¡Nueva insignia!".

| Insignia | Requisito |
|---|---|
| Primeros pasos · Explorador · Constructor del saber · Maestro del conocimiento | 50 · 150 · 400 · 800 XP totales |
| Mente matemática · Genio matemático | 100 · 300 XP en Matemáticas |
| Lector curioso · Pensador crítico | 100 · 300 XP en Lectura |
| Joven científico · Científico estrella | 100 · 300 XP en Ciencias |

Para agregar más, usa `POST /insignias` (o edita la lista en `prisma/seed.js`).

## Endpoints
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Comprueba API y base de datos |
| GET | `/actividades?materia=lectura` | Catálogo de actividades |
| POST | `/estudiantes` | `{ nombre, email?, nivel? }` |
| GET | `/estudiantes/:id` | Datos y XP total |
| GET | `/estudiantes/:id/progreso` | Historial de actividades |
| POST | `/progreso` | `{ estudianteId, actividad, nivel, xp }` → `{ progreso, insigniasNuevas }` |
| GET | `/insignias` | Catálogo de insignias |
| POST | `/insignias` | `{ codigo, nombre, descripcion?, materia?, xpRequerido }` |
| GET | `/estudiantes/:id/insignias` | `{ obtenidas, pendientes }` (con XP actual y lo que falta) |
| POST | `/estudiantes/:id/insignias/revisar` | Revisa y entrega insignias pendientes (útil tras crear una nueva) |
| GET | `/ranking?limite=10` | Top por XP (solo nombre, nivel y XP) |

Ejemplos:
```bash
curl -X POST localhost:3000/estudiantes -H "Content-Type: application/json" -d '{"nombre":"Ana"}'
curl -X POST localhost:3000/progreso -H "Content-Type: application/json" \
  -d '{"estudianteId":1,"actividad":"Construye tu pizza","nivel":"exploradores","xp":50}'
curl localhost:3000/estudiantes/1/insignias
curl -X POST localhost:3000/insignias -H "Content-Type: application/json" \
  -d '{"codigo":"racha-de-oro","nombre":"Racha de oro","descripcion":"1500 XP","xpRequerido":1500}'
```

## Conectar las actividades con la API
```js
window.addEventListener('message', async (e) => {
  if (e.data?.tipo !== 'actividad_completada') return; // en producción, verifica también e.origin
  const r = await fetch('http://localhost:3000/progreso', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estudianteId: ID_DEL_ESTUDIANTE, actividad: e.data.actividad, nivel: e.data.nivel, xp: e.data.xp }),
  });
  const { insigniasNuevas } = await r.json();
  insigniasNuevas.forEach((i) => alert(`🏅 ¡Nueva insignia: ${i.nombre}!`)); // reemplaza por tu aviso
});
```

## Antes de producción
- Agrega autenticación y roles (estudiante, padre, docente). `POST /insignias` debe quedar solo para administradores, y el servidor debe tomar el `estudianteId` de la sesión.
- Valida el XP en el servidor (aquí solo hay un tope por actividad) y limita CORS a tu dominio.
- Son menores de edad: guarda solo los datos necesarios y define permisos para padres y docentes.
