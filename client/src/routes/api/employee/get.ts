import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const Route = createFileRoute('/api/employee/get')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const cookie = request.headers.get('cookie')

          const token = cookie
            ?.split('; ')
            .find(c => c.startsWith('token='))
            ?.split('=')[1]

          if (!token) {
            return new Response('Unauthorized', { status: 401 })
          }

          const decoded: any = verifyToken(token)

          // 🔥 get current employee
          const employee = await prisma.employee.findFirst({
            where: { userId: decoded.userId },
          })

          if (!employee) {
            return new Response('Employee not found', { status: 404 })
          }

          // 🔥 get checklist items
          const items = await prisma.checklistItem.findMany({
            where: {
              checklist: {
                companyId: employee.companyId,
                NOT: { teamId: null },
              },
            },
            include: {
              checklist: {
                include: {
                  team: true,
                },
              },
            },
          })

          // 🔥 get employee checklist (WITH WARNING)
          const progress = await prisma.employeeChecklist.findMany({
            where: {
              employeeId: employee.id,
            },
          })

          // 🔥 merge + include warning
          const checklist = items.map(item => {
            const found = progress.find(
              p => p.checklistItemId === item.id
            )

            return {
              id: item.id,
              title: item.title,
              teamName: item.checklist.team?.name || 'General',
              completed: found?.completed || false,
              warning: found?.warning || null, // ✅ FIX HERE
            }
          })

          return new Response(JSON.stringify({ checklist }), { status: 200 })

        } catch (err) {
          console.error(err)
          return new Response('Error', { status: 500 })
        }
      },
    },
  },
})
