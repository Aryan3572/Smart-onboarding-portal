/*
  Warnings:

  - A unique constraint covering the columns `[title,companyId]` on the table `Checklist` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Checklist_title_key";

-- AlterTable
ALTER TABLE "EmployeeChecklist" ADD COLUMN     "warning" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Checklist_title_companyId_key" ON "Checklist"("title", "companyId");
