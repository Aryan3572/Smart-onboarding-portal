import { Outlet } from "@tanstack/react-router";
import Header from "@/components/Header";
import Sidebar, { MobileDashboardNav } from "@/components/sidebar";

export default function DashboardLayout() {
	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-blue-50 to-slate-100">
			<Header />

			<div className="flex flex-1">
				<aside className="hidden border-r border-blue-100 bg-white shadow-[12px_0_40px_rgba(30,64,175,0.08)] lg:block">
					<Sidebar />
				</aside>

				<main className="min-w-0 flex-1 p-4 pb-28 sm:p-6 sm:pb-28 lg:pb-6">
					<Outlet />
				</main>
			</div>

			<MobileDashboardNav />
		</div>
	);
}
