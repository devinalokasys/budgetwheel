import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Responsive from './components/Responsive'
import DesktopPageShell from './components/DesktopPageShell'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Sell from './pages/Sell'
import Saved from './pages/Saved'
import Placeholder from './pages/Placeholder'
import DealerConsole from './pages/DealerConsole'
import DealerConsoleDesktop from './pages/DealerConsoleDesktop'
import DealPipeline from './pages/DealPipeline'
import DealPipelineDesktop from './pages/DealPipelineDesktop'
import Messages from './pages/Messages'
import AccountDesktop from './pages/AccountDesktop'
import HomeDesktop from './pages/HomeDesktop'

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
          path="/sell"
          element={
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
          }
        />
        <Route
          path="/saved"
          element={
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
          }
        />
        <Route
          path="/account"
          element={
            <Responsive
              mobile={
                <Layout title="Account">
                  <Placeholder icon="account_circle" title="Your Account" />
                </Layout>
              }
              desktop={<AccountDesktop />}
            />
          }
        />
        <Route
          path="/dealer"
          element={
            <Responsive
              mobile={
                <Layout title="Dealer Console" nav="dealer">
                  <DealerConsole />
                </Layout>
              }
              desktop={<DealerConsoleDesktop />}
            />
          }
        />
        <Route
          path="/dealer/deals"
          element={
            <Responsive
              mobile={
                <Layout title="Deals" nav="dealer">
                  <DealPipeline />
                </Layout>
              }
              desktop={<DealPipelineDesktop />}
            />
          }
        />
        <Route
          path="/messages"
          element={
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
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
