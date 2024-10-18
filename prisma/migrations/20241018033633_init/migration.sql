/*
  Warnings:

  - A unique constraint covering the columns `[mobile_number_verification_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mobile_number_verification_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MobileNumberVerification_mobile_number_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mobile_number_verification_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ChangePasswordVerification" (
    "id" SERIAL NOT NULL,
    "mobile_number" BIGINT NOT NULL,
    "otp" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp_generated_count" INTEGER NOT NULL DEFAULT 1,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "ChangePasswordVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChangePasswordVerification_user_id_key" ON "ChangePasswordVerification"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_number_verification_id_key" ON "User"("mobile_number_verification_id");

-- AddForeignKey
ALTER TABLE "ChangePasswordVerification" ADD CONSTRAINT "ChangePasswordVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mobile_number_verification_id_fkey" FOREIGN KEY ("mobile_number_verification_id") REFERENCES "MobileNumberVerification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
