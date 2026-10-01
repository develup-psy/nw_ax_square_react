import * as React from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function getSharePointScrollContainer(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    '[data-automation-id="contentScrollRegion"]'
  )
}

export default function RouteScrollReset(): null {
  const location = useLocation()

  useEffect(() => {
    const scrollContainer =
      getSharePointScrollContainer()

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'auto',
      })

      return
    }

    window.scrollTo({
      top: 0,
      behavior: 'auto',
    })
  }, [location.pathname])

  return null
}
