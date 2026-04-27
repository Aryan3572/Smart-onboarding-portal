import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const Route = createFileRoute("/api/employee/$id")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
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

					const employee = await prisma.employee.findUnique({
						where: { id: params.id },
					});

					if (!employee || employee.companyId !== decoded.companyId) {
						return new Response("Unauthorized", { status: 401 });
					}

					const checklistItems = await prisma.checklistItem.findMany({
						where: {
							checklist: {
								companyId: decoded.companyId,
								NOT: { teamId: null },
							},
						},
						include: {
							checklist: {
								include: {
									team: true,
								},
							},
						},
					});

					const employeeChecklist = await prisma.employeeChecklist.findMany({
						where: {
							employeeId: params.id,
							checklistItem: {
								checklist: {
									companyId: decoded.companyId,
									NOT: { teamId: null },
								},
							},
						},
						include: {
							checklistItem: {
								include: {
									checklist: {
										include: {
											team: true,
										},
									},
								},
							},
						},
					});

					const documents = await prisma.document.findMany({
						where: { employeeId: params.id },
						orderBy: { createdAt: "desc" },
						select: {
							id: true,
							fileName: true,
							fileUrl: true,
							fileSizeKb: true,
							question: true,
							createdAt: true,
							checklistItemId: true,
							response: true,
						},
					});

					const latestDocumentsByItem = new Map<
						string,
						(typeof documents)[number]
					>();

					for (const document of documents) {
						if (!document.checklistItemId) continue;

						const hasOpenableFile =
							document.fileUrl.startsWith("/uploads/") ||
							document.fileUrl.startsWith("http://") ||
							document.fileUrl.startsWith("https://");
						const hasTextSubmission = Boolean(document.question?.trim());

						if (!hasOpenableFile && !hasTextSubmission) continue;
						if (!latestDocumentsByItem.has(document.checklistItemId)) {
							latestDocumentsByItem.set(document.checklistItemId, document);
						}
					}

					const latestDocuments = Array.from(latestDocumentsByItem.values());
					const grouped: Record<string, any[]> = {};
					const rows = checklistItems.map((item) => {
						const existing = employeeChecklist.find(
							(assignedItem) => assignedItem.checklistItemId === item.id,
						);

						return {
							item,
							completed: existing?.completed || false,
							warning: existing?.warning || null,
						};
					});

					rows.forEach(({ item, completed, warning }) => {
						const groupName = item.checklist.team?.name || "General";

						if (!grouped[groupName]) grouped[groupName] = [];

						grouped[groupName].push({
							checklistItemId: item.id,
							employeeId: params.id,
							completed,
							warning,
							checklistItem: item,
						});
					});

					const allItems = Object.values(grouped).flat();
					const total = allItems.length;
					const done = allItems.filter((c) => c.completed).length;
					const progress = total === 0 ? 0 : Math.round((done / total) * 100);

					return new Response(
						JSON.stringify({
							...employee,
							checklist: grouped,
							documents: latestDocuments,
							progress,
						}),
						{
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (err) {
					console.error(err);
					return new Response("Error", { status: 500 });
				}
			},

			PATCH: async ({ request, params }) => {
				try {
					const cookie = request.headers.get("cookie") || "";

					const token = cookie
						.split("; ")
						.find((c) => c.startsWith("token="))
						?.split("=")[1];

					if (!token) return new Response("Unauthorized", { status: 401 });

					const decoded: any = verifyToken(token);
					const body = await request.json();

					const employee = await prisma.employee.findUnique({
						where: { id: params.id },
					});

					if (!employee || employee.companyId !== decoded.companyId) {
						return new Response("Unauthorized", { status: 401 });
					}

					const data: Record<string, string> = {};

					if (typeof body.name === "string") data.name = body.name.trim();
					if (typeof body.email === "string") data.email = body.email.trim();
					if (typeof body.role === "string") data.role = body.role.trim();

					if (Object.keys(data).length === 0) {
						return new Response("No valid fields to update", { status: 400 });
					}

					const updated = await prisma.employee.update({
						where: { id: params.id },
						data,
					});

					return new Response(JSON.stringify(updated));
				} catch (err) {
					console.error(err);
					return new Response("Error", { status: 500 });
				}
			},

			DELETE: async ({ request, params }) => {
				try {
					const cookie = request.headers.get("cookie") || "";

					const token = cookie
						.split("; ")
						.find((c) => c.startsWith("token="))
						?.split("=")[1];

					if (!token) return new Response("Unauthorized", { status: 401 });

					const decoded: any = verifyToken(token);

					if (decoded.role !== "hr") {
						return new Response("Forbidden", { status: 403 });
					}

					const employee = await prisma.employee.findUnique({
						where: { id: params.id },
						select: {
							id: true,
							companyId: true,
							userId: true,
						},
					});

					if (!employee || employee.companyId !== decoded.companyId) {
						return new Response("Employee not found", { status: 404 });
					}

					await prisma.$transaction(async (tx) => {
						await tx.employee.delete({
							where: { id: params.id },
						});

						if (employee.userId) {
							await tx.user.delete({
								where: { id: employee.userId },
							});
						}
					});

					return new Response(JSON.stringify({ success: true }), {
						headers: { "Content-Type": "application/json" },
					});
				} catch (err) {
					console.error(err);
					return new Response("Error", { status: 500 });
				}
			},
		},
	},
});
