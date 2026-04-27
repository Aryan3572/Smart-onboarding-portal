import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const Route = createFileRoute("/api/auth/me")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					const cookie = request.headers.get("cookie");

					if (!cookie) {
						return new Response("Unauthorized", { status: 401 });
					}

					const token = cookie
						.split("; ")
						.find((c) => c.startsWith("token="))
						?.split("=")[1];

					if (!token) {
						return new Response(JSON.stringify({ error: "No token" }), {
							status: 401,
						});
					}

					const decoded: any = verifyToken(token);

					const user = await prisma.user.findUnique({
						where: { id: decoded.userId },
					});

					if (!user) {
						return new Response("Unauthorized", { status: 401 });
					}

					return new Response(
						JSON.stringify({
							id: user.id,
							email: user.email,
							role: user.role,
							companyId: user.companyId,
						}),
						{
							status: 200,
							headers: {
								"Content-Type": "application/json",
								"Cache-Control": "no-store",
							},
						},
					);
				} catch (err) {
					return new Response(JSON.stringify({ error: "Invalid token" }), {
						status: 401,
					});
				}
			},
		},
	},
});
