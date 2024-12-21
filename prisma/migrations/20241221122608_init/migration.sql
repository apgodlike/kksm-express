/*
  Warnings:

  - You are about to drop the column `mobile_number_verification_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `MobileNumberVerification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_mobile_number_verification_id_fkey";

-- DropIndex
DROP INDEX "User_mobile_number_verification_id_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mobile_number_verification_id",
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "MobileNumberVerification";
