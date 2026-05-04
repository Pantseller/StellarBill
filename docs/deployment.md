# Deployment Guide

This guide covers deploying StellarBill to production: the frontend and the Soroban smart contract.

---

## Frontend Deployment

StellarBill's frontend is a static Vite app. It can be deployed to any static hosting provider.

### Vercel (recommended)

```bash
cd frontend
npm run build
# Deploy the dist/ directory to Vercel
npx vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Netlify

```bash
cd frontend
npm run build
# dist/ is the publish directory
```

Set build command: `npm run build`  
Set publish directory: `frontend/dist`

### Environment variables

Set these in your hosting provider's dashboard:

```env
VITE_STELLAR_NETWORK=mainnet
VITE_CONTRACT_ID=<your deployed contract ID>
```

---

## Smart Contract Deployment

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install soroban-cli
cargo install --locked soroban-cli
```

### Build

```bash
cd contracts
cargo build --release --target wasm32-unknown-unknown
```

The compiled WASM will be at:
```
target/wasm32-unknown-unknown/release/stellarbill_invoice_registry.wasm
```

### Deploy to Testnet

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarbill_invoice_registry.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

This outputs a contract ID. Copy it into your `.env`:

```env
VITE_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Deploy to Mainnet

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarbill_invoice_registry.wasm \
  --source <YOUR_SECRET_KEY> \
  --network mainnet \
  --rpc-url https://soroban-rpc.stellar.org \
  --network-passphrase "Public Global Stellar Network ; September 2015"
```

> ⚠️ Mainnet deployment costs real XLM. Ensure your account is funded.

### Verify deployment

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR_SECRET_KEY> \
  --network testnet \
  -- get_issuer_invoices \
  --issuer <YOUR_ADDRESS>
```

Should return an empty array `[]` for a fresh deployment.

---

## Testnet Funding

Get a funded testnet account:

```bash
curl "https://friendbot.stellar.org?addr=<YOUR_PUBLIC_KEY>"
```

Or visit [friendbot.stellar.org](https://friendbot.stellar.org) in your browser.

---

## USDC on Testnet

The testnet USDC issuer used by StellarBill is:

```
GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

To receive testnet USDC, you need a trustline. Add it via [Stellar Laboratory](https://laboratory.stellar.org) or the Freighter wallet.

---

## Monitoring

- **Horizon**: `https://horizon-testnet.stellar.org` (testnet) / `https://horizon.stellar.org` (mainnet)
- **Stellar Expert**: `https://stellar.expert/explorer/testnet` (testnet) / `https://stellar.expert/explorer/public` (mainnet)
- **Soroban RPC**: `https://soroban-testnet.stellar.org` (testnet)
