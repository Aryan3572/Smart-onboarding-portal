import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const Route = createFileRoute('/api/employee/add-toggle')({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
          const { checklistItemId } = await request.json()

          const employee = await prisma.employee.findFirst({
            where: { userId: decoded.userId },
          })

          if (!employee) {
            return new Response('Employee not found', { status: 404 })
          }

          const existing = await prisma.employeeChecklist.findUnique({
            where: {
              employeeId_checklistItemId: {
                employeeId: employee.id,
                checklistItemId,
              },
            },
          })

          if (!existing) {
            return new Response('Checklist not assigned', { status: 400 })
          }

          await prisma.employeeChecklist.update({
            where: { id: existing.id },
            data: { completed: !existing.completed },
          })

          return new Response(JSON.stringify({ success: true }))
        } catch (err) {
          console.error(err)
          return new Response('Error', { status: 500 })
        }
      },
    },
  },
})