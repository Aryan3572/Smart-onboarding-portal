import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const Route = createFileRoute('/api/employee/all-with-progress')({
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
        return new Response('Unauthorized', { status: 401 })
      }

      const decoded: any = verifyToken(token)

      const currentChecklistItems = await prisma.checklistItem.findMany({
        where: {
          checklist: {
            companyId: decoded.companyId,
            NOT: { teamId: null },
          },
        },
        select: { id: true },
      })

      const currentChecklistItemIds = currentChecklistItems.map(item => item.id)

      const employees = await prisma.employee.findMany({
        where: {
          companyId: decoded.companyId,
        },
        include: {
          EmployeeChecklist: {
            where: {
              checklistItem: {
                id: { in: currentChecklistItemIds },
              },
            },
          },
        },
      })

      const result = employees.map(emp => {
        const total = currentChecklistItemIds.length
        const done = emp.EmployeeChecklist.filter(c => c.completed).length

        return {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          role: emp.role,
          progress: total === 0 ? 0 : Math.round((done / total) * 100),
        }
      })

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      })

    } catch (err) {
      console.error(err)
      return new Response('Error', { status: 500 })
    }
  },
},

},
})
