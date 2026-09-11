import Icon from '../Icon'
import type { StatTile as StatTileData } from '../../data/dealer'

const iconTone: Record<StatTileData['iconTone'], string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
}

const trendTone: Record<StatTileData['trendTone'], string> = {
  secondary: 'text-secondary',
  outline: 'text-outline',
}

export default function StatTile({ stat }: { stat: StatTileData }) {
  return (
    <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between text-on-surface-variant">
        <span className="font-label-sm text-label-sm uppercase tracking-wide">{stat.label}</span>
        <Icon name={stat.icon} className={`text-[20px] ${iconTone[stat.iconTone]}`} />
      </div>
      <div className="mt-space-sm flex flex-col">
        <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">
          {stat.value}
          {stat.unit && (
            <span className="font-label-md text-label-md text-on-surface-variant font-normal">
              {' '}
              {stat.unit}
            </span>
          )}
        </span>
        <span
          className={`font-body-sm text-body-sm flex items-center gap-0.5 mt-0.5 ${trendTone[stat.trendTone]}`}
        >
          {stat.trendIcon && <Icon name={stat.trendIcon} className="text-[16px]" />}
          {stat.trend}
        </span>
      </div>
    </div>
  )
}
