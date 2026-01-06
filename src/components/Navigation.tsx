'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Vault, BarChart3 } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/vault', icon: Vault, label: 'Vault' },
  { href: '/insights', icon: BarChart3, label: 'Insights' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors duration-150 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
