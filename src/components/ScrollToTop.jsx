/**
 * With client-side routing the browser keeps your scroll position when you
 * navigate, which feels broken. This component watches the current path
 * and scrolls back to the top on every change. It renders nothing.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}
