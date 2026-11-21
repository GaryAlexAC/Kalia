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

  const preflight = await fetch(`${baseUrl}/api/auth/login`, {
    method: "OPTIONS",
    headers: {
      origin: "http://localhost:5173",
      "access-control-request-method": "POST",
    },
  });
  if (preflight.headers.get("access-control-allow-origin") !== "http://localhost:5173") {
    throw new Error("CORS no permite conectar el frontend Vite.");
  }

  const activities = await fetch(`${baseUrl}/api/actividades`).then((response) => response.json());
  if (!Array.isArray(activities) || activities.length !== 12) {
    throw new Error("El catálogo no contiene 12 actividades.");
  }

  const demoLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "ana.demo@kalia.edu", password: "AnaDemo2026!" }),
  });
  const demoSession = await demoLogin.json() as {
    accessToken?: string;
    estudiante?: { id: number };
  };
  if (!demoLogin.ok || !demoSession.accessToken || !demoSession.estudiante) {
    throw new Error(JSON.stringify(demoSession));
  }

  const me = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { authorization: `Bearer ${demoSession.accessToken}` },
  });
  if (!me.ok) throw new Error("El token de la cuenta demo no fue aceptado.");

  const demoProgress = await fetch(
    `${baseUrl}/api/estudiantes/${demoSession.estudiante.id}/progreso`,
    { headers: { authorization: `Bearer ${demoSession.accessToken}` } },
  ).then((response) => response.json());
  if (!Array.isArray(demoProgress) || demoProgress.length < 2) {
    throw new Error("La cuenta demo no está relacionada con sus actividades.");
  }

  const mateoLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "mateo.demo@kalia.edu", password: "MateoDemo2026!" }),
  });
  const mateoSession = await mateoLogin.json() as {
    accessToken?: string;
    estudiante?: { id: number };
  };
  if (!mateoLogin.ok || !mateoSession.accessToken || !mateoSession.estudiante) {
    throw new Error("La segunda cuenta demo no pudo iniciar sesión.");
  }
  const mateoProgress = await fetch(
    `${baseUrl}/api/estudiantes/${mateoSession.estudiante.id}/progreso`,
    { headers: { authorization: `Bearer ${mateoSession.accessToken}` } },
  ).then((response) => response.json());
  if (!Array.isArray(mateoProgress) || mateoProgress.length !== 2) {
    throw new Error("La segunda cuenta demo no tiene dos actividades relacionadas.");
  }
  const forbidden = await fetch(
    `${baseUrl}/api/estudiantes/${mateoSession.estudiante.id}/progreso`,
    { headers: { authorization: `Bearer ${demoSession.accessToken}` } },
  );
  if (forbidden.status !== 403) {
    throw new Error("Un estudiante pudo consultar el progreso de otro.");
  }

  const studentResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      nombre: "Verificación",
      email: `verify-${Date.now()}@test.local`,
      password: "Verify2026!",
      nivel: "exploradores",
    }),
  });
  const session = await studentResponse.json() as {
    accessToken?: string;
    estudiante?: { id: number };
  };
  if (studentResponse.status !== 201 || !session.estudiante?.id || !session.accessToken) {
    throw new Error(JSON.stringify(session));
  }
  studentId = session.estudiante.id;

  const progressResponse = await fetch(`${baseUrl}/api/progreso`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${session.accessToken}`,
    },
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

  const persistedStudent = await fetch(`${baseUrl}/api/estudiantes/${studentId}`, {
    headers: { authorization: `Bearer ${session.accessToken}` },
  })
    .then((response) => response.json()) as { xpTotal?: number };
  if (persistedStudent.xpTotal !== 50) throw new Error("El XP total no fue actualizado.");

  console.log("Flujo HTTP verificado: login, token, registro, actividades, XP e insignia.");
} finally {
  if (studentId) await prisma.estudiante.delete({ where: { id: studentId } });
  server.close();
  await prisma.$disconnect();
}
