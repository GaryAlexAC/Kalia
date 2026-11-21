import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { ListVideoFeed } from "../application/list-video-feed.js";
import type { RegisterVideo } from "../application/register-video.js";

const registerVideoSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().min(1).max(80),
  topic: z.string().trim().max(120).optional(),
  sourceUrl: z.url().max(1024),
  durationSeconds: z.number().int().positive().optional(),
  published: z.boolean().optional(),
});

const listVideosSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(10),
  cursor: z.string().uuid().optional(),
});

export class VideoController {
  constructor(
    private readonly registerVideo: RegisterVideo,
    private readonly listVideoFeed: ListVideoFeed,
  ) {}

  register = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const input = registerVideoSchema.parse(request.body);
      const video = await this.registerVideo.execute(input);

      response.status(201).json({
        id: video.id,
        title: video.title,
        sourceUrl: video.sourceUrl,
        tiktokVideoId: video.tiktokVideoId,
        published: video.published,
        createdAt: video.createdAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const query = listVideosSchema.parse(request.query);
      const feed = await this.listVideoFeed.execute(query);

      response.json(feed);
    } catch (error) {
      next(error);
    }
  };
}
