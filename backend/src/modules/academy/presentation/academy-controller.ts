import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../shared/domain/app-error.js";
import type { AccessTokenService } from "../../auth/domain/auth.js";
import type { AcademyService } from "../application/academy-service.js";
import { MATERIAS, NIVELES, XP_MAXIMO_POR_ACTIVIDAD } from "../domain/academy.js";

const uppercase = (value: unknown) =>
  typeof value === "string" ? value.toUpperCase() : value;
const nivelSchema = z.preprocess(uppercase, z.enum(NIVELES));
const materiaSchema = z.preprocess(uppercase, z.enum(MATERIAS));
const idSchema = z.coerce.number().int().positive();

const recordProgressSchema = z.object({
  estudianteId: z.number().int().positive(),
  actividad: z.string().trim().min(1).max(160),
  nivel: nivelSchema,
  xp: z.number().int().min(0).max(XP_MAXIMO_POR_ACTIVIDAD),
});

export class AcademyController {
  constructor(
    private readonly service: AcademyService,
    private readonly tokens: AccessTokenService,
  ) {}

  listActivities = this.handle(async (request, response) => {
    const query = z.object({ materia: materiaSchema.optional() }).parse(request.query);
    response.json(await this.service.listActivities(query.materia));
  });

  getStudent = this.handle(async (request, response) => {
    const studentId = idSchema.parse(request.params.id);
    await this.authorizeStudent(request, studentId);
    response.json(await this.service.getStudent(studentId));
  });

  listStudentProgress = this.handle(async (request, response) => {
    const studentId = idSchema.parse(request.params.id);
    await this.authorizeStudent(request, studentId);
    response.json(await this.service.listStudentProgress(studentId));
  });

  recordProgress = this.handle(async (request, response) => {
    const input = recordProgressSchema.parse(request.body);
    await this.authorizeStudent(request, input.estudianteId);
    const result = await this.service.recordProgress(input);
    response.status(201).json(result);
  });

  listBadges = this.handle(async (_request, response) => {
    response.json(await this.service.listBadges());
  });

  getStudentBadges = this.handle(async (request, response) => {
    const studentId = idSchema.parse(request.params.id);
    await this.authorizeStudent(request, studentId);
    response.json(await this.service.getStudentBadges(studentId));
  });

  reviewStudentBadges = this.handle(async (request, response) => {
    const studentId = idSchema.parse(request.params.id);
    await this.authorizeStudent(request, studentId);
    response.json(await this.service.reviewStudentBadges(studentId));
  });

  listRanking = this.handle(async (request, response) => {
    const { limite } = z.object({
      limite: z.coerce.number().int().min(1).max(50).default(10),
    }).parse(request.query);
    response.json(await this.service.listRanking(limite));
  });

  private async authorizeStudent(request: Request, expectedStudentId: number) {
    const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token) {
      throw new AppError("Se requiere un token Bearer.", 401, "AUTH_REQUIRED");
    }
    const authenticatedStudentId = await this.tokens.verify(token);
    if (authenticatedStudentId !== expectedStudentId) {
      throw new AppError("No puedes acceder a otro estudiante.", 403, "FORBIDDEN");
    }
  }

  private handle(
    handler: (request: Request, response: Response) => Promise<void>,
  ) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        await handler(request, response);
      } catch (error) {
        next(error);
      }
    };
  }
}
