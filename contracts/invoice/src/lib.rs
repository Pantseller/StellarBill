#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Symbol, Address, String};

/// Possible states an invoice can be in
#[contracttype]
#[derive(Clone, PartialEq)]
pub enum InvoiceStatus {
    Unpaid,
    Paid,
}

/// The invoice data stored on-chain
#[contracttype]
#[derive(Clone)]
pub struct Invoice {
    pub id: Symbol,
    pub amount: i128,       // in stroops (1 XLM = 10_000_000 stroops)
    pub recipient: Address,
    pub status: InvoiceStatus,
}

/// Storage key for an invoice
#[contracttype]
pub enum DataKey {
    Invoice(Symbol),
}

#[contract]
pub struct InvoiceContract;

#[contractimpl]
impl InvoiceContract {
    /// Create a new invoice with the given id, amount, and recipient.
    /// Panics if an invoice with the same id already exists.
    pub fn create_invoice(env: Env, id: Symbol, amount: i128, recipient: Address) {
        let key = DataKey::Invoice(id.clone());

        // Prevent duplicate invoice ids
        if env.storage().persistent().has(&key) {
            panic!("invoice already exists");
        }

        let invoice = Invoice {
            id,
            amount,
            recipient,
            status: InvoiceStatus::Unpaid,
        };

        env.storage().persistent().set(&key, &invoice);
    }

    /// Mark an existing invoice as paid.
    /// Panics if the invoice does not exist or is already paid.
    pub fn mark_as_paid(env: Env, id: Symbol) {
        let key = DataKey::Invoice(id);

        let mut invoice: Invoice = env
            .storage()
            .persistent()
            .get(&key)
            .expect("invoice not found");

        if invoice.status == InvoiceStatus::Paid {
            panic!("invoice already paid");
        }

        invoice.status = InvoiceStatus::Paid;
        env.storage().persistent().set(&key, &invoice);
    }

    /// Retrieve an invoice by id.
    pub fn get_invoice(env: Env, id: Symbol) -> Invoice {
        let key = DataKey::Invoice(id);
        env.storage()
            .persistent()
            .get(&key)
            .expect("invoice not found")
    }
}
