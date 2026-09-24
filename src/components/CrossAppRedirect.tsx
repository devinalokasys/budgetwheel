import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// The dealer app reuses consumer-only components verbatim (Header,
// DealerBottomNav, DealerDesktopShell) that hardcode links into the
// consumer app's routes (/, /browse, /sell, /messages) — routes that don't
// exist in this app's own trimmed router. Rather than editing those shared
// components, any unmatched path here bounces to the real page on the
// consumer app instead of rendering nothing.
export default function CrossAppRedirect() {
  const location = useLocation()

  useEffect(() => {
    const base = import.meta.env.VITE_CONSUMER_APP_URL ?? 'https://budgetwheel.web.app'
    window.location.replace(`${base}${location.pathname}${location.search}`)
  }, [location])

  return null
}
