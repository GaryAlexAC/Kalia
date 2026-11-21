import { Prisma, type PrismaClient } from "../../../generated/prisma/client.js";
import { prisma } from "../../../shared/infrastructure/prisma.js";
import type {
  AcademyRepository,
  CrearProgresoData,
} from "../domain/academy-repository.js";
import type { Materia, XpPorMateria } from "../domain/academy.js";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

const publicStudentSelect = {
  id: true,
  nombre: true,
  email: true,
  nivel: true,
  xpTotal: true,
  creadoEn: true,
} as const;

export class PrismaAcademyRepository implements AcademyRepository {
  constructor(private readonly db: DatabaseClient = prisma) {}

  transaction<T>(work: (repository: AcademyRepository) => Promise<T>): Promise<T> {
    return prisma.$transaction((transaction) =>
      work(new PrismaAcademyRepository(transaction)),
    );
  }

  listActivities(materia?: Materia) {
    return this.db.actividad.findMany({
      where: materia ? { materia } : undefined,
      orderBy: { id: "asc" },
    });
  }

  findActivity(reference: string) {
    return this.db.actividad.findFirst({
      where: { OR: [{ slug: reference }, { titulo: reference }] },
    });
  }

  findStudent(id: number) {
    return this.db.estudiante.findUnique({ where: { id }, select: publicStudentSelect });
  }

  listStudentProgress(studentId: number) {
    return this.db.progreso.findMany({
      where: { estudianteId: studentId },
      include: { actividad: { select: { titulo: true, materia: true } } },
      orderBy: { completadoEn: "desc" },
    });
  }

  createProgress(data: CrearProgresoData) {
    return this.db.progreso.create({ data });
  }

  incrementStudentXp(studentId: number, xp: number) {
    return this.db.estudiante.update({
      where: { id: studentId },
      data: { xpTotal: { increment: xp } },
      select: publicStudentSelect,
    });
  }

  listBadges() {
    return this.db.insignia.findMany({
      orderBy: [{ materia: "asc" }, { xpRequerido: "asc" }],
    });
  }

  async listStudentBadgeIds(studentId: number) {
    const records = await this.db.estudianteInsignia.findMany({
      where: { estudianteId: studentId },
      select: { insigniaId: true },
    });
    return records.map(({ insigniaId }) => insigniaId);
  }

  async listStudentBadges(studentId: number) {
    const records = await this.db.estudianteInsignia.findMany({
      where: { estudianteId: studentId },
      include: { insignia: true },
      orderBy: { obtenidaEn: "asc" },
    });
    return records.map(({ insignia, obtenidaEn }) => ({ ...insignia, obtenidaEn }));
  }

  async grantBadges(studentId: number, badgeIds: number[]) {
    if (badgeIds.length === 0) return [];
    const records = await this.db.estudianteInsignia.createManyAndReturn({
      data: badgeIds.map((insigniaId) => ({ estudianteId: studentId, insigniaId })),
      skipDuplicates: true,
      select: { insigniaId: true },
    });
    return records.map(({ insigniaId }) => insigniaId);
  }

  async getXpBySubject(studentId: number): Promise<XpPorMateria> {
    const records = await this.db.progreso.findMany({
      where: { estudianteId: studentId },
      select: { xp: true, actividad: { select: { materia: true } } },
    });
    const totals: XpPorMateria = { MATEMATICAS: 0, LECTURA: 0, CIENCIAS: 0 };
    for (const record of records) totals[record.actividad.materia] += record.xp;
    return totals;
  }

  listRanking(limit: number) {
    return this.db.estudiante.findMany({
      select: { nombre: true, nivel: true, xpTotal: true },
      orderBy: [{ xpTotal: "desc" }, { id: "asc" }],
      take: limit,
    });
  }
}
