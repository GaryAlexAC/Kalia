import { Prisma } from "../../../generated/prisma/client.js";
import { AppError } from "../../../shared/domain/app-error.js";
import { prisma } from "../../../shared/infrastructure/prisma.js";
import type { AuthRepository } from "../domain/auth.js";

const publicStudentSelect = {
  id: true,
  nombre: true,
  email: true,
  nivel: true,
  xpTotal: true,
  creadoEn: true,
} as const;

export class PrismaAuthRepository implements AuthRepository {
  findByEmail(email: string) {
    return prisma.estudiante.findUnique({
      where: { email },
      select: { ...publicStudentSelect, passwordHash: true },
    }) as ReturnType<AuthRepository["findByEmail"]>;
  }

  findById(id: number) {
    return prisma.estudiante.findUnique({
      where: { id },
      select: publicStudentSelect,
    }) as ReturnType<AuthRepository["findById"]>;
  }

  async create(input: Parameters<AuthRepository["create"]>[0]) {
    try {
      return await prisma.estudiante.create({
        data: input,
        select: publicStudentSelect,
      }) as Awaited<ReturnType<AuthRepository["create"]>>;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(
          "Ya existe un estudiante con ese email.",
          409,
          "STUDENT_ALREADY_EXISTS",
        );
      }
      throw error;
    }
  }
}
