import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10)

  // 🎯 Random company name
  const companyNames = [
    "TechCorp",
    "InnovateX",
    "FutureSoft",
    "CodeWorks",
    "DevSolutions",
    "Ipsator",
    "NexGen",
    "ByteForge",
    "CloudNine",
    "DataSphere"
  ]

  const randomCompanyName =
    companyNames[Math.floor(Math.random() * companyNames.length)]

  // 🏢 Company
  const company = await prisma.company.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      name: randomCompanyName,
    },
    create: {
      name: randomCompanyName,
      email: "admin@gmail.com",
      password: hashedPassword,
    },
  })

  console.log("✅ Company ready:", company.name)

  // 👨‍💼 HR User
  const hr = await prisma.user.upsert({
    where: { email: "hr@gmail.com" },
    update: {},
    create: {
      name: "Rahul Sharma",
      email: "hr@gmail.com",
      password: hashedPassword,
      role: "hr",
      companyId: company.id,
    },
  })

  console.log("✅ HR ready")

  // 👨‍💻 Employee Users
  const empUser1 = await prisma.user.upsert({
    where: { email: "amit@gmail.com" },
    update: {},
    create: {
      name: "Amit Kumar",
      email: "amit@gmail.com",
      password: hashedPassword,
      role: "employee",
      companyId: company.id,
    },
  })

  const empUser2 = await prisma.user.upsert({
    where: { email: "priya@gmail.com" },
    update: {},
    create: {
      name: "Priya Singh",
      email: "priya@gmail.com",
      password: hashedPassword,
      role: "employee",
      companyId: company.id,
    },
  })

  console.log("✅ Employee users ready")

  // 👷 Employees
  const employee1 = await prisma.employee.upsert({
    where: { userId: empUser1.id },
    update: {},
    create: {
      name: "Amit Kumar",
      email: "amit@company.com",
      role: "Developer",
      companyId: company.id,
      userId: empUser1.id,
      hrId: hr.id,
    },
  })

  const employee2 = await prisma.employee.upsert({
    where: { userId: empUser2.id },
    update: {},
    create: {
      name: "Priya Singh",
      email: "priya@company.com",
      role: "Designer",
      companyId: company.id,
      userId: empUser2.id,
      hrId: hr.id,
    },
  })

  console.log("✅ Employees ready")

  // 📋 Checklist (title must be @unique in schema)
  const checklist = await prisma.checklist.upsert({
    where: { title_companyId: {
    title: "Onboarding Checklist",
    companyId: company.id,
  }, },
    update: {},
    create: {
      title: "Onboarding Checklist",
      companyId: company.id,
    },
  })

  console.log("✅ Checklist ready")

  // 📌 Checklist Items (create if not exist)
  const itemTitles = [
    "Submit Documents",
    "Setup Workstation",
    "Meet Team",
  ]

  const checklistItems = []

  for (const title of itemTitles) {
    const item = await prisma.checklistItem.upsert({
      where: {
        id: `${checklist.id}-${title}`, // 👈 unique trick
      },
      update: {},
      create: {
        id: `${checklist.id}-${title}`, // 👈 ensures uniqueness
        title,
        checklistId: checklist.id,
      },
    })

    checklistItems.push(item)
  }

  console.log("✅ Checklist items ready")

  // 🧾 Assign checklist to employee1
  for (const item of checklistItems) {
    await prisma.employeeChecklist.upsert({
      where: {
        employeeId_checklistItemId: {
          employeeId: employee1.id,
          checklistItemId: item.id,
        },
      },
      update: {},
      create: {
        employeeId: employee1.id,
        checklistItemId: item.id,
      },
    })
  }

  console.log("✅ Checklist assigned")

  // 📝 Tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Complete onboarding form",
        employeeId: employee1.id,
      },
      {
        title: "Read company handbook",
        employeeId: employee2.id,
      },
    ],
    skipDuplicates: true,
  })

  console.log("✅ Tasks ready")
}

main()
  .then(async () => {
    console.log("🌱 Seeding completed")
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Error while seeding:", e)
    await prisma.$disconnect()
    process.exit(1)
  })