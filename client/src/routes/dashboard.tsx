import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import Sidebar, { MobileDashboardNav } from "@/components/sidebar";
import Modal from "@/components/modal";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { z } from "zod";
import {
	AlertTriangle,
	CheckCircle2,
	ChevronRight,
	Circle,
	ClipboardCheck,
	FileText,
	Eye,
	EyeOff,
	KeyRound,
	Loader2,
	Send,
	UploadCloud,
	UserPlus,
	Users,
	X,
} from "lucide-react";

const employeeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	role: z.string().min(1, "Role is required"),
});

const dashboardCachePrefix = "dashboard-cache:";
const dashboardCacheTtl = 30_000;

function readDashboardCache(key: string) {
	if (typeof window === "undefined") return null;

	try {
		const raw = window.sessionStorage.getItem(key);
		if (!raw) return null;

		const cached = JSON.parse(raw);
		if (Date.now() - cached.savedAt > dashboardCacheTtl) return null;

		return cached.value;
	} catch {
		return null;
	}
}

function writeDashboardCache(key: string, value: unknown) {
	if (typeof window === "undefined") return;

	try {
		window.sessionStorage.setItem(
			key,
			JSON.stringify({
				savedAt: Date.now(),
				value,
			}),
		);
	} catch {
		// Cache failures should never block the dashboard.
	}
}

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const res = await fetch("http://localhost:3000/api/auth/me", {
			credentials: "include",
			cache: "no-store",
		});

		if (!res.ok) {
			throw redirect({ to: "/login" });
		}
	},
	component: DashboardLayout,
});

function DashboardLayout() {
	const [open, setOpen] = useState(false);
	const [passwordOpen, setPasswordOpen] = useState(false);
	const [employees, setEmployees] = useState<any[]>([]);
	const [employeeSelf, setEmployeeSelf] = useState<any>(null);
	const [employeeChecklist, setEmployeeChecklist] = useState<any>({});
	const [loading, setLoading] = useState(true);
	const [role, setRole] = useState<"hr" | "employee" | null>(null);
	const [form, setForm] = useState({
		name: "",
		email: "",
		role: "",
	});
	const [errors, setErrors] = useState<{
		name?: string;
		email?: string;
		role?: string;
	}>({});

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const result = employeeSchema.safeParse(form);

		if (!result.success) {
			const fieldErrors: any = {};

			result.error.issues.forEach((err) => {
				const field = err.path[0];
				if (field) fieldErrors[field] = err.message;
			});

			setErrors(fieldErrors);
			return;
		}

		setErrors({}); // clear errors if valid

		const res = await fetch("/api/employee/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(result.data),
		});

		const data = await res.json();

		if (!res.ok) {
			if (data.error?.includes("email")) {
				setErrors((prev) => ({
					...prev,
					email: data.error,
				}));
			} else {
				alert(data.error || "Something went wrong");
			}
			return;
		}

		alert(`Employee created!\nPassword: ${data.password}`);

		setOpen(false);
		setForm({ name: "", email: "", role: "" });
		setErrors({}); // reset errors
		fetchData();
	};
	const navigate = useNavigate();

	const fetchData = async () => {
		const hasCachedData = employees.length > 0 || employeeSelf;
		if (!hasCachedData) setLoading(true);

		const res = await fetch("/api/employee/me", {
			credentials: "include",
			cache: "no-store",
		});

		if (!res.ok) {
			window.sessionStorage.clear();
			navigate({ to: "/login" });
			return;
		}

		const data = await res.json();
		const cacheKey = `${dashboardCachePrefix}${data.role}:${data.userId}`;
		const cached = readDashboardCache(cacheKey);

		setRole(data.role);

		if (data.role === "hr") {
			setEmployeeSelf(null);
			setEmployeeChecklist({});

			if (cached?.employees?.length && !hasCachedData) {
				setEmployees(cached.employees);
				setLoading(false);
			}

			setEmployees(data.employees || []);
			writeDashboardCache(cacheKey, {
				employees: data.employees || [],
			});
		}

		if (data.role === "employee") {
			setEmployees([]);
			setEmployeeSelf(data.self);
			if (cached?.employeeChecklist && !hasCachedData) {
				setEmployeeChecklist(cached.employeeChecklist);
				setLoading(false);
			}

			const checklistRes = await fetch(`/api/employee/${data.self.id}`, {
				credentials: "include",
				cache: "no-store",
			});

			const checklistData = await checklistRes.json();
			setEmployeeChecklist(checklistData.checklist || {});
			writeDashboardCache(cacheKey, {
				employeeChecklist: checklistData.checklist || {},
			});
		}

		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	const allItems = Object.values(employeeChecklist).flat() as any[];
	const completed = allItems.filter((i: any) => i.completed).length;
	const total = allItems.length;
	const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

	const updateEmployeeProgress = (
		employeeId: string,
		completedNow: boolean,
	) => {
		setEmployees((prev) =>
			prev.map((emp) => {
				if (emp.id !== employeeId) return emp;

				const total = emp.totalChecklist || 10;
				const delta = Math.round(100 / total);

				const newProgress = completedNow
					? emp.progress + delta
					: emp.progress - delta;

				return {
					...emp,
					progress: Math.max(0, Math.min(100, newProgress)),
				};
			}),
		);
	};

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 text-slate-900">
			<aside className="hidden border-r border-blue-100 bg-white shadow-[12px_0_40px_rgba(30,64,175,0.08)] lg:block">
				<Sidebar />
			</aside>

			<main className="min-w-0 flex-1 px-4 py-6 pb-28 sm:px-6 sm:pb-28 lg:px-10 lg:py-8">
				<div className="mb-6 flex flex-col gap-5 rounded-lg border border-blue-100 bg-white p-4 shadow-[0_18px_45px_rgba(30,64,175,0.08)] sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:p-5">
					<div>
						<p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
							{role === "hr" ? "People operations" : "Onboarding workspace"}
						</p>
						<h1 className="text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">
							{role === "hr" ? "Employees" : "My Dashboard"}
						</h1>
						<p className="mt-2 max-w-2xl text-sm font-medium normal-case tracking-normal text-slate-600">
							{role === "hr"
								? "Track employee onboarding progress and add new team members."
								: "Review your assigned onboarding tasks and upload required documents."}
						</p>
					</div>

					{role === "hr" && (
						<button
							type="button"
							onClick={() => setOpen(true)}
							className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
						>
							<UserPlus size={18} aria-hidden="true" />
							Add Employee
						</button>
					)}
				</div>

				{role === "hr" && (
					<section className="rounded-lg border border-blue-100 bg-white p-4 shadow-[0_20px_50px_rgba(30,64,175,0.08)] sm:p-6">
						<div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
									<Users size={21} aria-hidden="true" />
								</div>
								<div>
									<h2 className="text-base font-extrabold text-slate-950">
										Employee Overview
									</h2>
									<p className="text-sm font-medium text-slate-600">
										{employees.length}{" "}
										{employees.length === 1 ? "employee" : "employees"} in
										onboarding
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-3">
							{loading ? (
								<StatusPanel
									icon={<Loader2 className="animate-spin" size={20} />}
									text="Loading employees..."
								/>
							) : employees.length === 0 ? (
								<StatusPanel
									icon={<Users size={20} />}
									text="No employees yet"
								/>
							) : (
								employees.map((emp) => (
									<div
										key={emp.id}
										onClick={() =>
											navigate({
												to: "/dasboard/employee/$id",
												params: { id: emp.id },
											})
										}
										className="group flex cursor-pointer flex-col gap-4 rounded-lg border border-blue-100 bg-white p-4 shadow-[0_10px_24px_rgba(30,64,175,0.06)] hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="flex min-w-0 items-center gap-3">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-extrabold uppercase text-blue-800">
												{emp.name?.charAt(0) || "E"}
											</div>
											<div className="min-w-0">
												<h3 className="truncate text-sm font-extrabold text-slate-950 sm:text-base">
													{emp.name}
												</h3>
												<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
													Employee
												</p>
											</div>
										</div>

										<div className="flex w-full min-w-0 items-center gap-3 sm:w-72 sm:gap-4">
											<div className="min-w-0 flex-1">
												<div className="mb-2 flex items-center justify-between text-sm">
													<span className="font-semibold text-slate-600">
														Progress
													</span>
													<span className="font-extrabold text-blue-800">
														{emp.progress}%
													</span>
												</div>
												<ProgressBar value={emp.progress} />
											</div>
											<ChevronRight
												size={20}
												className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700"
												aria-hidden="true"
											/>
										</div>
									</div>
								))
							)}
						</div>
					</section>
				)}

				{role === "employee" && employeeSelf && (
					<section className="space-y-5">
						<div className="rounded-lg border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(30,64,175,0.08)]">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
										Assigned to
									</p>
									<h2 className="text-2xl font-extrabold text-slate-950">
										{employeeSelf.name}
									</h2>
									<button
										type="button"
										onClick={() => setPasswordOpen(true)}
										className="mt-3 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-blue-800 transition hover:bg-blue-100"
									>
										<KeyRound size={16} aria-hidden="true" />
										Change Password
									</button>
								</div>

								<div className="w-full sm:w-80">
									<div className="mb-2 flex items-center justify-between text-sm">
										<span className="font-semibold text-slate-600">
											Onboarding progress
										</span>
										<span className="font-extrabold text-blue-800">
											{progress}%
										</span>
									</div>

									<ProgressBar value={progress} />
								</div>
							</div>
						</div>

						<div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_14px_35px_rgba(30,64,175,0.07)]">
							<div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
										<ClipboardCheck size={20} aria-hidden="true" />
									</div>
									<div>
										<h3 className="font-extrabold text-slate-950">
											Onboarding Checklist
										</h3>
										<p className="text-sm font-medium text-slate-600">
											{allItems.length}{" "}
											{allItems.length === 1 ? "task" : "tasks"}
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-3 border-t border-blue-100 bg-blue-50/30 p-4">
								{allItems.length === 0 ? (
									<p className="rounded-lg border border-dashed border-blue-200 bg-white p-5 text-center text-sm font-bold text-slate-600">
										No checklist items assigned yet.
									</p>
								) : (
									allItems.map((item: any) => (
										<ChecklistRow
											key={item.checklistItemId}
											item={item}
											setEmployeeChecklist={setEmployeeChecklist}
											updateEmployeeProgress={updateEmployeeProgress}
										/>
									))
								)}
							</div>
						</div>
					</section>
				)}
			</main>

			<MobileDashboardNav />

			{open && role === "hr" && (
				<Modal onClose={() => setOpen(false)}>
					<div className="rise-in relative overflow-hidden rounded-lg border border-blue-100 bg-white px-6 py-7 shadow-[0_24px_60px_rgba(30,64,175,0.18)]">
						<div className="mb-6">
							<p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
								New employee
							</p>
							<h2 className="text-2xl font-extrabold text-slate-950">
								Add employee
							</h2>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							{/* NAME */}
							<div>
								<input
									placeholder="Name"
									value={form.name}
									className={`h-11 w-full rounded-lg border px-3 text-sm font-semibold outline-none ${
										errors.name
											? "border-red-400 focus:ring-red-100"
											: "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
									}`}
									onChange={(e) => {
										setForm({ ...form, name: e.target.value });
										setErrors((prev) => ({ ...prev, name: undefined }));
									}}
								/>
								{errors.name && (
									<p className="mt-1 text-xs text-red-500">{errors.name}</p>
								)}
							</div>

							{/* EMAIL */}
							<div>
								<input
									type="email"
									placeholder="Email"
									value={form.email}
									className={`h-11 w-full rounded-lg border px-3 text-sm font-semibold outline-none ${
										errors.email
											? "border-red-400 focus:ring-red-100"
											: "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
									}`}
									onChange={(e) => {
										setForm({ ...form, email: e.target.value });
										setErrors((prev) => ({ ...prev, email: undefined }));
									}}
								/>
								{errors.email && (
									<p className="mt-1 text-xs text-red-500">{errors.email}</p>
								)}
							</div>

							{/* ROLE */}
							<div>
								<input
									placeholder="Role"
									value={form.role}
									className={`h-11 w-full rounded-lg border px-3 text-sm font-semibold outline-none ${
										errors.role
											? "border-red-400 focus:ring-red-100"
											: "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
									}`}
									onChange={(e) => {
										setForm({ ...form, role: e.target.value });
										setErrors((prev) => ({ ...prev, role: undefined }));
									}}
								/>
								{errors.role && (
									<p className="mt-1 text-xs text-red-500">{errors.role}</p>
								)}
							</div>

							<button
								type="submit"
								className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 text-sm font-bold text-white hover:bg-blue-800"
							>
								<UserPlus size={18} />
								Add Employee
							</button>
						</form>
					</div>
				</Modal>
			)}

			{passwordOpen && role === "employee" && (
				<Modal onClose={() => setPasswordOpen(false)}>
					<ChangePasswordModal onClose={() => setPasswordOpen(false)} />
				</Modal>
			)}
		</div>
	);
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
	const navigate = useNavigate();
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (newPassword.length < 6) {
			setError("New password must be at least 6 characters.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("New password and confirmation do not match.");
			return;
		}

		setSaving(true);

		const res = await fetch("/api/auth/change-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				currentPassword,
				newPassword,
			}),
		});

		const data = await res.json();
		setSaving(false);

		if (!res.ok) {
			setError(data.error || "Could not change password. Please try again.");
			return;
		}

		setSuccess("Password changed successfully. Please login again.");
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		window.setTimeout(async () => {
			await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			window.sessionStorage.clear();
			onClose();
			navigate({ to: "/login" });
		}, 900);
	};

	return (
		<div className="rise-in rounded-lg border border-blue-100 bg-white px-6 py-7 shadow-[0_24px_60px_rgba(30,64,175,0.18)]">
			<div className="mb-6 flex items-start gap-3">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
					<KeyRound size={22} aria-hidden="true" />
				</div>
				<div>
					<p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
						Account security
					</p>
					<h2 className="mt-1 text-2xl font-extrabold text-slate-950">
						Change Password
					</h2>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<PasswordField
					value={currentPassword}
					onChange={setCurrentPassword}
					placeholder="Current password"
					visible={showCurrentPassword}
					onToggleVisible={() => setShowCurrentPassword((visible) => !visible)}
				/>
				<PasswordField
					value={newPassword}
					onChange={setNewPassword}
					placeholder="New password"
					visible={showNewPassword}
					onToggleVisible={() => setShowNewPassword((visible) => !visible)}
				/>
				<PasswordField
					value={confirmPassword}
					onChange={setConfirmPassword}
					placeholder="Confirm new password"
					visible={showConfirmPassword}
					onToggleVisible={() => setShowConfirmPassword((visible) => !visible)}
				/>

				{error && (
					<p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
						{error}
					</p>
				)}
				{success && (
					<p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
						{success}
					</p>
				)}

				<button
					type="submit"
					disabled={saving}
					className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 text-sm font-bold text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)] transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<KeyRound size={16} aria-hidden="true" />
					{saving ? "Changing..." : "Change Password"}
				</button>
			</form>
		</div>
	);
}

function PasswordField({
	value,
	onChange,
	placeholder,
	visible,
	onToggleVisible,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	visible: boolean;
	onToggleVisible: () => void;
}) {
	return (
		<div className="relative">
			<input
				type={visible ? "text" : "password"}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="h-11 w-full rounded-lg border border-blue-100 px-3 pr-11 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
				required
			/>
			<button
				type="button"
				onClick={onToggleVisible}
				aria-label={visible ? `Hide ${placeholder}` : `Show ${placeholder}`}
				className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-800"
			>
				{visible ? (
					<EyeOff size={16} aria-hidden="true" />
				) : (
					<Eye size={16} aria-hidden="true" />
				)}
			</button>
		</div>
	);
}

function StatusPanel({ icon, text }: { icon: ReactNode; text: string }) {
	return (
		<div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">
			<div className="flex flex-col items-center gap-3 text-slate-600">
				<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
					{icon}
				</div>
				<p className="text-sm font-bold text-slate-900">{text}</p>
			</div>
		</div>
	);
}

function ProgressBar({ value }: { value: number }) {
	return (
		<div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
			<div
				className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
				style={{ width: `${value}%` }}
			/>
		</div>
	);
}

const maxUploadSizeKb = 5120;

function ChecklistRow({
	item,
	setEmployeeChecklist,
	updateEmployeeProgress,
}: any) {
	const [file, setFile] = useState<File | null>(null);
	const [note, setNote] = useState("");
	const [loading, setLoading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [fileError, setFileError] = useState("");

	const title = item.checklistItem.title || "";
	const requiresSubmission =
		Boolean(item.checklistItem.requiresUpload) ||
		Boolean(item.warning) ||
		/upload|submit|document|proof|file|attachment/i.test(title);

	const updateState = (completed: boolean) => {
		setEmployeeChecklist((prev: any) => {
			const updated = { ...prev };

			Object.keys(updated).forEach((team) => {
				updated[team] = updated[team].map((i: any) =>
					i.checklistItemId === item.checklistItemId ? { ...i, completed } : i,
				);
			});

			return updated;
		});
	};

	const selectFile = (nextFile?: File | null) => {
		setFileError("");

		if (!nextFile) {
			setFile(null);
			return;
		}

		const sizeKb = Math.max(1, Math.round(nextFile.size / 1024));

		if (sizeKb > maxUploadSizeKb) {
			setFile(null);
			setFileError(
				`File is ${sizeKb} KB. Maximum allowed size is ${maxUploadSizeKb} KB.`,
			);
			return;
		}

		setFile(nextFile);
	};

	const handleToggle = async () => {
		const nextCompleted = !item.completed;
		updateState(nextCompleted);
		updateEmployeeProgress(item.employeeId, nextCompleted);

		const res = await fetch("/api/employee/toggle", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				checklistItemId: item.checklistItemId,
				employeeId: item.employeeId,
				completed: nextCompleted,
			}),
		});

		if (!res.ok) {
			updateState(item.completed);
			updateEmployeeProgress(item.employeeId, item.completed);
			alert("Could not save checklist progress. Please try again.");
		}
	};

	const handleSubmission = async () => {
		if (!file && !note.trim()) return;

		setLoading(true);

		const fd = new FormData();
		if (file) {
			fd.append("file", file);
		}
		if (note.trim()) {
			fd.append("question", note.trim());
		}
		fd.append("checklistItemId", item.checklistItemId);

		const res = await fetch("/api/document/upload", {
			method: "POST",
			credentials: "include",
			body: fd,
		});

		if (!res.ok) {
			const message = await res.text();
			alert(message || "Could not submit your document. Please try again.");
			setLoading(false);
			return;
		}

		updateState(true);
		if (!item.completed) {
			updateEmployeeProgress(item.employeeId, true);
		}

		setFile(null);
		setNote("");
		setLoading(false);
	};

	return (
		<div
			className={`rounded-lg border p-4 ${
				item.completed
					? "border-blue-200 bg-blue-50"
					: "border-slate-200 bg-white"
			}`}
		>
			<div
				onClick={!requiresSubmission ? handleToggle : undefined}
				className="flex cursor-pointer flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
			>
				<span className="flex min-w-0 items-center gap-2 break-words text-sm font-bold text-slate-900">
					{item.checklistItem.title}
					{item.warning && !item.completed && (
						<AlertTriangle
							size={16}
							className="text-amber-500"
							aria-label="Warning"
						/>
					)}
				</span>
				<span
					className={
						item.completed
							? "shrink-0 text-blue-700"
							: "shrink-0 text-slate-400"
					}
				>
					{item.completed ? (
						<CheckCircle2 size={20} aria-label="Completed" />
					) : (
						<Circle size={20} aria-label="Pending" />
					)}
				</span>
			</div>

			{item.warning && !item.completed && (
				<div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 shadow-sm">
					<div className="flex items-start gap-2">
						<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
							<AlertTriangle size={14} aria-hidden="true" />
						</span>
						<div>
							<p className="text-xs font-extrabold uppercase tracking-[0.12em] text-amber-800">
								HR Warning
							</p>
							<p className="mt-1 text-sm font-semibold leading-5 text-amber-900">
								{item.warning}
							</p>
						</div>
					</div>
				</div>
			)}

			{requiresSubmission && (
				<div className="mt-4 space-y-3 rounded-lg border border-blue-100 bg-slate-50 p-3">
					<div className="flex items-start gap-3">
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
							<FileText size={19} aria-hidden="true" />
						</span>
						<div className="min-w-0">
							<p className="text-sm font-extrabold text-slate-950">
								{item.completed ? "Upload again" : "Submit requested proof"}
							</p>
							<p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
								{item.completed
									? "Add a new file, note, or both to update your previous submission."
									: "Add a file, a short note, or both. HR will see this under your employee record."}
							</p>
						</div>
					</div>

					<div
						onClick={() =>
							document.getElementById(item.checklistItemId)?.click()
						}
						onDragEnter={() => setIsDragging(true)}
						onDragLeave={() => setIsDragging(false)}
						onDragOver={(e) => {
							e.preventDefault();
							setIsDragging(true);
						}}
						onDrop={(e) => {
							e.preventDefault();
							setIsDragging(false);
							selectFile(e.dataTransfer.files[0] || null);
						}}
						className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-5 text-center text-sm font-semibold transition ${
							isDragging
								? "border-blue-600 bg-blue-100 text-blue-900"
								: "border-blue-300 bg-white text-slate-600 hover:border-blue-500 hover:bg-blue-50/60"
						}`}
					>
						<UploadCloud
							size={24}
							className="text-blue-700"
							aria-hidden="true"
						/>
						<span className="max-w-full break-all">
							{file ? file.name : "Drag a file here or click to browse"}
						</span>
						<span className="text-xs font-medium text-slate-500">
							PDF, image, DOC, or any supporting file up to {maxUploadSizeKb} KB
						</span>
					</div>

					<input
						id={item.checklistItemId}
						type="file"
						hidden
						onChange={(e) => selectFile(e.target.files?.[0] || null)}
					/>

					{fileError && (
						<p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
							{fileError}
						</p>
					)}

					{file && (
						<div className="flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-white px-3 py-2">
							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-slate-900">
									{file.name}
								</p>
								<p className="text-xs font-semibold text-slate-500">
									{Math.max(1, Math.round(file.size / 1024))} KB selected
								</p>
							</div>
							<button
								type="button"
								onClick={() => selectFile(null)}
								aria-label="Remove selected file"
								className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
							>
								<X size={16} aria-hidden="true" />
							</button>
						</div>
					)}

					<textarea
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="Add a note for HR..."
						className="min-h-24 w-full resize-none rounded-lg border border-blue-100 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>

					<button
						type="button"
						onClick={handleSubmission}
						disabled={(!file && !note.trim()) || loading}
						className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)] hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
					>
						<Send size={16} aria-hidden="true" />
						{loading
							? "Submitting..."
							: item.completed
								? "Update submission"
								: "Submit to HR"}
					</button>
				</div>
			)}
		</div>
	);
}
