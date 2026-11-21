export const NIVELES = ["EXPLORADORES", "CONSTRUCTORES", "AVANZADOS"] as const;
export const MATERIAS = ["MATEMATICAS", "LECTURA", "CIENCIAS"] as const;
export const XP_MAXIMO_POR_ACTIVIDAD = 200;

export type Nivel = (typeof NIVELES)[number];
export type Materia = (typeof MATERIAS)[number];

export interface Actividad {
  id: number;
  slug: string;
  titulo: string;
  materia: Materia;
}

export interface Estudiante {
  id: number;
  nombre: string;
  email: string | null;
  nivel: Nivel;
  xpTotal: number;
  creadoEn: Date;
}

export interface Progreso {
  id: number;
  estudianteId: number;
  actividadId: number;
  nivel: Nivel;
  xp: number;
  completadoEn: Date;
}

export interface ProgresoConActividad extends Progreso {
  actividad: Pick<Actividad, "titulo" | "materia">;
}

export interface Insignia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  materia: Materia | null;
  xpRequerido: number;
}

export interface InsigniaObtenida extends Insignia {
  obtenidaEn: Date;
}

export type XpPorMateria = Record<Materia, number>;

export interface PosicionRanking {
  nombre: string;
  nivel: Nivel;
  xpTotal: number;
}
