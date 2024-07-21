-- CreateTable
CREATE TABLE "Shortlist" (
    "id" SERIAL NOT NULL,
    "shortlisted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shortlisted_by" INTEGER NOT NULL,
    "shortlisted_profile" INTEGER NOT NULL,

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shortlist_shortlisted_by_shortlisted_profile_key" ON "Shortlist"("shortlisted_by", "shortlisted_profile");

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_shortlisted_by_fkey" FOREIGN KEY ("shortlisted_by") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_shortlisted_profile_fkey" FOREIGN KEY ("shortlisted_profile") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
