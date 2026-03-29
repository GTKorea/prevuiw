-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "guestId" TEXT,
ADD COLUMN     "isGuest" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "ownerId" DROP NOT NULL;
