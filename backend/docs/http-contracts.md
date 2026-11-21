# Contratos HTTP

Base local: `http://localhost:4000`. Todos los cuerpos usan `application/json`. Las fechas son cadenas ISO 8601 UTC.

## Tipos compartidos

```ts
type Nivel = "EXPLORADORES" | "CONSTRUCTORES" | "AVANZADOS";
type Materia = "MATEMATICAS" | "LECTURA" | "CIENCIAS";

type ApiError = {
  error: string;
  message: string;
  details?: Record<string, string[]>;
};

type Actividad = {
  id: number;
  slug: string;
  titulo: string;
  materia: Materia;
};

type Estudiante = {
  id: number;
  nombre: string;
  email: string | null;
  nivel: Nivel;
  xpTotal: number;
  creadoEn: string;
};

type Progreso = {
  id: number;
  estudianteId: number;
  actividadId: number;
  nivel: Nivel;
  xp: number;
  completadoEn: string;
};

type Insignia = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  materia: Materia | null;
  xpRequerido: number;
};
```

Los valores de `nivel` y `materia` enviados por el cliente no distinguen mayúsculas de minúsculas. Los valores de respuesta siempre están en mayúsculas.

## Errores comunes

`400 VALIDATION_ERROR` indica un cuerpo, parámetro o query inválido. `400 INVALID_JSON` indica JSON mal formado. `500 INTERNAL_SERVER_ERROR` indica un error no controlado. Ejemplo:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "La solicitud contiene datos inválidos.",
  "details": { "xp": ["Too big: expected number to be <=200"] }
}
```

## Salud

### `GET /health`

Comprueba que el proceso HTTP está activo y que PostgreSQL responde. No recibe parámetros.

Respuesta `200`:

```json
{ "status": "ok" }
```

Respuesta `500 INTERNAL_SERVER_ERROR` si la base de datos no está disponible.

## Videos

### `POST /api/videos`

Registra un video público de TikTok.

```ts
type CreateVideoBody = {
  title: string;             // 1..160
  description?: string;     // 0..2000
  category: string;          // 1..80
  topic?: string;           // 0..120
  sourceUrl: string;         // URL HTTPS pública /@usuario/video/{id}, máximo 1024
  durationSeconds?: number; // entero positivo
  published?: boolean;      // true por defecto
};
```

Respuesta `201`:

```ts
type CreateVideoResponse = {
  id: string;             // UUID
  title: string;
  sourceUrl: string;
  tiktokVideoId: string;
  published: boolean;
  createdAt: string;
};
```

Errores específicos: `400 INVALID_TIKTOK_URL`, `409 VIDEO_ALREADY_EXISTS`.

### `GET /api/videos`

Devuelve solo videos publicados, del más nuevo al más antiguo.

Query:

```ts
type VideoFeedQuery = {
  limit?: number;  // entero 1..20, 10 por defecto
  cursor?: string; // UUID recibido en pagination.nextCursor
};
```

Respuesta `200`:

```ts
type VideoFeedResponse = {
  items: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    topic: string | null;
    durationSeconds: number | null;
    provider: "tiktok";
    sourceUrl: string;
    embedUrl: string; // usar como src del iframe
    createdAt: string;
  }>;
  pagination: { nextCursor: string | null };
};
```

## Actividades

### `GET /api/actividades`

Lista el catálogo ordenado por `id`.

Query opcional: `materia=MATEMATICAS|LECTURA|CIENCIAS`.

Respuesta `200`: `Actividad[]`.

## Estudiantes

### `POST /api/estudiantes`

```ts
type CreateStudentBody = {
  nombre: string; // 1..120
  email?: string; // email válido, máximo 320, único
  nivel?: Nivel;  // EXPLORADORES por defecto
};
```

Respuesta `201`: `Estudiante`.

Error específico: `409 STUDENT_ALREADY_EXISTS`.

### `GET /api/estudiantes/:id`

`id` debe ser un entero positivo.

Respuesta `200`: `Estudiante`.

Error específico: `404 STUDENT_NOT_FOUND`.

### `GET /api/estudiantes/:id/progreso`

Devuelve el historial más reciente primero. Un estudiante sin progreso o un identificador aún no registrado produce un arreglo vacío.

Respuesta `200`:

```ts
type StudentProgressResponse = Array<Progreso & {
  actividad: Pick<Actividad, "titulo" | "materia">;
}>;
```

## Progreso y XP

### `POST /api/progreso`

Registra una actividad completada, incrementa el XP total y concede insignias en una sola transacción. `actividad` puede ser el `slug` o el título exacto del catálogo.

```ts
type RecordProgressBody = {
  estudianteId: number; // entero positivo
  actividad: string;    // 1..160
  nivel: Nivel;
  xp: number;           // entero 0..200
};
```

Respuesta `201`:

```ts
type RecordProgressResponse = {
  progreso: Progreso;
  insigniasNuevas: Insignia[];
};
```

Errores específicos: `404 ACTIVITY_NOT_FOUND`, `404 STUDENT_NOT_FOUND`.

Cada finalización crea un registro nuevo. El cliente debe evitar enviar dos veces el mismo evento.

## Insignias

### `GET /api/insignias`

Respuesta `200`: `Insignia[]`, ordenadas por materia y XP requerido.

### `POST /api/insignias`

Este endpoint debe restringirse a administradores cuando exista autenticación.

```ts
type CreateBadgeBody = {
  codigo: string;          // 1..100, único
  nombre: string;          // 1..120
  descripcion?: string;    // 0..500, "" por defecto
  materia?: Materia | null; // null usa XP total
  xpRequerido: number;     // entero positivo
};
```

Respuesta `201`: `Insignia`.

Error específico: `409 BADGE_ALREADY_EXISTS`.

### `GET /api/estudiantes/:id/insignias`

Respuesta `200`:

```ts
type StudentBadgesResponse = {
  obtenidas: Array<Insignia & { obtenidaEn: string }>;
  pendientes: Array<Insignia & {
    xpActual: number;
    falta: number;
  }>;
};
```

Error específico: `404 STUDENT_NOT_FOUND`.

### `POST /api/estudiantes/:id/insignias/revisar`

Reevalúa el catálogo, útil después de crear una insignia. No recibe cuerpo.

Respuesta `200`:

```ts
type ReviewBadgesResponse = { insigniasNuevas: Insignia[] };
```

Error específico: `404 STUDENT_NOT_FOUND`.

## Ranking

### `GET /api/ranking`

Query opcional: `limite`, entero entre 1 y 50; valor por defecto `10`.

Respuesta `200`:

```ts
type RankingResponse = Array<{
  nombre: string;
  nivel: Nivel;
  xpTotal: number;
}>;
```

La respuesta omite identificadores y correos porque los estudiantes son menores de edad.
