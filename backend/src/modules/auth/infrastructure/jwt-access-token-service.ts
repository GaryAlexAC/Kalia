import { jwtVerify, SignJWT } from "jose";
import { AppError } from "../../../shared/domain/app-error.js";
import type { AccessTokenService } from "../domain/auth.js";

const TOKEN_LIFETIME = "24h";

export class JwtAccessTokenService implements AccessTokenService {
  private readonly secret: Uint8Array;

  constructor(secret: string) {
    this.secret = new TextEncoder().encode(secret);
  }

  sign(studentId: number): Promise<string> {
    return new SignJWT({ type: "student" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(studentId))
      .setIssuedAt()
      .setExpirationTime(TOKEN_LIFETIME)
      .sign(this.secret);
  }

  async verify(token: string): Promise<number> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: ["HS256"],
      });
      const studentId = Number(payload.sub);
      if (payload.type !== "student" || !Number.isInteger(studentId) || studentId < 1) {
        throw new Error("Invalid claims");
      }
      return studentId;
    } catch {
      throw new AppError("El token es inválido o expiró.", 401, "INVALID_TOKEN");
    }
  }
}
