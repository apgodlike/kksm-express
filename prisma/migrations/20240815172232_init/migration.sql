/*
  Warnings:

  - You are about to drop the column `Natchathiram` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `rasi` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "Natchathiram",
DROP COLUMN "rasi",
ADD COLUMN     "Star" TEXT,
ADD COLUMN     "raasi" TEXT;
