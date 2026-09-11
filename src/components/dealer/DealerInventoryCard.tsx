import Icon from '../Icon'
import type { DealerInventoryItem } from '../../data/dealer'

interface Props {
  item: DealerInventoryItem
  onAction: (label: string) => void
}

export default function DealerInventoryCard({ item, onAction }: Props) {
  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-md flex flex-col">
      <div
        className="relative w-full h-44 bg-cover bg-center"
        style={{ backgroundImage: `url('${item.image}')` }}
      >
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="bg-secondary-container/90 backdrop-blur-md text-on-secondary-container text-[11px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 shadow-sm">
            <Icon name={item.badge.icon} className="text-[13px]" />
            {item.badge.label}
          </span>
          <span className="bg-surface-container-lowest/80 backdrop-blur-md text-on-surface text-[11px] font-semibold px-2 py-1 rounded-full">
            {item.dayListed}
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <button
            onClick={() => onAction(`Listing options opened for ${item.title}`)}
            className="w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface flex items-center justify-center hover:bg-surface-container"
          >
            <Icon name="more_vert" className="text-[18px]" />
          </button>
        </div>
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-on-primary-container">
          <div className="flex items-center gap-2 bg-surface-container-lowest/85 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <span className="font-body-sm text-body-sm text-on-surface flex items-center gap-1">
              <Icon name="visibility" className="text-primary text-[15px]" />
              {item.views} Views
            </span>
            <span className="font-body-sm text-body-sm text-on-surface flex items-center gap-1">
              <Icon name="favorite" className="text-tertiary text-[15px]" />
              {item.saves} Saves
            </span>
          </div>
          <span className="bg-primary/90 backdrop-blur-md text-on-primary font-label-sm text-label-sm px-2.5 py-1 rounded-md uppercase font-bold">
            {item.inquiries} Inquiries
          </span>
        </div>
      </div>
      <div className="p-space-md flex flex-col gap-space-sm">
        <div className="flex items-start justify-between gap-space-xs">
          <div className="flex flex-col min-w-0">
            <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
              {item.title}
            </h3>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              VIN: {item.vin} • {item.mileage}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="font-label-numeric-lg text-label-numeric-lg text-primary">
              {item.price}
            </span>
            <span className="font-body-sm text-body-sm text-secondary block font-semibold">
              {item.priceNote}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-2 rounded-lg text-center">
          {item.specs.map((spec) => (
            <div key={spec.label} className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline">{spec.label}</span>
              <span
                className={`font-label-md text-label-md ${spec.tone === 'secondary' ? 'text-secondary' : 'text-on-surface'}`}
              >
                {spec.value}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-space-sm pt-1">
          {item.actions.map((action) => (
            <button
              key={action.label}
              onClick={() => onAction(`${action.label} — ${item.title}`)}
              className={`font-label-md text-label-md h-10 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-transform ${
                action.primary
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
              }`}
            >
              <Icon
                name={action.icon}
                className={`text-[18px] ${action.primary ? '' : 'text-outline'}`}
              />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
