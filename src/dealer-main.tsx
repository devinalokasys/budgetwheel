import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DealerApp from './DealerApp.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DealerApp />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
