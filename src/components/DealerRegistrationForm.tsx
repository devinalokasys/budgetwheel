import { useState, type FormEvent } from 'react'
import Icon from './Icon'
import { db } from '../lib/db'
import { useAuth } from '../hooks/useAuth'
import type { DealerProfile } from '../lib/db/schema'

export default function DealerRegistrationForm({
  onComplete,
}: {
  onComplete: (profile: DealerProfile) => void
}) {
  const { user } = useAuth()
  const [businessName, setBusinessName] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!businessName.trim()) {
      setError('Business name is required.')
      return
    }
    setSaving(true)
    setError('')
    const profile: DealerProfile = {
      userId: user.uid,
      businessName: businessName.trim(),
      licenseNumber: '',
      certifiedPartnerId: null,
      tier: 'standard',
      verified: false,
      rating: null,
      address: { street: street.trim(), city: city.trim(), state: state.trim(), zip: zip.trim() },
      logoImageId: null,
    }
    await db.putDealerProfile(profile)
    setSaving(false)
    onComplete(profile)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface px-space-md py-space-xl">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-space-md bg-surface-container rounded-2xl p-space-lg shadow-xl"
      >
        <div className="flex flex-col items-center gap-space-xs text-center">
          <div className="w-14 h-14 rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
            <Icon name="storefront" className="text-[28px]" />
          </div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface">
            Complete your dealer profile
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Buyers and sellers see this on your listings and bids. Takes a minute.
          </p>
        </div>

        {error && (
          <div className="px-space-md py-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="businessName">
            Business name
          </label>
          <input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="h-11 px-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-low shadow-inner"
            placeholder="Apex Motors"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="street">
            Street address
          </label>
          <input
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="h-11 px-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-low shadow-inner"
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-3 gap-space-sm">
          <div className="flex flex-col gap-1 col-span-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="city">
              City
            </label>
            <input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11 px-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-low shadow-inner"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="state">
              State
            </label>
            <input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="h-11 px-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-low shadow-inner"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="zip">
              ZIP
            </label>
            <input
              id="zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="h-11 px-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-low shadow-inner"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="h-12 mt-space-xs flex items-center justify-center gap-space-xs rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-headline-sm shadow-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Enter Dealer Console'}
        </button>
      </form>
    </div>
  )
}
