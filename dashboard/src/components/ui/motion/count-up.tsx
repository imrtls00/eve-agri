'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  from?: number
  to: number
  duration?: number
  decimals?: number
  suffix?: string
}

export function CountUp({ from = 0, to, duration = 1000, decimals = 0, suffix = '' }: CountUpProps) {
  const [value, setValue] = useState(from)
  const startTime = useRef<number | null>(null)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = null

    function animate(time: number) {
      if (startTime.current === null) startTime.current = time
      const elapsed = time - startTime.current
      const progress = Math.min(elapsed / duration, 1)

      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (to - from) * eased

      setValue(current)

      if (progress < 1) {
        raf.current = requestAnimationFrame(animate)
      }
    }

    raf.current = requestAnimationFrame(animate)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [from, to, duration])

  return <>{value.toFixed(decimals)}{suffix}</>
}
