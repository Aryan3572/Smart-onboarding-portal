/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Checklist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Checklist_title_key" ON "Checklist"("title");
