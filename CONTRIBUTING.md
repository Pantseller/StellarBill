# Contributing to StellarBill

Thank you for your interest in contributing to StellarBill — open-source invoicing infrastructure for the Stellar ecosystem.

This document covers everything you need to get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Working on Smart Contracts](#working-on-smart-contracts)
- [Style Guide](#style-guide)
- [Getting Help](#getting-help)

---

## Code of Conduct

Be respectful, constructive, and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## Ways to Contribute

- **Bug reports** — open an issue with reproduction steps
- **Feature requests** — open an issue describing the use case
- **Code** — pick up a `good first issue` or `help wanted` issue
- **Documentation** — improve docs, fix typos, add examples
- **Testing** — add unit tests, integration tests, or manual test reports
- **Design** — UI/UX improvements, Figma mockups
- **Translations** — help localize the app for emerging markets

---

## Development Setup

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Rust | stable (for contracts) |
| soroban-cli | latest |
| Freighter wallet | browser extension |

### Frontend

```bash
git clone https://github.com/your-org/stellarbill.git
cd stellarbill/frontend
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`.

### Testnet setup

1. Install [Freighter](https://www.freighter.app/) and switch to **Testnet**
2. Fund your testnet account at [friendbot.stellar.org](https://friendbot.stellar.org)
3. For USDC testing, use the testnet USDC issuer in `lib/stellar.ts`

### Smart contracts

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install soroban-cli
cargo install --locked soroban-cli

# Build contracts
cd contracts
cargo build --release --target wasm32-unknown-unknown
```

---

## Project Structure

```
StellarBill/
├── contracts/invoice/     # Soroban smart contract (Rust)
├── frontend/src/
│   ├── components/        # Shared UI components
│   ├── pages/             # Route-level pages
│   ├── store/             # Zustand global state
│   └── types/             # TypeScript types
├── lib/
│   ├── stellar.ts         # Stellar SDK integration
│   └── helpers.ts         # Utilities and formatters
└── docs/                  # Documentation
```

---

## Submitting Changes

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feat/your-feature` or `fix/your-bug`
3. **Make your changes** — keep commits small and focused
4. **Test** your changes manually on testnet
5. **Commit**: `git commit -m "feat: add PDF export for invoices"`
6. **Push**: `git push origin feat/your-feature`
7. **Open a Pull Request** against `main`

### Commit message format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add recurring invoice support
fix: correct USDC amount calculation
docs: update deployment guide
chore: upgrade stellar-sdk to v12.3
```

### PR checklist

- [ ] Changes are scoped and focused
- [ ] No new dependencies added without discussion
- [ ] TypeScript types are correct (no `any`)
- [ ] Tested on Stellar testnet
- [ ] Documentation updated if needed

---

## Working on Smart Contracts

The Soroban contract lives in `contracts/invoice/src/lib.rs`.

**Important rules:**
- All state changes must emit events
- Auth checks (`require_auth`) must be present on all write functions
- Test with `cargo test` before submitting
- Do not change the public interface without a migration plan

```bash
# Run contract tests
cd contracts
cargo test

# Build for deployment
cargo build --release --target wasm32-unknown-unknown
```

---

## Style Guide

### TypeScript / React

- Functional components only
- Explicit TypeScript types — no `any`
- Tailwind for all styling — no inline styles
- Keep components small and single-purpose
- Co-locate component logic with the component

### Rust / Soroban

- Follow standard Rust formatting (`cargo fmt`)
- Document all public functions with `///` comments
- Panic with descriptive messages
- Keep contract storage keys in the `DataKey` enum

---

## Getting Help

- Open a [GitHub Discussion](https://github.com/your-org/stellarbill/discussions)
- Join the [Stellar Developer Discord](https://discord.gg/stellar)
- Tag your issue with `question` for community help

---

We appreciate every contribution, no matter how small. Thank you for helping build financial infrastructure for the world. 🌍
