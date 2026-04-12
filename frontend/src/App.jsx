import { useState } from 'react'
import CreateInvoiceForm from './components/CreateInvoiceForm'
import InvoiceCard from './components/InvoiceCard'

export default function App() {
  const [invoice, setInvoice] = useState(null)

  return (
    <div className="app">
      <header>
        <h1>💸 StellarBill</h1>
        <p>Create and pay invoices on Stellar</p>
      </header>

      <main>
        {!invoice ? (
          <CreateInvoiceForm onCreated={setInvoice} />
        ) : (
          <InvoiceCard invoice={invoice} onReset={() => setInvoice(null)} />
        )}
      </main>
    </div>
  )
}
