import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const Route = createFileRoute("/api/checklist/delete")({
	server: {
		handlers: {
			DELETE: async ({ request }) => {
				try {
					const cookie = request.headers.get("cookie") || "";
					const token = cookie
						.split("; ")
						.find((c) => c.startsWith("token="))
						?.split("=")[1];

					if (!token) {
						return new Response(JSON.stringify({ error: "Unauthorized" }), {
							status: 401,
							headers: { "Content-Type": "application/json" },
						});
					}

					const decoded: any = verifyToken(token);
					const { checklistId, itemId } = await request.json();

					if (!checklistId && !itemId) {
						return new Response(
							JSON.stringify({ error: "Checklist or item id is required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					if (itemId) {
						const item = await prisma.checklistItem.findFirst({
							where: {
								id: itemId,
								checklist: {
									companyId: decoded.companyId,
								},
							},
						});

						if (!item) {
							return new Response(JSON.stringify({ error: "Item not found" }), {
								status: 404,
								headers: { "Content-Type": "application/json" },
							});
						}

						await prisma.checklistItem.delete({
							where: { id: itemId },
						});

						return new Response(JSON.stringify({ success: true }), {
							headers: { "Content-Type": "application/json" },
						});
					}

					const checklist = await prisma.checklist.findFirst({
						where: {
							id: checklistId,
							companyId: decoded.companyId,
						},
					});

					if (!checklist) {
						return new Response(
							JSON.stringify({ error: "Checklist not found" }),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					await prisma.checklist.delete({
						where: { id: checklistId },
					});

					return new Response(JSON.stringify({ success: true }), {
						headers: { "Content-Type": "application/json" },
					});
				} catch (err) {
					console.error("DELETE CHECKLIST ERROR:", err);
					return new Response(
						JSON.stringify({ error: "Internal Server Error" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
