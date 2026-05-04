import type { InvoiceStatus } from '../types'
import clsx from 'clsx'

const LABELS: Record<InvoiceStatus, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  overdue: 'Overdue',
  draft: 'Draft',
  cancelled: 'Cancelled',
}

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={clsx('badge', `badge-${status}`)}>
      {LABELS[status]}
    </span>
  )
}
