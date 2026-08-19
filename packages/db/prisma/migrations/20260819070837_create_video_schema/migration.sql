-- CreateTable
CREATE TABLE "video" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "originalfilename" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_videoId_key" ON "video"("videoId");

-- CreateIndex
CREATE INDEX "video_processingStatus_idx" ON "video"("processingStatus");

-- CreateIndex
CREATE INDEX "video_createdAt_idx" ON "video"("createdAt");
