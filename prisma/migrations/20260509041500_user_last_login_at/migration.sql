ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_residentialId_lastLoginAt_idx"
ON "User"("residentialId", "lastLoginAt");
