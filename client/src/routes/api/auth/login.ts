import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/login")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const body = await request.json();
					const { email, password } = body;

					const user = await prisma.user.findUnique({
						where: { email },
					});

					if (!user) {
						return new Response(JSON.stringify({ error: "User not found" }), {
							status: 400,
						});
					}

					const isValid = await bcrypt.compare(password, user.password);

					if (!isValid) {
						return new Response(JSON.stringify({ error: "Invalid password" }), {
							status: 400,
						});
					}

					const token = signToken({
						userId: user.id,
						role: user.role,
						companyId: user.companyId,
					});

					return new Response(
						JSON.stringify({
							message: "Login success",
							role: user.role,
						}),
						{
							status: 200,
							headers: {
								"Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
								"Cache-Control": "no-store",
							},
						},
					);
				} catch (err) {
					console.error(err);
					return new Response(JSON.stringify({ error: "Login failed" }), {
						status: 500,
					});
				}
			},
		},
	},
});
