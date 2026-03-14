-- CreateEnum
CREATE TYPE "GuardShiftMarkType" AS ENUM ('HEARTBEAT');

-- AlterTable
ALTER TABLE "Residential"
ADD COLUMN "gateLatitude" DOUBLE PRECISION,
ADD COLUMN "gateLongitude" DOUBLE PRECISION,
ADD COLUMN "gateRadiusMeters" INTEGER NOT NULL DEFAULT 80;

-- CreateTable
CREATE TABLE "GuardShift" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "startLatitude" DOUBLE PRECISION NOT NULL,
    "startLongitude" DOUBLE PRECISION NOT NULL,
    "startDistanceMeters" DOUBLE PRECISION,
    "startIsAnomalous" BOOLEAN NOT NULL DEFAULT false,
    "startAnomalyReason" TEXT,
    "startSelfieData" BYTEA NOT NULL,
    "startSelfieMimeType" TEXT NOT NULL,
    "startSelfieSize" INTEGER NOT NULL,
    "startSelfieCapturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endLatitude" DOUBLE PRECISION,
    "endLongitude" DOUBLE PRECISION,
    "endDistanceMeters" DOUBLE PRECISION,
    "endIsAnomalous" BOOLEAN NOT NULL DEFAULT false,
    "endAnomalyReason" TEXT,
    "endSelfieData" BYTEA,
    "endSelfieMimeType" TEXT,
    "endSelfieSize" INTEGER,
    "endSelfieCapturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "guardId" TEXT NOT NULL,
    "residentialId" TEXT NOT NULL,

    CONSTRAINT "GuardShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardShiftMark" (
    "id" TEXT NOT NULL,
    "markType" "GuardShiftMarkType" NOT NULL DEFAULT 'HEARTBEAT',
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distanceMeters" DOUBLE PRECISION,
    "isAnomalous" BOOLEAN NOT NULL DEFAULT false,
    "anomalyReason" TEXT,
    "selfieData" BYTEA NOT NULL,
    "selfieMimeType" TEXT NOT NULL,
    "selfieSize" INTEGER NOT NULL,
    "selfieCapturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shiftId" TEXT NOT NULL,

    CONSTRAINT "GuardShiftMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuardShift_guardId_startedAt_idx" ON "GuardShift"("guardId", "startedAt");

-- CreateIndex
CREATE INDEX "GuardShift_residentialId_startedAt_idx" ON "GuardShift"("residentialId", "startedAt");

-- CreateIndex
CREATE INDEX "GuardShift_endedAt_idx" ON "GuardShift"("endedAt");

-- CreateIndex
CREATE INDEX "GuardShiftMark_shiftId_markedAt_idx" ON "GuardShiftMark"("shiftId", "markedAt");

-- CreateIndex
CREATE INDEX "GuardShiftMark_isAnomalous_markedAt_idx" ON "GuardShiftMark"("isAnomalous", "markedAt");

-- AddForeignKey
ALTER TABLE "GuardShift" ADD CONSTRAINT "GuardShift_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardShift" ADD CONSTRAINT "GuardShift_residentialId_fkey" FOREIGN KEY ("residentialId") REFERENCES "Residential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardShiftMark" ADD CONSTRAINT "GuardShiftMark_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "GuardShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
