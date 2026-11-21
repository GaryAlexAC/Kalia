import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';

const NIVELES = ['EXPLORADORES', 'CONSTRUCTORES', 'AVANZADOS'];
const MATERIAS = ['MATEMATICAS', 'LECTURA', 'CIENCIAS'];
const XP_MAXIMO = 200; // tope por actividad, evita puntajes inventados

export const app = express();
app.use(cors()); // en producción, limita el origen a tu plataforma
app.use(express.json());

const error = (res, codigo, mensaje) => res.status(codigo).json({ error: mensaje });
const idDe = (req) => Number.parseInt(req.params.id, 10);
const normalizar = (v) => v?.toString().toUpperCase();

// --- Lógica de insignias ---

// XP acumulado por materia: { MATEMATICAS: 120, LECTURA: 0, CIENCIAS: 40 }
async function xpPorMateria(db, estudianteId) {
  const filas = await db.progreso.findMany({
    where: { estudianteId },
    select: { xp: true, actividad: { select: { materia: true } } },
  });
  const total = { MATEMATICAS: 0, LECTURA: 0, CIENCIAS: 0 };
  for (const f of filas) total[f.actividad.materia] += f.xp;
  return total;
}

// Revisa todas las insignias y entrega las que el estudiante ya merece.
// Devuelve solo las nuevas. `db` puede ser prisma o una transacción.
async function otorgarInsignias(db, estudianteId) {
  const est = await db.estudiante.findUnique({ where: { id: estudianteId }, select: { xpTotal: true } });
  const xpMat = await xpPorMateria(db, estudianteId);
  const tengo = new Set((await db.estudianteInsignia.findMany({ where: { estudianteId } })).map((o) => o.insigniaId));
  const catalogo = await db.insignia.findMany({ orderBy: { xpRequerido: 'asc' } });

  const nuevas = catalogo.filter((i) => {
    const xpActual = i.materia ? xpMat[i.materia] : est.xpTotal;
    return !tengo.has(i.id) && xpActual >= i.xpRequerido;
  });
  if (nuevas.length) {
    await db.estudianteInsignia.createMany({ data: nuevas.map((i) => ({ estudianteId, insigniaId: i.id })) });
  }
  return nuevas;
}

// --- Salud ---
app.get('/salud', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true });
});

// --- Actividades ---
app.get('/actividades', async (req, res) => {
  const materia = normalizar(req.query.materia);
  if (materia && !MATERIAS.includes(materia)) return error(res, 400, 'materia inválida');
  res.json(await prisma.actividad.findMany({ where: materia ? { materia } : {}, orderBy: { id: 'asc' } }));
});

// --- Estudiantes ---
app.post('/estudiantes', async (req, res) => {
  const { nombre, email } = req.body;
  const nivel = normalizar(req.body.nivel) || 'EXPLORADORES';
  if (!nombre?.trim()) return error(res, 400, 'nombre es obligatorio');
  if (!NIVELES.includes(nivel)) return error(res, 400, 'nivel inválido');
  const estudiante = await prisma.estudiante.create({ data: { nombre: nombre.trim(), email: email || null, nivel } });
  res.status(201).json(estudiante);
});

app.get('/estudiantes/:id', async (req, res) => {
  const id = idDe(req);
  if (!Number.isInteger(id)) return error(res, 400, 'id inválido');
  const estudiante = await prisma.estudiante.findUnique({ where: { id } });
  if (!estudiante) return error(res, 404, 'Estudiante no encontrado');
  res.json(estudiante);
});

app.get('/estudiantes/:id/progreso', async (req, res) => {
  const id = idDe(req);
  if (!Number.isInteger(id)) return error(res, 400, 'id inválido');
  res.json(await prisma.progreso.findMany({
    where: { estudianteId: id },
    include: { actividad: { select: { titulo: true, materia: true } } },
    orderBy: { completadoEn: 'desc' },
  }));
});

// --- Progreso: recibe lo que envía cada actividad al terminar ---
// Cuerpo: { estudianteId, actividad (slug o título), nivel, xp }
// Responde: { progreso, insigniasNuevas }
app.post('/progreso', async (req, res) => {
  const { estudianteId, actividad, xp } = req.body;
  const nivel = normalizar(req.body.nivel);
  if (
    !Number.isInteger(estudianteId) ||
    !Number.isInteger(xp) || xp < 0 || xp > XP_MAXIMO ||
    !NIVELES.includes(nivel) || !actividad
  ) return error(res, 400, 'Datos inválidos');

  const act = await prisma.actividad.findFirst({ where: { OR: [{ slug: actividad }, { titulo: actividad }] } });
  if (!act) return error(res, 404, 'Actividad no encontrada');

  try {
    // Todo en una transacción: guarda el progreso, suma el XP y entrega insignias, o nada
    const resultado = await prisma.$transaction(async (tx) => {
      const progreso = await tx.progreso.create({ data: { estudianteId, actividadId: act.id, nivel, xp } });
      await tx.estudiante.update({ where: { id: estudianteId }, data: { xpTotal: { increment: xp } } });
      const insigniasNuevas = await otorgarInsignias(tx, estudianteId);
      return { progreso, insigniasNuevas };
    });
    res.status(201).json(resultado);
  } catch (e) {
    if (e.code === 'P2025' || e.code === 'P2003') return error(res, 404, 'Estudiante no encontrado');
    throw e;
  }
});

// --- Insignias ---
app.get('/insignias', async (_req, res) => {
  res.json(await prisma.insignia.findMany({ orderBy: [{ materia: 'asc' }, { xpRequerido: 'asc' }] }));
});

// Agregar una insignia nueva (solo administradores cuando agregues login)
app.post('/insignias', async (req, res) => {
  const { codigo, nombre, descripcion = '', xpRequerido } = req.body;
  const materia = normalizar(req.body.materia) || null;
  if (!codigo?.trim() || !nombre?.trim()) return error(res, 400, 'codigo y nombre son obligatorios');
  if (!Number.isInteger(xpRequerido) || xpRequerido < 1) return error(res, 400, 'xpRequerido debe ser un entero mayor a 0');
  if (materia && !MATERIAS.includes(materia)) return error(res, 400, 'materia inválida');
  const insignia = await prisma.insignia.create({
    data: { codigo: codigo.trim(), nombre: nombre.trim(), descripcion, materia, xpRequerido },
  });
  res.status(201).json(insignia);
});

// Insignias de un estudiante: las que ya tiene y las pendientes con su avance
app.get('/estudiantes/:id/insignias', async (req, res) => {
  const id = idDe(req);
  if (!Number.isInteger(id)) return error(res, 400, 'id inválido');
  const est = await prisma.estudiante.findUnique({ where: { id }, select: { xpTotal: true } });
  if (!est) return error(res, 404, 'Estudiante no encontrado');

  const xpMat = await xpPorMateria(prisma, id);
  const propias = await prisma.estudianteInsignia.findMany({
    where: { estudianteId: id },
    include: { insignia: true },
    orderBy: { obtenidaEn: 'asc' },
  });
  const tengo = new Set(propias.map((o) => o.insigniaId));
  const catalogo = await prisma.insignia.findMany({ orderBy: { xpRequerido: 'asc' } });

  res.json({
    obtenidas: propias.map((o) => ({ ...o.insignia, obtenidaEn: o.obtenidaEn })),
    pendientes: catalogo.filter((i) => !tengo.has(i.id)).map((i) => {
      const xpActual = i.materia ? xpMat[i.materia] : est.xpTotal;
      return { ...i, xpActual, falta: Math.max(i.xpRequerido - xpActual, 0) };
    }),
  });
});

// Vuelve a revisar si el estudiante merece insignias (útil tras agregar una nueva)
app.post('/estudiantes/:id/insignias/revisar', async (req, res) => {
  const id = idDe(req);
  if (!Number.isInteger(id)) return error(res, 400, 'id inválido');
  if (!(await prisma.estudiante.findUnique({ where: { id } }))) return error(res, 404, 'Estudiante no encontrado');
  res.json({ insigniasNuevas: await otorgarInsignias(prisma, id) });
});

// --- Ranking (solo datos mínimos, son menores de edad) ---
app.get('/ranking', async (req, res) => {
  const limite = Math.min(Math.max(Number.parseInt(req.query.limite, 10) || 10, 1), 50);
  res.json(await prisma.estudiante.findMany({
    select: { nombre: true, nivel: true, xpTotal: true },
    orderBy: { xpTotal: 'desc' },
    take: limite,
  }));
});

// --- Errores ---
app.use((e, _req, res, _next) => {
  if (e.type === 'entity.parse.failed') return error(res, 400, 'JSON inválido');
  if (e.code === 'P2002') return error(res, 409, 'Ya existe un registro con ese valor único');
  console.error(e);
  error(res, 500, 'Error interno');
});
