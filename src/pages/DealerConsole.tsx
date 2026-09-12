import { useState } from 'react'
import Icon from '../components/Icon'
import { Toast } from '../components/Toast'
import { useToast } from '../hooks/useToast'
import StatTile from '../components/dealer/StatTile'
import TradeBidCard from '../components/dealer/TradeBidCard'
import DealerInventoryCard from '../components/dealer/DealerInventoryCard'
import { statTiles, tradeBids, inventoryTabs, dealerInventory } from '../data/dealer'

export default function DealerConsole() {
  const { message, trigger } = useToast()
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-space-xl gap-space-lg">
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between gap-space-sm pt-space-xs">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 shadow-md">
              <Icon name="store" className="text-primary text-[28px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">
                  Apex Motors
                </h1>
                <Icon
                  name="verified"
                  className="text-secondary text-[18px]"
                  filled
                />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate uppercase tracking-wider">
                Certified Partner #8492 • Premier Tier
              </span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-space-xs bg-secondary-container/20 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">
              Live Portal
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-space-sm mt-space-xs">
          {statTiles.map((stat) => (
            <StatTile key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="bg-surface-container-low px-space-md py-3 rounded-xl flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm font-semibold tracking-wide text-on-surface">
              Portfolio Liquidity Health
            </span>
            <span className="font-label-numeric-md text-label-numeric-md text-secondary">92/100</span>
          </div>
          <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden flex">
            <div className="bg-secondary h-full" style={{ width: '74%' }} />
            <div className="bg-tertiary h-full" style={{ width: '18%' }} />
            <div className="bg-error h-full" style={{ width: '8%' }} />
          </div>
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-body-sm text-body-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block" /> 31 Prime
            </span>
            <span className="font-body-sm text-body-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary inline-block" /> 8 Fair
            </span>
            <span className="font-body-sm text-body-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error inline-block" /> 3 Stale (&gt;25d)
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-space-xs">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          Fleet Operations
        </span>
        <div className="grid grid-cols-2 gap-space-sm">
          <button
            onClick={() => trigger('VIN Scanner Optical Engine Initialized')}
            className="flex items-center justify-center gap-space-xs bg-primary-container text-on-primary-container h-12 rounded-lg font-headline-sm text-headline-sm shadow-md active:scale-95 transition-transform"
          >
            <Icon name="qr_code_scanner" className="text-[20px]" />
            <span>+ Scan VIN</span>
          </button>
          <button
            onClick={() => trigger('Opened Bulk Pricing Matrix (42 assets)')}
            className="flex items-center justify-center gap-space-xs bg-surface-container-high text-on-surface h-12 rounded-lg font-label-md text-label-md shadow-sm active:scale-95 transition-transform hover:bg-surface-bright"
          >
            <Icon name="tune" className="text-primary text-[20px]" />
            <span>Bulk Pricing</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-space-sm mt-1">
          <button
            onClick={() => trigger('Acquisition Bid Queue filtered')}
            className="flex items-center justify-between px-space-md bg-surface-container-low text-on-surface h-11 rounded-lg font-label-md text-label-md shadow-sm active:scale-95 transition-transform hover:bg-surface-container"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Icon name="gavel" className="text-secondary text-[18px]" />
              <span>Trade Bids</span>
            </span>
            <span className="bg-secondary/20 text-secondary text-[11px] font-bold px-1.5 py-0.5 rounded-full">
              3 New
            </span>
          </button>
          <button
            onClick={() => trigger('Dealer CRM Sync: 100% verified')}
            className="flex items-center justify-between px-space-md bg-surface-container-low text-on-surface h-11 rounded-lg font-label-md text-label-md shadow-sm active:scale-95 transition-transform hover:bg-surface-container"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Icon name="sync" className="text-outline text-[18px]" />
              <span>DMS Sync</span>
            </span>
            <Icon name="check_circle" className="text-secondary text-[16px]" filled />
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <Icon name="unfold_more_double" className="text-tertiary text-[20px]" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Consumer Bids Waiting
            </h2>
          </div>
          <span className="font-label-sm text-label-sm text-primary font-bold">2 Live Sessions</span>
        </div>
        {tradeBids.map((bid) => (
          <TradeBidCard
            key={bid.id}
            bid={bid}
            onPrimary={() =>
              trigger(
                bid.algoTarget
                  ? `Direct binding bid dispatched for ${bid.title}`
                  : `Binding Offer of ${bid.aiRec} submitted to seller!`,
              )
            }
            onSecondary={() => trigger('Counter offer negotiation terminal launched')}
          />
        ))}
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Floor Inventory</h2>
          <button
            onClick={() => {
              setActiveTab('all')
              trigger('Filters reset to default view')
            }}
            className="font-label-sm text-label-sm text-primary flex items-center gap-0.5 hover:underline"
          >
            <span>Reset Filters</span>
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-margin-mobile px-margin-mobile">
          {inventoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                trigger(`Inventory filtered by: ${tab.label.split(' (')[0].toUpperCase()}`)
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-space-sm">
          {dealerInventory.map((item) => (
            <DealerInventoryCard key={item.id} item={item} onAction={trigger} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <Icon name="mark_chat_unread" className="text-secondary text-[20px]" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Lead Live Feed</h2>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <Icon name="timer" className="text-[16px] text-secondary" />
            <span className="font-label-sm text-label-sm text-secondary">94% in &lt;15m</span>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold font-headline-sm">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Marcus Vance
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Re: 2022 BMW 330i xDrive • 6m ago
                </span>
              </div>
            </div>
            <span className="bg-secondary/20 text-secondary text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
              Pre-Approved
            </span>
          </div>
          <div className="bg-surface-container-lowest px-3 py-2.5 rounded-lg">
            <p className="font-body-sm text-body-sm text-on-surface italic">
              "Hi Apex Team, can I schedule a test drive for tomorrow at 2:30 PM? Also, is the
              trade appraisal valid on site?"
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => trigger('Fast Reply sent: Calendar confirmed for 2:30 PM')}
              className="flex-1 bg-primary text-on-primary font-label-md text-label-md h-9 rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <Icon name="reply" className="text-[16px]" />
              <span>Quick Reply: "Confirmed!"</span>
            </button>
            <button
              onClick={() => trigger('Calling verified phone: (408) 555-0192')}
              className="px-3 bg-surface-container-high text-on-surface font-label-md text-label-md h-9 rounded-lg flex items-center justify-center gap-1 hover:bg-surface-bright"
            >
              <Icon name="call" className="text-[16px]" />
            </button>
          </div>
        </div>
      </section>

      <Toast message={message} />
    </div>
  )
}
