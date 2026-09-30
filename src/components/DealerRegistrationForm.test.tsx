import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DealerRegistrationForm from './DealerRegistrationForm'
import type { DealerProfile } from '../lib/db/schema'

const { useAuthMock, dbMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  dbMock: { putDealerProfile: vi.fn() },
}))
vi.mock('../hooks/useAuth', () => ({ useAuth: useAuthMock }))
vi.mock('../lib/db', () => ({ db: dbMock }))

beforeEach(() => {
  useAuthMock.mockReset().mockReturnValue({ user: { uid: 'u1' } })
  dbMock.putDealerProfile.mockReset().mockResolvedValue(undefined)
})

async function fillAndSubmit(overrides: Partial<Record<'businessName' | 'street' | 'city' | 'state' | 'zip', string>> = {}) {
  const user = userEvent.setup()
  const onComplete = vi.fn()
  render(<DealerRegistrationForm onComplete={onComplete} />)

  const values = { businessName: 'Apex Motors', street: '', city: '', state: '', zip: '', ...overrides }
  if (values.businessName) await user.type(screen.getByLabelText('Business name'), values.businessName)
  if (values.street) await user.type(screen.getByLabelText('Street address'), values.street)
  if (values.city) await user.type(screen.getByLabelText('City'), values.city)
  if (values.state) await user.type(screen.getByLabelText('State'), values.state)
  if (values.zip) await user.type(screen.getByLabelText('ZIP'), values.zip)

  await user.click(screen.getByRole('button', { name: /enter dealer console|saving/i }))
  return { onComplete, user }
}

it('does nothing when there is no signed-in user (defensive guard)', async () => {
  useAuthMock.mockReturnValue({ user: null })
  const { onComplete } = await fillAndSubmit()
  expect(dbMock.putDealerProfile).not.toHaveBeenCalled()
  expect(onComplete).not.toHaveBeenCalled()
})

it('shows a validation error and does not save when business name is only whitespace', async () => {
  const { onComplete } = await fillAndSubmit({ businessName: '   ' })
  expect(screen.getByText('Business name is required.')).toBeInTheDocument()
  expect(dbMock.putDealerProfile).not.toHaveBeenCalled()
  expect(onComplete).not.toHaveBeenCalled()
})

it('saves a trimmed DealerProfile with sane defaults and calls onComplete with it', async () => {
  const { onComplete } = await fillAndSubmit({
    businessName: '  Apex Motors  ',
    street: ' 1 Main St ',
    city: ' Austin ',
    state: ' TX ',
    zip: ' 78701 ',
  })

  await waitFor(() => expect(dbMock.putDealerProfile).toHaveBeenCalledTimes(1))
  const saved: DealerProfile = dbMock.putDealerProfile.mock.calls[0][0]
  expect(saved).toEqual({
    userId: 'u1',
    businessName: 'Apex Motors',
    licenseNumber: '',
    certifiedPartnerId: null,
    tier: 'standard',
    verified: false,
    rating: null,
    address: { street: '1 Main St', city: 'Austin', state: 'TX', zip: '78701' },
    logoImageId: null,
  })
  expect(onComplete).toHaveBeenCalledExactlyOnceWith(saved)
})

it('saves an empty-string address when the optional fields are left blank', async () => {
  await fillAndSubmit({ businessName: 'Apex Motors' })
  await waitFor(() => expect(dbMock.putDealerProfile).toHaveBeenCalledTimes(1))
  const saved: DealerProfile = dbMock.putDealerProfile.mock.calls[0][0]
  expect(saved.address).toEqual({ street: '', city: '', state: '', zip: '' })
})

it('shows a saving state while the profile is being persisted, then clears it', async () => {
  let resolveSave: () => void = () => {}
  dbMock.putDealerProfile.mockReturnValue(
    new Promise<void>((resolve) => {
      resolveSave = resolve
    }),
  )
  const user = userEvent.setup()
  render(<DealerRegistrationForm onComplete={vi.fn()} />)
  await user.type(screen.getByLabelText('Business name'), 'Apex Motors')
  await user.click(screen.getByRole('button', { name: 'Enter Dealer Console' }))

  expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled()

  resolveSave()
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Enter Dealer Console' })).not.toBeDisabled(),
  )
})

it('clears a previous validation error once a valid submission succeeds', async () => {
  const user = userEvent.setup()
  render(<DealerRegistrationForm onComplete={vi.fn()} />)

  await user.type(screen.getByLabelText('Business name'), '   ')
  await user.click(screen.getByRole('button', { name: 'Enter Dealer Console' }))
  expect(screen.getByText('Business name is required.')).toBeInTheDocument()

  await user.type(screen.getByLabelText('Business name'), 'Apex Motors')
  await user.click(screen.getByRole('button', { name: 'Enter Dealer Console' }))

  await waitFor(() => expect(screen.queryByText('Business name is required.')).not.toBeInTheDocument())
})
