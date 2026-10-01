import NwAxSquareApp from './NwAxSquareApp'
import PostingBuilderApp from './posting-builder/PostingBuilderApp'
import { createLocalStorageRepository } from './posting-builder/services/localStorageRepository'

const repository = createLocalStorageRepository()

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+/g, '/').replace(/\/$/, '')
  return normalized || '/'
}

export default function App() {
  const pathname = normalizePathname(window.location.pathname)

  if (pathname === '/posting-builder') {
    return (
      <PostingBuilderApp
        user={{
          id: 'react-test-user',
          name: 'React 테스트 사용자',
          email: 'react-test@example.com',
        }}
        repository={repository}
        onBackToSquare={() => { window.location.href = '/' }}
      />
    )
  }

  return <NwAxSquareApp />
}
