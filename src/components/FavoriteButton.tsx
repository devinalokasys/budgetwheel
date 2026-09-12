import { useEffect, useState } from 'react'
import Icon from './Icon'
import { db } from '../lib/db'
import { CURRENT_CONSUMER_ID } from '../lib/currentUser'

interface FavoriteButtonProps {
  listingId: string
  className?: string
  onChange?: (saved: boolean) => void
}

export default function FavoriteButton({ listingId, className = '', onChange }: FavoriteButtonProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    db.isSaved(CURRENT_CONSUMER_ID, listingId).then((value) => {
      if (!cancelled) setSaved(value)
    })
    return () => {
      cancelled = true
    }
  }, [listingId])

  const toggle = async () => {
    const next = !saved
    setSaved(next)
    onChange?.(next)
    if (next) {
      await db.saveListing(CURRENT_CONSUMER_ID, listingId)
    } else {
      await db.unsaveListing(CURRENT_CONSUMER_ID, listingId)
    }
  }

  return (
    <button
      aria-label="Save vehicle"
      aria-pressed={saved}
      onClick={toggle}
      className={`w-8 h-8 rounded-full bg-surface-container-lowest/70 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ${
        saved ? 'text-error' : 'text-on-surface'
      } ${className}`}
    >
      <Icon name="favorite" className="text-[18px]" filled={saved} />
    </button>
  )
}
