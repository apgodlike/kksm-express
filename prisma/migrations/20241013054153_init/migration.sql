/*
  Warnings:

  - Added the required column `otp` to the `MobileNumberVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MobileNumberVerification" ADD COLUMN     "otp" TEXT NOT NULL;
