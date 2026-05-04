import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CreateInvoice from './pages/CreateInvoice'
import InvoiceDetail from './pages/InvoiceDetail'
import PublicInvoice from './pages/PublicInvoice'

export default function App() {
  return (
    <Routes>
      {/* Public invoice payment page — no shell */}
      <Route path="/invoice/:id" element={<PublicInvoice />} />

      {/* App shell */}
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="/create" element={<CreateInvoice />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
      </Route>
    </Routes>
  )
}
