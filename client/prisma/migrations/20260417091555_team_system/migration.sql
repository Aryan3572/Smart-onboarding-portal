/*
  Warnings:

  - A unique constraint covering the columns `[title,teamId]` on the table `Checklist` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Checklist_title_companyId_key";

-- AlterTable
ALTER TABLE "Checklist" ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "teamId" TEXT;

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_companyId_key" ON "Team"("name", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Checklist_title_teamId_key" ON "Checklist"("title", "teamId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
