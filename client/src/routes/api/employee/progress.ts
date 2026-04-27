import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const Route = createFileRoute('/api/employee/progress')({
  server: {
    handlers: {
      GET: async ({ request }) => {
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

          // ✅ Get employee
          const employee = await prisma.employee.findFirst({
            where: { userId: decoded.userId },
          })

          if (!employee) {
            return new Response(JSON.stringify({ error: 'Employee not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          // ✅ Get ALL checklist items for company
          const checklistItems = await prisma.checklistItem.findMany({
            where: {
              checklist: {
                companyId: employee.companyId,
                NOT: { teamId: null },
              },
            },
            select: { id: true },
          })

          const total = checklistItems.length

          if (total === 0) {
            return new Response(
              JSON.stringify({ total: 0, completed: 0, percentage: 0 }),
              { headers: { 'Content-Type': 'application/json' } }
            )
          }

          const itemIds = checklistItems.map(item => item.id)

          // ✅ Count only matching checklist items
          const completed = await prisma.employeeChecklist.count({
            where: {
              employeeId: employee.id,
              checklistItemId: { in: itemIds },
              completed: true,
            },
          })

          const percentage = Math.round((completed / total) * 100)

          return new Response(
            JSON.stringify({
              total,
              completed,
              percentage,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )

        } catch (err) {
          console.error('PROGRESS ERROR:', err)

          return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
