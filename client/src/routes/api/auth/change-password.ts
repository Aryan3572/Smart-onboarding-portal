import { createFileRoute } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const Route = createFileRoute("/api/auth/change-password")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const user = await getCurrentUser(request);

					if (!user) {
						return new Response(JSON.stringify({ error: "Unauthorized" }), {
							status: 401,
							headers: { "Content-Type": "application/json" },
						});
					}

					const { currentPassword, newPassword } = await request.json();

					if (
						typeof currentPassword !== "string" ||
						typeof newPassword !== "string"
					) {
						return new Response(
							JSON.stringify({ error: "Both passwords are required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					if (newPassword.length < 6) {
						return new Response(
							JSON.stringify({
								error: "New password must be at least 6 characters",
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					const isCurrentPasswordValid = await bcrypt.compare(
						currentPassword,
						user.password,
					);

					if (!isCurrentPasswordValid) {
						return new Response(
							JSON.stringify({ error: "Current password is incorrect" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					if (currentPassword === newPassword) {
						return new Response(
							JSON.stringify({
								error: "New password must be different from current password",
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					const hashedPassword = await bcrypt.hash(newPassword, 10);

					await prisma.user.update({
						where: { id: user.id },
						data: { password: hashedPassword },
					});

					return new Response(JSON.stringify({ success: true }), {
						headers: { "Content-Type": "application/json" },
					});
				} catch (err) {
					console.error("CHANGE PASSWORD ERROR:", err);
					return new Response(JSON.stringify({ error: "Server error" }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					});
				}
			},
		},
	},
});
