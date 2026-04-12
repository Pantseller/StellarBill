import { useState } from 'react'
import { generateInvoiceId, formatAmount } from '../../lib/helpers'

export default function CreateInvoiceForm({ onCreated }) {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Enter a valid amount.')
      return
    }
    if (!recipient.startsWith('G') || recipient.length !== 56) {
      setError('Enter a valid Stellar address (starts with G, 56 chars).')
      return
    }

    const invoice = {
      id: generateInvoiceId(),
      amount: parsedAmount,
      recipient,
      status: 'unpaid',
      createdAt: new Date().toISOString(),
    }

    onCreated(invoice)
  }

  return (
    <div className="card">
      <h2>Create Invoice</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="amount">Amount (XLM)</label>
          <input
            id="amount"
            type="number"
            min="0.0000001"
            step="any"
            placeholder="e.g. 10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="recipient">Recipient Stellar Address</label>
          <input
            id="recipient"
            type="text"
            placeholder="GABC...XYZ"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>

        {error && <p className="message message-error">{error}</p>}

        <button type="submit" className="btn-primary">
          Generate Invoice
        </button>
      </form>
    </div>
  )
}
