-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "shapes" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "undoneShapes" JSONB NOT NULL DEFAULT '[]';
