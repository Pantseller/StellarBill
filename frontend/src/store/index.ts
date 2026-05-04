import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Invoice, WalletState } from '../types'

interface InvoiceStore {
  invoices: Invoice[]
  wallet: WalletState
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, patch: Partial<Invoice>) => void
  removeInvoice: (id: string) => void
  setWallet: (wallet: WalletState) => void
  disconnectWallet: () => void
}

export const useStore = create<InvoiceStore>()(
  persist(
    (set) => ({
      invoices: [],
      wallet: { connected: false, address: null, network: 'testnet' },

      addInvoice: (invoice) =>
        set((s) => ({ invoices: [invoice, ...s.invoices] })),

      updateInvoice: (id, patch) =>
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...patch, updatedAt: new Date().toISOString() } : inv
          ),
        })),

      removeInvoice: (id) =>
        set((s) => ({ invoices: s.invoices.filter((inv) => inv.id !== id) })),

      setWallet: (wallet) => set({ wallet }),

      disconnectWallet: () =>
        set({ wallet: { connected: false, address: null, network: 'testnet' } }),
    }),
    { name: 'stellarbill-store' }
  )
)
