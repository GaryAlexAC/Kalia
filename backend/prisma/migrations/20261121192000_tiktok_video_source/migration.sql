DROP INDEX "videos_object_key_key";

ALTER TABLE "videos"
  DROP COLUMN "object_key",
  DROP COLUMN "content_type",
  ADD COLUMN "tiktok_video_id" VARCHAR(32) NOT NULL,
  ADD COLUMN "source_url" VARCHAR(1024) NOT NULL;

CREATE UNIQUE INDEX "videos_tiktok_video_id_key"
  ON "videos"("tiktok_video_id");

CREATE UNIQUE INDEX "videos_source_url_key"
  ON "videos"("source_url");
