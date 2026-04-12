import { useState } from 'react'
import { connectWallet, sendPayment } from '../../lib/stellar'
import { formatAmount } from '../../lib/helpers'

export default function InvoiceCard({ invoice, onReset }) {
  const [status, setStatus] = useState(invoice.status)
  const [message, setMessage] = useState(null)
  const [paying, setPaying] = useState(false)

  async function handlePay() {
    setPaying(true)
    setMessage(null)

    try {
      const senderAddress = await connectWallet()

      await sendPayment({
        senderAddress,
        destinationAddress: invoice.recipient,
        amount: String(invoice.amount),
        memo: invoice.id,
      })

      setStatus('paid')
      setMessage({ type: 'success', text: 'Payment sent successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Payment failed.' })
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="card">
      <h2>Invoice Details</h2>

      <div className="detail-row">
        <span>Invoice ID</span>
        <span>{invoice.id}</span>
      </div>
      <div className="detail-row">
        <span>Amount</span>
        <span>{formatAmount(invoice.amount)} XLM</span>
      </div>
      <div className="detail-row">
        <span>Recipient</span>
        <span>{invoice.recipient}</span>
      </div>
      <div className="detail-row">
        <span>Status</span>
        <span>
          <span className={`badge badge-${status}`}>{status}</span>
        </span>
      </div>

      {status === 'unpaid' && (
        <button
          className="btn-success"
          style={{ marginTop: '1.25rem' }}
          onClick={handlePay}
          disabled={paying}
        >
          {paying ? 'Processing...' : 'Pay Now'}
        </button>
      )}

      {message && (
        <p className={`message message-${message.type}`}>{message.text}</p>
      )}

      <button className="btn-secondary" onClick={onReset}>
        Create Another Invoice
      </button>
    </div>
  )
}
