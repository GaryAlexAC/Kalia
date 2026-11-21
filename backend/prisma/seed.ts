import { prisma } from "../src/shared/infrastructure/prisma.js";
import { ScryptPasswordHasher } from "../src/modules/auth/infrastructure/scrypt-password-hasher.js";

const activities = [
  ["matematicas/01-construye-tu-pizza", "Construye tu pizza", "MATEMATICAS"],
  ["matematicas/02-el-numero-misterioso", "El número misterioso", "MATEMATICAS"],
  ["matematicas/03-arquitecto-virtual", "Arquitecto virtual", "MATEMATICAS"],
  ["matematicas/04-laboratorio-de-probabilidades", "Laboratorio de probabilidades", "MATEMATICAS"],
  ["lectura/01-detective-de-historias", "Detective de historias", "LECTURA"],
  ["lectura/02-historias-interactivas", "Historias interactivas", "LECTURA"],
  ["lectura/03-verdad-o-mentira", "¿Verdad o mentira?", "LECTURA"],
  ["lectura/04-creador-de-historias", "Creador de historias", "LECTURA"],
  ["ciencias/01-explorador-espacial", "Explorador espacial", "CIENCIAS"],
  ["ciencias/02-construye-una-celula", "Construye una célula", "CIENCIAS"],
  ["ciencias/03-laboratorio-virtual", "Laboratorio virtual", "CIENCIAS"],
  ["ciencias/04-construye-un-ecosistema", "Construye un ecosistema", "CIENCIAS"],
] as const;

const badges = [
  ["primeros-pasos", "Primeros pasos", "Alcanzaste 50 XP en la academia.", null, 50],
  ["explorador", "Explorador", "Alcanzaste 150 XP en la academia.", null, 150],
  ["constructor-del-saber", "Constructor del saber", "Alcanzaste 400 XP en la academia.", null, 400],
  ["maestro-del-conocimiento", "Maestro del conocimiento", "Alcanzaste 800 XP en la academia.", null, 800],
  ["mente-matematica", "Mente matemática", "100 XP en Matemáticas.", "MATEMATICAS", 100],
  ["genio-matematico", "Genio matemático", "300 XP en Matemáticas.", "MATEMATICAS", 300],
  ["lector-curioso", "Lector curioso", "100 XP en Lectura.", "LECTURA", 100],
  ["pensador-critico", "Pensador crítico", "300 XP en Lectura.", "LECTURA", 300],
  ["joven-cientifico", "Joven científico", "100 XP en Ciencias.", "CIENCIAS", 100],
  ["cientifico-estrella", "Científico estrella", "300 XP en Ciencias.", "CIENCIAS", 300],
] as const;

for (const [slug, titulo, materia] of activities) {
  await prisma.actividad.upsert({
    where: { slug },
    update: { titulo, materia },
    create: { slug, titulo, materia },
  });
}

for (const [codigo, nombre, descripcion, materia, xpRequerido] of badges) {
  await prisma.insignia.upsert({
    where: { codigo },
    update: { nombre, descripcion, materia, xpRequerido },
    create: { codigo, nombre, descripcion, materia, xpRequerido },
  });
}

const demoStudents = [
  {
    nombre: "Ana Torres",
    email: "ana.demo@kalia.edu",
    password: "AnaDemo2026!",
    nivel: "EXPLORADORES" as const,
    progress: [
      ["matematicas/01-construye-tu-pizza", 50],
      ["lectura/01-detective-de-historias", 100],
    ] as const,
  },
  {
    nombre: "Mateo Ruiz",
    email: "mateo.demo@kalia.edu",
    password: "MateoDemo2026!",
    nivel: "CONSTRUCTORES" as const,
    progress: [
      ["ciencias/01-explorador-espacial", 120],
      ["matematicas/02-el-numero-misterioso", 80],
    ] as const,
  },
] as const;

const passwordHasher = new ScryptPasswordHasher();
const badgeCatalog = await prisma.insignia.findMany();

for (const demo of demoStudents) {
  const passwordHash = await passwordHasher.hash(demo.password);
  await prisma.$transaction(async (transaction) => {
    const student = await transaction.estudiante.upsert({
      where: { email: demo.email },
      update: { nombre: demo.nombre, nivel: demo.nivel, passwordHash },
      create: {
        nombre: demo.nombre,
        email: demo.email,
        nivel: demo.nivel,
        passwordHash,
      },
    });

    await transaction.estudianteInsignia.deleteMany({ where: { estudianteId: student.id } });
    await transaction.progreso.deleteMany({ where: { estudianteId: student.id } });

    for (const [slug, xp] of demo.progress) {
      const activity = await transaction.actividad.findUniqueOrThrow({ where: { slug } });
      await transaction.progreso.create({
        data: {
          estudianteId: student.id,
          actividadId: activity.id,
          nivel: demo.nivel,
          xp,
        },
      });
    }

    const progress = await transaction.progreso.findMany({
      where: { estudianteId: student.id },
      select: { xp: true, actividad: { select: { materia: true } } },
    });
    const totalXp = progress.reduce((total, item) => total + item.xp, 0);
    const xpBySubject = { MATEMATICAS: 0, LECTURA: 0, CIENCIAS: 0 };
    for (const item of progress) xpBySubject[item.actividad.materia] += item.xp;
    await transaction.estudiante.update({
      where: { id: student.id },
      data: { xpTotal: totalXp },
    });

    const earnedBadgeIds = badgeCatalog
      .filter((badge) => {
        const currentXp = badge.materia ? xpBySubject[badge.materia] : totalXp;
        return currentXp >= badge.xpRequerido;
      })
      .map(({ id }) => id);
    await transaction.estudianteInsignia.createMany({
      data: earnedBadgeIds.map((insigniaId) => ({ estudianteId: student.id, insigniaId })),
    });
  });
}

console.log(
  `Actividades: ${activities.length}; insignias: ${badges.length}; estudiantes demo: ${demoStudents.length}`,
);
await prisma.$disconnect();
