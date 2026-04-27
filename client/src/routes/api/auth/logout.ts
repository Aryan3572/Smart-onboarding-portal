import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/logout")({
	server: {
		handlers: {
			POST: async () => {
				return new Response(JSON.stringify({ message: "Logged out" }), {
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "no-store",
						"Set-Cookie": "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
					},
				});
			},
		},
	},
});
