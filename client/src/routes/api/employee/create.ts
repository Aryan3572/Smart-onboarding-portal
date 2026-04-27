import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const Route = createFileRoute('/api/employee/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const cookie = request.headers.get('cookie') || ''

          const token = cookie
            .split('; ')
            .find(c => c.startsWith('token='))
            ?.split('=')[1]

          if (!token) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const decoded: any = verifyToken(token)
          const body = await request.json()
          const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
          })

          if (existingUser) {
            return new Response(
              JSON.stringify({ error: "A user with this email already exists" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            )
          }
          const plainPassword = '123456'
          const hashedPassword = await bcrypt.hash(plainPassword, 10)

          const user = await prisma.user.create({
            data: {
              name: body.name,
              email: body.email,
              password: hashedPassword,
              role: 'employee',
              companyId: decoded.companyId,
            },
          })

          const employee = await prisma.employee.create({
            data: {
              name: body.name,
              email: body.email,
              role: body.role || 'Employee',
              companyId: decoded.companyId,
              userId: user.id,
              hrId: decoded.userId,
            },
          })

          // 🔥 ASSIGN CHECKLIST (CRITICAL FIX)
          const checklistItems = await prisma.checklistItem.findMany({
            where: {
              checklist: {
                companyId: decoded.companyId,
                NOT: { teamId: null },
              },
            },
          })

          if (checklistItems.length > 0) {
            await prisma.employeeChecklist.createMany({
              data: checklistItems.map(item => ({
                employeeId: employee.id,
                checklistItemId: item.id,
                completed: false,
              })),
            })
          }

          return new Response(JSON.stringify({
            employee,
            password: plainPassword,
          }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })

        } catch (err) {
          console.error(err)
          return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
