import Icon from '../Icon'
import type { TradeBid } from '../../data/dealer'

const tagTone: Record<TradeBid['tags'][number]['tone'], string> = {
  secondary: 'bg-secondary-container/20 text-secondary',
  primary: 'bg-primary/15 text-primary',
  neutral: 'bg-tertiary-container/30 text-tertiary',
}

interface Props {
  bid: TradeBid
  onPrimary: () => void
  onSecondary: () => void
}

export default function TradeBidCard({ bid, onPrimary, onSecondary }: Props) {
  const hasComparisonGrid = bid.kbb && bid.aiRec && bid.margin

  return (
    <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm shadow-md relative overflow-hidden">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            {bid.tags.map((tag) => (
              <span
                key={tag.label}
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${tagTone[tag.tone]}`}
              >
                {tag.icon && <Icon name={tag.icon} className="text-[12px]" />}
                {tag.label}
              </span>
            ))}
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1.5 truncate">
            {bid.title}
          </h3>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{bid.meta}</span>
        </div>
        <div className="text-right shrink-0">
          <span className="font-label-sm text-label-sm text-outline block">Seller Asking</span>
          <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
            {bid.asking}
          </span>
        </div>
      </div>

      {hasComparisonGrid && (
        <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-2 rounded-lg text-center">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-outline">KBB Fair</span>
            <span className="font-label-md text-label-md text-on-surface">{bid.kbb}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-outline">BudgetAI Rec</span>
            <span className="font-label-md text-label-md text-secondary font-bold">{bid.aiRec}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-outline">Est. Margin</span>
            <span className="font-label-md text-label-md text-on-surface">{bid.margin}</span>
          </div>
        </div>
      )}

      {bid.algoTarget && (
        <div className="flex items-center justify-between pt-1">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Algorithm Target:{' '}
            <strong className="text-secondary font-label-md text-label-md">
              {bid.algoTarget}
            </strong>
          </span>
          <button
            onClick={onPrimary}
            className="bg-primary text-on-primary font-label-md text-label-md px-4 h-10 rounded-lg flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
          >
            <span>{bid.primaryLabel}</span>
            {bid.primaryIcon && <Icon name={bid.primaryIcon} className="text-[16px]" />}
          </button>
        </div>
      )}

      {hasComparisonGrid && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onPrimary}
            className="flex-1 bg-secondary-container text-on-secondary-container font-label-md text-label-md h-10 rounded-lg flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
          >
            {bid.primaryIcon && <Icon name={bid.primaryIcon} className="text-[18px]" />}
            <span>{bid.primaryLabel}</span>
          </button>
          {bid.secondaryLabel && (
            <button
              onClick={onSecondary}
              className="px-3 bg-surface-container-high text-on-surface font-label-md text-label-md h-10 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-transform hover:bg-surface-bright"
            >
              <span>{bid.secondaryLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
