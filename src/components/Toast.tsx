import Icon from './Icon'

export function Toast({ message }: { message: string | null }) {
  const visible = message !== null

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 z-50 transform transition-all duration-300 pointer-events-none flex justify-center ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
      }`}
    >
      <div className="bg-surface-container-highest/95 backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm">
        <Icon name="check_circle" className="text-primary text-[20px]" />
        <span className="font-body-sm text-body-sm text-on-surface font-medium">{message}</span>
      </div>
    </div>
  )
}
