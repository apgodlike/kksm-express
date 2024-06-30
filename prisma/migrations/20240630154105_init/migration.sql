/*
  Warnings:

  - Added the required column `kulam` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_for` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('Myself', 'Son', 'Daughter', 'Sister', 'Brother', 'Other');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "kulam" TEXT NOT NULL,
ADD COLUMN     "profile_for" "RelationshipType" NOT NULL,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "physical_status" DROP NOT NULL,
ALTER COLUMN "employment_type" DROP NOT NULL;
