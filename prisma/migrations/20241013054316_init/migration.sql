/*
  Warnings:

  - You are about to drop the column `sent_at` on the `MobileNumberVerification` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `MobileNumberVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MobileNumberVerification" DROP COLUMN "sent_at",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;
