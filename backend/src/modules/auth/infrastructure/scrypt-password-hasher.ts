import { promisify } from "node:util";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { PasswordHasher } from "../domain/auth.js";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const derivedKey = await scryptAsync(password, salt, KEY_LENGTH) as Buffer;
    return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
  }

  async verify(password: string, encodedHash: string): Promise<boolean> {
    const [algorithm, saltHex, hashHex] = encodedHash.split("$");
    if (algorithm !== "scrypt" || !saltHex || !hashHex) return false;

    const expected = Buffer.from(hashHex, "hex");
    if (expected.length !== KEY_LENGTH) return false;
    const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), KEY_LENGTH) as Buffer;
    return timingSafeEqual(actual, expected);
  }
}
