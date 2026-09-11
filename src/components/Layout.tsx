import type { ReactNode } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'
import DealerBottomNav from './DealerBottomNav'

interface LayoutProps {
  title: string
  showBack?: boolean
  nav?: 'consumer' | 'dealer' | 'none'
  children: ReactNode
}

export default function Layout({ title, showBack = false, nav = 'consumer', children }: LayoutProps) {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      <Header title={title} showBack={showBack} />
      <main
        className={`flex-1 flex flex-col relative w-full pt-16 bg-surface ${nav === 'none' ? '' : 'pb-24'}`}
      >
        {children}
      </main>
      {nav === 'consumer' && <BottomNav />}
      {nav === 'dealer' && <DealerBottomNav />}
    </div>
  )
}
