# 02Track Backend

API local construida con Express, TypeScript, Prisma y PostgreSQL. El módulo de videos usa arquitectura hexagonal y el reproductor oficial de TikTok.

## Flujo

1. `POST /api/videos` registra la URL pública de un video de TikTok.
2. El dominio valida la URL y extrae el identificador del post.
3. PostgreSQL guarda la URL original y el identificador, no HTML externo.
4. `GET /api/videos` devuelve un feed paginado con URLs del TikTok Embed Player.
5. El frontend carga cada video directamente desde TikTok.

## Inicio local

```bash
npm install
npm run db:up
npm run prisma:migrate -- --name init
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
