/**
 * StellarBill — Stellar payment layer
 *
 * Handles wallet connection, XLM/USDC payments, path payments,
 * and payment detection via Horizon polling.
 */

import {
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
  StrKey,
  Account,
} from '@stellar/stellar-sdk'
import {
  requestAccess,
  getAddress,
  signTransaction,
  isConnected,
} from '@stellar/freighter-api'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const NETWORK = (import.meta.env.VITE_STELLAR_NETWORK ?? 'testnet') as
  | 'testnet'
  | 'mainnet'

export const HORIZON_URL =
  NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org'

export const NETWORK_PASSPHRASE =
  NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET

// USDC on Stellar (Circle's issuer)
export const USDC_ASSET = new Asset(
  'USDC',
  NETWORK === 'mainnet'
    ? 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
    : 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5' // testnet USDC
)

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

export async function connectWallet(): Promise<string> {
  const connected = await isConnected()
  if (!connected) {
    throw new Error(
      'Freighter wallet not found. Install the Freighter browser extension at freighter.app'
    )
  }
  await requestAccess()
  const result = await getAddress()
  if (result.error) throw new Error(String(result.error))
  return result.address
}

export async function isWalletConnected(): Promise<boolean> {
  const result = await isConnected()
  return !!result
}

// ---------------------------------------------------------------------------
// Account helpers
// ---------------------------------------------------------------------------

export async function loadAccount(address: string) {
  const res = await fetch(`${HORIZON_URL}/accounts/${address}`)
  if (!res.ok) throw new Error('Account not found or not funded on Stellar network.')
  return res.json()
}

export function isValidStellarAddress(address: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(address)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export interface PaymentParams {
  senderAddress: string
  destinationAddress: string
  /** Amount in the chosen asset */
  amount: string
  asset: 'XLM' | 'USDC'
  /** Invoice ID used as memo (truncated to 28 bytes) */
  memo: string
}

export interface PaymentResult {
  txHash: string
  ledger: number
  paidAt: string
}

export async function sendPayment(params: PaymentParams): Promise<PaymentResult> {
  const { senderAddress, destinationAddress, amount, asset, memo } = params

  const accountData = await loadAccount(senderAddress)
  const payAsset = asset === 'USDC' ? USDC_ASSET : Asset.native()

  const tx = new TransactionBuilder(
    new Account(accountData.id, accountData.sequence),
    { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(
      Operation.payment({
        destination: destinationAddress,
        asset: payAsset,
        amount,
      })
    )
    .addMemo(Memo.text(memo.substring(0, 28)))
    .setTimeout(30)
    .build()

  const signResult = await signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  })
  if (signResult.error) throw new Error(String(signResult.error))

  return submitTransaction(signResult.signedTxXdr)
}

/**
 * Path payment: payer sends XLM, recipient receives USDC (or vice versa).
 * Uses Stellar DEX for automatic conversion.
 */
export async function sendPathPayment(params: {
  senderAddress: string
  destinationAddress: string
  sendAsset: 'XLM' | 'USDC'
  sendMax: string
  destAsset: 'XLM' | 'USDC'
  destAmount: string
  memo: string
}): Promise<PaymentResult> {
  const { senderAddress, destinationAddress, sendAsset, sendMax, destAsset, destAmount, memo } =
    params

  const accountData = await loadAccount(senderAddress)

  const tx = new TransactionBuilder(
    new Account(accountData.id, accountData.sequence),
    { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(
      Operation.pathPaymentStrictReceive({
        sendAsset: sendAsset === 'USDC' ? USDC_ASSET : Asset.native(),
        sendMax,
        destination: destinationAddress,
        destAsset: destAsset === 'USDC' ? USDC_ASSET : Asset.native(),
        destAmount,
        path: [],
      })
    )
    .addMemo(Memo.text(memo.substring(0, 28)))
    .setTimeout(30)
    .build()

  const signResult = await signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  })
  if (signResult.error) throw new Error(String(signResult.error))

  return submitTransaction(signResult.signedTxXdr)
}

async function submitTransaction(signedTxXdr: string): Promise<PaymentResult> {
  const res = await fetch(`${HORIZON_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `tx=${encodeURIComponent(signedTxXdr)}`,
  })

  const result = await res.json()
  if (!res.ok) {
    const code = result?.extras?.result_codes?.transaction ?? 'unknown'
    throw new Error(`Transaction failed: ${code}`)
  }

  return {
    txHash: result.hash,
    ledger: result.ledger,
    paidAt: result.created_at,
  }
}

// ---------------------------------------------------------------------------
// Payment detection — poll Horizon for incoming payment with matching memo
// ---------------------------------------------------------------------------

export async function detectPayment(
  destinationAddress: string,
  invoiceId: string,
  onDetected: (result: PaymentResult) => void,
  signal?: AbortSignal
): Promise<void> {
  const memoTarget = invoiceId.substring(0, 28)

  const poll = async () => {
    if (signal?.aborted) return
    try {
      const res = await fetch(
        `${HORIZON_URL}/accounts/${destinationAddress}/payments?order=desc&limit=10`
      )
      const data = await res.json()
      const records: Array<{ transaction_hash: string }> = data?._embedded?.records ?? []

      for (const record of records) {
        if (!record.transaction_hash) continue
        const txRes = await fetch(`${HORIZON_URL}/transactions/${record.transaction_hash}`)
        const tx = await txRes.json()
        if (tx.memo === memoTarget) {
          onDetected({ txHash: tx.hash, ledger: tx.ledger, paidAt: tx.created_at })
          return
        }
      }
    } catch {
      // network error — keep polling
    }
    if (!signal?.aborted) setTimeout(poll, 5000)
  }

  poll()
}

// ---------------------------------------------------------------------------
// Explorer link
// ---------------------------------------------------------------------------

export function txExplorerUrl(txHash: string): string {
  return `https://stellar.expert/explorer/${NETWORK === 'mainnet' ? 'public' : 'testnet'}/tx/${txHash}`
}
