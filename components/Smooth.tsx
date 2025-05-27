'use client'

import { ReactNode, useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'

interface SmoothProps {
  children: ReactNode
}

export default function Smooth({ children }: SmoothProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis()
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}