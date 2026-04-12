# Contract Reference

## Invoice Contract (`contracts/invoice`)

A minimal Soroban smart contract for storing invoice state on-chain.

### Data Types

**`InvoiceStatus`** — enum
- `Unpaid`
- `Paid`

**`Invoice`** — struct
| Field       | Type      | Description                        |
|-------------|-----------|------------------------------------|
| `id`        | `Symbol`  | Unique invoice identifier          |
| `amount`    | `i128`    | Amount in stroops (1 XLM = 10^7)  |
| `recipient` | `Address` | Stellar address of the recipient   |
| `status`    | `InvoiceStatus` | Current payment status       |

### Functions

#### `create_invoice(env, id, amount, recipient)`
Creates a new invoice. Panics if the ID already exists.

#### `mark_as_paid(env, id)`
Marks an invoice as paid. Panics if not found or already paid.

#### `get_invoice(env, id) → Invoice`
Returns the invoice data for the given ID.

---

## Lib Reference (`lib/`)

### `helpers.js`

| Function | Returns | Description |
|---|---|---|
| `generateInvoiceId()` | `string` | Generates a unique `INV-xxx-xxxx` ID |
| `formatAmount(amount)` | `string` | Formats XLM amount, trims trailing zeros |

### `stellar.js`

| Function | Returns | Description |
|---|---|---|
| `connectWallet()` | `Promise<string>` | Connects Freighter, returns public key |
| `sendPayment(params)` | `Promise<object>` | Builds, signs, and submits XLM payment |

`sendPayment` params:
- `senderAddress` — sender's public key
- `destinationAddress` — recipient's public key
- `amount` — XLM amount as string
- `memo` — invoice ID used as transaction memo
