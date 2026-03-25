-- User suspension (residential admin) + resident QR validity policy per residential.
-- Safe to run once; Prisma records this migration after `migrate deploy`.

ALTER TABLE "User"
ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "suspendedAt" TIMESTAMP(3);

ALTER TABLE "Residential"
ADD COLUMN "allowResidentQrSingleUse" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "allowResidentQrOneDay" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "allowResidentQrThreeDays" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "allowResidentQrInfinite" BOOLEAN NOT NULL DEFAULT true;
