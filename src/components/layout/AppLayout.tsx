import { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { syncOfflineQueue } from '@/lib/offlineSync'
import { getPendingCount } from '@/lib/offlineDb'

import mydayIcon from '@/assets/icons/myday.png'
import jobsIcon from '@/assets/icons/jobs.png'
import customersIcon from '@/assets/icons/customers.png'
import invoicesIcon from '@/assets/icons/invoices.png'
import dashboardIcon from '@/assets/icons/dashboard.png'

export function AppLayout() {
  const { user, signOut } = useAuth()
  const isOnline = useOnlineStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const wasOffline = useRef(false)

  // Check pending queue count periodically
  useEffect(() => {
    const check = () => getPendingCount().then(setPendingCount)
    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true
      return
    }
    if (wasOffline.current) {
      wasOffline.current = false
      syncOfflineQueue().then(({ synced }) => {
        if (synced > 0) getPendingCount().then(setPendingCount)
      })
    }
  }, [isOnline])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-orange-500 text-white py-2 text-center text-sm font-medium">
          You're offline. {pendingCount > 0 ? `${pendingCount} change${pendingCount > 1 ? 's' : ''} pending sync.` : 'Changes will sync when connection is restored.'}
        </div>
      )}

      {/* Top Nav */}
      <header className="bg-brand-green text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">Aaron's Lawn Care</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-green-200 hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Nav (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:relative sm:border-t-0 sm:border-b sm:border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-around sm:justify-start sm:gap-1 sm:px-4">
          <NavItem to="/" label="My Day" icon={mydayIcon} />
          <NavItem to="/jobs" label="Jobs" icon={jobsIcon} />
          <NavItem to="/customers" label="Customers" icon={customersIcon} />
          <NavItem to="/invoices" label="Invoices" icon={invoicesIcon} />
          <NavItem to="/dashboard" label="Dashboard" icon={dashboardIcon} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col sm:flex-row items-center gap-1 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
          isActive
            ? 'text-brand-green border-t-2 sm:border-t-0 sm:border-b-2 border-brand-green'
            : 'text-gray-500 hover:text-gray-700 border-t-2 sm:border-t-0 sm:border-b-2 border-transparent'
        }`
      }
    >
      <img src={icon} alt={label} className="w-5 h-5 sm:w-4 sm:h-4" />
      <span>{label}</span>
    </NavLink>
  )
}
