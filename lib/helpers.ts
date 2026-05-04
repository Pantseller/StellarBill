import type { Currency, Invoice, LineItem } from '../types'
import { format, isPast, parseISO } from 'date-fns'

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

export function generateInvoiceId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INV-${ts}-${rand}`
}

export function generateInvoiceNumber(existing: number): string {
  return `SB-${String(existing + 1).padStart(4, '0')}`
}

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  XLM: 'XLM',
  USDC: 'USDC',
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'XLM' || currency === 'USDC') {
    return `${parseFloat(amount.toFixed(7)).toString()} ${currency}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function currencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency]
}

// ---------------------------------------------------------------------------
// Invoice calculations
// ---------------------------------------------------------------------------

export function calcLineItemTotal(item: LineItem): number {
  return item.quantity * item.unitPrice
}

export function calcInvoiceTotals(
  lineItems: LineItem[],
  taxPercent: number,
  discountPercent: number
): { subtotal: number; taxAmount: number; discountAmount: number; total: number } {
  const subtotal = lineItems.reduce((sum, item) => sum + calcLineItemTotal(item), 0)
  const discountAmount = subtotal * (discountPercent / 100)
  const taxable = subtotal - discountAmount
  const taxAmount = taxable * (taxPercent / 100)
  const total = taxable + taxAmount
  return { subtotal, taxAmount, discountAmount, total }
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

export function resolveInvoiceStatus(invoice: Invoice): Invoice['status'] {
  if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'draft') {
    return invoice.status
  }
  if (isPast(parseISO(invoice.dueDate))) return 'overdue'
  return 'unpaid'
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy')
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy HH:mm')
}

// ---------------------------------------------------------------------------
// Address truncation
// ---------------------------------------------------------------------------

export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}
