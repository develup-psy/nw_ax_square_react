import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchAxSquarePosts, type AxSquarePost } from '../services/sharepoint'

type AxSquareContextValue = {
  posts: AxSquarePost[]
  isLoaded: boolean
  getPostsBySection: (section: string) => AxSquarePost[]
}

const AxSquareContext = createContext<AxSquareContextValue | null>(null)

export function AxSquareProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<AxSquarePost[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let active = true

    fetchAxSquarePosts()
      .then(data => {
        if (active) setPosts(data)
      })
      .catch(() => {
        if (active) setPosts([])
      })
      .finally(() => {
        if (active) setIsLoaded(true)
      })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo<AxSquareContextValue>(() => ({
    posts,
    isLoaded,
    getPostsBySection: section => posts.filter(post => post.section === section.toUpperCase()),
  }), [posts, isLoaded])

  return <AxSquareContext.Provider value={value}>{children}</AxSquareContext.Provider>
}

export function useAxSquare() {
  const context = useContext(AxSquareContext)
  if (!context) throw new Error('useAxSquare must be used inside AxSquareProvider')
  return context
}
