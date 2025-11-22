'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] z-50">
      <div className="p-6">
        {/* Logo */}
        <h1 className="text-[#2e7d32] text-[36px] font-russo leading-normal mb-12">
          WattGuard
        </h1>

        {/* Menu */}
        <div className="space-y-6">
          <h2 className="text-black text-[24px] font-russo mb-4">MENU</h2>
          
          <nav className="space-y-4">
            {/* Dashboard Link */}
            <Link 
              href="/" 
              className={cn(
                "flex items-center gap-3 px-0 py-1 transition-colors",
                pathname === '/' ? "text-black" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Home className={cn("w-6 h-6", pathname === '/' ? "text-black" : "text-gray-400")} />
              <span className="font-russo text-[20px]">Dashboard</span>
            </Link>

            {/* History Link */}
            <Link 
              href="/history" 
              className={cn(
                "flex items-center gap-3 px-0 py-1 transition-colors",
                pathname.startsWith('/history') ? "text-black" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <History className={cn("w-6 h-6", pathname.startsWith('/history') ? "text-black" : "text-gray-400")} />
              <span className="font-russo text-[20px]">History</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  )
}

