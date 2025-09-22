"use client"

import { useEffect, useState } from 'react'
import { useStore } from '@/hooks/store'

export default function HydrationWrapper({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const { isHydrated: storeHydrated } = useStore()

  useEffect(() => {
    // Esperar a que Zustand se hidrate
    if (storeHydrated) {
      setIsHydrated(true)
    }
  }, [storeHydrated])

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}