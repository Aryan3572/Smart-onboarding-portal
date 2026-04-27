export default function EmployeeCard({ emp }: any) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-[0_12px_30px_rgba(30,64,175,0.07)] transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_18px_42px_rgba(30,64,175,0.1)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-extrabold text-slate-950">
            {emp.name}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-600">{emp.email}</p>
        </div>
        <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-blue-800">
          {emp.role}
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all"
          style={{ width: `${emp.progress}%` }}
        />
      </div>

      <p className="mt-2 text-xs font-bold text-blue-800">
        {emp.progress}% completed
      </p>
    </div>
  )
}
