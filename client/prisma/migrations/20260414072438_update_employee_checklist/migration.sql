/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,checklistItemId]` on the table `EmployeeChecklist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EmployeeChecklist_employeeId_checklistItemId_key" ON "EmployeeChecklist"("employeeId", "checklistItemId");
