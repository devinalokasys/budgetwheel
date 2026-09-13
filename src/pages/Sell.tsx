import { useState, type FormEvent } from 'react'
import Icon from '../components/Icon'
import { db } from '../lib/db'
import { CURRENT_CONSUMER_ID } from '../lib/currentUser'
import type { Condition } from '../lib/db/schema'

const conditions: { value: Condition; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
]

const HOUR = 60 * 60 * 1000

export default function Sell() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [condition, setCondition] = useState<Condition>('good')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setSubmitting(true)
    await db.createTradeSubmission({
      id: `trade-${crypto.randomUUID()}`,
      sellerId: CURRENT_CONSUMER_ID,
      vin: String(form.get('vin') ?? '').toUpperCase(),
      year: Number(form.get('year')),
      make: String(form.get('make')),
      model: String(form.get('model')),
      trim: String(form.get('trim') || '') || null,
      mileage: Number(form.get('mileage')),
      condition,
      carfaxReportId: null,
      imageIds: [],
      kbbEstimateCents: null,
      aiRecommendationCents: null,
      status: 'open',
      biddingClosesAt: Date.now() + 48 * HOUR,
      createdAt: Date.now(),
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-space-sm px-space-md text-center min-h-[60vh]">
        <div className="w-14 h-14 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
          <Icon name="check_circle" className="text-[28px]" filled />
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Submission received</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
          Certified dealers can now bid on your car. You'll be notified as offers come in — most
          sellers hear back within 48 hours.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full lg:max-w-xl lg:mx-auto px-space-md pt-space-md pb-space-xl gap-space-lg">
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-xl flex flex-col gap-space-xs">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-space-xs relative z-10">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
            Instant Cash Offer
          </span>
        </div>
        <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight leading-tight relative z-10">
          Sell your car.
          <br />
          <span className="text-secondary">Skip the haggling.</span>
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant relative z-10">
          Tell us about your vehicle and certified dealers will bid on it directly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <div className="grid grid-cols-2 gap-space-sm">
          <div className="flex flex-col gap-space-xs">
            <label htmlFor="year" className="font-label-sm text-label-sm text-on-surface-variant">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              required
              min={1980}
              max={new Date().getFullYear() + 1}
              placeholder="2021"
              className="h-11 px-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner"
            />
          </div>
          <div className="flex flex-col gap-space-xs">
            <label htmlFor="mileage" className="font-label-sm text-label-sm text-on-surface-variant">
              Mileage
            </label>
            <input
              id="mileage"
              name="mileage"
              type="number"
              required
              min={0}
              placeholder="32,150"
              className="h-11 px-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          <div className="flex flex-col gap-space-xs">
            <label htmlFor="make" className="font-label-sm text-label-sm text-on-surface-variant">
              Make
            </label>
            <input
              id="make"
              name="make"
              type="text"
              required
              placeholder="Toyota"
              className="h-11 px-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner"
            />
          </div>
          <div className="flex flex-col gap-space-xs">
            <label htmlFor="model" className="font-label-sm text-label-sm text-on-surface-variant">
              Model
            </label>
            <input
              id="model"
              name="model"
              type="text"
              required
              placeholder="Camry"
              className="h-11 px-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner"
            />
          </div>
        </div>

        <div className="flex flex-col gap-space-xs">
          <label htmlFor="trim" className="font-label-sm text-label-sm text-on-surface-variant">
            Trim <span className="text-outline">(optional)</span>
          </label>
          <input
            id="trim"
            name="trim"
            type="text"
            placeholder="SE Nightshade Edition"
            className="h-11 px-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner"
          />
        </div>

        <div className="flex flex-col gap-space-xs">
          <label htmlFor="vin" className="font-label-sm text-label-sm text-on-surface-variant">
            VIN <span className="text-outline">(optional, speeds up your estimate)</span>
          </label>
          <input
            id="vin"
            name="vin"
            type="text"
            maxLength={17}
            placeholder="1HGCM82633A004352"
            className="h-11 px-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner uppercase"
          />
        </div>

        <div className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Condition</span>
          <div className="grid grid-cols-3 gap-space-sm">
            {conditions.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCondition(c.value)}
                className={`h-11 rounded-lg font-label-md text-label-md transition-colors ${
                  condition === c.value
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 mt-space-xs bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-lg flex items-center justify-center gap-space-xs shadow-lg hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60"
        >
          <Icon name="payments" className="text-[20px]" />
          <span>{submitting ? 'Submitting…' : 'Get Cash Offers'}</span>
        </button>
      </form>
    </div>
  )
}
