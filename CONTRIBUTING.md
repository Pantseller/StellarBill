# Contributing to StellarBill

Thanks for your interest in contributing! This guide will get you up and running quickly.

---

## Setup

### Prerequisites

- Node.js 18+
- [Freighter wallet](https://www.freighter.app/) browser extension (for testing payments)
- Rust + `soroban-cli` (only if working on contracts)

### Install frontend dependencies

```bash
cd frontend
npm install
```

---

## Running the App

```bash
cd frontend
npm run dev
```

The app runs at `http://localhost:5173` by default.

To test payments, make sure Freighter is installed and set to **Testnet**.  
You can fund a testnet account at [friendbot.stellar.org](https://friendbot.stellar.org).

---

## Project Structure

```
/contracts   # Soroban smart contract (Rust)
/frontend    # React + Vite UI
/lib         # Shared helpers (wallet, payments, formatting)
/docs        # Documentation
```

---

## Working on the Contract

Requires [Rust](https://rustup.rs/) and [soroban-cli](https://soroban.stellar.org/docs/getting-started/setup).

```bash
cd contracts
cargo build --release --target wasm32-unknown-unknown
```

---

## How to Contribute

1. Fork the repository
2. Create a branch: `git checkout -b my-feature`
3. Make your changes
4. Commit: `git commit -m "describe your change"`
5. Push and open a pull request

### Guidelines

- Keep changes small and focused
- Add comments for non-obvious logic
- Don't add dependencies without discussion
- Bug fixes and documentation improvements are always welcome

---

## Testnet vs Mainnet

This project defaults to **Stellar Testnet**. Do not use real funds for testing.  
The network can be changed in `lib/stellar.js` by updating `HORIZON_URL` and `NETWORK_PASSPHRASE`.
