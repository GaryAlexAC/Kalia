import { Router } from "express";
import { AcademyService } from "./application/academy-service.js";
import { PrismaAcademyRepository } from "./infrastructure/prisma-academy-repository.js";
import { AcademyController } from "./presentation/academy-controller.js";

export function createAcademyRouter(): Router {
  const router = Router();
  const controller = new AcademyController(
    new AcademyService(new PrismaAcademyRepository()),
  );

  router.get("/actividades", controller.listActivities);
  router.post("/estudiantes", controller.createStudent);
  router.get("/estudiantes/:id", controller.getStudent);
  router.get("/estudiantes/:id/progreso", controller.listStudentProgress);
  router.get("/estudiantes/:id/insignias", controller.getStudentBadges);
  router.post("/estudiantes/:id/insignias/revisar", controller.reviewStudentBadges);
  router.post("/progreso", controller.recordProgress);
  router.get("/insignias", controller.listBadges);
  router.post("/insignias", controller.createBadge);
  router.get("/ranking", controller.listRanking);

  return router;
}
