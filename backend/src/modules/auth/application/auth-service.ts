import { AppError } from "../../../shared/domain/app-error.js";
import type {
  AccessTokenService,
  AuthRepository,
  AuthStudent,
  PasswordHasher,
} from "../domain/auth.js";
import type { Nivel } from "../../academy/domain/academy.js";

const TOKEN_EXPIRES_IN_SECONDS = 24 * 60 * 60;
const DUMMY_PASSWORD_HASH = "scrypt$0123456789abcdef0123456789abcdef$03a461c962bc1c5db98faebab8c9a16c7df675e3acd2834ff68f5f0b7a020463bc841369c52e34f8a2af2f2c4bbcb2f7d373863ae237749a7835a633bc1b55e0";

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: AccessTokenService,
  ) {}

  async register(input: {
    nombre: string;
    email: string;
    password: string;
    nivel: Nivel;
  }) {
    const passwordHash = await this.passwordHasher.hash(input.password);
    const student = await this.repository.create({
      nombre: input.nombre,
      email: input.email,
      passwordHash,
      nivel: input.nivel,
    });
    return this.createSession(student);
  }

  async login(email: string, password: string) {
    const credentials = await this.repository.findByEmail(email);
    const passwordMatches = await this.passwordHasher.verify(
      password,
      credentials?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (!credentials?.passwordHash || !passwordMatches) {
      throw new AppError(
        "El email o la contraseña son incorrectos.",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const { passwordHash: _passwordHash, ...student } = credentials;
    return this.createSession(student);
  }

  async getCurrentStudent(token: string) {
    const studentId = await this.tokens.verify(token);
    const student = await this.repository.findById(studentId);
    if (!student) {
      throw new AppError("La sesión ya no es válida.", 401, "INVALID_TOKEN");
    }
    return student;
  }

  private async createSession(student: AuthStudent) {
    return {
      accessToken: await this.tokens.sign(student.id),
      tokenType: "Bearer" as const,
      expiresIn: TOKEN_EXPIRES_IN_SECONDS,
      estudiante: student,
    };
  }
}
