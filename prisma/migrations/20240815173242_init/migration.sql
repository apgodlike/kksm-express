/*
  Warnings:

  - You are about to drop the column `Star` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "Star",
ADD COLUMN     "star" TEXT;
