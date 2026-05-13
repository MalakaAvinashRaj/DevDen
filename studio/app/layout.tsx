import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { DynamicIsland } from '@/components/DynamicIsland'
import { ThemeToggle } from '@/components/ThemeToggle'

const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'DevDen',
  description: 'Multi-agent AI software factory',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} h-full dark`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased transition-colors duration-200"
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <header
          className="sticky top-0 z-30 border-b px-6 py-3 flex items-center justify-between shrink-0 transition-colors duration-200"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-widest text-sm" style={{ color: 'var(--accent)' }}>DEVDEN</span>
            <span className="text-[10px]" style={{ color: 'var(--subtle)' }}>v1</span>
          </div>
          <nav className="flex items-center gap-5">
            <a href="/" className="text-xs transition-colors" style={{ color: 'var(--muted-fg)' }}>Missions</a>
            <a href="/canvas" className="text-xs transition-colors" style={{ color: 'var(--muted-fg)' }}>Factory</a>
            <ThemeToggle />
          </nav>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <DynamicIsland />
      </body>
    </html>
  )
}
