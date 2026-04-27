import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Sidebar, { MobileDashboardNav } from "@/components/sidebar.tsx";

export const Route = createFileRoute("/dasboard/app")({
	beforeLoad: async () => {
		const res = await fetch("/api/auth/me", {
			credentials: "include",
		});

		if (!res.ok) {
			throw redirect({ to: "/login" });
		}
	},

	component: DashboardLayout,
});

function DashboardLayout() {
	return (
		<div className="flex min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100">
			<aside className="hidden border-r border-blue-100 bg-white shadow-[12px_0_40px_rgba(30,64,175,0.08)] lg:block">
				<Sidebar />
			</aside>

			<main className="min-w-0 flex-1 p-4 pb-28 sm:p-6 sm:pb-28 lg:pb-6">
				<Outlet />
			</main>

			<MobileDashboardNav />
		</div>
	);
}
