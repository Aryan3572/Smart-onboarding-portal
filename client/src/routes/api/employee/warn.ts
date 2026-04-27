import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const Route = createFileRoute('/api/employee/warn')({
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

          const { employeeId, checklistItemId, message } = await request.json()

          await prisma.employeeChecklist.upsert({
            where: {
              employeeId_checklistItemId: {
                employeeId,
                checklistItemId,
              },
            },
            update: {
              warning: message,
            },
            create: {
              employeeId,
              checklistItemId,
              completed: false,
              warning: message,
            },
          })

          return new Response(JSON.stringify({ success: true }), {
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