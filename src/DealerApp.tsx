import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Responsive from './components/Responsive'
import DealerRoute from './components/DealerRoute'
import CrossAppRedirect from './components/CrossAppRedirect'
import DealerConsole from './pages/DealerConsole'
import DealerConsoleDesktop from './pages/DealerConsoleDesktop'
import DealPipeline from './pages/DealPipeline'
import DealPipelineDesktop from './pages/DealPipelineDesktop'
import Login from './pages/Login'

// Trimmed router for the dealer-only build (dealer.html / dealer-main.tsx).
// Reuses the exact same dealer page/route wiring App.tsx already has for
// /dealer and /dealer/deals — just also mounts the console at the app's
// root, since visitors here are dealers by definition, not consumers who
// happen to have a dealerOnly nav link.
export default function DealerApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <DealerRoute>
              <Responsive
                mobile={
                  <Layout title="Dealer Console" nav="dealer">
                    <DealerConsole />
                  </Layout>
                }
                desktop={<DealerConsoleDesktop />}
              />
            </DealerRoute>
          }
        />
        <Route
          path="/dealer"
          element={
            <DealerRoute>
              <Responsive
                mobile={
                  <Layout title="Dealer Console" nav="dealer">
                    <DealerConsole />
                  </Layout>
                }
                desktop={<DealerConsoleDesktop />}
              />
            </DealerRoute>
          }
        />
        <Route
          path="/dealer/deals"
          element={
            <DealerRoute>
              <Responsive
                mobile={
                  <Layout title="Deals" nav="dealer">
                    <DealPipeline />
                  </Layout>
                }
                desktop={<DealPipelineDesktop />}
              />
            </DealerRoute>
          }
        />
        <Route path="*" element={<CrossAppRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
