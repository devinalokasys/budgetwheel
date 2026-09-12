import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Sell from './pages/Sell'
import Saved from './pages/Saved'
import Placeholder from './pages/Placeholder'
import DealerConsole from './pages/DealerConsole'
import DealerConsoleDesktop from './pages/DealerConsoleDesktop'
import DealPipeline from './pages/DealPipeline'
import Messages from './pages/Messages'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout title="Home">
              <Home />
            </Layout>
          }
        />
        <Route
          path="/browse"
          element={
            <Layout title="Browse">
              <Browse />
            </Layout>
          }
        />
        <Route
          path="/sell"
          element={
            <Layout title="Sell">
              <Sell />
            </Layout>
          }
        />
        <Route
          path="/saved"
          element={
            <Layout title="Saved">
              <Saved />
            </Layout>
          }
        />
        <Route
          path="/account"
          element={
            <Layout title="Account">
              <Placeholder icon="account_circle" title="Your Account" />
            </Layout>
          }
        />
        <Route
          path="/dealer"
          element={
            <>
              <div className="lg:hidden">
                <Layout title="Dealer Console" nav="dealer">
                  <DealerConsole />
                </Layout>
              </div>
              <div className="hidden lg:block">
                <DealerConsoleDesktop />
              </div>
            </>
          }
        />
        <Route
          path="/dealer/deals"
          element={
            <Layout title="Deals" nav="dealer">
              <DealPipeline />
            </Layout>
          }
        />
        <Route
          path="/messages"
          element={
            <Layout title="Direct Messages" showBack nav="none">
              <Messages />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
