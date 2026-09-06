-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PLACEMENT_DRIVE', 'PLACEMENT_ROUND', 'ROUND_FEEDBACK', 'OFFER_LETTER', 'PREPARATION_RESOURCE', 'ACADEMIC', 'BACKLOG', 'GRADUATION', 'SYSTEM');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "related_id" INTEGER,
    "related_type" VARCHAR(100),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipient_id_is_read_idx" ON "Notification"("recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "Notification_recipient_id_created_at_idx" ON "Notification"("recipient_id", "created_at");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
