-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('RequestReceived', 'RequestAccepted', 'RequestDeclined', 'ProfileView', 'PhoneNumberView');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_viewed" BOOLEAN NOT NULL DEFAULT false,
    "viewed_at" TIMESTAMP(3),
    "profile_id" INTEGER NOT NULL,
    "notification_type" "NotificationType" NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
