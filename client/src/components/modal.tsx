import type { ReactNode } from "react";

export default function Modal({
	children,
	onClose,
}: {
	children: ReactNode;
	onClose: () => void;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
			<div className="relative w-full max-w-md">
				<button
					type="button"
					onClick={onClose}
					aria-label="Close modal"
					className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-blue-100 bg-white text-lg font-bold leading-none text-blue-900 shadow-sm hover:bg-blue-50"
				>
					x
				</button>

				{children}
			</div>
		</div>
	);
}
