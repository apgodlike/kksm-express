/*
  Warnings:

  - You are about to drop the column `image_horoscope` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "image_horoscope",
ADD COLUMN     "image_5" TEXT,
ALTER COLUMN "raghu_kethu" SET DATA TYPE TEXT,
ALTER COLUMN "sevvai_dhosam" SET DATA TYPE TEXT;
