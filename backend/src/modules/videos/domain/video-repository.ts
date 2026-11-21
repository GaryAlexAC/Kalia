import type { Video } from "./video.js";

export type CreateVideoData = Omit<Video, "createdAt" | "updatedAt">;

export type VideoPage = {
  items: Video[];
  nextCursor: string | null;
};

export interface VideoRepository {
  create(data: CreateVideoData): Promise<Video>;
  listPublished(input: { limit: number; cursor?: string }): Promise<VideoPage>;
}
