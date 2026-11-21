import { AppError } from "../../../shared/domain/app-error.js";
import type {
  CrearEstudianteData,
  CrearInsigniaData,
  AcademyRepository,
} from "../domain/academy-repository.js";
import type { Materia, Nivel } from "../domain/academy.js";
import { selectEarnedBadges } from "../domain/badge-awarder.js";

export class AcademyService {
  constructor(private readonly repository: AcademyRepository) {}

  listActivities(materia?: Materia) {
    return this.repository.listActivities(materia);
  }

  createStudent(data: CrearEstudianteData) {
    return this.repository.createStudent(data);
  }

  async getStudent(id: number) {
    const student = await this.repository.findStudent(id);
    if (!student) {
      throw new AppError("Estudiante no encontrado.", 404, "STUDENT_NOT_FOUND");
    }
    return student;
  }

  listStudentProgress(studentId: number) {
    return this.repository.listStudentProgress(studentId);
  }

  async recordProgress(input: {
    estudianteId: number;
    actividad: string;
    nivel: Nivel;
    xp: number;
  }) {
    const activity = await this.repository.findActivity(input.actividad);
    if (!activity) {
      throw new AppError("Actividad no encontrada.", 404, "ACTIVITY_NOT_FOUND");
    }

    return this.repository.transaction(async (repository) => {
      const student = await repository.findStudent(input.estudianteId);
      if (!student) {
        throw new AppError("Estudiante no encontrado.", 404, "STUDENT_NOT_FOUND");
      }

      const progress = await repository.createProgress({
        estudianteId: input.estudianteId,
        actividadId: activity.id,
        nivel: input.nivel,
        xp: input.xp,
      });
      await repository.incrementStudentXp(input.estudianteId, input.xp);
      const newBadges = await this.awardBadges(repository, input.estudianteId);

      return { progreso: progress, insigniasNuevas: newBadges };
    });
  }

  listBadges() {
    return this.repository.listBadges();
  }

  createBadge(data: CrearInsigniaData) {
    return this.repository.createBadge(data);
  }

  async getStudentBadges(studentId: number) {
    const student = await this.getStudent(studentId);
    const [xpBySubject, owned, catalog] = await Promise.all([
      this.repository.getXpBySubject(studentId),
      this.repository.listStudentBadges(studentId),
      this.repository.listBadges(),
    ]);
    const ownedIds = new Set(owned.map(({ id }) => id));

    return {
      obtenidas: owned,
      pendientes: catalog
        .filter(({ id }) => !ownedIds.has(id))
        .map((badge) => {
          const currentXp = badge.materia ? xpBySubject[badge.materia] : student.xpTotal;
          return {
            ...badge,
            xpActual: currentXp,
            falta: Math.max(badge.xpRequerido - currentXp, 0),
          };
        }),
    };
  }

  async reviewStudentBadges(studentId: number) {
    return this.repository.transaction(async (repository) => {
      if (!(await repository.findStudent(studentId))) {
        throw new AppError("Estudiante no encontrado.", 404, "STUDENT_NOT_FOUND");
      }
      return { insigniasNuevas: await this.awardBadges(repository, studentId) };
    });
  }

  listRanking(limit: number) {
    return this.repository.listRanking(limit);
  }

  private async awardBadges(repository: AcademyRepository, studentId: number) {
    const [student, xpBySubject, badgeIds, badges] = await Promise.all([
      repository.findStudent(studentId),
      repository.getXpBySubject(studentId),
      repository.listStudentBadgeIds(studentId),
      repository.listBadges(),
    ]);
    if (!student) {
      throw new AppError("Estudiante no encontrado.", 404, "STUDENT_NOT_FOUND");
    }

    const earned = selectEarnedBadges({
      badges,
      ownedBadgeIds: new Set(badgeIds),
      totalXp: student.xpTotal,
      xpBySubject,
    });
    const grantedIds = new Set(
      await repository.grantBadges(studentId, earned.map(({ id }) => id)),
    );
    return earned.filter(({ id }) => grantedIds.has(id));
  }
}
