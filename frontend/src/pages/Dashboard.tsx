import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { formatCurrency, formatDate, resolveInvoiceStatus } from '@lib/helpers'
import type { Invoice } from '../types'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const invoices = useStore((s) => s.invoices)

  const stats = useMemo(() => {
    const live = invoices.map((inv) => ({ ...inv, status: resolveInvoiceStatus(inv) }))
    const paid = live.filter((i) => i.status === 'paid')
    const unpaid = live.filter((i) => i.status === 'unpaid')
    const overdue = live.filter((i) => i.status === 'overdue')
    // Revenue: sum paid totals (all currencies, shown as raw numbers for simplicity)
    const revenue = paid.reduce((sum, i) => sum + i.total, 0)
    return { total: live.length, paid: paid.length, unpaid: unpaid.length, overdue: overdue.length, revenue }
  }, [invoices])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your invoices and track payments</p>
        </div>
        <Link to="/create" className="btn-primary">
          + New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Invoices" value={stats.total} />
        <StatCard label="Paid" value={stats.paid} accent="text-emerald-400" />
        <StatCard label="Unpaid" value={stats.unpaid} accent="text-amber-400" />
        <StatCard label="Overdue" value={stats.overdue} accent="text-red-400" />
      </div>

      {/* Invoice list */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Invoices</h2>
          <span className="text-xs text-slate-500">{invoices.length} total</span>
        </div>

        {invoices.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Due</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.map((inv) => (
                  <InvoiceRow key={inv.id} invoice={inv} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent = 'text-slate-100' }: { label: string; value: number; accent?: string }) {
  return (
    <div className="stat-card">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const status = resolveInvoiceStatus(invoice)
  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="py-3 pr-4">
        <span className="font-mono text-xs text-slate-300">{invoice.invoiceNumber}</span>
      </td>
      <td className="py-3 pr-4 text-slate-200">{invoice.clientName}</td>
      <td className="py-3 pr-4 font-semibold">{formatCurrency(invoice.total, invoice.currency)}</td>
      <td className="py-3 pr-4 text-slate-400">{formatDate(invoice.dueDate)}</td>
      <td className="py-3 pr-4">
        <StatusBadge status={status} />
      </td>
      <td className="py-3 text-right">
        <Link
          to={`/invoices/${invoice.id}`}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          View →
        </Link>
      </td>
    </tr>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">📄</p>
      <p className="text-slate-300 font-medium">No invoices yet</p>
      <p className="text-slate-500 text-sm mt-1 mb-5">
        Create your first invoice and start getting paid on Stellar
      </p>
      <Link to="/create" className="btn-primary">
        Create Invoice
      </Link>
    </div>
  )
}
