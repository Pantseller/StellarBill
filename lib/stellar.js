import {
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
} from '@stellar/stellar-sdk'

const HORIZON_URL = 'https://horizon-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET

/**
 * Connect to the Freighter browser wallet.
 * Returns the user's public key on success.
 */
export async function connectWallet() {
  if (!window.freighter) {
    throw new Error('Freighter wallet not found. Please install the Freighter extension.')
  }

  await window.freighter.requestAccess()
  const { address } = await window.freighter.getAddress()
  return address
}

/**
 * Send an XLM payment on the Stellar testnet.
 *
 * @param {object} params
 * @param {string} params.senderAddress      - Sender's Stellar public key
 * @param {string} params.destinationAddress - Recipient's Stellar public key
 * @param {string} params.amount             - Amount in XLM (e.g. "10")
 * @param {string} params.memo               - Invoice ID used as transaction memo
 */
export async function sendPayment({ senderAddress, destinationAddress, amount, memo }) {
  // Load the sender's account from Horizon
  const response = await fetch(`${HORIZON_URL}/accounts/${senderAddress}`)
  if (!response.ok) throw new Error('Could not load sender account. Is it funded?')
  const accountData = await response.json()

  // Build the transaction
  const transaction = new TransactionBuilder(
    { id: accountData.id, sequence: accountData.sequence, accountId: () => accountData.id },
    { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(
      Operation.payment({
        destination: destinationAddress,
        asset: Asset.native(),
        amount,
      })
    )
    .addMemo(Memo.text(memo.substring(0, 28))) // Stellar memo max is 28 bytes
    .setTimeout(30)
    .build()

  // Sign with Freighter
  const { signedTxXdr } = await window.freighter.signTransaction(transaction.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  })

  // Submit to Horizon
  const submitResponse = await fetch(`${HORIZON_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `tx=${encodeURIComponent(signedTxXdr)}`,
  })

  const result = await submitResponse.json()
  if (!submitResponse.ok) {
    throw new Error(result?.extras?.result_codes?.transaction || 'Transaction failed.')
  }

  return result
}
