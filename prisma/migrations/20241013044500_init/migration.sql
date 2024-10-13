-- CreateTable
CREATE TABLE "MobileNumberVerification" (
    "id" SERIAL NOT NULL,
    "mobile_number" BIGINT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MobileNumberVerification_pkey" PRIMARY KEY ("id")
);
