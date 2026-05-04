import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Footer from '../components/Footer'
import Header from '../components/Header'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Smart Onboarding Portal' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/smart-onboarding-logo.svg',
      },
      {
        rel: 'apple-touch-icon',
        href: '/smart-onboarding-logo.svg',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),

  shellComponent: RootDocument,

  // ✅ FIX: Custom Not Found UI
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 p-10 text-center">
      <div className="rounded-lg border border-blue-100 bg-white p-8 shadow-[0_20px_50px_rgba(30,64,175,0.08)]">
        <h1 className="text-3xl font-extrabold text-blue-800">404</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          Page not found
        </p>
      </div>
    </div>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>

      <body>
        <Header />

        {/* ✅ This renders all routes */}
        <Outlet />

        <Footer />

        {/* ✅ Devtools */}
        {/* <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}

        <Scripts />
      </body>
    </html>
  )
}
