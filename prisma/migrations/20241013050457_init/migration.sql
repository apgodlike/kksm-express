/*
  Warnings:

  - A unique constraint covering the columns `[mobile_number]` on the table `MobileNumberVerification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MobileNumberVerification_mobile_number_key" ON "MobileNumberVerification"("mobile_number");
