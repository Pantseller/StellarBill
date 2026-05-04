# Contract Reference

## InvoiceRegistry (`contracts/invoice`)

The `InvoiceRegistry` is a Soroban smart contract that stores invoice state on-chain. It acts as a trust-minimized payment registry — the source of truth for whether an invoice has been paid, cancelled, or is still outstanding.

Off-chain metadata (line items, client details, notes) is stored in the application layer. The contract stores only what needs to be verifiable on-chain.

---

## Data Types

### `InvoiceStatus`

```rust
pub enum InvoiceStatus {
    Unpaid,
    Paid,
    Cancelled,
}
```

### `InvoiceRecord`

| Field | Type | Description |
|---|---|---|
| `id` | `String` | Unique invoice ID (e.g. `INV-ABC123-XY12`) |
| `amount` | `i128` | Amount in asset's smallest unit (stroops for XLM, 7dp for USDC) |
| `asset` | `Symbol` | Asset code: `"XLM"` or `"USDC"` |
| `issuer` | `Address` | Stellar address of the invoice issuer (payee) |
| `payer` | `Option<Address>` | Stellar address of the payer (set on payment) |
| `status` | `InvoiceStatus` | Current payment status |
| `created_at` | `u64` | Unix timestamp of creation (ledger time) |
| `paid_at` | `u64` | Unix timestamp of payment (0 if unpaid) |
| `tx_hash` | `String` | Stellar transaction hash of the payment |

---

## Functions

### `create_invoice(env, id, amount, asset, issuer)`

Register a new invoice on-chain.

**Auth:** Requires `issuer` authorization.

**Panics if:**
- An invoice with the same `id` already exists
- `amount` is zero or negative

**Side effects:**
- Stores `InvoiceRecord` in persistent storage
- Appends `id` to the issuer's invoice index
- Emits `created` event

---

### `confirm_payment(env, id, payer, tx_hash)`

Mark an invoice as paid and record the payer and transaction hash.

**Auth:** Requires `issuer` authorization (issuer confirms receipt).

**Panics if:**
- Invoice not found
- Invoice is already paid
- Invoice is cancelled

**Side effects:**
- Updates `status` to `Paid`
- Sets `payer`, `paid_at`, and `tx_hash`
- Emits `paid` event

---

### `cancel_invoice(env, id)`

Cancel an unpaid invoice.

**Auth:** Requires `issuer` authorization.

**Panics if:**
- Invoice not found
- Invoice is already paid

**Side effects:**
- Updates `status` to `Cancelled`

---

### `get_invoice(env, id) → InvoiceRecord`

Read an invoice record by ID.

**Panics if:** Invoice not found.

---

### `get_issuer_invoices(env, issuer) → Vec<String>`

Get all invoice IDs registered by an issuer address.

Returns an empty vector if the issuer has no invoices.

---

## Storage Layout

| Key | Type | Description |
|---|---|---|
| `DataKey::Invoice(id)` | `InvoiceRecord` | Invoice data by ID |
| `DataKey::IssuerIndex(address)` | `Vec<String>` | Invoice IDs per issuer |

All storage uses `persistent()` — data survives ledger archival with appropriate TTL extensions.

---

## Events

| Event | Payload | Emitted by |
|---|---|---|
| `("created",)` | invoice ID | `create_invoice` |
| `("paid",)` | invoice ID | `confirm_payment` |

---

## Build & Deploy

```bash
# Build
cd contracts
cargo build --release --target wasm32-unknown-unknown

# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarbill_invoice_registry.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet

# Invoke create_invoice
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR_SECRET_KEY> \
  --network testnet \
  -- create_invoice \
  --id "INV-ABC123-XY12" \
  --amount 1000000000 \
  --asset XLM \
  --issuer <YOUR_ADDRESS>
```

See [deployment.md](./deployment.md) for the full guide.
