import { createFileRoute } from "@tanstack/react-router";
import {
	AlertTriangle,
	ClipboardList,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "@/components/modal";

export const Route = createFileRoute("/dasboard/settings/setting")({
	component: SettingsPage,
});

function SettingsPage() {
	const [teamName, setTeamName] = useState("");
	const [teamError, setTeamError] = useState("");
	const [teamLoading, setTeamLoading] = useState(false);
	const [titles, setTitles] = useState<{ [key: string]: string }>({});
	const [teams, setTeams] = useState<any[]>([]);
	const [newItem, setNewItem] = useState<{ [key: string]: string }>({});
	const [user, setUser] = useState<any>(null);
	const [pendingDelete, setPendingDelete] = useState<{
		type: "team" | "checklist" | "item";
		id: string;
		title: string;
	} | null>(null);
	const [deleteError, setDeleteError] = useState("");
	const [deleteLoading, setDeleteLoading] = useState(false);

	const fetchChecklist = async () => {
		try {
			const res = await fetch("/api/checklist/get", {
				credentials: "include",
			});

			const data = await res.json();

			console.log("API DATA:", data);

			setTeams(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error("Failed to fetch checklist:", err);
			setTeams([]);
		}
	};

	useEffect(() => {
		fetchChecklist();
	}, []);

	useEffect(() => {
		fetch("/api/auth/me", { credentials: "include" })
			.then((r) => r.json())
			.then(setUser);
	}, []);

	if (!user) return null;

	if (user.role !== "hr") {
		return (
			<div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 p-6 text-center">
				<div className="rounded-lg border border-blue-100 bg-white p-6 text-sm font-bold text-slate-700 shadow-[0_18px_45px_rgba(30,64,175,0.08)]">
					You are not authorized to access this page
				</div>
			</div>
		);
	}

	const submit = async (teamId: string) => {
		const title = titles[teamId];

		if (!title) return;

		await fetch("/api/checklist/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				title,
				teamId,
			}),
		});

		setTitles((prev) => ({
			...prev,
			[teamId]: "",
		}));

		fetchChecklist();
	};

	const addTeam = async () => {
		const name = teamName.trim();
		if (!name) return;

		setTeamLoading(true);
		setTeamError("");

		const res = await fetch("/api/team", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ name }),
		});

		const data = await res.json();

		if (!res.ok) {
			setTeamError(data.error || "Could not add team. Please try again.");
			setTeamLoading(false);
			return;
		}

		setTeamName("");
		await fetchChecklist();
		setTeamLoading(false);
	};

	const addItem = async (checklistId: string) => {
		if (!newItem[checklistId]) return;

		await fetch("/api/checklist/add-item", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				checklistId,
				title: newItem[checklistId],
			}),
		});

		setNewItem((prev) => ({ ...prev, [checklistId]: "" }));
		fetchChecklist();
	};

	const confirmRemove = async () => {
		if (!pendingDelete) return;

		setDeleteLoading(true);
		setDeleteError("");

		const res =
			pendingDelete.type === "team"
				? await fetch("/api/team", {
						method: "DELETE",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({ teamId: pendingDelete.id }),
					})
				: await fetch("/api/checklist/delete", {
						method: "DELETE",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify(
							pendingDelete.type === "checklist"
								? { checklistId: pendingDelete.id }
								: { itemId: pendingDelete.id },
						),
					});

		if (!res.ok) {
			setDeleteError("Could not remove this. Please try again.");
			setDeleteLoading(false);
			return;
		}

		await fetchChecklist();
		setDeleteLoading(false);
		setPendingDelete(null);
	};

	return (
		<div className="bg-gradient-to-br from-white via-blue-50 to-slate-100">
			<div className="mx-auto w-full max-w-5xl space-y-6">
				<div className="rounded-lg border border-blue-100 bg-white p-4 text-center shadow-[0_18px_45px_rgba(30,64,175,0.08)] sm:p-5">
					<p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
						Checklist settings
					</p>
					<h1 className="text-2xl font-extrabold text-slate-950">
						Prepare Checklist
					</h1>
					<p className="mt-2 text-sm font-medium text-slate-600">
						Create team checklists and add onboarding items.
					</p>
				</div>

				<div className="rounded-lg border border-blue-100 bg-white p-4 shadow-[0_18px_45px_rgba(30,64,175,0.08)] sm:p-5">
					<div className="mb-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
							<Plus size={20} aria-hidden="true" />
						</div>
						<div>
							<h2 className="text-lg font-extrabold text-slate-950">Teams</h2>
							<p className="text-sm font-semibold text-slate-600">
								Add a team before creating team checklists.
							</p>
						</div>
					</div>

					<div className="flex flex-col gap-2 sm:flex-row">
						<input
							placeholder="Team name"
							value={teamName}
							onChange={(e) => {
								setTeamName(e.target.value);
								setTeamError("");
							}}
							className="h-11 min-w-0 flex-1 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
						/>
						<button
							type="button"
							onClick={addTeam}
							disabled={!teamName.trim() || teamLoading}
							className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)] transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
						>
							{teamLoading ? (
								<Loader2
									className="animate-spin"
									size={16}
									aria-hidden="true"
								/>
							) : (
								<Plus size={16} aria-hidden="true" />
							)}
							Add team
						</button>
					</div>

					{teamError && (
						<p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
							{teamError}
						</p>
					)}
				</div>

				{teams.length === 0 && (
					<p className="rounded-lg border border-blue-100 bg-white p-6 text-center text-sm font-bold text-slate-600 shadow-[0_14px_35px_rgba(30,64,175,0.07)]">
						No teams found or data not loaded
					</p>
				)}

				{teams.map((team) => (
					<div
						key={team.id}
						className="rounded-lg border border-blue-100 bg-white p-4 shadow-[0_18px_45px_rgba(30,64,175,0.08)] sm:p-5"
					>
						<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
									<ClipboardList size={20} aria-hidden="true" />
								</div>
								<h2 className="text-lg font-extrabold text-slate-950">
									{team.name} Team
								</h2>
							</div>
							<button
								type="button"
								onClick={() =>
									setPendingDelete({
										type: "team",
										id: team.id,
										title: `${team.name} Team`,
									})
								}
								className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 text-xs font-extrabold text-red-700 transition hover:border-red-200 hover:bg-red-100 sm:w-auto"
							>
								<Trash2 size={14} aria-hidden="true" />
								Remove team
							</button>
						</div>

						<div className="mb-5 flex flex-col gap-2 sm:flex-row">
							<input
								placeholder="Checklist Title"
								value={titles[team.id] || ""}
								onChange={(e) =>
									setTitles({
										...titles,
										[team.id]: e.target.value,
									})
								}
								className="h-11 min-w-0 flex-1 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>

							<button
								type="button"
								onClick={() => submit(team.id)}
								className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)] transition hover:bg-blue-800 sm:w-auto"
							>
								<Plus size={16} aria-hidden="true" />
								Add
							</button>
						</div>

						{team.checklists?.length === 0 && (
							<p className="mb-2 text-sm font-semibold text-slate-500">
								No checklists yet
							</p>
						)}

						<div className="space-y-4">
							{team.checklists?.map((checklist: any) => (
								<div
									key={checklist.id}
									className="rounded-lg border border-blue-100 bg-blue-50/40 p-3 sm:p-4"
								>
									<div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<h3 className="font-extrabold text-blue-800">
											{checklist.title}
										</h3>
										<button
											type="button"
											onClick={() =>
												setPendingDelete({
													type: "checklist",
													id: checklist.id,
													title: checklist.title,
												})
											}
											className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-3 text-xs font-extrabold text-red-700 transition hover:border-red-200 hover:bg-red-50"
										>
											<Trash2 size={14} aria-hidden="true" />
											Remove checklist
										</button>
									</div>

									<ul className="mb-4 space-y-2 text-slate-900">
										{checklist.items?.length === 0 && (
											<p className="text-xs font-semibold text-slate-500">
												No items
											</p>
										)}

										{checklist.items?.map((item: any) => (
											<li
												key={item.id}
												className="flex flex-col gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 sm:flex-row sm:items-center sm:justify-between"
											>
												<span className="break-words">{item.title}</span>
												<button
													type="button"
													onClick={() =>
														setPendingDelete({
															type: "item",
															id: item.id,
															title: item.title,
														})
													}
													aria-label={`Remove ${item.title}`}
													className="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 text-xs font-extrabold text-red-700 transition hover:border-red-200 hover:bg-red-100 sm:w-auto"
												>
													<Trash2 size={13} aria-hidden="true" />
													Remove
												</button>
											</li>
										))}
									</ul>

									<div className="flex flex-col gap-2 sm:flex-row">
										<input
											placeholder="Add item..."
											value={newItem[checklist.id] || ""}
											onChange={(e) =>
												setNewItem({
													...newItem,
													[checklist.id]: e.target.value,
												})
											}
											className="h-11 min-w-0 flex-1 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
										/>

										<button
											type="button"
											onClick={() => addItem(checklist.id)}
											className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800"
										>
											<Plus size={16} aria-hidden="true" />
											Add
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{pendingDelete && (
				<Modal
					onClose={() => {
						if (!deleteLoading) {
							setPendingDelete(null);
							setDeleteError("");
						}
					}}
				>
					<div className="rise-in rounded-lg border border-red-100 bg-white p-6 shadow-[0_24px_60px_rgba(127,29,29,0.16)]">
						<div className="mb-5 flex items-start gap-3">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
								<AlertTriangle size={22} aria-hidden="true" />
							</div>
							<div className="min-w-0">
								<p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-700">
									Confirm removal
								</p>
								<h2 className="mt-1 text-xl font-extrabold text-slate-950">
									Remove {pendingDelete.type}
								</h2>
								<p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
									You are about to remove{" "}
									<span className="font-extrabold text-slate-950">
										{pendingDelete.title}
									</span>
									{pendingDelete.type === "team"
										? " and all checklists inside it."
										: pendingDelete.type === "checklist"
											? " and all checklist items inside it."
											: " from this checklist."}
								</p>
							</div>
						</div>

						{deleteError && (
							<p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
								{deleteError}
							</p>
						)}

						<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
							<button
								type="button"
								onClick={() => {
									setPendingDelete(null);
									setDeleteError("");
								}}
								disabled={deleteLoading}
								className="h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={confirmRemove}
								disabled={deleteLoading}
								className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(220,38,38,0.2)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{deleteLoading && (
									<Loader2
										className="animate-spin"
										size={16}
										aria-hidden="true"
									/>
								)}
								Remove
							</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
}
