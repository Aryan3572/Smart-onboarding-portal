import { createFileRoute } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const Route = createFileRoute("/api/auth/signup")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const body = await request.json();
					const {
						name,
						email,
						password,
						role,
						companyEmail,
						companyName,
						companyMode,
					} = body;

					const existingUser = await prisma.user.findUnique({
						where: { email },
					});

					if (existingUser) {
						return new Response(
							JSON.stringify({ error: "User already exists" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					let company = await prisma.company.findUnique({
						where: { email: companyEmail },
					});

					if (role === "hr") {
						if (companyMode === "join") {
							if (!company) {
								return new Response(
									JSON.stringify({ error: "Company does not exist" }),
									{
										status: 400,
										headers: { "Content-Type": "application/json" },
									},
								);
							}
						} else {
							if (company) {
								return new Response(
									JSON.stringify({
										error:
											"Company already exists. Choose join existing company.",
									}),
									{
										status: 400,
										headers: { "Content-Type": "application/json" },
									},
								);
							}

							company = await prisma.company.create({
								data: {
									name: companyName,
									email: companyEmail,
									password: "temp",
								},
							});
						}
					}

					if (role === "employee" && !company) {
						return new Response(
							JSON.stringify({ error: "Company does not exist" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					if (!company) {
						return new Response(JSON.stringify({ error: "Company error" }), {
							status: 400,
							headers: { "Content-Type": "application/json" },
						});
					}

					const hashedPassword = await bcrypt.hash(password, 10);

					const user = await prisma.user.create({
						data: {
							name,
							email,
							password: hashedPassword,
							role,
							companyId: company.id,
						},
					});

					if (role === "employee") {
						await prisma.employee.create({
							data: {
								name,
								email,
								role: "employee",
								companyId: company.id,
								userId: user.id,
							},
						});
					}

					return new Response(JSON.stringify(user), {
						status: 201,
						headers: { "Content-Type": "application/json" },
					});
				} catch (err) {
					console.error(err);
					return new Response(JSON.stringify({ error: "Signup failed" }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					});
				}
			},
		},
	},
});
