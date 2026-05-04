# Good First Issues

Welcome to StellarBill! This document lists well-scoped issues that are great for first-time contributors.

Each issue includes context, acceptance criteria, and pointers to relevant code.

---

## Frontend Issues

### GFI-001 · Add invoice status filter to Dashboard

**Difficulty:** Easy  
**Skills:** React, TypeScript

The dashboard shows all invoices in a flat list. Add filter tabs (All / Unpaid / Paid / Overdue) so users can quickly find what they need.

**Acceptance criteria:**
- Filter tabs above the invoice table
- Clicking a tab filters the list
- Active tab is visually highlighted
- "All" tab is selected by default

**Relevant files:**
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/types/index.ts`

---

### GFI-002 · Add copy-to-clipboard for invoice ID and Stellar address

**Difficulty:** Easy  
**Skills:** React, TypeScript

Users need to copy their Stellar address and invoice ID frequently. Add a small copy button next to these values with a brief "Copied!" confirmation.

**Acceptance criteria:**
- Copy button next to issuer Stellar address on InvoiceDetail
- Copy button next to invoice ID on InvoiceDetail
- Visual feedback ("Copied!") for 2 seconds after clicking

**Relevant files:**
- `frontend/src/pages/InvoiceDetail.tsx`

---

### GFI-003 · Add empty state illustrations to Dashboard

**Difficulty:** Easy  
**Skills:** React, SVG / Tailwind

The empty state on the dashboard is plain text. Add a simple SVG illustration or icon-based visual to make it more welcoming.

**Acceptance criteria:**
- Illustrated empty state when no invoices exist
- Consistent with the dark fintech design system
- No external image dependencies (inline SVG or emoji-based)

**Relevant files:**
- `frontend/src/pages/Dashboard.tsx`

---

### GFI-004 · Add invoice due date countdown

**Difficulty:** Easy  
**Skills:** React, date-fns

On the InvoiceDetail page, show a human-readable countdown for unpaid invoices (e.g. "Due in 12 days" or "Overdue by 3 days").

**Acceptance criteria:**
- Shown below the due date on InvoiceDetail
- Uses `date-fns` (already a dependency)
- Correct color: amber for upcoming, red for overdue

**Relevant files:**
- `frontend/src/pages/InvoiceDetail.tsx`
- `lib/helpers.ts`

---

### GFI-005 · Add "Cancel Invoice" button

**Difficulty:** Easy–Medium  
**Skills:** React, TypeScript, Zustand

Allow users to cancel an unpaid invoice from the InvoiceDetail page. Cancelled invoices should show a "Cancelled" badge and the Pay button should be hidden.

**Acceptance criteria:**
- Cancel button visible on unpaid/overdue invoices
- Confirmation dialog before cancelling
- Status updates to `cancelled` in the store
- Pay button hidden for cancelled invoices

**Relevant files:**
- `frontend/src/pages/InvoiceDetail.tsx`
- `frontend/src/store/index.ts`
- `frontend/src/types/index.ts`

---

## Library / Integration Issues

### GFI-006 · Add Stellar Expert transaction link to payment confirmation

**Difficulty:** Easy  
**Skills:** TypeScript

After a payment is confirmed, show a clickable link to the transaction on Stellar Expert. The `txExplorerUrl` helper already exists in `lib/stellar.ts`.

**Acceptance criteria:**
- Link shown in PayButton after successful payment
- Opens in new tab
- Works for both testnet and mainnet

**Relevant files:**
- `frontend/src/components/PayButton.tsx`
- `lib/stellar.ts`

---

### GFI-007 · Add USDC trustline check before payment

**Difficulty:** Medium  
**Skills:** TypeScript, Stellar SDK

Before sending a USDC payment, check whether the recipient has a USDC trustline. If not, show a clear warning explaining that the recipient needs to add a USDC trustline before they can receive payment.

**Acceptance criteria:**
- Check runs before the Freighter signing step
- Clear error message if trustline is missing
- Link to Stellar documentation on trustlines

**Relevant files:**
- `frontend/src/components/PayButton.tsx`
- `lib/stellar.ts`

---

## Documentation Issues

### GFI-008 · Write a "How to get a testnet USDC" guide

**Difficulty:** Easy  
**Skills:** Markdown

New contributors struggle to get testnet USDC for testing. Write a short guide in `docs/` explaining how to get testnet USDC on Stellar.

**Acceptance criteria:**
- New file: `docs/testnet-usdc.md`
- Step-by-step instructions
- Links to relevant tools (Stellar Laboratory, testnet USDC issuer)

---

### GFI-009 · Add JSDoc comments to `lib/helpers.ts`

**Difficulty:** Easy  
**Skills:** TypeScript, JSDoc

The helper functions in `lib/helpers.ts` lack documentation. Add JSDoc comments to all exported functions.

**Acceptance criteria:**
- All exported functions have `/** ... */` JSDoc comments
- Parameters and return types documented
- Examples included where helpful

**Relevant files:**
- `lib/helpers.ts`

---

## Smart Contract Issues

### GFI-010 · Add unit tests for the InvoiceRegistry contract

**Difficulty:** Medium  
**Skills:** Rust, Soroban SDK testutils

The Soroban contract has no tests. Add a `#[cfg(test)]` module with tests for the main contract functions.

**Acceptance criteria:**
- Tests for `create_invoice`, `confirm_payment`, `cancel_invoice`, `get_invoice`
- Test for duplicate invoice ID rejection
- Test for cancelling a paid invoice (should panic)
- All tests pass with `cargo test`

**Relevant files:**
- `contracts/invoice/src/lib.rs`

---

## How to Claim an Issue

1. Comment on the GitHub issue: "I'd like to work on this"
2. A maintainer will assign it to you
3. Fork the repo and create a branch: `fix/gfi-001-dashboard-filter`
4. Submit a PR when ready

Questions? Open a [GitHub Discussion](https://github.com/your-org/stellarbill/discussions) or ask in the [Stellar Discord](https://discord.gg/stellar).
