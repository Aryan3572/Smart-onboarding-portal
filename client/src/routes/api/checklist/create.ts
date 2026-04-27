import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const Route = createFileRoute('/api/checklist/create')({
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
          const { title, teamId } = await request.json()
          console.log("CREATING CHECKLIST:", { title, teamId }) // 👈 ADD THIS

          if (!title) {
            return new Response(JSON.stringify({ error: 'Title is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          // ✅ Create checklist (group)
          const checklist = await prisma.checklist.create({
            data: {
              title,
              teamId: teamId, // 🔥 associate with user's team
              companyId: decoded.companyId,
            },
          })

          return new Response(JSON.stringify(checklist), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })

        } catch (err) {
          console.error('CREATE CHECKLIST ERROR:', err)

          return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})