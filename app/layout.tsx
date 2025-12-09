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
    <html lang="en" style={{ margin: 0, padding: 0 }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('app_theme') || localStorage.getItem('admin_theme');
                  const theme = savedTheme === 'light' ? 'light' : 'dark';
                  document.documentElement.classList.add(theme === 'light' ? 'light-theme' : 'dark-theme');
                  document.documentElement.classList.remove(theme === 'light' ? 'dark-theme' : 'light-theme');
                } catch (e) {
                  // Fallback to dark if localStorage is not available
                  document.documentElement.classList.add('dark-theme');
                }
              })();
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

