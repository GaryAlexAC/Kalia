import { Router } from "express";
import { env } from "../../config/env.js";
import { JwtAccessTokenService } from "../auth/infrastructure/jwt-access-token-service.js";
import { AcademyService } from "./application/academy-service.js";
import { PrismaAcademyRepository } from "./infrastructure/prisma-academy-repository.js";
import { AcademyController } from "./presentation/academy-controller.js";

export function createAcademyRouter(): Router {
  const router = Router();
  const controller = new AcademyController(
    new AcademyService(new PrismaAcademyRepository()),
    new JwtAccessTokenService(env.AUTH_SECRET),
  );

  router.get("/actividades", controller.listActivities);
  router.get("/estudiantes/:id", controller.getStudent);
  router.get("/estudiantes/:id/progreso", controller.listStudentProgress);
  router.get("/estudiantes/:id/insignias", controller.getStudentBadges);
  router.post("/estudiantes/:id/insignias/revisar", controller.reviewStudentBadges);
  router.post("/progreso", controller.recordProgress);
  router.get("/insignias", controller.listBadges);
  router.get("/ranking", controller.listRanking);

  return router;
}
