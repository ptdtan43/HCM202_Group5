import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'

function MainLayout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return (
    <div className="site-shell flex min-h-dvh flex-col text-ink">
      <div className="site-backdrop" aria-hidden="true" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Bỏ qua, đến nội dung chính
      </a>
      <Header />
      <main
        id="main"
        className={pathname === '/game' ? 'w-full flex-1' : 'mx-auto w-full max-w-[1440px] flex-1 px-5 sm:px-10 lg:px-24'}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
