-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "publishableKey" TEXT;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "cssSelector" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "projects_publishableKey_key" ON "projects"("publishableKey");
