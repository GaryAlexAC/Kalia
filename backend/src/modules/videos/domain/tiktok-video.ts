import { AppError } from "../../../shared/domain/app-error.js";

export function extractTikTokVideoId(sourceUrl: string): string {
  let url: URL;

  try {
    url = new URL(sourceUrl);
  } catch {
    throw invalidTikTokUrl();
  }

  const isTikTokHost =
    url.hostname === "tiktok.com" || url.hostname.endsWith(".tiktok.com");
  const videoId = url.pathname.match(/\/video\/(\d+)/)?.[1];

  if (url.protocol !== "https:" || !isTikTokHost || !videoId) {
    throw invalidTikTokUrl();
  }

  return videoId;
}

export function buildTikTokEmbedUrl(videoId: string): string {
  const parameters = new URLSearchParams({
    controls: "1",
    progress_bar: "1",
    play_button: "1",
    volume_control: "1",
    fullscreen_button: "1",
    loop: "1",
    description: "0",
    music_info: "0",
    rel: "0",
  });

  return `https://www.tiktok.com/player/v1/${videoId}?${parameters}`;
}

function invalidTikTokUrl(): AppError {
  return new AppError(
    "La URL debe pertenecer a un video público de TikTok.",
    400,
    "INVALID_TIKTOK_URL",
  );
}
