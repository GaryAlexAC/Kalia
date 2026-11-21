import assert from "node:assert/strict";
import test from "node:test";
import type { Insignia } from "./academy.js";
import { selectEarnedBadges } from "./badge-awarder.js";

const badges: Insignia[] = [
  { id: 1, codigo: "inicio", nombre: "Inicio", descripcion: "", materia: null, xpRequerido: 50 },
  { id: 2, codigo: "mate", nombre: "Mate", descripcion: "", materia: "MATEMATICAS", xpRequerido: 100 },
  { id: 3, codigo: "ciencia", nombre: "Ciencia", descripcion: "", materia: "CIENCIAS", xpRequerido: 100 },
];

test("selectEarnedBadges combina XP total y XP por materia", () => {
  const earned = selectEarnedBadges({
    badges,
    ownedBadgeIds: new Set(),
    totalXp: 150,
    xpBySubject: { MATEMATICAS: 100, LECTURA: 0, CIENCIAS: 50 },
  });

  assert.deepEqual(earned.map(({ codigo }) => codigo), ["inicio", "mate"]);
});

test("selectEarnedBadges no vuelve a entregar insignias obtenidas", () => {
  const earned = selectEarnedBadges({
    badges,
    ownedBadgeIds: new Set([1, 2]),
    totalXp: 150,
    xpBySubject: { MATEMATICAS: 100, LECTURA: 0, CIENCIAS: 100 },
  });

  assert.deepEqual(earned.map(({ codigo }) => codigo), ["ciencia"]);
});
