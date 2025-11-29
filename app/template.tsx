'use client'

import { useEffect, useState } from 'react'
import '../styles/animations.css'

export default function Template({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className={isVisible ? 'page-transition' : ''} style={{ opacity: isVisible ? 1 : 0 }}>
      {children}
    </div>
  )
}

