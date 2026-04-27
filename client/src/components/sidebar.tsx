import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardCheck, LayoutDashboard, Settings } from "lucide-react";

const navItems = [
	{
		to: "/dasboard/employee/employee",
		match: "/dasboard/employee/employee",
		label: "Employee Onboarding",
		icon: ClipboardCheck,
	},
	{
		to: "/dasboard/settings/setting",
		match: "/dasboard/settings/setting",
		label: "Settings",
		icon: Settings,
	},
];

export default function Sidebar() {
	const pathname = useRouterState({
		select: (s) => s.location.pathname,
	});

	return (
		<div className="group/sidebar sticky top-[73px] flex h-[calc(100dvh-73px)] w-20 flex-col overflow-hidden border-r border-blue-100 bg-white px-3 py-5 shadow-[12px_0_40px_rgba(30,64,175,0.08)] transition-[width] duration-300 ease-out hover:w-64">
			<Link
				to="/dashboard"
				aria-label="Dashboard"
				title="Dashboard"
				className="mb-8 flex h-12 w-full items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 text-blue-800 no-underline shadow-[0_12px_30px_rgba(37,99,235,0.12)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100"
			>
				<span className="flex h-6 w-6 shrink-0 items-center justify-center">
					<LayoutDashboard size={22} aria-hidden="true" />
				</span>
				<span className="min-w-0 translate-x-2 whitespace-nowrap text-sm font-extrabold text-slate-950 opacity-0 transition duration-200 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100">
					Dashboard
				</span>
			</Link>

			<nav className="flex w-full flex-col gap-3">
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = pathname.startsWith(item.match);

					return (
						<Link
							key={item.to}
							to={item.to}
							aria-label={item.label}
							title={item.label}
							className={`flex h-12 w-full items-center gap-3 rounded-xl border px-3 no-underline transition ${
								isActive
									? "border-blue-500 bg-blue-600 text-white shadow-[0_12px_26px_rgba(37,99,235,0.36)]"
									: "border-blue-100 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
							}`}
						>
							<span className="flex h-6 w-6 shrink-0 items-center justify-center">
								<Icon size={21} aria-hidden="true" />
							</span>
							<span className="min-w-0 translate-x-2 whitespace-nowrap text-sm font-bold opacity-0 transition duration-200 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100">
								{item.label}
							</span>
						</Link>
					);
				})}
			</nav>
		</div>
	);
}

export function MobileDashboardNav() {
	const pathname = useRouterState({
		select: (s) => s.location.pathname,
	});

	const items = [
		{
			to: "/dashboard",
			match: "/dashboard",
			label: "Dashboard",
			icon: LayoutDashboard,
		},
		...navItems,
	];

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-blue-100 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_34px_rgba(30,64,175,0.12)] backdrop-blur lg:hidden">
			<div className="mx-auto grid max-w-md grid-cols-3 gap-2">
				{items.map((item) => {
					const Icon = item.icon;
					const isActive =
						item.match === "/dashboard"
							? pathname === item.match
							: pathname.startsWith(item.match);

					return (
						<Link
							key={item.to}
							to={item.to}
							aria-label={item.label}
							className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border px-2 text-center text-[11px] font-extrabold leading-tight no-underline transition ${
								isActive
									? "border-blue-500 bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]"
									: "border-transparent bg-white text-slate-600 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-800"
							}`}
						>
							<Icon size={19} aria-hidden="true" />
							<span className="line-clamp-2">{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
