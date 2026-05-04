# StellarBill Roadmap

This document outlines the planned development trajectory for StellarBill.

Items marked ✅ are shipped. Items marked 🔜 are planned. Items marked 💡 are under consideration.

---

## v1.0 — Foundation (Current)

Core invoicing and payment infrastructure on Stellar.

- ✅ Professional invoice creation (line items, tax, discount, multi-currency)
- ✅ XLM and USDC payments via Freighter wallet
- ✅ Memo-based invoice tracking
- ✅ Real-time payment detection via Horizon polling
- ✅ Shareable public invoice pages with QR codes
- ✅ Dashboard with invoice status overview
- ✅ Soroban InvoiceRegistry smart contract
- ✅ Stellar path payments (XLM → USDC conversion)
- ✅ TypeScript + React + Tailwind frontend
- ✅ Open-source with MIT license

---

## v1.1 — Persistence & Notifications

Make invoices persistent and shareable beyond a single browser session.

- 🔜 Supabase backend — invoices stored server-side, shareable by link
- 🔜 Email notifications on invoice creation and payment
- 🔜 PDF invoice export (print-ready)
- 🔜 Invoice search and filtering on dashboard
- 🔜 Overdue invoice reminders
- 🔜 Basic invoice templates

**Target: Q3 2026**

---

## v1.2 — Advanced Payments

Expand the payment layer with more Stellar-native features.

- 🔜 Escrow milestone payments via Soroban (pay on delivery)
- 🔜 Recurring / subscription invoices
- 🔜 Multi-wallet support (LOBSTR, xBull, Albedo)
- 🔜 Partial payments support
- 🔜 Payment links (pay without an invoice)
- 🔜 Batch invoice creation (CSV import)

**Target: Q4 2026**

---

## v1.3 — Business Features

Features for growing businesses and agencies.

- 🔜 Multi-user accounts (team access)
- 🔜 Client address book
- 🔜 Invoice branding (logo, colors)
- 🔜 Tax reporting export (CSV)
- 🔜 Webhook notifications for payment events
- 🔜 Public API for third-party integrations

**Target: Q1 2027**

---

## v2.0 — Ecosystem & Scale

Long-term vision: StellarBill as infrastructure for the Stellar ecosystem.

- 💡 Merchant reputation scores on-chain (Soroban)
- 💡 Fiat on/off ramp integrations (MoneyGram Access, Flutterwave)
- 💡 Mobile app (React Native)
- 💡 Multi-language support (Spanish, French, Portuguese, Swahili)
- 💡 Stellar Anchor integration for local currency settlement
- 💡 Embedded payment widget (iframe / SDK)
- 💡 Marketplace for invoice factoring (sell unpaid invoices)

---

## Principles

Every feature we build must satisfy at least one of these:

1. **Reduces friction** for freelancers or SMEs getting paid cross-border
2. **Uses Stellar** in a meaningful, non-trivial way
3. **Serves emerging markets** — Africa, LATAM, Southeast Asia
4. **Is open-source** and reusable by other Stellar ecosystem projects

---

## Contributing to the Roadmap

Have a feature idea? Open a [GitHub Discussion](https://github.com/your-org/stellarbill/discussions) or submit a PR to this file.

Roadmap items tagged `help wanted` are open for community contributions.
