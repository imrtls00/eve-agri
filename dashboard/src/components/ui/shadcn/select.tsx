"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

function Select({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value ?? "")
  const actualValue = value ?? internalValue
  const handleChange = onValueChange ?? setInternalValue

  return (
    <SelectContext.Provider value={{ value: actualValue, onValueChange: handleChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(SelectContext)
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => ctx?.setOpen((o) => !o)}
      data-slot="select-trigger"
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-2 border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

function SelectValue({
  placeholder,
  className,
}: {
  placeholder?: string
  className?: string
}) {
  const ctx = React.useContext(SelectContext)
  return (
    <span data-slot="select-value" className={cn("text-sm", className)}>
      {ctx?.value ? ctx.value : placeholder}
    </span>
  )
}

function SelectContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ctx = React.useContext(SelectContext)
  if (!ctx?.open) return null
  return (
    <div
      data-slot="select-content"
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-2 border border-border-faint bg-popover bg-canvas-surface text-popover-foreground shadow-md",
        className
      )}
    >
      {children}
    </div>
  )
}

function SelectItem({
  children,
  value,
  className,
}: {
  children: React.ReactNode
  value: string
  className?: string
}) {
  const ctx = React.useContext(SelectContext)
  const selected = ctx?.value === value
  return (
    <div
      role="option"
      aria-selected={selected}
      onClick={() => {
        ctx?.onValueChange(value)
        ctx?.setOpen(false)
      }}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-2 py-1.5 pl-9 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent",
        className
      )}
      data-selected={selected || undefined}
    >
      {selected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
        </span>
      )}
      {children}
    </div>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
