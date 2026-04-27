export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-blue-100 bg-white py-5">
      <div className="page-wrap flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="m-0 text-sm font-semibold text-slate-600">
          &copy; {year} Ipsator. All rights reserved.
        </p>
        <p className="m-0 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
          Smart Onboarding Portal
        </p>
      </div>
    </footer>
  )
}
