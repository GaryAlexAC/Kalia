import { randomUUID } from "node:crypto";
import type { VideoRepository } from "../domain/video-repository.js";
import { extractTikTokVideoId } from "../domain/tiktok-video.js";
import type { Video } from "../domain/video.js";

export type RegisterVideoInput = {
  title: string;
  description?: string;
  category: string;
  topic?: string;
  sourceUrl: string;
  durationSeconds?: number;
  published?: boolean;
};

export class RegisterVideo {
  constructor(private readonly videos: VideoRepository) {}

  async execute(input: RegisterVideoInput): Promise<Video> {
    const tiktokVideoId = extractTikTokVideoId(input.sourceUrl);

    return this.videos.create({
      id: randomUUID(),
      title: input.title,
      description: input.description ?? null,
      category: input.category,
      topic: input.topic ?? null,
      tiktokVideoId,
      sourceUrl: input.sourceUrl,
      durationSeconds: input.durationSeconds ?? null,
      published: input.published ?? true,
    });
  }
}
