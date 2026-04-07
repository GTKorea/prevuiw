-- Step 1: Delete guest projects (no owner) and their cascading data
DELETE FROM "projects" WHERE "ownerId" IS NULL;

-- Step 2: comments — add viewport with default, rename guestName, drop selectionArea
ALTER TABLE "comments" ADD COLUMN "viewport" "Viewport" NOT NULL DEFAULT 'DESKTOP_1920';
ALTER TABLE "comments" ADD COLUMN "reviewerName" TEXT;
UPDATE "comments" SET "reviewerName" = "guestName" WHERE "guestName" IS NOT NULL;
ALTER TABLE "comments" DROP COLUMN "guestName";
ALTER TABLE "comments" DROP COLUMN "selectionArea";
-- Remove the default after backfill
ALTER TABLE "comments" ALTER COLUMN "viewport" DROP DEFAULT;

-- Step 3: projects — remove guest fields, add sdkConnected, make ownerId required
ALTER TABLE "projects" ADD COLUMN "sdkConnected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "projects" DROP COLUMN "expiresAt";
ALTER TABLE "projects" DROP COLUMN "guestId";
ALTER TABLE "projects" DROP COLUMN "isGuest";
ALTER TABLE "projects" ALTER COLUMN "ownerId" SET NOT NULL;

-- Step 4: versions — add new columns with defaults, copy url→domain, generate keys, then drop old columns
ALTER TABLE "versions" ADD COLUMN "domain" TEXT;
ALTER TABLE "versions" ADD COLUMN "versionKey" TEXT;
ALTER TABLE "versions" ADD COLUMN "inviteToken" TEXT;

-- Backfill: copy url to domain, generate unique keys from id + random
UPDATE "versions" SET
  "domain" = "url",
  "versionKey" = substr(md5(id || random()::text || clock_timestamp()::text), 1, 12),
  "inviteToken" = md5(id || random()::text || clock_timestamp()::text);

-- Make columns required
ALTER TABLE "versions" ALTER COLUMN "domain" SET NOT NULL;
ALTER TABLE "versions" ALTER COLUMN "versionKey" SET NOT NULL;
ALTER TABLE "versions" ALTER COLUMN "inviteToken" SET NOT NULL;

-- Drop old columns
ALTER TABLE "versions" DROP COLUMN "url";
ALTER TABLE "versions" DROP COLUMN "urlType";

-- Step 5: screenshots — add pageUrl
ALTER TABLE "screenshots" ADD COLUMN "pageUrl" TEXT;
UPDATE "screenshots" SET "pageUrl" = '' WHERE "pageUrl" IS NULL;
ALTER TABLE "screenshots" ALTER COLUMN "pageUrl" SET NOT NULL;

-- Step 6: Create unique indexes
CREATE UNIQUE INDEX "versions_versionKey_key" ON "versions"("versionKey");
CREATE UNIQUE INDEX "versions_inviteToken_key" ON "versions"("inviteToken");
CREATE UNIQUE INDEX "screenshots_versionId_viewport_pageUrl_key" ON "screenshots"("versionId", "viewport", "pageUrl");

-- Step 7: Drop unused UrlType enum
DROP TYPE IF EXISTS "UrlType";
