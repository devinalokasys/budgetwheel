import { useState } from 'react'
import Icon from './Icon'

export default function FavoriteButton({ className = '' }: { className?: string }) {
  const [saved, setSaved] = useState(false)

  return (
    <button
      aria-label="Save vehicle"
      aria-pressed={saved}
      onClick={() => setSaved((v) => !v)}
      className={`w-8 h-8 rounded-full bg-surface-container-lowest/70 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ${
        saved ? 'text-error' : 'text-on-surface'
      } ${className}`}
    >
      <Icon name="favorite" className="text-[18px]" filled={saved} />
    </button>
  )
}
