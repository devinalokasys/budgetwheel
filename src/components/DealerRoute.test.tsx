import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DealerRoute from './DealerRoute'
import type { DealerProfile } from '../lib/db/schema'

const { useAuthMock, dbMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  dbMock: { getDealerProfile: vi.fn() },
}))
vi.mock('../hooks/useAuth', () => ({ useAuth: useAuthMock }))
vi.mock('../lib/db', () => ({ db: dbMock }))
vi.mock('./DealerRegistrationForm', () => ({
  default: ({ onComplete }: { onComplete: (p: DealerProfile) => void }) => (
    <button onClick={() => onComplete({ userId: 'u1' } as DealerProfile)}>
      Registration form stub
    </button>
  ),
}))

function renderAt(initialPath = '/dealer') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/dealer"
          element={
            <DealerRoute>
              <div>Dealer console content</div>
            </DealerRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthMock.mockReset()
  dbMock.getDealerProfile.mockReset()
})

it('renders nothing while auth state is loading', () => {
  useAuthMock.mockReturnValue({ user: { uid: 'u1' }, profile: null, loading: true })
  const { container } = renderAt()
  expect(container).toBeEmptyDOMElement()
})

it('redirects to /login when not signed in', () => {
  useAuthMock.mockReturnValue({ user: null, profile: null, loading: false })
  renderAt()
  expect(screen.getByText('Login page')).toBeInTheDocument()
})

it('shows the "Dealer accounts only" message when signed in with no profile at all', () => {
  useAuthMock.mockReturnValue({ user: { uid: 'u1' }, profile: null, loading: false })
  renderAt()
  expect(screen.getByText('Dealer accounts only')).toBeInTheDocument()
})

it('shows the "Dealer accounts only" message for a signed-in consumer-type account', () => {
  useAuthMock.mockReturnValue({
    user: { uid: 'u1' },
    profile: { type: 'consumer' },
    loading: false,
  })
  renderAt()
  expect(screen.getByText('Dealer accounts only')).toBeInTheDocument()
})

it('does not fetch a dealer profile for a non-dealer account', () => {
  useAuthMock.mockReturnValue({
    user: { uid: 'u1' },
    profile: { type: 'consumer' },
    loading: false,
  })
  renderAt()
  expect(dbMock.getDealerProfile).not.toHaveBeenCalled()
})

it('does not fetch a dealer profile when the account is dealer-typed but there is no user (defensive guard)', () => {
  useAuthMock.mockReturnValue({ user: null, profile: { type: 'dealer' }, loading: false })
  renderAt()
  expect(dbMock.getDealerProfile).not.toHaveBeenCalled()
})

it('renders nothing while the dealer profile fetch is still in flight', () => {
  dbMock.getDealerProfile.mockReturnValue(new Promise(() => {}))
  useAuthMock.mockReturnValue({ user: { uid: 'u1' }, profile: { type: 'dealer' }, loading: false })
  const { container } = renderAt()
  expect(container).toBeEmptyDOMElement()
})

it('shows the registration form when the dealer account has no DealerProfile on record yet', async () => {
  dbMock.getDealerProfile.mockResolvedValue(null)
  useAuthMock.mockReturnValue({ user: { uid: 'u1' }, profile: { type: 'dealer' }, loading: false })
  renderAt()
  await waitFor(() => expect(screen.getByText('Registration form stub')).toBeInTheDocument())
  expect(dbMock.getDealerProfile).toHaveBeenCalledExactlyOnceWith('u1')
})

it('renders the dealer console content once a DealerProfile is found', async () => {
  dbMock.getDealerProfile.mockResolvedValue({ userId: 'u1', businessName: 'Apex' } as DealerProfile)
  useAuthMock.mockReturnValue({ user: { uid: 'u1' }, profile: { type: 'dealer' }, loading: false })
  renderAt()
  await waitFor(() => expect(screen.getByText('Dealer console content')).toBeInTheDocument())
})
