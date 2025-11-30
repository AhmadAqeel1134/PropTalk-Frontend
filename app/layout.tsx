import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

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
    <html lang="en" style={{ background: '#000', margin: 0, padding: 0 }}>
      <body style={{ background: '#000', margin: 0, padding: 0, color: '#fff' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

