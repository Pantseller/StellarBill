import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { formatCurrency, formatDate, formatDateTime, truncateAddress, resolveInvoiceStatus } from '@lib/helpers'
import { txExplorerUrl } from '@lib/stellar'
import StatusBadge from '../components/StatusBadge'
import PayButton from '../components/PayButton'
import LineItemsTable from '../components/LineItemsTable'

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { invoices, removeInvoice } = useStore()
  const invoice = invoices.find((inv) => inv.id === id)

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Invoice not found.</p>
        <Link to="/" className="btn-secondary mt-4 inline-flex">← Back</Link>
      </div>
    )
  }

  const status = resolveInvoiceStatus(invoice)
  const shareUrl = `${window.location.origin}/invoice/${invoice.id}`

  function handleDelete() {
    if (confirm('Delete this invoice? This cannot be undone.')) {
      removeInvoice(invoice!.id)
      navigate('/')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-slate-400 text-sm">
            Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="btn-secondary text-xs"
          >
            Copy Share Link
          </button>
          <Link to={`/invoice/${invoice.id}`} target="_blank" className="btn-secondary text-xs">
            Public Page ↗
          </Link>
          <button onClick={handleDelete} className="btn-danger text-xs">
            Delete
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main invoice */}
        <div className="md:col-span-2 space-y-6">
          {/* Parties */}
          <div className="card grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">From</p>
              <p className="font-semibold">{invoice.issuerName}</p>
              {invoice.issuerEmail && <p className="text-sm text-slate-400">{invoice.issuerEmail}</p>}
              <p className="text-xs font-mono text-slate-500 mt-1 break-all">{invoice.issuerAddress}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Bill To</p>
              <p className="font-semibold">{invoice.clientName}</p>
              {invoice.clientEmail && <p className="text-sm text-slate-400">{invoice.clientEmail}</p>}
              {invoice.clientStellarAddress && (
                <p className="text-xs font-mono text-slate-500 mt-1 break-all">
                  {invoice.clientStellarAddress}
                </p>
              )}
            </div>
          </div>

          {/* Line items */}
          <div className="card">
            <LineItemsTable invoice={invoice} />
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="card">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Payment summary */}
          <div className="card">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Amount Due</p>
            <p className="text-3xl font-bold text-brand-400">
              {formatCurrency(invoice.total, invoice.currency)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Pay in {invoice.paymentAsset} on Stellar
            </p>

            {status !== 'paid' && status !== 'cancelled' && (
              <div className="mt-4">
                <PayButton invoice={invoice} />
              </div>
            )}
          </div>

          {/* Payment confirmation */}
          {invoice.txHash && (
            <div className="card">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Payment Confirmed</p>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Transaction</p>
                  <a
                    href={txExplorerUrl(invoice.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-brand-400 hover:text-brand-300 break-all"
                  >
                    {truncateAddress(invoice.txHash, 8)}
                  </a>
                </div>
                {invoice.paidAt && (
                  <div>
                    <p className="text-slate-500 text-xs">Settled</p>
                    <p className="text-slate-300">{formatDateTime(invoice.paidAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice ID */}
          <div className="card">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Invoice ID</p>
            <p className="font-mono text-xs text-slate-400 break-all">{invoice.id}</p>
            <p className="text-xs text-slate-600 mt-2">Used as Stellar memo for payment tracking</p>
          </div>
        </div>
      </div>
    </div>
  )
}
