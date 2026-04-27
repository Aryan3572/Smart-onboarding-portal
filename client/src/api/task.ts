import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/getUser'

export const Route = createFileRoute()({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = getUserFromRequest(request)

          if (!user) {
            return new Response(
              JSON.stringify({ error: 'Unauthorized' }),
              { status: 401 }
            )
          }

          // The current Prisma schema does not include a Task model.
          // Return an empty list until the application schema is updated.
          const tasks: unknown[] = []

          return new Response(JSON.stringify(tasks), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          })

        } catch (err) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch tasks' }),
            { status: 500 }
          )
        }
      },
    },
  },
})