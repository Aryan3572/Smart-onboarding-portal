-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeChecklist" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmployeeChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeChecklist" ADD CONSTRAINT "EmployeeChecklist_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeChecklist" ADD CONSTRAINT "EmployeeChecklist_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
