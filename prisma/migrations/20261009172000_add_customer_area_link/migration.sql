-- AlterTable
ALTER TABLE "users" ADD COLUMN "areaId" TEXT;

-- CreateIndex
CREATE INDEX "users_areaId_idx" ON "users"("areaId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
