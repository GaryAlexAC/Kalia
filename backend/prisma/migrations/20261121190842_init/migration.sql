-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(80) NOT NULL,
    "topic" VARCHAR(120),
    "object_key" VARCHAR(1024) NOT NULL,
    "content_type" VARCHAR(100) NOT NULL,
    "duration_seconds" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_object_key_key" ON "videos"("object_key");

-- CreateIndex
CREATE INDEX "videos_published_created_at_idx" ON "videos"("published", "created_at");
