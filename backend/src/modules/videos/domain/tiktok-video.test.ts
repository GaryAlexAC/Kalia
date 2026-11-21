import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../../../shared/domain/app-error.js";
import { buildTikTokEmbedUrl, extractTikTokVideoId } from "./tiktok-video.js";

test("extracts the post id from a canonical TikTok URL", () => {
  assert.equal(
    extractTikTokVideoId(
      "https://www.tiktok.com/@scout2015/video/6718335390845095173",
    ),
    "6718335390845095173",
  );
});

test("rejects URLs from other providers", () => {
  assert.throws(
    () => extractTikTokVideoId("https://example.com/video/6718335390845095173"),
    (error) => error instanceof AppError && error.code === "INVALID_TIKTOK_URL",
  );
});

test("builds an official TikTok player URL", () => {
  const url = buildTikTokEmbedUrl("6718335390845095173");

  assert.match(url, /^https:\/\/www\.tiktok\.com\/player\/v1\/6718335390845095173\?/);
});
