import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';

// Requiere: base de datos levantada, migración aplicada y seed cargado.
let servidor, base;
test.before(() => new Promise((ok) => {
  servidor = app.listen(0, () => { base = `http://localhost:${servidor.address().port}`; ok(); });
}));
test.after(async () => { servidor.close(); await prisma.$disconnect(); });

const post = (ruta, cuerpo) => fetch(base + ruta, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo),
});
const get = async (ruta) => (await fetch(base + ruta)).json();

test('GET /salud responde ok', async () => {
  assert.equal((await fetch(base + '/salud')).status, 200);
});

test('GET /actividades devuelve las 12 actividades', async () => {
  assert.equal((await get('/actividades')).length, 12);
});

test('GET /insignias devuelve el catálogo', async () => {
  assert.ok((await get('/insignias')).length >= 10);
});

test('el XP suma al total y entrega insignias', async () => {
  const e = await (await post('/estudiantes', { nombre: 'Prueba', email: `t${Date.now()}@test.com` })).json();
  try {
    const r1 = await post('/progreso', { estudianteId: e.id, actividad: 'Construye tu pizza', nivel: 'exploradores', xp: 50 });
    assert.equal(r1.status, 201);
    const { insigniasNuevas } = await r1.json();
    assert.deepEqual(insigniasNuevas.map((i) => i.codigo), ['primeros-pasos']);

    // 100 XP más en Matemáticas: total 150 -> "Explorador" y "Mente matemática"
    const r2 = await (await post('/progreso', { estudianteId: e.id, actividad: 'Construye tu pizza', nivel: 'exploradores', xp: 100 })).json();
    const codigos = r2.insigniasNuevas.map((i) => i.codigo).sort();
    assert.deepEqual(codigos, ['explorador', 'mente-matematica']);

    assert.equal((await get(`/estudiantes/${e.id}`)).xpTotal, 150);
    const { obtenidas, pendientes } = await get(`/estudiantes/${e.id}/insignias`);
    assert.equal(obtenidas.length, 3);
    assert.ok(pendientes.every((p) => p.falta > 0));
  } finally {
    await prisma.estudiante.delete({ where: { id: e.id } }); // el progreso y sus insignias se borran en cascada
  }
});

test('POST /insignias agrega una insignia y rechaza duplicados', async () => {
  const codigo = `prueba-${Date.now()}`;
  const datos = { codigo, nombre: 'Prueba', xpRequerido: 10, materia: 'ciencias' };
  assert.equal((await post('/insignias', datos)).status, 201);
  assert.equal((await post('/insignias', datos)).status, 409);
  await prisma.insignia.delete({ where: { codigo } });
});

test('POST /progreso rechaza xp inválido', async () => {
  const r = await post('/progreso', { estudianteId: 1, actividad: 'Construye tu pizza', nivel: 'exploradores', xp: 9999 });
  assert.equal(r.status, 400);
});
