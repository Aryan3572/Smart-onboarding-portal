import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'

export const Route = createFileRoute('/api/employee/assign-checklist')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { employeeId, checklistId } = await request.json()

          // ✅ get checklist items
          const items = await prisma.checklistItem.findMany({
            where: { checklistId },
          })

          // ✅ assign to employee
          await prisma.employeeChecklist.createMany({
              data: items.map(item => ({
                employeeId,
                checklistItemId: item.id,
                completed:false,
              })),
              skipDuplicates: true, // 🔥 IMPORTANT
            })

          return new Response(JSON.stringify({ message: 'Assigned' }), {
            status: 200,
          })

        } catch (err) {
          console.error(err)
          return new Response('Error', { status: 500 })
        }
      },
    },
  },
})