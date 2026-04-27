import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'

export const Route = createFileRoute('/api/document/respond')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { docId, response } = body

          if (!docId || !response) {
            return new Response('Missing fields', { status: 400 })
          }

          await prisma.document.update({
            where: { id: docId },
            data: { response,
              question:null,
             },
          })

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
          })
        } catch (err) {
          console.error('RESPOND ERROR:', err)
          return new Response('Error', { status: 500 })
        }
      },
    },
  },
})