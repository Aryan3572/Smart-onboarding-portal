import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,

    // ✅ FIX: Global Not Found fallback
    defaultNotFoundComponent: () => (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 p-10 text-center">
        <div className="rounded-lg border border-blue-100 bg-white p-8 shadow-[0_20px_50px_rgba(30,64,175,0.08)]">
          <h1 className="text-2xl font-extrabold text-blue-800">404</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Page not found
          </p>
        </div>
      </div>
    ),
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
