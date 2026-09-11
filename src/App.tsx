import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Placeholder from './pages/Placeholder'
import DealerConsole from './pages/DealerConsole'
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
              <Placeholder icon="sell" title="Sell Your Car" />
            </Layout>
          }
        />
        <Route
          path="/saved"
          element={
            <Layout title="Saved">
              <Placeholder icon="favorite" title="Saved Vehicles" />
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
            <Layout title="Dealer Console" nav="dealer">
              <DealerConsole />
            </Layout>
          }
        />
        <Route
          path="/dealer/deals"
          element={
            <Layout title="Deals" nav="dealer">
              <Placeholder icon="local_offer" title="Deal Pipeline" />
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
