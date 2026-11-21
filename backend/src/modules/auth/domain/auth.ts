import type { Nivel } from "../../academy/domain/academy.js";

export interface AuthStudent {
  id: number;
  nombre: string;
  email: string;
  nivel: Nivel;
  xpTotal: number;
  creadoEn: Date;
}

export interface StudentCredentials extends AuthStudent {
  passwordHash: string | null;
}

export interface AuthRepository {
  findByEmail(email: string): Promise<StudentCredentials | null>;
  findById(id: number): Promise<AuthStudent | null>;
  create(input: {
    nombre: string;
    email: string;
    passwordHash: string;
    nivel: Nivel;
  }): Promise<AuthStudent>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, encodedHash: string): Promise<boolean>;
}

export interface AccessTokenService {
  sign(studentId: number): Promise<string>;
  verify(token: string): Promise<number>;
}
