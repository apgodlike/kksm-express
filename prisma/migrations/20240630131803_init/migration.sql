/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('Unmarried', 'Divorced', 'Widow');

-- CreateEnum
CREATE TYPE "PhysicalStatus" AS ENUM ('Normal', 'PhysicallyChallenged');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('Private', 'Government', 'Business', 'SelfEmployed', 'NotEmployed');

-- CreateEnum
CREATE TYPE "AnnualIncome" AS ENUM ('Below_1_lakh', 'Lakh_1_to_2', 'Lakh_2_to_5', 'Lakh_5_to_10', 'Lakh_10_to_15', 'Lakh_15_to_20', 'Lakh_20_to_50', 'Lakh_50_to_90', 'Lakh_90_above');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date_of_birth" TEXT NOT NULL,
    "education" TEXT,
    "location" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "mother_tongue" TEXT,
    "height" TEXT,
    "marital_status" "MaritalStatus",
    "physical_status" "PhysicalStatus" NOT NULL,
    "number_of_brothers" INTEGER,
    "number_of_brothers_married" INTEGER,
    "number_of_sisters" INTEGER,
    "number_of_sisters_married" INTEGER,
    "father_occupation" TEXT,
    "mother_occupation" TEXT,
    "employment_type" "EmploymentType" NOT NULL,
    "employed_in" TEXT,
    "annual_income" "AnnualIncome",
    "image_1" TEXT,
    "image_2" TEXT,
    "image_3" TEXT,
    "image_4" TEXT,
    "image_horoscope" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileViews" (
    "id" SERIAL NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profile_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "ProfileViews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requested_by" INTEGER NOT NULL,
    "requested_to" INTEGER NOT NULL,
    "is_accepted" BOOLEAN NOT NULL,
    "is_declined" BOOLEAN NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "declined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_key" ON "Profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_requested_by_requested_to_key" ON "Contact"("requested_by", "requested_to");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileViews" ADD CONSTRAINT "ProfileViews_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileViews" ADD CONSTRAINT "ProfileViews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_requested_to_fkey" FOREIGN KEY ("requested_to") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
