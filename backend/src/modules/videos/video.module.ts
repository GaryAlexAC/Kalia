import { Router } from "express";
import { ListVideoFeed } from "./application/list-video-feed.js";
import { RegisterVideo } from "./application/register-video.js";
import { PrismaVideoRepository } from "./infrastructure/prisma-video-repository.js";
import { VideoController } from "./presentation/video-controller.js";

export function createVideoRouter(): Router {
  const router = Router();
  const repository = new PrismaVideoRepository();
  const controller = new VideoController(
    new RegisterVideo(repository),
    new ListVideoFeed(repository),
  );

  router.post("/", controller.register);
  router.get("/", controller.list);

  return router;
}
