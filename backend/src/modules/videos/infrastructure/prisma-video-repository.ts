import { Prisma } from "../../../generated/prisma/client.js";
import { AppError } from "../../../shared/domain/app-error.js";
import { prisma } from "../../../shared/infrastructure/prisma.js";
import type {
  CreateVideoData,
  VideoPage,
  VideoRepository,
} from "../domain/video-repository.js";
import type { Video } from "../domain/video.js";

export class PrismaVideoRepository implements VideoRepository {
  async create(data: CreateVideoData): Promise<Video> {
    try {
      return await prisma.video.create({ data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "Ese video de TikTok ya está registrado.",
          409,
          "VIDEO_ALREADY_EXISTS",
        );
      }

      throw error;
    }
  }

  async listPublished(input: {
    limit: number;
    cursor?: string;
  }): Promise<VideoPage> {
    const records = await prisma.video.findMany({
      where: { published: true },
      take: input.limit + 1,
      ...(input.cursor
        ? {
            cursor: { id: input.cursor },
            skip: 1,
          }
        : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const hasMore = records.length > input.limit;
    const items = hasMore ? records.slice(0, input.limit) : records;

    return {
      items,
      nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
    };
  }
}
