-- AlterTable
ALTER TABLE "User" ADD COLUMN     "oauthId" TEXT,
ALTER COLUMN "oauthProvider" SET DATA TYPE VARCHAR;
