import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";

export default function EmployeeDashboard() {
	const [data, setData] = useState<any>(null);

	const fetchData = () => {
		fetch("/api/employee/get", { credentials: "include" })
			.then((r) => r.json())
			.then(setData);
	};

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	if (!data) {
		return (
			<p className="rounded-lg border border-blue-100 bg-white p-5 text-sm font-bold text-blue-800 shadow-[0_14px_35px_rgba(30,64,175,0.08)]">
				Loading...
			</p>
		);
	}

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(30,64,175,0.08)]">
				<p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
					Employee workspace
				</p>
				<h1 className="text-2xl font-extrabold text-slate-950">
					My Onboarding
				</h1>
			</div>

			<div className="space-y-3">
				{data.checklist.map((item: any) => (
					<div
						key={item.id}
						className={`rounded-lg border p-4 shadow-[0_10px_24px_rgba(30,64,175,0.05)] transition hover:-translate-y-0.5 hover:border-blue-300 ${
							item.completed
								? "border-blue-200 bg-blue-50"
								: "border-slate-200 bg-white"
						}`}
					>
						<button
							type="button"
							onClick={async () => {
								await fetch("/api/employee/toggle", {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									credentials: "include",
									body: JSON.stringify({
										checklistItemId: item.id,
									}),
								});

								fetchData();
							}}
							className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
						>
							<span className="flex items-center gap-2 text-sm font-bold text-slate-900">
								{item.title}
								{item.warning && !item.completed && (
									<AlertTriangle
										size={16}
										className="text-amber-500"
										aria-label="Warning"
									/>
								)}
							</span>

							<span
								className={`shrink-0 ${
									item.completed ? "text-blue-700" : "text-slate-400"
								}`}
							>
								{item.completed ? (
									<CheckCircle2 size={20} aria-label="Completed" />
								) : (
									<Circle size={20} aria-label="Pending" />
								)}
							</span>
						</button>

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
					</div>
				))}
			</div>
		</div>
	);
}
