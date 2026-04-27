import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const Route = createFileRoute('/api/document/get')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookie = request.headers.get('cookie')

        const token = cookie
          ?.split('; ')
          .find(c => c.startsWith('token='))
          ?.split('=')[1]

        if (!token) {
          return new Response('Unauthorized', { status: 401 })
        }

        const decoded: any = verifyToken(token)

        const employee = await prisma.employee.findFirst({
          where: { userId: decoded.userId },
        })

        const docs = await prisma.document.findMany({
          where: { employeeId: employee?.id },
          orderBy: { createdAt: 'desc' },
        })

        return new Response(JSON.stringify(docs))
      },
    },
  },
})