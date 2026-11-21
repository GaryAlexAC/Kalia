import { prisma } from '../src/db.js';

// Las 12 actividades de la academia (mismo slug que las carpetas del proyecto)
const actividades = [
  ['matematicas/01-construye-tu-pizza', 'Construye tu pizza', 'MATEMATICAS'],
  ['matematicas/02-el-numero-misterioso', 'El número misterioso', 'MATEMATICAS'],
  ['matematicas/03-arquitecto-virtual', 'Arquitecto virtual', 'MATEMATICAS'],
  ['matematicas/04-laboratorio-de-probabilidades', 'Laboratorio de probabilidades', 'MATEMATICAS'],
  ['lectura/01-detective-de-historias', 'Detective de historias', 'LECTURA'],
  ['lectura/02-historias-interactivas', 'Historias interactivas', 'LECTURA'],
  ['lectura/03-verdad-o-mentira', '¿Verdad o mentira?', 'LECTURA'],
  ['lectura/04-creador-de-historias', 'Creador de historias', 'LECTURA'],
  ['ciencias/01-explorador-espacial', 'Explorador espacial', 'CIENCIAS'],
  ['ciencias/02-construye-una-celula', 'Construye una célula', 'CIENCIAS'],
  ['ciencias/03-laboratorio-virtual', 'Laboratorio virtual', 'CIENCIAS'],
  ['ciencias/04-construye-un-ecosistema', 'Construye un ecosistema', 'CIENCIAS'],
];

// Insignias: [código, nombre, descripción, materia (null = XP total), XP requerido]
const insignias = [
  ['primeros-pasos', 'Primeros pasos', 'Alcanzaste 50 XP en la academia.', null, 50],
  ['explorador', 'Explorador', 'Alcanzaste 150 XP en la academia.', null, 150],
  ['constructor-del-saber', 'Constructor del saber', 'Alcanzaste 400 XP en la academia.', null, 400],
  ['maestro-del-conocimiento', 'Maestro del conocimiento', 'Alcanzaste 800 XP en la academia.', null, 800],
  ['mente-matematica', 'Mente matemática', '100 XP en Matemáticas.', 'MATEMATICAS', 100],
  ['genio-matematico', 'Genio matemático', '300 XP en Matemáticas.', 'MATEMATICAS', 300],
  ['lector-curioso', 'Lector curioso', '100 XP en Lectura.', 'LECTURA', 100],
  ['pensador-critico', 'Pensador crítico', '300 XP en Lectura.', 'LECTURA', 300],
  ['joven-cientifico', 'Joven científico', '100 XP en Ciencias.', 'CIENCIAS', 100],
  ['cientifico-estrella', 'Científico estrella', '300 XP en Ciencias.', 'CIENCIAS', 300],
];

for (const [slug, titulo, materia] of actividades) {
  await prisma.actividad.upsert({ where: { slug }, update: { titulo, materia }, create: { slug, titulo, materia } });
}
for (const [codigo, nombre, descripcion, materia, xpRequerido] of insignias) {
  await prisma.insignia.upsert({
    where: { codigo },
    update: { nombre, descripcion, materia, xpRequerido },
    create: { codigo, nombre, descripcion, materia, xpRequerido },
  });
}
console.log(`Actividades: ${actividades.length} · Insignias: ${insignias.length}`);
await prisma.$disconnect();
