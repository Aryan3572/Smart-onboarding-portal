import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
	component: Login,
});

function Login() {
	const [form, setForm] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const res = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			cache: "no-store",
			body: JSON.stringify(form),
		});

		const data = await res.json();
		setLoading(false);

		if (!res.ok) {
			setError(data.error || "Login failed");
			return;
		}

		window.sessionStorage.clear();
		navigate({ to: "/dashboard" });
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 px-4 py-10">
			<div className="w-full max-w-md rounded-lg border border-blue-100 bg-white p-8 shadow-[0_24px_60px_rgba(30,64,175,0.14)]">
				<p className="mb-2 text-center text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
					Smart Onboarding Portal
				</p>
				<h1 className="mb-6 text-center text-3xl font-extrabold text-slate-950">
					Welcome Back
				</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					<input
						placeholder="Email"
						value={form.email}
						onChange={(e) => setForm({ ...form, email: e.target.value })}
						className="h-12 w-full rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>

					<input
						type="password"
						placeholder="Password"
						value={form.password}
						onChange={(e) => setForm({ ...form, password: e.target.value })}
						className="h-12 w-full rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>

					{error && (
						<p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
							{error}
						</p>
					)}

					<button
						disabled={loading}
						className="h-12 w-full cursor-pointer rounded-lg bg-blue-700 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-800"
						type="submit"
					>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>

				<p className="mt-5 text-center text-sm font-medium text-slate-600">
					New here?{" "}
					<a href="/signup" className="font-bold text-blue-700 hover:underline">
						Create account
					</a>
				</p>
			</div>
		</div>
	);
}
