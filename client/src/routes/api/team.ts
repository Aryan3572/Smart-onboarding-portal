import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getToken(request: Request) {
	const cookie = request.headers.get("cookie") || "";
	return cookie
		.split("; ")
		.find((c) => c.startsWith("token="))
		?.split("=")[1];
}

export const Route = createFileRoute("/api/team")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const token = getToken(request);

					if (!token) {
						return new Response(JSON.stringify({ error: "Unauthorized" }), {
							status: 401,
							headers: { "Content-Type": "application/json" },
						});
					}

					const decoded: any = verifyToken(token);

					if (decoded.role !== "hr") {
						return new Response(JSON.stringify({ error: "Forbidden" }), {
							status: 403,
							headers: { "Content-Type": "application/json" },
						});
					}

					const { name } = await request.json();
					const teamName = typeof name === "string" ? name.trim() : "";

					if (!teamName) {
						return new Response(
							JSON.stringify({ error: "Team name is required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					const team = await prisma.team.create({
						data: {
							name: teamName,
							companyId: decoded.companyId,
						},
					});

					return new Response(JSON.stringify(team), {
						status: 201,
						headers: { "Content-Type": "application/json" },
					});
				} catch (err: any) {
					if (err?.code === "P2002") {
						return new Response(
							JSON.stringify({ error: "This team already exists" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					console.error("CREATE TEAM ERROR:", err);
					return new Response(
						JSON.stringify({ error: "Internal Server Error" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},

			DELETE: async ({ request }) => {
				try {
					const token = getToken(request);

					if (!token) {
						return new Response(JSON.stringify({ error: "Unauthorized" }), {
							status: 401,
							headers: { "Content-Type": "application/json" },
						});
					}

					const decoded: any = verifyToken(token);

					if (decoded.role !== "hr") {
						return new Response(JSON.stringify({ error: "Forbidden" }), {
							status: 403,
							headers: { "Content-Type": "application/json" },
						});
					}

					const { teamId } = await request.json();

					if (!teamId) {
						return new Response(
							JSON.stringify({ error: "Team id is required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					const team = await prisma.team.findFirst({
						where: {
							id: teamId,
							companyId: decoded.companyId,
						},
					});

					if (!team) {
						return new Response(JSON.stringify({ error: "Team not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" },
						});
					}

					await prisma.$transaction(async (tx) => {
						await tx.checklist.deleteMany({
							where: {
								teamId,
								companyId: decoded.companyId,
							},
						});

						await tx.team.delete({
							where: { id: teamId },
						});
					});

					return new Response(JSON.stringify({ success: true }), {
						headers: { "Content-Type": "application/json" },
					});
				} catch (err) {
					console.error("DELETE TEAM ERROR:", err);
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
