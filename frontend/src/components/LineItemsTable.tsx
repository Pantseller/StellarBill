import { formatCurrency, calcLineItemTotal } from '@lib/helpers'
import type { Invoice } from '../types'

export default function LineItemsTable({ invoice }: { invoice: Invoice }) {
  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-800">
            <th className="pb-3 font-medium">Description</th>
            <th className="pb-3 font-medium text-right">Qty</th>
            <th className="pb-3 font-medium text-right">Unit Price</th>
            <th className="pb-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {invoice.lineItems.map((item) => (
            <tr key={item.id}>
              <td className="py-3 text-slate-200">{item.description}</td>
              <td className="py-3 text-right text-slate-400">{item.quantity}</td>
              <td className="py-3 text-right text-slate-400">
                {formatCurrency(item.unitPrice, invoice.currency)}
              </td>
              <td className="py-3 text-right font-medium">
                {formatCurrency(calcLineItemTotal(item), invoice.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-4 border-t border-slate-800 pt-4 space-y-1.5 max-w-xs ml-auto text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
        </div>
        {invoice.discountAmount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Discount ({invoice.discountPercent}%)</span>
            <span>−{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
          </div>
        )}
        {invoice.taxAmount > 0 && (
          <div className="flex justify-between text-slate-400">
            <span>Tax ({invoice.taxPercent}%)</span>
            <span>+{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t border-slate-700 pt-2">
          <span>Total</span>
          <span className="text-brand-400">{formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
      </div>
    </div>
  )
}
