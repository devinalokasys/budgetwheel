import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Responsive from './components/Responsive'
import DesktopPageShell from './components/DesktopPageShell'
import ProtectedRoute from './components/ProtectedRoute'
import DealerRoute from './components/DealerRoute'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ListingDetail from './pages/ListingDetail'
import Sell from './pages/Sell'
import Saved from './pages/Saved'
import Placeholder from './pages/Placeholder'
import DealerConsole from './pages/DealerConsole'
import DealerConsoleDesktop from './pages/DealerConsoleDesktop'
import DealPipeline from './pages/DealPipeline'
import DealPipelineDesktop from './pages/DealPipelineDesktop'
import Messages from './pages/Messages'
import ConversationThread from './pages/ConversationThread'
import AccountDesktop from './pages/AccountDesktop'
import HomeDesktop from './pages/HomeDesktop'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Responsive
              mobile={
                <Layout title="Home">
                  <Home />
                </Layout>
              }
              desktop={<HomeDesktop />}
            />
          }
        />
        <Route
          path="/browse"
          element={
            <Responsive
              mobile={
                <Layout title="Browse">
                  <Browse />
                </Layout>
              }
              desktop={
                <DesktopPageShell active="browse">
                  <Browse />
                </DesktopPageShell>
              }
            />
          }
        />
        <Route
          path="/listing/:id"
          element={
            <Responsive
              mobile={
                <Layout title="Vehicle Details" showBack nav="none">
                  <ListingDetail />
                </Layout>
              }
              desktop={
                <DesktopPageShell active="browse">
                  <ListingDetail />
                </DesktopPageShell>
              }
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Responsive
                mobile={
                  <Layout title="Sell">
                    <Sell />
                  </Layout>
                }
                desktop={
                  <DesktopPageShell>
                    <Sell />
                  </DesktopPageShell>
                }
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <Responsive
                mobile={
                  <Layout title="Saved">
                    <Saved />
                  </Layout>
                }
                desktop={
                  <DesktopPageShell active="saved">
                    <Saved />
                  </DesktopPageShell>
                }
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Responsive
                mobile={
                  <Layout title="Account">
                    <Placeholder icon="account_circle" title="Your Account" />
                  </Layout>
                }
                desktop={<AccountDesktop />}
              />
            </ProtectedRoute>
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
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Responsive
                mobile={
                  <Layout title="Direct Messages" showBack nav="none">
                    <Messages />
                  </Layout>
                }
                desktop={
                  <DesktopPageShell active="messages">
                    <Messages />
                  </DesktopPageShell>
                }
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:conversationId"
          element={
            <ProtectedRoute>
              <Responsive
                mobile={
                  <Layout title="Chat" showBack nav="none">
                    <ConversationThread />
                  </Layout>
                }
                desktop={
                  <DesktopPageShell active="messages">
                    <ConversationThread />
                  </DesktopPageShell>
                }
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
