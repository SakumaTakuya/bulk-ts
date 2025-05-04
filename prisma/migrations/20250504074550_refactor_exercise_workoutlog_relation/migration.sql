/*
  Warnings:

  - You are about to drop the column `exerciseId` on the `Set` table. All the data in the column will be lost.
  - Added the required column `exerciseId` to the `WorkoutLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Set" DROP CONSTRAINT "Set_exerciseId_fkey";

-- DropIndex
DROP INDEX "Set_exerciseId_idx";

-- AlterTable
ALTER TABLE "Set" DROP COLUMN "exerciseId";

-- AlterTable
ALTER TABLE "WorkoutLog" ADD COLUMN "exerciseId" TEXT;

-- Update existing rows to set exerciseId to a valid Exercise id
UPDATE "WorkoutLog" SET "exerciseId" = 'cm9cmltyp0003vugsxq2peyq2' WHERE "exerciseId" IS NULL;

-- Alter column to NOT NULL
ALTER TABLE "WorkoutLog" ALTER COLUMN "exerciseId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "WorkoutLog_exerciseId_idx" ON "WorkoutLog"("exerciseId");

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
