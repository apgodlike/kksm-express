/*
  Warnings:

  - You are about to drop the column `raghu_kethu` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "raghu_kethu",
ADD COLUMN     "ragu_kethu" TEXT;
