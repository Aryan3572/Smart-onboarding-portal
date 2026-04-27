import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Modal from "@/components/modal";
import {
	AlertTriangle,
	CheckCircle2,
	Circle,
	Download,
	FileText,
	MessageSquareText,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dasboard/employee/$id")({
	component: Page,
});

type RouteParams = {
	id: string;
};

const employeeDetailCacheTtl = 30_000;

function readEmployeeDetailCache(key: string) {
	if (typeof window === "undefined") return null;

	try {
		const raw = window.sessionStorage.getItem(key);
		if (!raw) return null;

		const cached = JSON.parse(raw);
		if (Date.now() - cached.savedAt > employeeDetailCacheTtl) return null;

		return cached.value;
	} catch {
		return null;
	}
}

function writeEmployeeDetailCache(key: string, value: unknown) {
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
		// Cache failures should not block employee detail rendering.
	}
}

function Page() {
	const { id } = Route.useParams() as RouteParams;
	const navigate = useNavigate();
	const [data, setData] = useState<any>(null);
	const [removeOpen, setRemoveOpen] = useState(false);
	const [removing, setRemoving] = useState(false);

	const fetchData = async () => {
		const cacheKey = `employee-detail-cache:${id}`;
		const cached = readEmployeeDetailCache(cacheKey);
		if (cached && !data) {
			setData(cached);
		}

		const res = await fetch(`/api/employee/${encodeURIComponent(id)}`, {
			credentials: "include",
		});

		if (!res.ok) {
			setData({ error: res.status === 401 ? "Unauthorized" : "Error" });
			return;
		}

		const employeeData = await res.json();
		setData(employeeData);
		writeEmployeeDetailCache(cacheKey, employeeData);
	};

	useEffect(() => {
		fetchData();
	}, [id]);

	if (!data) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 p-6">
				<p className="rounded-lg border border-blue-100 bg-white px-5 py-4 text-sm font-bold text-blue-800 shadow-[0_14px_35px_rgba(30,64,175,0.08)]">
					Loading...
				</p>
			</div>
		);
	}

	if (data.error) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 p-6 text-center">
				<div className="rounded-lg border border-red-100 bg-white p-6 shadow-[0_14px_35px_rgba(30,64,175,0.08)]">
					<p className="text-sm font-extrabold text-red-700">
						{data.error === "Unauthorized"
							? "You are not authorized to view this employee record."
							: "Could not load employee record."}
					</p>
				</div>
			</div>
		);
	}

	const allItems = Object.values(data.checklist).flat() as any[];
	const completed = allItems.filter((i: any) => i.completed).length;
	const total = allItems.length;
	const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
	const documentsByItem = (data.documents || []).reduce(
		(acc: Record<string, any[]>, doc: any) => {
			if (!doc.checklistItemId) return acc;
			if (!acc[doc.checklistItemId]) acc[doc.checklistItemId] = [];
			acc[doc.checklistItemId].push(doc);
			return acc;
		},
		{},
	);

	const updateItemState = (checklistItemId: string, completed: boolean) => {
		setData((prev: any) => {
			const updated = { ...prev };

			Object.keys(updated.checklist).forEach((team) => {
				updated.checklist[team] = updated.checklist[team].map((item: any) =>
					item.checklistItemId === checklistItemId
						? { ...item, completed }
						: item,
				);
			});

			return updated;
		});
	};

	const handleRemoveEmployee = async () => {
		setRemoving(true);

		const res = await fetch(`/api/employee/${encodeURIComponent(id)}`, {
			method: "DELETE",
			credentials: "include",
		});

		if (!res.ok) {
			setRemoving(false);
			alert("Could not remove employee. Please try again.");
			return;
		}

		navigate({ to: "/dashboard" });
	};

	return (
		<div className="min-h-[80vh] bg-gradient-to-br from-white via-blue-50 to-slate-100">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-lg border border-blue-100 bg-white p-4 shadow-[0_24px_60px_rgba(30,64,175,0.1)] sm:p-8">
				<div className="text-center">
					<p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
						Employee record
					</p>
					<h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
						Employee Details
					</h1>
				</div>

				<section className="rounded-lg border border-blue-100 bg-white p-4 shadow-[0_12px_30px_rgba(30,64,175,0.06)]">
					<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
								Employee details
							</p>
							<h2 className="mt-1 text-xl font-extrabold text-slate-950">
								{data.name}
							</h2>
							<p className="mt-1 break-all text-sm font-semibold text-slate-600 sm:break-normal">
								{data.email}
							</p>
						</div>

						<div className="flex flex-col gap-2 sm:items-end">
							<span className="w-fit rounded-lg bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-blue-800">
								{data.role}
							</span>
							<button
								type="button"
								onClick={() => setRemoveOpen(true)}
								disabled={removing}
								className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-600 px-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.26)] transition hover:border-red-500/50 hover:bg-red-600 hover:shadow-[0_10px_24px_rgba(220,38,38,0.26)] disabled:cursor-not-allowed disabled:opacity-60"
							>
								<Trash2 size={16} aria-hidden="true" />
								{removing ? "Removing..." : "Remove"}
							</button>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
							<p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
								Name
							</p>
							<p className="mt-1 break-words text-sm font-bold text-slate-950">
								{data.name}
							</p>
						</div>
						<div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
							<p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
								Email
							</p>
							<p className="mt-1 break-all text-sm font-bold text-slate-950">
								{data.email}
							</p>
						</div>
						<div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
							<p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
								Role
							</p>
							<p className="mt-1 break-words text-sm font-bold text-slate-950">
								{data.role}
							</p>
						</div>
					</div>
				</section>

				<div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
					<div className="mb-2 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
						<span className="font-bold text-slate-700">
							Onboarding Progress
						</span>
						<span className="font-extrabold text-blue-800">
							{progress}% completed
						</span>
					</div>

					<div className="h-3 w-full overflow-hidden rounded-full bg-blue-100">
						<div
							className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				<div>
					<h2 className="mb-4 text-lg font-extrabold text-slate-950">
						Onboarding Checklist
					</h2>

					{Object.entries(data.checklist).length === 0 ? (
						<p className="rounded-lg border border-dashed border-blue-200 bg-blue-50/40 p-5 text-center text-sm font-bold text-slate-600">
							No team checklist has been assigned to this employee yet.
						</p>
					) : (
						Object.entries(data.checklist).map(([teamName, items]: any) => (
							<div key={teamName} className="mb-5 last:mb-0">
								<h3 className="mb-2 text-base font-extrabold text-blue-800">
									{teamName} Team
								</h3>

								<div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/40 p-4">
									{items.map((item: any) => (
										<ChecklistRow
											key={item.checklistItemId}
											item={item}
											employeeId={id}
											updateItemState={updateItemState}
											documents={documentsByItem[item.checklistItemId] || []}
										/>
									))}
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{removeOpen && (
				<Modal onClose={() => setRemoveOpen(false)}>
					<div className="rise-in rounded-lg border border-red-100 bg-white px-6 py-7 shadow-[0_24px_60px_rgba(127,29,29,0.18)]">
						<div className="mb-5 flex items-start gap-3">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
								<Trash2 size={22} aria-hidden="true" />
							</div>
							<div>
								<p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-700">
									Remove employee
								</p>
								<h2 className="mt-1 text-2xl font-extrabold text-slate-950">
									Remove {data.name}?
								</h2>
								<p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
									This will remove the employee account, checklist progress, and
									linked onboarding records from this company.
								</p>
							</div>
						</div>

						<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
							<button
								type="button"
								onClick={() => setRemoveOpen(false)}
								disabled={removing}
								className="h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleRemoveEmployee}
								disabled={removing}
								className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(220,38,38,0.2)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
							>
								<Trash2 size={16} aria-hidden="true" />
								{removing ? "Removing..." : "Remove Employee"}
							</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
}

function ChecklistRow({
	item,
	employeeId,
	updateItemState,
	documents = [],
}: any) {
	const [warningOpen, setWarningOpen] = useState(false);
	const [warningMessage, setWarningMessage] = useState("");
	const [warningSending, setWarningSending] = useState(false);
	const [localWarning, setLocalWarning] = useState(item.warning || "");

	const requiresUpload = item.checklistItem.requiresUpload;
	const hasDocuments = documents.length > 0;

	const handleToggle = async () => {
		const nextCompleted = !item.completed;
		updateItemState(item.checklistItemId, nextCompleted);

		const res = await fetch("/api/employee/toggle", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				checklistItemId: item.checklistItemId,
				employeeId,
				completed: nextCompleted,
			}),
		});

		if (!res.ok) {
			updateItemState(item.checklistItemId, item.completed);
			alert("Could not save checklist progress. Please try again.");
		}
	};

	const handleWarningSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const message = warningMessage.trim();
		if (!message) return;

		setWarningSending(true);

		await fetch("/api/employee/warn", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				employeeId,
				checklistItemId: item.checklistItemId,
				message,
			}),
		});

		setLocalWarning(message);
		setWarningMessage("");
		setWarningOpen(false);
		setWarningSending(false);
	};

	return (
		<div
			className={`rounded-lg border p-4 ${
				item.completed
					? "border-blue-200 bg-white"
					: "border-slate-200 bg-white"
			}`}
		>
			<div
				onClick={!requiresUpload ? handleToggle : undefined}
				className="flex cursor-pointer flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
			>
				<span className="break-words text-sm font-bold text-slate-900">
					{item.checklistItem.title}
					{localWarning && !item.completed && (
						<AlertTriangle
							size={16}
							className="ml-2 inline text-amber-500"
							aria-label="Warning"
						/>
					)}
				</span>

				<span
					className={`inline-flex shrink-0 items-center gap-1 text-xs font-extrabold ${
						item.completed ? "text-blue-700" : "text-slate-500"
					}`}
				>
					{item.completed ? (
						<CheckCircle2 size={16} aria-hidden="true" />
					) : (
						<Circle size={16} aria-hidden="true" />
					)}
					{item.completed ? "Completed" : "Pending"}
				</span>
			</div>

			{localWarning && !item.completed && (
				<div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 shadow-sm">
					<div className="flex items-start gap-2">
						<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
							<AlertTriangle size={14} aria-hidden="true" />
						</span>
						<div>
							<p className="text-xs font-extrabold uppercase tracking-[0.12em] text-amber-800">
								Warning Message
							</p>
							<p className="mt-1 text-sm font-semibold leading-5 text-amber-900">
								{localWarning}
							</p>
						</div>
					</div>
				</div>
			)}

			{hasDocuments && (
				<div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
					<div className="mb-3 flex items-center gap-2">
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
							<FileText size={16} aria-hidden="true" />
						</span>
						<div>
							<p className="text-sm font-extrabold text-slate-950">
								Latest employee submission
							</p>
							<p className="text-xs font-semibold text-slate-600">
								Only the newest file or note is shown
							</p>
						</div>
					</div>

					<div className="space-y-2">
						{documents.map((doc: any) => {
							const canOpen =
								typeof doc.fileUrl === "string" &&
								(doc.fileUrl.startsWith("/uploads/") ||
									doc.fileUrl.startsWith("http://") ||
									doc.fileUrl.startsWith("https://"));

							return (
								<div
									key={doc.id}
									className="rounded-lg border border-emerald-100 bg-white p-3 shadow-sm"
								>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<div className="min-w-0">
											<p className="truncate text-sm font-extrabold text-slate-950">
												{doc.fileName}
											</p>
											<p className="mt-1 text-xs font-semibold text-slate-500">
												Submitted{" "}
												{new Date(doc.createdAt).toLocaleString(undefined, {
													dateStyle: "medium",
													timeStyle: "short",
												})}
												{doc.fileSizeKb ? ` - ${doc.fileSizeKb} KB` : ""}
											</p>
										</div>

										{canOpen ? (
											<a
												href={doc.fileUrl}
												target="_blank"
												rel="noreferrer"
												className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-extrabold text-white no-underline shadow-[0_10px_20px_rgba(5,150,105,0.18)] hover:bg-emerald-700"
											>
												<Download size={14} aria-hidden="true" />
												View document
											</a>
										) : doc.question ? (
											<span className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600">
												Text only
											</span>
										) : null}
									</div>

									{doc.question && (
										<div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
											<MessageSquareText
												size={15}
												className="mt-0.5 shrink-0 text-blue-700"
												aria-hidden="true"
											/>
											<p className="text-sm font-semibold leading-5 text-slate-700">
												{doc.question}
											</p>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}

			{!item.completed && (
				<button
					type="button"
					onClick={() => setWarningOpen(true)}
					className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 transition hover:bg-blue-100"
				>
					<AlertTriangle size={14} aria-hidden="true" />
					Warn Employee
				</button>
			)}

			{warningOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-lg border border-blue-100 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
						<div className="mb-5 flex items-start gap-3">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
								<AlertTriangle size={22} aria-hidden="true" />
							</div>
							<div>
								<p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
									Employee warning
								</p>
								<h3 className="mt-1 text-xl font-extrabold text-slate-950">
									Send warning message
								</h3>
								<p className="mt-1 text-sm font-medium text-slate-600">
									Write a clear note about what needs attention for this
									checklist item.
								</p>
							</div>
						</div>

						<form onSubmit={handleWarningSubmit} className="space-y-4">
							<textarea
								value={warningMessage}
								onChange={(e) => setWarningMessage(e.target.value)}
								placeholder="Enter warning message..."
								className="min-h-28 w-full resize-none rounded-lg border border-blue-100 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								autoFocus
							/>

							<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
								<button
									type="button"
									onClick={() => {
										setWarningOpen(false);
										setWarningMessage("");
									}}
									className="h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={!warningMessage.trim() || warningSending}
									className="h-10 cursor-pointer rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)] transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{warningSending ? "Sending..." : "Send Warning"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default Page;
