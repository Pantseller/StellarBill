# API Reference

StellarBill v1.0 is a client-side application with no backend API. All state is stored in the browser via Zustand + localStorage.

This document describes the internal library API used by the frontend.

---

## `lib/stellar.ts`

### `connectWallet() → Promise<string>`

Connect to the Freighter browser wallet. Returns the user's Stellar public key.

**Throws** if Freighter is not installed or the user denies access.

```ts
const address = await connectWallet()
// "GABC...XYZ"
```

---

### `isWalletConnected() → Promise<boolean>`

Check whether Freighter is currently connected.

---

### `loadAccount(address: string) → Promise<object>`

Load a Stellar account from Horizon. Returns the raw Horizon account object.

**Throws** if the account does not exist or is not funded.

---

### `isValidStellarAddress(address: string) → boolean`

Returns `true` if the address is a valid Stellar Ed25519 public key (starts with `G`, 56 characters).

---

### `sendPayment(params) → Promise<PaymentResult>`

Send an XLM or USDC payment on Stellar.

**Params:**

| Field | Type | Description |
|---|---|---|
| `senderAddress` | `string` | Sender's Stellar public key |
| `destinationAddress` | `string` | Recipient's Stellar public key |
| `amount` | `string` | Amount in the chosen asset |
| `asset` | `'XLM' \| 'USDC'` | Payment asset |
| `memo` | `string` | Invoice ID (used as Stellar memo, max 28 bytes) |

**Returns:** `{ txHash, ledger, paidAt }`

---

### `sendPathPayment(params) → Promise<PaymentResult>`

Send a path payment using Stellar DEX. Allows the sender to pay in one asset while the recipient receives another (e.g. sender pays XLM, recipient receives USDC).

**Params:**

| Field | Type | Description |
|---|---|---|
| `senderAddress` | `string` | Sender's public key |
| `destinationAddress` | `string` | Recipient's public key |
| `sendAsset` | `'XLM' \| 'USDC'` | Asset the sender will spend |
| `sendMax` | `string` | Maximum amount sender will spend |
| `destAsset` | `'XLM' \| 'USDC'` | Asset the recipient will receive |
| `destAmount` | `string` | Exact amount recipient will receive |
| `memo` | `string` | Invoice ID |

---

### `detectPayment(destination, invoiceId, onDetected, signal?)`

Poll Horizon for an incoming payment matching the invoice ID memo.

Calls `onDetected(result)` when a matching payment is found. Polls every 5 seconds until found or aborted.

**Params:**

| Field | Type | Description |
|---|---|---|
| `destination` | `string` | Recipient's Stellar address |
| `invoiceId` | `string` | Invoice ID to match against memo |
| `onDetected` | `(result: PaymentResult) => void` | Callback on detection |
| `signal` | `AbortSignal?` | Optional abort signal to stop polling |

---

### `txExplorerUrl(txHash: string) → string`

Returns a Stellar Expert URL for the given transaction hash. Respects the configured network (testnet/mainnet).

---

## `lib/helpers.ts`

### `generateInvoiceId() → string`

Generate a unique invoice ID. Format: `INV-<timestamp base36>-<random 4 chars>`.

Example: `INV-LQ3K7F-AB2X`

---

### `generateInvoiceNumber(existing: number) → string`

Generate a sequential invoice number. Format: `SB-0001`, `SB-0002`, etc.

---

### `formatCurrency(amount: number, currency: Currency) → string`

Format an amount in the given currency using `Intl.NumberFormat` for fiat currencies, and plain decimal notation for XLM/USDC.

```ts
formatCurrency(1500, 'USD')   // "$1,500.00"
formatCurrency(1500, 'NGN')   // "₦1,500.00"
formatCurrency(10.5, 'XLM')  // "10.5 XLM"
```

---

### `calcInvoiceTotals(lineItems, taxPercent, discountPercent)`

Calculate invoice totals from line items and rates.

**Returns:** `{ subtotal, taxAmount, discountAmount, total }`

Discount is applied to subtotal first, then tax is applied to the discounted amount.

---

### `resolveInvoiceStatus(invoice) → InvoiceStatus`

Resolve the effective status of an invoice, accounting for overdue detection.

- Returns `paid`, `cancelled`, or `draft` as-is
- Returns `overdue` if `dueDate` is in the past and status is `unpaid`
- Returns `unpaid` otherwise

---

### `formatDate(iso: string) → string`

Format an ISO date string as `"May 4, 2026"`.

---

### `truncateAddress(address: string, chars?: number) → string`

Truncate a Stellar address for display. Default: 6 chars each side.

```ts
truncateAddress("GABC...XYZ") // "GABC...XYZ" (if short enough)
truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWX")
// "GABCDE...UVWX"
```
