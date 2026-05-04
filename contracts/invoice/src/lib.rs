#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum InvoiceStatus {
    Unpaid,
    Paid,
    Cancelled,
}

/// Compact on-chain invoice record.
/// Off-chain metadata (line items, client info) is stored in the app layer.
/// The contract is the source of truth for payment status and amounts.
#[contracttype]
#[derive(Clone)]
pub struct InvoiceRecord {
    /// Unique invoice ID (matches off-chain ID, e.g. "INV-ABC123-XY12")
    pub id: String,
    /// Amount in stroops for XLM, or micro-units for USDC (7 decimal places)
    pub amount: i128,
    /// Asset code: "XLM" or "USDC"
    pub asset: Symbol,
    /// Stellar address of the invoice issuer (payee)
    pub issuer: Address,
    /// Stellar address of the payer (set on payment)
    pub payer: Option<Address>,
    pub status: InvoiceStatus,
    /// Unix timestamp of creation (seconds)
    pub created_at: u64,
    /// Unix timestamp of payment (seconds), 0 if unpaid
    pub paid_at: u64,
    /// Stellar transaction hash of the payment (empty if unpaid)
    pub tx_hash: String,
}

#[contracttype]
pub enum DataKey {
    Invoice(String),
    /// Tracks all invoice IDs for an issuer address
    IssuerIndex(Address),
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct InvoiceRegistry;

#[contractimpl]
impl InvoiceRegistry {
    /// Register a new invoice on-chain.
    /// Must be called by the issuer (requires issuer auth).
    pub fn create_invoice(
        env: Env,
        id: String,
        amount: i128,
        asset: Symbol,
        issuer: Address,
    ) {
        issuer.require_auth();

        let key = DataKey::Invoice(id.clone());
        if env.storage().persistent().has(&key) {
            panic!("invoice already exists");
        }
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let empty_hash = String::from_str(&env, "");
        let record = InvoiceRecord {
            id: id.clone(),
            amount,
            asset,
            issuer: issuer.clone(),
            payer: None,
            status: InvoiceStatus::Unpaid,
            created_at: env.ledger().timestamp(),
            paid_at: 0,
            tx_hash: empty_hash,
        };

        env.storage().persistent().set(&key, &record);

        // Update issuer index
        let idx_key = DataKey::IssuerIndex(issuer);
        let mut ids: soroban_sdk::Vec<String> = env
            .storage()
            .persistent()
            .get(&idx_key)
            .unwrap_or_else(|| soroban_sdk::Vec::new(&env));
        ids.push_back(id);
        env.storage().persistent().set(&idx_key, &ids);

        env.events().publish(
            (symbol_short!("created"),),
            record.id,
        );
    }

    /// Confirm payment of an invoice.
    /// In a production deployment this would be called by a trusted oracle
    /// or a Soroban auth contract that verifies the Stellar payment operation.
    /// For now, the issuer confirms receipt.
    pub fn confirm_payment(
        env: Env,
        id: String,
        payer: Address,
        tx_hash: String,
    ) {
        let key = DataKey::Invoice(id.clone());
        let mut record: InvoiceRecord = env
            .storage()
            .persistent()
            .get(&key)
            .expect("invoice not found");

        // Only the issuer can confirm payment
        record.issuer.require_auth();

        if record.status == InvoiceStatus::Paid {
            panic!("already paid");
        }
        if record.status == InvoiceStatus::Cancelled {
            panic!("invoice cancelled");
        }

        record.payer = Some(payer);
        record.status = InvoiceStatus::Paid;
        record.paid_at = env.ledger().timestamp();
        record.tx_hash = tx_hash;

        env.storage().persistent().set(&key, &record);

        env.events().publish(
            (symbol_short!("paid"),),
            record.id,
        );
    }

    /// Cancel an unpaid invoice. Only the issuer can cancel.
    pub fn cancel_invoice(env: Env, id: String) {
        let key = DataKey::Invoice(id);
        let mut record: InvoiceRecord = env
            .storage()
            .persistent()
            .get(&key)
            .expect("invoice not found");

        record.issuer.require_auth();

        if record.status == InvoiceStatus::Paid {
            panic!("cannot cancel a paid invoice");
        }

        record.status = InvoiceStatus::Cancelled;
        env.storage().persistent().set(&key, &record);
    }

    /// Read an invoice record.
    pub fn get_invoice(env: Env, id: String) -> InvoiceRecord {
        let key = DataKey::Invoice(id);
        env.storage()
            .persistent()
            .get(&key)
            .expect("invoice not found")
    }

    /// Get all invoice IDs for an issuer.
    pub fn get_issuer_invoices(env: Env, issuer: Address) -> soroban_sdk::Vec<String> {
        let key = DataKey::IssuerIndex(issuer);
        env.storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| soroban_sdk::Vec::new(&env))
    }
}
