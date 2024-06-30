/*
  Warnings:

  - Added the required column `mobile_number` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobile_number" INTEGER NOT NULL;
