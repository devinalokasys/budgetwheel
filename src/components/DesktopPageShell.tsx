import type { ReactNode } from 'react'
import DesktopHeader from './DesktopHeader'
import DesktopFooter from './DesktopFooter'

interface DesktopPageShellProps {
  active?: 'browse' | 'saved' | 'dealer' | 'messages' | 'account'
  children: ReactNode
}

export default function DesktopPageShell({ active, children }: DesktopPageShellProps) {
  return (
    <div className="bg-background font-body-md text-body-md text-on-background antialiased min-h-screen">
      <DesktopHeader active={active} />
      <main className="w-full pt-20 bg-background min-h-screen">
        <div className="w-full max-w-[1200px] mx-auto px-gutter py-space-lg">{children}</div>
      </main>
      <DesktopFooter />
    </div>
  )
}
