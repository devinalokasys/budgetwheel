import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { db } from '../lib/db'
import { useAuth } from '../hooks/useAuth'

interface FavoriteButtonProps {
  listingId: string
  className?: string
  onChange?: (saved: boolean) => void
}

export default function FavoriteButton({ listingId, className = '', onChange }: FavoriteButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) {
      setSaved(false)
      return
    }
    let cancelled = false
    db.isSaved(user.uid, listingId).then((value) => {
      if (!cancelled) setSaved(value)
    })
    return () => {
      cancelled = true
    }
  }, [listingId, user])

  const toggle = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    const next = !saved
    setSaved(next)
    onChange?.(next)
    if (next) {
      await db.saveListing(user.uid, listingId)
    } else {
      await db.unsaveListing(user.uid, listingId)
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
