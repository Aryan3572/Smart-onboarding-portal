-- DropForeignKey
ALTER TABLE "Checklist" DROP CONSTRAINT "Checklist_companyId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_checklistId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_companyId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeChecklist" DROP CONSTRAINT "EmployeeChecklist_checklistItemId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeChecklist" DROP CONSTRAINT "EmployeeChecklist_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_companyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeChecklist" ADD CONSTRAINT "EmployeeChecklist_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeChecklist" ADD CONSTRAINT "EmployeeChecklist_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
