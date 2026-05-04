import { Outlet, NavLink, Link } from 'react-router-dom'
import { useStore } from '../store'
import { connectWallet } from '@lib/stellar'
import { truncateAddress } from '@lib/helpers'
import clsx from 'clsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/create', label: 'New Invoice', icon: '+' },
]

export default function Layout() {
  const { wallet, setWallet, disconnectWallet } = useStore()

  async function handleConnect() {
    try {
      const address = await connectWallet()
      setWallet({ connected: true, address, network: 'testnet' })
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Wallet connection failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-brand-400 text-xl">✦</span>
            <span className="font-bold text-lg tracking-tight">StellarBill</span>
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">Global Invoicing on Stellar</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600/20 text-brand-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                )
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Wallet */}
        <div className="px-4 py-4 border-t border-slate-800">
          {wallet.connected && wallet.address ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300 font-mono truncate">
                  {truncateAddress(wallet.address)}
                </span>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={handleConnect} className="btn-primary w-full text-xs py-2">
              Connect Freighter
            </button>
          )}
          <p className="text-xs text-slate-600 mt-2 text-center">Testnet</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
