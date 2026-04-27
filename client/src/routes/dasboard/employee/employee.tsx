import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "@/components/modal";

export const Route = createFileRoute("/dasboard/employee/employee")({
	component: EmployeePage,
});

function EmployeePage() {
	const [open, setOpen] = useState(false);
	const [employees, setEmployees] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [role, setRole] = useState<"hr" | "employee" | null>(null);

	const [form, setForm] = useState({
		name: "",
		email: "",
		role: "",
	});

	const fetchEmployees = async () => {
		setLoading(true);

		const res = await fetch("/api/employee/me", {
			credentials: "include",
		});

		const data = await res.json();

		setRole(data.role);
		setEmployees(data.employees || []);

		setLoading(false);
	};

	useEffect(() => {
		fetchEmployees();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const res = await fetch("/api/employee/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(form),
		});

		if (res.ok) {
			setOpen(false);
			fetchEmployees();
			setForm({ name: "", email: "", role: "" });
		}
	};

	return (
		<div className="bg-gradient-to-br from-white via-blue-50 to-slate-100">
			<div className="mx-auto w-full max-w-5xl space-y-6">
				<div className="flex flex-col gap-4 rounded-lg border border-blue-100 bg-white p-4 shadow-[0_18px_45px_rgba(30,64,175,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
					<div>
						<p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
							People operations
						</p>
						<h1 className="text-2xl font-extrabold text-slate-950">
							Employee Onboarding
						</h1>
						<p className="mt-2 text-sm font-medium text-slate-600">
							Manage onboarding users and review their account details.
						</p>
					</div>

					{role === "hr" && (
						<button
							type="button"
							onClick={() => setOpen(true)}
							className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-800 sm:w-auto"
						>
							<UserPlus size={18} aria-hidden="true" />
							Add Employee
						</button>
					)}
				</div>

				<div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_20px_50px_rgba(30,64,175,0.08)]">
					<div className="flex items-center gap-3 border-b border-blue-100 p-4 sm:p-5">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
							<Users size={20} aria-hidden="true" />
						</div>
						<div>
							<h2 className="font-extrabold text-slate-950">Employee List</h2>
							<p className="text-sm font-medium text-slate-600">
								{employees.length}{" "}
								{employees.length === 1 ? "employee" : "employees"}
							</p>
						</div>
					</div>

					{loading ? (
						<p className="p-6 text-sm font-bold text-blue-800">Loading...</p>
					) : employees.length === 0 ? (
						<p className="p-6 text-sm font-bold text-slate-600">
							No employees yet
						</p>
					) : (
						employees.map((emp) => (
							<div
								key={emp.id}
								className="flex flex-col gap-3 border-b border-blue-50 px-4 py-4 transition last:border-b-0 hover:bg-blue-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-5"
							>
								<div className="min-w-0">
									<h3 className="truncate text-base font-extrabold text-slate-950">
										{emp.name}
									</h3>
									<p className="mt-1 break-all text-sm font-medium text-slate-600 sm:break-normal">
										{emp.email}
									</p>
								</div>

								<span className="w-fit rounded-lg bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-blue-800">
									{emp.role}
								</span>
							</div>
						))
					)}
				</div>
			</div>

			{open && role === "hr" && (
				<Modal onClose={() => setOpen(false)}>
					<div className="rise-in rounded-lg border border-blue-100 bg-white px-6 py-7 shadow-[0_24px_60px_rgba(30,64,175,0.18)]">
						<div className="mb-6">
							<p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
								New employee
							</p>
							<h2 className="text-2xl font-extrabold text-slate-950">
								Add employee
							</h2>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<input
								placeholder="Name"
								className="h-11 w-full rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
							/>

							<input
								placeholder="Email"
								className="h-11 w-full rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
							/>

							<input
								placeholder="Role"
								className="h-11 w-full rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								value={form.role}
								onChange={(e) => setForm({ ...form, role: e.target.value })}
							/>

							<button
								type="submit"
								className="h-11 w-full cursor-pointer rounded-lg bg-blue-700 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-800"
							>
								Add Employee
							</button>
						</form>
					</div>
				</Modal>
			)}
		</div>
	);
}
