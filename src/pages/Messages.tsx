import { useState } from 'react'
import Icon from '../components/Icon'
import Placeholder from './Placeholder'

const tabs = [
  { id: 'garage', label: 'My Garage', icon: 'directions_car' },
  { id: 'inquiries', label: 'Chat & Leads', icon: 'chat_bubble', dot: true },
  { id: 'saved', label: 'Saved (6)', icon: 'bookmark' },
] as const

export default function Messages() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('garage')

  return (
    <div className="flex flex-col w-full">
      <div className="px-gutter-sm pt-space-md pb-space-sm">
        <div className="bg-surface-container-low p-1 rounded-xl flex items-center gap-1 shadow-sm overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg font-label-md text-label-md text-center transition-all flex items-center justify-center gap-1.5 relative ${
                activeTab === tab.id
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name={tab.icon} className="text-[17px]" />
              <span>{tab.label}</span>
              {'dot' in tab && tab.dot && (
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'garage' && (
        <div className="flex flex-col gap-space-md px-gutter-sm pb-space-xl">
          <div className="bg-surface-container-low rounded-2xl p-space-md shadow-md flex flex-col gap-space-md relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
                </span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Active Marketplace Listing
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm flex items-center gap-1">
                <Icon name="verified" className="text-[14px]" />
                <span>Great Deal</span>
              </div>
            </div>

            <div className="flex gap-space-md items-start">
              <div className="w-24 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0 relative shadow-sm">
                <img
                  className="w-full h-full object-cover"
                  src="/images/toyota-camry-se.jpg"
                  alt="2021 Toyota Camry SE"
                />
                <div className="absolute bottom-1 right-1 bg-surface-container-lowest/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-label-sm text-on-surface">
                  VIN ••8941
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                  2021 Toyota Camry SE
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  2.5L I4 • Nightshade Edition • 28,400 mi
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">
                    $25,900
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">List Price</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface-container rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                <Icon name="visibility" className="text-[16px] text-primary mb-0.5" />
                <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                  342
                </span>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Views
                </span>
              </div>
              <div className="bg-surface-container rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                <Icon name="favorite" className="text-[16px] text-tertiary mb-0.5" />
                <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                  28
                </span>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Saves
                </span>
              </div>
              <div className="bg-surface-container rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                <Icon name="forum" className="text-[16px] text-secondary mb-0.5" />
                <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                  6
                </span>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Inquiries
                </span>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0">
                  <Icon name="payments" className="text-[20px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface truncate">
                    2 Certified Dealer Cash Bids
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary truncate">
                    Top offer: $24,500 by Metro Auto Group
                  </span>
                </div>
              </div>
              <button className="bg-surface-bright hover:bg-surface-container-highest px-3 py-1.5 rounded-lg text-on-surface font-label-md text-label-md shrink-0 transition-colors">
                View Bids
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inquiries' && <Placeholder icon="chat_bubble" title="Chat & Leads" />}
      {activeTab === 'saved' && <Placeholder icon="bookmark" title="Saved Vehicles" />}
    </div>
  )
}
