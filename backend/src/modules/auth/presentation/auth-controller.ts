import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { AuthService } from "../application/auth-service.js";
import { NIVELES } from "../../academy/domain/academy.js";
import { AppError } from "../../../shared/domain/app-error.js";

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const emailSchema = z.email().max(320).transform(normalizeEmail);
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});
const registerSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: emailSchema,
  password: z.string().min(8).max(128),
  nivel: z.preprocess(
    (value) => typeof value === "string" ? value.toUpperCase() : value,
    z.enum(NIVELES),
  ).default("EXPLORADORES"),
});

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = this.handle(async (request, response) => {
    const session = await this.service.register(registerSchema.parse(request.body));
    response.status(201).json(session);
  });

  login = this.handle(async (request, response) => {
    const { email, password } = loginSchema.parse(request.body);
    response.json(await this.service.login(email, password));
  });

  me = this.handle(async (request, response) => {
    response.json(await this.service.getCurrentStudent(this.getBearerToken(request)));
  });

  private getBearerToken(request: Request): string {
    const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token) {
      throw new AppError("Se requiere un token Bearer.", 401, "AUTH_REQUIRED");
    }
    return token;
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
