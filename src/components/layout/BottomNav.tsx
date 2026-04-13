import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, UtensilsCrossed, Settings, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  icon: LucideIcon
  label: string
  isFab?: boolean
}

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/log', icon: PlusCircle, label: 'Log', isFab: true },
  { to: '/foods', icon: UtensilsCrossed, label: 'Foods' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                item.isFab ? '' : isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) =>
              item.isFab ? (
                <>
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                        : 'bg-muted text-primary hover:bg-primary/20'
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className={cn(isActive ? 'text-primary' : 'text-muted-foreground')}>
                    {item.label}
                  </span>
                </>
              ) : (
                <>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
