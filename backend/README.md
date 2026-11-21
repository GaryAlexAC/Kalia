# 02Track Backend

API local construida con Express, TypeScript, Prisma y PostgreSQL. Los módulos de videos y academia usan arquitectura hexagonal. Los videos se reproducen con el reproductor oficial de TikTok; la academia administra actividades, estudiantes, XP, insignias y ranking.

Los contratos HTTP completos para integrar otro frontend están en [`docs/http-contracts.md`](docs/http-contracts.md).

## Flujo

1. `POST /api/videos` registra la URL pública de un video de TikTok.
2. El dominio valida la URL y extrae el identificador del post.
3. PostgreSQL guarda la URL original y el identificador, no HTML externo.
4. `GET /api/videos` devuelve un feed paginado con URLs del TikTok Embed Player.
5. El frontend carga cada video directamente desde TikTok.

## Inicio local

```bash
npm install
cp .env.example .env
npm run db:up
npm run prisma:migrate
npm run db:seed
npm run dev
```

## Registrar un video

```http
POST http://localhost:4000/api/videos
Content-Type: application/json
```

```json
{
  "title": "Introducción a las fracciones",
  "description": "Una explicación breve de las fracciones.",
  "category": "Matemáticas",
  "topic": "Fracciones",
  "sourceUrl": "https://www.tiktok.com/@scout2015/video/6718335390845095173",
  "durationSeconds": 42,
  "published": true
}
```

## Consultar el feed

```http
GET http://localhost:4000/api/videos?limit=10
```

Para la siguiente página, envía el cursor recibido:

```http
GET http://localhost:4000/api/videos?limit=10&cursor=<nextCursor>
```

## Academia

El seed carga 12 actividades y 10 insignias. Ejemplo de flujo:

```bash
curl -X POST http://localhost:4000/api/estudiantes -H "Content-Type: application/json" -d '{"nombre":"Ana"}'
curl http://localhost:4000/api/actividades?materia=matematicas
curl -X POST http://localhost:4000/api/progreso -H "Content-Type: application/json" -d '{"estudianteId":1,"actividad":"Construye tu pizza","nivel":"exploradores","xp":50}'
```
