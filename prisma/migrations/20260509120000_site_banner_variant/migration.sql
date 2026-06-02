DO $$ BEGIN
  CREATE TYPE "SiteBannerVariant" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ALERT', 'NEUTRAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "SiteBanner" ADD COLUMN IF NOT EXISTS "variant" "SiteBannerVariant" NOT NULL DEFAULT 'INFO';
