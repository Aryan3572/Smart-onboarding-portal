import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Home, Info, LogOut, Mail, ShieldCheck } from "lucide-react";

export default function Header() {
	const navigate = useNavigate();

	const pathname = useRouterState({
		select: (s) => s.location.pathname,
	});

	const isAuthPage = pathname === "/login" || pathname === "/signup";

	const handleLogout = async () => {
		await fetch("/api/auth/logout", {
			method: "POST",
			credentials: "include",
		});

		window.sessionStorage.clear();
		navigate({ to: "/login" });
	};

	const handleBack = () => {
		const referrer = document.referrer;

		if (referrer?.includes(window.location.origin)) {
			window.history.back();
		} else {
			navigate({ to: "/dashboard" });
		}
	};

	return (
		<header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 shadow-[0_10px_34px_rgba(30,64,175,0.08)] backdrop-blur">
			<nav
				className={`page-wrap flex min-w-0 items-center gap-3 py-3 sm:py-4 ${
					isAuthPage ? "justify-center" : "justify-between"
				}`}
			>
				<h2 className="m-0 flex min-w-0 items-center gap-2 text-base font-semibold tracking-tight">
					{!isAuthPage && (
						<button
							type="button"
							onClick={handleBack}
							aria-label="Go back"
							className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-800 transition hover:border-blue-200 hover:bg-blue-100"
						>
							<ArrowLeft size={18} aria-hidden="true" />
						</button>
					)}

					{isAuthPage ? (
						<span className="inline-flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-950 shadow-sm">
							<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white shadow-[0_8px_18px_rgba(37,99,235,0.24)]">
								<ShieldCheck size={16} aria-hidden="true" />
							</span>
							<span className="truncate">Smart Onboarding Portal</span>
						</span>
					) : (
						<Link
							to="/dashboard"
							className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-extrabold text-blue-950 no-underline shadow-sm transition hover:border-blue-200 hover:bg-blue-100 sm:gap-3 sm:px-4"
						>
							<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white shadow-[0_8px_18px_rgba(37,99,235,0.24)]">
								<ShieldCheck size={16} aria-hidden="true" />
							</span>
							<span className="truncate">Smart Onboarding Portal</span>
						</Link>
					)}
				</h2>

				{!isAuthPage && (
					<div className="flex shrink-0 items-center gap-2 sm:gap-5">
						<div className="hidden items-center gap-5 text-sm font-bold text-slate-600 sm:flex">
							<Link
								to="/dashboard"
								className="inline-flex items-center gap-2 text-slate-600 no-underline transition hover:text-blue-800"
							>
								<Home size={15} aria-hidden="true" />
								Home
							</Link>

							<a
								href="https://ipsator.com/about/"
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 text-slate-600 no-underline transition hover:text-blue-800"
							>
								<Info size={15} aria-hidden="true" />
								About
							</a>

							<a
								href="https://ipsator.com/contact/"
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 text-slate-600 no-underline transition hover:text-blue-800"
							>
								<Mail size={15} aria-hidden="true" />
								Contact
							</a>
						</div>

						<button
							type="button"
							onClick={handleLogout}
							className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-600 px-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.26)] transition hover:border-red-500/50 hover:bg-red-600 hover:shadow-[0_10px_24px_rgba(220,38,38,0.26)]"
						>
							<LogOut size={16} aria-hidden="true" />
							<span className="hidden sm:inline">Logout</span>
						</button>
					</div>
				)}
			</nav>
		</header>
	);
}
