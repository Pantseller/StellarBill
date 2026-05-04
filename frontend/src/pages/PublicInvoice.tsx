import { useParams, Link } from 'react-router-dom'
import { useStore } from '../store'
import { formatCurrency, formatDate, resolveInvoiceStatus } from '@lib/helpers'
import { txExplorerUrl } from '@lib/stellar'
import StatusBadge from '../components/StatusBadge'
import PayButton from '../components/PayButton'
import LineItemsTable from '../components/LineItemsTable'
import QRCode from '../components/QRCode'

export default function PublicInvoice() {
  const { id } = useParams<{ id: string }>()
  const invoices = useStore((s) => s.invoices)
  const invoice = invoices.find((inv) => inv.id === id)

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl font-bold mb-2">Invoice not found</h1>
          <p className="text-slate-400 text-sm mb-6">
            This invoice may have been deleted or the link is incorrect.
          </p>
          <Link to="/" className="btn-secondary">Go to StellarBill</Link>
        </div>
      </div>
    )
  }

  const status = resolveInvoiceStatus(invoice)
  const pageUrl = window.location.href

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-brand-400">✦</span>
          <span className="font-bold">StellarBill</span>
        </Link>
        <StatusBadge status={status} />
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Invoice header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Invoice</p>
              <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
              <p className="text-slate-400 text-sm mt-1">
                From <span className="text-slate-200">{invoice.issuerName}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Amount Due</p>
              <p className="text-3xl font-bold text-brand-400">
                {formatCurrency(invoice.total, invoice.currency)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Due {formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Line items */}
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <LineItemsTable invoice={invoice} />
            </div>

            {invoice.notes && (
              <div className="card">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Notes</p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Payment panel */}
          <div className="space-y-4">
            {status === 'paid' ? (
              <div className="card text-center">
                <p className="text-4xl mb-2">✅</p>
                <p className="font-semibold text-emerald-400">Paid</p>
                {invoice.txHash && (
                  <a
                    href={txExplorerUrl(invoice.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-400 hover:text-brand-300 mt-2 block"
                  >
                    View on Stellar Expert ↗
                  </a>
                )}
              </div>
            ) : (
              <div className="card space-y-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Pay Now</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(invoice.total, invoice.currency)}
                </p>
                <p className="text-xs text-slate-400">
                  Pay in <strong>{invoice.paymentAsset}</strong> on Stellar network.
                  Low fees, instant settlement.
                </p>
                <PayButton invoice={invoice} />
              </div>
            )}

            {/* QR code */}
            <div className="card flex flex-col items-center gap-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide self-start">
                Scan to Pay
              </p>
              <QRCode value={pageUrl} size={140} />
              <p className="text-xs text-slate-600 text-center">
                Scan with a Stellar-compatible wallet
              </p>
            </div>

            {/* Recipient address */}
            <div className="card">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                Send to Address
              </p>
              <p className="font-mono text-xs text-slate-300 break-all">
                {invoice.issuerAddress}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(invoice.issuerAddress)}
                className="text-xs text-brand-400 hover:text-brand-300 mt-2 transition-colors"
              >
                Copy address
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-10">
          Powered by{' '}
          <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-400">
            Stellar
          </a>{' '}
          · Built with StellarBill
        </p>
      </div>
    </div>
  )
}
