import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const Route = createFileRoute("/api/employee/toggle")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const cookie = request.headers.get("cookie") || "";
					const token = cookie
						.split("; ")
						.find((c) => c.startsWith("token="))
						?.split("=")[1];

					if (!token) {
						return new Response("Unauthorized", { status: 401 });
					}

					const decoded: any = verifyToken(token);
					const { checklistItemId, employeeId, completed } =
						await request.json();

					if (!checklistItemId) {
						return new Response("Missing checklistItemId", { status: 400 });
					}

					const employee = employeeId
						? await prisma.employee.findUnique({
								where: { id: employeeId },
							})
						: await prisma.employee.findFirst({
								where: { userId: decoded.userId },
							});

					if (!employee) {
						return new Response("Employee not found", { status: 404 });
					}

					if (employee.companyId !== decoded.companyId) {
						return new Response("Forbidden", { status: 403 });
					}

					if (decoded.role !== "hr" && employee.userId !== decoded.userId) {
						return new Response("Forbidden", { status: 403 });
					}

					const existing = await prisma.employeeChecklist.findUnique({
						where: {
							employeeId_checklistItemId: {
								employeeId: employee.id,
								checklistItemId,
							},
						},
					});

					const nextCompleted =
						typeof completed === "boolean" ? completed : !existing?.completed;

					await prisma.employeeChecklist.upsert({
						where: {
							employeeId_checklistItemId: {
								employeeId: employee.id,
								checklistItemId,
							},
						},
						update: {
							completed: nextCompleted,
							warning: nextCompleted ? null : (existing?.warning ?? null),
						},
						create: {
							employeeId: employee.id,
							checklistItemId,
							completed: nextCompleted,
							warning: null,
						},
					});

					return new Response(
						JSON.stringify({ success: true, completed: nextCompleted }),
						{ headers: { "Content-Type": "application/json" } },
					);
				} catch (err) {
					console.error("TOGGLE ERROR:", err);
					return new Response("Error", { status: 500 });
				}
			},
		},
	},
});
