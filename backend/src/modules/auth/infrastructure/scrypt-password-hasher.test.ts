import assert from "node:assert/strict";
import test from "node:test";
import { ScryptPasswordHasher } from "./scrypt-password-hasher.js";

test("ScryptPasswordHasher verifica la contraseña sin almacenarla", async () => {
  const hasher = new ScryptPasswordHasher();
  const hash = await hasher.hash("ClaveSegura2026!");

  assert.equal(hash.includes("ClaveSegura2026!"), false);
  assert.equal(await hasher.verify("ClaveSegura2026!", hash), true);
  assert.equal(await hasher.verify("otra-clave", hash), false);
});
