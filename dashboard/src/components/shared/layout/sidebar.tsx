'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sprout, LayoutDashboard, Radio, ChevronLeft, X } from 'lucide-react'

export type ViewType = 'dashboard' | 'realtime'

interface SidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ activeView, onViewChange, mobileOpen, onMobileClose }: SidebarProps) {
  const [expanded, setExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile) setExpanded(true)
  }, [isMobile])

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-72 shrink-0 items-center justify-center border-b border-border-faint">
        <div className={cn('flex items-center gap-3', !expanded && 'justify-center')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2 bg-cherry-100">
            <Sprout className="text-white" strokeWidth={1.75} size={20} />
          </div>
          {expanded && (
            <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
              AgriSense
            </span>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-4 p-12">
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          active={activeView === 'dashboard'}
          expanded={expanded}
          onClick={() => { onViewChange('dashboard'); onMobileClose() }}
        />
        <NavItem
          icon={Radio}
          label="Real-time Data"
          active={activeView === 'realtime'}
          expanded={expanded}
          onClick={() => { onViewChange('realtime'); onMobileClose() }}
        />
      </nav>

      {/* Collapse hint — only desktop */}
      {!isMobile && (
        <div className="flex shrink-0 items-center justify-center border-t border-border-faint p-12">
          <ChevronLeft
            className={cn(
              'text-text-tertiary transition-transform duration-350 ease-out',
              !expanded && 'rotate-180'
            )}
            strokeWidth={1.75}
            size={16}
          />
        </div>
      )}
    </>
  )

  /* ── Mobile: overlay drawer ── */
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={onMobileClose}
          />
        )}

        <aside
          className={cn(
            'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-border-faint bg-canvas-surface transition-transform duration-350 ease-out md:hidden',
            'w-280',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Close button */}
          <div className="absolute right-4 top-4">
            <button
              onClick={onMobileClose}
              className="flex h-9 w-9 items-center justify-center rounded-2 text-text-secondary hover:bg-canvas-hover transition-colors"
              aria-label="Close sidebar"
            >
              <X strokeWidth={1.75} size={20} />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </>
    )
  }

  /* ── Desktop: hover-expand rail ── */
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border-faint bg-canvas-surface transition-all duration-350 ease-out',
        expanded ? 'w-280' : 'w-72'
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {sidebarContent}
    </aside>
  )
}

interface NavItemProps {
  icon: typeof LayoutDashboard
  label: string
  active?: boolean
  expanded: boolean
  onClick: () => void
}

function NavItem({ icon: Icon, label, active, expanded, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-2 px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-cherry-tint text-cherry-100'
          : 'text-text-secondary hover:bg-canvas-hover hover:text-text-primary',
        !expanded && 'justify-center px-0'
      )}
    >
      <Icon strokeWidth={1.75} size={20} className="shrink-0" />
      {expanded && <span className="truncate">{label}</span>}
      {active && expanded && (
        <span className="ml-auto h-full w-0.5 shrink-0 rounded-2 bg-cherry-100" />
      )}
    </button>
  )
}
