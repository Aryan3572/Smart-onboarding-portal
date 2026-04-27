import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const Route = createFileRoute('/api/checklist/get')({
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

          const teams = await prisma.team.findMany({
            where: {
              companyId: decoded.companyId,
            },
            include: {
              checklists: {
                include: {
                  items: true,
                },
              },
            },
          })

          return new Response(JSON.stringify(teams), { status: 200 })

        } catch (err) {
          console.error(err)
          return new Response('Error', { status: 500 })
        }
      },
    },
  },
})