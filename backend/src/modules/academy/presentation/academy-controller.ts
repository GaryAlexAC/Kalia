import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { AcademyService } from "../application/academy-service.js";
import { MATERIAS, NIVELES, XP_MAXIMO_POR_ACTIVIDAD } from "../domain/academy.js";

const uppercase = (value: unknown) =>
  typeof value === "string" ? value.toUpperCase() : value;
const nivelSchema = z.preprocess(uppercase, z.enum(NIVELES));
const materiaSchema = z.preprocess(uppercase, z.enum(MATERIAS));
const idSchema = z.coerce.number().int().positive();

const createStudentSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.email().max(320).optional(),
  nivel: nivelSchema.default("EXPLORADORES"),
});

const recordProgressSchema = z.object({
  estudianteId: z.number().int().positive(),
  actividad: z.string().trim().min(1).max(160),
  nivel: nivelSchema,
  xp: z.number().int().min(0).max(XP_MAXIMO_POR_ACTIVIDAD),
});

const createBadgeSchema = z.object({
  codigo: z.string().trim().min(1).max(100),
  nombre: z.string().trim().min(1).max(120),
  descripcion: z.string().trim().max(500).default(""),
  materia: materiaSchema.nullish().transform((value) => value ?? null),
  xpRequerido: z.number().int().positive(),
});

export class AcademyController {
  constructor(private readonly service: AcademyService) {}

  listActivities = this.handle(async (request, response) => {
    const query = z.object({ materia: materiaSchema.optional() }).parse(request.query);
    response.json(await this.service.listActivities(query.materia));
  });

  createStudent = this.handle(async (request, response) => {
    const student = await this.service.createStudent(createStudentSchema.parse(request.body));
    response.status(201).json(student);
  });

  getStudent = this.handle(async (request, response) => {
    response.json(await this.service.getStudent(idSchema.parse(request.params.id)));
  });

  listStudentProgress = this.handle(async (request, response) => {
    response.json(await this.service.listStudentProgress(idSchema.parse(request.params.id)));
  });

  recordProgress = this.handle(async (request, response) => {
    const result = await this.service.recordProgress(recordProgressSchema.parse(request.body));
    response.status(201).json(result);
  });

  listBadges = this.handle(async (_request, response) => {
    response.json(await this.service.listBadges());
  });

  createBadge = this.handle(async (request, response) => {
    const badge = await this.service.createBadge(createBadgeSchema.parse(request.body));
    response.status(201).json(badge);
  });

  getStudentBadges = this.handle(async (request, response) => {
    response.json(await this.service.getStudentBadges(idSchema.parse(request.params.id)));
  });

  reviewStudentBadges = this.handle(async (request, response) => {
    response.json(await this.service.reviewStudentBadges(idSchema.parse(request.params.id)));
  });

  listRanking = this.handle(async (request, response) => {
    const { limite } = z.object({
      limite: z.coerce.number().int().min(1).max(50).default(10),
    }).parse(request.query);
    response.json(await this.service.listRanking(limite));
  });

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
