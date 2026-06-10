-- New QR validity types (opt-in residential flags default OFF).
ALTER TYPE "QrValidity" ADD VALUE IF NOT EXISTS 'SEVEN_DAYS';
ALTER TYPE "QrValidity" ADD VALUE IF NOT EXISTS 'SEVEN_USES';

ALTER TABLE "Residential"
  ADD COLUMN IF NOT EXISTS "allowResidentQrSevenDays" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "allowResidentQrSevenUses" BOOLEAN NOT NULL DEFAULT false;
