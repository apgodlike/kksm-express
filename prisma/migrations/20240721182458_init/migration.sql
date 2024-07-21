-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "is_accepted" SET DEFAULT false,
ALTER COLUMN "is_declined" SET DEFAULT false,
ALTER COLUMN "accepted_at" DROP NOT NULL,
ALTER COLUMN "accepted_at" DROP DEFAULT,
ALTER COLUMN "declined_at" DROP NOT NULL,
ALTER COLUMN "declined_at" DROP DEFAULT;
