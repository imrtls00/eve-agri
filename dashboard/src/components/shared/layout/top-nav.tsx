'use client'

import { Bell, User, Search, Menu } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select'
import { Switch } from '@/components/ui/shadcn/switch'
import { Label } from '@/components/ui/shadcn/label'
import { CROP_PRESETS } from '@/lib/crop-presets'
import type { CropKey } from '@/types'

interface TopNavProps {
  crop: CropKey | null
  onCropChange: (crop: CropKey | null) => void
  demoMode: boolean
  onDemoToggle: (enabled: boolean) => void
  lastUpdated: Date | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onMenuClick: () => void
}

export function TopNav({
  crop,
  onCropChange,
  demoMode,
  onDemoToggle,
  lastUpdated,
  searchQuery,
  onSearchChange,
  onMenuClick,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex h-72 items-center justify-between border-b border-border-faint bg-canvas-surface px-16 sm:px-24 md:px-32">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-12 md:gap-16">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-2 text-text-secondary hover:bg-canvas-hover transition-colors md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu strokeWidth={1.75} size={20} />
        </button>

        <div className="flex h-9 items-center gap-2 rounded-2 border border-border-faint bg-canvas-base px-3 text-sm text-text-secondary focus-within:border-cherry-100/50 focus-within:ring-2 focus-within:ring-cherry-100/20 transition-all max-sm:w-40 sm:w-56 md:w-[240px]">
          <Search strokeWidth={1.75} size={16} className="shrink-0 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search metrics..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
        </div>
      </div>

      {/* Right: Controls + Profile */}
      <div className="flex items-center gap-12 sm:gap-16 md:gap-24">
        {/* Crop Selector — hide on small mobile */}
        <div className="hidden sm:flex items-center gap-8">
          <Label className="text-label-medium text-text-secondary whitespace-nowrap">
            Crop
          </Label>
          <Select
            value={crop ?? ''}
            onValueChange={(v: string) => onCropChange((v || null) as CropKey | null)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default</SelectItem>
              {Object.entries(CROP_PRESETS).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-8">
          <Switch
            id="demo-mode"
            checked={demoMode}
            onCheckedChange={onDemoToggle}
          />
          <Label htmlFor="demo-mode" className="text-label-medium text-text-secondary hidden sm:inline">
            Demo
          </Label>
        </div>

        {/* Last Updated — hide on small mobile */}
        {lastUpdated && (
          <span className="text-label-medium text-text-tertiary tabular-nums hidden sm:block">
            {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        )}

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-2 text-text-secondary hover:bg-canvas-hover transition-colors">
          <Bell strokeWidth={1.75} size={20} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-2 bg-cherry-100" />
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-2 bg-cherry-100 text-white">
          <User strokeWidth={1.75} size={16} />
        </div>
      </div>
    </header>
  )
}
