export type Currency = 'XLM' | 'USDC' | 'USD' | 'EUR' | 'GBP' | 'NGN'

export type InvoiceStatus = 'draft' | 'unpaid' | 'paid' | 'overdue' | 'cancelled'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  // Issuer (the person creating the invoice)
  issuerName: string
  issuerAddress: string   // Stellar public key
  issuerEmail?: string
  // Client (the person being billed)
  clientName: string
  clientEmail?: string
  clientStellarAddress?: string
  // Invoice details
  lineItems: LineItem[]
  currency: Currency
  taxPercent: number
  discountPercent: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  // Dates
  issueDate: string       // ISO date string
  dueDate: string
  // Payment
  status: InvoiceStatus
  paymentAsset: 'XLM' | 'USDC'
  paymentAmount?: string  // amount in payment asset (may differ from invoice currency)
  txHash?: string
  paidAt?: string
  // Meta
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface WalletState {
  connected: boolean
  address: string | null
  network: 'testnet' | 'mainnet'
}

export interface PaymentResult {
  txHash: string
  ledger: number
  paidAt: string
}
