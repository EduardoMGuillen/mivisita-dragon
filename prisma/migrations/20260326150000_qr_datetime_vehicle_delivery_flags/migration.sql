BEGIN;

-- Enums (safe for repeated runs).
DO $$ BEGIN
  CREATE TYPE "QrCategory" AS ENUM ('VISIT', 'DELIVERY');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "VehicleType" AS ENUM ('CARRO', 'MOTO', 'MICROBUS', 'CAMION', 'TAXI');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Residential feature flags (default OFF).
ALTER TABLE "Residential"
  ADD COLUMN IF NOT EXISTS "enableResidentQrDateTime" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "enableResidentQrVehicleType" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "enableResidentQrVehicleCompanions" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "enableResidentDeliveryQr" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "enablePostaDeliveries" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "enableAutoDeleteSuspendedResidents" BOOLEAN NOT NULL DEFAULT false;

-- QrCode fields for scheduling + vehicle metadata + category.
ALTER TABLE "QrCode"
  ADD COLUMN IF NOT EXISTS "category" "QrCategory" NOT NULL DEFAULT 'VISIT',
  ADD COLUMN IF NOT EXISTS "vehicleType" "VehicleType",
  ADD COLUMN IF NOT EXISTS "vehicleCompanionsCount" INTEGER,
  ADD COLUMN IF NOT EXISTS "scheduledStartsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "durationHours" INTEGER;

COMMIT;

