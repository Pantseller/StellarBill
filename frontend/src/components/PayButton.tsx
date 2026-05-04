import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { connectWallet, sendPayment, detectPayment } from '@lib/stellar'
import { formatCurrency } from '@lib/helpers'
import type { Invoice } from '../types'

type Phase = 'idle' | 'connecting' | 'signing' | 'submitting' | 'detecting' | 'done' | 'error'

export default function PayButton({ invoice }: { invoice: Invoice }) {
  const { wallet, setWallet, updateInvoice } = useStore()
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  async function handlePay() {
    setError(null)

    try {
      let address = wallet.address

      if (!address) {
        setPhase('connecting')
        address = await connectWallet()
        setWallet({ connected: true, address, network: 'testnet' })
      }

      setPhase('signing')

      // For non-XLM/USDC invoice currencies, the payment amount equals the invoice total
      // (user is responsible for the correct amount in the chosen payment asset).
      // A production app would fetch a live exchange rate here.
      const paymentAmount = invoice.total.toFixed(7)

      setPhase('submitting')
      const result = await sendPayment({
        senderAddress: address,
        destinationAddress: invoice.issuerAddress,
        amount: paymentAmount,
        asset: invoice.paymentAsset,
        memo: invoice.id,
      })

      updateInvoice(invoice.id, {
        status: 'paid',
        txHash: result.txHash,
        paidAt: result.paidAt,
      })
      setPhase('done')
    } catch (e: unknown) {
      // If wallet not connected yet, fall back to detection polling
      if (phase === 'idle' || phase === 'connecting') {
        setPhase('detecting')
        startDetection(invoice)
        return
      }
      setError(e instanceof Error ? e.message : 'Payment failed')
      setPhase('error')
    }
  }

  function startDetection(inv: Invoice) {
    const ac = new AbortController()
    abortRef.current = ac
    detectPayment(
      inv.issuerAddress,
      inv.id,
      (result) => {
        updateInvoice(inv.id, {
          status: 'paid',
          txHash: result.txHash,
          paidAt: result.paidAt,
        })
        setPhase('done')
      },
      ac.signal
    )
  }

  if (phase === 'done') {
    return (
      <div className="text-center py-2">
        <p className="text-emerald-400 font-semibold text-sm">✓ Payment confirmed</p>
      </div>
    )
  }

  const busy = phase !== 'idle' && phase !== 'error'

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={busy}
        className="btn-success w-full"
      >
        {PHASE_LABELS[phase]}
      </button>

      {phase === 'detecting' && (
        <p className="text-xs text-slate-400 text-center">
          Waiting for payment · polling Horizon…
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      <p className="text-xs text-slate-500 text-center">
        Pay {formatCurrency(invoice.total, invoice.currency)} in {invoice.paymentAsset}
      </p>
    </div>
  )
}

const PHASE_LABELS: Record<Phase, string> = {
  idle: 'Pay with Freighter',
  connecting: 'Connecting wallet…',
  signing: 'Sign in Freighter…',
  submitting: 'Submitting…',
  detecting: 'Detecting payment…',
  done: 'Paid ✓',
  error: 'Retry Payment',
}
