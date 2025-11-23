import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PropTalk - AI-Powered Receptionist Service',
  description: 'AI-Powered Receptionist Service for Real Estate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

