import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="bg-gradient-to-br from-white via-blue-50 to-slate-100 px-4 py-12">
      <section className="page-wrap rounded-lg border border-blue-100 bg-white p-6 shadow-[0_20px_50px_rgba(30,64,175,0.08)] sm:p-8">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">About</p>
        <h1 className="mb-3 text-4xl font-extrabold text-slate-950 sm:text-5xl">
          A small starter for employee onboarding.
        </h1>
        <p className="m-0 max-w-3xl text-base font-medium leading-8 text-slate-600">
          Smart Onboarding Portal gives you fast and smoother
          employee onboarding. Use this as a clean foundation, then layer in
          your own way and add-ons.
        </p>
      </section>
    </main>
  )
}
