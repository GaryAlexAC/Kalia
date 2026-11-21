import { createApp } from "../src/app.js";
import { prisma } from "../src/shared/infrastructure/prisma.js";

const server = createApp().listen(0);
await new Promise<void>((resolve) => server.once("listening", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("No se pudo iniciar la API.");

const baseUrl = `http://127.0.0.1:${address.port}`;
let studentId: number | undefined;

try {
  const health = await fetch(`${baseUrl}/health`);
  if (!health.ok) throw new Error("La comprobación de salud falló.");

  const activities = await fetch(`${baseUrl}/api/actividades`).then((response) => response.json());
  if (!Array.isArray(activities) || activities.length !== 12) {
    throw new Error("El catálogo no contiene 12 actividades.");
  }

  const studentResponse = await fetch(`${baseUrl}/api/estudiantes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nombre: "Verificación", email: `verify-${Date.now()}@test.local` }),
  });
  const student = await studentResponse.json() as { id?: number };
  if (studentResponse.status !== 201 || !student.id) throw new Error(JSON.stringify(student));
  studentId = student.id;

  const progressResponse = await fetch(`${baseUrl}/api/progreso`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      estudianteId: studentId,
      actividad: "Construye tu pizza",
      nivel: "exploradores",
      xp: 50,
    }),
  });
  const result = await progressResponse.json() as {
    insigniasNuevas?: Array<{ codigo: string }>;
  };
  if (progressResponse.status !== 201 || result.insigniasNuevas?.[0]?.codigo !== "primeros-pasos") {
    throw new Error(JSON.stringify(result));
  }

  const persistedStudent = await fetch(`${baseUrl}/api/estudiantes/${studentId}`)
    .then((response) => response.json()) as { xpTotal?: number };
  if (persistedStudent.xpTotal !== 50) throw new Error("El XP total no fue actualizado.");

  console.log("Flujo HTTP verificado: 12 actividades, estudiante, 50 XP e insignia.");
} finally {
  if (studentId) await prisma.estudiante.delete({ where: { id: studentId } });
  server.close();
  await prisma.$disconnect();
}
