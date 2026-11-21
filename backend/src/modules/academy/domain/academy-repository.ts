import type {
  Actividad,
  Estudiante,
  Insignia,
  InsigniaObtenida,
  Materia,
  Nivel,
  PosicionRanking,
  Progreso,
  ProgresoConActividad,
  XpPorMateria,
} from "./academy.js";

export interface CrearEstudianteData {
  nombre: string;
  email?: string;
  nivel: Nivel;
}

export interface CrearInsigniaData {
  codigo: string;
  nombre: string;
  descripcion: string;
  materia: Materia | null;
  xpRequerido: number;
}

export interface CrearProgresoData {
  estudianteId: number;
  actividadId: number;
  nivel: Nivel;
  xp: number;
}

export interface AcademyRepository {
  transaction<T>(work: (repository: AcademyRepository) => Promise<T>): Promise<T>;
  listActivities(materia?: Materia): Promise<Actividad[]>;
  findActivity(reference: string): Promise<Actividad | null>;
  createStudent(data: CrearEstudianteData): Promise<Estudiante>;
  findStudent(id: number): Promise<Estudiante | null>;
  listStudentProgress(studentId: number): Promise<ProgresoConActividad[]>;
  createProgress(data: CrearProgresoData): Promise<Progreso>;
  incrementStudentXp(studentId: number, xp: number): Promise<Estudiante>;
  listBadges(): Promise<Insignia[]>;
  createBadge(data: CrearInsigniaData): Promise<Insignia>;
  listStudentBadgeIds(studentId: number): Promise<number[]>;
  listStudentBadges(studentId: number): Promise<InsigniaObtenida[]>;
  grantBadges(studentId: number, badgeIds: number[]): Promise<number[]>;
  getXpBySubject(studentId: number): Promise<XpPorMateria>;
  listRanking(limit: number): Promise<PosicionRanking[]>;
}
