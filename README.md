# StellarBill 💸

A minimal invoicing app built on Stellar. Create invoices, share them, and accept XLM payments — all from the browser.

---

## ✨ Features

- Create an invoice with an amount and recipient address
- Auto-generate a unique invoice ID
- Pay invoices via [Freighter](https://www.freighter.app/) wallet
- See real-time payment status (paid / unpaid)

---

## 🏗 Project Structure

```
StellarBill/
├── contracts/        # Soroban smart contract (Rust) — stores invoice state on-chain
├── frontend/         # React + Vite UI
├── lib/              # Shared helpers: wallet connection, payments, formatting
└── docs/             # API and contract reference
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- [Freighter](https://www.freighter.app/) browser extension, set to **Testnet**
- A funded testnet account — get one at [friendbot.stellar.org](https://friendbot.stellar.org)

### Run locally

```bash
git clone https://github.com/Pantseller/stellarbill.git
cd stellarbill/frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## 🔧 How It Works

1. Fill in an amount (XLM) and a recipient Stellar address
2. Click **Generate Invoice** — a unique ID is created client-side
3. Click **Pay Now** — Freighter signs and submits the transaction to Horizon testnet
4. Status updates to **paid** on success

---

## 📦 Contract (Optional)

The Soroban contract in `/contracts/invoice` mirrors invoice state on-chain.

```bash
cd contracts
cargo build --release --target wasm32-unknown-unknown
```

Requires Rust and [`soroban-cli`](https://soroban.stellar.org/docs/getting-started/setup).

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions and contribution guidelines.

---

## 📄 License

MIT
