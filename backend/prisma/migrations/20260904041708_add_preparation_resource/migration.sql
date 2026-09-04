-- CreateEnum
CREATE TYPE "PreparationResourceType" AS ENUM ('YOUTUBE', 'ARTICLE', 'PDF', 'DOCUMENT', 'PRACTICE', 'OTHER');

-- CreateEnum
CREATE TYPE "PreparationDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "Preparation_resource" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "topic" VARCHAR(200) NOT NULL,
    "resource_type" "PreparationResourceType" NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "thumbnail_url" VARCHAR(1000),
    "duration" VARCHAR(50),
    "difficulty" "PreparationDifficulty",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preparation_resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Preparation_resource_category_idx" ON "Preparation_resource"("category");

-- CreateIndex
CREATE INDEX "Preparation_resource_topic_idx" ON "Preparation_resource"("topic");

-- CreateIndex
CREATE INDEX "Preparation_resource_resource_type_idx" ON "Preparation_resource"("resource_type");

-- CreateIndex
CREATE INDEX "Preparation_resource_is_active_idx" ON "Preparation_resource"("is_active");
