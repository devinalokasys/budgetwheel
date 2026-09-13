import type { ReactNode } from 'react'
import { useIsDesktop } from '../hooks/useIsDesktop'

interface ResponsiveProps {
  mobile: ReactNode
  desktop: ReactNode
}

export default function Responsive({ mobile, desktop }: ResponsiveProps) {
  const isDesktop = useIsDesktop()
  return isDesktop ? desktop : mobile
}
