import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { useStore } from '../store'
import { generateInvoiceId, generateInvoiceNumber, calcInvoiceTotals, formatCurrency } from '@lib/helpers'
import { isValidStellarAddress } from '@lib/stellar'
import type { Currency, Invoice, LineItem } from '../types'

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'NGN', 'USDC', 'XLM']

interface FormValues {
  clientName: string
  clientEmail: string
  clientStellarAddress: string
  issuerName: string
  issuerEmail: string
  issuerAddress: string
  currency: Currency
  paymentAsset: 'XLM' | 'USDC'
  issueDate: string
  dueDate: string
  lineItems: { description: string; quantity: number; unitPrice: number }[]
  taxPercent: number
  discountPercent: number
  notes: string
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const { invoices, addInvoice } = useStore()
  const [submitted, setSubmitted] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      currency: 'USD',
      paymentAsset: 'USDC',
      issueDate: today,
      dueDate: in30,
      taxPercent: 0,
      discountPercent: 0,
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' })

  const watchedItems = watch('lineItems')
  const watchedTax = watch('taxPercent')
  const watchedDiscount = watch('discountPercent')
  const watchedCurrency = watch('currency')

  const totals = calcInvoiceTotals(
    watchedItems.map((item, i) => ({ id: String(i), ...item })),
    Number(watchedTax) || 0,
    Number(watchedDiscount) || 0
  )

  const onSubmit = useCallback(
    (data: FormValues) => {
      const lineItems: LineItem[] = data.lineItems.map((item, i) => ({
        id: String(i),
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }))

      const { subtotal, taxAmount, discountAmount, total } = calcInvoiceTotals(
        lineItems,
        Number(data.taxPercent),
        Number(data.discountPercent)
      )

      const now = new Date().toISOString()
      const invoice: Invoice = {
        id: generateInvoiceId(),
        invoiceNumber: generateInvoiceNumber(invoices.length),
        issuerName: data.issuerName,
        issuerAddress: data.issuerAddress,
        issuerEmail: data.issuerEmail,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientStellarAddress: data.clientStellarAddress || undefined,
        lineItems,
        currency: data.currency,
        taxPercent: Number(data.taxPercent),
        discountPercent: Number(data.discountPercent),
        subtotal,
        taxAmount,
        discountAmount,
        total,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        status: 'unpaid',
        paymentAsset: data.paymentAsset,
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
      }

      addInvoice(invoice)
      setSubmitted(true)
      navigate(`/invoices/${invoice.id}`)
    },
    [invoices.length, addInvoice, navigate]
  )

  if (submitted) return null

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <p className="text-slate-400 text-sm mt-1">
          Issue a professional invoice payable in XLM or USDC on Stellar
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Parties */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* From */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-200">From (You)</h2>
            <Field label="Your Name / Business" error={errors.issuerName?.message}>
              <input
                className="input"
                placeholder="Acme Ltd."
                {...register('issuerName', { required: 'Required' })}
              />
            </Field>
            <Field label="Your Email" error={errors.issuerEmail?.message}>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                {...register('issuerEmail')}
              />
            </Field>
            <Field label="Your Stellar Address (receives payment)" error={errors.issuerAddress?.message}>
              <input
                className="input font-mono text-xs"
                placeholder="G..."
                {...register('issuerAddress', {
                  required: 'Required',
                  validate: (v) => isValidStellarAddress(v) || 'Invalid Stellar address',
                })}
              />
            </Field>
          </div>

          {/* To */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-200">Bill To (Client)</h2>
            <Field label="Client Name" error={errors.clientName?.message}>
              <input
                className="input"
                placeholder="Client Corp."
                {...register('clientName', { required: 'Required' })}
              />
            </Field>
            <Field label="Client Email" error={errors.clientEmail?.message}>
              <input
                className="input"
                type="email"
                placeholder="client@example.com"
                {...register('clientEmail')}
              />
            </Field>
            <Field label="Client Stellar Address (optional)">
              <input
                className="input font-mono text-xs"
                placeholder="G... (optional)"
                {...register('clientStellarAddress', {
                  validate: (v) =>
                    !v || isValidStellarAddress(v) || 'Invalid Stellar address',
                })}
              />
            </Field>
          </div>
        </div>

        {/* Invoice meta */}
        <div className="card">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Invoice Currency">
              <select className="input" {...register('currency')}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Payment Asset">
              <select className="input" {...register('paymentAsset')}>
                <option value="USDC">USDC (Stellar)</option>
                <option value="XLM">XLM (native)</option>
              </select>
            </Field>
            <Field label="Issue Date" error={errors.issueDate?.message}>
              <input className="input" type="date" {...register('issueDate', { required: 'Required' })} />
            </Field>
            <Field label="Due Date" error={errors.dueDate?.message}>
              <input className="input" type="date" {...register('dueDate', { required: 'Required' })} />
            </Field>
          </div>
        </div>

        {/* Line items */}
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-4">Line Items</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 font-medium px-1">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-right">Qty</span>
              <span className="col-span-3 text-right">Unit Price</span>
              <span className="col-span-1" />
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <input
                    className="input"
                    placeholder="Service description"
                    {...register(`lineItems.${index}.description`, { required: true })}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    className="input text-right"
                    type="number"
                    min="0.01"
                    step="any"
                    {...register(`lineItems.${index}.quantity`, { min: 0.01, valueAsNumber: true })}
                  />
                </div>
                <div className="col-span-3">
                  <input
                    className="input text-right"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    {...register(`lineItems.${index}.unitPrice`, { min: 0, valueAsNumber: true })}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
            className="mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors"
          >
            + Add line item
          </button>

          {/* Totals */}
          <div className="mt-6 border-t border-slate-800 pt-4 space-y-2 max-w-xs ml-auto">
            <div className="grid grid-cols-2 gap-2 items-center">
              <label className="label mb-0 text-right">Discount %</label>
              <input
                className="input text-right"
                type="number"
                min="0"
                max="100"
                step="any"
                {...register('discountPercent', { min: 0, max: 100 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <label className="label mb-0 text-right">Tax %</label>
              <input
                className="input text-right"
                type="number"
                min="0"
                max="100"
                step="any"
                {...register('taxPercent', { min: 0, max: 100 })}
              />
            </div>
            <div className="text-sm text-slate-400 flex justify-between pt-1">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal, watchedCurrency)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="text-sm text-emerald-400 flex justify-between">
                <span>Discount</span>
                <span>−{formatCurrency(totals.discountAmount, watchedCurrency)}</span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="text-sm text-slate-400 flex justify-between">
                <span>Tax</span>
                <span>+{formatCurrency(totals.taxAmount, watchedCurrency)}</span>
              </div>
            )}
            <div className="text-base font-bold flex justify-between border-t border-slate-700 pt-2">
              <span>Total</span>
              <span className="text-brand-400">{formatCurrency(totals.total, watchedCurrency)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <Field label="Notes (optional)">
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Payment terms, bank details, thank you note..."
              {...register('notes')}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Create Invoice →
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}
