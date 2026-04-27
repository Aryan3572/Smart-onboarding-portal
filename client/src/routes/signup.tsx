import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

const signupSchema = z
	.object({
		name: z.string().trim().min(1, "Name is required"),
		companyName: z.string().trim().optional(),
		email: z.string().email("Invalid email"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		role: z.string().min(1, "Role is required"),
		companyMode: z.string().optional(),
		companyEmail: z.string().email("Invalid company email"),
	})
	.superRefine((data, ctx) => {
		if (
			data.role === "hr" &&
			data.companyMode !== "join" &&
			!data.companyName
		) {
			ctx.addIssue({
				code: "custom",
				path: ["companyName"],
				message: "Company name is required",
			});
		}
	});

export const Route = createFileRoute("/signup")({
	component: Signup,
});

function Signup() {
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		role: "",
		companyMode: "create",
		companyEmail: "",
		companyName: "",
	});

	const [errors, setErrors] = useState<{
		name?: string;
		email?: string;
		password?: string;
		role?: string;
		companyMode?: string;
		companyName?: string;
		companyEmail?: string;
		general?: string;
	}>({});
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// 🔥 Validate with Zod
		const result = signupSchema.safeParse(form);

		if (!result.success) {
			const fieldErrors: Record<string, string> = {};

			result.error.issues.forEach((err) => {
				const field = err.path[0] as string;
				if (field && !fieldErrors[field]) {
					fieldErrors[field] = err.message;
				}
			});

			setErrors(fieldErrors);
			return;
		}

		setErrors({}); // clear previous errors

		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(result.data),
			});

			const data = await res.json();

			// 🔥 Handle backend errors (like duplicate email)
			if (!res.ok) {
				if (data.error?.toLowerCase().includes("email")) {
					setErrors((prev) => ({
						...prev,
						email: data.error,
					}));
				} else {
					setErrors((prev) => ({
						...prev,
						general: data.error || "Something went wrong",
					}));
				}
				return;
			}

			// ✅ Success
			navigate({ to: "/login" });
		} catch (err) {
			setErrors((prev) => ({
				...prev,
				general: "Network error. Try again.",
			}));
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 px-4 py-10">
			<div className="w-full max-w-md rounded-lg border border-blue-100 bg-white p-8 shadow-[0_24px_60px_rgba(30,64,175,0.14)]">
				<p className="mb-2 text-center text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
					Smart Onboarding Portal
				</p>
				<h1 className="mb-6 text-center text-3xl font-extrabold text-slate-950">
					Create Account
				</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* NAME */}
					<div>
						<input
							placeholder="Your Name"
							value={form.name}
							className={`h-12 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 ${
								errors.name
									? "border-red-400 focus:ring-red-100"
									: "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
							}`}
							onChange={(e) => {
								setForm({ ...form, name: e.target.value });
								setErrors((p) => ({ ...p, name: undefined }));
							}}
						/>
						{errors.name && (
							<p className="mt-1 text-xs text-red-500">{errors.name}</p>
						)}
					</div>

					{/* COMPANY NAME */}
					{form.role === "hr" && form.companyMode !== "join" && (
						<div>
							<input
								placeholder="Company Name"
								value={form.companyName}
								className={`h-12 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 ${
									errors.companyName
										? "border-red-400 focus:ring-red-100"
										: "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
								}`}
								onChange={(e) => {
									setForm({ ...form, companyName: e.target.value });
									setErrors((p) => ({ ...p, companyName: undefined }));
								}}
							/>
							{errors.companyName && (
								<p className="mt-1 text-xs text-red-500">
									{errors.companyName}
								</p>
							)}
						</div>
					)}

					{/* EMAIL */}
					<div>
						<input
							placeholder="Email"
							value={form.email}
							className={`h-12 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 ${
								errors.email
									? "border-red-400 focus:ring-red-100"
									: "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
							}`}
							onChange={(e) => {
								setForm({ ...form, email: e.target.value });
								setErrors((p) => ({ ...p, email: undefined }));
							}}
						/>
						{errors.email && (
							<p className="mt-1 text-xs text-red-500">{errors.email}</p>
						)}
					</div>

					{/* PASSWORD */}
					<div>
						<input
							type="password"
							placeholder="Password"
							value={form.password}
							className={`h-12 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 ${
								errors.password
									? "border-red-400 focus:ring-red-100"
									: "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
							}`}
							onChange={(e) => {
								setForm({ ...form, password: e.target.value });
								setErrors((p) => ({ ...p, password: undefined }));
							}}
						/>
						{errors.password && (
							<p className="mt-1 text-xs text-red-500">{errors.password}</p>
						)}
					</div>

					{/* ROLE */}
					<div>
						<select
							value={form.role}
							className={`h-12 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 ${
								errors.role
									? "border-red-400 focus:ring-red-100"
									: "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
							}`}
							onChange={(e) => {
								setForm({
									...form,
									role: e.target.value,
									companyMode:
										e.target.value === "employee" ? "join" : form.companyMode,
								});
								setErrors((p) => ({ ...p, role: undefined }));
							}}
						>
							<option value="">Select an option</option>
							<option value="hr">HR</option>
							<option value="employee">Employee</option>
						</select>
						{errors.role && (
							<p className="mt-1 text-xs text-red-500">{errors.role}</p>
						)}
					</div>

					{form.role === "hr" && (
						<div>
							<select
								value={form.companyMode}
								className={`h-12 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 ${
									errors.companyMode
										? "border-red-400 focus:ring-red-100"
										: "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
								}`}
								onChange={(e) => {
									setForm({ ...form, companyMode: e.target.value });
									setErrors((p) => ({
										...p,
										companyMode: undefined,
										companyName: undefined,
									}));
								}}
							>
								<option value="create">Create new company</option>
								<option value="join">Join existing company</option>
							</select>
							{errors.companyMode && (
								<p className="mt-1 text-xs text-red-500">
									{errors.companyMode}
								</p>
							)}
						</div>
					)}

					{/* COMPANY EMAIL */}
					<div>
						<input
							placeholder={
								form.role === "hr" && form.companyMode === "join"
									? "Existing Company Email"
									: "Company Email"
							}
							value={form.companyEmail}
							className={`h-12 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 ${
								errors.companyEmail
									? "border-red-400 focus:ring-red-100"
									: "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
							}`}
							onChange={(e) => {
								setForm({ ...form, companyEmail: e.target.value });
								setErrors((p) => ({ ...p, companyEmail: undefined }));
							}}
						/>
						{errors.companyEmail && (
							<p className="mt-1 text-xs text-red-500">{errors.companyEmail}</p>
						)}
					</div>

					{errors.general && (
						<p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
							{errors.general}
						</p>
					)}

					<button
						type="submit"
						className="h-12 w-full cursor-pointer rounded-lg bg-blue-700 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-800"
					>
						Sign Up
					</button>
				</form>
				<p className="mt-5 text-center text-sm font-medium text-slate-600">
					Already have an account?{" "}
					<a href="/login" className="font-bold text-blue-700 hover:underline">
						Login
					</a>
				</p>
			</div>
		</div>
	);
}
