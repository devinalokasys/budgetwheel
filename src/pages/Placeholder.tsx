import Icon from '../components/Icon'

interface PlaceholderProps {
  icon: string
  title: string
}

export default function Placeholder({ icon, title }: PlaceholderProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-space-sm px-space-md text-center min-h-[60vh]">
      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
        <Icon name={icon} className="text-[28px]" />
      </div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
        This page is coming soon.
      </p>
    </div>
  )
}
