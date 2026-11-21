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
    return prisma.$transaction(async (transaction) => {
      const existing = await transaction.estudiante.findUnique({
        where: { email: input.email },
        select: { id: true, passwordHash: true },
      });

      if (existing) {
        if (existing.passwordHash) throw this.studentAlreadyExists();
        const claimed = await transaction.estudiante.updateMany({
          where: { id: existing.id, passwordHash: null },
          data: {
            nombre: input.nombre,
            passwordHash: input.passwordHash,
            nivel: input.nivel,
          },
        });
        if (claimed.count === 0) throw this.studentAlreadyExists();
        return await transaction.estudiante.findUniqueOrThrow({
          where: { id: existing.id },
          select: publicStudentSelect,
        }) as Awaited<ReturnType<AuthRepository["create"]>>;
      }

      try {
        return await transaction.estudiante.create({
          data: input,
          select: publicStudentSelect,
        }) as Awaited<ReturnType<AuthRepository["create"]>>;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          throw this.studentAlreadyExists();
        }
        throw error;
      }
    });
  }

  private studentAlreadyExists() {
    return new AppError(
      "Ya existe un estudiante con ese email.",
      409,
      "STUDENT_ALREADY_EXISTS",
    );
  }
}
