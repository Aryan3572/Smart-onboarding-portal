import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/api/employee/me")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					const user = await getCurrentUser(request);

					if (!user) {
						return new Response("Unauthorized", { status: 401 });
					}

					// 🔥 total checklist items
					const totalChecklistItems = await prisma.checklistItem.count({
						where: {
							checklist: {
								companyId: user.companyId,
								NOT: { teamId: null },
							},
						},
					});

					// 🔥 all employees (for both HR & employee view)
					const employees = await prisma.employee.findMany({
						where: {
							companyId: user.companyId,
						},
						include: {
							EmployeeChecklist: {
								where: {
									checklistItem: {
										checklist: {
											companyId: user.companyId,
											NOT: { teamId: null },
										},
									},
								},
								select: { completed: true },
							},
						},
					});

					const formattedEmployees = employees.map((emp) => {
						const completed = emp.EmployeeChecklist.filter(
							(c) => c.completed,
						).length;

						const progress =
							totalChecklistItems === 0
								? 0
								: Math.round((completed / totalChecklistItems) * 100);

						return {
							...emp,
							progress,
						};
					});

					// 🔥 if employee → also return self
					if (user.role === "employee") {
						const self = await prisma.employee.findFirst({
							where: { userId: user.id },
						});

						return new Response(
							JSON.stringify({
								role: "employee",
								userId: user.id,
								employees: formattedEmployees,
								self,
							}),
							{
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					// 🔥 HR
					return new Response(
						JSON.stringify({
							role: "hr",
							userId: user.id,
							employees: formattedEmployees,
						}),
						{
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (err) {
					return new Response(JSON.stringify({ error: "Server error" }), {
						status: 500,
					});
				}
			},
		},
	},
});
