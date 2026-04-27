import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const Route = createFileRoute('/api/checklist/add-item')({
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

          const { checklistId, title } = await request.json()

          const checklist = await prisma.checklist.findUnique({
            where: { id: checklistId },
          })

          if (!checklist) {
            return new Response('Checklist not found', { status: 404 })
          }

          // 🔥 TEAM RESTRICTION
          if (decoded.teamId && checklist.teamId !== decoded.teamId) {
            return new Response('Forbidden', { status: 403 })
          }

          const item = await prisma.checklistItem.create({
            data: {
              title,
              checklistId,
            },
          })

          return new Response(JSON.stringify(item), { status: 201 })

        } catch (err) {
          console.error(err)
          return new Response('Error', { status: 500 })
        }
      },
    },
  },
})