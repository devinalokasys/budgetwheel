import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }))
vi.mock('../hooks/useAuth', () => ({ useAuth: useAuthMock }))

function LoginStub() {
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from
  return <div>Login page (from: {from?.pathname ?? 'none'})</div>
}

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LoginStub />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Secret content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthMock.mockReset()
})

it('renders nothing while auth state is still loading, even if a user is present', () => {
  useAuthMock.mockReturnValue({ user: { uid: 'u1' }, loading: true })
  const { container } = renderAt('/protected')
  expect(container).toBeEmptyDOMElement()
})

it('redirects to /login, preserving the origin path in location state, when not signed in', () => {
  useAuthMock.mockReturnValue({ user: null, loading: false })
  renderAt('/protected')
  expect(screen.getByText('Login page (from: /protected)')).toBeInTheDocument()
})

it('renders the protected children once loading is finished and a user is present', () => {
  useAuthMock.mockReturnValue({ user: { uid: 'u1' }, loading: false })
  renderAt('/protected')
  expect(screen.getByText('Secret content')).toBeInTheDocument()
})
