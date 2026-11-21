import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { createAcademyRouter } from "./modules/academy/academy.module.js";
import { createVideoRouter } from "./modules/videos/video.module.js";
import { prisma } from "./shared/infrastructure/prisma.js";
import { errorHandler } from "./shared/presentation/error-handler.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_ORIGIN }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", async (_request, response) => {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: "ok" });
  });

  app.use("/api/videos", createVideoRouter());
  app.use("/api", createAcademyRouter());
  app.use(errorHandler);

  return app;
}
