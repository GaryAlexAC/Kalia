import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { env } from "../../config/env.js";
import { AuthService } from "./application/auth-service.js";
import { JwtAccessTokenService } from "./infrastructure/jwt-access-token-service.js";
import { PrismaAuthRepository } from "./infrastructure/prisma-auth-repository.js";
import { ScryptPasswordHasher } from "./infrastructure/scrypt-password-hasher.js";
import { AuthController } from "./presentation/auth-controller.js";

export function createAuthRouter(): Router {
  const router = Router();
  const controller = new AuthController(new AuthService(
    new PrismaAuthRepository(),
    new ScryptPasswordHasher(),
    new JwtAccessTokenService(env.AUTH_SECRET),
  ));
  const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "TOO_MANY_REQUESTS",
      message: "Demasiados intentos. Intenta de nuevo más tarde.",
    },
  });

  router.post("/register", authRateLimit, controller.register);
  router.post("/login", authRateLimit, controller.login);
  router.get("/me", controller.me);
  return router;
}
