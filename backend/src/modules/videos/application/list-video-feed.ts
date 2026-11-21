import type { VideoRepository } from "../domain/video-repository.js";
import { buildTikTokEmbedUrl } from "../domain/tiktok-video.js";

export class ListVideoFeed {
  constructor(private readonly videos: VideoRepository) {}

  async execute(input: { limit: number; cursor?: string }) {
    const page = await this.videos.listPublished(input);

    const items = page.items.map((video) => ({
          id: video.id,
          title: video.title,
          description: video.description,
          category: video.category,
          topic: video.topic,
          durationSeconds: video.durationSeconds,
          provider: "tiktok" as const,
          sourceUrl: video.sourceUrl,
          embedUrl: buildTikTokEmbedUrl(video.tiktokVideoId),
          createdAt: video.createdAt.toISOString(),
        }));

    return {
      items,
      pagination: {
        nextCursor: page.nextCursor,
        hasMore: page.nextCursor !== null,
      },
    };
  }
}
