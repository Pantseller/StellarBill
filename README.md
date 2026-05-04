# StellarBill 

**Open-source global invoicing and payment infrastructure built on Stellar.**

StellarBill helps freelancers, exporters, and small businesses send professional invoices and get paid instantly — anywhere in the world — using XLM and USDC on the Stellar network.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-7B2FBE)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-4F46E5)](https://soroban.stellar.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

---

## Why StellarBill?

A freelancer in Lagos invoices a client in London. The client pays in XLM. The freelancer receives USDC. Settlement happens in seconds. Fees are fractions of a cent.

This is what Stellar was built for — and StellarBill makes it accessible to anyone with a browser.

> **"The Stripe + Wise invoicing layer for emerging markets, powered by Stellar."**

### The problem

- Traditional invoicing tools (FreshBooks, Wave, QuickBooks) don't support crypto payments
- Cross-border wire transfers take 3–5 days and cost $15–$50 per transaction
- Freelancers in Africa, LATAM, and Southeast Asia are underserved by existing fintech
- Stablecoin payment rails exist on Stellar but lack a user-friendly invoicing layer

### The solution

StellarBill is a full-stack invoicing application that:

- Generates professional invoices with line items, tax, discounts, and multi-currency support
- Accepts payment in **XLM** (native) and **USDC** (Circle's Stellar-native stablecoin)
- Uses **Stellar path payments** for automatic currency conversion (pay in XLM, receive USDC)
- Tracks payment status in real time via Horizon event streaming
- Records invoice state on-chain via a **Soroban smart contract**
- Generates shareable public payment pages with QR codes

---

## Features

| Feature | Status |
|---|---|
| Professional invoice creation (line items, tax, discount) | ✅ |
| Multi-currency invoicing (USD, EUR, GBP, NGN, XLM, USDC) | ✅ |
| XLM payments via Freighter wallet | ✅ |
| USDC payments on Stellar | ✅ |
| Memo-based invoice tracking | ✅ |
| Real-time payment detection (Horizon polling) | ✅ |
| Shareable public invoice pages | ✅ |
| QR code payment links | ✅ |
| Dashboard with invoice analytics | ✅ |
| Soroban on-chain invoice registry | ✅ |
| Stellar path payments (XLM → USDC auto-conversion) | ✅ |
| Supabase persistent storage | 🔜 Roadmap |
| Email notifications | 🔜 Roadmap |
| Recurring invoices | 🔜 Roadmap |
| Escrow milestone payments | 🔜 Roadmap |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand (persisted to localStorage) |
| Forms | React Hook Form |
| Blockchain | Stellar SDK v12, Horizon API |
| Smart Contracts | Soroban (Rust) |
| Wallet | Freighter browser extension |
| Storage (roadmap) | Supabase / PostgreSQL |

---

## Getting Started

### Prerequisites

- **Node.js 18+**
- [Freighter wallet](https://www.freighter.app/) browser extension, set to **Testnet**
- A funded testnet account — get one at [friendbot.stellar.org](https://friendbot.stellar.org)

### Run locally

```bash
git clone https://github.com/your-org/stellarbill.git
cd stellarbill/frontend
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`.

### Environment variables

```env
VITE_STELLAR_NETWORK=testnet          # or "mainnet"
VITE_CONTRACT_ID=                     # Soroban contract ID (after deployment)
VITE_SUPABASE_URL=                    # optional
VITE_SUPABASE_ANON_KEY=               # optional
```

---

## How It Works

### Creating an invoice

1. Fill in your details (name, Stellar address) and your client's details
2. Add line items with quantity and unit price
3. Set currency, tax, discount, and due date
4. Click **Create Invoice** — a unique ID is generated and stored locally

### Getting paid

1. Share the public invoice link (`/invoice/{id}`) with your client
2. Client opens the page, clicks **Pay with Freighter**
3. Freighter signs the Stellar transaction with the invoice ID as memo
4. Payment is submitted to Horizon; status updates to **Paid** automatically

### Path payments (cross-border)

StellarBill uses Stellar's `pathPaymentStrictReceive` operation:

- Client pays in XLM
- Stellar DEX routes the payment
- Freelancer receives USDC

This happens in a single atomic transaction with no intermediaries.

---

## Project Structure

```
StellarBill/
├── contracts/
│   └── invoice/              # Soroban InvoiceRegistry contract (Rust)
│       └── src/lib.rs
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── store/            # Zustand state management
│   │   └── types/            # TypeScript type definitions
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── lib/
│   ├── stellar.ts            # Stellar SDK: wallet, payments, detection
│   └── helpers.ts            # Formatting, calculations, utilities
└── docs/
    ├── contract-reference.md
    ├── api.md
    └── deployment.md
```

---

## Smart Contract

The Soroban `InvoiceRegistry` contract stores invoice state on-chain:

```rust
pub fn create_invoice(env, id, amount, asset, issuer)
pub fn confirm_payment(env, id, payer, tx_hash)
pub fn cancel_invoice(env, id)
pub fn get_invoice(env, id) -> InvoiceRecord
pub fn get_issuer_invoices(env, issuer) -> Vec<String>
```

### Build and deploy

```bash
cd contracts
cargo build --release --target wasm32-unknown-unknown

# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarbill_invoice_registry.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet
```

See [docs/deployment.md](./docs/deployment.md) for the full deployment guide.

---

## Stellar Alignment

StellarBill is built around the core Stellar mission:

| Stellar Principle | StellarBill Implementation |
|---|---|
| Fast payments | Invoices settle in 3–5 seconds |
| Low fees | ~0.00001 XLM per transaction |
| Borderless transfers | Any Stellar address, any country |
| Financial inclusion | Optimized for Africa, LATAM, SEA |
| Stablecoin settlement | USDC on Stellar (Circle) |
| Multi-currency rails | Path payments via Stellar DEX |
| Trust-minimized finance | Soroban contract as payment registry |

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full roadmap.

**Near-term (v1.1)**
- Supabase backend for persistent, shareable invoices
- Email notifications on payment
- PDF invoice export

**Medium-term (v1.2)**
- Escrow milestone payments via Soroban
- Recurring invoice support
- Multi-wallet support (LOBSTR, xBull)

**Long-term (v2.0)**
- Merchant reputation scores on-chain
- Fiat on/off ramp integrations (MoneyGram, Flutterwave)
- Mobile app (React Native)
- API for third-party integrations

---

## Contributing

We welcome contributions of all kinds. See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

Good first issues are labeled [`good first issue`](https://github.com/your-org/stellarbill/issues?q=label%3A%22good+first+issue%22) in the issue tracker.

---

## Grant Applications

StellarBill is actively seeking ecosystem support:

- **Stellar Community Fund (SCF)** — infrastructure and tooling track
- **Stellar Development Foundation grants** — financial inclusion focus
- **Drips** — open-source funding for Stellar ecosystem projects

If you represent a grant program and want to discuss StellarBill, open an issue or reach out directly.

---

## License

MIT — see [LICENSE](./LICENSE).

---

<p align="center">
  Built with ❤️ on <a href="https://stellar.org">Stellar</a>
</p>
