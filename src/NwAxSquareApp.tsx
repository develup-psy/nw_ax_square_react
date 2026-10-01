import Header from './components/Header'

import Main from './components/main/Main'

import Footer from './components/Footer'

import HotNoticePopup from './components/hot-notice/HotNoticePopup'

import { AxSquareProvider } from './context/AxSquareContext'

import NwAxSquareTutorial from './components/NwAxSquareTutorial'

import ServerStatusPage from './pages/ServerStatusPage'

function normalizePathname(pathname: string) {
  const normalized = pathname
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')

  return normalized || '/'
}

export default function NwAxSquareApp() {
  const pathname =
    normalizePathname(
      window.location.pathname
    )

  const isServerStatusPage =
    pathname === '/server-status'

  return (
    <AxSquareProvider>
      <div className="app-root">
        <Header />

        {isServerStatusPage ? (
          <ServerStatusPage />
        ) : (
          <Main />
        )}

        <Footer />

        {!isServerStatusPage && (
          <>
            <HotNoticePopup />
            <NwAxSquareTutorial />
          </>
        )}
      </div>
    </AxSquareProvider>
  )
}
